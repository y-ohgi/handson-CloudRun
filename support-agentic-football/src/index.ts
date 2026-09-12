import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import type { WSContext } from "hono/ws";

const PORT = Number(process.env.PORT ?? 8080);

// ワークショップ本体のページ。X-Frame-Options: DENY で iframe 埋め込みができないため、
// 別タブで開くリンクとして使う
const WORKSHOP_URL =
  process.env.WORKSHOP_URL ?? "https://catalog.workshops.aws/agentic-football/ja-JP";

// 進捗報告の選択肢。ワークショップのサイドナビゲーションの構成に合わせたもの。
// phase: null の項目はどのフェーズにも属さない単独ステップ
const CHAPTERS = [
  { id: "intro", label: "エージェンティックフットボールの遊び方", phase: null },

  { id: "p1-sample", label: "サンプルエージェントを取得する", phase: "フェーズ1: チームを構築する" },
  { id: "p1-setup", label: "セットアップとテスト", phase: "フェーズ1: チームを構築する" },
  { id: "p1-deploy", label: "AWSにデプロイする", phase: "フェーズ1: チームを構築する" },

  { id: "p2-play", label: "試合をプレーする", phase: "フェーズ2: 試合をプレーする" },

  { id: "p3-memory", label: "AgentCoreメモリ", phase: "フェーズ3: エージェントをスーパーチャージする" },
  { id: "p3-gateway", label: "AgentCore Gateway", phase: "フェーズ3: エージェントをスーパーチャージする" },
  { id: "p3-observability", label: "AgentCoreオブザーバビリティ", phase: "フェーズ3: エージェントをスーパーチャージする" },
  { id: "p3-prompt", label: "システムプロンプトエンジニアリング", phase: "フェーズ3: エージェントをスーパーチャージする" },
  { id: "p3-multi-agent", label: "マルチエージェント連携", phase: "フェーズ3: エージェントをスーパーチャージする" },

  { id: "next-steps", label: "次のステップ: フットボールから本番環境へ", phase: null },
  { id: "cleanup", label: "クリーンアップ", phase: null },
  { id: "done", label: "🎉 完了", phase: null },
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
  "__WORKSHOP_URL__",
  WORKSHOP_URL,
);

app.get("/", (c) => c.html(indexHtml));

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
