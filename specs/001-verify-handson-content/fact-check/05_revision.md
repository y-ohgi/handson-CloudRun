# Fact-check: 05_revision/README.md

**確認日**: 2026-08-19

検証方法はGoogle Cloud公式ドキュメント(一次情報)との突き合わせのみです。`gcloud` の実行による確認は行っていません(課金リソースを作らないため)。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L9-12 | `src/index.ts` 上部の2行(`MESSAGE` / `BG_COLOR`)を書き換える | 正しい | (教材内) code/app/src/index.ts L8-9 | サンプルアプリの該当行と一致(`const MESSAGE` / `const BG_COLOR`、コメントも「書き換えるのはこの2行」)。変更不要 |
| 2 | L19 | `cd ~/cloudrun-handson/app` | 正しい | (教材内) 02_docker/README.md L30-31 | 2章で作成するディレクトリと一致。変更不要 |
| 3 | L20 | `docker build -t ${IMAGE}:v2 .` | 正しい | https://docs.cloud.google.com/artifact-registry/docs/docker/store-docker-container-images | Artifact Registry のイメージパスを直接タグに使う形は公式手順と整合。変更不要 |
| 4 | L21 | `docker push ${IMAGE}:v2` | 正しい | https://docs.cloud.google.com/artifact-registry/docs/docker/store-docker-container-images | 公式手順と一致。変更不要 |
| 5 | L23-26 | `gcloud run deploy handson-app --image ${IMAGE}:v2 --region ${REGION}` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy | stable の `gcloud run deploy` に `--image` / `--region` が現存。既存サービスへの再デプロイ形式も公式例 `gcloud run deploy SERVICE --image IMAGE_URL` と一致。変更不要 |
| 6 | L28 | 2回目以降は `--allow-unauthenticated` などを繰り返す必要がなく、サービスの設定は維持される | 正しい(実機確認) | https://docs.cloud.google.com/run/docs/configuring/services/cpu , https://docs.cloud.google.com/run/docs/deploying , `live-main-path.md` #11(「最重要の結論」にも記載) | **2026-08-19 T026 で確定**: 実機で4章のフラグ付きデプロイ後、5章でフラグを付けずに再デプロイしても公開URLは `status=200` を返し続け、`get-iam-policy` は `allUsers` / `roles/run.invoker` を保持していた。出力に `Setting IAM Policy` の行は現れず IAM は触られない。その後の `services update`(concurrency / max-instances / min-instances)や `update-traffic` を6リビジョン分繰り返しても消えなかった。**当日の致命的問題は存在せず、5章に追加の対処は不要**。本文の変更なし |
| 7 | L28 | 変更したもの(イメージ)だけが新しいリビジョンとして記録される | 正しい | https://docs.cloud.google.com/run/docs/managing/revisions | 「サービスにデプロイするか設定を変更すると、不変のリビジョンが作成される」と明記。変更不要 |
| 8 | L30 | 新リビジョン(00002)に切り替わる | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy | `--no-traffic` を付けない限り、新リビジョンは LATEST としてトラフィックを受ける(`--no-traffic` は「デプロイするリビジョンにトラフィックを送らない」と定義)。変更不要。リビジョン名の `00002-xxx` 形式も #12 のとおり実機で確認済み(2026-08-19 T026 で更新) |
| 9 | L30 | ダウンタイムなしで切り替わった | 正しい | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 「トラフィックを変更しても、処理中のリクエストはすべて完了まで継続される」と明記。変更不要 |
| 10 | L35, L51 | `gcloud run revisions list --service handson-app --region ${REGION}` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/revisions/list | synopsis に `[--region=REGION] [--service=SERVICE]` が現存(stable、公式例 `gcloud run revisions list --service=foo`)。変更不要 |
| 11 | L38 | リビジョンはイメージ+環境変数+リソース設定を固めた不変のスナップショット | 正しい | https://docs.cloud.google.com/run/docs/managing/revisions | 「an immutable revision is created」と明記。変更不要 |
| 12 | L30, L54, L59 | リビジョン名は `handson-app-00001-xxx` / `handson-app-00002-xxx` 形式 | 正しい(実機確認) | https://docs.cloud.google.com/run/docs/managing/revisions , `live-main-path.md` #9 / #12 / #13 | **2026-08-19 T026 で確定**: 実機では初回が `handson-app-00001-bvd`、2回目のデプロイが `handson-app-00002-vjk` で、`revisions list` にも2行並んだ。教材の記述どおりの形式(サフィックスは英小文字3文字)。公式は形式を明文化していないが実測で裏取り済み。ただし3つ目以降は連番にならない(`live-main-path.md` #20)ため、6章側で番号を一般化する修正が入っている |
| 13 | L46 | ロールバックは既存リビジョンへトラフィックを振り向けるだけで、新しいデプロイは走らない | 正しい | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 既存リビジョンへのトラフィック割合変更で行う手順として記載され、新規デプロイは不要。変更不要 |
| 14 | L57-60 | `gcloud run services update-traffic handson-app --region ${REGION} --to-revisions handson-app-00001-xxx=100` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic , https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | stable の synopsis に `--to-revisions=[REVISION-NAME=PERCENTAGE,…]` と `--region` が現存。ロールバック手順の公式コマンドも `gcloud run services update-traffic SERVICE --to-revisions REVISION=100`。変更不要 |
| 15 | L62 | 「一瞬で青(v1)に戻ります」 | 要修正 | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 公式は「トラフィックルーティングの調整は瞬時ではない(Traffic routing adjustments are not instantaneous)」と明記。当日「リロードしても赤のまま」で詰まる要因になるため、「数秒待ってからリロード」「赤のままなら少し待って再読み込み」に修正 |
| 16 | L64 | コンソール手順: 「リビジョン」タブ → 対象リビジョンのメニューから「このリビジョンにトラフィックを移行」 | 要修正 | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration?hl=ja | 日本語版公式手順のラベルは「リビジョン」タブ → 対象リビジョン右側の省略記号アイコン → 「トラフィックを管理」。存在しないメニュー名を探させないため公式ラベルに修正 |
| 17 | L71-74 | `gcloud run services update-traffic handson-app --region ${REGION} --to-latest` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic | `--to-latest` は「latest リビジョンへ100%のトラフィックを割り当てる」と定義され、既存のトラフィック分割を上書きする。#14 でリビジョン固定した状態を LATEST に戻す用途として妥当(6章のカナリアの前提として必要)。変更不要 |
| 18 | L81 | ロールバックは「再デプロイ不要、数秒で完了」 | 未確認 | https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration | 「再デプロイ不要」は #13 のとおり正しいが、「数秒」という所要時間の一次情報はなく、公式は「瞬時ではない」とだけ述べる。#15 の修正で本文の期待値が整合したため、この表現は維持。**2026-08-19 T026: 未確認のまま残す(カテゴリC: 所要時間・実測依存)**。`live-main-path.md` #14 / #15 で `update-traffic --to-revisions` によるロールバックが実際に成功し v1 のレスポンスが返ることは確認済みだが、切り替えに要した秒数は計測していない |
