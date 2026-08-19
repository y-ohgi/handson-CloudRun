# Fact-check: 10_advanced/README.md

**確認日**: 2026-08-19

**判定サマリ**: 全18項目 — 正しい 17件 / 要修正 0件 / 未確認 1件(本文の修正は不要だった)

検証方法: Google Cloud 公式ドキュメント(`docs.cloud.google.com`)および Cloud Run リリースノートの突き合わせのみ。`gcloud` は未実行。本ファイルは 10_advanced 配下の**インデックスページ(README.md)のみ**を対象とし、`pubsub.md` / `websocket.md` / `jobs.md` は別タスクの担当。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L7 | 10-1 は Pub/Sub でイベント駆動アーキテクチャを組む節である | 正しい | https://docs.cloud.google.com/run/docs/triggering/pubsub-push | Pub/Sub push サブスクリプションから Cloud Run サービスを呼ぶ公式チュートリアルが存在(`--push-endpoint` にサービスURLを指定)。「3コマンドで」の妥当性は `pubsub.md` 側の担当 |
| 2 | L8 | 10-2「ALBなしでWebSocketが動く」 | 正しい | https://docs.cloud.google.com/run/docs/triggering/websockets | 公式: 「WebSockets applications are supported on Cloud Run with no additional configuration required.」ロードバランサーは任意(「WebSockets on Cloud Run are also supported if you are using Cloud Load Balancing.」)。なおリクエストタイムアウト(最大60分)とセッションアフィニティのベストエフォート性という注意点が公式にあるが、詳細は `websocket.md` 側の担当 |
| 3 | L9 | 10-3「Cloud Run Jobs はリクエスト駆動ではないバッチ処理」 | 正しい | https://docs.cloud.google.com/run/docs/create-jobs , https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 公式: 「Unlike a Cloud Run service, which listens for and serves requests, a Cloud Run job only runs its tasks and exits when finished.」および実行モデル一覧の Job = 「Executes parallelizable tasks that are executed manually, or on a schedule, and run to completion」 |
| 4 | L15 | Pub/Sub 連携は「普通のHTTPサーバーにPOSTが飛んでくる」だけになる | 正しい | https://docs.cloud.google.com/run/docs/triggering/pubsub-push | push サブスクリプションは HTTP POST でサービスへ配信される。なお公式手順では invoker サービスアカウントに `roles/run.invoker` の付与が必要で、この点は `pubsub.md` 側の担当 |
| 5 | L16 | WebSocket は「サーバーレスでは無理」と思われがちだが普通に動く | 正しい | https://docs.cloud.google.com/run/docs/triggering/websockets | #2 と同じ根拠 |
| 6 | L17 | Jobs は「同じイメージ・同じ開発体験のままバッチにも使える」 | 正しい | https://docs.cloud.google.com/run/docs/create-jobs | 公式手順では既存のコンテナイメージ(Artifact Registry / Docker Hub / GitHub Container Registry)からジョブを作成でき、サービスと同じイメージ供給元・同じデプロイモデルが使える |
| 7 | L25 | **Worker pools は2026年4月GA** | 正しい | https://docs.cloud.google.com/run/docs/release-notes | リリースノート **2026年4月14日**: 「Support for worker pools is in General Availability (GA)」。本文の「2026年4月GA」と一致 |
| 8 | L25 | Worker pools は「3章で触れた第3の実行モデル」 | 正しい | (リポジトリ内 `03_cloudrun/README.md` L33-43) | 3章に「3つの実行モデル」表があり、ワーカープールが第3の行として記載されている。章間の整合が取れている |
| 9 | L25 | Pub/Sub pull や Kafka コンシューマのような常駐ワーカーを Cloud Run で動かせる | 正しい | https://docs.cloud.google.com/run/docs/deploy-worker-pools , https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 公式の実行モデル一覧で Worker Pool = 「Handles always-on background workloads such as pull-based workloads, for example, Kafka consumers, Pub/Sub pull queues, or RabbitMQ consumers」と、本文の例示がそのまま一致。デプロイ手順側でも worker pools を「continuous background work」向けとし、Pub/Sub pull サブスクリプションと Kafka コンシューマのチュートリアルを提供。また「do not have a load balanced endpoint/URL」。**補足(本文の誤りではない)**: worker pools は既定で手動スケーリング(インスタンス数を指定)で、サービスのようなオートスケールは持たない。Pub/Sub のキュー量に応じた自動スケールは別途チュートリアルで扱われる別機能。本文はオートスケールを主張していないため修正不要 |
| 10 | L26 | **GPU対応(NVIDIA L4等)** | 正しい | https://docs.cloud.google.com/run/docs/configuring/services/gpu | 公式が NVIDIA L4(24 GB VRAM)と NVIDIA RTX PRO 6000 Blackwell(96 GB VRAM)の2種を掲載。「NVIDIA L4等」という書き方は現状と整合(2026年8月11日のリリースノートでも L4 ドライバ 580.x.x の更新が記載) |
| 11 | L26 | GPUワークロードでも**スケールtoゼロ**が効く | 正しい | https://docs.cloud.google.com/run/docs/configuring/services/gpu | 公式: 「Instances of a Cloud Run service that has been configured to use GPU can scale down to zero for cost savings when not in use.」なおGPUのアイドル保持は10分(通常は15分)。本文は台数・時間に言及していないため修正不要 |
| 12 | L26 | 「LLM推論を使うときだけ起動で運用できる」 | 正しい | https://docs.cloud.google.com/run/docs/configuring/services/gpu | #11 の帰結。定性的主張として整合 |
| 13 | L27 | **Docker Compose デプロイは2026年3月GA** | 正しい | https://docs.cloud.google.com/run/docs/release-notes | リリースノート **2026年3月25日**: 「Deploying services using a Compose file is in General Availability」。本文の「2026年3月GA」と一致 |
| 14 | L27 | `compose.yaml` をそのまま Cloud Run へ。サイドカー構成も持ち込める | 正しい | https://docs.cloud.google.com/run/docs/deploy-run-compose | 公式手順は `gcloud run compose up compose.yaml`(`alpha` なし)。マルチコンテナについて「Compose deployment deploys a single Cloud Run service with multiple containers.」と明記され、Nginx プロキシ + Flask バックエンド + MongoDB の例が掲載。事前情報にあった「ドキュメントはGA表記だがCLIは `gcloud alpha run compose`」という不一致は、2026-08-19 時点の公式ページでは確認できなかった(現在は非alphaの `gcloud run compose up` で記載) |
| 15 | L28 | **IAP 直接統合は2026年3月GA** | 正しい | https://docs.cloud.google.com/run/docs/release-notes | リリースノート **2026年3月13日**: 「Configuring Identity-Aware Proxy (IAP) directly on Cloud Run ... to secure your services without the need for load balancers is in General Availability (GA)」。本文の「2026年3月GA」と一致 |
| 16 | L28 | ロードバランサーを組まずに社内向けアプリへ Google アカウント認証を付けられる | 正しい | https://docs.cloud.google.com/run/docs/release-notes | 同エントリの「without the need for load balancers」と一致 |
| 17 | L3, L5-9 | 各節の形式・所要時間(20分/10分/10分)、2時間版は講師デモ | 未確認 | - | 教材運営上の設計値であり、公式ドキュメントで検証できる技術的主張ではない。当日の実測に委ねる |
| 18 | L19 | 「ただのコンテナ・ただのHTTP」という抽象を守っているから何とでもつながる | 正しい(解釈) | https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run | 公式はサービスを「Responds to HTTP requests sent to a unique and stable endpoint, using stateless instances that autoscale based on a variety of key metrics」と説明。コンテナ + HTTP という基本モデルと矛盾しない教材側の解釈 |

## 修正した箇所

なし。**2026年の新機能4件(Worker pools / GPU / Docker Compose / IAP直接統合)のGA時期と内容はすべてリリースノートおよび機能ドキュメントの一次情報と一致していた。**

## 実機確認が必要な残件・補足

- 所要時間と進行形式(#17)は当日運用の実測待ち
- Worker pools の既定スケーリングが手動である点(#9)は本文の誤りではないが、3章または本文で触れるかは編集判断の余地あり(今回は担当範囲外の追記を避け未変更)
- `pubsub.md` / `websocket.md` / `jobs.md` の個別手順は本ファイルの対象外
