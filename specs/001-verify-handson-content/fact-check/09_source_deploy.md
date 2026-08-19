# Fact-check: 09_source_deploy/README.md

**確認日**: 2026-08-19

検証方法: Google Cloud 公式ドキュメント(`docs.cloud.google.com`)の突き合わせのみ。`gcloud` の実行は行っていない。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L7 | `--image` の代わりに `--source` を指定すると Cloud Build がソースからイメージをビルドして GAR に push し、デプロイまで行う | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 公式: ビルドは Cloud Build、成果物は Artifact Registry に保存される。補足として公式は「`cloud-run-source-deploy` という名前のリポジトリが無ければ自動作成される」と明記(本文には未記載。後片付けの対象が増える点は本章の範囲外として報告のみ) |
| 2 | L10-15 | `gcloud run deploy handson-app-src --source . --region ${REGION} --allow-unauthenticated` の構文 | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy , https://docs.cloud.google.com/run/docs/deploying-source-code | `--source` / `--region` / `--allow-unauthenticated` はいずれも現行 stable に存在。公式例は `gcloud run deploy SERVICE --source .` |
| 3 | L17 | 数分待つと別サービス `handson-app-src` として公開される | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | サービス名を指定した新規サービスとして作られる。所要時間(数分)はビルド時間依存のため厳密な検証はしていない |
| 4 | L19 | ディレクトリに Dockerfile があればそれが使われる | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy , https://docs.cloud.google.com/run/docs/deploying-source-code | 公式: "If a Dockerfile is present in the source code directory, it will be built using that Dockerfile, otherwise it will use Google Cloud buildpacks." |
| 5 | L19(旧) | Dockerfile を消すと [Cloud Native Buildpacks](https://buildpacks.io/) が `npm start` で起動するイメージを自動生成する | 要修正 | https://docs.cloud.google.com/run/docs/deploying-source-code , https://docs.cloud.google.com/docs/buildpacks/nodejs | 公式が使うのは "Google Cloud's buildpacks"(buildpacks.io は上流のCNB仕様)であり、起動コマンドは公式に "The Node.js buildpack executes the command you specify in the `scripts.start` field of your `package.json` file. If you don't configure the `scripts.start` field, the buildpack runs the `npm start` command." → 「Google Cloud の Buildpacks」表記へ変更し、リンクを公式Node.js buildpackドキュメントへ差し替え、起動コマンドを `scripts.start`(本教材では `node src/index.ts`)と明記した |
| 6 | L19 | Buildpacks が `package.json` を見て Node.js アプリと判断する | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 公式: "Google Cloud's buildpacks automatically detects the language you are using and fetches the dependencies of the code to make a production-ready container image, using a secure base image managed by Google." |
| 7 | (前提)`code/app/package.json` `engines.node: "24.x"` | Buildpacks でも Node.js 24 が使われ、Dockerfile なしでも `node src/index.ts`(type stripping)が動く | 正しい | https://docs.cloud.google.com/docs/buildpacks/nodejs | 公式は `engines.node` で版指定でき、例として `"node": "24.x.x"` を掲載。"provides support for the Current and Active LTS releases of Node.js"。また "Avoid using greater than (>) specifiers in the `engines.node` field." とあり、現行の `24.x` はこの指針に沿っている(`>=24` ではない)。教材コード側は修正不要 |
| 8 | (参考)`code/app` に `package-lock.json` なし | Buildpacks / Dockerfile の `npm install` で依存解決が日によって変わりうる | 未確認(本章の範囲外) | https://docs.cloud.google.com/docs/buildpacks/nodejs | 公式は "Whenever possible, use `package-lock.json` to improve cache performance." と推奨。`code/` は変更禁止範囲のため本タスクでは変更せず、報告のみ。**2026-08-19 T026: 未確認のまま残す(カテゴリD)**。実機では `live-source-deploy.md` #9 のとおり Buildpacks が `npm install --package-lock-only` でロックファイルを生成してから `npm ci` を実行し、ロックファイル無しでもビルドは成功した。また `live-websocket.md` #17 では浮動指定 `ws: ^8.17.0` が実ビルドで 8.21.3 に解決されており、**解決結果が固定されないこと自体は実機で観測できている**。ただし「日によって変わりうる」という時間的な変動そのものは1回の検証では観測できないため未確認のまま残す(教材本文の主張ではなく、教材コードに対する参考指摘であることにも留意) |
| 9 | L21 | AWS の App Runner のソースデプロイに相当する | 正しい(一次情報確認) | https://docs.aws.amazon.com/apprunner/latest/dg/service-source-code.html | **2026-08-19 T026 で確定**: `aws-comparisons.md` #8 が AWS 公式で「正しい」と判定(App Runner はソースコードリポジトリからのビルド・デプロイを公式サポート)。本文の変更は不要 |
| 10 | L21 | できあがるものは普通の Cloud Run サービスで、カナリア・タグ付きURL・スケール設定が同じように使える | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code , https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | ソースデプロイもリビジョンを持つ通常の Cloud Run サービスを作るため、トラフィック制御機能はすべて適用できる |
| 11 | L27 | ソースデプロイの中身は build → push → deploy | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | Cloud Build でビルド → Artifact Registry に保存 → デプロイという流れと整合 |
| 12 | L34-37 | 手軽さの階段(同じ `gcloud run deploy --source .` が Buildpacks / Dockerfile の両方をカバー、その下に手動 build/push/deploy と Cloud Build トリガー) | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy | 同一コマンドが Dockerfile 有無で分岐するため、2行が同じコマンドなのは意図どおりで誤りではない |
| 13 | L42-44 | 今日のまとめ(deploy 1コマンドの裏でLB・証明書・スケーリング・ログ収集が不要 / リビジョン・ロールバック・カナリア・タグ付きURL / スケールtoゼロ・concurrency・min/max-instances) | 正しい | https://docs.cloud.google.com/run/docs/logging , https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | ログ自動収集・トラフィック制御は各一次情報で確認済み。HTTPS URL 自動発行は https://docs.cloud.google.com/run/docs/triggering/https-request で確認 |

## 修正した箇所

- L19: 「Cloud Native Buildpacks(buildpacks.io)」→「Google Cloud の Buildpacks」+ 公式Node.js buildpackドキュメントへのリンク、起動コマンドを `npm start` → `scripts.start`(本教材では `node src/index.ts`)へ修正(#5)。

## 実機確認が必要な残件(2026-08-19 T026 で棚卸し)

解決済み:

- Dockerfile を削除した状態での `--source .` デプロイが Node.js 24 で成功するか(#7)→ **解決**。`live-source-deploy.md` #7 / #9 でビルドログに `Installing Node.js v24.19.0.` が出て HTTP 200 を返した(type stripping も有効)
- ソースデプロイで自動作成される Artifact Registry リポジトリ `cloud-run-source-deploy`(#1)→ **解決**。`live-source-deploy.md` #4 で実際に作成されること(初回のみ `Do you want to continue (Y/n)?` のプロンプトが出る)を確認
- (新規確定)`--source` デプロイは Cloud Storage バケット `<プロジェクトID>_cloudbuild`(US multi-region)も作る。`live-source-deploy.md` #15 で確認し、99章の削除漏れ判定(`99_cleanup.md` #14)へ反映済み

未解決:

- `code/app` に `package-lock.json` が無いことによる依存解決の日次変動(#8)— カテゴリD。浮動解決自体は実機で観測済みだが時間的変動は未観測。`code/` は本機能の変更禁止範囲
