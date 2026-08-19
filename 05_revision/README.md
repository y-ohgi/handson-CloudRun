# 5. 更新とロールバック

アプリを変更して2回目のデプロイを行い、「リビジョン」がどう積み重なるかを見ます。その後、**本番障害を想定して30秒でロールバック**します。

## 1. アプリを変更する (v2)

`src/index.ts` の上部にある2行を書き換えます。

```typescript
const MESSAGE = "Hello, Cloud Run v2!";
const BG_COLOR = "#EA4335"; // 赤
```

## 2. ビルドして push して deploy

2章・4章でやったことの繰り返しです。タグは `v2` にします。

```bash
cd ~/cloudrun-handson/app
docker build -t ${IMAGE}:v2 .
docker push ${IMAGE}:v2

gcloud run deploy handson-app \
  --image ${IMAGE}:v2 \
  --region ${REGION}
```

> 2回目以降は `--allow-unauthenticated` などの設定を繰り返す必要はありません。サービスの設定は維持され、**変更したもの(イメージ)だけが新しいリビジョンとして記録されます**。

ブラウザをリロードしてください。**画面が赤くなり、Revision が `handson-app-00002-xxx` に変わっていれば成功です。** ダウンタイムなしで切り替わったことにも注目してください。

> **成功していれば:** デプロイの出力に `revision [handson-app-00002-xxx] has been deployed and is serving 100 percent of traffic.` と表示され、`gcloud run revisions list --service handson-app --region ${REGION}` の行が2つになります。
> **詰まったら:** 画面が赤くならない場合、まずブラウザのスーパーリロード(Cmd+Shift+R / Ctrl+Shift+R)を試してください。それでも青いままなら `src/index.ts` の書き換えが保存されていない可能性があるので、ファイルを保存し直して `docker build` から再実行します。`docker build` が `no such file or directory` で失敗する場合は `cd ~/cloudrun-handson/app` を忘れています。`invalid reference format` や `-docker.pkg.dev//` のようなパスになる場合は Cloud Shell の再接続で環境変数が消えているので、4章の「0. 環境変数の準備」を再実行してください(`echo ${IMAGE}` で確認できます)。

## 3. リビジョンの一覧を見る

```bash
gcloud run revisions list --service handson-app --region ${REGION}
```

`00001`(青/v1)と `00002`(赤/v2)の両方が残っています。リビジョンは**イメージ+環境変数+リソース設定を固めた不変のスナップショット**で、デプロイのたびに積み重なっていきます。

> **AWSとの比較:** ECS のタスク定義リビジョンに似ていますが、Cloud Run のリビジョンは「どこにトラフィックを流すか」の制御と一体化している点が違います。タスク定義+ALB加重ルーティング+デプロイ履歴が1つの概念になっているイメージです。

## 4. ロールバックする

ここで想定シナリオ: **「v2 をリリースしたらバグ報告が来た!すぐ戻したい!」**

AWS ならどうしますか? 前のタスク定義を指定してサービス更新、デプロイが走るのを待つ——数分かかります。Cloud Run では、**すでに存在する v1 のリビジョンにトラフィックを振り向けるだけ**です。新しいデプロイは走りません。

まず v1 のリビジョン名を確認して:

```bash
gcloud run revisions list --service handson-app --region ${REGION}
```

トラフィックを 100% 戻します(`handson-app-00001-xxx` は自分のリビジョン名に置き換え):

```bash
gcloud run services update-traffic handson-app \
  --region ${REGION} \
  --to-revisions handson-app-00001-xxx=100
```

数秒待ってからブラウザをリロードしてください。**青(v1)に戻ります。** トラフィックの切り替えは瞬時ではないため、まだ赤のままなら少し待って再読み込みしてください。

コンソールでも同じことができます: [Cloud Run](https://console.cloud.google.com/run) → サービス → 「リビジョン」タブ → 対象リビジョンの右側にある省略記号アイコンから「トラフィックを管理」。障害対応の現場では GUI でポチッと戻せるのは心強いです。

> **成功していれば:** コマンドの出力に `100% handson-app-00001-xxx` のようなトラフィック割り当てが表示され、数秒後のリロードで画面が青(v1)に戻ります。割り当ての現状は `gcloud run services describe handson-app --region ${REGION}` の出力の Traffic 欄で確認できます。
> **詰まったら:** `Revision 'handson-app-00001-xxx' does not exist` と出た場合は、リビジョン名をそのままコピーしてしまっています。`gcloud run revisions list --service handson-app --region ${REGION} --format 'value(metadata.name)'` で実際の名前を取得し、`00001` を含む行の値に置き換えてください。まだ赤いままの場合は、トラフィックの切り替えは瞬時ではないので10〜20秒待ってからスーパーリロードします。それでも変わらなければ、上の `describe` で Traffic 欄が意図した割り当てになっているかを確認してください。

## 5. 次章に備えて v2 に戻しておく

ロールバック体験が終わったので、最新リビジョン(v2)に戻しておきます。

```bash
gcloud run services update-traffic handson-app \
  --region ${REGION} \
  --to-latest
```

ブラウザで赤(v2)に戻ったことを確認してください。

> **成功していれば:** Traffic の割り当てが `100% LATEST (currently handson-app-00002-xxx)` になり、リロードで赤(v2)が表示されます。**次章はこの状態(最新リビジョンに100%)から始めるので、ここまでは必ず揃えてください。**
> **詰まったら:** 赤に戻らない場合は `gcloud run services update-traffic handson-app --region ${REGION} --to-latest` をもう一度実行してください(何度実行しても同じ結果になる冪等なコマンドです)。それでも青いままなら、v2 のリビジョンが作られていない可能性があるため `gcloud run revisions list --service handson-app --region ${REGION}` で2つあるかを確認し、1つしかなければ「2. ビルドして push して deploy」からやり直します。

## まとめ

- デプロイのたびに不変のリビジョンが積み重なる
- ロールバック = 過去リビジョンへのトラフィック切り替え。**再デプロイ不要、数秒で完了**
- 「イメージの不変性」がプラットフォーム機能として活きている

次章では、このトラフィック制御をもっと攻めた使い方——カナリアリリースに使います。
