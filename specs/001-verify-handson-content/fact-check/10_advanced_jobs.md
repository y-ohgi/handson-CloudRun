# Fact-check: 10_advanced/jobs.md

**確認日**: 2026-08-19

検証方法: Google Cloud 公式ドキュメント(一次情報)の WebFetch による突き合わせ。`gcloud` の実行は行っていない(課金リソースを作らないため)。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L3 | Jobs はリクエストを受けず、処理が終わったら終了するワークロード | 正しい | https://docs.cloud.google.com/run/docs/create-jobs ("a Cloud Run job only runs its tasks and exits when finished. A job does not listen for or serve requests.") | 変更なし |
| 2 | L11 | 起動のきっかけ: 実行命令(手動 / スケジュール / API) | 正しい | https://docs.cloud.google.com/run/docs/create-jobs、https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule | 変更なし |
| 3 | L13 | Jobs は PORT の listen 不要 | 正しい | https://docs.cloud.google.com/run/docs/create-jobs ("A job does not listen for or serve requests.") | 変更なし |
| 4 | L14 | サービスの実行時間上限は60分(リクエストあたり) | 正しい | https://docs.cloud.google.com/run/docs/configuring/request-timeout (最大 60 分 / 3600 秒) | 変更なし |
| 5 | L14 | Jobs は最大7日間(タスクあたり) | 正しい | https://docs.cloud.google.com/run/docs/configuring/task-timeout ("you can change this to a shorter time or a longer time up to 168 hours (7 days)") | 変更なし |
| 6 | L15 | 並列実行はタスク数・並列数を `--tasks` で指定 | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/create (`--tasks=TASKS; default=1`、`--parallelism=PARALLELISM`) | 変更なし |
| 7 | L16 | リトライは `--max-retries` で組み込み | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/create ("Number of times a task is allowed to restart") | 変更なし |
| 8 | L18 | Lambda の15分と比べて使える場面が広い(Lambda 上限15分) | 正しい(一次情報確認) | https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html | **2026-08-19 T026 で確定**: `aws-comparisons.md` #10 が AWS 公式で「正しい」と判定(標準 Lambda の上限は900秒=15分のまま)。Cloud Run 側の7日は #5(書面)に加え `live-jobs.md` #18 で実機確認済み(`--task-timeout 169h` が `must be between 0 and 604800 seconds (168 hours)` で拒否された)。本文の変更は不要 |
| 9 | L27-29 | `gcloud run jobs create handson-job --image ${IMAGE}:v3 --region ${REGION}` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/create (`--image`、`--region`)。`${IMAGE}` は `00_preparation/README.md` L85、`:v3` は `06_traffic/README.md` L20-21 で作成済み | 変更なし |
| 10 | L30-31 | `--command node --args "-e,console.log('...')"`(カンマ区切りで引数を渡す) | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/create (`--command=[COMMAND,…]`、`--args=[ARG,…]` "Comma-separated arguments passed to the command run by the container") | 変更なし |
| 11 | L37 | `gcloud run jobs execute handson-job --region ${REGION} --wait` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/execute ("--wait: Wait until the execution has completed running before exiting.") | 変更なし |
| 12 | L43 | `gcloud run jobs logs read handson-job --region ${REGION}`(stable。`beta` ではない) | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/logs/read (NAME: "read logs for Cloud Run jobs"。alpha/beta は別 variant として列挙されており、当該ページが stable) | 変更なし(既に stable を使用) |
| 13 | L46 | コンソールの Cloud Run「ジョブ」タブに実行履歴・成功/失敗・ログが並ぶ | 正しい | https://docs.cloud.google.com/run/docs/create-jobs | 変更なし |
| 14 | L50 | コンソールのジョブ詳細から「トリガー」→スケジューラートリガーを追加できる | 正しい | https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule (コンソール手順が記載され、コンソール利用時の必要ロールとして `roles/run.developer` を明記) | 変更なし |
| 15 | L52 | Scheduler 用に専用サービスアカウントを作り最小権限(`run.invoker`)だけ与える | 正しい | https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule (必要ロールとして Cloud Run Invoker `roles/run.invoker`) | 変更なし(公式例は default compute SA を使うが、専用 SA は同等かつより最小権限。組織ポリシーで default SA が制限され得る点でも教材の書き方が妥当) |
| 16 | L56 | `gcloud iam service-accounts create handson-scheduler` | 正しい | https://docs.cloud.google.com/run/docs/tutorials/pubsub (`gcloud iam service-accounts create ...` 同形式) | 変更なし |
| 17 | L58-61 | `gcloud run jobs add-iam-policy-binding --region --member --role roles/run.invoker` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/add-iam-policy-binding (stable。SYNOPSIS に `--member`、`--role`、`--region`) | 変更なし |
| 18 | L64-65 | `gcloud scheduler jobs create http handson-job-schedule --location ${REGION}` | 正しい | https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule、https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http | 変更なし |
| 19 | L66-67 | `--schedule "0 9 * * *"` / `--time-zone "Asia/Tokyo"` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http (`--schedule` は unix-cron、`--time-zone` 存在) | 変更なし |
| 20 | L68 | `--http-method POST` を明示している(既定値も post) | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http (既定 `"post"`)、https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule ("--http-method: Must be `POST`") | 変更なし(明示済み) |
| 21 | L69 | `--uri "https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/jobs/handson-job:run"` | 正しい | https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule ("https://run.googleapis.com/v2/projects/PROJECT-ID/locations/CLOUD_RUN_REGION/jobs/JOB-NAME:run") | 変更なし |
| 22 | L70 | `--oauth-service-account-email` に専用 SA を渡す | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http (フラグ存在)、https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule | 変更なし。表示名検索で Compute Engine default SA を引く記述は本文に存在しない |
| 23 | 章全体 | Cloud Scheduler 利用に必要な `cloudscheduler.googleapis.com` の有効化が手順に含まれているか | 正しい | https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule (Cloud Scheduler API の有効化が必要)。教材側は `00_preparation/README.md` L49-54 の `gcloud services enable` に `cloudscheduler.googleapis.com` を含む | 変更なし(既に有効化済みのため本章での追記は不要) |
| 24 | L73 | IAM 付与直後は反映まで数分かかり 403 が返ることがある | 正しい | https://docs.cloud.google.com/run/docs/tutorials/pubsub ("It can take several minutes for the IAM changes to propagate. In the meantime, you might see `HTTP 403` errors …") | 変更なし |
| 25 | L80 | `gcloud run jobs update handson-job --region ${REGION} --tasks 5` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/update (stable、`--tasks=TASKS; default=1`、`--region`) | 変更なし |
| 26 | L84 | 各タスクに `CLOUD_RUN_TASK_INDEX` / `CLOUD_RUN_TASK_COUNT` が渡される | 正しい | https://docs.cloud.google.com/run/docs/create-jobs (`CLOUD_RUN_TASK_INDEX` は "a value between 0 and the number of tasks minus 1"、`CLOUD_RUN_TASK_COUNT` は "the number of tasks") | 変更なし |
| 27 | L89 | `gcloud scheduler jobs delete handson-job-schedule --location ${REGION} --quiet` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/delete (stable、`--location` 存在。`--quiet` は gcloud 共通フラグ) | 変更なし |
| 28 | L90 | `gcloud iam service-accounts delete "..." --quiet` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/iam/service-accounts/delete (stable。SERVICE_ACCOUNT はメール形式でも指定可) | 変更なし |
| 29 | L91 | `gcloud run jobs delete handson-job --region ${REGION} --quiet` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/delete (stable、`--region` 対応) | 変更なし |

## 集計

- 正しい: 29(2026-08-19 T026 で #8 を `aws-comparisons.md` #10 により確定)
- 要修正: 0
- 未確認: 0

なお、本表(ドキュメント照合)とは別に、実機検証 `live-jobs.md` #7 で `10_advanced/jobs.md` L81 の「詰まったら」に1件の追記(SA 作成直後の `add-iam-policy-binding` が `INVALID_ARGUMENT: ... does not exist.` で失敗する旨)が入っている。`live-jobs.md` 側の20項目は 一致17 / 不一致2(#7 修正済み、#14 は「403 が起きうる」という条件付き記述のため本文維持)/ 未実施1(#19 サービスの60分上限。実測手段がなく、書面確認は本表 #4 で済んでいる)。

## 修正はしていないが報告事項

- Cloud Run Jobs の task timeout の**既定値は10分**(https://docs.cloud.google.com/run/docs/configuring/task-timeout)。本章の比較表は上限(最大7日)のみを示しており誤りではないが、既定10分・`--task-timeout` で変更という情報は本文にない。新規記述の追加はスコープ外のため未修正。
- 同ページには「GPU を使うタスクの最大タイムアウトは1時間」という例外も記載されている。教材は GPU に触れていないため影響なし。
- `10_advanced/jobs.md` は既に stable の `gcloud run jobs logs read` を使用し、Scheduler も専用 SA 方式であるため、deep research レポートが指摘していた `beta` 利用と default compute SA 依存は現行 Markdown には存在しなかった(レポートは PDF 版を対象にしていた可能性が高い。未確認)。
