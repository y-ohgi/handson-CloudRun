# Fact-check: 各章に散在する AWS 側の比較記述

**確認日**: 2026-08-19

**背景**: 各章の検証担当は Google Cloud 公式ドキュメントとの突き合わせを担当範囲としたため、AWS 側の記述は「AWS比較の検証タスクへ委ねる」として判定を保留していた。`01_aws_and_googlecloud` の比較表は別途検証済みだが、他章に散らばる AWS 言及は未検証のまま残っていた。本フラグメントはその穴を埋めるもの。

**検証方法**: AWS 公式ドキュメント(`docs.aws.amazon.com`、`aws.amazon.com/about-aws/whats-new`)を一次情報として照合。2025〜2026年の仕様変更(Lambda Managed Instances、Lambda Function URLs、App Runner の request timeout、AWS CloudShell のエディタ追加、Aurora DSQL の GA)に注意して判定した。

## 判定表

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | 06_traffic L5 | ECS でやるには CodeDeploy のブルー/グリーン + ALB の加重ターゲットグループ、検証用リスナーの設定が必要だった | 要修正(軽微) | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-bluegreen.html | 検証用(test)リスナーは公式には**任意**。本番リスナーは必須。「必要」と書くと必須に読めるため弱形にする |
| 2 | 05_revision L43 | ECS のタスク定義リビジョンに似ているが、Cloud Run はタスク定義+ALB加重ルーティング+デプロイ履歴が1概念 | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-bluegreen.html | 変更なし。ECS ではトラフィック制御が別レイヤーに分離されているという対比は妥当 |
| 3 | 05_revision L49 | AWS なら前のタスク定義を指定してサービス更新、デプロイを待つので数分かかる | 正しい(限定を加える余地あり) | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-service-rolling-update.html | 標準のローリングデプロイでは正しい。6章で CodeDeploy ブルー/グリーンに言及しているため、「CodeDeploy を組んでいなければ」と限定すると章間の整合が良くなる(任意) |
| 4 | 07_scaling L18 | ECS のように CloudWatch アラーム+スケーリングポリシーを組む必要はなく、設定不要で最初から動いている | **要修正** | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-autoscaling-targettracking.html | ターゲット追跡ポリシーでは CloudWatch アラームを **AWS 側が自動作成・管理する**("Amazon ECS Service Auto Scaling creates and manages the CloudWatch alarms")。「アラームを自分で組む」は実務の認識と矛盾する。ただしポリシー登録自体は必須なので、Cloud Run の「設定不要」との対比は成立する |
| 5 | 07_scaling L16 | 標準の Lambda(1リクエスト=1環境)と違い、1台で複数リクエストを捌く | 正しい | https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html | 変更なし。「標準の」という限定が既にあり適切。Lambda Managed Instances の例外は 03_cloudrun で別途言及済み |
| 6 | 07_scaling min-instances の節 | Lambda の Provisioned Concurrency と ECS の常駐、両方の選択肢が1サービスに入っている | 正しい | https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html | 変更なし |
| 7 | 08_observability L18 | CloudWatch Logs へ送るには awslogs ログドライバやロググループの設定、IAM 権限が必要だった | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html | 変更なし。logConfiguration と logs:CreateLogStream / logs:PutLogEvents が実際に必要 |
| 8 | 09_source_deploy L37 | App Runner のソースデプロイに相当する | 正しい | https://docs.aws.amazon.com/apprunner/latest/dg/service-source-code.html | 変更なし。App Runner はソースコードリポジトリからのビルド・デプロイを公式サポート |
| 9 | 04_deploy L29 | `aws ecr get-login-password` に相当。こちらは push のたびにトークンを取り直す必要がない | 正しい(補足の余地あり) | https://docs.aws.amazon.com/AmazonECR/latest/userguide/registry_auth.html | ECR のトークンは有効期限12時間で再実行が必要という対比は正確。ただし AWS にも `docker-credential-ecr-login` という永続ヘルパーが存在するため、厳密には単純化されている(任意) |
| 10 | 10_advanced/jobs.md L18 | タスクあたり最大7日間。Lambda の15分と比べて使える場面が広い | 正しい | https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html | 変更なし。標準 Lambda の上限は900秒(15分)のまま |
| 11 | 10_advanced/jobs.md L5 | ECS の RunTask、AWS Batch、(15分制限がなければ)Lambda あたりの守備範囲 | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_RunTask.html | 変更なし。公式の1対1対応表は存在しないが妥当なアナロジー |
| 12 | 10_advanced/pubsub.md L7 | AWS なら SNS + SQS + Lambda。Lambda は専用ハンドラシグネチャ、SQS はポーリング設定やバッチサイズ調整が必要だった | 正しい | https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html | 変更なし。SNS→SQS ファンアウトは AWS 公式が明記する定番パターン |
| 13 | 10_advanced/pubsub.md L38 | SQSキューの作成、イベントソースマッピング、IAMロール、バッチ設定に相当する作業はない | 正しい | https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-configure.html | 変更なし。SQS+Lambda 連携には実際にこれら4つが必要 |

## 集計

- 正しい: 12件
- 要修正: 1件(#4。#1 と #3・#9 は軽微・任意)
- 未確認: 0件

## 深掘りしていない箇所(申し送り)

比較対象が本文から一意に定まらないため判定を保留した。

- `10_advanced/pubsub.md` L75「ALB の内部リスナーやセキュリティグループの代わりに、IAM で『誰が呼べるか』を制御するイメージ」
- `04_deploy/README.md` L65「デフォルトはAWSと逆」— どのAWSサービスの既定値との比較か本文から特定できない

## 適用状況

#4 と #1 の本文修正は 2026-08-19 に適用済み。実機検証エージェントが同じファイルを編集中だったため、そのマージ完了を待ってから反映した。#3 と #9 は誤りではなく厳密性の補足に留まるため、今回のスコープ(事実の誤りの修正)外として見送った。
