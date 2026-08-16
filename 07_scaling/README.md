# 7. オートスケールを観察する

Cloud Run の非機能まわりの主役、オートスケールを実際に負荷をかけて観察します。あわせてコールドスタートとその対策も体験します。

> オートスケールや非機能要件の背景を体系的に知りたい人は [クラウドを今から学ぶには](https://speakerdeck.com/y0hgi/kuraudowojin-karaxue-buniha) も参照してください。

## Cloud Run のスケールの仕組み

Cloud Run は**同時に処理しているリクエスト数**を基準にインスタンス数を自動調整します。

```
必要インスタンス数 ≒ 同時リクエスト数 ÷ concurrency(1台が同時に受ける数)
```

- `concurrency` はデフォルト80。**Lambda(1リクエスト=1環境)と違い、1台で複数リクエストを捌く**
- 0台までスケールインする(スケールtoゼロ)
- ECS のように CloudWatch アラーム+スケーリングポリシーを組む必要はなく、**設定不要で最初から動いている**

## 1. 観察しやすいように設定を変える

デフォルトの concurrency 80 だとなかなかスケールしないので、実験用に1台あたり10接続に絞り、上限を10台にします。

```bash
gcloud run services update handson-app \
  --region ${REGION} \
  --concurrency 10 \
  --max-instances 10
```

> この操作でも新しいリビジョンが作られます。リビジョン=イメージ+**設定**のスナップショットだからです。

## 2. 負荷をかける

負荷試験ツール [hey](https://github.com/rakyll/hey) を使います(Cloud Shell に入れるだけ)。

```bash
curl -sL -o ~/hey https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
chmod +x ~/hey
```

アプリの `/heavy` は1秒かかる擬似的に重いエンドポイントです。同時50接続で30秒間叩きます。

```bash
URL=$(gcloud run services describe handson-app --region ${REGION} --format 'value(status.url)')

~/hey -z 30s -c 50 ${URL}/heavy
```

同時50接続 ÷ concurrency 10 = **5台前後までスケールアウトする**はずです。

## 3. 観察する

負荷をかけている間(および直後)に、2つの方法で観察します。

**コンソールで:** [Cloud Run](https://console.cloud.google.com/run) → `handson-app` → 「指標」タブ。「コンテナ インスタンスの数」がゼロから跳ね上がり、数分後にまたゼロに戻っていく様子が見えます。リクエスト数・レイテンシ(p50/p95/p99)・CPU使用率も**何も設定していないのに**最初から揃っています。

**手元で:** `/api` はインスタンスごとに違う `instance` ID を返します。何台に分散しているか数えてみましょう。

```bash
for i in $(seq 1 30); do curl -s ${URL}/api | jq -r .instance; done | sort | uniq -c
```

複数の instance ID が出てくれば、リクエストが複数台に分散している証拠です。負荷が落ち着いた数分後に同じコマンドを打つと、1台(やがて0台)に戻ります。

## 4. コールドスタートと min-instances

スケールtoゼロの代償が**コールドスタート**です。0台の状態への最初のリクエストは、コンテナ起動を待つ分だけ遅くなります。

10分ほど放置したあと(または講師の説明を聞いたあと)、1発目のレスポンスタイムを計ってみてください。

```bash
curl -s -o /dev/null -w "time_total: %{time_total}s\n" ${URL}/
curl -s -o /dev/null -w "time_total: %{time_total}s\n" ${URL}/
```

1回目だけ遅い(このアプリは軽いので数百ms程度。重いアプリでは数秒〜)のがわかります。対策は常時1台温めておくことです。

```bash
gcloud run services update handson-app \
  --region ${REGION} \
  --min-instances 1
```

> **トレードオフ:** min-instances を設定した分はアイドル時も課金されます。「完全従量制(コールドスタートあり)」と「最低台数の固定費(コールドスタートなし)」を、**サービスごとにダイヤルで選べる**のが Cloud Run の良いところです。Lambda の Provisioned Concurrency と ECS の常駐、両方の選択肢が1つのサービスに入っていると考えてください。

確認できたら、課金を避けるため戻しておきます。

```bash
gcloud run services update handson-app \
  --region ${REGION} \
  --min-instances 0
```

## まとめ

- スケールの基準は「同時リクエスト数 ÷ concurrency」。設定ゼロで動く
- スケールtoゼロ ⇔ コールドスタートはトレードオフ。`min-instances` で調整
- `max-instances` は暴走課金・下流(DB)保護の安全弁としても重要
