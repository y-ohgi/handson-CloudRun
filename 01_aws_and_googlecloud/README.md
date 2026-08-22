# 1. AWSとGoogle Cloudの考え方の違い

## ビルディングブロック vs SaaS的アプローチ

AWS の思想は**ビルディングブロック**です。  
VPC・サブネット・セキュリティグループ・IAMロール・ALB・ターゲットグループ……小さな部品を積み上げて、自分のアーキテクチャを組み立てます。  
自由度が高い一方で、「Webアプリを1つ公開する」だけでも組み立てる部品の数は多くなります。

Google Cloud のマネージドサービスは、どちらかというと **SaaS 的なアプローチ**です。  
「Webアプリを公開したい」という目的に対して、統合済みのサービスが1つ用意されていて、デフォルトで実用的な設定になっています。  
部品を組む代わりに、完成品の設定を必要な分だけ調整します。

この違いが一番わかりやすいのが、今回扱う Cloud Run です。  
まずは「コンテナを1つ、HTTPSで公開するまで」に必要なものを並べて見比べてみましょう。

### 例: コンテナを1つ、HTTPSで公開するまで

| | AWS (ECS on Fargate + ALB) | Google Cloud (Cloud Run) |
|---|---|---|
| ネットワーク | VPC・サブネット・SG を用意 | 不要(必要なら後から VPC 接続) |
| 負荷分散 | ALB + ターゲットグループ + リスナー | 不要(組み込み) |
| TLS証明書 | ACM で発行し ALB に紐付け | 不要(`*.run.app` のHTTPS URLが自動発行) |
| オートスケール | Application Auto Scaling を設定 | デフォルトで有効(0台〜既定100台) |
| ログ | awslogs ドライバや FireLens を設定 | 不要(stdout が自動で Cloud Logging へ) |
| デプロイ | タスク定義 + サービス更新 | `gcloud run deploy` 1コマンド |

どちらが優れているという話ではありません。  
細かく制御したいなら AWS 的なアプローチが強く、素早く価値を出したいなら Google Cloud 的なアプローチが強い。  
両方の目線を持っていると、状況に応じて最適な選択ができる——それが今日のゴールです。

> **[要作図] 図1: 消える意思決定の数**
>
> - **目的:** 教材全体の主題である「ビルディングブロック vs SaaS的アプローチ」を、部品の個数の差として一目で見せる。この図がこの教材でいちばん重要
> - **左(AWS):** VPC → サブネット → セキュリティグループ → ECS クラスタ → タスク定義 → Fargate → ALB → リスナー → ターゲットグループ → ACM → Application Auto Scaling を、線でつないだ構成図として描く。**箱の多さそのものがメッセージ**
> - **右(Cloud Run):** 箱は「Cloud Run サービス」1つだけ。そこから `*.run.app` の HTTPS URL が出ている。左で描いた箱のうち消えたものを薄いグレーの点線で重ねて「プラットフォーム側に移った」と示すと対比が効く
> - **注意:** 「Google Cloud のほうが優れている」と読ませない。「自由度をプラットフォームへ渡した結果」という趣旨の一文を**画像の中に**入れるとトレードオフとして読める(Markdown 側にキャプション文は置かない)
> - **完成後の扱い:** `01_aws_and_googlecloud/imgs/aws-vs-cloudrun-building-blocks.png` として保存し、**見出しの直下**に `![AWSとCloud Runで必要になる構成要素の比較](imgs/aws-vs-cloudrun-building-blocks.png)` として差し込む(見出し → 画像 → 本文の順。キャプション文は付けない)
> - **依存:** 8章の図8 も同じ左右配置(左=AWS、右=Cloud Run)と配色を使います。**図1 の左右の配置と配色を先に確定させてください**

## アカウント構造の違い

| 概念 | AWS | Google Cloud |
|---|---|---|
| 分離の単位 | アカウント(Organizations の OU で階層化) | **プロジェクト**(組織 > フォルダ > プロジェクトの階層。フォルダは任意) |
| リージョンの扱い | コンソールでリージョンを切り替える | リソース作成時に指定(コンソールは全リージョン横断) |
| 権限の主体 | IAMユーザー / ロール | Google アカウント / **サービスアカウント** |
| API | 常に有効 | プロジェクトごとに**明示的に有効化** |

特に「プロジェクト」は Google Cloud を触るうえで最初に慣れておきたい概念です。  
dev / staging / prod をプロジェクトで分ける、実験用に使い捨てプロジェクトを作る、といった運用が気軽にできます。

## サービス対応表

ハンズオン中に「AWSでいうと何?」と思ったら、ここに戻ってきましょう。

### 今日使うサービス

| Google Cloud | AWSでいうと | 補足 |
|---|---|---|
| **Cloud Run** | App Runner + ECS on Fargate + Lambda | どれとも微妙に違う。次章で詳しく |
| **Artifact Registry (GAR)** | ECR | コンテナ以外(npm, Maven等)も置ける |
| **Cloud Shell** | CloudShell | エディタ付き・Docker が動く(AWS CloudShell も同様。ただし Docker は対応リージョン限定) |
| **Cloud Build** | CodeBuild | ソースデプロイの裏側で動く |
| **Cloud Logging** | CloudWatch Logs | 設定不要で stdout を収集 |
| **Cloud Monitoring** | CloudWatch | メトリクスはデフォルトで収集済み |
| **Pub/Sub** | SNS + SQS | 1サービスで pub/sub もキューも担う |

### 今日は使わないが対応を知っておくと便利なサービス

| Google Cloud | AWSでいうと | 補足 |
|---|---|---|
| Compute Engine | EC2 | |
| GKE | EKS | Kubernetes 発祥の地だけあり完成度が高い |
| Cloud Run functions(旧 Cloud Functions) | Lambda | 現在は Cloud Run 基盤に統合され、名称も Cloud Run functions へ |
| Cloud Storage | S3 | |
| Cloud SQL | RDS | |
| Spanner | Aurora DSQL(2025年5月GA) | グローバル分散RDB。強整合な分散SQLという点で近い |
| BigQuery | Redshift + Athena | Google Cloud 最大の看板サービス |
| Eventarc | EventBridge | 各サービスのイベントを Cloud Run へ配送 |
| Cloud Tasks | SQS(遅延キュー用途) | HTTPターゲットに直接push |
| Cloud Scheduler | EventBridge Scheduler | cron |
| Secret Manager | Secrets Manager | |
| Cloud Load Balancing | ALB/NLB + CloudFront の一部 | グローバル単一エニーキャストIP |
| IAM サービスアカウント | IAM ロール | 「アカウント」だが実体はロールに近い |

## まとめ

- AWS は部品を組み立てる。Google Cloud は完成品を調整する
- 分離単位は「アカウント」ではなく「プロジェクト」
- 対応表は読み替えの入口。ただし思想が違うので1対1にはならない——それを体感するのがこの後のハンズオン
