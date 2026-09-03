import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import type { WSContext } from "hono/ws";

const PORT = Number(process.env.PORT ?? 8080);

// iframe に表示する GitBook の URL。
// デフォルトはこのアプリ自身が /book/ で配信する同梱ビルド(Dockerfile 参照)。
// 外部ホスティング(GitHub Pages 等)を使う場合は環境変数で差し替える。
// スキームを省略した値(localhost:4000 など)はそのままだと相対URLとして解決されて
// iframe が表示できないため補う。Cloud Run は HTTPS 配信で http:// の埋め込みは
// mixed content としてブロックされるので、ローカル開発用ホスト以外は https:// を補う。
const normalizeBookUrl = (url: string) => {
  if (url.startsWith("/") || /^[a-z][a-z0-9+.-]*:\/\//i.test(url)) return url;
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(url);
  return `${isLocal ? "http" : "https"}://${url}`;
};

const GITBOOK_URL = normalizeBookUrl(process.env.GITBOOK_URL ?? "/book/");

// 同梱 GitBook の静的ファイルの場所。ローカル開発では book/_book を使う
const BOOK_DIR = process.env.BOOK_DIR ?? "../book/_book";

// 進捗報告の選択肢。GitBook の SUMMARY.md の章立てに合わせる
const CHAPTERS = [
  { id: "ch0", label: "0. 事前準備" },
  { id: "ch1", label: "1. AWSとGoogle Cloud" },
  { id: "ch2", label: "2. Dockerとコンテナ起動" },
  { id: "ch3", label: "3. Cloud Runとは" },
  { id: "ch4", label: "4. デプロイ" },
  { id: "ch5", label: "5. 更新とロールバック" },
  { id: "ch6", label: "6. カナリアリリース" },
  { id: "ch7", label: "7. オートスケール" },
  { id: "ch8", label: "8. ログとメトリクス" },
  { id: "ch9", label: "9. ソースデプロイ" },
  { id: "ch10", label: "10. 発展編" },
  { id: "done", label: "🎉 完了" },
] as const;

type ChapterId = (typeof CHAPTERS)[number]["id"];

interface Participant {
  id: string;
  name: string;
  chapter: ChapterId | null;
  needsHelp: boolean;
  online: boolean;
}

interface ChatMessage {
  id: string;
  name: string;
  text: string;
  at: string;
  system: boolean;
}

// 状態はすべてインメモリ。--max-instances 1 でのデプロイが前提で、
// インスタンスが再起動すると消える(1日のイベント運用なら許容範囲)
const participants = new Map<string, Participant>();
const messages: ChatMessage[] = [];
const sockets = new Map<WSContext, string>(); // WebSocket -> participant id
const MAX_MESSAGES = 300;

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const indexHtml = readFileSync(new URL("../public/index.html", import.meta.url), "utf-8").replace(
  "__GITBOOK_URL__",
  GITBOOK_URL,
);

app.get("/", (c) => c.html(indexHtml));

// 同梱 GitBook を /book/ 配下で配信する
app.use(
  "/book/*",
  serveStatic({
    root: BOOK_DIR,
    rewriteRequestPath: (path) => path.replace(/^\/book/, ""),
  }),
);

const pushMessage = (name: string, text: string, system = false) => {
  messages.push({
    id: crypto.randomUUID(),
    name,
    text,
    at: new Date().toISOString(),
    system,
  });
  if (messages.length > MAX_MESSAGES) messages.splice(0, messages.length - MAX_MESSAGES);
};

const broadcast = () => {
  const data = JSON.stringify({
    type: "state",
    chapters: CHAPTERS,
    participants: [...participants.values()],
    messages,
  });
  for (const ws of sockets.keys()) ws.send(data);
};

const chapterLabel = (id: ChapterId | null) =>
  CHAPTERS.find((c) => c.id === id)?.label ?? "(未設定)";

// クライアントから届くメッセージのハンドリング
const handle = (ws: WSContext, msg: Record<string, unknown>) => {
  const senderId = sockets.get(ws);

  if (msg.type === "join") {
    const name = String(msg.name ?? "").trim().slice(0, 20) || "名無し";
    // localStorage に保存された id での再接続なら同一参加者として扱う
    const id = typeof msg.id === "string" && participants.has(msg.id) ? msg.id : crypto.randomUUID();
    const existing = participants.get(id);
    if (existing) {
      existing.name = name;
      existing.online = true;
    } else {
      participants.set(id, { id, name, chapter: null, needsHelp: false, online: true });
      pushMessage("system", `${name} さんが参加しました`, true);
    }
    sockets.set(ws, id);
    ws.send(JSON.stringify({ type: "joined", id }));
    broadcast();
    return;
  }

  const participant = senderId ? participants.get(senderId) : undefined;
  if (!participant) return; // join 前のメッセージは無視

  switch (msg.type) {
    case "progress": {
      const chapter = CHAPTERS.find((c) => c.id === msg.chapter)?.id ?? null;
      participant.chapter = chapter;
      if (chapter === "done") {
        pushMessage("system", `🎉 ${participant.name} さんがハンズオンを完走しました!`, true);
      }
      break;
    }
    case "help": {
      participant.needsHelp = Boolean(msg.on);
      if (participant.needsHelp) {
        pushMessage(
          "system",
          `🙋 ${participant.name} さんが助けを求めています(${chapterLabel(participant.chapter)})`,
          true,
        );
      }
      break;
    }
    case "resolveHelp": {
      // 講師・メンターに限らず誰でも解決にできる(コミュニティイベント運用)
      const target = typeof msg.targetId === "string" ? participants.get(msg.targetId) : undefined;
      if (target) target.needsHelp = false;
      break;
    }
    case "chat": {
      const text = String(msg.text ?? "").trim().slice(0, 500);
      if (text) pushMessage(participant.name, text);
      break;
    }
    default:
      return;
  }
  broadcast();
};

app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onMessage(evt, ws) {
      try {
        handle(ws, JSON.parse(String(evt.data)));
      } catch {
        // 不正なJSONは無視
      }
    },
    onClose(_evt, ws) {
      const id = sockets.get(ws);
      sockets.delete(ws);
      if (!id) return;
      // 同じ参加者の別タブ接続が残っていなければオフライン扱いにする
      const stillConnected = [...sockets.values()].includes(id);
      const participant = participants.get(id);
      if (participant && !stillConnected) {
        participant.online = false;
        broadcast();
      }
    },
  })),
);

const server = serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(JSON.stringify({ severity: "INFO", message: `listening on port ${PORT}` }));
});
injectWebSocket(server);
