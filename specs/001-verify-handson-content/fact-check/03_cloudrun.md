# Fact-check: 03_cloudrun/README.md

**確認日**: 2026-08-19(#1〜#23)/ 2026-08-25(#24〜)

**対象タスク**: T005(「3つの実行モデル」節)/ T006(「料金感」節)/ T007(差分があれば本文修正)。加えて 2026-08-25 に、これまでフラグメント上に対応行を持っていなかった AWS 比較表の指摘 `A-06` / `A-08` と、App Runner の提供終了に伴う比較表の再構成を #24〜 として追加した(`fact-check-log.md` §6.4 確認項目2 のギャップに該当)。

**検証方法**: `research/deep-research-report.md`(ChatGPT製の二次情報)の指摘は根拠として採用せず、記載された出典URLをすべて自分で取得し、Google Cloud 公式ドキュメント(一次情報)の本文で裏を取った。`cloud.google.com` は `docs.cloud.google.com` へ 301 リダイレクトするため、リダイレクト後のURLで取得している。料金ページと release notes は WebFetch が本文を切り詰めるため、HTML を直接取得してテキスト化し、該当箇所を原文で確認した。

## 判定表

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | 3つの実行モデル(導入文) | Cloud Run には現在、3つの実行モデルがある | 正しい | https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 変更なし。公式は resource type として services / jobs / worker pools の3種を並列に列挙している。**2026-08-30: #30 により失効。第4のリソースタイプ Cloud Run instances が追加されたため、本文は4モデルへ更新した** |
| 2 | 3つの実行モデル(表) | サービス (Service) は HTTPリクエスト / イベント駆動 向け | 正しい | https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 変更なし。原文「Responds to HTTP requests sent to a unique and stable endpoint, using stateless instances that autoscale based on a variety of key metrics, also responds to events and functions」 |
| 3 | 3つの実行モデル(表) | ジョブ (Job) は実行して終わるバッチ処理向け | 正しい | https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 変更なし。原文「Executes parallelizable tasks that are executed manually, or on a schedule, and run to completion」 |
| 4 | 3つの実行モデル(表) | ワーカープール (Worker pool) は常駐してキューをpullし続ける処理向け | 正しい | https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 変更なし。原文「Handles always-on background workloads such as pull-based workloads, for example, Kafka consumers, Pub/Sub pull queues, or RabbitMQ consumers」 |
| 5 | 3つの実行モデル(表) | Worker pool は 2026年4月 GA | 正しい | https://docs.cloud.google.com/run/docs/release-notes | 変更なし。release notes の 2026年4月14日エントリに「Support for worker pools is in General Availability (GA)」とある |
| 6 | 3つの実行モデル(表) | AWS対応付け: サービス → App Runner / Lambda+ALB、ジョブ → ECS RunTask / AWS Batch、ワーカープール → SQSをポーリングするECS常駐ワーカー | 正しい | https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 変更なし。ベンダー公式の対応表は存在しないが、本文が「AWSでいうと」と明示したアナロジーであり、各実行モデルの意味論(常駐 / run-to-completion / pull型常駐)と矛盾しない |
| 7 | 3つの実行モデル(本文) | Kafka コンシューマや Pub/Sub の pull 型ワーカーのような「リクエスト起点でない常駐処理」も Worker pools で Cloud Run に乗る | 正しい | https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 変更なし。公式が Kafka consumers / Pub/Sub pull queues / RabbitMQ consumers を worker pools の例として明記 |
| 8 | 3つの実行モデル(本文) | Worker pool は HTTPエンドポイントを持たない常駐ワークロードである(本文が「リクエスト起点でない」と書いている前提) | 正しい | https://docs.cloud.google.com/run/docs/deploy-worker-pools | 変更なし。原文「Worker pools do not have a load balanced endpoint/URL」「specifically designed for performing continuous background work」 |
| 9 | 3つの実行モデル(本文) | 同じイメージ・同じ開発体験のまま実行モデルだけ選び替えられる | 正しい | https://docs.cloud.google.com/run/docs/deploy-worker-pools | 変更なし。3実行モデルいずれもデプロイ単位はコンテナイメージ(worker pool も「a reference to the container image」を指定してデプロイ)。定性的な評価表現であり、事実部分に誤りはない |
| 10 | 料金感 | 課金モデルは2種類から選ぶ | 正しい | https://docs.cloud.google.com/run/docs/configuring/billing-settings | 変更なし。原文「There are two billing settings in Cloud Run services」 |
| 11 | 料金感 | サービス作成後も切替可 | 正しい | https://docs.cloud.google.com/run/docs/configuring/billing-settings | 変更なし。原文「You can change the billing setting using the Google Cloud console, the gcloud CLI, or a YAML file when you create a new service or deploy a new revision」。Console 手順も「If you are configuring an existing service, click the service, then click Edit and deploy new revision」 |
| 12 | 料金感 | request-based billing がデフォルト | 正しい | https://docs.cloud.google.com/run/docs/configuring/billing-settings | 変更なし。原文「Request-based billing (default)」 |
| 13 | 料金感 | request-based はリクエスト処理中を中心に CPU・メモリが課金される | 正しい | https://docs.cloud.google.com/run/docs/configuring/billing-settings | 変更なし。原文「Cloud Run instances are only charged when they process requests, when they start, and when they shut down」 |
| 14 | 料金感 | request-based ではスケールtoゼロ時にインスタンス課金がなくなる | 正しい | https://docs.cloud.google.com/run/pricing | 変更なし。request-based の課金対象は処理中・起動・終了に限られ、料金表の脚注も「Idle instances that are not minimum instances are not charged」と明記 |
| 15 | 料金感 | request-based にも起動・終了処理や min-instances のアイドル時間などの課金例外がある | 正しい | https://docs.cloud.google.com/run/pricing | 変更なし。billing-settings が start / shut down も課金対象と明記し、料金表には request-based 用の「Idle time (Min instance)」単価(CPU $0.0000025/vCPU-second、Memory $0.0000025/GiB-second)が存在する |
| 16 | 料金感 | instance-based billing はインスタンス起動中は常時課金 | 正しい | https://docs.cloud.google.com/run/docs/configuring/billing-settings | 変更なし。原文「Cloud Run instances are charged for the entire lifecycle of instances, even when there are no incoming requests」 |
| 17 | 料金感 | instance-based の単価は request-based より安い | 正しい | https://cloud.google.com/run/pricing | 変更なし。Tier 1 の Default 単価は instance-based が CPU $0.000018/vCPU-second・Memory $0.000002/GiB-second、request-based の active time が CPU $0.000024/vCPU-second・Memory $0.0000025/GiB-second。いずれも instance-based が低い |
| 18 | 料金感 | instance-based は常時処理があるワークロード向け | 正しい | https://docs.cloud.google.com/run/docs/configuring/billing-settings | 変更なし。Recommender が「switching from request-based billing to instance-based billing, if this is cheaper」を推奨する設計であり、常時稼働で安くなる旨と整合。公式は加えて「short-lived background tasks and other asynchronous processing tasks」も用途に挙げるが、本文の記述と矛盾はしない |
| 19 | 料金感 | 無料枠も課金モデルごとにある | 正しい | https://cloud.google.com/run/pricing | 変更なし。料金ページは「Services (Instance-based billing)」と「Services (Requests-based billing)」で別々の Free tier を掲示している |
| 20 | 料金感 | request-based の無料枠: 月あたり vCPU 18万秒 / メモリ 36万GiB秒 / リクエスト200万件 | 正しい | https://cloud.google.com/run/pricing | 変更なし。原文「CPU - First 180,000 vCPU-seconds free per month」「RAM - First 360,000 GiB-seconds free per month」「Requests - 2 million requests free per month」 |
| 21 | 料金感 | instance-based の無料枠: 月あたり vCPU 24万秒 / メモリ 45万GiB秒(リクエスト無料枠の記載なし) | 正しい | https://cloud.google.com/run/pricing | 変更なし。原文「CPU - First 240,000 vCPU-seconds free per month」「RAM - First 450,000 GiB-seconds free per month」。instance-based の料金表にリクエスト課金行は存在しないため、本文がリクエスト無料枠を書いていないのは適切 |
| 22 | 料金感 | 単価・無料枠は改定されるので公式の料金ページが正(2026年8月時点と明記) | 正しい | https://cloud.google.com/run/pricing | 変更なし。確認時点の明記と公式ページへのリンクが既に併記されており、規約の要求を満たしている |
| 23 | 料金感 | 個人開発や社内ツールなら実質無料で運用できることが多い | 正しい | https://cloud.google.com/run/pricing | 変更なし。無料枠が請求先アカウント単位でプロジェクト横断に集計され毎月リセットされる(原文「The free tier usage is aggregated across projects by billing account and resets every month」)ため、小規模用途の記述として妥当。ただし定性的な見込みであり保証ではない |
| 24 | 「AWSでいうと何?」比較表 App Runner列 | App Runner を現行の比較対象として並置してよい | 要修正 | https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html | 新規顧客への提供が終了しているため、現行の選択肢として無条件に並置すると読者を誤らせる。列は残しつつ表頭に脚注マーカーを付け、脚注で提供終了と後継(ECS Express Mode)を明記する。列を残す理由は、120秒上限・スケールtoゼロ不可という値が「Cloud Run ≒ App Runner」という誤解を壊すための教材資産であり、削除すると本文の目的が根拠を失うため。詳細は `aws-ecs-express-mode.md` |
| 25 | 同表 脚注 | 後継の位置づけとして ECS Express Mode を注記に置ける | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-overview.html | 詳細は `aws-ecs-express-mode.md` に記録。3章本文には注記の粒度でのみ記載し、既定値・上限値は本文へ書かない(改定耐性のため)。実体が「ECS on Fargate + ALB」である点だけを述べる |
| 26 | 同表 HTTPS URL行(A-08) | 比較軸を「HTTPS URL」の ○ / 要ALB+ACM で示す | 要修正 | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-getting-started.html | ECS Express Mode の既定URLは HTTPS で ACM 証明書が自動発行されるため、○×では AWS / Google Cloud の差が表現できなくなった。軸を「運用で理解が必要なプロダクト数 / 壊れたときに開く画面の数」へ移す(A-08 の趣旨と一致。spec.md FR-013a / `fact-check-log.md` §7.1)。表のセル自体は FR-010 の保護対象のため変更せず、脚注と1章の新節で軸を移す |
| 27 | 同表 表頭(A-06) | 列名は「ECS on Fargate + ALB」でよい | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html | 変更なし。1章 #2 / #16 と表記が一致していることを確認した。A-06 は本行で初めてフラグメント上の対応行を持つ |
| 28 | 「AWSでいうと何?」比較表・脚注 | Express Mode を軸変更の根拠として使える | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | Express Mode は ALB・ターゲットグループ等を自動作成する一方、作成されたリソースは AWS 側の各コンソールに実在し、ALB 設定とデプロイ戦略は Express Mode の API から変更できない。「部品の数」ではなく「運用で開く画面の数」が軸として妥当であることの根拠 |
| 29 | 「Cloud Run の構成要素」節 | ハンズオンで触る概念は3つだけ | 正しい | https://docs.cloud.google.com/run/docs/resource-model | 変更なし。1章の新節「運用で向き合うプロダクトの数」と呼応させる一文を追加した(概念数の少なさが新軸の Google Cloud 側の実体であることを明示するため) |
| 30 | 「4つの実行モデル」節(導入文・表・まとめ) | Cloud Run の実行モデルは3つである | 要修正 | https://docs.cloud.google.com/run/docs/resource-model#resource-comparison 、https://docs.cloud.google.com/run/docs/release-notes | 2026-08-30 に再確認。公式の resource model 比較表は services / jobs / worker pools / **instances** の4種を並列に列挙しており、instances は 2026-08-25 付でリリースノートに Preview 掲載されている。本文の見出し・導入文・表・まとめ・「制約・向かないもの」を4モデルへ更新した。提供状況の詳細は `cloudrun-instances.md` を参照 |

## 確認したが本文に無い(参考・本文未追加)

規約により「既存記述の正確性修正のみ」とされているため、以下は確認したうえで本文へは追加していない。

- 無料枠は us-central1 価格を基準に、Tier 1 価格での spending based discount として適用される(原文「The free tier is applied as a spending based discount using Tier 1 pricing」)。本文は地域を主張していないため矛盾なし
- instance-based billing を選ぶ場合はメモリ 512MiB 以上が必要(billing-settings)
- Cloud Run jobs は常に instance-based billing(原文「Unlike Cloud Run services, all Cloud Run jobs have instance-based billing」)
- Worker pool は既定で手動スケーリング。Pub/Sub キュー量に基づく自動スケールは別途提供

## 集計

- 正しい: 27件
- 要修正: 3件
- 未確認: 0件

(2026-08-30 に実測で数え直した値。2026-08-19 時点の記載は23 / 0 / 0 だったが、2026-08-26 の App Runner 提供終了対応で #24〜#29 が、2026-08-30 に #30 が追加されており未反映だった)

内訳: 2026-08-19 の #1〜#23 が正しい23件、2026-08-25 追加の #24〜#29 が正しい4件 / 要修正2件、2026-08-30 追加の #30 が要修正1件。

## 本文への変更

**2026-08-19 時点: 変更なし。** T005・T006 で検証した「3つの実行モデル」節・「料金感」節の技術的主張23件はすべて公式ドキュメントと整合していたため、T007 の条件(差分が見つかった場合のみ修正)に該当せず、`03_cloudrun/README.md` は編集していない。

**2026-08-30 追記**: #30 により `03_cloudrun/README.md` を編集した。変更したのは (1) 見出し `## 3つの実行モデル` → `## 4つの実行モデル`、(2) 導入文の「3つ」「3分類」、(3) 実行モデル表への Instance 行の追加、(4) 表の直後への選び分けの軸とワーカープール/インスタンスの境目の段落、(5) 図2の作図指示の4分岐化、(6) 「制約・向かないもの」への Instance の追記、(7) 「まとめ」の実行モデルの列挙。**既存見出しの改名を1件行っている**ため、3章は SC-008 の文面(既存の見出しの文言に差分がない)を字義どおりには満たさなくなった。FR-013a の条件(1)からの逸脱として `fact-check-log.md` の 2026-08-30 追記に理由付きで記録している。図 `imgs/three-execution-models.svg` は3分岐のままで、差し替えは別タスク。

**2026-08-25 追記**: #24 / #26 により `03_cloudrun/README.md` を編集した。変更したのは (1) 比較表の App Runner 列への脚注マーカー、(2) 脚注 ※3 の追加、(3) 「AWSでいうと何?」冒頭の App Runner への言及、(4) 実行モデル表のサービス行の AWS 対応、(5) 図2の作図指示の目的文、(6) 「Cloud Run の構成要素」節と「まとめ」への1文追加。**見出し(`##` / `###`)は追加・削除・改名・並べ替えのいずれも行っていない**(spec.md SC-008)。比較表のセル(#16〜#23 の判定対象)は1つも変更していない(FR-010)。
