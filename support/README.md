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

## 設定(環境変数)

| 変数 | デフォルト | 説明 |
|---|---|---|
| `PORT` | `8080` | リッスンポート(Cloud Run が注入) |
| `GITBOOK_URL` | `/book/` | iframe に表示する URL。GitHub Pages 等の外部ホスティングに差し替え可能(その場合、埋め込み先が iframe 表示を許可している必要があります) |
| `BOOK_DIR` | `../_book`(Docker では `./book`) | 同梱 GitBook の静的ファイルのパス |

## 章立てを変えたとき

進捗報告の選択肢は `src/index.ts` の `CHAPTERS` 配列で定義しています。GitBook の `SUMMARY.md` の章立てを変えた場合はここも合わせて更新してください。
