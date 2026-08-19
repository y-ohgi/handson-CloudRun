# 2. Dockerのおさらいとコンテナ起動

この章では Docker の要点をおさらいしたあと、実際に Web サーバーのコンテナイメージを**作って・動かして・ブラウザで見る**ところまでやります。ここで作ったイメージを、次章以降で Cloud Run にデプロイしていきます。

> Docker をしっかり学びたい人は [introduction-docker](https://github.com/y-ohgi/introduction-docker) にまとまっています。今日は Cloud Run に必要な分だけ、駆け足で。

## おさらい: 3つの登場人物

| 用語 | 一言でいうと | AWSでの馴染み |
|---|---|---|
| **Dockerfile** | イメージの設計図(テキストファイル) | CodeBuild でビルドしていたアレ |
| **イメージ** | アプリ+依存関係+OSライブラリを固めたスナップショット | ECR に push していたアレ |
| **コンテナ** | イメージを実行したプロセス | ECS タスクの中で動いていたアレ |

ポイントは1つだけです: **イメージは不変(immutable)**。「環境ごと固めて配る」からこそ、ローカルでも Cloud Run でも ECS でも同じように動きます。この不変性が、後でやるロールバックやカナリアリリースの土台になります。

## ハンズオン: Webサーバーのイメージを作る

アプリは TypeScript + [Hono](https://hono.dev/) で書きます。Hono は Web 標準 API ベースの軽量な Web フレームワークです(Hono 自体は Cloudflare Workers や Deno などマルチランタイム対応ですが、今回は Node.js アダプタと Node.js API を使います)。実行には Node.js 24 の組み込み type stripping ——型注釈を剥がして実行する機能——を使い、この教材で使う範囲の TypeScript を**ビルドステップなし**で動かします。ビルドを1段消すことで、今日の主役である Cloud Run に集中するためです。

> type stripping は型注釈を空白に置き換えるだけで、型チェックは行いません(`tsc` の代替ではありません)。`tsconfig.json` も読まれないため、enum や parameter properties のように「変換が必要な構文」は使えません。この教材のコードはすべて対応範囲内です。

> TypeScript に詳しくなくても大丈夫です。書き換えるのは定数2行だけで、あとはコピー&ペーストで進められます。

### 1. 作業ディレクトリとファイルの作成

Cloud Shell エディタのターミナルで作業ディレクトリを作ります。

```bash
mkdir -p ~/cloudrun-handson/app/src
cd ~/cloudrun-handson/app
```

エディタで以下の4ファイルを作成してください(コピー&ペーストでOK)。このリポジトリの [`code/app/`](https://github.com/y-ohgi/handson-CloudRun/tree/main/code/app) にも同じものがあります。

`package.json` — 依存関係は Hono 本体と Node.js アダプタの2つだけです。

```json
{
  "name": "handson-app",
  "private": true,
  "type": "module",
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "start": "node src/index.ts"
  },
  "dependencies": {
    "@hono/node-server": "1.19.17",
    "hono": "4.13.2"
  }
}
```

`src/index.ts` — 小さなWebサーバーです。アクセスすると「メッセージ・リビジョン名・インスタンスID」を表示します。

```typescript
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
```

`Dockerfile`

```dockerfile
FROM node:24-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./

# Cloud Run は環境変数 PORT でリッスンすべきポートを渡してくる(デフォルト 8080)
ENV PORT=8080

# Node.js 24 の組み込み type stripping で TypeScript を直接実行する
# (型注釈を剥がすだけで、型チェックは行われない)
CMD ["node", "src/index.ts"]
```

`.dockerignore` — ローカルで `npm install` した場合に `node_modules` をイメージに混入させないためのファイルです。

```
node_modules
```

> **Dockerfile を上から読んでみましょう。** ベースイメージ(`FROM`)に依存関係を重ね(`RUN npm install`)、コードを載せ(`COPY`)、起動コマンドを決める(`CMD`)。この積み重ねがそのままイメージのレイヤーになります。`package.json` だけ先に COPY しているのは、コードを変更しても `npm install` のレイヤーキャッシュが効くようにするテクニックです(この後の章で効いてきます)。
>
> 1点だけ Cloud Run 固有の約束があります: **環境変数 `PORT` で渡されたポートを listen すること**。ECS でいうタスク定義のポートマッピングにあたる取り決めが、この環境変数1つに集約されています。

### 2. イメージをビルドする

```bash
docker build -t handson-app:v1 .
```

手元に Node.js がなくても(`npm install` を一度も打っていなくても)ビルドできることに注目してください。**依存解決も実行環境もすべてイメージの中で完結**しています。`docker images` で `handson-app` ができていることを確認します。

### 3. コンテナを起動する

```bash
docker run --rm -p 8080:8080 handson-app:v1
```

### 4. ブラウザで見る

Cloud Shell の右上にある[ウェブでプレビュー]ボタン(ウィンドウの中に目が描かれたアイコン)→[ポート 8080 でプレビュー]をクリックします。

**青い画面に「Hello, Cloud Run!」と表示されれば成功です。** Revision と Service が `local` になっていることも見ておいてください——Cloud Run にデプロイすると、ここが自動で埋まります。

確認できたらターミナルで `Ctrl+C` を押してコンテナを止めます。

### 5. (余裕があれば)コンテナの中に入ってみる

```bash
docker run --rm -it handson-app:v1 bash
ls        # 自分の書いたコードと node_modules が /app に入っている
node -v   # イメージに焼き込まれた Node.js 24
exit
```

## まとめ

- Dockerfile → イメージ → コンテナ、の流れを一周した
- イメージは不変。だから「どこでも同じに動く」し「前のバージョンに戻せる」
- Cloud Run との約束は「環境変数 `PORT` を listen する」だけ

今、あなたの手元(Cloud Shell)には動くイメージがあります。次章で Cloud Run の仕組みを知り、4章でこれをそのままクラウドに載せます。
