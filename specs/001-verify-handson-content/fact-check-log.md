# 事実確認台帳 (fact-check-log)

## 0. この台帳の位置づけ

本ファイルは、Cloud Runハンズオン教材の全技術的主張を1件ずつ追跡し、事実確認を監査可能にするための**上位index兼指摘インベントリ**である。tasks.md の T003 / T004 に対応する。

- **確認基準日**: 2026-08-19(spec.md Assumptions に従う)。以降に公式ドキュメントが改定された場合、本台帳の判定は再確認が必要になる
- **一次情報の定義**: Google Cloud公式ドキュメント / AWS公式ドキュメント / Node.js公式ドキュメント / リポジトリ内の実コードそのもの。`research/deep-research-report.md` は**AIによるDeep Researchの結果であり二次情報**として扱う(data-model.md「一次情報源」の note、spec.md Assumptions)
- **したがって本台帳の「判定(レポート)」列は、レポート自身が下した判定の転記であり、確定した事実ではない**。各章の担当は、レポートが挙げた `source_url` を実際に開いて一次情報で裏取りし、その結果を章別フラグメントの `verdict` / `confirmed_on` / `resolution` に記録する
- **レポートと一次情報が食い違った場合は一次情報を正とする**(spec.md Edge Cases)
- 本台帳自身は判定を確定させない。確定は章別フラグメント(§2)で行い、本台帳は「どの指摘が、どの章の、どのフラグメントで決着するか」の対応付けだけを保つ

### data-model.md「事実確認項目」フィールドとの対応

| data-model.md のフィールド | 本台帳での扱い |
|---|---|
| chapter_id | §3 / §4 の章別セクションの見出し |
| location | `location` 列 |
| claim | `claim` 列 |
| verdict | 本台帳では確定させない。§3 は `判定(レポート)` 列(レポートの判定の転記)、§4 は一律 `未確認` で起票し、確定値は章別フラグメントに書く |
| source_url | `source_url` 列(レポートが挙げた候補URL。一次情報として開いたかは章別フラグメント側で管理) |
| confirmed_on | 本台帳には持たせない。章別フラグメント側で記録する |
| resolution | 本台帳には持たせない。章別フラグメント側で記録する |

### 今回のスコープ確定事項

本台帳の `スコープ` 列は次の確定事項に基づく。レポートの指摘であっても、以下に該当するものは `スコープ外(今回不採用)` として明示的に残す(黙って落とさない)。

| 確定事項 | 根拠 |
|---|---|
| 章立て・時間配分は**現行維持**。source deploy を先頭へ移す等の再編は不採用 | FR-013 |
| 発展編(`10_advanced`)は**既存記載の事実確認のみ**。2025〜2026年の新機能は本文へ追加せず `research/2025-2026-feature-additions.md` へ回す | FR-014 / FR-014b |
| チェックポイント用gitタグと各章の「成功していれば / 詰まったら」の追記は**採用**(別タスク T027〜T034 で実施) | FR-015 |

---

## 1. ID の付け方

| 接頭辞 | 由来 |
|---|---|
| `T-` | レポート「最も重要な発見トップ5」 |
| `F-` | レポート「教材の事実確認」判定テーブル |
| `N-` | レポート「Node.js 24とBuildpacks」節 |
| `G-` | レポート「`gcloud` コマンド」節 |
| `A-` | レポート「AWS比較表」節 |
| `R-` | レポート「当日の運用リスク」表 |
| `P-` | レポート「教材構成への改善提案」および「先行事例・類似教材から取り入れるべきもの」 |
| `U-` | 本台帳作成時に教材本文・コードから追加で洗い出した未確認項目(§4) |

---

## 2. 章別フラグメントへの index

各章の判定は `specs/001-verify-handson-content/fact-check/<章>.md` に章別フラグメントとして書かれる。命名規則は「章ディレクトリ名をそのままファイル名にする」「`10_advanced` 配下の個別ファイルと `code/` 配下はアンダースコアで連結する」とする。並行作業中のため未作成のものは「予定」と記す。

**注**: フラグメントの実ファイル名が下表と異なる場合は、実ファイル名を正として本表を更新する(本表は索引であり、命名規則を強制するものではない)。

| 章 | 本文パス | status (data-model.md) | フラグメント | 状態 |
|---|---|---|---|---|
| はじめに | `README.md` | — | 対象外(目次・導入。技術的主張は各章へ帰属) | — |
| 0. 事前準備 | `00_preparation/README.md` | 修正済み | `fact-check/00_preparation.md` | **完成**(正しい34 / 要修正5 / 未確認2) |
| 1. AWSとGoogle Cloudの考え方の違い | `01_aws_and_googlecloud/README.md` | 要再検証 | `fact-check/01_aws_and_googlecloud.md` | **完成**(正しい27 / 要修正8 / 未確認1) |
| 2. Dockerのおさらいとコンテナ起動 | `02_docker/README.md` | 修正済み | `fact-check/02_docker.md` | **完成**(正しい38 / 要修正2 / 未確認0) |
| 3. Cloud Runとは | `03_cloudrun/README.md` | 修正済み | `fact-check/03_cloudrun.md` | **完成**(正しい23 / 要修正0 / 未確認0、本文変更なし) |
| 4. Cloud Runへデプロイする | `04_deploy/README.md` | 要再検証 | `fact-check/04_deploy.md` | **完成**(正しい14 / 要修正2 / 未確認4、T026 で更新) |
| 5. 更新とロールバック | `05_revision/README.md` | 要再検証 | `fact-check/05_revision.md` | **完成**(正しい15 / 要修正2 / 未確認1、T026 で更新) |
| 6. カナリアリリースとタグ付きURL | `06_traffic/README.md` | 要再検証 | `fact-check/06_traffic.md` | **完成**(正しい13 / 要修正3 / 未確認1、T026 で更新) |
| 7. オートスケールを観察する | `07_scaling/README.md` | 修正済み | `fact-check/07_scaling.md` | **完成**(正しい18 / 要修正13 / 未確認1、T026 で更新) |
| 8. ログとメトリクスをのぞく | `08_observability/README.md` | 要再検証 | `fact-check/08_observability.md` | **完成**(正しい13 / 要修正0 / 未確認2、T026 で更新) |
| 9. 締め: Dockerfileすら書かないデプロイ | `09_source_deploy/README.md` | 要再検証 | `fact-check/09_source_deploy.md` | **完成**(正しい11 / 要修正1 / 未確認1、T026 で更新) |
| 10. 発展編(導入) | `10_advanced/README.md` | 修正済み | `fact-check/10_advanced.md` | **完成**(正しい17 / 要修正0 / 未確認1) |
| 10-1. Pub/Subとつなぐ | `10_advanced/pubsub.md` | 修正済み | `fact-check/10_advanced_pubsub.md` | **完成**(正しい18 / 要修正1 / 未確認1、T026 で更新) |
| 10-2. WebSocketチャット | `10_advanced/websocket.md` | 修正済み | `fact-check/10_advanced_websocket.md` | **完成**(正しい15 / 要修正2 / 未確認0) |
| 10-3. Cloud Run Jobs | `10_advanced/jobs.md` | 修正済み | `fact-check/10_advanced_jobs.md` | **完成**(正しい32 / 要修正0 / 未確認0、T026 で更新。2026-08-30 に #30〜#32 を追加) |
| 99. 後片付け | `99_cleanup/README.md` | 要再検証 | `fact-check/99_cleanup.md` | **完成**(正しい13 / 要修正6 / 未確認1、T026 で更新) |
| サンプルアプリ・WebSocketサンプル | `code/app/*`, `code/websocket/*` | 要再検証 | `fact-check/code_samples.md` | **完成**(正しい17 / 要修正1 / 未確認0、`code/` は変更不要、T026 で更新) |

`code/app` と `code/websocket` は当初 `code_app.md` / `code_websocket.md` に分ける想定だったが、実際には両者をまとめた `code_samples.md` 1ファイルで検証された。実ファイル名を正とする。

`support/` 配下は `.bookignore` によりビルド対象外のため spec.md Assumptions ではスコープ外としていたが、`--min-instances 1` による講師側のアイドル課金が後片付け手順の不在で放置される問題が判明したため、利用者の承認を得て今回のスコープへ追加した。

**フラグメント完成状況(2026-08-19 時点)**

- `fact-check/03_cloudrun.md`: 完成。判定は「正しい23件 / 要修正0件 / 未確認0件」で、`03_cloudrun/README.md` の本文変更なし。§3.4 の `T-01` / `T-02` / `T-03` / `F-01`〜`F-04` / `F-06`〜`F-10` / `A-01`〜`A-08` はこのフラグメントで決着済み(既に本文へ反映されていたことを一次情報で確認した結果、追加修正が不要だった)。SC-002 の判定時は、当該フラグメントの23件に §3.4 の対象IDが漏れなく含まれているかを突き合わせる
- **2026-08-19 T026 時点: 「予定」の行は0件。** 上表17ファイルすべてが作成済みで、加えて実機検証4件(`fact-check/live-main-path.md` / `live-source-deploy.md` / `live-jobs.md` / `live-websocket.md`)と AWS 比較1件(`fact-check/aws-comparisons.md`)が追加されている。件数は T026 で判定表の行を機械的に数え直した実測値
- **2026-08-25 追記(index の補正)**: 上記の集計から2ファイルが漏れていた。`fact-check/live-dryrun-full.md`(通しリハーサル、実行日 2026-08-22)は T026 の集計時に存在していたが本 index に載っていない。加えて `fact-check/aws-ecs-express-mode.md`(App Runner 提供終了と ECS Express Mode、確認日 2026-08-25)を新設した。**章別ではなく章をまたぐ受け皿として `aws-comparisons.md` と同じ位置づけとする。** `ls specs/001-verify-handson-content/fact-check/*.md | wc -l` による実測は **23ファイル**(内訳: 章別15 / 章横断2 / コード1 / 実機検証5)
- **2026-08-26 追記(図の検証)**: `fact-check/figures.md`(各図が描画する事実、確認日 2026-08-26)を新設した。**これも章をまたぐ受け皿**で、`aws-ecs-express-mode.md` と同じ位置づけ。判定は「正しい39 / 要修正8 / 未確認1 / 判定なし1(計49行)」。

  スコープは**図が描画する内容に限る**。本文の記述を対象とする上表の章別フラグメントとは対象が異なり、**章別フラグメントの既存の判定を変更しない**。図は本文が書いていない具体値・固有名詞・矢印の向きを描くため、本文の検証が済んでいても図の検証は別に必要である、というのが分離の理由。

  要修正8件のうち3件(#32 / #33 / #35)は、**`08_observability/README.md` の作図指示ブロックそのものに事実誤りがあった**ケースで、図と指示の両方を修正した。`07_scaling/README.md` の図7の指示にあった「16分後に0台」も、実機記録に `instance_count = 0` の行がないため「推定」と明示する形へ直した。いずれも FR-013 の「事実関係の修正」に該当するため、FR-013a の手続きは要さないと判断した。

  `ls specs/001-verify-handson-content/fact-check/*.md | wc -l` による実測は **24ファイル**(内訳: 章別15 / 章横断3 / コード1 / 実機検証5)

- **2026-08-30 追記(Cloud Run instances の提供状況)**: `fact-check/cloudrun-instances.md`(第4のリソースタイプ Cloud Run instances の提供状況、確認日 2026-08-30)を新設した。**これも章をまたぐ受け皿**で、`aws-ecs-express-mode.md` と同じ位置づけ。判定は「確認済み6 / 未確認0(計6項目)」(初版は確認済み4 / 未確認2。同日中に料金区分と GPU を確定させた)。

  スコープは**提供状況(launch stage / 招待制か / gcloud サーフェス / 対応リージョン / 料金区分 / GPU 対応)の確定に限る**。本文へどう書くか(3モデル→4モデルへの更新、発展編での紹介、後片付け手順の追加)は別タスクで扱うため、**章別フラグメントの既存の判定を変更しない**。

  食い違っていた2つの情報のうち「リリースノートに 2026-08-25 付で Preview 掲載・`gcloud beta run instances` あり」が正しく、「招待制の select customers 限定・`gcloud alpha`」は公式ドキュメントで裏付けられなかった。

  `ls specs/001-verify-handson-content/fact-check/*.md | wc -l` による実測は **25ファイル**(内訳: 章別15 / 章横断4 / コード1 / 実機検証5)

---

## 3. レポート由来の指摘インベントリ

`research/deep-research-report.md` から抽出した全指摘。`location` のページ番号はレポートが基準としたPDF(`handson-cloudrun.pdf`)のページであり、章への割り当ては本台帳作成時に本文と突き合わせて行った。

### 3.1 `00_preparation`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| G-06 | p.6 有効化API一覧 | 有効化しているのは `run` / `artifactregistry` / `cloudbuild` / `pubsub` のみで `cloudscheduler.googleapis.com` がない | 要修正(3時間版でSchedulerを扱うなら必須) | https://cloud.google.com/run/docs/execute/jobs-on-schedule | 今回対応 |
| R-08 | p.5 無料トライアル | 「90日 / $300」 | 正しい(現在も90日・$300 Welcome credit。支払い方法による本人確認が必要、明示的upgradeなしに自動課金されない) | https://cloud.google.com/signup-faqs | 今回対応 |
| R-03 | 復旧ブロック | Cloud Shell session切断時に環境変数などを復旧する「再開用command block」が必要(どこで防ぐか=教材) | 要対応 | https://cloud.google.com/shell/docs/quotas-limits | 今回対応 |
| R-06 | 事前準備 | third-party cookie無効/incognitoではCloud Shell Editorが読み込めない。incognitoを避け、開かない場合は新規ウィンドウで開く(どこで防ぐか=事前+教材) | 要対応 | https://cloud.google.com/shell/docs/quotas-limits | 今回対応 |
| R-07 | 事前準備 | Organization Policy(domain restricted sharing / 2024-05以降のsecurity baseline)で `allUsers` 付与が拒否され `--allow-unauthenticated` が失敗しうる。個人アカウント推奨(どこで防ぐか=事前+troubleshooting) | 要対応 | https://cloud.google.com/resource-manager/docs/organization-policy/restricting-domains | 今回対応 |
| R-10 | 事前準備 | Cloud Shellの制約: 週次quota 50時間、非対話セッション40分、セッション最大12時間、`$HOME` は5GBまで永続 | 事前チェック対象として明記推奨 | https://cloud.google.com/shell/docs/quotas-limits | 今回対応 |
| P-16 | Cloud Shellの説明 | Cloud Shell Editorを「VS Codeベース」と強く表現しない(custom extensionsをinstallできない制約がある) | 表現修正推奨(低優先) | https://cloud.google.com/shell/docs/quotas-limits | 今回対応 |
| P-05 | 復旧ブロック | 各章に散らした復旧手順を、全章共通の「困ったらここ」1ブロックにまとめる | 採用推奨 | https://cloud.google.com/run/docs/tutorials/autoscale-workerpools-pubsub | 今回対応(現状の「復旧ブロック(困ったらここ)」で足りるかを確認) |
| P-18 | 章冒頭 | Google公式チュートリアルに倣い、冒頭で Objectives / Costs / Before you begin / 必要IAM role / 必要API を明記する | 採用推奨 | https://cloud.google.com/run/docs/tutorials/autoscale-workerpools-pubsub | 今回対応(FR-009と同趣旨) |

### 3.2 `01_aws_and_googlecloud`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| P-10 | p.8 サービス対応表 | 対応表は「最初の辞書」として残しつつ、より重要な比較を「AWSで身についた反射 → Cloud Runでの体験 → 教えるべき差」という**設計判断表**へ移す | 改善提案(中優先) | https://cloud.google.com/blog/products/gcp/google-cloud-iam-for-aws-users/ | スコープ外(今回不採用): 事実の誤りではなく提示方法の変更で、FR-013「修正は各章の記述内容(事実関係)に限定」の外 → **2026-08-25 再判定: 採用(FR-013a)。§7.1 参照。当初の不採用理由は取り消さず、前提が変わったことによる再判定として扱う** |
| P-18b | p.8 サービス対応表 | 製品名の1対1対応より、Organization → Folder → Project → Resource の階層・policy inheritance・Projectというtrust boundaryをAWS利用者の既存知識へ接続する方式が有効 | 改善提案 | https://cloud.google.com/blog/products/gcp/google-cloud-iam-for-aws-users/ | スコープ外(今回不採用): 章の構成追加であり事実関係の修正ではない。ただし「アカウント構造の違い」表の既存記載の事実確認は §4 U-04〜U-06 で今回対応 → **2026-08-25 再判定: 一部採用(FR-013a)。比較軸の付け替えのみ採用し、階層・policy inheritance の節の新設は引き続き不採用。§7.1 参照** |

> レポートは `01_aws_and_googlecloud` の個別の事実誤りを1件も指摘していない(レポートは主に `03_cloudrun` のAWS比較表を対象にしている)。したがって本章は §4 の追加未確認項目が事実確認の主体になる。

### 3.3 `02_docker`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| T-04 / N-01 | p.9 / p.12 | 「Node.js 24はTypeScriptをそのまま実行できる」 | 要修正。一般論として書くと危険。型チェックをせず、`tsconfig.json` を通常の意味では解釈せず、既定で扱えるのは消去可能なTypeScript構文が中心。「Node.js 24のbuilt-in type strippingを使い、この教材で使う範囲のTypeScriptはビルドなしで実行する」と限定する | https://nodejs.org/api/typescript.html | 今回対応 |
| N-02 | p.9 | Node.js 24を選んだ理由を「最新だから」ではなく「ビルドステップを1つ消し、Cloud Runの概念に認知資源を集中させるため」と説明する | 表現改善提案 | (教育設計上の提案。一次情報なし) | 今回対応 |
| N-03 | p.9 `package.json` | `engines: {"node": ">=24"}` | 要修正。Google Cloud BuildpacksのドキュメントはNodeバージョンにSemVerを使える一方 greater-than(`>`)系指定を避けるよう明示。`"24.x"` 等へ | https://cloud.google.com/docs/buildpacks/nodejs | 今回対応 |
| N-06 | p.9 | 「HonoなのでNode.js / Cloudflare Workers / Denoでも同じコードが動く」 | 言い過ぎ(要修正)。掲載コードには `@hono/node-server` / `node:crypto` / `Buffer` / `process.env` があり無変更で他runtimeへ移せない。「Hono自体は複数runtimeに対応する。今回はNode.js adapterとNode.js APIを使う」へ | (リポジトリ内の実コード = 一次情報。`code/app/src/index.ts`) | 今回対応 |
| P-06 | p.9 ファイル作成手順 | `package.json` / `src/index.ts` / `Dockerfile` / `.dockerignore` の4ファイルを参加者に手動作成させない。コードはリポジトリに用意し、変更するのは `MESSAGE` と `BG_COLOR` の2行だけにする | 改善提案(高優先)。ただし根拠は認知負荷理論の技術教育への**適用推論**であるとレポート自身が明記 | https://www.tandfonline.com/doi/abs/10.1207/s1532690xci0201_3 | 今回対応(`code/app` に同梱済み。本文がコピペ手順のままかを章担当が確認) |

### 3.4 `03_cloudrun`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| T-01 | p.14 AWS比較表 | 「Lambda = 1リクエスト1実行環境」「LambdaのHTTPS URLにはAPI Gateway等が必要」「App Runnerの実行時間上限なし」 | 要修正(3点とも)。教材全体で最も優先度が高い | https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances.html / https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html / https://docs.aws.amazon.com/apprunner/latest/dg/develop.html | 今回対応 |
| A-01 | p.14 | Lambda「1リクエスト = 1実行環境」「Lambdaは1リクエスト1環境なのでインスタンス数が爆発しがち」 | 要修正。「Lambda default computeでは1 execution environmentあたり最大1 invocation」とし、2025-11登場の Lambda Managed Instances を例外として区別。断定に「standard Lambdaでは」の修飾を入れる | https://docs.aws.amazon.com/lambda/latest/dg/lambda-managed-instances.html | 今回対応 |
| A-02 | p.14 | Lambda「HTTPS URL = 要API Gateway等」 | **誤り**。Lambda Function URLsで単体でHTTPS endpointを発行できる。API Gatewayが必要なのはrouting / API management / WebSocket API等 | https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html | 今回対応 |
| A-03 | p.14 | App Runner「実行時間上限なし」 | **誤り**。AWS公式はHTTPリクエスト全体のtotal request timeoutを120秒としている。Cloud Runの60分との対比として教材に入れる価値が高い | https://docs.aws.amazon.com/apprunner/latest/dg/develop.html | 今回対応 |
| A-04 | p.14 | App Runner「常時 + リクエスト課金」 | 意味は近いが用語を修正推奨。idle時もprovisioned containerのmemoryに課金、requestを処理するactive containerではvCPUとmemoryが課金。既定のprovisioned instance数は1 | https://aws.amazon.com/apprunner/pricing/ | 今回対応 |
| A-05 | p.14 | App Runner「WebSocket 不可(×)」 | **未確認**と表記するのが安全。現行developer guideはHTTP/1.0・HTTP/1.1と120秒timeoutを記載するが、2026年時点で「WebSocketを正式サポートする」記述は確認できなかった。「長時間WebSocket用途には不向き / 公式サポート状況を開催直前に再確認」が堅い | https://docs.aws.amazon.com/apprunner/latest/dg/develop.html | 今回対応 |
| A-06 | p.14 | 比較列名が「Fargate」 | 技術的誤りではなく比較粒度の問題。FargateはECS taskのcompute optionでApp Runner / Cloud Runに対応するapplication serviceではないため、列名を「ECS on Fargate + ALB + Service Auto Scaling」にする | (レポートの設計判断。一次情報なし) | 今回対応 |
| A-07 | p.14 | Lambdaの標準execution timeout上限15分 | 正しい(現在も維持) | https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html | 今回対応 |
| A-08 | p.14 | 比較軸を「HTTPS URL」の○×で示している | 表現改善提案。「managed HTTPS endpoint / arbitrary HTTP server・container / request timeout / instance内multi-concurrency / scale to zero」という軸へ変える方が有益 | 同 A-01〜A-03 | 今回対応 → **2026-08-25: 決着先を `fact-check/03_cloudrun.md` #24〜 に確定。それまでフラグメント上に対応行が存在しなかった(§6.4 確認項目2 のギャップ)。§7.1 参照** |
| T-02 / F-01 | p.15 無料枠 | 「18万 vCPU秒 / 36万 GiB秒 / 200万リクエスト」 | 条件付きで正しい。request-based billingの無料枠としては正しいが、instance-based billingには別枠 240,000 vCPU秒 / 450,000 GiB秒がある | https://cloud.google.com/run/pricing | 今回対応 |
| F-02 | p.14 | 「Cloud Run課金 = リクエスト処理中のみ(常時割当に変更可)」 | 要修正。現在の正式な区分は request-based billing / instance-based billing。request-basedでも起動処理等が課金対象、minimum instancesのアイドル時間も完全無料ではない。旧用語「CPU only during request / CPU always allocated」を主語にしない | https://cloud.google.com/run/pricing / https://cloud.google.com/run/docs/configuring/billing-settings | 今回対応 |
| F-03 | p.15 | 「リクエストを処理していない間はCPU・メモリ課金なし」 | 単純化しすぎ。min instances=0の通常アイドル状態の説明としては概ね妥当だが、起動・graceful shutdown・minimum instance idleなど例外がある | https://cloud.google.com/run/pricing | 今回対応 |
| F-04 | p.14 | 「request timeout 60分」 | 正しい。デフォルト5分・最大60分。15分超の処理では再接続・リトライ可能な設計をGoogleが推奨 | https://cloud.google.com/run/docs/configuring/request-timeout | 今回対応 |
| F-06 | p.14 / p.23 | 「concurrencyデフォルト80」 | 概念としては可、表現修正推奨。デフォルト1 vCPU構成の説明としては妥当だが、2026年のドキュメントでは作成方法・vCPU数によりデフォルトの扱いに差がある。設定可能な最大は1インスタンスあたり1000。普遍的な固定値として教えない | https://cloud.google.com/run/docs/about-concurrency | 今回対応 |
| F-07 | (記載なし) | CPU / Memory上限の明示がない | 補足推奨。通常のCloud Run Serviceでは最大 8 vCPU / 32 GiB memory。GPU構成は別なので「通常CPUサービスの上限」と断る | https://cloud.google.com/run/docs/configuring/services/cpu / https://cloud.google.com/run/docs/configuring/services/memory-limits | 今回対応 |
| T-03 / F-09 | p.15 制約 | 「リクエスト起点でない常駐処理 → 常時割当CPU設定かGKE」/ 「Cloud RunにはServiceとJob」という世界観 | 2026年4月以降は古い(要修正)。Service / Job / Worker pool の3種で、Worker poolsは2026-04-14にGA。Kafka consumer・Pub/Sub pull・RabbitMQ consumer等のpull型常駐ワーカーはWorker poolsの本来の用途 | https://cloud.google.com/run/docs/overview/what-is-cloud-run / https://cloud.google.com/run/docs/release-notes | 今回対応 |
| F-10 | p.15 料金 | 料金説明の構成 | 表現修正推奨。「Serviceのデフォルトはrequest-based billing」「request処理中を中心に課金、scale-to-zero時はインスタンス課金なし、起動処理やminimum instancesには例外」「常時CPUが必要ならinstance-based billingを選べる」の3行に置き換える。東京はTier 1で単価は request-based: CPU $0.000024/vCPU-s、memory $0.0000025/GiB-s、request $0.40/1M、instance-based: CPU $0.000018/vCPU-s、memory $0.000002/GiB-s。価格は改定されるため単価より「2種類のbilling modelと無料枠」を中心にし、価格表へのURLを載せる | https://cloud.google.com/run/pricing | 今回対応 |
| P-09 | 章構成 | Service / Job / Worker poolの3分類をCloud Run章の**最初**に置く(2026年のCloud Run公式分類と揃える) | 改善提案(中優先) | https://cloud.google.com/run/docs/overview/what-is-cloud-run | スコープ外(今回不採用): 章内の節順の変更であり、FR-013「修正は各章の記述内容(事実関係)に限定」の外。3実行モデル自体の記載は T-03 として今回対応 |

### 3.5 `06_traffic`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| G-01 | p.21 | `gcloud run deploy --no-traffic --tag staging` | 有効(正しい)。`--no-traffic` と `--tag` は現行stableの `gcloud run deploy` に存在し、タグ付きrevision URLを作りつつproduction trafficを流さないという説明も妥当 | https://cloud.google.com/sdk/gcloud/reference/run/deploy | 今回対応 |
| G-02 | p.22 | `gcloud run services update-traffic --to-tags staging=10` / `--to-latest` | 有効(正しい)。現行CLIには `--to-tags` / `--to-revisions` / `--to-latest` があり、10%だけtagへ送る例も成立する | https://cloud.google.com/sdk/gcloud/reference/run/services/update-traffic | 今回対応 |
| G-03 | p.22 | `--to-latest` を「今のrevisionに100%戻す」とだけ説明している | 補足推奨。`LATEST` へのtraffic割当という意味を持つため、その後のdeploy動作との関係まで説明するとrevision / traffic modelの理解が深まる | https://cloud.google.com/sdk/gcloud/reference/run/services/update-traffic | 今回対応(`05_revision` の `--to-latest` 記載にも同じ指摘が及ぶ) |

### 3.6 `07_scaling`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| T-05 / P-02 | p.23〜25 | 「50接続 ÷ concurrency 10 = 5台前後まで増えるはず」 | 要修正。イベントで最も「教材どおりにならない」可能性が高い箇所。autoscalerは単純な整数除算で台数を決めず、リクエスト負荷やCPU利用でスケールする。「concurrencyを下げると同じ同時リクエスト数でもより多くのインスタンスが必要になる。台数は概算であり5台は保証されない」へ。実験を「台数を当てる」から「設定→挙動→観察」へ変える | https://cloud.google.com/run/docs/about-concurrency / https://cloud.google.com/run/docs/overview/what-is-cloud-run | 今回対応 |
| F-08 | p.23 | 「必要インスタンス数 ≒ 同時request / concurrency」 | 概念式としてのみ正しい。capacityの直感を得る式には使えるが、autoscalingの結果を保証する式ではない | https://cloud.google.com/run/docs/overview/what-is-cloud-run | 今回対応 |
| R-02 | p.25 | `hey` をS3からdownloadして負荷をかける | 要修正(どこで防ぐか=**教材修正**)。binary download / architecture判定 / S3 reachability / executable permission という4つの失敗要因を持つ外部依存。Node.js標準APIだけで負荷をかける `load.mjs` をリポジトリに同梱し `node load.mjs "${SERVICE_URL}/heavy" 50` だけ打たせる | https://cloud.google.com/shell/docs | 今回対応 |

### 3.7 `09_source_deploy`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| N-04 | p.28 | 「Dockerfileを消すとBuildpacksがpackage.jsonを見てNode.jsアプリと判断し、npm startで起動する」 | 基本的に正しい。`gcloud run deploy --source .` はDockerfileがあればそれを利用し、なければGoogle Cloud Buildpacksによるbuildを利用できる。Node.js buildpackは `package.json` の `scripts.start` をentrypointに利用できる | https://cloud.google.com/run/docs/deploying-source-code / https://cloud.google.com/docs/buildpacks/nodejs | 今回対応 |
| P-07 | 章順序 | 最初の30分以内に `gcloud run deploy --source .` で「code → HTTPS URL」の成功体験を置き、その後にBuildpacks → image → GAR → revisionを分解する(SaaSを体験 → abstractionを剥がす → 再評価する) | 改善提案(高優先) | (レポートの設計提案。一次情報なし) | スコープ外(今回不採用): FR-013により章立て・章順は現行維持 |

### 3.8 `10_advanced/pubsub.md`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| R-05 | 認証付きpush | IAM変更直後は数分間403が見えることがある。「1〜数分待ってretry」の明記が必要(どこで防ぐか=教材) | 要対応 | https://cloud.google.com/run/docs/tutorials/pubsub | 今回対応 |
| P-04 | unauthenticated構成 | 「まずunauthenticatedで仕組みを見せ、productionではSA認証」という段階分けは教育設計として妥当。ただしunauthenticated版の直上に「この設定は配送の仕組みを短時間で観察するためのハンズオン用。実務では次節の認証付きpushを使う」という警告ボックスを置く。AWS実務経験者ほど「教材のサンプルが推奨構成」と解釈しやすい | 改善提案(中優先) | https://cloud.google.com/run/docs/tutorials/pubsub | 今回対応(誤解防止であり事実の正確性に属する) |
| P-12 | 発展編構成 | 3時間版の最後を「Pub/Subでイベントが入る → Cloud Runが処理する → browserやlogで即座に結果が見える」という1つのcapstone storyにする | 改善提案 | https://cloud.google.com/pubsub/docs/streaming-cloud-pub-sub-messages-over-websockets | スコープ外(今回不採用): 発展編の構成再編であり、FR-014「既存記載の事実確認のみ」の外 |

### 3.9 `10_advanced/websocket.md`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| F-05 | p.33 | WebSocket「デフォルト5分、最大60分」 | 正しい。WebSocketもCloud Run上では長時間HTTP requestとして扱われるためrequest timeoutの対象。最大60分という説明は維持してよい | https://cloud.google.com/run/docs/configuring/request-timeout | 今回対応 |

### 3.10 `10_advanced/jobs.md`

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| G-04 | p.35 | `gcloud beta run jobs logs read` | 要修正。`run jobs logs read` は現在stable groupにあるため、教材であえて `beta` を使う理由はない | https://cloud.google.com/sdk/gcloud/reference/run/jobs/logs/read | 今回対応 |
| G-05 | p.36 | Cloud Schedulerでジョブを起動するコマンド | 構文自体は現在も有効。Cloud Run Job v2 の `:run` endpointをOAuth付きHTTP requestで呼ぶ構成は現行の公式手順と一致。`gcloud scheduler jobs create http` のHTTP methodの既定はPOSTだが、教材としては `--http-method=POST` を明示した方が意図が伝わる | https://cloud.google.com/run/docs/execute/jobs-on-schedule / https://cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http | 今回対応 |
| G-07 / R-04 | p.36 | 表示名から「Compute Engine default service account」を検索してOAuth identityに使っている | 要修正(どこで防ぐか=教材)。企業組織ではdefault service accountの扱いがorganization policyで制限されることがあり、Googleは2024年以降 新規organizationにdefault SAへの強い権限の自動付与を抑制するsecurity baselineを適用。Scheduler専用SAを作り必要なInvoker権限だけ与える方法が実務的で再現性が高い | https://cloud.google.com/run/docs/execute/jobs-on-schedule / https://cloud.google.com/resource-manager/docs/secure-by-default-organizations | 今回対応 |
| P-17a | Jobs章 | Jobsのtask timeout上限7日(最大168時間、2025-11 GA)をJobs章に追記する。「Lambdaなら15分」という比較をより印象的にできる | 追記推奨 | https://cloud.google.com/run/docs/release-notes | 今回対応(既に「最大7日間」と記載があるため、値の一次情報確認として扱う) |

### 3.11 章横断・チェックポイント

| # | location | claim | 判定(レポート) | source_url | スコープ |
|---|---|---|---|---|---|
| P-01 | `04_deploy`〜`10_advanced` 各章 | 各章に「成功していれば」(期待結果)と「詰まったら」(レスキュー手順)を置き、`checkpoint-04` のような完成状態のgitタグを用意して `git reset --hard checkpoint-XX` で本隊へ戻れるようにする。講師1人で20〜50人を救済するイベントでは「エラーの説明を詳しく書く」より正常系とcheckpointの明示が効く | 改善提案(高優先) | (レポートの運用提案。一次情報なし) | 今回対応(FR-015。別タスク T027〜T034) |
| P-03 | 環境変数の `export` 直前(`04_deploy` 他) | 環境変数を多用するため冒頭に `set -u` を置き、「変数を設定し忘れた状態で別projectや空文字列に対してcommandを打つ」事故を早期発見する(Google公式Worker pool + Pub/Sub tutorialの設計) | 採用推奨 | https://cloud.google.com/run/docs/tutorials/autoscale-workerpools-pubsub | 今回対応 |
| P-13 | 全体の時間配分 | 「1:55〜2:00 に logs + source deploy + cleanup」をやめ、最後の10分をcleanup + recap(3分 Cloud Logging / 3分 cleanup / 4分 今日の3問)に確保する。source deployは前へ移動 | 改善提案(高優先) | https://doi.org/10.1111/j.1467-9280.2006.01693.x | スコープ外(今回不採用): 時間配分・章順の再編でFR-013の外 |
| P-08 | 全体構成 | 推奨する2時間版の再構成(0:00 preflight → 0:10 思想差 → 0:22 最初のsource deploy → 0:37 裏側分解 → …→ 1:52 cleanup + 3問recap)。レポート自身が「事実確認ではなく目的から逆算した設計提案」と明記 | 改善提案(最大の変更) | (レポートの設計提案。一次情報なし) | スコープ外(今回不採用): タイムテーブル全面再設計でFR-013の外 |
| P-11 | 発展編の時間配分 | 3時間版の+60分を「+15分 Pub/Sub push(全員)/+10分 WebSocket/+10分 Jobs/+5分 Worker pool 講師デモ/+5分 GPU・Compose・IAP・multi-region紹介/+15分 Q&A・遅延吸収」に組み替える | 改善提案(中優先) | https://cloud.google.com/run/docs/tutorials/autoscale-workerpools-pubsub | スコープ外(今回不採用): 時間配分の再編 + 発展編への新機能追加でFR-013 / FR-014の外 |
| P-14 | 発展編 | GPUはハンズオンにせず「L4 GPUもscale-to-zeroする」1枚だけにする | 改善提案(低優先) | https://cloud.google.com/run/docs/release-notes | スコープ外(今回不採用): 発展編への新機能追加でFR-014の外。`research/2025-2026-feature-additions.md`(T035)へ回す |
| P-15 | 発展編 | Cloud Storage volume mountも本編には入れず、発展資料へのリンクで十分(FUSEはPOSIX完全互換ではなく write concurrencyにも注意) | 改善提案(低優先) | https://cloud.google.com/run/docs/release-notes | スコープ外(今回不採用): 本文へ追加しない方針と一致するため本文変更は不要。`research/2025-2026-feature-additions.md`(T035)へ回す |
| P-17 | 発展編 | 2025〜2026年新機能表(Worker pools / NVIDIA L4 GPU for Services / GPU for Jobs / RTX PRO 6000 Blackwell / Docker Compose deployment / Direct IAP integration / Multi-region service health / HTTP・gRPC readiness probe / Ephemeral disk / custom CPU・concurrency scaling targets / Cloud Storage volume mount options / Budget spend caps)を教材へ反映する | 改善提案(機能ごとに「本編で言及」「講師デモ」「言及だけ」と判定) | https://cloud.google.com/run/docs/release-notes | スコープ外(今回不採用): FR-014により本文へ追加しない。FR-014b / T035 で `research/2025-2026-feature-additions.md` へ回す。**例外**: Worker pools(T-03)と Jobs task timeout 7日(P-17a)は既存記載の事実修正として今回対応 |
| P-19 | (参考) | 2025〜2026年時点でCloud Runの現行仕様に追随し、かつ客観的に「評価が高い」と判断できるAWS→Google Cloud向けコミュニティ教材は特定できなかった。**コミュニティ資料の人気度は未確認**。ベンチマークには更新日が明確なGoogle公式Codelab / tutorialを使う方が安全 | 未確認(レポート自身が明記) | https://cloud.google.com/run/docs/quickstarts | 今回対応(教材変更なし。参照方針の確認のみ) |

### 3.12 教材本文の修正を伴わない運用リスク(参考・非対応)

レポート「当日の運用リスク」表のうち「どこで防ぐか」が事前アナウンス・運用であり、教材本文の修正を伴わないもの。本機能では教材本文を変更しないが、判断の記録として残す。

| location | claim | どこで防ぐか | スコープ |
|---|---|---|---|
| 運用リスク表 | 無料trial signupが当日終わらない | 事前アナウンス | 今回対応外(教材本文の変更なし) |
| 運用リスク表 | corporate Google accountでCloud Shell禁止 | 事前必須 | 今回対応外(ただしR-07と併せて事前準備章での言及は今回対応) |
| 運用リスク表 | Cloud Shell weekly quota枯渇(Session information → Usage quotaで残り4時間以上を確認) | 事前 | 今回対応外(R-10として事前準備章での言及は今回対応) |
| 運用リスク表 | 会場Wi-Fi・Google認証/MFA(開始前に全員Console+Cloud Shellをopen、講師側にmobile hotspot) | 運用 | 今回対応外 |
| 運用リスク表 | Google側Cloud Shell障害(講師demo video / expected output screenshots) | 運用 | 今回対応外 |

---

## 4. 追加で洗い出した未確認項目

`research/deep-research-report.md` がカバーしていない技術的主張。`01_aws_and_googlecloud` / `04_deploy` / `05_revision` / `06_traffic` / `08_observability` / `09_source_deploy` / `99_cleanup` / `code/app` / `code/websocket` の現状の記載を読んで抽出した。

**全行の `verdict` は `未確認` で起票する。** 確定(`正しい` / `要修正` + `source_url` + `confirmed_on` + `resolution`)は各章担当が章別フラグメント(§2)で行う。本台帳の行は「起票済み・未決着」のリストであり、決着後もこの表から行を消さず、フラグメント側で決着済みであることを確認できる状態を保つ。

### 4.1 `01_aws_and_googlecloud`

| # | location | claim | verdict |
|---|---|---|---|
| U-01 | 「例: コンテナを1つ、HTTPSで公開するまで」表 | オートスケール: Cloud Runは「デフォルトで有効(0〜自動)」 | 未確認(既定の min instances = 0 と既定の maximum instances 値を一次情報で確認) |
| U-02 | 同表 | ログ: ECS/Fargateは「awslogs ドライバや FireLens を設定」 | 未確認(現行のECSログドライバ名・選択肢をAWS公式で確認) |
| U-03 | 同表 | TLS証明書: 「不要(`*.run.app` のHTTPS URLが自動発行)」 | 未確認(run.appドメインの自動HTTPS・証明書管理の記述を一次情報で確認。URL形式は U-11 と関連) |
| U-04 | 「アカウント構造の違い」表 | API: 「AWSは常に有効 / Google Cloudはプロジェクトごとに明示的に有効化」 | 未確認(AWSにもregion opt-inやサービス有効化があるため「常に有効」という断定の妥当性) |
| U-05 | 同表 | リージョン: 「AWSはコンソールでリージョンを切り替える / Google Cloudはコンソールは全リージョン横断」 | 未確認(断定の妥当性) |
| U-06 | 同表 | 権限の主体: 「AWSはIAMユーザー/ロール、Google CloudはGoogleアカウント/サービスアカウント」 | 未確認 |
| U-07 | サービス対応表 | Cloud Shell ↔ AWS CloudShell、「エディタ付き・Dockerが動く」 | 未確認(AWS CloudShellにもエディタがあるため差分の記述として妥当か。Cloud ShellのDocker pre-installedを一次情報で確認) |
| U-08 | サービス対応表 | Artifact Registry ↔ ECR、「コンテナ以外(npm, Maven等)も置ける」 | 未確認(GARがサポートする形式を一次情報で確認) |
| U-09 | サービス対応表 | Cloud Build ↔ CodeBuild、「ソースデプロイの裏側で動く」 | 未確認(2026年時点で `gcloud run deploy --source` がCloud Buildを使うかを一次情報で確認。U-33 と同じ論点) |
| U-10 | サービス対応表 | Cloud Monitoring ↔ CloudWatch、「メトリクスはデフォルトで収集済み」 | 未確認 |
| U-11 | サービス対応表 | Pub/Sub ↔ SNS + SQS、「1サービスで pub/sub もキューも担う」 | 未確認 |
| U-12 | サービス対応表 | Cloud Functions (Cloud Run functions) ↔ Lambda、「現在は Cloud Run 基盤に統合された」 | 未確認(現行の正式な製品名と統合状況を一次情報で確認) |
| U-13 | サービス対応表 | GKE ↔ EKS、「Kubernetes 発祥の地だけあり完成度が高い」 | 未確認(前段の事実部分。後段は主観表現) |
| U-14 | サービス対応表 | Spanner「(相当なし / 強いて言えば Aurora)グローバル分散RDB」/ BigQuery ↔ 「Redshift + Athena」 | 未確認(対応付けの妥当性) |
| U-15 | サービス対応表 | Cloud Tasks ↔ 「SQS(遅延キュー用途)」「HTTPターゲットに直接push」/ Cloud Scheduler ↔ EventBridge Scheduler / Eventarc ↔ EventBridge | 未確認(対応付けの妥当性) |
| U-16 | サービス対応表 | Cloud Load Balancing ↔ 「ALB/NLB + CloudFront の一部」「グローバル単一エニーキャストIP」 | 未確認 |
| U-17 | サービス対応表 | IAM サービスアカウント ↔ IAM ロール、「『アカウント』だが実体はロールに近い」 | 未確認 |

### 4.2 `04_deploy`

| # | location | claim | verdict |
|---|---|---|---|
| U-18 | 1. Artifact Registry | `gcloud artifacts repositories create ${REPO} --repository-format=docker --location=${REGION} --description=...` | 未確認(現行stableのフラグ名を一次情報で確認) |
| U-19 | 1. Artifact Registry | `gcloud auth configure-docker ${REGION}-docker.pkg.dev` は「ECRの `aws ecr get-login-password` に相当。こちらは一度設定すれば**期限切れがありません**」 | 未確認(credential helperの仕組み上「期限切れがない」という断定が妥当か) |
| U-20 | 2. push | GARのイメージパス形式が `リージョン-docker.pkg.dev/プロジェクト/リポジトリ/イメージ名:タグ` | 未確認 |
| U-21 | 2. push | `gcloud artifacts docker images list ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}` の引数形式 | 未確認 |
| U-22 | 3. deploy | `gcloud run deploy handson-app --image ... --region ... --allow-unauthenticated` | 未確認(現行stableのフラグ構成) |
| U-23 | 3. deploy | 「デフォルトは IAM 認証必須(=閉じている)で、AWS と逆のデフォルト」 | 未確認(Cloud Runの既定の認証設定を一次情報で確認) |
| U-24 | 3. deploy | 「30秒ほどで完了」 | 未確認(所要時間の目安としての妥当性。保証値ではない旨の表現が必要か) |
| U-25 | 3. deploy | Service URL 形式が `https://handson-app-xxxxx.a.run.app` | 未確認(**重要**: 現行のrun.app URL形式が `<service>-<hash>.<region>.run.app` 等へ変わっていないかを一次情報で確認。変わっていれば 06_traffic のタグ付きURL形式 U-30 も連動) |
| U-26 | 4. 確認 | `K_SERVICE` / `K_REVISION` は Cloud Run が注入する環境変数 | 未確認(コンテナランタイムの契約を一次情報で確認) |
| U-27 | ふりかえり | 「タスク定義(CPU/メモリ/ポート)を書かなかった ※デフォルト値で開始」 | 未確認(既定のCPU / memory / port値を一次情報で確認) |
| U-28 | 0. 環境変数 | `export REGION=asia-northeast1` を「東京リージョン」と説明 | 未確認(リージョン名と所在地の対応を一次情報で確認) |
| U-29 | 章全体 | 本章の手順が前提とする有効化済みAPI(`artifactregistry.googleapis.com`, `run.googleapis.com`)が `00_preparation` の一覧と一致しているか | 未確認(FR-009の観点。章間整合) |

### 4.3 `05_revision`

| # | location | claim | verdict |
|---|---|---|---|
| U-30 | 2. deploy | 「2回目以降は `--allow-unauthenticated` などの設定を繰り返す必要はない。サービスの設定は維持され、変更したもの(イメージ)だけが新しいリビジョンとして記録される」 | 未確認(`gcloud run deploy` の設定継承挙動を一次情報で確認) |
| U-31 | 2. deploy | 「ダウンタイムなしで切り替わった」 | 未確認(新リビジョンへのtraffic移行の挙動を一次情報で確認) |
| U-32 | 2. deploy / 3. 一覧 | リビジョン名が `handson-app-00002-xxx` という連番形式 | 未確認(命名規則を一次情報で確認) |
| U-33 | 3. 一覧 | `gcloud run revisions list --service handson-app --region ${REGION}` | 未確認(現行stableのフラグ構成) |
| U-34 | 3. 一覧 | 「リビジョンはイメージ + 環境変数 + リソース設定を固めた不変のスナップショット」 | 未確認(リビジョンに含まれる設定の範囲を一次情報で確認) |
| U-35 | 3. 一覧 | 「ECSのタスク定義リビジョンに似ているが、Cloud Runのリビジョンはトラフィック制御と一体化している」 | 未確認(AWS側の記述も含めた対比の妥当性) |
| U-36 | 4. ロールバック | `gcloud run services update-traffic handson-app --region ... --to-revisions <rev>=100` | 未確認(現行stableのフラグ構成) |
| U-37 | 4. ロールバック | 「新しいデプロイは走らない」「数秒で完了」 | 未確認(traffic切り替えの挙動と所要時間の記述) |
| U-38 | 4. ロールバック | コンソール手順「リビジョン」タブ → メニュー →「このリビジョンにトラフィックを移行」 | 未確認(現行UIの文言。UI変更で陳腐化しやすい) |
| U-39 | 5. `--to-latest` | `--to-latest` で「最新リビジョン(v2)に戻す」 | 未確認(G-03の指摘と同じ論点。`LATEST` への割当という意味を一次情報で確認) |

### 4.4 `06_traffic`

| # | location | claim | verdict |
|---|---|---|---|
| U-40 | 2. no-traffic | 「`--no-traffic` を付けるとリビジョンは作られるがユーザーへのトラフィックは1%も流れない」 | 未確認 |
| U-41 | 2. no-traffic | タグ付きURL形式が `https://staging---handson-app-xxxxx.a.run.app`(`---` 区切り) | 未確認(**重要**: 現行のタグ付きURL形式を一次情報で確認。U-25と連動) |
| U-42 | 2. no-traffic | 「本番と同じ環境・同じ設定で、リリース前のバージョンだけを検証できるURL」 | 未確認(タグ付きURLがサービス設定を共有することの正確性) |
| U-43 | 3. カナリア | `--to-tags staging=10` が「タグ付きリビジョンへ10%」を意味する | 未確認(`--to-tags` の割合指定のセマンティクスを一次情報で確認) |
| U-44 | 3. カナリア | 「おおよそ v2 が18回・v3 が2回、という比率になるはず」 | 未確認(確率的な分配であり保証されない旨の表現が必要か。T-05と同種のリスク) |
| U-45 | 3. カナリア | `gcloud run services describe handson-app --region ... --format 'value(status.url)'` | 未確認(Cloud Run Admin API v2で `status.url` フィールドが有効かを一次情報で確認) |
| U-46 | 3. カナリア | `jq` を前提としたワンライナー | 未確認(Cloud Shellに `jq` がpre-installedかを一次情報で確認) |
| U-47 | 冒頭のAWS比較 | 「ECSでやるにはCodeDeployのブルー/グリーン + ALBの加重ターゲットグループ、検証用リスナーの設定が必要」 | 未確認(AWS公式で構成要素名を確認) |

### 4.5 `08_observability`

| # | location | claim | verdict |
|---|---|---|---|
| U-48 | 1. ログ | `gcloud run services logs read handson-app --region ${REGION} --limit 20` | 未確認(**重要**: 当該サブコマンドがstableに存在するか、フラグ名が正しいかを一次情報で確認。G-04と同種の stable / beta 論点) |
| U-49 | 1. ログ | 「アプリが出す1行JSONが構造化ログとして解釈され、severityで色分けされている」 | 未確認(Cloud Loggingが `severity` / `message` を特別扱いする仕様を一次情報で確認) |
| U-50 | 1. ログ | 「Cloud Runではコンテナがstdoutに書く、以上」/ CloudWatch Logsはawslogsドライバ・ロググループ・IAM権限が必要 | 未確認(両クラウド側の記述) |
| U-51 | 2. Logs Explorer | クエリ `resource.type="cloud_run_revision"` / `resource.labels.service_name` / `jsonPayload.message` | 未確認(Worker pool導入後も Service のリソースタイプが `cloud_run_revision` かを一次情報で確認) |
| U-52 | 2. Logs Explorer | 「`jsonPayload.instance` など自分が入れたフィールドもそのまま検索条件に使える」 | 未確認 |
| U-53 | 3. メトリクス | 「指標」タブに「リクエスト数 / レイテンシ(p50, p95, p99) / コンテナインスタンス数 / 課金対象インスタンス時間 / CPU・メモリ使用率」が最初から揃っている | 未確認(現行のCloud Runメトリクス名と既定の表示内容を一次情報で確認) |
| U-54 | 3. メトリクス | 「リビジョン別にメトリクスをフィルタできる」 | 未確認 |
| U-55 | 1. / 2. | コンソールの「ログ」タブ、「ログ エクスプローラで表示」という文言 | 未確認(現行UIの文言。UI変更で陳腐化しやすい) |

### 4.6 `09_source_deploy`

| # | location | claim | verdict |
|---|---|---|---|
| U-56 | ソースデプロイ | 「`--source` を指定すると Cloud Build がソースからイメージをビルドして GAR に push し、そのままデプロイまで行う」 | 未確認(**重要**: 2026年時点のビルド実行主体とpush先リポジトリ名(`cloud-run-source-deploy` 等)を一次情報で確認。U-09 / U-64 と連動) |
| U-57 | ソースデプロイ | `gcloud run deploy handson-app-src --source . --region ... --allow-unauthenticated` | 未確認(現行stableのフラグ構成) |
| U-58 | ソースデプロイ | 「数分待つと」 | 未確認(所要時間の目安としての妥当性) |
| U-59 | ソースデプロイ | 「Dockerfile があるのでそれが使われる」(Dockerfile優先) | 未確認(N-04と同じ論点だが、優先順位の断定として別途確認) |
| U-60 | ソースデプロイ | リンク先が [Cloud Native Buildpacks](https://buildpacks.io/) | 未確認(実際に使われるのはGoogle Cloud Buildpacksであり、リンク先として適切かを確認) |
| U-61 | ソースデプロイ | 「App Runner のソースデプロイに相当する」 | 未確認(AWS公式で対比の妥当性を確認) |
| U-62 | 手軽さの階段 | コードブロックの1行目と2行目が同じ `gcloud run deploy --source .` で、注釈だけが「ソースだけ(Buildpacks におまかせ)」「ソース + Dockerfile(ビルドはおまかせ)」と異なる | 未確認(誤りではないが読者が混乱しうる。表記の是非) |
| U-63 | 章全体 | `--source` デプロイに必要なAPI・権限(`cloudbuild.googleapis.com`、Cloud Build サービスアカウント、ビルドログ用ストレージ)が手順内に明示されていない | 未確認(FR-009の観点) |

### 4.7 `99_cleanup`

| # | location | claim | verdict |
|---|---|---|---|
| U-64 | 個別に削除 | `--source` デプロイで自動作成されるGARリポジトリ(`cloud-run-source-deploy` 等)とCloud Buildのビルドログ用ストレージが削除対象に含まれていない | 未確認(**課金の消し忘れに直結**。自動作成されるリソース名を一次情報で確認。U-56と連動) |
| U-65 | おすすめ | `gcloud projects delete ${PROJECT_ID}` と「30日間は復元可能な状態で保留されたあと、完全に削除されます」 | 未確認(保留期間を一次情報で確認) |
| U-66 | 個別に削除 | `gcloud run services delete --region ${REGION} --quiet` | 未確認(現行stableのフラグ構成) |
| U-67 | 個別に削除 | `gcloud run jobs delete handson-job --region ${REGION} --quiet` | 未確認 |
| U-68 | 個別に削除 | `gcloud pubsub subscriptions delete handson-sub` / `gcloud pubsub topics delete handson-topic`(リージョン指定なし) | 未確認(Pub/Subがグローバルリソースであることを一次情報で確認) |
| U-69 | 個別に削除 | `gcloud artifacts repositories delete ${REPO} --location ${REGION} --quiet` | 未確認 |
| U-70 | 課金ポイント | 「継続課金になり得るのは Artifact Registry のストレージ(**無料枠0.5GB**超過分)と min-instances」 | 未確認(GARの無料ストレージ枠の値を一次情報で確認) |
| U-71 | 課金ポイント | 「Cloud Run はスケールtoゼロなので、`min-instances` を0に戻してあれば放置してもほぼ課金されません」 | 未確認(F-02 / F-03 の「request-basedでも起動処理等に例外がある」という修正内容と整合するかを確認。章間整合) |
| U-72 | 個別に削除 | Cloud Schedulerジョブと Scheduler用サービスアカウントの削除手順が本章にない(`10_advanced/jobs.md` 側にある) | 未確認(章間整合。後片付けの網羅性として本章に集約すべきか) |
| U-73 | 消し忘れ | 「予算アラート(Budgets & alerts)」という名称、および「AWS の Budgets と同じ感覚で使える」 | 未確認(現行の機能名を一次情報で確認) |
| U-74 | 続けて学びたい人へ | `--no-allow-unauthenticated` というフラグ名 | 未確認(現行stableのフラグ名を一次情報で確認) |

### 4.8 `code/app`

| # | location | claim | verdict |
|---|---|---|---|
| U-75 | `package.json` | `engines.node` が `"24.x"`(N-03の指摘は解消済みに見える) | 未確認(Google Cloud BuildpacksのNodeバージョン指定として有効かを一次情報で再確認) |
| U-76 | `code/app/` | `package-lock.json` が存在しない | 未確認(**N-05の指摘が未解消**。依存は `hono: 4.13.2` 等と完全固定だが推移的依存は固定されない。Buildpacks / Dockerfile双方の再現性に影響) |
| U-77 | `package.json` | `scripts.start` が `node src/index.ts`(フラグなし) | 未確認(Node.js 24で type stripping がフラグ不要で有効かを一次情報で確認。T-04と連動) |
| U-78 | `package.json` | 依存が `@hono/node-server: 1.19.17` / `hono: 4.13.2` | 未確認(実在するバージョンか、Node.js 24 で動作するかを確認) |
| U-79 | `Dockerfile` | `FROM node:24-slim` | 未確認(タグの実在とNode.js 24のLTS状況を一次情報で確認) |
| U-80 | `Dockerfile` | `RUN npm install`(lockfileがないため `npm ci` にできない) | 未確認(U-76と連動。再現性の観点) |
| U-81 | `Dockerfile` | `ENV PORT=8080` と、コメント「Cloud Run は環境変数 PORT でリッスンすべきポートを渡してくる(デフォルト 8080)」 | 未確認(Cloud RunがPORTを注入する契約と、Dockerfile側 `ENV` との優先関係を一次情報で確認) |
| U-82 | `src/index.ts` | `crypto.randomUUID()` / `Buffer` / `process.env` などNode.js固有APIを使用 | 未確認(N-06「Honoはマルチランタイム」記述の修正が `02_docker` 本文で完了しているかの章間整合) |
| U-83 | `src/index.ts` `/pubsub` | Pub/Sub push受け口が `204` を返す | 未確認(Pub/Sub pushのack条件(2xx)を一次情報で確認) |
| U-84 | `src/index.ts` `/pubsub` | `envelope.message.data` を base64 として `Buffer.from(data, "base64")` でデコード | 未確認(Pub/Sub pushメッセージのペイロード形式を一次情報で確認) |
| U-85 | `src/index.ts` | 1行JSON `{severity, message, ...}` を stdout に出す | 未確認(U-49と同じ論点。Cloud Loggingの構造化ログ仕様) |
| U-86 | `.dockerignore` | 内容が `node_modules` のみ | 未確認(ビルドコンテキストに含めるべきでないファイルの網羅性) |
| U-87 | `Dockerfile` | 非rootユーザーの指定がない | 未確認(Cloud Runの実行要件として問題ないか。教材の説明との整合) |

### 4.9 `code/websocket`

| # | location | claim | verdict |
|---|---|---|---|
| U-88 | `package.json` | `@hono/node-ws: 1.3.1` の実在とバージョン、`engines.node: "24.x"` | 未確認 |
| U-89 | `code/websocket/` | `package-lock.json` が存在しない | 未確認(U-76と同じ論点。N-05未解消) |
| U-90 | `src/index.ts` | 「インスタンスのメモリ上に接続を保持する。本番では複数インスタンス間の共有に Memorystore (Redis) 等が必要」 | 未確認(設計上の主張。Cloud Runのインスタンス独立性と session affinity の関係を一次情報で確認) |
| U-91 | `src/index.ts` | 「ハンズオンでは `--max-instances 1` でデプロイして単一インスタンスに固定する」 | 未確認(`--max-instances` の指定方法と、単一インスタンス固定が成立するかを一次情報で確認。`--session-affinity` の必要性も併せて確認) |
| U-92 | `src/index.ts` | Cloud Run上でWebSocket(HTTP/1.1 upgrade)が動作する | 未確認(Cloud RunのWebSocketサポート仕様を一次情報で確認。F-05のrequest timeoutと連動) |
| U-93 | `Dockerfile` | `FROM node:24-slim` / `RUN npm install` / `ENV PORT=8080` / `CMD ["node", "src/index.ts"]` | 未確認(U-79〜U-81と同じ論点) |
| U-94 | `src/index.ts` HTML | クライアント側JSが `location.protocol === "https:"` で `wss:` を選ぶ | 未確認(Cloud RunのHTTPS終端との整合) |

### 4.10 章横断(参考)

| # | location | claim | verdict |
|---|---|---|---|
| U-95 | `07_scaling/README.md:38` と `code/load.mjs` | 負荷生成スクリプトが、本文では `cat > ~/load.mjs <<'EOF'` のヒアドキュメントで作成させる一方、リポジトリの `code/load.mjs` にも同梱されている。二重管理になっており、片方だけ更新される事故が起こりうる | 未確認(R-02の対応方針として、どちらを正とするかを `07_scaling` 担当が判断。本台帳では起票のみ) |

---

## 5. SC-001 / SC-002 の達成判定方法

### SC-001「技術的主張のうち、出典となる一次情報のURLを明記できないものが0件」

1. §2 の全フラグメントが作成済みであること(「予定」の行が0件)
2. §3 の全行(`スコープ` = `今回対応`)と §4 の全行が、いずれかのフラグメントに対応する行を持つこと。フラグメント側に対応行がない ID が0件であること
3. 各フラグメントの全行について `verdict` が `正しい` または `要修正` に確定していること(**`未確認` が0件**)。これは tasks.md T026 の完了条件と一致する
4. `verdict` が確定した全行に `source_url` と `confirmed_on` が入っていること。`source_url` が空、または `research/deep-research-report.md` 自身を指している行が0件であること(レポートは二次情報のため出典にできない)
5. `verdict` = `要修正` の全行に `resolution`(実際に本文へ反映した内容)が入っていること
6. 一次情報で裏付けが取れなかった主張については、本文からその主張を削除したか、「未確認」であることを本文に明記したか、のいずれかが `resolution` に記録されていること(A-05 のApp Runner WebSocketがこのケースの代表例)

`confirmed_on` は 2026-08-19 以降の日付であること(基準日より古い確認は再確認が必要)。

判定は機械的に行える形にしておく。例えばフラグメントの表形式を揃えた上で、次のような確認で「未確認」の残存を検出する。

```bash
rg -n "未確認" specs/001-verify-handson-content/fact-check/
```

(§4 の本台帳側の行は起票時点の記録として `未確認` のまま残るため、検索対象は `fact-check/` 配下のフラグメントに限定する。)

### SC-002「レポートの『最も重要な発見トップ5』および『教材の事実確認』テーブルの指摘が、未反映のまま残っている件数が0件」

対象となる ID は §3 のうち接頭辞が `T-` と `F-` の行(下表)。全件について、対応するフラグメントに `verdict` 確定と、`要修正` の場合は `resolution` があることを確認する。

| 由来 | ID | 決着させるフラグメント |
|---|---|---|
| トップ5 | T-01(= A-01〜A-03) | `fact-check/03_cloudrun.md` |
| トップ5 | T-02(= F-01) | `fact-check/03_cloudrun.md` |
| トップ5 | T-03(= F-09) | `fact-check/03_cloudrun.md` |
| トップ5 | T-04(= N-01) | `fact-check/02_docker.md` |
| トップ5 | T-05(= F-08と関連) | `fact-check/07_scaling.md` |
| 事実確認テーブル | F-01 | `fact-check/03_cloudrun.md` |
| 事実確認テーブル | F-02 | `fact-check/03_cloudrun.md` |
| 事実確認テーブル | F-03 | `fact-check/03_cloudrun.md` |
| 事実確認テーブル | F-04 | `fact-check/03_cloudrun.md` |
| 事実確認テーブル | F-05 | `fact-check/10_advanced_websocket.md` |
| 事実確認テーブル | F-06 | `fact-check/03_cloudrun.md` + `fact-check/07_scaling.md` |
| 事実確認テーブル | F-07 | `fact-check/03_cloudrun.md` |
| 事実確認テーブル | F-08 | `fact-check/07_scaling.md` |
| 事実確認テーブル | F-09 | `fact-check/03_cloudrun.md` |
| 事実確認テーブル | F-10 | `fact-check/03_cloudrun.md` |

`00_preparation` / `02_docker` / `03_cloudrun` / `07_scaling` / `10_advanced` は data-model.md 上 `修正済み` だが、**修正済みであること自体も一次情報で確認して初めて「反映済み」と判定する**。既存の修正を後退させないこと(FR-010)も併せて確認する。

### スコープ外項目の扱い

`スコープ` = `スコープ外(今回不採用)` の行は SC-001 / SC-002 の判定対象に含めない。ただし「判断した記録」として本台帳に残し、消さない。うち `research/2025-2026-feature-additions.md` へ回すもの(P-14 / P-15 / P-17)は、tasks.md T035 の完了時に当該メモへ転記済みであることを確認する(SC-007)。

---

## 6. 最終棚卸し(T026)

**実施日**: 2026-08-19 / **対象**: `fact-check/` 配下の全21フラグメント(章別16 + `aws-comparisons.md` + 実機検証4件)

本節は tasks.md T026(「`verdict` が『未確認』のまま残っている項目が0件であることを確認する」)の実施記録である。章別フラグメント16件はドキュメント照合の段階で作られ、当時は実機実行が禁止されていたため多くの項目が `未確認` で止まっていた。その後に実施された実機検証4件と AWS 比較検証1件の結果を突き合わせ、確定できるものを確定させた。

### 6.1 集計(判定行を機械的に数えた実測値)

判定表の行数(`| # | location | claim | verdict | source_url | resolution |` 形式の行)を数えた結果:

| 区分 | ファイル数 | 判定行 | 正しい | 要修正 | 未確認 |
|---|---|---|---|---|---|
| 章別フラグメント + `aws-comparisons.md` | 17 | **406** | 336 | 54 | **16** |
| 実機検証フラグメント(`live-*.md`) | 5 | 122 | (一致/不一致/未実施の別形式) | — | — |

> **2026-08-30 再集計**: 上表は 2026-08-19 の実施時点では実測と一致していた(当時のコミット `2bb97dc` で数え直すと 390 / 326 / 48 / 16)。その後、対象ファイルへ判定行を追加した3つのコミットが本集計表を更新しないまま入り、**判定行が16行ぶんずれていた**。内訳は `01_aws_and_googlecloud.md` +7(`3e86ab4`、2026-08-25)、`03_cloudrun.md` +6(`6018411`、2026-08-26)、`10_advanced_jobs.md` +3(`aa33a36`、2026-08-30)。あわせて、実機検証フラグメントは 2026-08-22 に `live-dryrun-full.md` が加わって5ファイル122行になっていたが、こちらも未反映だった(§2 の 2026-08-25 追記で index には補正済み)。**`未確認` の16件は増減していない**ため、SC-001 の判定(未達)は変わらない。
>
> 数え方: 各フラグメントの `^\| *[0-9]+ *\|` にマッチする行を判定行とし、verdict 列は `**` を除いた前方一致で分類する。`07_scaling.md` #32 の `正しい(Cloud Shell の jq は未確認)` を「未確認」に数えない点と、`aws-comparisons.md` #16 の `**要修正**`(太字)を取りこぼさない点に注意する。

- **確定済み: 390件**(正しい336 + 要修正54)
- **残存 `未確認`: 16件**(verdict 列が `未確認` の行)
- これに加えて `07_scaling.md` #21 は verdict が `正しい(Cloud Shell の jq は未確認)` で、主張の一部だけが未確認のまま残っている。**カテゴリ分類ではこれを含めた17件を扱う。**
- T026 開始時点で `未確認` 系だったのは32件。**そのうち15件を確定させた**(内訳は 6.2)。

### 6.2 T026 で確定させた15件

実機検証の記録で確定(8件):

| フラグメント | # | 変更後 verdict | 根拠 |
|---|---|---|---|
| `05_revision.md` | 6 | 正しい(実機確認) | `live-main-path.md` #11 — フラグなし再デプロイでも `allUsers`/`roles/run.invoker` は保持され公開URLは200。当日の致命的問題は存在しない |
| `05_revision.md` | 12 | 正しい(実機確認) | `live-main-path.md` #9 / #12 / #13 — `handson-app-00001-bvd` / `00002-vjk` |
| `04_deploy.md` | 17 | 正しい(実機確認) | `live-main-path.md` #6 / #9 — 同上 |
| `07_scaling.md` | 24 | 要修正(実機で判明) | `live-main-path.md` #30 — コールドスタート実測1.454798s(本文修正済み) |
| `10_advanced_pubsub.md` | 5 | 正しい(実機確認) | `live-main-path.md` #8 — `describe --format 'value(status.url)'` は有効。ただし返るのは旧形式URL |
| `99_cleanup.md` | 14 | 要修正(実機で判明) | `live-source-deploy.md` #15 — `<プロジェクトID>_cloudbuild` バケットが実在。本文は commit `8fc3c01` で既に反映済み |
| `code_samples.md` | 13 | 正しい(実機確認) | `live-websocket.md` #1 / #11 / #12 / #14 — `new Set<WSContext>()` を含むコードが node:24-slim で起動・通信 |
| `code_samples.md` | 14 | 正しい(実機確認) | `live-websocket.md` #1 / #14、`live-source-deploy.md` #9 — Node.js v24.19.0 実機で type stripping 動作 |

AWS 一次情報(`aws-comparisons.md`)で確定(7件):

| フラグメント | # | 変更後 verdict | 根拠 |
|---|---|---|---|
| `04_deploy.md` | 6 | 正しい(一次情報確認) | `aws-comparisons.md` #9(ECR トークン12時間) |
| `06_traffic.md` | 1 | 要修正(一次情報確認) | `aws-comparisons.md` #1(検証用リスナーは任意)。本文反映済み |
| `07_scaling.md` | 6 | 正しい(一次情報確認) | `aws-comparisons.md` #5(標準 Lambda は1リクエスト=1環境) |
| `07_scaling.md` | 8 | 要修正(一次情報確認) | `aws-comparisons.md` #4(ECS のターゲット追跡ではアラームは AWS が自動管理)。本文反映済み |
| `08_observability.md` | 5 | 正しい(一次情報確認) | `aws-comparisons.md` #7(awslogs + IAM 権限が必要) |
| `09_source_deploy.md` | 9 | 正しい(一次情報確認) | `aws-comparisons.md` #8(App Runner のソースデプロイ) |
| `10_advanced_jobs.md` | 8 | 正しい(一次情報確認) | `aws-comparisons.md` #10(標準 Lambda 900秒) |

あわせて、`未確認` ではないが実機記録と矛盾していた記載を3件訂正した。

- `06_traffic.md` #6: `正しい` → `要修正(実機で判明)`。`--no-traffic` 時は URL が2つではなく**タグ付きURLの1つだけ**表示される(`live-main-path.md` #17。本文修正済み)
- `99_cleanup.md` #17: `要修正(未実施)` → `要修正(反映済み)`。`support/README.md` L57 に後片付け節が入っている(commit `f1e5da3`)
- `00_preparation.md` の集計: 正しい36件 → 34件(判定表の実行数41に対し 34 + 5 + 2 = 41)

### 6.3 残存する `未確認` 17件のカテゴリ内訳

| カテゴリ | 件数 |
|---|---|
| A: Cloud Shell 固有(検証環境が macOS のため原理的に未確認) | 2 |
| B: コンソールUI(ヘッドレス環境のため目視できず) | 7 |
| C: 所要時間・実測依存(環境依存で単一の正解が無い) | 3 |
| D: その他 | 5 |
| E: AWS 一次情報が可否・数値を明記していない(2026-08-25 追加) | 3 |

**E: AWS 一次情報が可否・数値を明記していない(3件、2026-08-25 追加)**

いずれも `fact-check/aws-ecs-express-mode.md` #16〜#18 に記録。ECS Express Mode の (a) ゼロスケール(最小0タスク)可否、(b) カナリアデプロイの比率指定の粒度、(c) Fargate / ALB の具体的単価。

- **理由**: (a)(b) は開発者ガイドと API リファレンスのいずれも可否を明記していない。(c) は Express Mode 自体に追加料金がないことは明記されているが、基盤リソースの単価は料金ページ側の値で改定され得るため、教材では数値を持たない方針(spec.md Assumptions)
- **本文への扱い**: 教材本文はこの3点に依存しない記述にとどめた。同フラグメント末尾に「本文で使ってよい表現 / 使ってはいけない表現」の対照表を置き、断定への踏み込みを構造的に防いでいる
- **増減の性質**: 今回の3件は既存の未確認を解消できなかったものではなく、**新しい主張を本文へ入れる際にその未確認部分を隠さずに起票したことによる増加**である

**A: Cloud Shell 固有(2件)**

- `06_traffic.md` #11 — Cloud Shell に `curl` / `jq` が入っているか。ループ自体は実機で動作し集計結果も教材の予想と一致(`live-main-path.md` #22)だが、実行環境は macOS(jq-1.7.1 / curl 8.7.1)
- `07_scaling.md` #21 — 同じ `jq` の残件(verdict は `正しい` で、`jq` の存在のみ部分未確認)

**B: コンソールUI(7件)**

- `00_preparation.md` #8 — コンソールがプロジェクト名から一意なプロジェクトIDを自動生成すること
- `01_aws_and_googlecloud.md` #13 — Google Cloud のコンソールがリージョン横断で一覧表示すること
- `04_deploy.md` #11 — Artifact Registry コンソールページ(認証必須で到達確認できず)
- `04_deploy.md` #19 — Cloud Run コンソールページ(同上)
- `07_scaling.md` #20 — 「指標」タブのレイテンシがパーセンタイル(p50/p95/p99)表示か
- `08_observability.md` #13 — 同上(8章側の記述)
- `08_observability.md` #14 — 「指標」タブ上のリビジョン別フィルタUI(Monitoring API 側での絞り込みは `live-main-path.md` #36 で確認済み)

**C: 所要時間・実測依存(3件)**

- `04_deploy.md` #14 — 初回デプロイ「30秒ほどで完了」
- `05_revision.md` #18 — ロールバックが「数秒で完了」(ロールバック自体の成功は `live-main-path.md` #14 / #15 で確認済み、秒数は未計測)
- `10_advanced.md` #17 — 発展編各節の所要時間(20分/10分/10分)と2時間版の進行形式

**D: その他(5件、個別理由つき)**

- `00_preparation.md` #31 — 課金アカウント未紐付けプロジェクトで `gcloud services enable` が課金エラーになること。**理由**: 検証は課金アカウント紐付け済みプロジェクトで実施。再現には未紐付けプロジェクトの新規作成が必要で、許可されたリソース範囲外
- `04_deploy.md` #1 — `gcloud config get-value project` が現行 gcloud で動くこと。**理由**: 公式リファレンスに `get-value` の個別ページが無く(404)、実機検証4件のいずれもこのコマンドを実行していない(全記録を grep して確認)。`gcloud config get project` への統一は 00章・`support/README.md` にも及ぶ章横断変更のため別タスクへ申し送り中
- `09_source_deploy.md` #8 — `package-lock.json` 不在により依存解決が日によって変わりうること。**理由**: 浮動解決そのものは実機で観測済み(`live-websocket.md` #17 で `ws: ^8.17.0` → 8.21.3、`live-source-deploy.md` #9 で Buildpacks が `--package-lock-only` でロックを生成)だが、「日によって変わる」という時間的変動は1回の検証では観測できない。`code/` は本機能の変更禁止範囲
- `10_advanced_pubsub.md` #17 — Eventarc の「60以上のイベントソース」という件数。**理由**: 公式ドキュメントが件数を明記しておらず、Eventarc はハンズオン手順に含まれない紹介文のため実機検証の対象外。公式が数値を書かない限り確定不能
- `99_cleanup.md` #15 — 「API を有効化しただけでは課金されない」ことの裏付け(=無効化手順が不要である根拠)。**理由**: 実機検証は API 有効化済みの状態で行い、有効化のみによる課金の有無を切り分ける観測(無効化して課金明細を比較する等)を行っていない。判定には課金レポートの数日後の反映を待つ必要がある

### 6.4 SC-001 / SC-002 の達成判定

**SC-001「技術的主張のうち、出典となる一次情報のURLを明記できないものが0件」: 未達**

§5 の6つの確認項目に対する実測結果:

| # | 確認項目 | 結果 |
|---|---|---|
| 1 | §2 の全フラグメントが作成済み(「予定」が0件) | **達成**。21ファイルすべて存在 |
| 2 | §3 / §4 の全行がフラグメントに対応行を持つ | **未検証**。ID単位の全件突き合わせは T026 では実施していない。SC-002 対象の `T-` / `F-` 15件については 6.4 後段のとおり確認済み |
| 3 | 全行の `verdict` が `正しい` / `要修正` に確定(**`未確認` が0件**) | **未達。16件が `未確認` のまま**(+ 部分未確認1件)。内訳は 6.3 |
| 4 | 確定した全行に `source_url` がある / 空・二次情報でない | **達成**。確定374行すべてに `source_url` があり(機械チェック済み)、`research/deep-research-report.md` を出典にしている行は0件。`source_url` が `-` / `—` の行は5件あるがいずれも未確認行(`00_preparation` #8・#31、`01_aws_and_googlecloud` #13、`04_deploy` #14、`10_advanced` #17)。`confirmed_on` は行単位ではなくフラグメント単位に `**確認日**: 2026-08-19` として記録され、全21ファイルが基準日以降 |
| 5 | `要修正` の全行に `resolution` がある | **達成**。`resolution` が空の `要修正` 行は0件(機械チェック済み) |
| 6 | 裏付けが取れなかった主張は、本文から削除したか「未確認」を本文に明記したか | **部分達成**。残存17件はいずれも `resolution` に「本文は変更していない」旨と理由を記録しているが、**教材本文側に「未確認」と明記する形の対応は取っていない**。カテゴリA〜Cは断定を避けた表現(「〜ほど」「〜程度」「置き換えてください」)になっており実害が小さいと判断された結果で、SC-001 の文言を厳格に取るなら本文側の追記が残件 |

**未達の理由**: 残る16件は、(a) Cloud Shell 実機、(b) コンソールUIの目視、(c) 当日の実測、(d) 未紐付けプロジェクトや Eventarc など許可範囲外のリソース — のいずれかを必要とし、`gcloud` の再実行が禁止された本タスクの制約下では埋められない。**SC-001 を達成するには、当日の Cloud Shell での実機確認(A・C)とコンソール画面の目視確認(B)を担当者が行い、その結果を各フラグメントへ反映する必要がある。**

**SC-002「レポートの『最も重要な発見トップ5』および『教材の事実確認』テーブルの指摘が未反映のまま残っている件数が0件」: 達成**

- 対象IDは §5 の表のとおり `T-01`〜`T-05` と `F-01`〜`F-10` の15件で、決着先は `03_cloudrun.md`(未確認0件)・`02_docker.md`(未確認0件)・`07_scaling.md`・`10_advanced_websocket.md`(未確認0件)の4フラグメント
- `07_scaling.md` に残る `未確認` は #20(コンソールのパーセンタイル表示)のみで、`T-05` / `F-08`(「必要インスタンス数 ≒ 同時リクエスト数 ÷ concurrency」と「50接続なら5台」)に対応する行は #2 / #15 であり、いずれも確定済み。#15 の本文書き換え(式では5台/実際は8台前後や上限10台/台数は観察対象)は `live-main-path.md` #27 の実測(上限10台に到達)と整合することを T026 で確認した
- `T-04`(= `N-01`、Node.js 24 の type stripping の限定)は `02_docker.md` #7 / #8 / #10 で確定し、実機でも `v24.19.0` での起動を確認済み
- `F-05`(WebSocket のタイムアウト既定5分・最大60分)は `10_advanced_websocket.md` #2 / #11 で確定し、`live-websocket.md` #9 / #10 で実測(`--timeout` 未指定で 300 秒、`--timeout 3601` は拒否)
- したがって**レポート由来の指摘に未反映のものは0件**。ただし §3 の `スコープ外(今回不採用)` 行は判定対象外(§5「スコープ外項目の扱い」のとおり)

### 6.5 残存する `未確認` が当日運用に与えるリスク

**リスクは低い。** カテゴリB(コンソールUI 7件)は仮に表示が教材の記述と違っても、受講者が別のタブ・別のラベルを探す程度の詰まりで、CLI 手順の成否には影響しない。カテゴリC(所要時間3件)は本文が「〜ほど」「〜程度」と幅を持たせているうえ、最大の落とし穴だったコールドスタートの数値は実機実測(1〜1.5秒)に基づき修正済みで、期待値と実際のズレによる誤解は解消している。カテゴリD 5件も本文の手順そのものではなく紹介文・トラブルシューティング・後片付けの補足に属し、後片付けは推奨手順(プロジェクトごと削除)を取れば漏れが生じない。

**唯一注視すべきはカテゴリA(Cloud Shell の `jq`)** で、これが入っていない場合は6章の集計ループと7章のインスタンスID確認が失敗する。ただしどちらも「観察」のためのコマンドであり、本編の主線(デプロイ・トラフィック制御・スケール設定)は止まらない。**当日の開始前に講師が Cloud Shell で `jq --version` を一度実行しておけば、この1点は数秒で解消できる。**

## 7. 判定の再検討記録

本節は、いったん `スコープ外(今回不採用)` と判定した行を、後から採用へ転じた記録である。§3 の表からは行を消さず、`スコープ` 列に本節へのポインタだけを追記する運用とする。

### 7.1 2026-08-25: 比較軸の変更(P-10 / P-18b / A-08)

- **判断者**: 利用者(著者)。エージェントからの提案に対する明示的な承認として記録する
- **根拠条文**: spec.md FR-013a(2026-08-25 追加)
- **再判定した理由**: 不採用時の前提は「事実は変わらず提示方法だけを変える提案である」だった。その後、次の3点が一次情報で確定した。(1) ALB の HTTPS リスナーには証明書のデプロイが必須で、既定DNS名 `*.elb.amazonaws.com` に対する証明書は AWS から提供されない、(2) 独自ドメインの条件は AWS / Google Cloud で同等である、(3) AWS 側にも1コマンドで HTTPS 公開まで済む経路(ECS Express Mode、2025-11-21 GA)が存在する。条件を揃えると「作成時に組む部品の数」は主張の根拠として成立せず、**提示方法を据え置くと修正後の事実と矛盾する**。したがって当初の前提が失われたことによる再判定であり、FR-013 の解釈変更ではない
- **採用範囲**: 比較の軸を「作成時に組む部品の数」から「運用で理解が必要なプロダクト数 / 壊れたときに開く画面の数」へ移す。ECS Express Mode は主役にせず注記として置き、軸変更の根拠にする
- **不採用のまま据え置く範囲**: P-10 の「設計判断表(AWSで身についた反射 → Cloud Runでの体験 → 教えるべき差)」の新設、P-18b の「Organization → Folder → Project の階層と policy inheritance の節」の新設。いずれも本件の軸変更に必要ではなく、独立した構成追加であるため

| ID | 当初判定 | 再判定 | 対象本文 | 決着先フラグメント |
|---|---|---|---|---|
| P-10 | スコープ外(今回不採用) | 採用(軸の付け替えのみ) | `01_aws_and_googlecloud/README.md` 比較表・冒頭2段落・まとめ | `fact-check/01_aws_and_googlecloud.md` #37〜 |
| P-18b | スコープ外(今回不採用) | 一部採用(節の新設は不採用のまま) | 同上 | 同上 |
| A-08 | 今回対応(決着先未確定) | 決着先を確定 | `03_cloudrun/README.md` AWS比較表 | `fact-check/03_cloudrun.md` #24〜(**3章への適用は後続の変更。本記録の時点では決着先の指定のみ**) |

#### FR-013a 条件(1)に基づく追加見出しの申告

FR-013a は既存の節の削除・改名・並べ替えを禁じ、新しい節の追加のみを認めている。本件で追加した見出しは次のとおり。既存の見出しは文言も相対順序も変更していない。

| ファイル | 追加した見出し | レベル | 挿入位置 |
|---|---|---|---|
| `01_aws_and_googlecloud/README.md` | 注記: 1コマンドで立つ経路は AWS にもある | `###` | `## ビルディングブロック vs SaaS的アプローチ` の末尾 |
| `01_aws_and_googlecloud/README.md` | 運用で向き合うプロダクトの数 | `##` | `## アカウント構造の違い` の直前 |

`03_cloudrun/README.md` への適用は後続の変更で行う。3章では見出しを追加せず、既存の脚注パターン(`※1` / `※2` に続く `※3`)と実行モデル表の AWS 対応の更新に留める予定である。

**この記録の時点で本文へ適用済みなのは `01_aws_and_googlecloud/README.md` のみ。** 3章は App Runner を現役の比較列として扱ったままであり、1章の「新規顧客への提供を終了」という記述と章間で食い違っている状態が一時的に残る。この不整合の解消は後続の変更で行う。
