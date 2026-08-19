# Fact-check: 01_aws_and_googlecloud/README.md

**確認日**: 2026-08-19

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | 「ビルディングブロック vs SaaS的アプローチ」本文 | AWS はVPC・サブネット・SG・IAMロール・ALB・ターゲットグループといった小さな部品を積み上げる思想 | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html | 変更なし(ALB・ターゲットグループ・リスナーの構成要素が公式手順どおり必要である点を確認) |
| 2 | 比較表 表頭 | AWS側の比較対象名を「ECS/Fargate」と表記 | 要修正 | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html | Fargateは ECS のcompute optionであり Cloud Run と同格のサービスではないため、表頭を「AWS (ECS on Fargate + ALB)」へ変更。03_cloudrun の表記とも一致させた |
| 3 | 比較表 ネットワーク行 | AWS: VPC・サブネット・SG を用意 / Cloud Run: 不要(必要なら後から VPC 接続) | 正しい | https://docs.cloud.google.com/run/docs/securing/ingress | 変更なし(Cloud Run はVPCなしで既定ingressのまま公開でき、VPCは任意という記載を確認) |
| 4 | 比較表 負荷分散行 | AWS: ALB + ターゲットグループ + リスナー / Cloud Run: 不要(組み込み) | 正しい | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html | 変更なし(ALBはリスナーとターゲットグループの構成が前提と公式に記載) |
| 5 | 比較表 TLS証明書行 | AWS: ACM で発行し ALB に紐付け | 正しい | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html | 変更なし(「To create an HTTPS listener, you must deploy at least one SSL server certificate」、証明書の選択元として From ACM が明記) |
| 6 | 比較表 TLS証明書行 | Cloud Run: `*.run.app` のHTTPS URLが自動発行 | 正しい | https://docs.cloud.google.com/run/docs/securing/ingress | 変更なし(既定の `run.app` URL がingress pathとして既定で存在) |
| 7 | 比較表 オートスケール行 | AWS: Application Auto Scaling を設定 | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html | 変更なし(「Amazon ECS leverages the Application Auto Scaling service to provide this functionality」) |
| 8 | 比較表 オートスケール行 | Cloud Run: デフォルトで有効(0〜自動) | 要修正 | https://docs.cloud.google.com/run/docs/configuring/max-instances | 「0〜自動」は上限がないと読めるため「0台〜既定100台」へ変更(「By default, Cloud Run sets 100 instances for each revision」)。scale-to-zero が既定であることは https://docs.cloud.google.com/run/docs/about-instance-autoscaling で確認 |
| 9 | 比較表 ログ行 | AWS: awslogs ドライバや FireLens を設定 / Cloud Run: stdout が自動で Cloud Logging へ | 正しい | https://docs.cloud.google.com/run/docs/logging | 変更なし(「they will be picked up automatically by Cloud Logging so long as the logs are written to ... stdout or stderr」) |
| 10 | 比較表 デプロイ行 | AWS: タスク定義 + サービス更新 / Cloud Run: `gcloud run deploy` 1コマンド | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 変更なし |
| 11 | アカウント構造の違い 分離の単位 | AWS: アカウント(Organizationsで束ねる) | 要修正 | https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html | Google Cloud のフォルダに対応する概念がOUであることを読者が対比できるよう「Organizations の OU で階層化」へ変更(「An OU can also contain other OUs enabling you to create a hierarchy」) |
| 12 | アカウント構造の違い 分離の単位 | Google Cloud: プロジェクト(組織の下に複数作る) | 要修正 | https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy | フォルダ層の記載が欠けていたため「組織 > フォルダ > プロジェクトの階層。フォルダは任意」へ変更(「Folder resources are an optional grouping mechanism between organization resources and project resources」「The project resource is the fundamental organizing entity」) |
| 13 | アカウント構造の違い リージョンの扱い | AWS はコンソールでリージョンを切り替える / Google Cloud はリソース作成時に指定しコンソールは全リージョン横断 | 未確認 | - | 一次情報で「コンソールが全リージョン横断」と断定する記述を見つけられなかった。ただし Cloud Run など主要サービスの一覧画面が全リージョンのリソースを表示するのは事実であり、教材上の表現として過大でないと判断し変更しない |
| 14 | アカウント構造の違い 権限の主体 | AWS: IAMユーザー / ロール、Google Cloud: Google アカウント / サービスアカウント | 正しい | https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html | 変更なし(AWS側は「an IAM user with long-term credentials or an IAM role with short-term credentials」と明記) |
| 15 | アカウント構造の違い API | AWS: 常に有効 / Google Cloud: プロジェクトごとに明示的に有効化 | 正しい | https://docs.cloud.google.com/apis/docs/getting-started | 変更なし(「To use a Google Cloud API that is not enabled by default, you must enable it for your project」)。なおAWSにもリージョンのopt-inや一部サービスの有効化操作は存在するが、対比としての粒度では誤りではないと判断 |
| 16 | 今日使うサービス Cloud Run行 | Cloud Run ≒ App Runner + Fargate + Lambda | 要修正 | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html | #2 と同じ理由で「App Runner + ECS on Fargate + Lambda」へ変更 |
| 17 | 今日使うサービス Artifact Registry行 | Artifact Registry ≒ ECR。コンテナ以外(npm, Maven等)も置ける | 正しい | https://docs.cloud.google.com/artifact-registry/docs/supported-formats | 変更なし(npm / Maven / Python / Go / apt / yum / Docker・OCI / Kubeflow / Generic をサポート) |
| 18 | 今日使うサービス Cloud Shell行 | Cloud Shell ≒ CloudShell。エディタ付き・Docker が動く | 要修正 | https://docs.aws.amazon.com/cloudshell/latest/userguide/vm-specs.html | AWS CloudShell も Docker(pre-installed software に記載)と `edit` ビジュアルエディタを備えるため、Google Cloud Shell 固有の差別化と誤読されないよう「(AWS CloudShell も同等)」を追記。Google Cloud Shell 側のエディタ・Docker同梱は https://docs.cloud.google.com/shell/docs/features で確認 |
| 19 | 今日使うサービス Cloud Build行 | Cloud Build ≒ CodeBuild。ソースデプロイの裏側で動く | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 変更なし(「This option uses Google Cloud's buildpacks and Cloud Build to automatically build container images from your source code」)。CodeBuild が現行のフルマネージドビルドサービスであることは https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html で確認(廃止告知なし) |
| 20 | 今日使うサービス Cloud Logging行 | Cloud Logging ≒ CloudWatch Logs。設定不要で stdout を収集 | 正しい | https://docs.cloud.google.com/run/docs/logging | 変更なし(#9 と同根拠) |
| 21 | 今日使うサービス Cloud Monitoring行 | Cloud Monitoring ≒ CloudWatch。メトリクスはデフォルトで収集済み | 正しい | https://docs.cloud.google.com/run/docs/monitoring | 変更なし(「Cloud Run is automatically integrated with Cloud Monitoring with no setup or configuration required」) |
| 22 | 今日使うサービス Pub/Sub行 | Pub/Sub ≒ SNS + SQS。1サービスで pub/sub もキューも担う | 正しい | https://docs.cloud.google.com/pubsub/docs/overview | 変更なし(push購読とpull購読の両方を持ち「as a queue to parallelize tasks」にも使える、dead-letter queue等のmessaging middleware機能も備えると明記) |
| 23 | 対応表 Compute Engine行 | Compute Engine ≒ EC2 | 正しい | https://docs.cloud.google.com/compute/docs/overview | 変更なし(いずれもIaaSの仮想マシン。一次情報での逐語的な対応記述はないが技術的位置づけとして妥当) |
| 24 | 対応表 GKE行 | GKE ≒ EKS。Kubernetes 発祥の地 | 正しい | https://kubernetes.io/docs/concepts/overview/ | 変更なし(「Google open sourced the Kubernetes project in 2014」)。「完成度が高い」は主観的評価であり事実主張として扱わない |
| 25 | 対応表 Cloud Functions行 | Cloud Functions (Cloud Run functions) ≒ Lambda。現在は Cloud Run 基盤に統合された | 要修正 | https://docs.cloud.google.com/functions/docs | 現行の正式名称が「Cloud Run functions」で新規作成は Cloud Run 経由が推奨のため、主表記を「Cloud Run functions(旧 Cloud Functions)」へ入れ替え、補足に名称変更を明記 |
| 26 | 対応表 Cloud Storage行 | Cloud Storage ≒ S3 | 正しい | https://docs.cloud.google.com/storage/docs/introduction | 変更なし(いずれもオブジェクトストレージ) |
| 27 | 対応表 Cloud SQL行 | Cloud SQL ≒ RDS | 正しい | https://docs.cloud.google.com/sql/docs/introduction | 変更なし(いずれもマネージドなMySQL/PostgreSQL/SQL Server) |
| 28 | 対応表 Spanner行 | Spanner に AWS の相当サービスはなし(強いて言えば Aurora) | 要修正 | https://aws.amazon.com/about-aws/whats-new/2025/05/amazon-aurora-dsql-generally-available/ | Aurora DSQL が2025年5月27日にGAし、active-activeでマルチリージョン強整合の分散SQLとして提供されているため「相当なし」は2026年時点で成立しない。「Aurora DSQL(2025年5月GA)」へ変更し、補足に「強整合な分散SQLという点で近い」を追記。Spanner側の位置づけは https://cloud.google.com/spanner/ で確認 |
| 29 | 対応表 BigQuery行 | BigQuery ≒ Redshift + Athena | 正しい | https://docs.cloud.google.com/bigquery/docs/introduction | 変更なし(サーバーレスなデータウェアハウス+アドホッククエリという位置づけの類比として妥当)。「Google Cloud 最大の看板サービス」は主観的評価 |
| 30 | 対応表 Eventarc行 | Eventarc ≒ EventBridge。各サービスのイベントを Cloud Run へ配送 | 正しい | https://docs.cloud.google.com/eventarc/docs/overview | 変更なし(Standard/Advanced いずれも Cloud Run services を配送先として明記)。なお2026年時点で Standard / Advanced の2エディション構成だが、本文の粒度では追記不要と判断 |
| 31 | 対応表 Cloud Tasks行 | Cloud Tasks ≒ SQS(遅延キュー用途)。HTTPターゲットに直接push | 正しい | https://docs.cloud.google.com/tasks/docs/dual-overview | 変更なし(「forwards the task request to the worker, located at any generic HTTP endpoint」「Schedule specific delivery times」)。ただしSQSの遅延キューは最大15分(https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-delay-queues.html)で、Cloud Tasks の予約可能期間の上限は一次情報で確認できなかった(未確認)。誤りではないため本文は変更しない |
| 32 | 対応表 Cloud Scheduler行 | Cloud Scheduler ≒ EventBridge Scheduler。cron | 正しい | https://docs.cloud.google.com/scheduler/docs/overview | 変更なし(Cloud Scheduler は「commonly known as cron jobs」、EventBridge Scheduler も「create schedules using cron and rate expressions」: https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html) |
| 33 | 対応表 Secret Manager行 | Secret Manager ≒ Secrets Manager | 正しい | https://docs.cloud.google.com/secret-manager/docs/overview | 変更なし |
| 34 | 対応表 Cloud Load Balancing行 | Cloud Load Balancing ≒ ALB/NLB + CloudFront の一部。グローバル単一エニーキャストIP | 正しい | https://docs.cloud.google.com/load-balancing/docs/https | 変更なし(Premium Tier のグローバル外部Application Load Balancer が「Global Anycast external IP addresses」を持つと記載) |
| 35 | 対応表 IAM サービスアカウント行 | サービスアカウント ≒ IAM ロール。「アカウント」だが実体はロールに近い | 正しい | https://docs.cloud.google.com/iam/docs/service-account-overview | 変更なし(ワークロードに紐づく非人間のprincipalという点で IAM ロールとの類比は妥当。厳密には principal かつ resource である点は教材の粒度では追記不要と判断) |
| 36 | まとめ | AWS は部品を組み立てる / Google Cloud は完成品を調整する、分離単位はプロジェクト、対応表は1対1にならない | 正しい | https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy | 変更なし(本文の各主張と整合) |

## `research/deep-research-report.md`(二次情報)の指摘との突き合わせ

レポート「AWS比較表」節の指摘のうち、本章に適用されるものと適用されないものを切り分けた。いずれも一次情報で裏取りしたうえで判断している。

| レポートの指摘 | 本章への適用 | 判断 |
|---|---|---|
| Lambda「1リクエスト=1実行環境」に修飾が必要(Lambda Managed Instances) | 適用なし | 本章に Lambda の実行モデルに関する記述がない(03_cloudrun 側で既に対応済み) |
| Lambda「HTTPS URLにAPI Gatewayが必要」は誤り(Function URLs) | 適用なし | 本章に該当記述がない |
| App Runner「実行時間上限なし」は誤り(120秒) | 適用なし | 本章に App Runner の上限に関する記述がない |
| App Runner の課金表現(プロビジョンドメモリ常時課金) | 適用なし | 本章に App Runner の課金に関する記述がない |
| Fargate を Cloud Run と同格の比較対象に置くのは粒度が不適切 | **適用** | #2・#16 として対応。比較表の表頭と対応表の Cloud Run 行を「ECS on Fargate + ALB」ベースの表記へ変更 |
| 2025〜2026年の Cloud Run 新機能(Worker pools、GPU、Compose 等)の追加 | 適用なし | 今回のスコープ外(新機能を本文へ新規追加しない方針) |

## 03_cloudrun/README.md との整合性

| 観点 | 01 の記述 | 03 の記述 | 判定 |
|---|---|---|---|
| AWS側の比較対象名 | `AWS (ECS on Fargate + ALB)` / `App Runner + ECS on Fargate + Lambda` | `ECS on Fargate + ALB` | 一致(今回01側を03に合わせた) |
| Cloud Run の HTTPS URL | `*.run.app` のHTTPS URLが自動発行 | `○(自動発行)` | 一致 |
| Cloud Run の scale to zero | オートスケールはデフォルト有効(0台〜既定100台) | `スケールtoゼロ ○` | 一致 |
| Cloud Run と VPC | VPCは不要、必要なら後から接続 | `VPC 外(接続可)` | 一致 |
| Cloud Run functions | 現在は Cloud Run 基盤に統合、名称も Cloud Run functions | (言及なし) | 矛盾なし |

## 未確認として残した項目

- #13 「Google Cloud のコンソールは全リージョン横断」: 一次情報に該当する断定的記述を見つけられなかった。実挙動としては妥当だが、公式文書での裏取りができていない。
- #31 Cloud Tasks の `scheduleTime` の上限値: `creating-http-target-tasks` および `dual-overview` に上限の記載がなく、quotas ページを確認していない。本文はこの値に依存していないため影響なし。

## 事実誤りではないが報告する観察(本文は変更していない)

- `**Artifact Registry (GAR)**`: 「GAR」は Google 公式ドキュメントで使われている略称ではなく、コミュニティ由来の通称。技術的な誤りではないため今回は変更していないが、正式名称のみに揃える判断もありうる。
- 「分離の単位」欄の `組織 > フォルダ > プロジェクト`: 組織リソースは Cloud Identity / Workspace が前提で、個人アカウントでは組織を持たない単体プロジェクトも成立する。改訂前の「組織の下に複数作る」も同じ前提だったため後退ではないが、当日に個人アカウントを使う参加者がいる場合は口頭補足の余地がある。
