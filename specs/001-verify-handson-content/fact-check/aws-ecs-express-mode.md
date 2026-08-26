# Fact-check: AWS App Runner の提供終了と Amazon ECS Express Mode

**確認日**: 2026-08-25

**背景**: `01_aws_and_googlecloud` のサービス対応表と `03_cloudrun` の比較表は、いずれも App Runner を Cloud Run の対応サービスとして扱っていた。App Runner が新規顧客への提供を終了し、AWS が後継として ECS Express Mode を案内していることが判明したため、両章の AWS 側代表サービスを差し替える必要が生じた。本フラグメントはその判断根拠を一次情報で記録するもの。

**位置づけ**: 1章と3章の両方から参照されるため、章別フラグメントには置かず、`aws-comparisons.md` と同じ「章をまたぐ AWS 記述の受け皿」として独立させた。`aws-comparisons.md` 自体は「他章に散らばる AWS 言及」をスコープと宣言しており、比較表そのものを対象とする本件は対象外のため分離した。

**検証方法**: AWS 公式ドキュメント(`docs.aws.amazon.com`)および What's New(`aws.amazon.com/about-aws/whats-new`)のみを一次情報として照合した。`research/deep-research-report.md` は本フラグメントの根拠に使用していない(同レポートは ECS Express Mode に言及していない)。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | `01_aws_and_googlecloud/README.md` 対応表 Cloud Run行 / `03_cloudrun/README.md` 比較表 App Runner列 | App Runner は現行の選択肢として並置してよい | 要修正 | https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html | 「we decided to close AWS App Runner to new customers. Existing AWS App Runner customers can continue to use the service as normal... but we do not plan to introduce new features」。新規顧客は利用できないため、現行の選択肢として無条件に並置すると読者を誤らせる |
| 2 | 同上 | AWS は App Runner の後継として ECS Express Mode への移行を案内している | 正しい | https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html | 「We recommend that customers explore Amazon ECS Express Mode when migrating from AWS App Runner」。1章の対応表の Cloud Run 行を「ECS Express Mode + ECS on Fargate + Lambda」へ変更する根拠 |
| 3 | `01_aws_and_googlecloud/README.md` 注記 | ECS Express Mode は GA であり、ECS / Fargate が使える全リージョンで利用できる | 正しい | https://aws.amazon.com/about-aws/whats-new/2025/11/announcing-amazon-ecs-express-mode/ | 2025-11-21 の What's New で発表。プレビューではないため教材で扱える成熟度と判断した |
| 4 | 同上 | 1回の API 呼び出しで10種類のリソースが自動作成される | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | 公式の列挙は次のとおり。ECS既定クラスタ(Fargate capacity providers付き)/ タスク定義 / サービス(カナリアデプロイとオートスケール付き)/ ALB(HTTPSリスナー・リスナールール・ターゲットグループ)/ セキュリティグループ / サービスリンクロール / Application Auto Scaling のスケーラブルターゲットとポリシー / ロググループ / 不良デプロイ検知用メトリクスアラーム / ACM証明書 |
| 5 | 同上 | 利用者が用意するのはコンテナイメージと IAM ロール2つ | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-getting-started.html | 「an Express Mode service requires only a container image, task execution role and infrastructure role to get started」。管理ポリシーは `AmazonECSTaskExecutionRolePolicy` と `AmazonECSInfrastructureRoleforExpressGatewayServices` |
| 6 | 同上 | 既定URLは HTTPS で、TLS証明書の設定は不要 | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-getting-started.html | URL 形式は `https://<service-name>.ecs.<region>.on.aws/`。「Automatic SSL/TLS termination」と明記。ACM 証明書は #4 のとおり自動作成される。ALB リスナーの既定は `protocol: https` / `port: 443` |
| 7 | 同上 | 前提としてパブリックサブネットを持つ既定VPCが必要 | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | 「The default VPC must have at least two public subnets, in at least two availability zones, with at least 8 free IPs available, per assigned CIDR block, per subnet」。プライベートサブネットを指定した場合は internal ALB になり、NAT ゲートウェイの用意は利用者の責任 |
| 8 | 同上 | オートスケールの既定は CPU使用率60%目標・最小1タスク・最大20タスク | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | `autoScalingTargetValue: 60` / `autoScalingMetric: "CPUUtilization"` / `desiredMinTaskCount: 1` / `desiredMaxTaskCount: 20`。指標は CPU使用率・メモリ使用率・ターゲットあたりリクエスト数から選択可(後者は ALB 由来で最大 65536 req/s) |
| 9 | 同上 | ログは設定不要で CloudWatch Logs へ出力される | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | ロググループは `/aws/ecs/<cluster>/<name>-####` 形式で自動作成。`logDriver: "awslogs"` が既定 |
| 10 | 同上 | ALB の設定とデプロイ戦略は Express Mode の API から変更できない | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | 「Note that load balancer configurations can not be updated on Express Mode services」「Note that deployment strategy can not be updated on Express Mode services」。抽象化が漏れている箇所として、軸を運用面へ移す根拠になる |
| 11 | 同上 | 独自ドメインは Express Mode の API 外で ALB を直接編集する | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-advanced-customization.html | 自分で用意した ACM 証明書を ALB の HTTPS リスナーへ追加し、リスナールールに Host ヘッダー条件を OR で足す。DNS は Route 53 なら ALB への Alias、他社DNSなら ALB の DNS 名への CNAME |
| 12 | 同上 | VPC 内で最初に作った Express Mode サービスが、その VPC の ALB の構成を決める | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | 「the first Express Mode service for a VPC defines the subnets associated with either the internet-facing or internal load balancer for that VPC. Subsequent Express Mode services that launch in the same VPC must have subnets that match the availability zones supported by the load balancer」。順序依存の制約であり、2つ目のサービスを作る前に理解が必要 |
| 13 | 同上 | ALB は最大25の Express Mode サービスで共有される | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | 「Up to 25 Express Mode services in the same VPC can share an Application Load Balancer」。共有リソースであるため、リスナールールの変更は他サービスへ影響しうる |
| 14 | 同上 | レビューが必要な既定値がある(ALBアクセスログ無効・desync緩和無効・タスクへのパブリックIP付与) | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | `access-logs.enabled: false` / `desync-mitigation-mode: Off` / パブリックサブネットでは `assignPublicIp` 有効(「we enable public IPs on each task by default」)。組織のガードレールに触れうる項目が既定で入っている |
| 15 | 同上 | Express Mode 自体に追加料金はない | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-overview.html | 「There is no additional charge for using an Amazon ECS Express Mode service. You pay only for the underlying AWS resources」。課金対象は Fargate コンピュート / ALB / CloudWatch ログとメトリクス / データ転送 |
| 16 | 同上 | 最小タスク数を0に設定でき、アイドル時に課金されない | 未確認 | https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_CreateExpressGatewayService.html | 開発者ガイドも API リファレンスも `scalingTarget.minTaskCount` の下限を明記していない。既定値が1であることは #8 で確認済み。**本文には「既定は最小1タスク」までを書き、「0にできない」とは書かない** |
| 17 | 同上 | カナリアデプロイで任意の比率を指定でき、比率ごとのURLを共有できる | 未確認 | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html | サービスの既定が `deploymentConfiguration: Canary by default` であることは確認できたが、比率指定の粒度とタグ付きURL相当の有無は記載を見つけられなかった。**Cloud Run のトラフィック分割と同等かどうかを本文で断定しない** |
| 18 | 同上 | Fargate / ALB の具体的な単価 | 未確認 | https://aws.amazon.com/ecs/pricing/ | ECS の料金ページに Express Mode 固有の記載はない。基盤リソースの単価は改定され得るため、教材では数値を持たない方針(spec.md Assumptions)。**コスト比較の数値は本文に書かない** |

## 集計

- 正しい: 14件 / 要修正: 1件 / 未確認: 3件(計18件)
- 未確認3件はいずれも「AWS の一次情報が可否・数値を明記していない」という同一原因。`fact-check-log.md` §6.3 のカテゴリE として起票した

## 本文で使ってよい表現 / 使ってはいけない表現

未確認項目を確認済みに見せないための歯止めとして明示する。

| 書ける | 書けない |
|---|---|
| 「既定は最小1タスク」 | 「ゼロスケールできない」「アイドル時も必ず課金される」 |
| 「Express Mode 自体に追加料金はない」 | 「Cloud Run より安い / 高い」 |
| 「カナリアデプロイが既定で有効」 | 「Cloud Run と同じようにトラフィックを任意比率で分割できる / できない」 |
| 「ALB と最小1タスクは動き続ける」 | 具体的な月額・時間単価 |

## 本文への適用

- `01_aws_and_googlecloud/README.md`: 対応表 Cloud Run 行を「ECS Express Mode + ECS on Fargate + Lambda」へ変更(#1 / #2)。`### 注記: 1コマンドで立つ経路は AWS にもある` を新設し #3〜#15 を根拠として記述。#16〜#18 は本文に書かない
- `03_cloudrun/README.md`: **未適用(後続の変更で行う)。** 比較表の App Runner 列に脚注マーカーを付け、脚注で #1 / #2 を説明する。既定値・上限値は改定耐性のため3章本文には書かない。適用までは、1章が App Runner を提供終了と書き3章が現役の比較列として扱う食い違いが残る
