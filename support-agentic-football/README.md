# Agentic Football Cup サポートアプリ

[Agentic Football Cup](https://catalog.workshops.aws/agentic-football/ja-JP) ワークショップ当日に使う、リアルタイムのサポート Web アプリです。`support/`(Cloud Run ハンズオン本編用)を元に、このワークショップ向けに作り直したものです。

- **チャット** — コメント・質問をその場で投稿
- **進捗報告** — 「いまいるステップ」をクリックで表明。全員の分布がバーで見えるので、講師はペース配分を判断できる
- **ヘルプ要請** — 🙋ボタンで挙手。誰がどのステップで詰まっているかが一覧になり、メンターが「解決」で消し込む

ワークショップ本体のページは `X-Frame-Options: DENY` を返すため iframe 埋め込みができません。そのため `support/` と異なり、資料を埋め込むのではなく別タブで開くリンク(ヘッダーの「ワークショップを開く」)を用意しています。

## ⚠️ 使用前に必ず確認すること

`src/index.ts` の `CHAPTERS` 配列は、ワークショップのサイドナビゲーション(2026-09-12 時点のスクリーンショットで確認)に基づいています。フェーズ1〜3の下にサブステップを `phase` で紐づけてグループ表示しています。付録(エージェントプロンプトライブラリ・環境セットアップガイド)は参照資料のため進捗項目には含めていません。ワークショップの構成が変わった場合は更新してください。

## 技術スタック

`support/` と同じ **TypeScript + Hono + Cloud Run** です。

- 状態(参加者・進捗・チャット履歴)はインスタンスのメモリ上に保持します
- そのため `--max-instances 1` でのデプロイが前提です
- インスタンスが再起動すると状態は消えます。1日のイベント運用なら許容範囲ですが、気になる場合はイベント中 `--min-instances 1` にして再起動の確率を下げてください

## ローカルで動かす

```bash
cd support-agentic-football
npm install
npm start
# → http://localhost:8080
```

## Cloud Run へデプロイする

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-northeast1
export IMAGE=${REGION}-docker.pkg.dev/${PROJECT_ID}/handson/agentic-football-support

docker build -t ${IMAGE}:v1 ./support-agentic-football
docker push ${IMAGE}:v1

gcloud run deploy agentic-football-support \
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

上のデプロイは `--min-instances 1` を付けているため、**誰もアクセスしていない時間帯もインスタンスが起動したままで、課金され続けます**。イベントが終わったら必ず削除してください。

```bash
# 環境変数が消えている場合は「Cloud Run へデプロイする」の export 3行を実行し直す
gcloud run services delete agentic-football-support --region ${REGION} --quiet
gcloud artifacts docker images delete ${IMAGE} --delete-tags --quiet
```

## 設定(環境変数)

| 変数 | デフォルト | 説明 |
|---|---|---|
| `PORT` | `8080` | リッスンポート(Cloud Run が注入) |
| `WORKSHOP_URL` | `https://catalog.workshops.aws/agentic-football/ja-JP` | ヘッダーの「ワークショップを開く」リンク先 |

## ステップ(章立て)を変えたとき

進捗報告の選択肢は `src/index.ts` の `CHAPTERS` 配列で定義しています。ワークショップの構成が変わった場合はここも合わせて更新してください。
