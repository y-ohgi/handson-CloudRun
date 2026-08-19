# Fact-check: 10_advanced/pubsub.md

**確認日**: 2026-08-19

検証方法: Google Cloud 公式ドキュメント(一次情報)の WebFetch による突き合わせ。`gcloud` の実行は行っていない(課金リソースを作らないため)。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L9 | Pub/Sub が push 型でサブスクライバーの HTTP エンドポイントへ直接 POST する | 正しい | https://docs.cloud.google.com/pubsub/docs/push | 変更なし |
| 2 | L13-21 | 本文のコード断片が `code/app/src/index.ts` の `/pubsub` ハンドラと一致 | 正しい | (リポジトリ内 `code/app/src/index.ts` L76-83 と完全一致) | 変更なし |
| 3 | L24 | 認証なし push は「ハンズオン用ショートカット」であり本番では使わない旨の注記 | 正しい | https://docs.cloud.google.com/run/docs/triggering/pubsub-push (公式手順は `--no-allow-unauthenticated` 前提。"By keeping the service private you can rely on Cloud Run's automatic Pub/Sub integration to authenticate requests.") | 変更なし(既に明示済み) |
| 4 | L29 | `gcloud pubsub topics create handson-topic` | 正しい | https://docs.cloud.google.com/run/docs/tutorials/pubsub (`gcloud pubsub topics create myRunTopic`) | 変更なし |
| 5 | L31 | `gcloud run services describe handson-app --region ${REGION} --format 'value(status.url)'` | 未確認 | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/describe | 公式リファレンスの EXAMPLES に同一の `--format` 例は無く、`value(status.url)` の妥当性を一次情報で確認できなかった。`--format` は gcloud 共通フラグであり教材の他章でも同じ書式を使っているため変更していない |
| 6 | L33-35 | `gcloud pubsub subscriptions create --topic --push-endpoint` のフラグ名 | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create | 変更なし |
| 7 | L38 | 「SQS キュー作成・イベントソースマッピング・IAM ロール・バッチ設定に相当する作業はない」 | 正しい | https://docs.cloud.google.com/run/docs/tutorials/pubsub (認証なし構成では topic + subscription のみ) | 変更なし(教材が認証なし構成である前提の記述として成立) |
| 8 | L43 | `gcloud pubsub topics publish handson-topic --message "..."` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/topics/publish (stable、`--message` 存在) | 変更なし |
| 9 | L49 | `gcloud run services logs read handson-app --region ${REGION} --limit 10`(stable) | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/logs/read (NAME: "read logs for a Cloud Run service"、`--region` / `--limit` を持つ stable コマンド) | 変更なし |
| 10 | L56 | Pub/Sub が流量を受け止め Cloud Run がスケールアウトする | 正しい | https://docs.cloud.google.com/pubsub/docs/push | 変更なし |
| 11 | L57 | 2xx 以外を返すと Pub/Sub が自動リトライする | 正しい | https://docs.cloud.google.com/pubsub/docs/push ("A non-success response indicates that Pub/Sub must resend the messages." ack 扱いは 102/200/201/202/204) | 変更なし |
| 12 | L57 | デッドレタートピックも設定できる | 正しい | https://docs.cloud.google.com/pubsub/docs/handling-failures (dead-letter topic はサブスクリプションのプロパティ。push サブスクリプションでも設定可) | 変更なし |
| 13 | L64 | 本番では `--no-allow-unauthenticated` + Pub/Sub 用 SA に `roles/run.invoker` | 正しい | https://docs.cloud.google.com/run/docs/tutorials/pubsub (`gcloud run services add-iam-policy-binding ... --role=roles/run.invoker`) | 変更なし |
| 14 | L65 | サブスクリプションに `--push-auth-service-account` を指定すると OIDC トークン付きで POST される | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create ("Service account email used as the identity for the generated Open ID Connect token for authenticated push.") | 変更なし |
| 15 | L64-67 | 認証付き push の手順に必要な IAM がすべて挙がっているか | 要修正 | https://docs.cloud.google.com/run/docs/tutorials/pubsub (`gcloud projects add-iam-policy-binding ... --member=serviceAccount:service-PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com --role=roles/iam.serviceAccountTokenCreator`) | Pub/Sub サービスエージェントへの `roles/iam.serviceAccountTokenCreator` 付与が抜けていたため箇条書きを1行追記した(これがないと OIDC トークンが生成できず認証付き push が成立しない) |
| 16 | L67(修正後 L68) | IAM 付与直後は反映に数分かかり 403 が返ることがある | 正しい | https://docs.cloud.google.com/run/docs/tutorials/pubsub ("It can take several minutes for the IAM changes to propagate. In the meantime, you might see `HTTP 403` errors in the service logs.") | 変更なし |
| 17 | L70 | Eventarc で「60以上のイベントソース」から Cloud Run を起動できる | 未確認 | https://docs.cloud.google.com/eventarc/standard/docs/event-providers-targets / https://docs.cloud.google.com/run/docs/triggering/trigger-with-events | 公式ドキュメントに件数の明示的な記述が見つからなかった。プロバイダ表の件数は 60 を明らかに上回るため下限としては成立する見込みだが、数値の一次情報が取れないため本文は変更していない |
| 18 | L70 | Eventarc の宛先として Cloud Run(サービス/ジョブ)がサポートされる | 正しい | https://docs.cloud.google.com/eventarc/docs/overview (destinations に Cloud Run jobs and services) | 変更なし |
| 19 | L70 | Cloud Scheduler(cron)・Cloud Tasks(遅延・レート制御付きキュー)も HTTP エンドポイントを叩く形で Cloud Run と連携する | 正しい | https://docs.cloud.google.com/tasks/docs/creating-http-target-tasks (HTTP target、rate limits / retry の設定、"You can schedule a task at a future time.")、https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule | 変更なし |
| 20 | L75-76 | `gcloud pubsub subscriptions delete` / `gcloud pubsub topics delete` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/delete (stable、サブスクリプション名を位置引数で取る) | 変更なし |

## 集計

- 正しい: 17
- 要修正: 1(#15)
- 未確認: 2(#5 `--format 'value(status.url)'` の公式例、#17 Eventarc のイベントソース件数)

## 修正はしていないが報告事項

- 本章の `gcloud pubsub subscriptions create` は `--ack-deadline` を指定していない。公式チュートリアルは `--ack-deadline=600` を指定している(https://docs.cloud.google.com/run/docs/tutorials/pubsub)。ハンズオンの軽い処理では既定値でも動くため事実誤りではないが、重い処理を例示する場合は言及の価値がある。指示スコープ(事実の差分のみ)を超えるため未修正。
