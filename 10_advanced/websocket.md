# 10-2. WebSocketチャット

「サーバーレスでWebSocketは無理」という常識(Lambda 単体では扱えず、API Gateway の WebSocket API + DynamoDB で接続管理…)を、Cloud Run があっさり覆すのを見ます。

> **進め方:** イベントでは講師がデプロイ済みのURLを画面に映し、**参加者全員がスマホやPCから同じチャットに参加**します。自分でもデプロイしたい人向けの手順も載せています(2章のスキルで全部できます)。

## なぜ Cloud Run で WebSocket が動くのか

Cloud Run のインスタンスは「普通のHTTPサーバーのプロセス」なので、コネクションを張りっぱなしにできます。特別な設定はほぼ不要で、注意点は3つだけです:

- リクエストタイムアウト(デフォルト5分、最大60分)がコネクションにも適用される → `--timeout` を伸ばす。切断時はクライアントが再接続する設計にする
- 接続はインスタンスのメモリに紐づく → 複数インスタンス間で状態を共有するには Memorystore (Redis) 等が必要
- 再接続時に同じインスタンスへ戻したい → `--session-affinity` を付ける。ただし公式にはベストエフォートで、新しい WebSocket 接続が別のインスタンスにつながる可能性は残ります

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

<!-- 引用ブロックの結合を防ぐ区切り -->

> **成功していれば:** デプロイの最後に `Service URL: https://handson-chat-....run.app` が表示され、`gcloud run services list --region ${REGION}` に `handson-chat` が並びます。
> **詰まったら:** イメージのパスが `-docker.pkg.dev//` のように途中が空になっている場合は、環境変数が消えています。4章の「0. 環境変数の準備」を再実行してから docker build からやり直してください。`docker push` が `denied` や `unauthorized` で失敗する場合は `gcloud auth configure-docker ${REGION}-docker.pkg.dev` を実行してから push を再試行します。デプロイは同じコマンドを何度実行しても新しいリビジョンが作られるだけなので、失敗したらそのまま再実行して構いません。自分のデプロイがうまくいかないときは、講師が画面に映しているURLで体験に参加してください(この節の学習内容は変わりません)。

## 体験する

発行されたURLを全員で開き、メッセージを送り合ってみてください。**リアルタイムに全員の画面へ配信されます。**

いま起きていることを整理すると:

- ロードバランサーも API Gateway も立てていない
- 接続管理のための DynamoDB 相当も書いていない
- コードはローカルで `docker run` してもそのまま動く、教科書通りの WebSocket サーバー

> **成功していれば:** 自分が送ったメッセージが、他の参加者の画面にもほぼ同時に表示されます。
> **詰まったら:** メッセージが届かない・送れなくなった場合は、まずページを再読み込みして接続を張り直してください。WebSocket の接続はリクエストタイムアウトの対象で、`--timeout` を伸ばしていないサービスでは既定の5分で切断されます。自分でデプロイしたサービスで一部の人にだけ届かない場合は、`--max-instances 1` を付け忘れていないか確認してください(このデモは接続をインスタンスのメモリで管理しているため、インスタンスが増えると接続先ごとに分断されます)。心当たりがあれば「デプロイ手順」のコマンドをそのまま再実行すれば設定が入ります。`--session-affinity` はベストエフォートなので、これだけでは同じインスタンスに集まることは保証されません。`gcloud run services describe handson-chat --region ${REGION} --format 'value(status.url)'` で全員が同じURLを開いているかも確認してください。

## 実務で使うなら

- 状態共有: インスタンス間のブロードキャストは **Memorystore (Redis) の Pub/Sub** を挟むのが定番。そうすれば `--max-instances` の制限は外せます
- gRPC(双方向ストリーミング含む)や Server-Sent Events も同様にサポートされています。ただし gRPC のストリーミングには HTTP/2 が必要なので、デプロイ時に `--use-http2` を付けます。**「HTTPでできることは大体できる」**と覚えておけばOKです
