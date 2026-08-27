# Fact-check: 06_traffic/README.md

**確認日**: 2026-08-19

検証方法: Google Cloud 公式ドキュメント(`docs.cloud.google.com`)および Google 公式 Codelab の突き合わせのみ。`gcloud` の実行は行っていない。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L5 | AWS では CodeDeploy のブルー/グリーン + ALB の加重ターゲットグループ + 検証用リスナーが必要だった | 要修正(一次情報確認) | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-bluegreen.html | **2026-08-19 T026 で確定**: `aws-comparisons.md` #1 が AWS 公式で「要修正(軽微)」と判定。検証用(test)リスナーは公式には**任意**(本番リスナーは必須)なので「必要」と書くと必須に読める。**本文修正は 2026-08-19 に適用済み**(現行 L5 は「検証用リスナーは任意ですが、リリース前検証をしたいなら実質必要になります」と弱形にしている) |
| 2 | L19-22 | `docker build -t ${IMAGE}:v3 .` / `docker push ${IMAGE}:v3` が Cloud Shell で実行できる | 正しい | https://docs.cloud.google.com/shell/docs/how-cloud-shell-works | Docker は Cloud Shell のプリインストールツールに含まれる。修正不要 |
| 3 | L26 | `--no-traffic` を付けるとリビジョンは作られるがトラフィックは流れない | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy | 公式: "True to avoid sending traffic to the revision being deployed. Setting this flag assigns any traffic assigned to the LATEST revision to the specific revision bound to LATEST before the deployment." 直前の5章で `--to-latest` 済みのため、100%が v2 リビジョンへ固定される。「まだ赤(v2)のまま」も整合 |
| 4 | L26 | `--tag` を付けるとそのリビジョン専用のURLが発行される | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy , https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 公式: `--tag` = "Traffic tag to assign to the newly created revision."、タグ付きURLで直接テストできる旨も記載 |
| 5 | L29-34 | `gcloud run deploy handson-app --image ... --region ... --no-traffic --tag staging` の構文 | 正しい | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 公式手順の `gcloud run deploy myservice --image IMAGE_URL --no-traffic --tag TAG_NAME` と同型 |
| 6 | L36 | 出力に2つのURL(本番URLとタグ付きURL)が表示される | 要修正(実機で判明) | `live-main-path.md` #17 / #18(旧根拠: https://codelabs.developers.google.com/codelabs/cloud-run/revisions-cloud-run-traffic-splitting-gradual-rollout-rollbacks ) | **2026-08-19 T026 で判定を訂正**: ドキュメント照合時は Codelab の出力例から「正しい」としていたが、実機では**タグ付きURLの1つだけ**が表示された(`--no-traffic` のときは `Service URL:` の行が出ない)。`live-main-path.md` #17 の判定は「不一致(修正した)」で、06章 L36 を実測の見え方に修正済み。文言 `The revision can be reached directly at https://staging---...` と `serving 0 percent of traffic` は実機出力と一致(#18) |
| 7 | L38-39 | タグ付きURLは `https://staging---handson-app-xxxxx.a.run.app` の形 | 正しい | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 公式例 "https://green---myservice-abcdef.a.run.app" と同型(`TAG---` プレフィックス)。なお現行のURL仕様は決定的URL `https://[TAG---]SERVICE_NAME-PROJECT_NUMBER.REGION.run.app` と非決定的URL `https://[TAG---]SERVICE_IDENTIFIER.run.app` の2種で、新規サービスでは決定的URLが優先表示される(https://docs.cloud.google.com/run/docs/triggering/https-request)。`xxxxx` はプレースホルダなので誤りではないが、4章の表記と併せて別途統一を検討する余地あり。本章単独では修正しない |
| 8 | L41 | 本番と同じ環境・同じ設定でリリース前検証ができる | 正しい(補足あり) | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 同一サービス内の検証チャネルという説明は妥当。ただし公式には "If you have minimum instances configured at the service-level, traffic tags do not allocate minimum instances for tagged revisions." という例外がある。本教材は min-instances を設定していないため本文修正は不要 |
| 9 | L48-51 | `gcloud run services update-traffic handson-app --region ... --to-tags staging=10` で10%だけ流せる | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic | `--to-tags=[TAG=PERCENTAGE,…]` は現存。公式: "If under 100 percent of traffic is assigned, the service traffic is updated as specified to the given tags, and other traffic is scaled up or down proportionally." → 残り90%は既存の配分(v2)へ比例配分され、本文の「v2 90% / v3 10%」と整合 |
| 10 | L56 | `gcloud run services describe handson-app --region ... --format 'value(status.url)'` でURLが取れる | 正しい | https://docs.cloud.google.com/run/docs/managing/services , https://docs.cloud.google.com/run/docs/triggering/https-request | 公式ドキュメントでも `gcloud run services describe SERVICE --format 'value(status.url)'` が案内されている |
| 11 | L58 | `curl` と `jq` を使ったループが Cloud Shell で動く | 未確認 | https://docs.cloud.google.com/shell/docs/how-cloud-shell-works | Cloud Shell のプリインストール一覧に `jq` / `curl` は明記されていない(Debian標準ユーティリティとしての同梱は推測)。Google公式CodelabでもCloud Shell上で `jq` が使われているが、一次情報での明記を確認できなかったため未確認とする。本文は修正しない。**2026-08-19 T026: 未確認のまま残す(カテゴリA: Cloud Shell 固有)**。`live-main-path.md` #22 でこのループ自体は実際に動作し、集計結果が教材の予想(v2 18回 / v3 2回)と完全一致することを確認したが、実行環境は macOS(jq-1.7.1 / curl 8.7.1)であり Cloud Shell ではない |
| 12 | L61 | おおよそ `v2` が18回・`v3` が2回になる | 正しい(概算表現) | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic | 10%割当で20リクエストなら期待値は2回。実際の `sort \| uniq -c` の出力は `.message` の全文("Hello, Cloud Run v2!" など)だが、本文は「おおよそ」と明示しており誤りではない |
| 13 | L63 | 実務ではエラーレート・レイテンシを監視して段階的に増やす | 正しい | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 段階的ロールアウトの想定用途として公式ドキュメントと整合 |
| 14 | L67-71 | `gcloud run services update-traffic handson-app --region ... --to-latest` で100%昇格できる | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic | `--to-latest` は現存。v3 が最新リビジョンなので100%が v3 へ移る |
| 15 | L65-73(旧) | `--to-latest` の意味の説明 | 要修正 | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic | 公式: "True to assign 100 percent of traffic to the 'latest' revision of this service. Note that when a new revision is created, it will become the 'latest' and traffic will be directed to it." 本文には意味の説明がなく「v3 に固定される」と誤解されうるため、`LATEST` への割当であり以後のデプロイが自動で100%を受け取る点を補足する1文(引用ブロック)を追加した |
| 16 | L73 | v3 に問題があれば前章の通り v2 に一瞬で戻せる | 正しい | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | `update-traffic --to-revisions` によるロールバックは公式手順どおり |
| 17 | L77-79 | まとめ(`--no-traffic` + `--tag` でデプロイとリリースを分離、追加インフラなしでカナリア〜ロールバック) | 正しい | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 公式のロールアウト/ロールバック機能の説明と整合 |

## 修正した箇所

- L65 付近: `--to-latest` が `LATEST` への100%割当であること、以後のデプロイが自動で100%トラフィックを受け取ることを説明する引用ブロックを追加(#15)。

## 実機確認が必要な残件(2026-08-19 T026 で棚卸し)

解決済み:

- `gcloud run deploy --no-traffic --tag staging` の実際の出力(#6)→ **解決**。`live-main-path.md` #17 でタグ付きURLの1つだけが出ることが判明し、本文を修正済み
- 参加者の環境で表示されるサービスURLの形式(#7)→ **解決**。`live-main-path.md` #7 / #8 で、`run deploy` の出力と既定書式の `describe` は決定的URL(`handson-app-113111026602.asia-northeast1.run.app`)、`describe --format 'value(status.url)'` は旧形式(`handson-app-nv5rboaedq-an.a.run.app`)を返すことを実測。どちらも 200 を返す。4章 L75 に両形式が有効である旨を追記済み(#10 の `value(status.url)` 自体は動作する)
- カナリア時の Traffic 欄の表示(#9 の周辺)→ `live-main-path.md` #21 / #23 で実表示が判明し、06章 L70 / L85 を修正済み
- 20回集計の結果(#12)→ **解決**。`live-main-path.md` #22 で v2 18回 / v3 2回と教材の予想に完全一致

未解決(実機検証でも埋まらなかったもの):

- Cloud Shell に `jq` が存在するか(#11)— カテゴリA: Cloud Shell 固有。検証環境は macOS だったため原理的に未確認
