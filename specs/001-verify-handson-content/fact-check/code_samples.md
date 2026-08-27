# Fact-check: code/app, code/websocket

**確認日**: 2026-08-19

再現性(Node.js バージョン指定、依存の固定、Dockerfile、type stripping 適合)の検証結果です。**結論として `code/` への変更は不要でした**。本表の作成時点ではドキュメント突き合わせと静的確認のみで、`npm install` / `docker build` / `gcloud` は実行していません。

**2026-08-19 追記(T026)**: その後の実機検証で `docker build` / `docker run` / Cloud Run へのデプロイまで実施された(`live-websocket.md`、`live-source-deploy.md`、`live-jobs.md`、`live-main-path.md`)。これにより #13 / #14 の未確認が解消し、本フラグメントの `未確認` は0件になった。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | code/app/package.json:5-7 | `engines.node` が `"24.x"` で、固定的なメジャーバージョン範囲になっている | 正しい | https://docs.cloud.google.com/docs/buildpacks/nodejs | 変更なし。buildpack は "Avoid using greater than (>) specifiers in the `engines.node` field." と明示しており、`>=24` のような指定は非推奨。`24.x` はこれを満たす |
| 2 | code/websocket/package.json:5-7 | `engines.node` が `"24.x"` | 正しい | https://docs.cloud.google.com/docs/buildpacks/nodejs | 変更なし。app と同一指定で一貫している |
| 3 | code/app/package.json:11-14 | 直接依存が正確なバージョンに固定されている(`@hono/node-server` `1.19.17`、`hono` `4.13.2`) | 正しい | 静的確認(`^` / `~` / `*` / `x` のいずれも不使用) | 変更なし。イベント当日に直接依存の解決結果が変わる余地はない |
| 4 | code/websocket/package.json:11-15 | 直接依存が正確なバージョンに固定されている(`@hono/node-server` `1.19.17`、`@hono/node-ws` `1.3.1`、`hono` `4.13.2`) | 正しい | 静的確認 | 変更なし |
| 5 | code/websocket/package.json:13 | 推移的依存が固定されていない: `@hono/node-ws@1.3.1` は `ws: "^8.17.0"` を依存に持つ | 要修正(未実施) | https://registry.npmjs.org/@hono/node-ws/1.3.1 | `.gitignore` が `package-lock.json` を無視しているため lockfile を追加せず、指示どおり報告のみとした。詳細は下記「lockfile についての判断」 |
| 6 | code/app/package.json:12-13 | `hono@4.13.2` と `@hono/node-server@1.19.17` は runtime dependencies を持たない | 正しい | https://registry.npmjs.org/hono/4.13.2 / https://registry.npmjs.org/@hono/node-server/1.19.17 | 変更なし。`code/app/` は推移的依存がゼロなので、lockfile なしでも依存グラフは完全に決定的 |
| 7 | code/app/Dockerfile:5-6 | `COPY package.json ./` + `RUN npm install` が lockfile の不在と整合している | 正しい | 静的確認(`code/app/` に `package-lock.json` は存在しない) | 変更なし。`npm ci` は lockfile を必須とするため、この構成では `npm install` が正しい選択 |
| 8 | code/websocket/Dockerfile:5-6 | 同上 | 正しい | 静的確認 | 変更なし |
| 9 | code/app/Dockerfile:1 | ベースイメージ `node:24-slim` が `engines.node: "24.x"` と整合している | 正しい | 静的確認 | 変更なし。websocket/Dockerfile:1 も同一 |
| 10 | code/app/Dockerfile:13-15 | 「Node.js 24 の組み込み type stripping で TypeScript を直接実行する(型注釈を剥がすだけで、型チェックは行われない)」 | 正しい | https://nodejs.org/api/typescript.html | 変更なし。type stripping は v23.6.0 / v22.18.0 からデフォルト有効。"Node.js will replace TypeScript syntax with whitespace, and no type checking is performed" とドキュメントの記述が一致 |
| 11 | code/app/src/index.ts 全体 | 消去可能な構文のみで構成されている(enum / 値を持つ namespace / parameter properties / decorator / import alias のいずれも不使用) | 正しい | https://nodejs.org/api/typescript.html + 実測 | 変更なし。使われている型構文は型注釈(`severity: string`、`const data: string`)と `Record<string, unknown>` のみ。`node --check code/app/src/index.ts` が終了コード0で通過 |
| 12 | code/websocket/src/index.ts:4 | `import type { WSContext } from "hono/ws"` が type-only import として正しく書かれている | 正しい | https://nodejs.org/api/typescript.html | 変更なし。"the `type` keyword is necessary to correctly strip type imports. Without the `type` keyword, Node.js will treat the import as a value import, which will result in a runtime error" を満たしている |
| 13 | code/websocket/src/index.ts:13 | `new Set<WSContext>()` のような呼び出し式の型引数が type stripping で扱える | 正しい(実機確認) | https://nodejs.org/api/typescript.html , `live-websocket.md` #1 / #11 / #12 / #14 | **2026-08-19 T026 で確定**: `node --check`(構文チェック)だけでなく、`code/websocket` を `node:24-slim` ベースの Dockerfile でビルドし、`CMD ["node", "src/index.ts"]` で**実際に起動して通信させた**。ローカル `docker run` で `GET /` が 200・`/ws` が `HTTP/1.1 101 Switching Protocols`(#14)、Cloud Run 上でも 2クライアント間のブロードキャストが成立(#11、#12)。`clients` は `new Set<WSContext>()` で初期化される変数(`code/websocket/src/index.ts:13`)であり、これが実行時に機能していることは type stripping が当該構文を正しく除去している直接の証拠。変更なし |
| 14 | 実測の前提 | `node --check` による構文確認 | 正しい(実機確認) | `live-websocket.md` #1 / #14 , `live-source-deploy.md` #9 | **2026-08-19 T026 で確定**: 静的確認の段階では手元の Node.js が v26.4.0 で v24 系の確認が未実施だったが、その後の実機検証で v24 実行が裏取りされた。(a) `code/websocket`: `node:24-slim` イメージでビルド・起動し 200 / 101 を返した(`live-websocket.md` #1、#14)。(b) `code/app`: Buildpacks 経由のビルドログに `Installing Node.js v24.19.0.` が出て、`.ts` を直接実行するイメージが HTTP 200 を返した(`live-source-deploy.md` #9)。**教材が対象とする Node.js 24 系で type stripping が動くことを実機で確認済み**。変更なし |
| 15 | code/app/package.json:8-10 | `scripts.start` が `node src/index.ts` で、buildpack(9章のソースデプロイ)から起動される | 正しい | https://docs.cloud.google.com/docs/buildpacks/nodejs | 変更なし。"The Node.js buildpack executes the command you specify in the `scripts.start` field of your `package.json` file" |
| 16 | code/app/package.json:5-7(9章との整合) | `engines.node` 指定があるため buildpack が Node 24 を選ぶ | 正しい | https://docs.cloud.google.com/docs/buildpacks/nodejs | 変更なし。未指定の場合は "the buildpack uses the most recent LTS version of Node.js" となり type stripping の挙動が変わり得るが、`24.x` 指定により回避されている |
| 17 | code/app/.dockerignore, code/websocket/.dockerignore | `node_modules` のみを除外している | 正しい | 静的確認 | 変更なし。Dockerfile は `COPY package.json ./` → `npm install` → `COPY . ./` の順なので、ローカルの `node_modules` が混入しない |
| 18 | code/app/src/index.ts:2 の型付け | `type: "module"` と `import` 構文が整合している | 正しい | 静的確認 | 変更なし。両 package.json に `"type": "module"` があり ESM として解決される |

## lockfile(`package-lock.json`)についての判断

- リポジトリルートの `.gitignore` が `package-lock.json` を無視しているため、lockfile の追加は `.gitignore` の変更を伴う設計判断になる。指示どおり `.gitignore` は変更していない。
- `code/app/` は直接依存2つがいずれも runtime dependencies を持たない(#6)。したがって lockfile なしでも依存グラフは完全に決定的で、再現性は確保されている。
- `code/websocket/` は `@hono/node-ws@1.3.1` が `ws: "^8.17.0"` を要求するため(#5)、`ws` の解決結果はイベント当日の npm レジストリの最新 8.x に依存する。**唯一の未固定要素はこの `ws` である。**
- 影響は小さいと判断した。`ws` の 8.x 系はセマンティックバージョニング上 breaking change を含まず、`@hono/node-ws` 経由でしか使われていない(教材コードは `ws` を直接 import していない)。
- **2026-08-19 実機で裏取り済み(T026)**: `live-websocket.md` #17 のとおり、実ビルドでは `ws` が **8.21.3** に解決され(`^8.17.0` の範囲内で最新へ)、ビルド・デプロイ・WebSocket 通信のいずれも問題なく動作した。`npm install` は `added 4 packages, and audited 5 packages` / `found 0 vulnerabilities`(#1)。**未固定であること自体は実測でも確認されたが、当日の失敗要因にはならなかった**。#5 の「要修正(未実施)」判定は据え置き(lockfile 同梱は `.gitignore` の変更を伴う設計判断であり本機能のスコープ外)。
- lockfile を同梱する場合の影響: (a) `.gitignore` から `package-lock.json` を除外する行の追加が必要、(b) `code/app/` と `code/websocket/` の2箇所で `npm install` を実行して lockfile を生成・commit する必要がある、(c) Dockerfile を `COPY package.json package-lock.json ./` + `npm ci` に変更する必要がある、(d) 変更後は 02章・10-2章の Dockerfile 掲載内容と同期が必要になる(本文は担当外)。
