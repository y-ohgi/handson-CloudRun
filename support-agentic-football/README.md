# Agentic Football Cup サポートアプリ

[Agentic Football Cup](https://catalog.workshops.aws/agentic-football/ja-JP) ワークショップ当日に使う、リアルタイムのサポート Web アプリです。`support/`(Cloud Run ハンズオン本編用)を元に、このワークショップ向けに作り直したものです。

- **チャット** — コメント・質問をその場で投稿
- **進捗報告** — 「いまいるステップ」をクリックで表明。全員の分布がバーで見えるので、講師はペース配分を判断できる
- **ヘルプ要請** — 🙋ボタンで挙手。誰がどのステップで詰まっているかが一覧になり、メンターが「解決」で消し込む

ワークショップ本体のページは `X-Frame-Options: DENY` を返すため iframe 埋め込みができません。そのため `support/` と異なり、資料を埋め込むのではなく別タブで開くリンク(ヘッダーの「ワークショップを開く」)を用意しています。

## ⚠️ 使用前に必ず確認すること

`src/index.ts` の `CHAPTERS` 配列は、ワークショップのサイドナビゲーション(2026-09-12 時点のスクリーンショットで確認)に基づいています。フェーズ1〜3の下にサブステップを `phase` で紐づけてグループ表示しています。付録(エージェントプロンプトライブラリ・環境セットアップガイド)は参照資料のため進捗項目には含めていません。ワークショップの構成が変わった場合は更新してください。

## 技術スタック

`support/` と同じ **TypeScript + Hono** ですが、Cloud Run Service ではなく **Cloud Run Instances**(Preview, 2026-08-28 発表)にデプロイします。

- Cloud Run Instances は常に単一インスタンス(singleton)でオートスケールしないため、Cloud Run Service で必要だった `--max-instances 1` / `--min-instances 1` / `--session-affinity` の指定が不要です
- 状態(参加者・進捗・チャット履歴)はインスタンスのメモリ上に保持します
- インスタンスが再起動(`stop`→`start`、クラッシュ再起動など)すると状態は消えます。実機検証済みで、Cloud Run Instances の `stop`/`start` はコンテナプロセスを再起動するため、メモリ上の状態は保持されません。1日のイベント運用なら許容範囲です
- Preview 機能のため `gcloud beta` コマンドが必要で、将来仕様が変わる可能性があります

## ローカルで動かす

```bash
cd support-agentic-football
npm install
npm start
# → http://localhost:8080
```

## Cloud Run Instance へデプロイする

`gcloud beta run instances` コマンドを使います(未導入の場合は `gcloud components install beta` が必要)。

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-northeast1
export IMAGE=${REGION}-docker.pkg.dev/${PROJECT_ID}/handson/agentic-football-support

docker build --platform linux/amd64 -t ${IMAGE}:v1 ./support-agentic-football
docker push ${IMAGE}:v1

gcloud beta run instances create agentic-football-support \
  --image=${IMAGE}:v1 \
  --region=${REGION} \
  --port=8080 \
  --public
```

発行された URL を当日の参加者に共有してください(QRコードにしておくと楽です)。

コードを更新して再デプロイする場合は `create` の代わりに `deploy` を使います。

```bash
gcloud beta run instances deploy agentic-football-support \
  --image=${IMAGE}:vN \
  --region=${REGION}
```

## 後片付け(イベント終了後に必ず実行)

Cloud Run Instances は常に起動したままで、**誰もアクセスしていない時間帯も課金され続けます**。イベントが終わったら必ず削除してください。

```bash
# 環境変数が消えている場合は「Cloud Run Instance へデプロイする」の export 3行を実行し直す
gcloud beta run instances delete agentic-football-support --region ${REGION} --quiet
gcloud artifacts docker images delete ${IMAGE} --delete-tags --quiet
```

## 設定(環境変数)

| 変数 | デフォルト | 説明 |
|---|---|---|
| `PORT` | `8080` | リッスンポート(Cloud Run が注入) |
| `WORKSHOP_URL` | `https://catalog.workshops.aws/agentic-football/ja-JP` | ヘッダーの「ワークショップを開く」リンク先 |

## ステップ(章立て)を変えたとき

進捗報告の選択肢は `src/index.ts` の `CHAPTERS` 配列で定義しています。ワークショップの構成が変わった場合はここも合わせて更新してください。
