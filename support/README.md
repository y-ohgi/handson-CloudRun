# ハンズオン サポートアプリ

ハンズオン当日に使うリアルタイムのサポート Web アプリです。GitBook(ハンズオン資料)を iframe で表示し、その外側で参加者が以下をリアルタイムに共有できます。

- **チャット** — コメント・質問をその場で投稿
- **進捗報告** — 「いまいる章」をクリックで表明。全員の分布がバーで見えるので、講師はペース配分を判断できる
- **ヘルプ要請** — 🙋ボタンで挙手。誰がどの章で詰まっているかが一覧になり、メンターが「解決」で消し込む

GitBook 本体はこのアプリに依存しません(単体で配布・閲覧できます)。このアプリはビルド済みの GitBook を同梱して `/book/` で配信し、それを iframe に表示します。

## 技術スタック

ハンズオン本編と同じ **TypeScript + Hono + Cloud Run** です。つまり**このサポートアプリ自体が、ハンズオンで学ぶ構成そのもの**で動いています(WebSocket・セッションアフィニティ・`--max-instances 1` は発展編 10-2 で説明している内容です)。

- 状態(参加者・進捗・チャット履歴)はインスタンスのメモリ上に保持します
- そのため `--max-instances 1` でのデプロイが前提です
- インスタンスが再起動すると状態は消えます。1日のイベント運用なら許容範囲ですが、気になる場合はイベント中 `--min-instances 1` にして再起動の確率を下げてください

## ローカルで動かす

```bash
# 1. リポジトリルートで GitBook をビルド(iframe に表示する分)
npm install
npm run build

# 2. サポートアプリを起動
cd support
npm install
npm start
# → http://localhost:8080
```

## Cloud Run へデプロイする

**リポジトリルート**をビルドコンテキストにします(GitBook を同梱するため)。

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-northeast1
export IMAGE=${REGION}-docker.pkg.dev/${PROJECT_ID}/handson/support

docker build -f support/Dockerfile -t ${IMAGE}:v1 .
docker push ${IMAGE}:v1

gcloud run deploy handson-support \
  --image ${IMAGE}:v1 \
  --region ${REGION} \
  --allow-unauthenticated \
  --timeout 3600 \
  --session-affinity \
  --max-instances 1 \
  --min-instances 1
```

発行された URL を当日の参加者に共有してください(QRコードにしておくと楽です)。

## 後片付け(イベント終了後に必ず実行)

上のデプロイは `--min-instances 1` を付けているため、**誰もアクセスしていない時間帯もインスタンスが起動したままで、課金され続けます**。ハンズオン本編のサービスと違ってスケールtoゼロが効かないので、イベントが終わったら必ず削除してください。

> **根拠:** Cloud Run の公式ドキュメントは、最小インスタンス数の指定で起動し続けるインスタンスには課金が発生すると明記しています。リクエストベース課金ではアイドル中は低めの料金、インスタンスベース課金ではインスタンスのライフサイクル全体に通常料金がかかります([最小インスタンス数の構成](https://cloud.google.com/run/docs/configuring/min-instances?hl=ja))。

ターミナルを開き直して環境変数が消えている場合は、先に「Cloud Run へデプロイする」の `export` 3行を実行し直してください。

```bash
# サポートアプリの Cloud Run サービス(これを消せばアイドル課金は止まります)
gcloud run services delete handson-support --region ${REGION} --quiet

# サポートアプリのコンテナイメージ(Artifact Registry の保管料がかかるため忘れずに)
gcloud artifacts docker images delete ${IMAGE} --delete-tags --quiet
```

このアプリのデプロイ手順が作るリソースは、この2つ(`handson-support` サービスと `handson/support` イメージ)だけです。サービスアカウントや Pub/Sub は作りません。

> **注意:** Artifact Registry のリポジトリ(本編の4章で作る `handson`)はハンズオン本編の `handson/app` イメージと共用しているため、ここでは削除しません。リポジトリごと消すと受講者向けの手順で作ったイメージも一緒に消えます。プロジェクトまるごと片付ける場合は本編の「99. 後片付け」を参照してください。

## 設定(環境変数)

| 変数 | デフォルト | 説明 |
|---|---|---|
| `PORT` | `8080` | リッスンポート(Cloud Run が注入) |
| `GITBOOK_URL` | `/book/` | iframe に表示する URL。GitHub Pages 等の外部ホスティングに差し替え可能(その場合、埋め込み先が iframe 表示を許可している必要があります)。スキームを省略した場合は補完されます(`localhost:4000` → `http://`、それ以外のホスト → `https://`) |
| `BOOK_DIR` | `../_book`(Docker では `./book`) | 同梱 GitBook の静的ファイルのパス |

## 章立てを変えたとき

進捗報告の選択肢は `src/index.ts` の `CHAPTERS` 配列で定義しています。GitBook の `SUMMARY.md` の章立てを変えた場合はここも合わせて更新してください。
