import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import type { WSContext } from "hono/ws";
import crypto from "node:crypto";

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// インスタンスのメモリ上に接続を保持する。
// 本番では複数インスタンス間の共有に Memorystore (Redis) 等が必要になる。
// ハンズオンでは --max-instances 1 でデプロイして単一インスタンスに固定する。
const clients = new Set<WSContext>();

// クライアント側 JS はサーバー側のテンプレートリテラルと ${} が衝突しないよう
// 文字列連結で書いている
const HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cloud Run WebSocket Chat</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
    #messages { border: 1px solid #ccc; height: 300px; overflow-y: scroll; padding: 0.5rem; }
    #messages div { padding: 0.2rem 0; border-bottom: 1px solid #eee; }
    form { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    input { flex: 1; padding: 0.5rem; }
    button { padding: 0.5rem 1rem; }
  </style>
</head>
<body>
  <h1>Cloud Run Chat</h1>
  <p>ALB も API Gateway もなしで WebSocket が動いています</p>
  <div id="messages"></div>
  <form onsubmit="send(event)">
    <input id="input" autocomplete="off" placeholder="メッセージを入力">
    <button>送信</button>
  </form>
  <script>
    var proto = location.protocol === "https:" ? "wss:" : "ws:";
    var ws = new WebSocket(proto + "//" + location.host + "/ws");
    ws.onmessage = function (e) {
      var div = document.createElement("div");
      div.textContent = e.data;
      var messages = document.getElementById("messages");
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    };
    function send(event) {
      event.preventDefault();
      var input = document.getElementById("input");
      if (input.value) {
        ws.send(input.value);
        input.value = "";
      }
    }
  </script>
</body>
</html>`;

app.get("/", (c) => c.html(HTML));

app.get(
  "/ws",
  upgradeWebSocket(() => {
    const name = `user-${crypto.randomUUID().slice(0, 4)}`;
    return {
      onOpen(_evt, ws) {
        clients.add(ws);
      },
      onMessage(evt, _ws) {
        // 受け取ったメッセージを接続中の全クライアントへブロードキャスト
        for (const client of clients) {
          client.send(`[${name}] ${String(evt.data)}`);
        }
      },
      onClose(_evt, ws) {
        clients.delete(ws);
      },
    };
  }),
);

const port = Number(process.env.PORT ?? 8080);
const server = serve({ fetch: app.fetch, port }, () => {
  console.log(JSON.stringify({ severity: "INFO", message: `listening on port ${port}` }));
});
injectWebSocket(server);
