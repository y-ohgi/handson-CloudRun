# 実機検証: 9章 ソースデプロイ

**実行日**: 2026-08-19
**環境**: sandbox-360407 / asia-northeast1

ドキュメント突き合わせではなく、`gcloud` を実際に実行して確認した記録。`code/app` は変更せず、scratchpad へコピーした作業ディレクトリ2つ(Dockerfile あり / なし)から `gcloud run deploy --source .` を実行した。

- 実行した gcloud: Google Cloud SDK **501.0.0**(core 2024.11.08)。受講者が使う Cloud Shell よりかなり古い点は #10 に影響する
- 作成したサービス: `handson-app-src`(リビジョン 00001 = Dockerfile ビルド、00002 = Buildpacks ビルド)
- Cloud Build のビルドID: `254e7ed6`(Dockerfile) / `410eb5d6`(Buildpacks)

| # | 検証項目 | 教材の記述 | 実際の結果 | 判定 | 対応 |
|---|---|---|---|---|---|
| 1 | `--source` で Cloud Build がビルド→GARへpush→デプロイまで行う(L7) | 「Cloud Build がソースからイメージをビルドして GAR に push し、そのままデプロイまで行います」 | Cloud Build のビルドが2件記録され、`asia-northeast1-docker.pkg.dev/sandbox-360407/cloud-run-source-deploy/handson-app-src` に push、そのままリビジョンが作られた | 一致 | なし |
| 2 | Dockerfile がある状態で `--source .` が成功する(L9-17) | 「数分待つと、別サービス `handson-app-src` として同じアプリが公開されます」 | 成功。出力1行目は `Building using Dockerfile and deploying container to Cloud Run service [handson-app-src] in project [sandbox-360407] region [asia-northeast1]`。リビジョン `handson-app-src-00001-xx4` が100%トラフィックを受け、`curl` が HTTP 200 で「Hello, Cloud Run!」を返した | 一致 | なし |
| 3 | 出力に `Service URL: https://handson-app-src-...` が出る(L19) | 「`Service URL: https://handson-app-src-...` が表示されます」 | `Service URL: https://handson-app-src-113111026602.asia-northeast1.run.app`(`<サービス名>-<プロジェクト番号>.<リージョン>.run.app` 形式) | 一致 | なし |
| 4 | 初回に `cloud-run-source-deploy` リポジトリが自動作成され、確認を求められる(L19) | 「初回はビルド済みイメージの置き場として `cloud-run-source-deploy` という Artifact Registry リポジトリが自動で作られます(確認を求められたらそのまま進めてください)」 | 実際のプロンプトは `Deploying from source requires an Artifact Registry Docker repository to store built containers. A repository named [cloud-run-source-deploy] in region [asia-northeast1] will be created.` → `Do you want to continue (Y/n)?`。続行すると `Creating Container Repository...done` と出て、デプロイ前は存在しなかった DOCKER リポジトリ `cloud-run-source-deploy` が作成された。2回目の実行ではプロンプトは出ない | 一致 | なし |
| 5 | `${REGION}` が空だとエラーになる(L21) | 「`${REGION}` が空だとエラーになります」 | `--region` の値が空だと `ERROR: argument --region: expected one argument`(exit code 2)。デプロイは始まらない | 一致 | なし |
| 6 | 何度実行しても新しいリビジョンが増えるだけ(L21) | 「何度実行しても新しいリビジョンが増えるだけです」 | 2回目の実行で `handson-app-src-00002-kkg` が追加され、00001 は残ったまま。サービスは重複作成されない | 一致 | なし |
| 7 | Dockerfile を消しても Buildpacks で動く(L23-25) | 「**Dockerfile を消しても動きます**」「やはり数分後に同じ画面が返ってきます」 | 成功。出力1行目が `Building using Buildpacks and deploying container to Cloud Run service [handson-app-src] ...` に変わり、`curl` は HTTP 200 で同じ画面を返した | 一致 | Dockerfile あり/なしを出力1行目で判別できることを「成功していれば」ブロックに追記(下記「修正した箇所」参照) |
| 8 | Buildpacks が `package.json` を見て Node.js アプリと判断し `scripts.start` を起動コマンドにする(L23, L27) | 「`scripts.start`(この教材では `node src/index.ts`)を起動コマンドにした良い感じのイメージを自動生成します」 | 参加した buildpack は `google.nodejs.runtime@1.0.0` / `google.nodejs.npm@1.1.1` / `google.utils.label-image@0.0.2`。生成イメージの Entrypoint は `/cnb/process/web` で、`io.buildpacks.build.metadata` の web プロセスは `{"type":"web","command":["npm","run","start"],"direct":true,"buildpackID":"google.nodejs.npm"}`。実行時ログにも `> start` / `> node src/index.ts` が出ており、`npm run start` 経由で `scripts.start` がそのまま起動コマンドになることを確認 | 一致 | なし(厳密には CMD は `npm run start` で、その中で `scripts.start` が走る。教材の簡略表現は実挙動と齟齬がないため変更せず) |
| 9 | Node.js 24 の type stripping が Buildpacks 経由でも効き、`engines.node: "24.x"` が Node 24 に解決される | (L23 の前提。明示の記述はない) | ビルドログに `Installing Node.js v24.19.0.`。`.ts` を直接実行するイメージが HTTP 200 を返したので、Buildpacks 経由でも type stripping は有効。なお `package-lock.json` が無いため Buildpacks が `npm install --package-lock-only` で生成してから `npm ci` を実行しており、ロックファイル無しでも成功する | 一致 | なし |
| 10 | `gcloud run services logs read handson-app-src --region ${REGION} --limit 20` で原因を確認できる(L30) | 「原因は次で確かめられます」 | **手元の SDK 501.0.0 ではクラッシュした**: `ERROR: gcloud crashed (TypeError): sequence item 1: expected str instance, NoneType found`。原因は `googlecloudsdk/api_lib/logging/formatter.py` の `GetAttributeFieldFromLog` が `getattr(..., '')` で、構造化ログ(`jsonPayload`)の `textPayload` が `None` のまま `' '.join()` に渡ること。本教材のアプリは意図的に1行JSONを stdout に出すため必ず該当する。現行 SDK では同関数が `getattr(..., None) or ''` に修正済みで発生しない | 一致(条件付き) | 教材は変更せず。受講者は Cloud Shell の現行 gcloud を使うため再現しない。修正後のロジックで同じログを整形し直すと `2026-08-19 09:18:05 > node src/index.ts` / `... listening on port 8080` / `... GET 200 https://...` と読める出力になることを確認した。ただし構造化ログ行は本文が空(タイムスタンプのみ)で表示される |
| 11 | `gcloud run services list --region ${REGION}` でデプロイ確認できる(L21) | 「デプロイできたかどうかは `gcloud run services list --region ${REGION}` で確認できます」 | `handson-app-src` が一覧に出た | 一致 | なし |
| 12 | `cd ~/cloudrun-handson/app`(L10) | 2章で作るディレクトリ | `02_docker/README.md` L30-31 の `mkdir -p ~/cloudrun-handson/app/src` / `cd ~/cloudrun-handson/app` と一致 | 一致 | なし |
| 13 | Buildpacks ドキュメントへのリンク(L23) | https://cloud.google.com/docs/buildpacks/nodejs | HTTP 200(`https://docs.cloud.google.com/docs/buildpacks/nodejs` へリダイレクト) | 一致 | なし |
| 14 | ビルドとデプロイにかかる時間(L17, L19, L25) | 「数分」 | Dockerfile: Cloud Build 39秒(09:14:01→09:14:40)、リポジトリ作成込みの `gcloud` 全体はおよそ1分半。Buildpacks: Cloud Build 72秒(09:16:36→09:17:48)、`gcloud` 全体の実測 **98秒**。いずれも2分未満だった | 不一致(要判断) | 教材は変更していない。実測は1〜2分で「数分」は約2倍の過大見積りだが、待ち時間を長めに書くのは安全側であり、n=1 の計測で書き換える判断は本タスクの範囲外とした。文言を詰めるなら「1〜2分」が実測に近い |
| 15 | `--source` デプロイが Cloud Storage のステージング用バケットを作るか(教材に記述なし。99章の削除手順の根拠として未確認だった項目) | (記述なし) | **作る**。バケット名は `sandbox-360407_cloudbuild`(= `<プロジェクトID>_cloudbuild`)。`timeCreated: 2026-08-19T09:14:00Z` で1回目のデプロイと一致し、デプロイ前のバケット一覧には存在しなかった。location は **US(multi-region)**でリージョン指定に追従しない。STANDARD クラス、ライフサイクルルールなし、ソフト削除保持7日(604800秒)。中身は `gs://sandbox-360407_cloudbuild/source/<epoch>-<uuid>.tgz` というアップロード済みソースのtarball | 一致(新規確定) | 9章は変更せず(9章にバケットの記述はない)。99章の後片付けに反映するかは 99 章担当へ申し送り |

## 修正した箇所

- `09_source_deploy/README.md` L25 の「成功していれば」ブロックに、Dockerfile あり/なしが出力1行目の `Building using Dockerfile ...` / `Building using Buildpacks ...` で判別できることを追記した。Dockerfile を消して同じコマンドを叩くのがこの節の主眼だが、変更前の本文は「同じ画面が返ってきます」だけで、Buildpacks に実際に切り替わったのかを受講者が確認する手がかりが無かった。追記した2つの文言は実行出力からそのまま引用している。

## 未実施・確認できなかったこと

- Cloud Shell 上での実行は行っていない(手元の macOS + SDK 501.0.0 から実行)。ソースのアップロード時間はネットワーク差の影響を受けるため、#14 の実測値は Cloud Shell と一致しない可能性がある
- #10 のクラッシュが現行 SDK で解消していることは、公開ミラー(`twistedpair/google-cloud-sdk`)上の `formatter.py` の差分で確認した。現行 SDK を実際にインストールして再実行した検証は行っていない
- 同じ `gcloud run services logs read` を引用している `08_observability/README.md` L15 と `10_advanced/pubsub.md` L52, L58 は本タスクの担当外。#10 の内容(古い gcloud ではクラッシュする / 構造化ログ行は本文が空で表示される)は各章の担当へ申し送りが必要
