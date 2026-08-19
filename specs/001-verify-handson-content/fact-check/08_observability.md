# Fact-check: 08_observability/README.md

**確認日**: 2026-08-19

検証方法: Google Cloud 公式ドキュメント(`docs.cloud.google.com`)の突き合わせのみ。`gcloud` の実行・コンソール操作は行っていない。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L7 | Cloud Run コンソール(https://console.cloud.google.com/run) → サービス → 「ログ」タブでログが見られる | 正しい | https://docs.cloud.google.com/run/docs/logging | 公式にサービス詳細の Logs タブからログを参照する手順が記載(日本語UIでは「ログ」) |
| 2 | L9 | コンテナが stdout/stderr に出しただけのログがすべて収集される | 正しい | https://docs.cloud.google.com/run/docs/logging | 公式: 収集対象に "Standard output (`stdout`) or standard error (`stderr`) streams" が含まれる。設定不要 |
| 3 | L10 | 1行JSON が構造化ログとして解釈され、`severity` で色分けされる | 正しい | https://docs.cloud.google.com/run/docs/logging , https://docs.cloud.google.com/logging/docs/structured-logging | 公式: "if your JSON includes a `severity` property, it is removed from the `jsonPayload` and appears instead as the log entry's `severity`."。`message` は "used as the main display text of the log entry if present" |
| 4 | L15 | `gcloud run services logs read handson-app --region ${REGION} --limit 20` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/logs/read | GA(stable)コマンドとして現存。synopsis に `--region` / `--limit` を含む。公式ログドキュメントにも `gcloud run services logs read SERVICE --limit=10 --project PROJECT-ID` の例あり。beta 指定は不要 |
| 5 | L18 | AWS では awslogs ログドライバ・ロググループ・IAM 権限が必要だった | 正しい(一次情報確認) | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html | **2026-08-19 T026 で確定**: `aws-comparisons.md` #7 が AWS 公式で「正しい」と判定(`logConfiguration` と `logs:CreateLogStream` / `logs:PutLogEvents` が実際に必要)。本文の変更は不要 |
| 6 | L18 | Cloud Run は「コンテナが stdout に書く、以上」。1行JSONにすればフィールド検索・severityフィルタが効く | 正しい | https://docs.cloud.google.com/run/docs/logging | 自動収集 + `severity` 抽出 + `jsonPayload` へのフィールド保持と整合 |
| 7 | L22 | 「ログ」タブ上部から「ログ エクスプローラで表示」でプロジェクト全体を横断検索できる | 正しい | https://docs.cloud.google.com/run/docs/logging | 公式に Logs Explorer への遷移とプロジェクト横断検索が記載。ボタンの日本語ラベルの文字列一致までは未検証 |
| 8 | L25 | `resource.type="cloud_run_revision"` | 正しい | https://docs.cloud.google.com/run/docs/logging | 公式: "`LogEntry.resource.type`: `cloud_run_revision`" |
| 9 | L26 | `resource.labels.service_name="handson-app"` | 正しい | https://docs.cloud.google.com/monitoring/api/resources | `cloud_run_revision` のラベルは `project_id` / `service_name` / `revision_name` / `location` / `configuration_name` |
| 10 | L27 | `jsonPayload.message="index accessed"` で絞り込める | 正しい(条件付き) | https://docs.cloud.google.com/logging/docs/structured-logging | `severity` は `jsonPayload` から取り除かれるが、`message` は他のフィールドが残る場合 `jsonPayload` に残る。該当ログは `instance` フィールドを持つため `jsonPayload.message` で検索可能。本文修正不要 |
| 11 | L30 | `jsonPayload.instance` など自分が入れたフィールドも検索条件に使える | 正しい | https://docs.cloud.google.com/logging/docs/structured-logging | 特別扱いされないフィールドは `jsonPayload` に残り、JSONパス指定で検索できる |
| 12 | L34-38 | 「指標」タブに リクエスト数 / レイテンシ / コンテナインスタンス数 / 課金対象インスタンス時間 / CPU・メモリ使用率 が最初から揃っている | 正しい | https://docs.cloud.google.com/run/docs/monitoring | 公式の自動収集メトリクス: "Billable container instance time, Container startup latency, Container CPU utilization, Container memory utilization, Sent bytes, Received bytes, Request count, Request latencies, Container instance count, Maximum concurrent requests"。コンソールに Metrics タブが存在することも公式に記載 |
| 13 | L35 | レイテンシは p50, p95, p99 で見られる | 未確認 | https://docs.cloud.google.com/run/docs/monitoring | 公式ドキュメントには "Request latencies" の記載のみで、パーセンタイル分割の明記を確認できなかった(コンソールUIの仕様のため)。憶測で断定しないため本文は変更していない。**2026-08-19 T026: 未確認のまま残す(カテゴリB: コンソールUI)**。実機検証はヘッドレス環境で行い、コンソールの目視は未実施(`live-main-path.md` #36 / #43) |
| 14 | L40 | 6章のカナリア中に指標画面を見て昇格判断する / リビジョン別にメトリクスをフィルタできる | 未確認 | https://docs.cloud.google.com/monitoring/api/resources , https://docs.cloud.google.com/run/docs/monitoring | `cloud_run_revision` に `revision_name` ラベルがあるため Metrics Explorer 側でのリビジョン単位の絞り込みは可能。ただしコンソール「指標」タブ上のフィルタUIについては公式ドキュメントで確認できず。本文は変更していない。**2026-08-19 T026: 未確認のまま残す(カテゴリB: コンソールUI)**。`live-main-path.md` #36 は Cloud Monitoring API 経由で `run.googleapis.com/container/instance_count` が `revision_name` ラベル付きで取得でき、リビジョン単位の絞り込みが実際に可能であることを確認済み(#27 でリビジョン `handson-app-00004-bl6` を指定して台数を観測)。**残る未確認はコンソールUI上のフィルタ操作のみ** |
| 15 | L44-46 | まとめ(ログ・メトリクスは「設定する」のではなく「最初からある」/ アプリ側は stdout に1行JSON) | 正しい | https://docs.cloud.google.com/run/docs/logging , https://docs.cloud.google.com/run/docs/monitoring | 自動収集の記述と整合 |

## 修正した箇所

- ドキュメント照合の段階では0件(要修正判定なし)。
- その後の実機検証で1件修正: `live-main-path.md` #33 のとおり、`gcloud run services logs read` は `textPayload` しか本文として読まないため、`jsonPayload` を持つ `index accessed` のエントリは**時刻だけの空行**として表示される(gcloud 581.0.0 でも再現)。08章 L18 の成功条件を実際の見え方に修正し、JSON の中身を CLI で見る手段として `gcloud logging read ... --format 'yaml(timestamp,severity,jsonPayload)'` を追記した。表 #4(コマンドが stable で存在すること)と #3 / #10(構造化ログとして解釈され `jsonPayload.message` で絞り込めること、`live-main-path.md` #34 で実機確認)の判定自体は変わらない。

## 実機確認が必要な残件(2026-08-19 T026 で棚卸し)

解決済み:

- 1行JSONが構造化ログとして解釈され `jsonPayload.message="index accessed"` で絞り込めるか(#3、#10)→ **解決**。`live-main-path.md` #34 で `jsonPayload: {instance: fe35f111, message: index accessed}` / `severity: INFO` を取得
- `gcloud run services logs read` の実際の出力(#4)→ **解決**(上記「修正した箇所」参照)
- 「指標」タブに揃うメトリクスの実在(#12)→ **部分的に解決**。`live-main-path.md` #36 で Cloud Monitoring API 経由の取得を確認。コンソール画面自体は未確認

未解決(実機検証でも埋まらなかったもの):

- コンソール「指標」タブのレイテンシチャートに p50/p95/p99 が表示されるか(#13)— カテゴリB: コンソールUI
- コンソール「指標」タブでリビジョン別フィルタができるか(#14)— カテゴリB: コンソールUI(API 側での絞り込みは確認済み)
- 「ログ エクスプローラで表示」ボタンの日本語ラベル(#7、verdict は `正しい` で文字列一致のみ未検証)— カテゴリB: コンソールUI
