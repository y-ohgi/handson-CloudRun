# 10-2. WebSocketチャット

「サーバーレスでWebSocketは無理」という常識(Lambda 単体では扱えず、API Gateway の WebSocket API + DynamoDB で接続管理…)を、Cloud Run があっさり覆すのを見ます。

> **進め方:** イベントでは講師がデプロイ済みのURLを画面に映し、**参加者全員がスマホやPCから同じチャットに参加**します。自分でもデプロイしたい人向けの手順も載せています(2章のスキルで全部できます)。

## なぜ Cloud Run で WebSocket が動くのか

Cloud Run のインスタンスは「普通のHTTPサーバーのプロセス」なので、コネクションを張りっぱなしにできます。特別な設定はほぼ不要で、注意点は3つだけです:

- リクエストタイムアウト(デフォルト5分、最大60分)がコネクションにも適用される → `--timeout` を伸ばす。切断時はクライアントが再接続する設計にする
- 接続はインスタンスのメモリに紐づく → 複数インスタンス間で状態を共有するには Memorystore (Redis) 等が必要
- 再接続時に同じインスタンスへ戻したい → `--session-affinity` を付ける

## デプロイ手順(講師 or 自分でやりたい人向け)

コードはこのリポジトリの [`code/websocket/`](https://github.com/y-ohgi/handson-CloudRun/tree/main/code/websocket) にあります。本編と同じ TypeScript + Hono 製(`@hono/node-ws` を追加)の小さなチャットサーバーで、受け取ったメッセージを接続中の全クライアントにブロードキャストするだけのものです。

```bash
cd ~/cloudrun-handson
git clone https://github.com/y-ohgi/handson-CloudRun.git
cd handson-CloudRun/code/websocket

docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/chat:v1 .
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/chat:v1

gcloud run deploy handson-chat \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/chat:v1 \
  --region ${REGION} \
  --allow-unauthenticated \
  --timeout 3600 \
  --session-affinity \
  --max-instances 1
```

> `--max-instances 1` は、接続管理をインスタンスのメモリで済ませているこのデモアプリの都合です。1台に固定することで「全員が同じメモリ空間につながる」状態を作っています。

## 体験する

発行されたURLを全員で開き、メッセージを送り合ってみてください。**リアルタイムに全員の画面へ配信されます。**

いま起きていることを整理すると:

- ロードバランサーも API Gateway も立てていない
- 接続管理のための DynamoDB 相当も書いていない
- コードはローカルで `docker run` してもそのまま動く、教科書通りの WebSocket サーバー

## 実務で使うなら

- 状態共有: インスタンス間のブロードキャストは **Memorystore (Redis) の Pub/Sub** を挟むのが定番。そうすれば `--max-instances` の制限は外せます
- gRPC(双方向ストリーミング含む)や Server-Sent Events も同様にサポートされています。**「HTTPでできることは大体できる」**と覚えておけばOKです
