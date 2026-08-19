# 実機検証: 10-2 WebSocket チャット

**実行日**: 2026-08-19
**環境**: sandbox-360407 / asia-northeast1 / リポジトリは衝突回避のため handson-ws を使用

対象ファイル: `10_advanced/websocket.md`、サンプルコード `code/websocket/`

検証マシンは arm64 (macOS / Docker 29.4.0) のため `docker build` に `--platform linux/amd64` を付与した。Cloud Shell は amd64 なので**検証環境固有の差であり教材の不具合ではない**。同様に、リポジトリ名を教材の `${REPO}` (= `handson`) から `handson-ws` に読み替えたのは他エージェントとの衝突回避であり、教材の記述とは無関係。

## 検証結果

| # | 検証項目 | 教材の記述 | 実際の結果 | 判定 | 対応 |
|---|---|---|---|---|---|
| 1 | `docker build` が通るか | `docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/chat:v1 .` | `--platform linux/amd64` 付きで成功。`npm install` は `added 4 packages, and audited 5 packages`、`found 0 vulnerabilities` | 一致 | なし |
| 2 | `docker push` が通るか | `docker push ...chat:v1` | 成功。`v1: digest: sha256:76c6b177e3c5d4f180fa77deacbd127d33a2a2af30ee9d88c03747f450f52db5 size: 2199` | 一致 | なし |
| 3 | `gcloud run deploy`(`--timeout 3600 --session-affinity --max-instances 1`)が通るか | デプロイ手順のコマンド | 成功。`Service [handson-chat] revision [handson-chat-00001-kbm] has been deployed and is serving 100 percent of traffic.` | 一致 | なし |
| 4 | デプロイ末尾の出力文言 | 「デプロイの最後に `Service URL: https://handson-chat-....run.app` が表示され」 | `Service URL: https://handson-chat-113111026602.asia-northeast1.run.app` | 一致 | なし |
| 5 | `gcloud run services list` に並ぶか | 「`gcloud run services list --region ${REGION}` に `handson-chat` が並びます」 | `handson-chat  asia-northeast1  https://handson-chat-113111026602.asia-northeast1.run.app` が一覧に表示 | 一致 | なし |
| 6 | `--max-instances 1` が反映されるか | 「1台に固定することで『全員が同じメモリ空間につながる』状態を作っています」 | `describe` の annotations に `autoscaling.knative.dev/maxScale: '1'` | 一致 | なし |
| 7 | `--timeout 3600` が反映されるか | 「`--timeout` を伸ばす」 | `describe` の `spec.template.spec.timeoutSeconds: 3600` | 一致 | なし |
| 8 | `--session-affinity` が実際に設定できるか | 「`--session-affinity` を付ける。ただし公式にはベストエフォート」 | フラグは通り、`describe` の annotations に `run.googleapis.com/sessionAffinity: 'true'`。HTTP レスポンスにも `set-cookie: GAESA=...` が付与される(session-affinity 無しで再デプロイすると `set-cookie` は付かない) | 一致 | なし |
| 9 | リクエストタイムアウトの既定値 5 分 | 「リクエストタイムアウト(デフォルト5分、最大60分)」 | `--timeout` を付けずに再デプロイすると `timeoutSeconds: 300`(= 5 分) | 一致 | なし |
| 10 | リクエストタイムアウトの最大値 60 分 | 同上 | `--timeout 3601` は `ERROR: (gcloud.run.services.update) service.spec.template.spec.timeout_seconds: Must be a number between 0 and 3600.` で拒否。3600(= 60 分)は受理 | 一致 | なし |
| 11 | WebSocket ハンドシェイクが Cloud Run 上で確立するか | 「Cloud Run のインスタンスは『普通のHTTPサーバーのプロセス』なので、コネクションを張りっぱなしにできます」 | `curl --http1.1 --include --no-buffer` で `HTTP/1.1 101 Switching Protocols` + `Upgrade: websocket` / `Connection: Upgrade` / `sec-websocket-accept: ...` を確認 | 一致 | なし |
| 12 | メッセージのブロードキャスト | 「自分が送ったメッセージが、他の参加者の画面にもほぼ同時に表示されます。」 | Node.js 26 の標準 `WebSocket` で 2 クライアント同時接続。a の送信は a・b 双方に `[user-95da] hello from a`、b の送信は双方に `[user-6c09] hello from b` として即時到達 | 一致 | なし |
| 13 | トップページ(チャット UI)が配信されるか | 「発行されたURLを全員で開き」 | `GET /` が `200 text/html; charset=UTF-8` | 一致 | なし |
| 14 | ローカルの `docker run` でもそのまま動くか | 「コードはローカルで `docker run` してもそのまま動く、教科書通りの WebSocket サーバー」 | `docker run -p 18080:8080` で `GET /` が 200、`/ws` が `HTTP/1.1 101 Switching Protocols`。起動ログは `{"severity":"INFO","message":"listening on port 8080"}` | 一致 | なし |
| 15 | 同じコマンドの再実行でリビジョンが増えるだけか | 「デプロイは同じコマンドを何度実行しても新しいリビジョンが作られるだけ」 | 設定変更を伴う `services update` で `handson-chat-00002-gkk` が作られ、100% トラフィックが移った。サービス削除後の再デプロイでは `handson-chat-00001-nb5` から番号が振り直された | 一致 | なし |
| 16 | `--use-http2` は WebSocket には不要か | 「gRPC のストリーミングには HTTP/2 が必要なので、デプロイ時に `--use-http2` を付けます」(WebSocket に付けるとは書いていない) | `--use-http2` **なし**で WebSocket は正常動作(#11・#12)。逆に `--use-http2` を付けて再デプロイすると `GET /` が **502**、WebSocket は `close code=1006` で接続不可(コンテナが HTTP/1.1 のみを話すため)。公式にも "Don't enable HTTP/2 end-to-end."(<https://cloud.google.com/run/docs/triggering/websockets>)とある | 不一致(修正した) | 教材が誤っているわけではないが、直前の文を読んで `--use-http2` を足すと壊れるため、「WebSocket には不要」と明示する一文を「実務で使うなら」に追記 |
| 17 | `ws` 依存 `^8.17.0` が未固定である点がビルドで問題を起こすか | 教材・`code/websocket/package.json` に `ws` の記述はない | `ws` は `code/websocket/package.json` の直接依存ではなく `@hono/node-ws@1.3.1` の推移的依存(`dependencies: { "ws": "^8.17.0" }`)。実ビルドでは **8.21.3** に解決され、ビルド・デプロイ・WebSocket 通信いずれも問題なし | 一致 | なし(教材の記述対象外。将来 ws の破壊的変更があれば `@hono/node-ws` 側の問題として現れる) |
| 18 | `--timeout` 未延長時に既定 5 分で切断されるか | 「`--timeout` を伸ばしていないサービスでは既定の5分で切断されます」 | 既定値が 300 秒であることは #9 で実測。5 分待って実際に切断されることは未実施。公式ドキュメントに "if the client keeps the connection open longer than the required timeout configured for the Cloud Run service, the client will be disconnected when the request times out."(<https://cloud.google.com/run/docs/triggering/websockets>)の記述あり | 未実施 | なし(所要時間の都合。公式ドキュメントで裏付け済み) |
| 19 | `git clone` からの手順 | 「`git clone https://github.com/y-ohgi/handson-CloudRun.git` → `cd handson-CloudRun/code/websocket`」 | clone 自体は未実施。`git ls-tree origin/main code/` および `origin/development` の双方に `code/websocket` が存在することを確認 | 未実施 | なし(パスの存在は確認済み) |
| 20 | 「詰まったら」の `docker push` 認証リカバリ | 「`denied` や `unauthorized` で失敗する場合は `gcloud auth configure-docker ${REGION}-docker.pkg.dev`」 | 検証前に `gcloud auth configure-docker asia-northeast1-docker.pkg.dev` が正常終了することを確認(`gcloud credential helpers already registered correctly.`)。認証エラーを意図的に発生させる再現は未実施 | 未実施 | なし |
| 21 | インスタンス間分断(`--max-instances` 未指定時) | 「インスタンスが増えると接続先ごとに分断されます」 | `--max-instances 1` 前提で検証したため未実施。複数インスタンスへ分散させるには一定の同時接続負荷が必要 | 未実施 | なし(コード上 `clients` が `Set` のプロセスローカル変数であることは `code/websocket/src/index.ts` で確認) |

## 補足観察(教材の記述と矛盾しないもの)

- `gcloud run deploy` の出力に出る URL は `https://handson-chat-113111026602.asia-northeast1.run.app`(プロジェクト番号形式)だが、`gcloud run services describe handson-chat --region ${REGION} --format 'value(status.url)'` は `https://handson-chat-nv5rboaedq-an.a.run.app`(旧ハッシュ形式)を返した。両方とも同じサービスに到達するため教材の記述は成立するが、参加者が「URL が違う」と混乱する可能性はある。教材は「全員が同じURLを開いているかも確認してください」という用途で `describe` を使わせているので、全員が同じコマンドを使えば比較は成立する。
- `curl` は ALPN で HTTP/2 を選ぶため、`--http1.1` を付けずに Upgrade ヘッダを送ると Cloud Run 側で HTTP/2 として処理され、アプリは 404(`upgradeWebSocket` が WebSocket リクエストでないと判断して `next()` する)を返す。ブラウザは自動的に HTTP/1.1 の Upgrade を使うため参加者には影響しないが、CLI で確認する場合は `--http1.1` が必要。

## 教材への変更

- `10_advanced/websocket.md` の「実務で使うなら」の gRPC / SSE の項に、WebSocket には `--use-http2` が不要である(付けると動かなくなる)ことを追記した。根拠は #16 の実測と Cloud Run 公式の WebSocket ドキュメント。

## 作成・削除したリソース

| リソース | 削除結果 |
|---|---|
| Cloud Run サービス `handson-chat` (asia-northeast1) | 削除済み |
| Artifact Registry リポジトリ `handson-ws` (asia-northeast1、イメージ `chat:v1` を含む) | 削除済み |
| ローカルコンテナ `ws-local` | 削除済み |

既存の本番サービス `genie`、他エージェントが使用中の `handson-jobs` / `y-ohgi` リポジトリには一切変更を加えていない。
