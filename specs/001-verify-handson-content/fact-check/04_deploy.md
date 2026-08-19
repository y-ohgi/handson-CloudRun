# Fact-check: 04_deploy/README.md

**確認日**: 2026-08-19

検証方法はGoogle Cloud公式ドキュメント(一次情報)との突き合わせのみです。`gcloud` の実行による確認は行っていません(課金リソースを作らないため)。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L10 | `gcloud config get-value project` でプロジェクトIDを取得できる | 未確認 | https://docs.cloud.google.com/sdk/gcloud/reference/config | 現行リファレンスの `gcloud config` 配下には `get` / `list` / `set` / `unset` のみが掲載され、`get-value` の個別ページは404。削除・失敗を示す一次情報は確認できず、`gcloud config get project` への統一は `00_preparation` と `support/README.md` にも及ぶため本タスクでは変更せず、章横断の別タスクへ申し送り |
| 2 | L11 | `asia-northeast1` = 東京リージョン | 正しい | https://docs.cloud.google.com/run/docs/locations | Cloud Runのロケーション一覧に「`asia-northeast1` (Tokyo)」と記載。変更不要 |
| 3 | L13 | イメージパスは `リージョン-docker.pkg.dev/プロジェクト/リポジトリ/イメージ名:タグ` | 正しい | https://docs.cloud.google.com/artifact-registry/docs/docker/store-docker-container-images | 公式クイックスタートの `us-west1-docker.pkg.dev/PROJECT/quickstart-docker-repo/quickstart-image:tag1` と同一形式。変更不要 |
| 4 | L23-27 | `gcloud artifacts repositories create ${REPO} --repository-format=docker --location=... --description=...` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/artifacts/repositories/create | `--repository-format` は必須で `docker` を選択可。`--location` / `--description` も現存。公式クイックスタートも同一の組み合わせを使用。変更不要 |
| 5 | L29 | 認証ヘルパーは「一度設定すれば期限切れがありません」 | 要修正 | https://docs.cloud.google.com/artifact-registry/docs/docker/authentication | 公式は「gcloud CLIセッションのアクティブなユーザー/サービスアカウントの資格情報でDockerを構成する」「ホスト名を追加するときだけ再実行する」と述べるのみで、「期限切れがない」とは書かれていない(アクセストークン方式は60分で失効との記述あり)。「一度設定すれば、push のたびにトークンを取り直す必要はありません」へ修正 |
| 6 | L29 | `aws ecr get-login-password` に相当する | 未確認 | (AWS側一次情報を本タスクでは未参照) | Google Cloud側の一次情報では検証できない比較表現。誤りの証拠もないため変更せず |
| 7 | L32 | `gcloud auth configure-docker ${REGION}-docker.pkg.dev` | 正しい | https://docs.cloud.google.com/artifact-registry/docs/docker/store-docker-container-images | 公式クイックスタートに `gcloud auth configure-docker us-west1-docker.pkg.dev` の形で掲載。変更不要 |
| 8 | L41 | `docker tag handson-app:v1 ${IMAGE}:v1` | 正しい | https://docs.cloud.google.com/artifact-registry/docs/docker/store-docker-container-images | 公式手順の `docker tag` の使い方と一致。元イメージ `handson-app:v1` は `02_docker/README.md` L183 で作成されており教材内でも整合。変更不要 |
| 9 | L42 | `docker push ${IMAGE}:v1` | 正しい | https://docs.cloud.google.com/artifact-registry/docs/docker/store-docker-container-images | 公式手順と一致。変更不要 |
| 10 | L48 | `gcloud artifacts docker images list ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/artifacts/docker/images/list | 位置引数 IMAGE_PATH に `LOCATION-docker.pkg.dev/PROJECT-ID/REPOSITORY-ID` を渡す形が公式例と一致。変更不要 |
| 11 | L51 | コンソールの Artifact Registry ページ (console.cloud.google.com/artifacts) | 未確認 | https://console.cloud.google.com/artifacts | 認証必須のためWebFetchで到達確認できず。推測で断定しない |
| 12 | L58-62 | `gcloud run deploy handson-app --image ... --region ... --allow-unauthenticated` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy | stableの `gcloud run deploy` に `--image` / `--region` / `--allow-unauthenticated` がすべて現存(betaは不要)。変更不要 |
| 13 | L65 | デフォルトは IAM 認証必須(=閉じている) | 正しい | https://docs.cloud.google.com/run/docs/authenticating/public | 「Cloud Run enforces this check by default」(Invoker IAMチェックを既定で強制)と明記。`--allow-unauthenticated` は allUsers への Invoker 付与に相当。変更不要 |
| 14 | L67 | 「30秒ほどで完了」 | 未確認 | - | 所要時間に関する一次情報は存在せず、環境依存。誇張の証拠もないため記述は維持 |
| 15 | L67 | Service URL は `https://handson-app-xxxxx.a.run.app` | 要修正 | https://docs.cloud.google.com/run/docs/triggering/https-request , https://docs.cloud.google.com/run/docs/release-notes | 現行の決定的URLは `https://[TAG---]SERVICE_NAME-PROJECT_NUMBER.REGION.run.app` で、「決定的URLが表示時に優先される」と明記(決定的URLは2024-09-03にGA)。ページ内に `.a.run.app` の記載はない。`https://handson-app-<プロジェクト番号>.asia-northeast1.run.app` のような URL に修正 |
| 16 | L75 | `K_SERVICE` / `K_REVISION` は Cloud Run が注入する環境変数 | 正しい | https://docs.cloud.google.com/run/docs/container-contract | K_SERVICE「サービス名」、K_REVISION「リビジョン名」として注入されると明記。変更不要 |
| 17 | L75 | リビジョン名は `handson-app-00001-xxx` 形式 | 未確認 | https://docs.cloud.google.com/run/docs/deploying | 公式は「リビジョンのサフィックスは自動で割り当てられる(`--revision-suffix` で指定可)」とのみ記載し、`SERVICE-00001-xxx` という形式は明文化されていない。実機で確認すべき項目として残し、本文は変更せず |
| 18 | L76 | URL が最初から HTTPS(証明書の発行も更新も不要) | 正しい | https://docs.cloud.google.com/run/docs/triggering/https-request | 既定URLは `https://` スキームで払い出される形式として文書化。変更不要 |
| 19 | L78 | コンソールの Cloud Run ページ (console.cloud.google.com/run) | 未確認 | https://console.cloud.google.com/run | 認証必須のためWebFetchで到達確認できず |
| 20 | L87 | タスク定義(CPU/メモリ/ポート)を書かず、デフォルト値で開始して後から変えられる | 正しい | https://docs.cloud.google.com/run/docs/configuring/services/cpu | 「By default, Cloud Run container instances are limited to 1 vCPU」、および設定変更は既存サービスに対しても可能(変更時は新リビジョンが作られる)と記載。変更不要 |
