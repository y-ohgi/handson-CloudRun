import { serve } from "@hono/node-server";
import { Hono } from "hono";
import crypto from "node:crypto";

// ================================================================
// ハンズオンで書き換えるのはこの2行です
// ================================================================
const MESSAGE = "Hello, Cloud Run!";
const BG_COLOR = "#4285F4"; // v1: 青 / v2: "#EA4335" 赤 / v3: "#34A853" 緑

// コンテナ(インスタンス)が起動したタイミングで一意なIDを生成する。
// オートスケールで何台に増えたかを見分けるために使う。
const INSTANCE_ID = crypto.randomUUID().slice(0, 8);

// stdout に1行JSONを吐くと Cloud Logging が構造化ログとして解釈する
const log = (severity: string, message: string, extra: Record<string, unknown> = {}) => {
  console.log(JSON.stringify({ severity, message, ...extra }));
};

const app = new Hono();

app.get("/", (c) => {
  log("INFO", "index accessed", { instance: INSTANCE_ID });
  // K_SERVICE / K_REVISION は Cloud Run が自動で注入する環境変数
  const service = process.env.K_SERVICE ?? "local";
  const revision = process.env.K_REVISION ?? "local";
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cloud Run Handson</title>
  <style>
    body {
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: ${BG_COLOR};
      color: #fff;
      font-family: sans-serif;
    }
    h1 { font-size: 3rem; margin: 0.5rem; }
    table { margin-top: 2rem; border-collapse: collapse; }
    td { padding: 0.3rem 1rem; border: 1px solid rgba(255,255,255,0.5); }
  </style>
</head>
<body>
  <h1>${MESSAGE}</h1>
  <table>
    <tr><td>Service</td><td>${service}</td></tr>
    <tr><td>Revision</td><td>${revision}</td></tr>
    <tr><td>Instance</td><td>${INSTANCE_ID}</td></tr>
  </table>
</body>
</html>`);
});

// スクリプトから叩きやすいJSON版。カナリアの割合確認などに使う
app.get("/api", (c) =>
  c.json({
    message: MESSAGE,
    revision: process.env.K_REVISION ?? "local",
    instance: INSTANCE_ID,
  }),
);

// 1秒かかる重い処理のふり。負荷試験でオートスケールを観察するために使う
app.get("/heavy", async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return c.json({ instance: INSTANCE_ID });
});

// Pub/Sub push サブスクリプションの受け口(発展編で使用)
app.post("/pubsub", async (c) => {
  const envelope = await c.req.json().catch(() => ({}));
  const data: string = envelope?.message?.data ?? "";
  const text = data ? Buffer.from(data, "base64").toString("utf-8") : "(empty)";
  log("INFO", `Pub/Sub message received: ${text}`);
  return c.body(null, 204);
});

// Cloud Run は環境変数 PORT でリッスンすべきポートを渡してくる
const port = Number(process.env.PORT ?? 8080);
serve({ fetch: app.fetch, port }, () => {
  log("INFO", `listening on port ${port}`);
});
