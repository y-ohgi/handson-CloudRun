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

## 5. 次章に備えて v2 に戻しておく

ロールバック体験が終わったので、最新リビジョン(v2)に戻しておきます。

```bash
gcloud run services update-traffic handson-app \
  --region ${REGION} \
  --to-latest
```

ブラウザで赤(v2)に戻ったことを確認してください。

## まとめ

- デプロイのたびに不変のリビジョンが積み重なる
- ロールバック = 過去リビジョンへのトラフィック切り替え。**再デプロイ不要、数秒で完了**
- 「イメージの不変性」がプラットフォーム機能として活きている

次章では、このトラフィック制御をもっと攻めた使い方——カナリアリリースに使います。
