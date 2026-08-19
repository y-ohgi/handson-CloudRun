# Fact-check: 08_observability/README.md

**確認日**: 2026-08-19

検証方法: Google Cloud 公式ドキュメント(`docs.cloud.google.com`)の突き合わせのみ。`gcloud` の実行・コンソール操作は行っていない。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L7 | Cloud Run コンソール(https://console.cloud.google.com/run) → サービス → 「ログ」タブでログが見られる | 正しい | https://docs.cloud.google.com/run/docs/logging | 公式にサービス詳細の Logs タブからログを参照する手順が記載(日本語UIでは「ログ」) |
| 2 | L9 | コンテナが stdout/stderr に出しただけのログがすべて収集される | 正しい | https://docs.cloud.google.com/run/docs/logging | 公式: 収集対象に "Standard output (`stdout`) or standard error (`stderr`) streams" が含まれる。設定不要 |
| 3 | L10 | 1行JSON が構造化ログとして解釈され、`severity` で色分けされる | 正しい | https://docs.cloud.google.com/run/docs/logging , https://docs.cloud.google.com/logging/docs/structured-logging | 公式: "if your JSON includes a `severity` property, it is removed from the `jsonPayload` and appears instead as the log entry's `severity`."。`message` は "used as the main display text of the log entry if present" |
| 4 | L15 | `gcloud run services logs read handson-app --region ${REGION} --limit 20` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/logs/read | GA(stable)コマンドとして現存。synopsis に `--region` / `--limit` を含む。公式ログドキュメントにも `gcloud run services logs read SERVICE --limit=10 --project PROJECT-ID` の例あり。beta 指定は不要 |
| 5 | L18 | AWS では awslogs ログドライバ・ロググループ・IAM 権限が必要だった | 未確認 | - | AWS側の記述は本タスク(Google Cloud 公式ドキュメント突き合わせ)の対象外。AWS比較の検証タスクへ委ねる |
| 6 | L18 | Cloud Run は「コンテナが stdout に書く、以上」。1行JSONにすればフィールド検索・severityフィルタが効く | 正しい | https://docs.cloud.google.com/run/docs/logging | 自動収集 + `severity` 抽出 + `jsonPayload` へのフィールド保持と整合 |
| 7 | L22 | 「ログ」タブ上部から「ログ エクスプローラで表示」でプロジェクト全体を横断検索できる | 正しい | https://docs.cloud.google.com/run/docs/logging | 公式に Logs Explorer への遷移とプロジェクト横断検索が記載。ボタンの日本語ラベルの文字列一致までは未検証 |
| 8 | L25 | `resource.type="cloud_run_revision"` | 正しい | https://docs.cloud.google.com/run/docs/logging | 公式: "`LogEntry.resource.type`: `cloud_run_revision`" |
| 9 | L26 | `resource.labels.service_name="handson-app"` | 正しい | https://docs.cloud.google.com/monitoring/api/resources | `cloud_run_revision` のラベルは `project_id` / `service_name` / `revision_name` / `location` / `configuration_name` |
| 10 | L27 | `jsonPayload.message="index accessed"` で絞り込める | 正しい(条件付き) | https://docs.cloud.google.com/logging/docs/structured-logging | `severity` は `jsonPayload` から取り除かれるが、`message` は他のフィールドが残る場合 `jsonPayload` に残る。該当ログは `instance` フィールドを持つため `jsonPayload.message` で検索可能。本文修正不要 |
| 11 | L30 | `jsonPayload.instance` など自分が入れたフィールドも検索条件に使える | 正しい | https://docs.cloud.google.com/logging/docs/structured-logging | 特別扱いされないフィールドは `jsonPayload` に残り、JSONパス指定で検索できる |
| 12 | L34-38 | 「指標」タブに リクエスト数 / レイテンシ / コンテナインスタンス数 / 課金対象インスタンス時間 / CPU・メモリ使用率 が最初から揃っている | 正しい | https://docs.cloud.google.com/run/docs/monitoring | 公式の自動収集メトリクス: "Billable container instance time, Container startup latency, Container CPU utilization, Container memory utilization, Sent bytes, Received bytes, Request count, Request latencies, Container instance count, Maximum concurrent requests"。コンソールに Metrics タブが存在することも公式に記載 |
| 13 | L35 | レイテンシは p50, p95, p99 で見られる | 未確認 | https://docs.cloud.google.com/run/docs/monitoring | 公式ドキュメントには "Request latencies" の記載のみで、パーセンタイル分割の明記を確認できなかった(コンソールUIの仕様のため)。憶測で断定しないため本文は変更していない |
| 14 | L40 | 6章のカナリア中に指標画面を見て昇格判断する / リビジョン別にメトリクスをフィルタできる | 未確認 | https://docs.cloud.google.com/monitoring/api/resources , https://docs.cloud.google.com/run/docs/monitoring | `cloud_run_revision` に `revision_name` ラベルがあるため Metrics Explorer 側でのリビジョン単位の絞り込みは可能。ただしコンソール「指標」タブ上のフィルタUIについては公式ドキュメントで確認できず。本文は変更していない |
| 15 | L44-46 | まとめ(ログ・メトリクスは「設定する」のではなく「最初からある」/ アプリ側は stdout に1行JSON) | 正しい | https://docs.cloud.google.com/run/docs/logging , https://docs.cloud.google.com/run/docs/monitoring | 自動収集の記述と整合 |

## 修正した箇所

なし(要修正判定は0件)。

## 実機確認が必要な残件

- コンソール「指標」タブのレイテンシチャートに p50/p95/p99 が表示されるか(#13)
- コンソール「指標」タブでリビジョン別フィルタができるか(#14)
- 「ログ エクスプローラで表示」ボタンの日本語ラベル(#7)
