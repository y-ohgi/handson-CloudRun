# Fact-check: 各図が描画する事実

**確認日**: 2026-08-26

**背景**: 本文の事実検証は章別フラグメントで済んでいるが、**図は本文が書いていない具体値・固有名詞・矢印の向きを描画する**。図の誤りは読者に視覚的に届くうえ、本文と違って「文脈で緩和される」ことがない。そのため、各図を draw.io で作図するにあたり、その図が主張する内容だけを対象に一次情報へ当て直した。

**位置づけ**: 図の検証は10図・9ファイルにまたがり、次に図を作り直すときも一括で読み返す性質のものであるため、章別フラグメントへ分散させず独立させた。`aws-ecs-express-mode.md` と同じ扱い。**各章フラグメントの既存の判定は本フラグメントによって変更されない**(本文の記述ではなく図の描画内容を対象にしているため)。

**検証方法**: Google Cloud 公式ドキュメント(`cloud.google.com` / `docs.cloud.google.com`)、AWS 公式ドキュメント(`docs.aws.amazon.com`)を一次情報として照合した。実機で確認済みの値は、リポジトリ内の `live-*.md` を出典とした。

## 図2: 3つの実行モデル(`03_cloudrun`)

| # | claim | verdict | source_url | resolution |
|---|---|---|---|---|
| 1 | 実行モデルは「サービス (Service) / ジョブ (Job) / ワーカープール (Worker pool)」の3つで、この表記が公式と一致する | 正しい | https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 公式が resource type としてこの3つを並列に列挙している。図の3分岐ラベルにそのまま使ってよい |
| 2 | ワーカープールは URL を持たない | 正しい | https://docs.cloud.google.com/run/docs/deploy-worker-pools | 原文「Worker pools do not have a load balanced endpoint/URL」。図に「URL なし」と明記してよい |
| 3 | ワーカープールは 2026年4月 GA | 正しい | https://docs.cloud.google.com/run/docs/release-notes | 2026年4月14日のエントリに「Support for worker pools is in General Availability (GA)」。図に「2026年4月 GA」と添えてよい |
| 4 | 3つとも同じコンテナコントラクトで動く | **要修正** | https://docs.cloud.google.com/run/docs/container-contract | **公式は逆のことを書いている。** サービスは「must listen for requests on the correct port」、ジョブは「the container shouldn't listen on a port or start a web server」。共通なのは**デプロイ単位が同じコンテナイメージであること**までで、待ち受けの作法は異なる。図には「同じコンテナイメージ」とだけ描き、「コントラクトも共通」とは描かない |

## 図3: デプロイの流れ(`04_deploy`) / 図3b: ソースデプロイとの差分(`09_source_deploy`)

| # | claim | verdict | source_url | resolution |
|---|---|---|---|---|
| 5 | 手元のコード → `docker build` → `docker push` → Artifact Registry → `gcloud run deploy` → Cloud Run → HTTPS URL という並び | 正しい | https://docs.cloud.google.com/run/docs/deploying | 公式のビルド→push→デプロイの順序と一致。図の並びのまま描いてよい |
| 6 | Artifact Registry の AWS 対応は Amazon ECR | 正しい | https://docs.cloud.google.com/docs/get-started/aws-azure-gcp-service-comparison | 公式比較表の対応先は「Amazon ECR, AWS CodeArtifact」。**「= ECR」と等価であるかのように描かず**、「AWS でいうと Amazon ECR」程度の弱い表現にとどめる |
| 7 | 最初のリビジョン名は `handson-app-00001-xxx` 形式 | 正しい(実機) | `live-main-path.md` #6 / #9 | 公式は接尾辞が自動採番されるとのみ記載し形式は明文化していない。実機で確認済みのため、図に「リビジョン 00001」と描くのは概念表現として妥当 |
| 8 | サービスURL のダミー表記 | **要修正** | https://docs.cloud.google.com/run/docs/triggering/https-request | 公式の決定的URL形式は `https://[TAG---]SERVICE-PROJECT_NUMBER.REGION.run.app`。`.a.run.app` は旧形式で、公式ページに決定的URLとしての記載がない。**図3・図3b には決定的形式で描く**(`https://handson-app-<プロジェクト番号>.asia-northeast1.run.app`)。実機では `describe --format 'value(status.url)'` のみ旧形式を返し、両方とも有効(`live-main-path.md` #8) |
| 9 | `--source` デプロイで `docker build` / `docker push` を代行するのは Cloud Build | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 2026年時点でもサービス名は Cloud Build のまま。リネームや後継への移行は確認できない。図に「Cloud Build が代行」と描いてよい |
| 10 | ソースデプロイでも Artifact Registry に保存され、既定リポジトリ名は `cloud-run-source-deploy` | 正しい(実機) | https://docs.cloud.google.com/run/docs/deploying-source-code / `live-source-deploy.md` #4 | 初回に自動作成されることを公式・実機とも確認済み |
| 11 | 出力1行目は `Building using Dockerfile ...` / `Building using Buildpacks ...` | 正しい(実機) | `live-source-deploy.md` #2 / #7 | 実機出力と完全一致。図の注釈にそのまま使ってよい |
| 12 | 図3 と 図3b は箱の位置とレイアウトを共有する | (作図上の制約) | `04_deploy/README.md` の作図指示 | 両図の4つの箱を同一座標(x=20 / 250 / 480 / 690、y=86、170×100)に固定した。差分として読めることが図3b の唯一の要件 |

## 図4: ロールバック(`05_revision`)

| # | claim | verdict | source_url | resolution |
|---|---|---|---|---|
| 13 | リビジョンは不変(immutable) | 正しい | https://docs.cloud.google.com/run/docs/managing/revisions | 「an immutable revision is created」と明記 |
| 14 | 新しいリビジョンを作っても過去のリビジョンは消えない | 正しい(上限あり) | https://docs.cloud.google.com/run/quotas | サービスあたり最大1000リビジョン。超過分はトラフィックを受けていない古いものから自動削除される。図の3コマ(2リビジョン)は上限内。**「永久に残る」とは描かない** |
| 15 | ロールバックはトラフィックの割当変更であって再デプロイではない | 正しい | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 既存リビジョンへの再割当として手順化されている。図の「動くのは矢印だけ」は公式手順と整合 |
| 16 | リビジョンの採番は連番にならず飛ぶことがある | 正しい(実機のみ) | `live-main-path.md` #20 | 実機で `00001→00002→00005→00004→00006` を観測。公式は採番規則を文書化していない。**図に「番号は概念」という留保を必ず入れる** |

## 図5: デプロイとリリースの分離(`06_traffic`)

| # | claim | verdict | source_url | resolution |
|---|---|---|---|---|
| 17 | タグ付きURL の区切りはハイフン3連(`---`) | 正しい | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 公式例 `https://green---myservice-abcdef.a.run.app` と同型。**ハイフン2連で描くのは誤り** |
| 18 | トラフィック割当 0% のままタグ付きURLで個別にアクセスできる | 正しい | 同上 | 「The tag lets you directly test the new revision at a specific URL, without serving traffic」。図の主張そのもの |
| 19 | `--no-traffic` でリビジョンは作られるがトラフィックは流れない | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy | 本番URLの矢印が v3 に向かないことを描いてよい |
| 20 | カナリアで 90% / 10% に分割できる | 正しい(機構として) | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic | `--to-tags=[TAG=PERCENTAGE]` で任意の割合を指定できる。公式に「90/10」という具体例はないが、数値例として描くのは機構上正しい |
| 21 | 図に描く2種類のURL の表記 | 正しい(本文と一致) | `live-main-path.md` #17 / #21 | 本番URLは決定的形式、タグ付きURLは実機で観測された旧形式(`staging---handson-app-xxxxx-an.a.run.app`)。**6章本文がこの2つを併記しているため、図もそれに揃える**(#8 と表記が異なるのは章ごとの本文に合わせているため) |

## 図6 / 図7: スケーリング(`07_scaling`)

| # | claim | verdict | source_url | resolution |
|---|---|---|---|---|
| 22 | concurrency の既定は 80、上限は 1000 | 正しい | https://docs.cloud.google.com/run/docs/about-concurrency | 原文「default concurrency of 80」「maximum of 1,000」。ただし gcloud / Terraform での新規作成は「80 × vCPU数」が既定(1 vCPU 構成なら結果は同じ80) |
| 23 | オートスケーラーの目標使用率は 60% | 正しい | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 原文「metrics-based scaling sets a 60% threshold for CPU utilization and request concurrency targets」。**公式に明記があるため図に数値として描いてよい**(当初この数字は未確認と疑ったが、裏取りできた) |
| 24 | 標準の Lambda は 1リクエスト = 1実行環境 | 正しい | https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html | 比較として薄く添えてよい。**「標準の」という限定を必ず残す**(Lambda Managed Instances は例外) |
| 25 | アイドルインスタンスは最大15分ほど残る | 正しい | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 原文「up to 15 minutes, or 10 minutes for GPUs」「a 15-minute idle timeout」。図の帯の根拠 |
| 26 | スケールインは即座ではない | 正しい | 同上 | #25 と同じ原文が根拠 |
| 27 | 実測値: 09:23 に 11台 / 09:27 に 7台 / 09:28〜09:35 は 2台 / 09:36〜09:44 は 1台 | 正しい(実機) | `live-main-path.md` 「インスタンスの縮小の様子」 | 図7 の折れ線はこの表をそのまま描いている |
| 28 | ピークの11台は上限超過ではない | 正しい(実機) | `live-main-path.md` #27 | 負荷対象リビジョンが `max-instances 10` に張り付いた10台 + 旧リビジョンのアイドル1台。**図に必ずこの内訳を注記する**(そうしないと上限を超えたように見える) |
| 29 | 16分後に0台になった | **未確認(推定)** | `live-main-path.md` 「16分アイドル後のコールドスタート計測」 | `instance_count = 0` という明示のログ行は記録にない。16分後の1発目が 1.454798秒かかったことからの推定。**図では0台の点を破線にし、「推定」と明記する** |
| 30 | コールドスタートの実測は約1.45秒 | 正しい(実機) | 同上 | 1st `1.454798s` / 2nd `0.043257s` / 3rd `0.052684s` |

## 図8: ログとメトリクスの経路(`08_observability`)

| # | claim | verdict | source_url | resolution |
|---|---|---|---|---|
| 31 | AWS 側: `awslogs` ログドライバの `logConfiguration` をタスク定義に書く必要がある | 正しい | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html | Fargate 向けは常に必須。箱①としてそのまま描いてよい |
| 32 | AWS 側: ロググループは必ず自分で作る | **要修正** | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html | `awslogs-create-group` で自動作成もできる。ただし**既定は `false`** で、使うには明示的に有効化し、さらに `logs:CreateLogGroup` 権限を足す必要がある。箱②のラベルを「ロググループを用意する(事前に作るか、`awslogs-create-group` を有効にして権限を足す)」へ弱める |
| 33 | AWS 側: タスク実行ロールの IAM 権限を自分で書く | **要修正** | https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonECSTaskExecutionRolePolicy.html | `logs:CreateLogStream` / `logs:PutLogEvents` は AWS 管理ポリシー `AmazonECSTaskExecutionRolePolicy` に**含まれている**。権限を自作する必要はない。ただし実行ロール自体は既定では存在せず用意が要る。箱③を「タスク実行ロールを用意して管理ポリシーをアタッチする」へ変更 |
| 34 | 「左は3個」という数え方 | **要修正(ラベル修正で成立)** | #31〜#33 の合成 | 3個という総数は維持できるが、②③のラベルを上記のとおり実態に合わせる必要がある。修正後は成立する |
| 35 | ECS でメトリクスを見るには Container Insights などの追加設定が必要 | **要修正** | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cloudwatch-metrics.html | 「Any Amazon ECS service hosted on Fargate has CloudWatch CPU and memory utilization metrics automatically, so you don't need to take any manual steps」。**図でメトリクスにも追加設定が要るように描いてはいけない。** 比較をログの経路に限定し、その旨を図中に明記する |
| 36 | Cloud Run: stdout / stderr が設定なしで Cloud Logging に入る | 正しい | https://docs.cloud.google.com/run/docs/logging | 「automatically sent to Cloud Logging」 |
| 37 | Cloud Run: 指標が設定なしで Cloud Monitoring に入る | 正しい | https://docs.cloud.google.com/run/docs/monitoring | 「automatically integrated with Cloud Monitoring with no setup or configuration required」 |
| 38 | 「右は0個」と言い切れる | 正しい(内部機構は未確認) | #36 / #37 | 参加者が明示的に権限を付与する手順は公式のどこにも登場しないため、「自分で用意した箱は0個」という主張は成立する。ただし**なぜ0個で済むのか**(収集がランタイムサービスアカウントの IAM 権限に依存するのか否か)は一次情報を見つけられなかった。**図でその内部機構を説明しない** |
| 39 | 1行 JSON が構造化ログとして解釈され `severity` で色分けされる | 正しい | https://docs.cloud.google.com/logging/docs/structured-logging | フィールド名は `severity` で正確 |

## 図9: pull型と push型(`10_advanced/pubsub.md`)

| # | claim | verdict | source_url | resolution |
|---|---|---|---|---|
| 40 | push サブスクリプションは Pub/Sub 側から HTTP POST で配送する | 正しい | https://docs.cloud.google.com/pubsub/docs/push | 図の矢印は Pub/Sub → Cloud Run の向きで正しい |
| 41 | 受け口は普通の HTTP ハンドラでよい(専用シグネチャ不要) | 正しい | https://docs.cloud.google.com/run/docs/triggering/pubsub-push | 公式チュートリアルも通常の HTTP ハンドラで push ペイロードを受けている |
| 42 | IAM ロール2つの付与先と向き | 正しい(向きの明記が必須) | https://docs.cloud.google.com/pubsub/docs/authenticate-push-subscriptions | `roles/iam.serviceAccountTokenCreator` は **Pub/Sub サービスエージェント → push 用サービスアカウント**、`roles/run.invoker` は **push 用サービスアカウント → Cloud Run サービス**。図はこの2本の向きで描く。**逆向きに描くのは誤り** |
| 43 | OIDC トークンを発行する主体 | 正しい | 同上 | 公式「Pub/Sub must call an internal Google service using a separate signing service account identity, which is the service agent `service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com`」。**トークンを発行するのは Pub/Sub サービスエージェント**で、指定した SA はトークンに入る身元を提供するだけ。「指定した SA 自身がトークンを発行する」と描くのは誤り |
| 44 | AWS 側: Lambda が SQS をポーリングする(矢印は Lambda → SQS) | 正しい | https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html | 「Lambda polls the queue and invokes your function synchronously」。ただしポーリングするのは**関数のコードではなくイベントソースマッピング機構**。図にその注記を添える |

## 図10: 並列タスクの担当範囲(`10_advanced/jobs.md`)

| # | claim | verdict | source_url | resolution |
|---|---|---|---|---|
| 45 | 環境変数名は `CLOUD_RUN_TASK_INDEX` / `CLOUD_RUN_TASK_COUNT` | 正しい | https://docs.cloud.google.com/run/docs/container-contract | 両方とも公式に完全一致で記載あり |
| 46 | `CLOUD_RUN_TASK_INDEX` は 0 始まり | 正しい | 同上 | 「Starts at 0 for the first task and increments by 1」 |
| 47 | タスクに渡される環境変数はこの2つだけ | **要修正** | 同上 | 実際は `CLOUD_RUN_JOB` / `CLOUD_RUN_EXECUTION` / `CLOUD_RUN_TASK_INDEX` / `CLOUD_RUN_TASK_ATTEMPT` / `CLOUD_RUN_TASK_COUNT` の**5つ**。図を2つに絞るのはよいが、**「これだけ」と読める表現は避け**、「担当範囲を決めるのに要るのがこの2つ」と限定する |
| 48 | 5タスクがほぼ同時(同一秒)に起動した | 正しい(実機) | `live-jobs.md` #16 / #15 | 5行すべて同一秒(09:22:47)に `idx=0 count=5 attempt=0` 〜 `idx=4 count=5 attempt=0` が出力された。図に「同一秒に起動(実測例)」と描いてよい |
| 49 | 図に描くコマンドの表記 | **要修正** | `10_advanced/jobs.md` L95 | 本文が打たせるのは `gcloud run jobs update handson-job --region ${REGION} --tasks 5` のみで、`--parallelism` は使っていない。**図に本文にないフラグを描かない**(初稿で `--parallelism 5` を描いていたため修正した) |

## 集計

全49行の内訳(#12 は事実の判定ではなく作図上の制約なので verdict を持たない)。

- **正しい: 39件**(うち #38 は「主張は正しいが、その内部機構は未確認」)
- **要修正: 8件** — #4, #8, #32, #33, #34, #35, #47, #49
- **未確認: 1件** — #29
- 判定なし: 1件 — #12

要修正8件はいずれも**作図前に発見し、図に反映済み**。誤った図は1枚も出荷していない。内訳は次のとおり。

| # | 何が間違っていたか | どこに起因するか |
|---|---|---|
| 4 | 「3つとも同じコンテナコントラクト」 | 作図の初期構想(本文にはこの記述はない) |
| 8 | URL を `.a.run.app` 形式で描こうとしていた | 作図の初期構想 |
| 32 / 33 / 34 | 図8 の AWS 側3箱のラベル | **`08_observability/README.md` の作図指示ブロックそのもの** |
| 35 | ECS のメトリクスにも追加設定が要るという含み | 同上 |
| 47 | 「タスクに渡される環境変数は2つだけ」と読める表現 | 作図の初期構想 |
| 49 | 図に `--parallelism 5` と描いていた(本文にないフラグ) | 作図の初稿(描いた後に本文と突き合わせて発見) |

#29(16分後に0台)は実機記録に `instance_count = 0` の明示ログがないため、図では破線 + 「推定」表記にとどめた。

## 図に書いてはいけない表現

未確認・要修正の項目を確認済みに見せないための歯止め。

| 書ける | 書けない |
|---|---|
| 「デプロイ単位は3つとも同じコンテナイメージ」 | 「3つともコンテナコントラクトが共通」「ジョブもポートで待ち受ける」 |
| 「AWS でいうと Amazon ECR」 | 「Artifact Registry = ECR」 |
| `https://handson-app-<プロジェクト番号>.asia-northeast1.run.app` | `https://handson-app-xxxxx.a.run.app` を**決定的URLとして**描くこと |
| 「リビジョンは消えず増える」 | 「リビジョンは永久に残る」「上限はない」 |
| 「番号は概念。実際は飛ぶことがある」 | 「00001 → 00002 → 00003 と必ず連番で増える」 |
| 「staging---」(ハイフン3連) | 「staging--」(ハイフン2連) |
| 「オートスケーラーの目標は 60%」「アイドル保持は最大15分」 | — (どちらも公式に明記あり) |
| 「0台(推定)」 | 「16分後に0台になった」と実測値のように断定すること |
| 「ロググループを用意する(手動作成 or `awslogs-create-group` + 追加権限)」 | 「ロググループは必ず自分で作る必要がある」 |
| 「タスク実行ロールを用意して管理ポリシーをアタッチする」 | 「IAM 権限を自分でゼロから書く必要がある」 |
| 「この比較はログの経路に限った話」 | 「ECS はメトリクスにも追加設定が要る」 |
| 「担当範囲を決めるのに要るのはこの2つ」 | 「タスクに渡される環境変数はこの2つだけ」 |
| 「Pub/Sub サービスエージェントがトークンを発行する」 | 「push 用サービスアカウントがトークンを発行する」 |
| 「Lambda のイベントソースマッピングがポーリングする」 | 「Lambda 関数のコードがポーリングする」 |

## 本文への適用

- `08_observability/README.md`: 図8 の作図指示ブロックに #32 / #33 / #35 を反映した(箱②③のラベル修正と、比較をログの経路に限定する旨の追記)。**作図指示そのものに事実誤りがあったため、図と指示の両方を直している**
- `03_cloudrun` / `04_deploy` / `05_revision` / `06_traffic` / `07_scaling` / `09_source_deploy` / `10_advanced/jobs.md` / `10_advanced/pubsub.md`: 作図指示の記述に事実誤りはなかったため、`現在の状態` の行(仮図である旨)のみを完成図の記述へ差し替えた
- 本文(作図指示ブロック以外)は変更していない
