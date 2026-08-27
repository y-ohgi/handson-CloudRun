# 実機検証: 10-3 Cloud Run Jobs

**実行日**: 2026-08-19
**環境**: sandbox-360407 / asia-northeast1 / リポジトリは衝突回避のため handson-jobs を使用

`gcloud` 501.0.0。イメージは `code/app` を `--platform linux/amd64` でビルドし `asia-northeast1-docker.pkg.dev/sandbox-360407/handson-jobs/app:v3` として push した(検証マシンが arm64 のため。Cloud Shell は amd64 なのでこれは検証環境固有の差であり教材の不具合ではない)。教材の `${REPO}=handson` を `handson-jobs` に読み替えた以外は、教材のコマンドをそのまま実行している。

| # | 検証項目 | 教材の記述 | 実際の結果 | 判定 | 対応 |
|---|---|---|---|---|---|
| 1 | `gcloud run jobs create`(L27-32) | `--command node --args "-e,console.log('Hello from Cloud Run Jobs')"` でジョブが作成できる | 成功。`Job [handson-job] has successfully been created.` と、続けて `To execute this job, use: gcloud run jobs execute handson-job` が出力された | 一致 | 変更なし |
| 2 | `gcloud run jobs execute --wait` が完了まで戻らないか(L37, L48) | 「`--wait` を付けた実行が完了まで戻ってこず、最後に実行が成功した旨のメッセージで終わります」 | 18:13:31 に開始し 18:13:55 に復帰(約24秒ブロック)。`Creating execution...` → `Provisioning resources...done` → `Starting execution...done` → `Running execution...done` → `Done.` → `Execution [handson-job-jtsjl] has successfully completed.` で終了。exit code 0 | 一致 | 変更なし |
| 3 | **`gcloud run jobs logs read` が stable グループで動くか**(L43) | `gcloud run jobs logs read handson-job --region ${REGION}`(`beta` を使わない) | stable のまま成功。exit code 0、出力 `2026-08-19 09:13:50 Hello from Cloud Run Jobs` | 一致 | 変更なし(実機で裏取り済み) |
| 4 | ログに `Hello from Cloud Run Jobs` が出るか(L48) | 「ログに `Hello from Cloud Run Jobs` が出ます」 | 上記のとおり出力された | 一致 | 変更なし |
| 5 | `gcloud run jobs list` に並ぶか(L48) | 「`gcloud run jobs list --region ${REGION}` に `handson-job` が並びます」 | ヘッダ `JOB  REGION  LAST RUN AT  CREATED  CREATED BY`、行 `✔  handson-job  asia-northeast1  2026-08-19 09:13:32 UTC  2026-08-19 09:13:22 UTC  y-ohgi@topotal.com` | 一致 | 変更なし |
| 6 | `gcloud iam service-accounts create`(L59) | サービスアカウントが作成できる | `Created service account [handson-scheduler].` | 一致 | 変更なし |
| 7 | **SA 作成直後の `add-iam-policy-binding`**(L59→L61) | 教材の詰まったらは「サービスアカウントと IAM 付与のコマンドは何度実行しても同じ結果になるので、順番に再実行して構いません」とだけ書いており、具体的なエラー文言に触れていない | SA 作成の直後に実行すると失敗: `ERROR: (gcloud.run.jobs.add-iam-policy-binding) INVALID_ARGUMENT: Service account handson-scheduler@sandbox-360407.iam.gserviceaccount.com does not exist.`(加えて `ERROR: Policy modification failed. For a binding with condition, ...` が前置される)。約15〜30秒待って同じコマンドを再実行したら 18:14:58 に成功 | 不一致(修正した) | L81 の詰まったらに、このエラー文言と「数十秒おいて IAM 付与のコマンドだけを再実行する」旨を追記 |
| 8 | IAM 付与の結果 | `roles/run.invoker` が付与される | `gcloud run jobs get-iam-policy handson-job` が `members: - serviceAccount:handson-scheduler@sandbox-360407.iam.gserviceaccount.com` / `role: roles/run.invoker` を返した | 一致 | 変更なし |
| 9 | **`gcloud scheduler jobs create http` の `--http-method` 既定値**(L71) | 教材は `--http-method POST` を明示 | `gcloud scheduler jobs create http --help` は `--http-method=HTTP_METHOD; default="post"` と記載。教材の明示は冗長だが正しく、大文字 `POST` もそのまま受理され `httpMethod: POST` になった | 一致 | 変更なし(既定値と同じだが、明示は読者に意図が伝わるので残す) |
| 10 | Scheduler ジョブ作成(L67-73) | 教材のコマンドがそのまま通る | 成功。作成直後のレスポンスに `state: ENABLED`、`schedule: 0 9 * * *`、`timeZone: Asia/Tokyo`、`scheduleTime: '2026-08-20T00:00:00Z'`、`attemptDeadline: 180s`、`oauthToken.serviceAccountEmail: handson-scheduler@...`、`oauthToken.scope: https://www.googleapis.com/auth/cloud-platform` | 一致 | 変更なし |
| 11 | `gcloud scheduler jobs list` の表記(L80) | 「`handson-job-schedule` が `ENABLED` で並びます」 | ヘッダ `ID  LOCATION  SCHEDULE (TZ)  TARGET_TYPE  STATE`、行 `handson-job-schedule  asia-northeast1  0 9 * * * (Asia/Tokyo)  HTTP  ENABLED`。`ENABLED` は `STATE` 列に一字一句そのまま出る | 一致 | 変更なし |
| 12 | `gcloud iam service-accounts list` の表記(L80) | 「サービスアカウントは `gcloud iam service-accounts list` に `handson-scheduler@...` として出ます」 | `EMAIL` 列に `handson-scheduler@sandbox-360407.iam.gserviceaccount.com` が出た。ただし `--display-name` を付けていないため `DISPLAY NAME` 列は空欄。教材は EMAIL 表記しか主張していないので記述は正しい | 一致 | 変更なし |
| 13 | **Cloud Scheduler 連携が実際に動くか** | Scheduler から叩けば cron バッチになる | 動いた。`gcloud scheduler jobs run handson-job-schedule --location asia-northeast1` を 18:16:06 に発行(出力なし・exit 0)。実行が始まったのは 09:17:10 UTC(約64秒のラグ)。`gcloud run jobs executions list` の `RUN BY` が `handson-scheduler@sandbox-360407.iam.gserviceaccount.com` になり `1 / 1` で成功。Cloud Logging(`resource.type="cloud_scheduler_job"`)の記録は 1 件のみで `httpRequest.status = 200` | 一致 | 変更なし |
| 14 | **IAM 反映待ちで最初の起動が 403 になるか**(L76) | 「IAM 付与の直後は反映まで数分かかり 403 が返ることがあります——初回実行が失敗したら少し待ってリトライしてください」 | 今回は 403 は発生しなかった。IAM 付与成功(18:14:58)から起動要求(18:16:06)まで約68秒、実際の起動試行(18:17:10)まで約2分12秒あり、その1回目の試行が 200 で成功した。教材の記述は「ことがあります」という条件付きの注意書きなので、1回の成功では反証にならない | 不一致(要判断) → 本文は変更せず | 記述は残した。ただし実測では 403 は再現していないため、この注意書きは「必ず起きる」ではなく「起きうる」ままにしておくのが正しい。実際に観測された反映待ちの詰まりは #7 の SA 作成直後の `does not exist` だったので、そちらを本文に追記した |
| 15 | **`--tasks 5` で本当に並列実行されるか**(L88-89) | 「10万件のデータを100タスクで分担して処理」のような使い方ができる | 並列実行された。`gcloud run jobs update handson-job --tasks 5` 後の execute で `spec.taskCount: 5` / `spec.parallelism: 5`(`--parallelism` 未指定なら taskCount と同値)/ `status.succeededCount: 5`。`startTime 09:21:41` → `completionTime 09:22:02`(約21秒)。ログは 09:21:46 に1行、09:21:56 に4行の計5行 | 一致 | 変更なし |
| 16 | `CLOUD_RUN_TASK_INDEX` / `CLOUD_RUN_TASK_COUNT` が渡るか(L92) | 「各タスクには `CLOUD_RUN_TASK_INDEX` / `CLOUD_RUN_TASK_COUNT` という環境変数が渡される」 | 渡っていた。`--args` を差し替えて確認したところ、5行すべて同一秒(09:22:47)に `idx=0 count=5 attempt=0` 〜 `idx=4 count=5 attempt=0` が出力された(`CLOUD_RUN_TASK_ATTEMPT` も渡る) | 一致 | 変更なし |
| 17 | **task timeout の既定値**(記録のみ) | 教材は上限(最大7日間)しか書いていない | 既定値は 600 秒(10分)。`gcloud run jobs describe` が `spec.template.spec.template.spec.timeoutSeconds: '600'` を返した。あわせて `maxRetries` の既定値は 3、`--tasks` の既定値は 1(`--help` に `default=1`) | 一致(上限の記述) | 本文への追記は不要との指示に従い記録のみ |
| 18 | 上限「最大7日間」(L14, L18) | タスクあたり最大7日間 | 実機で裏取りできた。`gcloud run jobs update handson-job --task-timeout 169h` が `INVALID_ARGUMENT: spec.template.spec.task_spec.timeout: must be between 0 and 604800 seconds (168 hours), inclusive.` を返した(604800秒 = 168時間 = 7日) | 一致 | 変更なし |
| 19 | サービスの実行時間上限60分(L14) | 「60分(リクエストあたり)」 | 未実施。`gcloud run services update --help` の `--timeout` 説明に上限値の記載がなく、本番サービスに触れずに実測する手段がなかった。書面での確認は `10_advanced_jobs.md` #4 で済んでいる | 未実施 | 変更なし |
| 20 | 後片付けコマンド(L97-99) | scheduler / SA / job を `--quiet` で削除 | 3コマンドすべて成功。詳細は下記「後片付けの実行結果」 | 一致 | 変更なし |

## 後片付けの実行結果

検証用に作ったリソースはすべて削除した。

| リソース | 削除コマンド | 結果 |
|---|---|---|
| Cloud Scheduler ジョブ `handson-job-schedule` | `gcloud scheduler jobs delete handson-job-schedule --location asia-northeast1 --quiet` | 削除済み(`gcloud scheduler jobs list --location asia-northeast1` が `Listed 0 items.`) |
| サービスアカウント `handson-scheduler` | `gcloud iam service-accounts delete "handson-scheduler@sandbox-360407.iam.gserviceaccount.com" --quiet` | 削除済み(`gcloud iam service-accounts list` に出ない) |
| Cloud Run ジョブ `handson-job` | `gcloud run jobs delete handson-job --region asia-northeast1 --quiet` | 削除済み(`gcloud run jobs list --region asia-northeast1` が `Listed 0 items.`) |
| Artifact Registry `handson-jobs`(検証用に追加作成) | `gcloud artifacts repositories delete handson-jobs --location asia-northeast1 --quiet` | 削除済み |

## 教材への変更

- `10_advanced/jobs.md` L81(「2. 定期実行(cron)にする」の詰まったら): サービスアカウント作成の直後に `add-iam-policy-binding` を実行すると `INVALID_ARGUMENT: Service account handson-scheduler@... does not exist.` で失敗することと、数十秒おいて IAM 付与のコマンドだけを再実行すればよいことを追記した(#7)。実機で必ず踏む詰まりだが、既存の記述では具体的なエラー文言が分からなかったため
