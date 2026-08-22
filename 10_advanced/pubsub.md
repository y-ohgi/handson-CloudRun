# 10-1. Pub/Subとつなぐ

Cloud Run を Pub/Sub のサブスクライバーにして、イベント駆動アーキテクチャを体験します。

## AWSでの構成と比べる

「S3にファイルが置かれたら処理する」「注文イベントを非同期で処理する」——AWS なら SNS + SQS + Lambda(またはSQSポーリングのECS)で組む定番パターンです。  
Lambda には専用のハンドラシグネチャがあり、SQS はポーリング設定やバッチサイズの調整が必要でした。

Google Cloud では **Pub/Sub がサブスクライバーのHTTPエンドポイントに直接 POST してくれます**(push型)。  
受け側は「POSTを受けるだけの普通のWebサーバー」でよく、つまり今日デプロイしたアプリがそのまま使えます。

> **[要作図] 図9: pull型とpush型の違い**
>
> - **目的:** 「受け側が普通のWebサーバーでよい」理由を、矢印の向きの違いとして見せる
> - **上(AWS):** SNS → SQS → Lambda。**矢印は Lambda 側から SQS へ向かう**(ポーリングして取りに行く)。Lambda の箱には「専用のハンドラシグネチャ」と注記
> - **下(Cloud Run):** Pub/Sub トピック → サブスクリプション → **矢印は Pub/Sub 側から Cloud Run へ向かう**(POSTしてくる)。Cloud Run の箱には「`POST /pubsub` を受けるだけの普通のWebサーバー」と注記
> - **要点:** 矢印の向きが逆であること。取りに行く側と、届けられる側の違いがこの節の本質
> - **認証付きの場合(任意):** 本番構成では Pub/Sub のサービスエージェントが OIDC トークンを取得して付与する流れが入る。別コマとして描くなら、「サービスアカウント」「`roles/iam.serviceAccountTokenCreator`」「`roles/run.invoker`」の3つがどこに効くかを示すと、章末の補足が理解しやすくなる
> - **完成後の扱い:** `10_advanced/imgs/pull-vs-push-delivery.png` として保存し、**見出しの直下**に `![pull型とpush型の配送の違い](imgs/pull-vs-push-delivery.png)` として差し込む(見出し → 画像 → 本文の順。キャプション文は付けない)

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

> **この章の構成は「配送の仕組みを短時間で観察する」ためのハンズオン用ショートカットです。** 認証なしの公開エンドポイントに push する構成を本番で使ってはいけません。実務では本章末尾の「本番に向けた補足」にある、サービスアカウント+OIDC トークンによる認証付き push を使います。先に認証を外しているのは、Pub/Sub の配送と IAM を一度にデバッグしなくて済むようにするためです。

## 1. トピックとpushサブスクリプションを作る

```bash
gcloud pubsub topics create handson-topic

URL=$(gcloud run services describe handson-app --region ${REGION} --format 'value(status.url)')

gcloud pubsub subscriptions create handson-sub \
  --topic handson-topic \
  --push-endpoint ${URL}/pubsub
```

これで配線は完了です。  
SQSキューの作成、イベントソースマッピング、IAMロール、バッチ設定……に相当する作業はありません。

> **成功していれば:** `Created topic [projects/.../topics/handson-topic].` と `Created subscription [projects/.../subscriptions/handson-sub].` が表示されます。`gcloud pubsub topics list` に `handson-topic`、`gcloud pubsub subscriptions list` に `handson-sub` が1行ずつ出れば配線できています。
> **詰まったら:** `ALREADY_EXISTS` は作成済みという意味なので、そのまま次へ進んで構いません。`--push-endpoint /pubsub` のように URL が空で渡っている場合は `URL` の取得に失敗しています。まず `echo ${REGION}` が空でないか確認し、空なら 4章の「0. 環境変数の準備」を再実行してから `URL=$(gcloud run services describe handson-app --region ${REGION} --format 'value(status.url)')` をやり直してください。`handson-app` が見つからないと言われる場合は `gcloud run services list --region ${REGION}` でサービス名を確認します。作り直したいときは `gcloud pubsub subscriptions delete handson-sub` で消してから、この節のコマンドをもう一度実行すれば同じ状態に戻せます。

## 2. メッセージを発行してみる

```bash
gcloud pubsub topics publish handson-topic --message "Hello from Pub/Sub"
```

数秒待ってからログを確認します:

```bash
gcloud run services logs read handson-app --region ${REGION} --limit 10
```

`Pub/Sub message received: Hello from Pub/Sub` が出ていれば成功です。  
8章の Logs Explorer で見ると、severity `INFO` のログとして届いているのも確認できます(実測では、このログは `jsonPayload` ではなく本文だけのログとして記録されました)。

> **成功していれば:** publish が `messageIds:` を返し、数秒後のログに `Pub/Sub message received: Hello from Pub/Sub` の1行が出ます。
> **詰まったら:** 配送とログの反映には少し時間がかかります。まず10〜20秒ほど待って `gcloud run services logs read handson-app --region ${REGION} --limit 10` をもう一度実行してください。それでも出ない場合は push 先が正しいかを確認します。`gcloud pubsub subscriptions describe handson-sub --format 'value(pushConfig.pushEndpoint)'` の出力が、`gcloud run services describe handson-app --region ${REGION} --format 'value(status.url)'` の URL + `/pubsub` になっているかを見比べてください。ずれていたら `gcloud pubsub subscriptions delete handson-sub` してから「1. トピックとpushサブスクリプションを作る」をやり直します。なお、この節の後にある「本番に向けた補足」の認証付き push を試している場合は、IAM の反映に数分かかるため一時的に 403 が返ります。数分待ってから publish を再実行してください。

## 3. ここで想像してほしいこと

- このエンドポイントが重い処理(画像変換、集計、通知送信)だったら? → **Pub/Sub が流量を受け止め、Cloud Run が処理量に応じてスケールアウトする**。バックプレッシャー付きの非同期処理基盤が、この3コマンドでできています
- 処理が失敗したら(2xx以外を返したら)? → Pub/Sub が自動でリトライします。デッドレタートピックも設定できます
- スケールtoゼロと組み合わせると? → イベントが来たときだけ起動して課金される、Lambda 的な使い方が「普通のWebサーバー」のままできます

## 本番に向けた補足

ハンズオンでは簡単のため認証なし(`--allow-unauthenticated` なサービス)に push しましたが、本番では以下のようにします:

- サービスを `--no-allow-unauthenticated` にして、Pub/Sub 用のサービスアカウントに `roles/run.invoker` を付与
- サブスクリプションに `--push-auth-service-account` を指定すると、Pub/Sub が OIDC トークン付きで POST してくれる
- あわせて Pub/Sub のサービスエージェント(`service-<プロジェクト番号>@gcp-sa-pubsub.iam.gserviceaccount.com`)に `roles/iam.serviceAccountTokenCreator` を付与します。これがないと Pub/Sub が OIDC トークンを生成できません
- IAM 付与の直後は反映まで数分かかり、その間 403 が返ることがあります(数分待ってリトライ)

「サービス間の認証を IAM とIDトークンでやる」のは Cloud Run 全般のパターンで、内部マイクロサービス間の呼び出しも同じ仕組みで守れます(ALB の内部リスナーやセキュリティグループの代わりに、IAM で「誰が呼べるか」を制御するイメージです)。

さらに Pub/Sub 以外にも、**Eventarc** を使うと Cloud Storage のファイル作成や監査ログなど60以上のイベントソースから Cloud Run を起動できます(EventBridge 相当)。  
**Cloud Scheduler**(cron)や **Cloud Tasks**(遅延・レート制御付きキュー)も、同じく「HTTPエンドポイントを叩く」という形で Cloud Run と連携します。

## 後片付け(この節の分)

```bash
gcloud pubsub subscriptions delete handson-sub
gcloud pubsub topics delete handson-topic
```
