# 10-3. Cloud Run Jobs

ここまで扱ってきたのは Cloud Run の「サービス」——HTTPリクエストを受けるワークロードでした。もう1つの顔が **Jobs**: リクエストを受けず、**処理が終わったら終了する**ワークロードです。バッチ処理、DBマイグレーション、定期集計などに使います。

> **AWSでいうと:** ECS の RunTask、AWS Batch、(15分制限がなければ)Lambda あたりの守備範囲です。

## サービスとの違い

| | サービス | Jobs |
|---|---|---|
| 起動のきっかけ | HTTPリクエスト | 実行命令(手動 / スケジュール / API) |
| 終わり方 | 常に待ち受け | プロセスが exit したら完了 |
| PORT の listen | 必須 | **不要** |
| 並列実行 | オートスケール | タスク数・並列数を指定(`--tasks`) |
| リトライ | (Pub/Sub等の呼び出し側で) | `--max-retries` で組み込み |

重要なのは、**同じイメージ・同じレジストリ・同じ開発体験のまま**、Web とバッチの両方をカバーできることです。

## 1. ジョブを作って実行する

今日作ったイメージを流用し、起動コマンドだけ上書きしてジョブにします。

```bash
gcloud run jobs create handson-job \
  --image ${IMAGE}:v3 \
  --region ${REGION} \
  --command node \
  --args "-e,console.log('Hello from Cloud Run Jobs')"
```

実行します。`--wait` で完了まで待ちます。

```bash
gcloud run jobs execute handson-job --region ${REGION} --wait
```

ログを見てみましょう:

```bash
gcloud beta run jobs logs read handson-job --region ${REGION}
```

コンソールの [Cloud Run](https://console.cloud.google.com/run) では「ジョブ」タブに実行履歴・成功/失敗・ログが並びます。

## 2. 定期実行(cron)にする

Cloud Scheduler(EventBridge Scheduler 相当)から叩けば cron バッチになります。コンソールのジョブ詳細画面から「トリガー」→「スケジューラー トリガーを追加」で GUI からも設定できます。

```bash
# 例: 毎朝9時(JST)に実行するトリガー
gcloud scheduler jobs create http handson-job-schedule \
  --location ${REGION} \
  --schedule "0 9 * * *" \
  --time-zone "Asia/Tokyo" \
  --uri "https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/jobs/handson-job:run" \
  --oauth-service-account-email $(gcloud iam service-accounts list --format 'value(email)' --filter 'displayName:"Compute Engine default service account"')
```

> こちらはコマンドが少し長いので、イベントでは GUI での設定を見せるだけで十分です。

## 3. 並列実行

Jobs の面白いところは組み込みの並列実行です。例えば「10万件のデータを100タスクで分担して処理」のような使い方ができます:

```bash
gcloud run jobs update handson-job --region ${REGION} --tasks 5
gcloud run jobs execute handson-job --region ${REGION} --wait
```

各タスクには `CLOUD_RUN_TASK_INDEX` / `CLOUD_RUN_TASK_COUNT` という環境変数が渡されるので、「自分は何番目か」で担当範囲を割り出せます。AWS Batch の配列ジョブ相当が、追加サービスなしで使えます。

## 後片付け(この節の分)

```bash
gcloud scheduler jobs delete handson-job-schedule --location ${REGION} --quiet  # 作った場合のみ
gcloud run jobs delete handson-job --region ${REGION} --quiet
```
