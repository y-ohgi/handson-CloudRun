# 通し dry-run(受講者と同じ順序で実行)

**実行日**: 2026-08-22
**環境**: sandbox-360407 / asia-northeast1 / ローカルDocker arm64(`--platform linux/amd64`)

> **重要 — 本レポートは部分実施である。** クラウド側の操作(0章のAPI有効化、4〜9章、発展編、99章)は**一切実行できていない**。
> 理由: 検証マシンの `gcloud` 認証トークンが期限切れで、復旧には `gcloud auth login`(ブラウザ対話が必須)が必要だった。
> `y-ohgi@topotal.com` / `ohgi.211@gmail.com` の両アカウントと application-default credentials のすべてで
> `Reauthentication failed. cannot prompt during non-interactive execution.` を確認済み(サービスアカウント鍵も存在しない)。
> 「認証が通らないなら開始しない」という規約に従い、クラウド側の操作は憶測で埋めず**未実施**として残した。
>
> 実行できたのは **2章(ファイル作成 + ローカル build / run)と、5章・6章のソース書き換え、7章の負荷スクリプト**、
> すなわち Docker とローカル Node.js だけで完結する範囲である。

## 実施できた範囲(すべて実測)

受講者と同じく `code/app` からはコピーせず、**2章本文のコードブロックから4ファイルを書き出して**実行した。

| # | 手順 | 実行内容 | 結果 |
|---|---|---|---|
| 1 | 2章 §1 | `mkdir -p ~/cloudrun-handson/app/src` → 本文から `package.json` / `src/index.ts` / `Dockerfile` / `.dockerignore` を書き出し | 4ファイルすべて本文のコードブロックだけで作成可能。書き漏れ・省略なし |
| 2 | 2章 §2 | `docker build --platform linux/amd64 -t handson-app:v1 .` | 成功。**全レイヤ CACHED** = 過去セッションのビルドとコンテキストがバイト一致 |
| 3 | 2章 §3-4 | `docker run -p 8080:8080` → `curl /` | 青 `#4285F4`、`Hello, Cloud Run!`、Service/Revision がともに `local`。本文の記述どおり |
| 4 | 2章(付随) | `/api` / `/heavy` / `POST /pubsub` | `/api` は JSON を返す。`/heavy` は `time_total: 1.010588s`(本文の「1秒かかる」と一致)。`/pubsub` は **204** を返し、ログに `Pub/Sub message received: Hello from Pub/Sub` |
| 5 | 2章(付随) | 構造化ログ | `{"severity":"INFO","message":"listening on port 8080"}` / `index accessed` が1行JSONで出力。8章が前提とする形式が成立 |
| 6 | 2章 §5 | `docker run --rm -it handson-app:v1 bash` 相当 | `ls` に `Dockerfile node_modules package-lock.json package.json src`、`node -v` が `v24.19.0`。本文「自分の書いたコードと node_modules が /app に入っている」と一致 |
| 7 | 5章 §1 | `src/index.ts` の2行を v2(赤)へ書き換え → build → run | `Hello, Cloud Run v2!` / `background: #EA4335`。本文どおり**2行だけ**の変更で成立 |
| 8 | 6章 §1 | 同じ2行を v3(緑)へ書き換え → build → run | `Hello, Cloud Run v3!` / `background: #34A853` |
| 9 | 7章 §2 | 本文の `load.mjs` を作成し、ローカルコンテナへ実行 | `node ~/load.mjs http://localhost:8080/heavy 10 5` → `done: success=50 failure=0`。スクリプトは本文のコピペのみで動作 |
| 10 | 10-2 | `docker build --platform linux/amd64 code/websocket` | ビルド成功(デプロイは認証がないため未実施) |
| 11 | 整合性 | 本文から書き出した4ファイルと `code/app` を `diff` | `package.json` / `Dockerfile` / `.dockerignore` は**完全一致**。`index.ts` の差分は5章・6章が書き換えを指示している**その2行のみ** |

`#11` は「本文のコードブロックと `code/` が同期している」ことと、2章の「書き換えるのは定数2行だけ」が
文字どおり正しいことを同時に裏付けている。

## つなぎ目の検証

判定の根拠を3種類に区別して書く。

- **[本] 本セッションで実測** — 私がこのセッションでローカル実行して確認した
- **[過] 過去の実機記録** — 2026-08-19 の `live-main-path.md` 等に実測記録がある(本セッションでは再測定していない)
- **[静] 静的確認のみ** — 本文を読んだだけ。実測なし

`live-main-path.md` は **4→5→6→7→8章 + 10-1 を単一サービス `handson-app` 上で上から順に通し実行**しており、
本編のつなぎ目の多くは既に実機で踏まれている。一方 9章・10-2・10-3 は**それぞれ独立した別サービス・別リポジトリで単独実行**
されており、**本編からの状態引き継ぎは検証されていない**。この差が下表の判定を分ける。

| # | 章の境目 | 前提としている状態 | 実際 | 判定 |
|---|---|---|---|---|
| 1 | 2章 → 4章 | 4章 §2 の `docker tag handson-app:v1` が、2章で作った**`handson-app:v1` というタグ名**のイメージを手元に要求する | **[本]** 2章 §2 のコマンドは `-t handson-app:v1` でタグ名が一致。ローカルでビルドし、そのタグでイメージが存在することを確認 | 成立 |
| 2 | 4章 → 5章 | 5章 §2 は `${IMAGE}` が設定済みであること(4章 §0 で export)を前提にする | **[過]** 通し実行で 00001→00002 のリビジョンが連続して作られており成立(`live-main-path.md`)。**[静]** 5章の 詰まったら に「4章の『0. 環境変数の準備』を再実行」への導線もある | 成立 |
| 3 | 5章 → 6章 | 5章末の `--to-latest`(v2が100%)の状態から6章 §2 の `--no-traffic --tag staging` を打っても**本番URLが赤(v2)のまま**であること | **[過]** 本番URLが `Hello, Cloud Run v2!`、タグ付きURLが `Hello, Cloud Run v3!` を返すことを実測(`live-main-path.md:36`)。`--no-traffic` は期待どおり効いている。ただし確認は HTTP レスポンス本文で、ブラウザでの色の目視は未実施 | 成立 |
| 4 | 6章 → 7章 | 6章末は v3 が100%LATEST + staging タグ。7章 §1 の `services update --concurrency 10` は**新リビジョンを作る**ため、トラフィックの向きが変わりうる | **[過]** 新リビジョン `00004-bl6` が `serving 100 percent of traffic` になったことは実測済み。**しかし(1)更新直後に画面が緑(v3)のままだったか (2)`staging` タグがどのリビジョンに残ったか はどちらも記録がない**。**[静]** 6章 §4 の注記が「`--to-latest` は LATEST に100%割り当てる設定であり、次のデプロイで新リビジョンがそのままトラフィックを受け取る」とこの挙動を先に説明しているため、本文上の説明の断絶はない | 破綻(要判断) |
| 5 | 7章内 | `--min-instances 1` を試したあと `0` に戻す手順が自然に踏めるか(戻し忘れると課金継続) | **[過]** `--min-instances 1` → `00005-qwm`、`--min-instances 0` → `00006-vn9` と両方実行され、`minScale` アノテーションの消失まで確認済み。手順として自然に戻せている。**[静]** 本文は「確認できたら、課金を避けるため戻しておきます」+ 独立コードブロック + 詰まったら の太字警告の3重で担保 | 成立 |
| 6 | 7章 → 8章 | 8章はログを読む。その時点でリクエストが発生済みで、ログが空でないこと | **[過]** ログは空ではなく、`GET 200 https://.../` と `listening on port 8080` が表示された。7章の負荷試験と `curl ${URL}/` が先行するため必ずアクセスが発生する。**注意点**: `gcloud run services logs read` では `index accessed` の1行JSONが**時刻だけの空行**に見える。これは既に8章 L18 に反映済み | 成立 |
| 7 | 6章 → 9章 | 9章は `~/cloudrun-handson/app` で `--source` デプロイする。**6章で v3(緑)に書き換えた状態のコード**が入っているが、本文の説明と食い違わないか | **[本]** 食い違っていた。6章の書き換え後のディレクトリをビルド・起動すると `Hello, Cloud Run v3!` / 緑 `#34A853` を返す。一方9章の「成功していれば」は「開くと**4章と同じ画面**が出ます」と書いており、4章 §4 の画面は青の v1。受講者は緑を見るのに本文は青を示唆していた | 破綻(修正した) |
| 8 | 7章 → 10-1 | 10-1 は `handson-app` の `/pubsub` に push する。7章で concurrency 10 に絞った状態で問題ないか | **[過]** 同一サービスの通し実行の中で push が成功(`POST 204 .../pubsub`、約20秒でログ反映)。同じ実行内で concurrency=10 も確認されているため、**concurrency 10 の状態で push が通ることは実質的に踏まれている**(ただしレポートに「concurrency 10 の状態で」と明記した記述はない) | 成立 |
| 9 | 6章 → 10-3 | 10-3 は `${IMAGE}:v3` を使う。そのタグが存在するか | **[静]** 6章 §1 が `docker push ${IMAGE}:v3` を実行するため、本文の順序どおり進めればタグは存在する。**ただし過去の実機検証は本編の `handson` リポジトリを使わず、`handson-jobs` リポジトリへ自前でビルド・push しており、本編からのタグ引き継ぎは一度も検証されていない**。10-3 の 詰まったら にはタグが無い場合の読み替え指示がある | 未実施 |
| 10 | 全章 → 99章 | 99章が全リソースを削除する | **未測定。** 本セッションでは削除を1件も実行していない。加えて、**過去の実機検証でも「99章の手順をそのまま実行した」記録は1本もなく**、各担当が自前の削除コマンドを流している。下記「後片付けの網羅性」に懸念を記載 | 未実施 |

## 本文と実際の食い違い

| # | 該当箇所 | 教材の記述 | 実際 | 対応 |
|---|---|---|---|---|
| 1 | `09_source_deploy/README.md` L19(「成功していれば」) | 「`Service URL: https://handson-app-src-...` が表示されます。**開くと4章と同じ画面が出ます。**」 | 9章は `~/cloudrun-handson/app` で `--source .` を実行する。そのディレクトリは6章 §1 で **v3(緑 `#34A853` / `Hello, Cloud Run v3!`)に書き換えたまま**であり、4章の画面(青 `#4285F4` / `Hello, Cloud Run!`)にはならない。ローカルで当該ディレクトリをビルド・起動して緑のv3が返ることを実測 | **修正した。** 「4章と同じ**レイアウト**の画面が出ますが、**色とメッセージは緑の v3** です(6章で書き換えたまま進めているため)」と明記し、`Service` 欄が `handson-app-src` になる点も追記 |

### なぜこの食い違いが今まで残ったか

既存の実機検証レポート `live-jobs.md` は「イメージは `code/app` を `--platform linux/amd64` でビルド」と明記しており、
`code/app/src/index.ts` は **v1(青)のまま**である(実測確認済み)。
つまり章ごとに独立して検証すると `code/app` を起点にするため v1 の青が出て本文と一致してしまい、
**0章から順に通して進めた受講者だけが緑を見る**。章の分担検証では原理的に見つからない類の不整合であり、
通し dry-run の目的にそのまま合致する発見である。

## 後片付けの網羅性

**未実施。** 99章のコマンドを1つも実行していないため、削除可否を報告できない。
本レポートでクラウド上に**新規作成したリソースは無い**(認証が通らず作成自体ができなかった)ため、
この dry-run に起因する課金は発生しない。

| リソース | 99章の手順で消えたか |
|---|---|
| Cloud Run `handson-app` | 未実施(未作成) |
| Cloud Run `handson-app-src` | 未実施(未作成) |
| Cloud Run `handson-chat` | 未実施(未作成) |
| Cloud Run ジョブ `handson-job` | 未実施(未作成) |
| Cloud Scheduler `handson-job-schedule` | 未実施(未作成) |
| サービスアカウント `handson-scheduler@` | 未実施(未作成) |
| Pub/Sub `handson-sub` / `handson-topic` | 未実施(未作成) |
| Artifact Registry `handson` | 未実施(未作成) |
| Artifact Registry `cloud-run-source-deploy` | 未実施(未作成) |
| Cloud Build バケット `gs://<PROJECT_ID>_cloudbuild` | 未実施(未作成) |

### 既存の実機記録との突き合わせ(参考)

99章の削除漏れについては、過去の実機検証で既に2件が発見・本文へ反映済みであることを確認した(本レポートでの再検証はしていない)。

- Artifact Registry `cloud-run-source-deploy` の削除コマンド追加(`99_cleanup.md` #12)
- Cloud Build ステージングバケット `gs://<プロジェクトID>_cloudbuild` の削除コマンド追加(`99_cleanup.md` #14、commit `8fc3c01`)

### 懸念1: `sandbox-360407` に過去セッションの残骸が残っている可能性(未確認・要対応)

**過去の実機検証レポート4本のうち、9章担当の `live-source-deploy.md` にだけ後片付けの記録がない。**
他の3本(`live-main-path.md` / `live-jobs.md` / `live-websocket.md`)は末尾で削除コマンドと残存ゼロ確認を記録しているが、
9章分については以下3点の削除記録が**一切見つからなかった**。

| リソース | 作成の記録 | 削除の記録 |
|---|---|---|
| Cloud Run サービス `handson-app-src` | あり(`live-source-deploy.md`) | **なし** |
| Artifact Registry `cloud-run-source-deploy` | あり(#4 で自動作成を確認) | **なし** |
| GCS バケット `gs://sandbox-360407_cloudbuild` | あり(#15 で `timeCreated` まで特定) | **なし** |

本セッションでは認証が通らず `gcloud run services list` / `gcloud artifacts repositories list` / `gcloud storage ls` を
実行できなかったため、**これらが現在も存在するかを確認できていない**。存在していれば Artifact Registry と
Cloud Storage のストレージ課金が2026-08-19 から継続している。
**認証復旧後、最優先で存在確認と削除を行うべき項目。**(検証者が作ったものであり、教材の不具合ではない。
また既存の本番サービス `genie` と Artifact Registry `y-ohgi` は本セッションで一切触っていない。)

### 懸念2: `run-sources-*` バケットが99章の削除対象から漏れている可能性(未解決)

公式ドキュメント調査と過去の実機測定が食い違っている。

- **実機測定(一次)**: `live-source-deploy.md` #15 は、`gcloud run deploy --source .` の直後に
  `gs://sandbox-360407_cloudbuild`(US マルチリージョン)が新規作成されたことを `timeCreated` の一致で確認し、
  「命名規則は当初想定した `run-sources-` 接頭辞ではなかった」と明記している。99章はこの測定に基づき修正済み。
- **公式ドキュメント調査(今回実施)**: Cloud Run のソースデプロイは
  `run-sources-<PROJECT_ID>-<REGION>` というバケットにソースを置くという記述がある。
  ただし直接引用が取れたのは Cloud Functions 側のページの権限説明(`run-sources-*` / `gcf-v2-sources-*` の列挙)であり、
  「通常の Cloud Run サービスの `--source` デプロイ用」という対応付けは文脈からの推論。確度は中〜高。

**両方が作られる可能性を否定できない。** その場合、99章は `_cloudbuild` しか削除していないため
`run-sources-asia-northeast1` 側が残り、ソースの zip がストレージ課金を生み続ける。
実測が取れている `_cloudbuild` の削除手順は正しいので**本文は変更していない**が、
認証復旧後に `gcloud storage ls` でバケット一覧を確認し、`run-sources-*` が存在すれば99章へ追記すべき。
Cloud Storage の Always Free 枠(5GB-months)は us-east1 / us-west1 / us-central1 限定で、
`asia-northeast1` や US マルチリージョンのバケットには**適用されない**点も判断材料になる。

## 検証環境に起因する差(教材の不具合ではない)

- 検証マシンは arm64、Cloud Run は amd64 を要求するため `docker build` にはすべて `--platform linux/amd64` を付けた。
  Cloud Shell は amd64 なので**受講者には発生しない差**であり、本文は書き換えていない。
- 2章の「ウェブでプレビュー」ボタンは Cloud Shell 固有のUIのため、ローカルでは `curl` で代替した。

## ローカルに残した作業物

課金は発生しないが、検証マシン上に以下を作成した(削除は未実施)。

- `~/cloudrun-handson/app/`(2章の手順で作成した4ファイル。`src/index.ts` は v3 状態)
- `~/load.mjs`(7章の負荷スクリプト)

削除する場合は `rm -rf ~/cloudrun-handson ~/load.mjs`。
このセッションで追加した Docker タグ(`local-handson/app:v2` / `:v3`、`local-chat:v1`)は削除済み。
`handson-app:v1` および `asia-northeast1-docker.pkg.dev/sandbox-360407/handson*` のタグは
2026-08-19 の過去セッションから存在していたもので、本セッションでは作成も削除もしていない。

## 未実施項目と理由

| 項目 | 理由 |
|---|---|
| 0章のプロジェクト新規作成・請求先紐付け | 指示により実施しない(既存 `sandbox-360407` を使用する方針) |
| 0章のAPI有効化・`gcloud` 動作確認 | `gcloud` 認証切れ |
| 4章〜9章のクラウド操作すべて | `gcloud` 認証切れ |
| 発展編 10-1 / 10-2 / 10-3 | `gcloud` 認証切れ(10-2 のイメージビルドのみ実施) |
| 99章の後片付けと残存確認 | `gcloud` 認証切れ |

### 再実行の手順

`gcloud auth login`(ブラウザ対話が必要なため人手で実行)を通したうえで、以下を上から順に片付ければ
通し dry-run が完成する。優先度順。

1. **懸念1の後始末(最優先・課金に直結)**: `gcloud run services list --region asia-northeast1` /
   `gcloud artifacts repositories list --location asia-northeast1` / `gcloud storage ls` を実行し、
   `handson-app-src`、`cloud-run-source-deploy`、`gs://sandbox-360407_cloudbuild` が残っていれば削除する。
2. **懸念2の決着**: 上の `gcloud storage ls` の出力に `run-sources-*` があるかを見る。
   あれば99章の削除手順へ1行追記する。
3. **つなぎ目 #4(6章→7章)の実測**: 6章末の状態から `services update --concurrency 10 --max-instances 10` を打ち、
   (a) 本番URLが緑(v3)のままか (b) `staging` タグがどのリビジョンに残るか を `describe` で確認する。
   `staging` が古いリビジョンに残る場合、タグ付きURLと本番URLで concurrency 設定が食い違う状態になり、
   本文に言及がないため注記の要否を判断したい。**本セッションで唯一「破綻(要判断)」と判定した項目**。
4. **つなぎ目 #9(6章→10-3)の実測**: 本編を通した状態のまま `gcloud run jobs create handson-job --image ${IMAGE}:v3`
   が通るか。過去の検証は別リポジトリを使ったため、この引き継ぎは一度も踏まれていない。
5. **つなぎ目 #10(99章)の実測**: 99章の「個別に削除する場合」のコマンド列を**そのまま上から実行**し、
   残存ゼロを確認する。過去の検証はいずれも各担当の自前コマンドであり、
   **99章の手順そのものを実行した記録は1本もない**。
