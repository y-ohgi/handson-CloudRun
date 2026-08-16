# 10-1. Pub/Subとつなぐ

Cloud Run を Pub/Sub のサブスクライバーにして、イベント駆動アーキテクチャを体験します。

## AWSでの構成と比べる

「S3にファイルが置かれたら処理する」「注文イベントを非同期で処理する」——AWS なら SNS + SQS + Lambda(またはSQSポーリングのECS)で組む定番パターンです。Lambda には専用のハンドラシグネチャがあり、SQS はポーリング設定やバッチサイズの調整が必要でした。

Google Cloud では **Pub/Sub がサブスクライバーのHTTPエンドポイントに直接 POST してくれます**(push型)。受け側は「POSTを受けるだけの普通のWebサーバー」でよく、つまり**今日デプロイしたアプリがそのまま使えます**。

実は2章で作った `src/index.ts` には、こっそり受け口を仕込んであります:

```typescript
// Pub/Sub push サブスクリプションの受け口(発展編で使用)
app.post("/pubsub", async (c) => {
  const envelope = await c.req.json().catch(() => ({}));
  const data: string = envelope?.message?.data ?? "";
  const text = data ? Buffer.from(data, "base64").toString("utf-8") : "(empty)";
  log("INFO", `Pub/Sub message received: ${text}`);
  return c.body(null, 204);
});
```

## 1. トピックとpushサブスクリプションを作る

```bash
gcloud pubsub topics create handson-topic

URL=$(gcloud run services describe handson-app --region ${REGION} --format 'value(status.url)')

gcloud pubsub subscriptions create handson-sub \
  --topic handson-topic \
  --push-endpoint ${URL}/pubsub
```

これで配線は完了です。SQSキューの作成、イベントソースマッピング、IAMロール、バッチ設定……に相当する作業はありません。

## 2. メッセージを発行してみる

```bash
gcloud pubsub topics publish handson-topic --message "Hello from Pub/Sub"
```

数秒待ってからログを確認します:

```bash
gcloud run services logs read handson-app --region ${REGION} --limit 10
```

`Pub/Sub message received: Hello from Pub/Sub` が出ていれば成功です。8章の Logs Explorer で見ると、構造化ログとして届いているのも確認できます。

## 3. ここで想像してほしいこと

- このエンドポイントが重い処理(画像変換、集計、通知送信)だったら? → **Pub/Sub が流量を受け止め、Cloud Run が処理量に応じてスケールアウトする**。バックプレッシャー付きの非同期処理基盤が、この3コマンドでできています
- 処理が失敗したら(2xx以外を返したら)? → Pub/Sub が自動でリトライします。デッドレタートピックも設定できます
- スケールtoゼロと組み合わせると? → イベントが来たときだけ起動して課金される、Lambda 的な使い方が「普通のWebサーバー」のままできます

## 本番に向けた補足

ハンズオンでは簡単のため認証なし(`--allow-unauthenticated` なサービス)に push しましたが、本番では以下のようにします:

- サービスを `--no-allow-unauthenticated` にして、Pub/Sub 用のサービスアカウントに `roles/run.invoker` を付与
- サブスクリプションに `--push-auth-service-account` を指定すると、Pub/Sub が OIDC トークン付きで POST してくれる

「サービス間の認証を IAM とIDトークンでやる」のは Cloud Run 全般のパターンで、内部マイクロサービス間の呼び出しも同じ仕組みで守れます(ALB の内部リスナーやセキュリティグループの代わりに、IAM で「誰が呼べるか」を制御するイメージです)。

さらに Pub/Sub 以外にも、**Eventarc** を使うと Cloud Storage のファイル作成や監査ログなど60以上のイベントソースから Cloud Run を起動できます(EventBridge 相当)。**Cloud Scheduler**(cron)や **Cloud Tasks**(遅延・レート制御付きキュー)も、同じく「HTTPエンドポイントを叩く」という形で Cloud Run と連携します。

## 後片付け(この節の分)

```bash
gcloud pubsub subscriptions delete handson-sub
gcloud pubsub topics delete handson-topic
```
