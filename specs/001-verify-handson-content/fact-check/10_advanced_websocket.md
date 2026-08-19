# Fact-check: 10_advanced/websocket.md

**確認日**: 2026-08-19

検証方法: Google Cloud 公式ドキュメント(一次情報)の WebFetch による突き合わせ。`gcloud` の実行は行っていない(課金リソースを作らないため)。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L9 | Cloud Run のインスタンスは普通の HTTP サーバープロセスなのでコネクションを張りっぱなしにできる / 特別な設定はほぼ不要 | 正しい | https://docs.cloud.google.com/run/docs/triggering/websockets (追加設定なしで WebSocket をサポート) | 変更なし |
| 2 | L11 | リクエストタイムアウトの既定は5分、最大60分 | 正しい | https://docs.cloud.google.com/run/docs/configuring/request-timeout ("The timeout is set by default to 5 minutes (300 seconds) and can be extended up to 60 minutes (3600 seconds).") | 変更なし |
| 3 | L11 | WebSocket のコネクションにもリクエストタイムアウトが適用される | 正しい | https://docs.cloud.google.com/run/docs/triggering/websockets ("WebSockets streams are HTTP requests, which are still subject to the request timeout configured for your Cloud Run service") | 変更なし |
| 4 | L11 | 切断時はクライアントが再接続する設計にする | 正しい | https://docs.cloud.google.com/run/docs/triggering/websockets (タイムアウト上限があるため再接続前提の設計を推奨) | 変更なし |
| 5 | L12 | 接続はインスタンスのメモリに紐づき、複数インスタンス間の状態共有には Memorystore (Redis) 等が必要 | 正しい | https://docs.cloud.google.com/run/docs/triggering/websockets ("use external message queue systems such as Redis Pub/Sub (Memorystore) or Firestore real-time updates …") | 変更なし |
| 6 | L13 | `--session-affinity` を付ければ再接続時に同じインスタンスへ戻せる | 要修正 | https://docs.cloud.google.com/run/docs/triggering/websockets ("session affinity on Cloud Run provides best effort affinity, new WebSockets requests could still potentially connect to different instances.") | 公式にはベストエフォートである旨が抜けていたため、同じ箇条書きの末尾に「ただし公式にはベストエフォートで、新しい WebSocket 接続が別のインスタンスにつながる可能性は残ります」を追記した |
| 7 | L17 | `code/websocket/` に TypeScript + Hono(`@hono/node-ws`)のチャットサーバーがある | 正しい | (リポジトリ内 `code/websocket/` に Dockerfile / package.json / src が存在) | 変更なし(read-only で確認、変更なし) |
| 8 | L24-25 | `docker build` / `docker push` の Artifact Registry イメージパス(`${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/chat:v1`) | 正しい | (`00_preparation/README.md` L84-85 で `REPO` / `IMAGE` を同じ書式で定義しており教材内で一貫) | 変更なし |
| 9 | L27-29 | `gcloud run deploy --image --region` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy | 変更なし |
| 10 | L30 | `--allow-unauthenticated` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy ("Use `--allow-unauthenticated` to enable and `--no-allow-unauthenticated` to disable.") | 変更なし |
| 11 | L31 | `--timeout 3600`(単位なし整数で秒として解釈される) | 正しい | https://docs.cloud.google.com/run/docs/configuring/request-timeout ("If you use an integer value, the unit is assumed to be seconds.")。最大 3600 秒であることも同ページで確認 | 変更なし |
| 12 | L32 | `--session-affinity` というフラグ名 | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy ("Whether to enable session affinity for connections to the service.") | 変更なし |
| 13 | L33 | `--max-instances 1` | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy | 変更なし |
| 14 | L36 | `--max-instances 1` にすると全員が同じメモリ空間につながる(デモアプリの都合) | 正しい | https://docs.cloud.google.com/run/docs/triggering/websockets (インスタンス間で状態は共有されないため) | 変更なし |
| 15 | L44 | ロードバランサーも API Gateway も立てていない | 正しい | https://docs.cloud.google.com/run/docs/triggering/websockets (追加設定不要) | 変更なし |
| 16 | L50 | インスタンス間ブロードキャストは Memorystore (Redis) の Pub/Sub を挟むのが定番、それにより `--max-instances` の制限は外せる | 正しい | https://docs.cloud.google.com/run/docs/triggering/websockets ("Redis Pub/Sub (Memorystore)") | 変更なし |
| 17 | L51 | gRPC(双方向ストリーミング含む)や Server-Sent Events も同様にサポートされている | 要修正 | https://docs.cloud.google.com/run/docs/triggering/grpc ("You can use all gRPC types, streaming or unary, with Cloud Run." / "many gRPC features, such as streaming and metadata, require HTTP/2")、https://docs.cloud.google.com/run/docs/configuring/http2 (フラグは `--use-http2`) | サポート自体は正しいが gRPC ストリーミングに HTTP/2 が必要な点が抜けていたため「gRPC のストリーミングには HTTP/2 が必要なので、デプロイ時に `--use-http2` を付けます」を追記した |

## 集計

- 正しい: 15
- 要修正: 2(#6, #17)
- 未確認: 0

## 修正はしていないが報告事項

- 公式ドキュメントは WebSocket に関して「1コンテナあたり最大1000同時接続」と `--concurrency` を引き上げる推奨を記載している(https://docs.cloud.google.com/run/docs/triggering/websockets)。教材は同時接続数に言及していないが、既存記述に誤りがあるわけではないため追記していない(新規記述の追加はスコープ外)。
