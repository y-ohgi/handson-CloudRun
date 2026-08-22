# 「AWSエンジニアのための Cloud Run ハンズオン」教材品質レビュー

本調査では、添付の全38ページを対象に、特に料金・Cloud Runの実行モデル・Node.js 24・Buildpacks・`gcloud` コマンド・AWS比較・Cloud Shell運用・2025〜2026年のCloud Run更新を重点的に検証した。ページ番号は添付PDFを基準とする。fileciteturn0file0

## 最も重要な発見トップ5

**発見：AWS比較表は2026年時点で複数の重要な修正が必要。**

PDF p.14 の比較表は説明の軸そのものは非常に有効だが、「Lambda = 1リクエスト1実行環境」は**標準Lambdaについては正しい一方、2025年11月登場の Lambda Managed Instances では同一実行環境内の複数同時Invocationが可能**になった。また「LambdaのHTTPS URLにはAPI Gateway等が必要」は Lambda Function URLs があるため現在は誤り。「App Runnerの実行時間上限なし」も誤りで、AWS公式ドキュメントではHTTPリクエスト全体に **120秒上限**がある。citeturn22search7turn22search9turn21search0  
出典URL: [Lambda Managed Instances](https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances.html)、[Lambda Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html)、[App Runner runtime](https://docs.aws.amazon.com/apprunner/latest/dg/develop.html)

**発見：Cloud Runの無料枠の数値は「request-based billing」としては正しいが、2026年の料金モデル全体としては不完全。**

p.15 の「18万 vCPU秒 / 36万 GiB秒 / 200万リクエスト」は現在も **request-based billing の無料枠**として正しい。一方、instance-based billing には別の無料枠として **240,000 vCPU秒 / 450,000 GiB秒**がある。またrequest-based billingでも「リクエスト処理中だけ」ではなく、インスタンス起動・シャットダウンの一部や、minimum instances のアイドル時間にも課金条件がある。現在の正式名称は「request-based billing / instance-based billing」で、旧来の「CPU only during request / CPU always allocated」の用語を主語にしない方がよい。citeturn2view0turn2view1  
出典URL: [Cloud Run pricing](https://cloud.google.com/run/pricing)、[Billing settings](https://cloud.google.com/run/docs/configuring/billing-settings)

**発見：教材の「Cloud RunにはServiceとJob」という世界観は、2026年4月以降は古い。**

Cloud Runには現在 **Service / Job / Worker pool の3種類**があり、Worker pools は2026年4月14日にGAした。したがってp.15の「リクエスト起点でない常駐処理 → 常時割当CPU設定かGKE」は明確に更新対象である。Kafka consumer、Pub/Sub pull、RabbitMQ consumerのようなpull型・常駐バックグラウンドワーカーは、現在Cloud Run Worker poolsの本来の用途である。これは教材の「Google CloudはSaaS的に抽象化する」という主題と非常に相性がよい新機能で、**本編で必ず言及すべき**である。citeturn11search0turn23search5turn11search3  
出典URL: [What is Cloud Run](https://cloud.google.com/run/docs/overview/what-is-cloud-run)、[Cloud Run release notes](https://cloud.google.com/run/docs/release-notes)

**発見：「Node.js 24はTypeScriptをそのまま実行できる」は、この教材のコードでは成立するが、一般論として書くと危険。**

現在のNode.js 24ではTypeScript type strippingは安定機能になっているが、これはTypeScriptコンパイラの代替ではない。**型チェックをせず、`tsconfig.json` を通常の意味では解釈せず、デフォルトで扱えるのは消去可能なTypeScript構文が中心**である。enumやparameter propertiesなどは別条件があり、decorator等にも制約がある。PDFのコードは型注釈など消去可能な構文に収まっているため動作する。教材では「Node.js 24はTypeScriptをネイティブ実行できる」ではなく、「**Node.js 24のbuilt-in type strippingを使い、この教材で使う範囲のTypeScriptはビルドなしで実行する**」と限定した方が正確である。citeturn3search7  
出典URL: [Node.js TypeScript documentation](https://nodejs.org/api/typescript.html)

**発見：オートスケール実験の「50接続 ÷ concurrency 10 = 5台前後まで増えるはず」は、イベントで最も“教材どおりにならない”可能性が高い箇所。**

p.23〜25 の式は概念理解には有効だが、Cloud Run autoscalerは単純な整数除算だけで台数を決定するわけではなく、リクエスト負荷やCPU利用などを使ってスケールする。そのため、「5台になるはず」と期待値を固定すると、当日に3台・4台などになったとき参加者が自分の操作ミスと判断しやすい。**「concurrencyを下げると、同じ同時リクエスト数でもより多くのインスタンスが必要になる。台数は概算であり、5台は保証されない」**へ書き換えるべきである。Cloud Runの現在の説明でも、サービスはリクエスト量やCPU利用に応じてautoscaleするとされている。citeturn23search5turn2view2  
出典URL: [Cloud Run concurrency](https://cloud.google.com/run/docs/about-concurrency)、[What is Cloud Run](https://cloud.google.com/run/docs/overview/what-is-cloud-run)

## 教材の事実確認

### Cloud Run本体・料金・スペック

以下は、修正した方がよい箇所をユーザー指定の「該当箇所 → 正しい情報 → 出典URL」に沿ってまとめたもの。

| 該当箇所 | 判定 | 正しい情報 | 出典 |
|---|---|---|---|
| p.15「無料枠: 18万 vCPU秒 / 36万GiB秒 / 200万req」 | **条件付きで正しい** | request-based billing の無料枠として正しい。instance-based billing は **240,000 vCPU秒 / 450,000 GiB秒**の別枠を持つ。 | [Pricing](https://cloud.google.com/run/pricing) citeturn2view0 |
| p.14「Cloud Run課金 = リクエスト処理中のみ（常時割当に変更可）」 | **要修正** | 現在の正式な区分は **request-based billing / instance-based billing**。request-basedでも起動処理等が課金対象になり、minimum instances のアイドル時間も完全無料ではない。 | [Pricing](https://cloud.google.com/run/pricing) / [Billing settings](https://cloud.google.com/run/docs/configuring/billing-settings) citeturn2view0turn2view1 |
| p.15「リクエストを処理していない間はCPU・メモリ課金なし」 | **単純化しすぎ** | min instances=0 の通常アイドル状態を説明する言葉としては概ねよいが、request-basedでも起動・graceful shutdown・minimum instance idleなど例外がある。 | [Pricing](https://cloud.google.com/run/pricing) citeturn2view0 |
| p.14「request timeout 60分」 | **正しい** | Cloud Run Serviceのrequest timeoutは**デフォルト5分、最大60分**。15分超の処理では再接続・リトライ可能な設計をGoogleが推奨している。 | [Request timeout](https://cloud.google.com/run/docs/configuring/request-timeout) citeturn0search0 |
| p.33 WebSocket「デフォルト5分、最大60分」 | **正しい** | WebSocketもCloud Run上では長時間HTTP requestとして扱われるためrequest timeoutの対象。最大60分という説明は維持してよい。 | [Request timeout](https://cloud.google.com/run/docs/configuring/request-timeout) citeturn0search0 |
| p.14/p.23「concurrencyデフォルト80」 | **概念としては可、表現修正推奨** | デフォルト1 vCPU構成の説明として80は妥当だが、2026年のドキュメントでは作成方法・vCPU数によるデフォルトの扱いに差がある。設定可能な最大値は **1インスタンスあたり1000**。普遍的な固定値として教えない方がよい。 | [Concurrency](https://cloud.google.com/run/docs/about-concurrency) citeturn2view2 |
| 教材にCPU/Memory上限の明示なし | **補足推奨** | 通常のCloud Run Serviceでは最大 **8 vCPU / 32 GiB memory**。GPU構成では別の大きな構成が存在するため、「通常CPUサービスの上限」と断る。 | [CPU limits](https://cloud.google.com/run/docs/configuring/services/cpu) / [Memory limits](https://cloud.google.com/run/docs/configuring/services/memory-limits) citeturn1search0turn1search2 |
| p.23「必要インスタンス数 ≒ 同時request / concurrency」 | **概念式としてのみ正しい** | capacityの直感を得る式には使えるが、Cloud Runのautoscaling結果を保証する式ではない。 | [What is Cloud Run](https://cloud.google.com/run/docs/overview/what-is-cloud-run) citeturn23search5 |
| p.15「request起点でない常駐処理 → 常時割当CPUかGKE」 | **2026年では古い** | **Worker pools** がGA済みで、pull consumer・background workerなどの非request workloadをCloud Runで実行できる。 | [What is Cloud Run](https://cloud.google.com/run/docs/overview/what-is-cloud-run) / [Release notes](https://cloud.google.com/run/docs/release-notes) citeturn23search5turn11search0 |

料金の説明は、教材上では次の3行に置き換えるとかなり正確になる。

> **Cloud Run Serviceのデフォルトはrequest-based billing。**  
> request処理中を中心にCPU・memoryが課金され、scale-to-zero時はインスタンス課金がなくなる。起動処理やminimum instancesには例外がある。  
> 常時CPUが必要なワークロードにはinstance-based billingを選べる。

東京はCloud Run価格表上のTier 1地域で、request-based billingでは無料枠超過後の基本単価として active CPU が `$0.000024/vCPU-second`、memory が `$0.0000025/GiB-second`、requestが `$0.40/1 million requests`。instance-based billingではCPU `$0.000018/vCPU-second`、memory `$0.000002/GiB-second` が基本単価となる。価格は改定され得るため、イベント資料では単価そのものより「2種類のbilling modelと無料枠」を中心にし、価格表へのQR/URLを載せる方が長持ちする。citeturn2view0  
出典URL: [Cloud Run pricing](https://cloud.google.com/run/pricing)

### Node.js 24とBuildpacks

**p.9/p.12「Node.js 24はTypeScriptをそのまま実行できる」 → 「この教材で使う消去可能なTypeScript構文は、Node.js 24のbuilt-in type strippingによりビルドなしで実行できる」 → [Node.js TypeScript docs](https://nodejs.org/api/typescript.html)**。Node.jsの機能は型チェックをしないため、`tsc --noEmit` の代替にはならない。またTypeScript構文すべてを完全にJavaScriptへtranspileする機能でもない。PDF掲載コードの `severity: string` や `Record<string, unknown>` のような型注釈は、この用途に適合している。citeturn3search7

教材ではNode.js 24を選んだ理由を「最新だから」ではなく、**ビルドステップを1つ消し、Cloud Runの概念に認知資源を集中させるため**と説明すると、技術上の制約がそのまま教育設計上の意図になる。

**p.9 `engines: {"node": ">=24"}` → Buildpacksでは `"24.x"` などに変更推奨 → [Google Cloud Buildpacks Node.js](https://cloud.google.com/docs/buildpacks/nodejs)**。GoogleのBuildpacksドキュメントはNodeバージョンにSemVer指定を使える一方、greater-than (`>`) 系指定を避けるよう明示している。`>=24` は将来のNode 26等も条件上含むため、「教材はNode 24のtype stripping挙動に依存する」という前提と相性が悪い。2026年7月にはNode.js 26 runtime自体がPreviewになっているため、教材では明示的に24系へ寄せる方が再現性が高い。citeturn5view0turn11search0

推奨は次の形。

```json
{
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "start": "node src/index.ts"
  }
}
```

**p.28「Dockerfileを消すとBuildpacksがpackage.jsonを見てNode.jsアプリと判断し、npm startで起動する」 → 基本的に正しい。** `gcloud run deploy --source .` はDockerfileがあればDockerfileを利用し、なければGoogle Cloud Buildpacksによるbuildを利用できる。Node.js buildpackは `package.json` の `scripts.start` をentrypointに利用できるため、掲載projectは成立する。citeturn6search1turn5view0  
出典URL: [Deploy from source](https://cloud.google.com/run/docs/deploying-source-code)、[Node.js buildpacks](https://cloud.google.com/docs/buildpacks/nodejs)

ただし**教材品質の観点では `package-lock.json` を配布物に含めることを強く推奨する**。現在のPDFは依存を `"hono": "^4.9.0"` 等とし、Dockerfileでも `npm install` しているため、イベント日によって解決されるdependencyが変わる余地がある。GoogleのBuildpacksドキュメントもlockfile利用を推奨している。ハンズオンでは「パッケージ管理の教育」が目的ではないため、dependency差分という不要な変数を消した方がよい。citeturn5view0

さらにp.9の「HonoなのでNode.js / Cloudflare Workers / Denoでも同じコードが動く」は、**掲載コードそのものについては言い過ぎ**である。掲載コードには `@hono/node-server`、`node:crypto`、`Buffer`、`process.env` といったNode.js固有要素があるため、そのファイルを無変更で各runtimeへ持っていくことはできない。ここは「**Hono自体は複数runtimeに対応する。今回はNode.js adapterとNode.js APIを使う**」と直すべきである。これはPDF内のコードから直接確認できる。fileciteturn0file0

### `gcloud` コマンド

本教材で使っている主要なCloud Run CLIは、2026年8月時点でかなり良好に保たれている。

**p.21 `gcloud run deploy --no-traffic --tag staging` → 有効。** `--no-traffic` と `--tag` は現行stable `gcloud run deploy` に存在する。タグ付きrevision URLを作りつつproduction trafficを流さない、という教材の説明も妥当である。citeturn7search5  
出典URL: [gcloud run deploy](https://cloud.google.com/sdk/gcloud/reference/run/deploy)

**p.22 `gcloud run services update-traffic --to-tags staging=10` / `--to-latest` → 有効。** 現行CLIには `--to-tags`、`--to-revisions`、`--to-latest` がある。10%だけtagに送る例も成立する。citeturn7search4  
出典URL: [gcloud run services update-traffic](https://cloud.google.com/sdk/gcloud/reference/run/services/update-traffic)

一つだけ講師ノートに追加したいのは、`--to-latest` が単なる「今のrevisionに100%戻す」とだけ理解されると不十分な点である。`LATEST`へのtraffic割当という意味を持つため、その後のdeploy動作との関係まで説明するとrevision/traffic modelの理解が深まる。citeturn7search4

**p.35 `gcloud beta run jobs logs read` → 動く可能性はあるが、教材ではstableへ変更すべき。**

```bash
gcloud run jobs logs read handson-job --region "${REGION}"
```

`run jobs logs read` は現在stable groupにあるため、教材であえて `beta` を使う理由はない。citeturn7search3  
出典URL: [gcloud run jobs logs read](https://cloud.google.com/sdk/gcloud/reference/run/jobs/logs/read)

**p.36 Cloud Scheduler command → 構文自体は現在も有効。ただし教材の事前API有効化が不足。** Cloud Run Jobのv2 `:run` endpointをCloud SchedulerからOAuth付きHTTP requestで呼ぶ構成は現在のGoogle公式手順と一致する。`gcloud scheduler jobs create http` のHTTP method defaultもPOSTなので現行commandは成立するが、教材としては `--http-method=POST` を明示した方が読み手に意図が伝わる。citeturn9view0turn8search0  
出典URL: [Execute jobs on a schedule](https://cloud.google.com/run/docs/execute/jobs-on-schedule)、[gcloud scheduler jobs create http](https://cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http)

ただしp.6で有効化しているのは `run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com pubsub.googleapis.com` であり、**`cloudscheduler.googleapis.com` がない**。3時間版でCLIによるScheduler作成まで実施するなら、ここは確実に追加するべきである。fileciteturn0file0 Google公式手順でもCloud Scheduler利用前提の権限・サービス設定が必要になる。citeturn9view0

さらに現在のcommandは、表示名から「Compute Engine default service account」を検索してOAuth identityに使っている。この方法は個人projectでは動きやすいが、企業組織ではdefault service accountの扱いがorganization policyによって制限されることがある。Googleは2024年以降、新規organizationにdefault service accountへの強い権限の自動付与を抑制するsecurity baselineを適用している。教材では **Scheduler専用SAを作り、必要なInvoker権限だけ与える方法**の方が実務的で再現性が高い。citeturn17search1turn17search3

### AWS比較表

ここは教材全体で最も優先して直す価値が高い。

**p.14 Lambda「1リクエスト = 1実行環境」 → 「Lambda default computeでは1 execution environmentあたり最大1 invocation。同時実行型のLambda Managed Instancesは例外」**。Lambda Managed Instancesは2025年11月に登場し、同一execution environmentでparallel invocationを処理できる。Node.jsではruntimeごとのmulti-concurrency制御も存在する。したがって、本文p.14の「Lambdaは1リクエスト1環境なのでインスタンス数が爆発しがち」という断定にも「standard Lambdaでは」という修飾を入れるべきである。citeturn22search7turn22search9turn22search15

この修正はCloud Runの魅力を弱めるものではない。むしろ、

> 「Cloud Runが以前から持っていた“普通のWeb server + instance-level concurrency”に近い方向へ、AWS Lambdaにも2025年から別compute modelが加わった」

と説明した方が2026年らしく、両クラウドの設計思想の変化まで見せられる。

**p.14 Lambda「HTTPS URL = 要API Gateway等」 → 誤り。** 標準LambdaにはLambda Function URLsがあり、Lambda単体で専用HTTPS endpointを発行できる。API Gatewayが必要なのはrouting、API management、WebSocket API等の追加機能が必要なケースである。  
出典URL: [AWS Lambda Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html)

したがって比較表は「HTTPS URL」の○×ではなく、次のように軸を変える方が有益である。

| 比較軸 | Lambda default | App Runner | Cloud Run |
|---|---|---|---|
| managed HTTPS endpoint | Function URLあり | あり | あり |
| arbitrary HTTP server/container | container imageでもLambda runtime contractあり | あり | あり |
| request timeout | 最大15分 | 最大120秒 | 最大60分 |
| instance内multi-concurrency | 原則なし | あり | あり |
| scale to zero | あり | service稼働中はprovisioned memoryあり | あり |

Lambdaの標準execution timeout最大15分は現在も維持されている。citeturn10search3

**p.14 App Runner「実行時間上限なし」 → 誤り。** AWS公式はHTTP requestのtotal request timeoutを **120秒**としている。これはCloud Runの60分との対比としてむしろ教材に入れる価値が高い。citeturn21search0

**p.14 App Runner「常時 + リクエスト課金」 → 意味は近いが用語を修正推奨。** App Runnerはidle時もprovisioned containerのmemoryに課金し、requestを処理するactive containerではvCPUとmemoryが課金される。デフォルトのprovisioned instance数は1。単純な「リクエスト課金」ではない。citeturn19search0  
出典URL: [AWS App Runner pricing](https://aws.amazon.com/apprunner/pricing/)

**p.14 App Runner「WebSocket不可」 → 2026年8月時点では「未確認」と表記するのが安全。** AWSの現行developer guideはcontainer instanceへの通信としてHTTP/1.0とHTTP/1.1、120秒request timeoutを公式に記載しているが、今回確認できた公式資料からは「WebSocketを正式サポートする」とする2026年の記述を確認できなかった。したがって資料上は「WebSocket ×」と断定するより、**「長時間WebSocket用途には不向き／公式サポート状況を開催直前に再確認」**が堅い。citeturn21search0

**Fargate列は技術的誤りというより比較粒度を合わせるべき。** FargateはApp RunnerやCloud Runそのものに対応するapplication serviceではなくECS taskのcompute optionなので、「Fargate」ではなく教材自身が括弧書きしている **「ECS on Fargate + ALB + Service Auto Scaling」** を比較対象名にした方がよい。そうすると「Cloud Runではどの構成要素がSaaS化されて消えたか」という、本教材の中心テーマがさらに明確になる。

## 2025〜2026年のCloud Run新機能

2025〜2026年はCloud Runの守備範囲がかなり広がっており、教材の「Webアプリをserverless containerで動かす」というイメージからさらに一段進んでいる。主要更新はGoogle公式release notesで確認できる。citeturn11search0

| 機能 | 状態・時期 | 教材への判断 | 理由 |
|---|---|---|---|
| **Worker pools** | 2025-06 Preview → **2026-04 GA** | **本編で必ず言及、3h版なら講師デモ** | Service / Jobに続く第三の実行モデル。AWSエンジニアに「ECS workerまでCloud Runに入ってきた」と示せる。 citeturn11search0turn23search5 |
| **NVIDIA L4 GPU for Services** | **2025-04 GA** | **言及のみ** | GPUでもscale-to-zero・秒課金というCloud Runの思想を強く表現できるが、モデルdownload・cold start・コストで2hハンズオンには不向き。 citeturn11search0turn11search1 |
| **GPU for Jobs** | **2025-10 GA** | 言及のみ | Batch inference / trainingまでJobsで扱えることを示せる。 citeturn11search0 |
| **RTX PRO 6000 Blackwell GPU** | **2026-04 GA** | スライド1枚 | 最大規模のAI inferenceまでCloud Runが広がった象徴。通常のCPU上限と混同しないこと。 citeturn11search0turn11search2 |
| **Jobs task timeout 7日** | **2025-11 GA** | **Jobs章に追記** | 「Lambdaなら15分」という比較をより印象的にできる。Cloud Run Jobは最大168時間。 citeturn11search0 |
| **Docker Compose deployment** | 2025-11 Preview → **2026-03 GA** | **講師デモ向き** | AWS/ECS経験者にとって理解が速い。複数container/sidecarをCloud Runへ持ち込めることを短時間で見せられる。 citeturn11search0turn12search0 |
| **Direct IAP integration** | **2026-03 GA** | 言及、3hならデモ候補 | 「認証付き社内WebアプリでもLBを最初から組まなくてよい」というSaaS的思想を強く表現できる。 citeturn11search0 |
| **Multi-region service health** | **2026-06 GA** | 言及だけ | Cloud Run自身でmulti-region HA/failoverまで扱えるようになったが、2〜3時間教材には概念が大きすぎる。 citeturn11search0 |
| **HTTP/gRPC readiness probe** | **2026-06 GA** | 言及だけ | ECS/Kubernetes経験者には「managedでもproduction lifecycle controlが増えている」と伝えられる。 citeturn11search0 |
| **Ephemeral disk** | 2026-04 Preview | 言及だけ・Preview明記 | 大きなscratch dataをmemoryから分離できるが、本編に組み込むほど成熟していない。 citeturn11search0turn11search6 |
| **custom CPU / concurrency scaling targets** | 2026-04 Preview | 言及だけ | p.23のautoscaling説明を深掘りする際の「さらに制御もできる」程度で十分。 citeturn11search0 |
| **Cloud Storage volume mount options** | **2025-09 GA** | デモ候補より言及 | Cloud Storageをfilesystemとしてmountでき、FUSEをcontainerに自前installする必要もない。stateless理解の補足には有用。 citeturn12search0 |
| **Budget spend caps** | 2026-07 Preview | 運用注意として言及 | Cloud Run workloadをbudget条件でpauseする新しい安全機構。イベント終了時のcleanup代替にはせず、Previewとして紹介する程度。 citeturn11search0 |

この中で教材の魅力を最大化するなら、GPUよりもまず **Worker pools** を優先すべきである。

現在のCloud RunをAWSエンジニア向けに一枚で表すなら、

> **Service = request/event-driven**  
> **Job = run-to-completion**  
> **Worker pool = continuously running / pull-based work**

という三分割がGoogle自身の現行説明と一致する。citeturn23search5

これは「Cloud Run ≒ App Runner」という誤解を壊すのに非常に有効である。

GPUは派手だが、今回の学習目標に対しては「Cloud Runの抽象化モデルがGPUにまで拡張された」という**講師の1〜2分デモまたはスクリーンショット**で十分である。L4 GPUはscale-to-zeroと秒単位課金を維持するため、Cloud Runの思想を説明する事例としては優秀である。citeturn11search1

一方、Compose GAはAWSエンジニアへの刺さり方がかなり強い。Cloud Runは複数containerを扱え、Cloud Storage volumeも複数containerへmountできる。3時間版なら「nginx/agent sidecar付きComposeを `gcloud run compose up`」程度の**3〜5分講師デモ**を追加する価値がある。citeturn12search0turn11search0

## 先行事例・類似教材から取り入れるべきもの

Google公式Cloud Run教材群は、現在 **prebuilt container → Service / Job / Worker pool** のquickstartを明確に分けている。つまり、Cloud Runを「web container platform」とだけ説明せず、「同じmanaged container substrateに複数のexecution semanticsがある」という構成になっている。citeturn23search6turn23search5  
出典URL: [Cloud Run Quickstarts](https://cloud.google.com/run/docs/quickstarts)

特に参考になるのが2026年の **Autoscale worker pools based on Pub/Sub queue volume** tutorial / Codelabである。この教材は冒頭でObjectives、Costs、Before you begin、必要IAM roles、必要APIを明記し、環境変数を多用するため冒頭に `set -u` を設定して「未設定変数を早期にエラーにする」という設計を採っている。ハンズオン事故を減らすという観点で、本教材にもそのまま採用価値がある。citeturn23search0turn23search7  
出典URL: [Worker pool + Pub/Sub tutorial](https://cloud.google.com/run/docs/tutorials/autoscale-workerpools-pubsub)

具体的には現在の、

```bash
export PROJECT_ID=...
export REGION=...
export REPO=...
```

の直前に、

```bash
set -u
```

を入れ、「変数を設定し忘れた状態で別projectや空文字列に対してcommandを打つ」事故を早期発見する方式がよい。

Pub/Sub公式Cloud Run tutorialでは、production相当のpush integrationとして専用service accountを作り、`roles/run.invoker` を与え、`--push-auth-service-account` を使う流れを正面から扱っている。またIAM変更直後には数分間403が見える場合があることも明記されている。citeturn23search3  
出典URL: [Use Pub/Sub with Cloud Run](https://cloud.google.com/run/docs/tutorials/pubsub)

本教材のp.31〜32は「まずunauthenticatedで仕組みを見せ、productionではSA認証」と段階を分けており、**教育設計としては妥当**である。ただし、unauthenticated版の直上に、

> **この設定は配送の仕組みを短時間で観察するためのハンズオン用。実務では次節の認証付きpushを使う**

という警告ボックスを置いた方がよい。AWS実務経験者ほど「教材のサンプルが推奨構成」と解釈しやすいためである。

またGoogleには、Pub/Subの大量messageをWebSocket経由でbrowser dashboardへstreamする公式tutorialがあり、**イベントが目で動いて見える**題材を採用している。単にlogsで「message received」を確認するよりも、リアルタイム視覚フィードバックが強い。citeturn23search1  
出典URL: [Streaming Pub/Sub messages over WebSockets](https://cloud.google.com/pubsub/docs/streaming-cloud-pub-sub-messages-over-websockets)

本教材はすでにPub/SubとWebSocketを別々の発展編として持っているため、完全に統合する必要はない。ただし3時間版の最後を、

> Pub/Subでイベントが入る  
> → Cloud Runが処理する  
> → browserやlogで即座に結果が見える

という**一つのcapstone story**にすると、「サービスを触った」ではなく「managed servicesを組み合わせた」という達成感が残りやすい。

AWS経験者向けの説明では、Google公式にも「Google Cloud for AWS and Azure customers」という比較導線が用意されている。citeturn24search2 さらに歴史的なGoogle公式「Cloud IAM for AWS users」は、製品名を1対1対応させるより、Google Cloudの**Organization → Folder → Project → Resourceというhierarchy、policy inheritance、Projectというtrust boundary**をAWS利用者の既存知識に接続して説明している。この「概念を対比する」方式は本教材と相性がよい。citeturn24search17turn24search13  
出典URL: [Google Cloud IAM for AWS users](https://cloud.google.com/blog/products/gcp/google-cloud-iam-for-aws-users/)

したがって現在のp.8の「サービス対応表」は残しつつ、より重要な比較を次のような「操作感の差」に移すことを推奨する。

| AWSで身についた反射 | Cloud Runでの体験 | 教えるべき差 |
|---|---|---|
| まずVPC/subnet/security groupを考える | まずdeployしてHTTPS URLを得る | networkingを必要時に接続する |
| ECS service + ALB + target group | Cloud Run Service | application endpointがplatform primitive |
| ECRへimageをpush | imageでもsourceでもdeploy可能 | buildもplatformへ委譲できる |
| deploymentとLB traffic制御を組む | revision + traffic split | release managementがserviceに内蔵 |
| Lambda handlerを書く | 普通のHTTP serverを書く | function contractではなくcontainer contract |
| SQS/SNS consumerを設計 | Pub/Sub push / Worker pool pull | event delivery modelを選べる |

これは単なる「AWSサービス名 ↔ GCPサービス名」暗記よりも、本教材のゴールである**Google CloudのSaaS的アプローチを体感する**ことに直接つながる。

なお、日本語・英語コミュニティ資料についても検索したが、今回の調査では「2025〜2026年時点でCloud Runの現行仕様に追随し、かつ閲覧数・スター数・参加者評価などから『評価が高い』と客観的に判断できるAWS→Google Cloud向けハンズオン資料」は十分に特定できなかった。**コミュニティ資料の人気度については未確認**とする。教材構成のベンチマークとしては、現時点では更新日の明確なGoogle公式Codelab/tutorialを基準にする方が安全である。

## 当日の運用リスク

Cloud Shell限定という方針自体は、イベント運営上かなり合理的である。Cloud ShellはユーザーごとのGoogle管理VM上で動き、`gcloud`、Docker、npm等がpre-installedされ、5 GBのpersistent `$HOME` を持つ。buildやregistryとの通信を参加者PCではなくCloud Shell側へ寄せられるため、ローカル環境差を大幅に減らせる。citeturn13search0

一方、**事故が起きる場所が「ローカル環境」から「アカウント・IAM・browser・Cloud Shell quota」に移る**。

| リスク | 発生/影響 | 対応 | どこで防ぐか |
|---|---|---|---|
| 無料trial signupが当日終わらない | 高 / 高 | **開催2日前までにsignup・project作成・billing確認を必須化** | 事前アナウンス |
| corporate Google accountでCloud Shell禁止 | 中 / 致命的 | personal accountまたは運営用lab projectを推奨 | **事前必須** |
| Organization Policyで`allUsers`付与不可 | 中 / 高 | `--allow-unauthenticated` が失敗することを想定。個人projectを推奨 | 事前 + troubleshooting |
| Cloud Shell weekly quota枯渇 | 低〜中 / 致命的 | Session information → Usage quotaで**残り4時間以上**確認 | 事前 |
| Cloud Shell session切断 | 中 / 中 | `$HOME`は残るがexport変数等を復旧できる「再開用command block」を用意 | 教材 |
| third-party cookie/private browsing | 中 / 高 | incognitoを避ける。Editorが開かない場合はnew window | 事前 + 教材 |
| Scheduler API未enable | 3h版では高 / 中 | `cloudscheduler.googleapis.com` をp.6へ追加 | **教材修正** |
| Scheduler用SAが存在しない・権限不足 | 中 / 中 | default Compute SA依存をやめ専用SAを作成 | 教材 |
| IAM propagation直後の403 | 中 / 中 | 「1〜数分待ってretry」の明記 | 教材 |
| `hey`の外部download失敗 | 中 / 中 | repositoryにNode.js load generatorを同梱 | **教材修正** |
| 会場Wi-Fi・Google認証/MFA | 中 / 高 | 開始前にConsoleとCloud Shellを全員open。講師側にmobile hotspot | 運用 |
| Google側Cloud Shell障害 | 低 / 致命的 | 講師demo video / expected output screenshotsを用意 | 運用 |

Google CloudのFree Trialは現在も **90日・$300 Welcome credit**で、カード等のpayment methodによるidentity verificationが必要。trial中は自動課金されず、明示的にpaid accountへupgradeしなければtrial終了後に課金へ自動移行しない。ただしabuse防止のため一部product accessが制限される場合がある。したがってPDF p.5の「90日 / $300」は現在も正しい。citeturn13search2  
出典URL: [Google Cloud Free Trial FAQ](https://cloud.google.com/signup-faqs)

イベント告知には少なくとも、

> 「当日アカウントを作らないでください。前日までにGoogle Cloud Consoleへログインし、billing付きprojectを1つ作成し、Cloud Shell Editorが起動するところまで確認してください」

と書くべきである。

企業Google Workspaceアカウントは特に危険である。Google公式でもCloud Shellの利用可否はorganization administratorが制御できる。さらにdomain-restricted sharingが有効だと `allUsers` のような外部principalへのIAM role付与が拒否される可能性がある。2024年5月以降に作られたorganizationではsecurity baselineによるorganization policyも以前より強くなっている。citeturn17search2turn17search0turn17search3

したがって**「会社アカウントの方がエンジニアには自然だから会社アカウントで」ではなく、「会社のGoogle Cloud管理状況が不明なら個人Google Accountを使用」**とした方がイベント成功率は高い。

Cloud Shellには**default weekly quota 50時間**があり、quotaを使い切るとreset時刻まで利用できない。またnon-interactive sessionは40分、Cloud Shell sessionそのものは最大12時間で終了する。`$HOME`は5 GBまでpersistentで、それ以外のVM変更はsession破棄時に失われる。citeturn16view0  
出典URL: [Cloud Shell quotas and limits](https://cloud.google.com/shell/docs/quotas-limits)

2〜3時間イベントでは通常50時間quotaそのものは問題にならないが、Cloud Shellを普段から多用している参加者だけは例外である。当日のエラーには代替策がほぼないので、これは**教材内のトラブルシュートではなく事前チェック対象**にする。

さらに実戦的なのがbrowser問題で、Cloud Shell Editorはthird-party cookiesが無効だとembedded editorを読み込めない。公式docsはnew-windowでEditorを開く回避策も示している。Private/Incognito modeも避けさせた方がよい。citeturn16view0

教材p.25の `hey` をS3からdownloadする構成は、AWSエンジニアには面白い小ネタだが、ハンズオン運用としては外部dependencyを一つ増やしている。ここは教材repositoryに、例えばNode.js標準APIだけで50 concurrent requestを投げる `load.mjs` を同梱した方が堅い。Cloud ShellのNode.js環境はpre-installedされている。citeturn13search0

たとえば参加者には、

```bash
node load.mjs "${SERVICE_URL}/heavy" 50
```

だけ打たせればよい。これならbinary download、architecture判定、S3 reachability、executable permissionという4つの失敗要因を消せる。

もう一つ重要なのが**復旧導線**である。現在の教材にも「Cloud Shellが切れたら変数を再設定」とあるのは良い。これを各章から探させるのではなく、全章共通の「困ったらここ」を1ブロックにまとめることを推奨する。

```bash
cd ~/cloudrun-handson/app

export PROJECT_ID="$(gcloud config get-value project)"
export REGION="asia-northeast1"
export REPO="handson"

gcloud config set project "${PROJECT_ID}"
gcloud config set run/region "${REGION}"
```

参加者が復旧時に「自分が今どの章まで終わっていたか」まで考えなくて済むことが重要である。

## 教材構成への改善提案

### 現状の設計評価

**事実として**、現在の2時間版は0:00〜0:40が座学、0:40からハンズオンへ入り、最後の **1:55〜2:00の5分間に「logs・source deployment・cleanup」**をまとめている。さらに2時間版には明示的なbufferがない。fileciteturn0file0

この時間設計が最大の構造的リスクである。

Cloud Run deploy、Artifact Registry push、API enable、初回Cloud Shell起動は、正常でも参加者ごとに待ち時間が異なる。5分遅れた参加者が一人出るだけで、後半のrollback → canary → scalingという本教材の最も価値の高い部分が圧迫される。

また現在の順番は、

> Dockerを作る  
> → GARへpush  
> → imageからCloud Runへdeploy  
> → 最後にsource deploy

となっている。

これは「魔法になる前に中身を理解する」という教材内の説明として筋が通っている。一方、**今回明示された最上位ゴールは「Google CloudのSaaS的アプローチを体感する」こと**である。その基準では、SaaS的体験の最たる `gcloud run deploy --source .` が1:55付近まで出ないのは、目的と順番が逆転気味である。

### 優先度が高い変更

**高：最初の30分以内に「code → HTTPS URL」の成功体験を置く。**

AWS実務者はDocker自体を学ぶことが主目的ではない。最初に準備済みrepositoryから、

```bash
gcloud run deploy handson-app \
  --source . \
  --region "${REGION}" \
  --allow-unauthenticated
```

まで進め、「コードだけ渡したのにHTTPS URLができた」を先に体験させる。

その後で、

> 「今何が隠されたのか。今日はここを一度分解します」

として Buildpacks → image → Artifact Registry → revision を説明する。

この順序は、**SaaSを体験 → abstractionを剥がす → abstractionを再評価する**という構成になり、今回のゴールに合う。

**高：4ファイルを参加者に手動作成させない。**

現在は`package.json`、`src/index.ts`、`Dockerfile`、`.dockerignore`をcopy & pasteする。Google Cloud未経験であることと、これらを手入力することには学習上の直接の関係がない。コードはrepositoryに用意し、参加者が変更するのは教材に書いてある通り `MESSAGE` と `BG_COLOR` の2行だけで十分である。fileciteturn0file0

認知負荷理論では、noviceが新しいschemaを獲得する段階ではworked exampleを使うことで不要なproblem-solving searchを減らせるという研究蓄積がある。近年の実験でもworked examplesによる認知負荷低下が報告されている。ただしこれはCloud workshopそのものを対象にした研究ではなく、本提案はその知見を技術教育へ適用する**設計上の推論**である。citeturn24search3turn24search8  
出典URL: [Sweller & Cooper](https://www.tandfonline.com/doi/abs/10.1207/s1532690xci0201_3)

**高：各章に「Expected result」と「Rescue」を置く。**

例えばdeploy章なら、

> **成功していれば:** `Service URL: https://...run.app` が表示される  
> **30秒以上ここで止まったら:** 講師を呼ばず、まず `gcloud run services list` を実行  
> **5分以上遅れている場合:** `git checkout checkpoint-04` から再開

という形式にする。

講師一人が20〜50人を救済するイベントでは、「エラーの説明を詳しく書く」より**正常系とcheckpointを明示する**方が効く。

`git tag checkpoint-02`、`checkpoint-04`、`checkpoint-06` のような完成状態をrepositoryに用意すると、参加者は途中で壊しても、

```bash
git reset --hard checkpoint-06
```

で本隊へ戻れる。

**高：最後の10分を必ずcleanup + recap用に確保する。**

「1:55〜2:00 logs + source deploy + cleanup」は削る。source deployは前へ移動し、最後は新しい操作を教えない。

最後の10分は、

```text
3分: Cloud Loggingを見る
3分: cleanup
4分: 今日の3問
```

程度が妥当である。

最後の3問は例えば、

> Cloud RunでVPCが最初から不要なのはなぜか？  
> Revisionとcontainer imageの違いは何か？  
> standard LambdaとCloud Runでinstance concurrencyはどう違うか？

にする。

retrieval practiceは、単に再読するより長期保持を高める可能性があることが実験研究で示されている。これもCloud技術研修に直接限定した研究ではないが、最後の数分を追加情報ではなく「思い出す時間」に使う根拠にはなる。citeturn24search11  
出典URL: [Roediger & Karpicke, Test-Enhanced Learning](https://doi.org/10.1111/j.1467-9280.2006.01693.x)

**高：オートスケール章を「台数を当てる実験」から「設定→挙動→観察」の実験へ変更。**

現在:

> 50 ÷ 10 = 5台前後になるはず

修正版:

> 「concurrency=10にすると、1 instanceへ同時に送れるrequest数を小さくしたので、default 80よりscale-outしやすくなる。何instanceまで増えるか予想してから実行しよう。autoscalerの判断が入るため、予想どおりの整数台になるとは限らない。」

この方が、結果が3台でも5台でも「なぜ？」という学習にできる。Cloud RunがrequestとCPU利用に応じてautoscaleするという現在のモデルとも一致する。citeturn23search5

### 優先度が中程度の変更

**中：AWS比較を「サービス対応表」から「設計判断表」へ寄せる。**

p.8の対応表は最初の辞書として残す。一方p.14では「Lambda/Fargate/App Runnerのどれか」という商品比較より、

> 「AWSでこれを作るなら何を自分で選択するか」  
> 「Cloud Runでは何を選択しなくてよくなるか」

を比較する。

例えばHTTPS applicationなら、

```text
AWS ECS:
VPC → subnet → security group → ECS → Fargate → ALB
→ listener → target group → ACM → autoscaling

Cloud Run:
gcloud run deploy
```

という**消えた意思決定の数**を見せる。

「Google Cloudの方が良い」と結論する必要はない。その代わり、

> Cloud Runでは自由度をplatform側へ渡すことで、application developerが決める項目を減らしている

と表現すれば、SaaS的アプローチを価値判断ではなくtrade-offとして説明できる。

**中：Service / Job / Worker poolをCloud Run章の最初に置く。**

2026年のCloud Run公式分類と揃え、

```text
HTTP / event → Service
終わる処理    → Job
常駐pull処理  → Worker pool
```

だけ最初に見せる。citeturn23search5

これで後半のJobsが「Cloud Runとは別の追加機能」ではなく、最初から同じplatformの別execution modelとして理解される。

**中：3時間版の発展編は「全部ハンズオン」にしない。**

現在の+60分を、次のようにすると情報密度が安定する。

| 時間 | 内容 | 方式 |
|---|---|---|
| +15分 | Pub/Sub push | 全員ハンズオン |
| +10分 | WebSocket chat | 全員またはpair |
| +10分 | Cloud Run Jobs + parallel task | 全員ハンズオン |
| +5分 | Worker pool + Pub/Sub pull | **講師デモ** |
| +5分 | GPU / Compose / IAP / multi-region紹介 | 講師デモ |
| +15分 | Q&A・遅延吸収 | buffer |

Worker poolは2026年の重要機能だが、Pub/Sub pushとpullの両modelをその場で全員に構築させると認知負荷が急増する。まず講師が対比だけ見せる方がよい。citeturn23search0turn23search5

**中：Pub/Subのunauthenticated構成を明示的に「教育用shortcut」とする。**

production版を別枠で載せている現在の設計は維持しつつ、「なぜまず認証を外したか」を書く。これにより、参加者はCloud Run integrationの仕組みとIAMを一度にdebugしなくて済む。Google公式production tutorialは認証service account方式を採用している。citeturn23search3

### 優先度が低いが効く変更

**低：GPUはハンズオンにしない。**

GPUは2025〜2026年Cloud Runの話題性が高いが、本教材ではAIではなくCloud Runのplatform modelが主役である。GPU deploymentはcontainer image・model download・memory・quota・cold-startという新たな論点を増やす。**「L4 GPUもscale-to-zeroする」1枚だけ**で十分インパクトがある。citeturn11search1

**低：Cloud Storage volume mountも本編には入れない。**

「Cloud Runはstateless」という理解を崩すように見え、初学者にはstorage semanticsまで説明する必要が生じる。Cloud Storage FUSEはPOSIX完全互換ではなく、write concurrencyにも注意事項があるため、発展資料へのリンクで十分である。citeturn12search0

**低：Cloud Shellを「VS Codeベース」と強く表現しない。**

参加者に必要なのは内部実装ではなく「browser editor + terminal」である。特に現在のCloud Shell Editorではcustom editor extensionsをinstallできないという制約があるので、「VS Codeと同じ」と誤認させないためにも「Cloud Shell Editor」と製品名だけで説明する方が長持ちする。citeturn16view0

### 推奨する2時間版の再構成

最も大きく変えるなら、次の構成を推奨する。これは**事実確認ではなく、本教材の目的から逆算した設計提案**である。

| 時間 | 内容 | 狙い |
|---|---|---|
| 0:00–0:10 | preflight・AWS経験poll | アカウント問題を最初に潰す |
| 0:10–0:22 | AWSとGoogle Cloudの思想差、Service/Job/Worker pool | mental modelを作る |
| 0:22–0:37 | **最初のsource deploy → HTTPS URL** | SaaS的体験を先に得る |
| 0:37–0:50 | 裏側: Buildpacks / image / GAR / revision | 「魔法」を分解 |
| 0:50–1:08 | Docker imageを明示build/push/deploy | abstractionの下を理解 |
| 1:08–1:23 | v2 deploy + revision rollback | immutable deployment |
| 1:23–1:38 | no-traffic / tag / canary | release control |
| 1:38–1:48 | concurrency / autoscaling | serverless runtime model |
| 1:48–1:52 | logs/metrics | observability |
| 1:52–2:00 | cleanup + 3-question recap | 安全に終了・定着 |

この順序にすると、参加者は**開始37分以内に「コードを渡すだけでURLが出る」体験**を持ち、その後にArtifact RegistryやDockerを学ぶため、「なぜGoogle Cloudはこれを隠せるのか」という問いを持った状態で下層を見られる。

現在の教材は技術内容そのものはかなり良く、revision、tag URL、traffic splitting、concurrency、scale-to-zero、Pub/Sub、WebSocket、JobsというCloud Runらしい特徴を一通り押さえている。最大の改善余地は「機能を増やすこと」ではなく、**2026年の仕様へ比較表を更新し、最初の成功を早め、操作の失敗要因を減らし、最後にbufferを作ること**にある。

特に改訂の順序を一つに絞るなら、**AWS比較表修正 → Worker pools追加 → Node 24表現修正 → pricing表現修正 → autoscaling期待値修正 → Scheduler API/SA修正 → checkpoint導入 → タイムテーブル再設計**の順が、正確性と当日成功率の両方に最も大きく効く。