# Fact-check: 02_docker/README.md

**確認日**: 2026-08-19

**対象タスク**: 02章の全技術的主張の一次情報照合

**検証方法**: `research/deep-research-report.md`(二次情報)の指摘は根拠として採用せず、出典URLを自分で取得して一次情報の本文で裏を取った。`cloud.google.com` は `docs.cloud.google.com` へ301リダイレクトするため、リダイレクト後のURLで取得している。パッケージのバージョン実在と依存関係は npm レジストリ(registry.npmjs.org)のメタデータで確認した。**さらに、本文の4ファイル(`package.json` / `src/index.ts` / `Dockerfile` / `.dockerignore`)を Markdown から機械的に抽出してローカルの Docker(29.4.0)で実際にビルド・起動し、全エンドポイントの応答を実測した。**

## ローカル実測の結果(本文どおりの4ファイルを再現)

- `docker build` 成功。`node -v` は `v24.19.0`(= Node.js 24 系。type stripping は v24.12.0 で stable)
- 起動ログ: `{"severity":"INFO","message":"listening on port 8080"}`(1行JSON、`severity` 付き)
- `GET /`: `Hello, Cloud Run!` / 背景 `#4285F4`(青) / Service・Revision がともに `local`
- `GET /api`: `{"message":"Hello, Cloud Run!","revision":"local","instance":"59755162"}`
- `GET /heavy`: 応答まで 1025 ms(本文の「1秒かかる重い処理のふり」と一致)
- `POST /pubsub`(`{"message":{"data":"SGVsbG8gUHViU3Vi"}}`): HTTP 204、ログに `Pub/Sub message received: Hello PubSub`(base64 デコード成功)
- `docker run --rm -it ... bash` 相当が成功し、`/app` に `src` と `node_modules` が存在

## 判定表

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | おさらい | Dockerfile はイメージの設計図(テキストファイル) | 正しい | (ローカル実測) | 変更なし。本文の Dockerfile からイメージがビルドできることを実測した |
| 2 | おさらい | イメージはアプリ+依存関係+OSライブラリを固めたスナップショット | 正しい | (ローカル実測) | 変更なし。`node_modules` を含むイメージが生成され、`/app` に焼き込まれていることを実測した |
| 3 | おさらい | コンテナはイメージを実行したプロセス | 正しい | (ローカル実測) | 変更なし |
| 4 | おさらい | イメージは不変(immutable) | 正しい | (ローカル実測) | 変更なし。タグ `handson-verify:v1` を複数回 run しても同じ内容が起動する |
| 5 | ハンズオン導入 | Hono は Web 標準 API ベースの軽量な Web フレームワーク | 正しい | https://hono.dev/docs/ | 変更なし。原文「a small, simple, and ultrafast web framework built on Web Standards」 |
| 6 | ハンズオン導入 | Hono 自体は Cloudflare Workers や Deno などマルチランタイム対応 | 正しい | https://hono.dev/docs/ | 変更なし。公式が Cloudflare Workers / Fastly Compute / Deno / Bun / Vercel / Netlify / AWS Lambda / Lambda@Edge / Node.js を対応ランタイムとして列挙。deep-research-report が指摘した「掲載コードがそのまま各ランタイムで動く」という言い過ぎは既に「今回は Node.js アダプタと Node.js API を使います」に修正済みで、`@hono/node-server` / `node:crypto` / `Buffer` / `process.env` を使う実装と整合している |
| 7 | ハンズオン導入 | Node.js 24 の組み込み type stripping で TypeScript をビルドステップなしで動かせる | 正しい | https://nodejs.org/api/typescript.html | 変更なし。原文「By default Node.js will execute TypeScript files that contains only erasable TypeScript syntax」、履歴に「v25.2.0, v24.12.0 Type stripping is now stable」。実測でも `node src/index.ts` が `v24.19.0` で起動した |
| 8 | ハンズオン導入(注記) | type stripping は型チェックを行わない(`tsc` の代替ではない) | 正しい | https://nodejs.org/api/typescript.html | 表現を補強。原文「Node.js will replace TypeScript syntax with whitespace, and no type checking is performed」。「型注釈を空白に置き換えるだけで」を明記した |
| 9 | ハンズオン導入(注記) | enum など一部の構文にも制約がある | 要修正 | https://nodejs.org/api/typescript.html | 「制約がある」は過小。公式は変換が必要な構文(enum、runtime コードを含む namespace、parameter properties、import aliases)を**サポートしない**と明示し、decorator はパーサエラーになる。「enum や parameter properties のように『変換が必要な構文』は使えません」へ修正した |
| 10 | ハンズオン導入(注記) | この教材のコードはすべて type stripping の対応範囲内 | 正しい | (ローカル実測) | 変更なし。`src/index.ts` を `node src/index.ts` で実行してエラーなく起動することを実測した(型注釈と `Record<string, unknown>` のみで、消去不能な構文を含まない) |
| 11 | ハンズオン導入(注記) | `tsconfig.json` は読まれない | 正しい | https://nodejs.org/api/typescript.html | #9 の修正時に新規追記。原文「Node.js ignores `tsconfig.json` files and therefore features that depend on settings within `tsconfig.json`, such as paths or converting newer JavaScript syntax to older standards, are intentionally unsupported」 |
| 12 | 1. ファイル作成 | 作業ディレクトリは `mkdir -p ~/cloudrun-handson/app/src` で作る | 正しい | (リポジトリ内整合) | 変更なし。0章の復旧ブロックおよび4章以降の「詰まったら」が参照する `~/cloudrun-handson/app` と一致している |
| 13 | 1. ファイル作成 | このリポジトリの `code/app/` にも同じものがある | 正しい | (リポジトリ内実測) | 変更なし。`code/app/{package.json,src/index.ts,Dockerfile,.dockerignore}` が存在し、`package.json` と `src/index.ts` は本文のコードブロックと**バイト一致**、`Dockerfile` は空行とコメントを除いて一致していることを `diff` で確認した。ただしリンク先 `https://github.com/y-ohgi/handson-CloudRun/tree/main/code/app` は現時点で匿名アクセス404(リポジトリが非公開)なので、**公開前は参加者から見えない**点に注意(本文は変更していない) |
| 14 | `package.json` | 依存は Hono 本体と Node.js アダプタの2つだけ | 正しい | (ローカル実測) | 変更なし。`dependencies` は `hono` と `@hono/node-server` の2件のみで、`npm install` が成功した |
| 15 | `package.json` | `hono` の `4.13.2` が実在する | 正しい | https://registry.npmjs.org/hono | 変更なし。`4.13.2` は 2026-08-13 公開で実在(確認時点の latest は `4.13.3`)。ピン留めは意図的な固定として妥当 |
| 16 | `package.json` | `@hono/node-server` の `1.19.17` が実在し `hono@4` と組み合わせられる | 正しい | https://registry.npmjs.org/@hono%2Fnode-server/1.19.17 | 変更なし。`1.19.17` は 2026-07-27 公開で実在。`peerDependencies` は `{"hono":"^4"}` なので `4.13.2` を満たす(確認時点の latest は `2.1.1` だが 1.19.x は並行メンテナンス系列)。`engines` は `{"node":">=18.14.1"}` で Node 24 と矛盾しない |
| 17 | `package.json` | `engines.node` は `"24.x"` と指定する | 正しい | https://docs.cloud.google.com/docs/buildpacks/nodejs | 変更なし。Buildpacks は semver constraint を受け付ける一方、原文で「Avoid using greater than (>) specifiers in the `engines.node` field」と明示している。`"24.x"` は `>` を使わない指定であり推奨に沿う(deep-research-report が指摘した `>=24` は既に修正済み) |
| 18 | `package.json` | `scripts.start` を `node src/index.ts` にする | 正しい | https://docs.cloud.google.com/docs/buildpacks/nodejs | 変更なし。原文「The Node.js buildpack executes the command you specify in the `scripts.start` field of your `package.json` file」。9章の Buildpacks デプロイでこの start が使われる |
| 19 | `src/index.ts` | `crypto.randomUUID()` でインスタンスごとの一意IDを作れる | 正しい | (ローカル実測) | 変更なし。起動ごとに異なる8桁が生成され、`/api` の `instance` に反映されることを実測した |
| 20 | `src/index.ts` | stdout に1行JSONを吐くと Cloud Logging が構造化ログとして解釈する | 正しい | https://docs.cloud.google.com/run/docs/logging | 変更なし。原文「You can send a simple text string or send a single line of serialized JSON, also called 'structured' data」「This is picked up and parsed by Cloud Logging and is placed into `jsonPayload`」 |
| 21 | `src/index.ts` | `severity` フィールドがログの重大度になる | 正しい | https://docs.cloud.google.com/run/docs/logging | 変更なし。原文「If your JSON includes a `severity` property, it is removed from the `jsonPayload` and appears instead as the log entry's `severity`」 |
| 22 | `src/index.ts` | `K_SERVICE` / `K_REVISION` は Cloud Run が自動で注入する | 正しい | https://docs.cloud.google.com/run/docs/container-contract | 変更なし。原文「K_SERVICE: The name of the Cloud Run service being run」「K_REVISION: The name of the Cloud Run revision being run」 |
| 23 | `src/index.ts` | ローカル実行では Service / Revision が `local` になる | 正しい | (ローカル実測) | 変更なし。`GET /` と `GET /api` の両方で `local` が返ることを実測した |
| 24 | `src/index.ts` | `/heavy` は1秒かかる | 正しい | (ローカル実測) | 変更なし。実測 1025 ms |
| 25 | `src/index.ts` | Pub/Sub push のペイロードは `message.data` に base64 で入る | 正しい | https://docs.cloud.google.com/pubsub/docs/push | 変更なし。原文「The message data is in the `message.data` field and is base64-encoded」。実測でも `SGVsbG8gUHViU3Vi` → `Hello PubSub` にデコードされ 204 を返した |
| 26 | `src/index.ts` | Cloud Run は環境変数 `PORT` でリッスンすべきポートを渡す | 正しい | https://docs.cloud.google.com/run/docs/container-contract | 変更なし。原文「The port your HTTP server should listen on. 8080」(既定値8080)。あわせて `0.0.0.0` で listen すべき旨も規定されており、`@hono/node-server` の既定挙動で満たされる(実測でポートマッピング経由の疎通を確認) |
| 27 | `Dockerfile` | ベースイメージ `node:24-slim` が実在する | 正しい | https://hub.docker.com/v2/repositories/library/node/tags/24-slim | 変更なし。タグ `24-slim` は 2026-08-05 更新で実在し、実際に pull・ビルドできた |
| 28 | `Dockerfile` | `ENV PORT=8080`(Cloud Run の既定は8080) | 正しい | https://docs.cloud.google.com/run/docs/container-contract | 変更なし。#26 と同じ根拠 |
| 29 | `Dockerfile` | `CMD ["node", "src/index.ts"]` で TypeScript を直接実行できる | 正しい | (ローカル実測) | 変更なし。`v24.19.0` のイメージ内でビルドステップなしに起動した |
| 30 | `.dockerignore` | `node_modules` を除外してイメージへの混入を防ぐ | 正しい | (ローカル実測) | 変更なし。`.dockerignore` を置いた状態でビルドが成功し、イメージ内の `node_modules` はイメージ内 `npm install` の生成物のみになる |
| 31 | Dockerfile の解説 | `package.json` を先に COPY すると `npm install` のレイヤーキャッシュが効く | 正しい | (ローカル実測) | 変更なし。`COPY package.json` → `RUN npm install` → `COPY . ./` の順で、コードのみ変更した再ビルドで `npm install` レイヤーがキャッシュされることを確認した |
| 32 | Dockerfile の解説 | Cloud Run 固有の約束は「環境変数 `PORT` で渡されたポートを listen すること」 | 正しい | https://docs.cloud.google.com/run/docs/container-contract | 変更なし。#26 と同じ根拠 |
| 33 | 2. ビルド | 手元に Node.js がなくても `docker build` できる | 正しい | (ローカル実測) | 変更なし。ホストで `npm install` を実行せずにビルドが完走した |
| 34 | 4. ブラウザで見る | Cloud Shell の[ウェブでプレビュー]から特定ポートをプレビューできる | 正しい | https://docs.cloud.google.com/shell/docs/using-web-preview?hl=ja | 変更なし。原文「[ウェブでプレビュー] ボタン をクリックし、表示されたメニューからポート番号を選びます」。既定ポートは8080 |
| 35 | 4. ブラウザで見る | プレビューのアイコンは「目のマーク」 | 要修正 | https://docs.cloud.google.com/static/shell/docs/images/web_preview.svg | 公式アイコン(`24/ic_webpreview`)はウィンドウ枠の中に目(レンズ+瞳)が描かれた図形で、「目のマーク」だけでは特定しづらい。ラベル表記も日本語ドキュメントに合わせ、`[ウェブでプレビュー]ボタン(ウィンドウの中に目が描かれたアイコン)→[ポート 8080 でプレビュー]` へ修正した |
| 36 | 4. ブラウザで見る | 青い画面に「Hello, Cloud Run!」、Revision と Service が `local` | 正しい | (ローカル実測) | 変更なし。`#4285F4` と `Hello, Cloud Run!`、`local` を実測した |
| 37 | 5. コンテナの中に入る | `docker run --rm -it handson-app:v1 bash` でシェルに入れる | 正しい | (ローカル実測) | 変更なし。`node:24-slim`(Debian 系)に `bash` があり、同等コマンドが成功した |
| 38 | 5. コンテナの中に入る | `/app` に自分のコードと `node_modules` がある | 正しい | (ローカル実測) | 変更なし。`ls /app` に `src` `node_modules` `package.json` `Dockerfile` `package-lock.json` を確認した |
| 39 | 5. コンテナの中に入る | `node -v` でイメージに焼き込まれた Node.js 24 が見える | 正しい | (ローカル実測) | 変更なし。`v24.19.0` |
| 40 | 冒頭の補足リンク | `introduction-docker` リポジトリが存在する | 正しい | https://api.github.com/repos/y-ohgi/introduction-docker | 変更なし。HTTP 200 |

## 確認したが本文に追加していない(参考)

- Buildpacks の公式ドキュメントは「Whenever possible, use `package-lock.json` to improve cache performance」と lockfile を推奨している(https://docs.cloud.google.com/docs/buildpacks/nodejs)。本文は依存を完全固定バージョンで書いており当日の依存解決差分はほぼ生じないため、lockfile の配布は本文修正ではなく提案事項として残す
- `@hono/node-server` の最新系列は `2.x`(確認時点 2.1.1)。教材の `1.19.17` は動作を実測済みなので変更していないが、将来の更新時は 2.x への追随を検討する余地がある
- 本文中の `code/app/` へのリンクはリポジトリが非公開のため現時点で404(#13)。公開設定は教材内容の問題ではないため本文は変更していない

## 集計

- 正しい: 38件
- 要修正: 2件(#9, #35)
- 未確認: 0件

## 本文への変更

1. type stripping の注記を、公式の記述に合わせて「型注釈を空白に置き換えるだけ / `tsconfig.json` は読まれない / enum・parameter properties のような変換が必要な構文は使えない」に修正(#8, #9, #11)
2. Cloud Shell のプレビュー手順を、日本語ドキュメントのラベルと実際のアイコン図形に合わせて `[ウェブでプレビュー]ボタン(ウィンドウの中に目が描かれたアイコン)→[ポート 8080 でプレビュー]` に修正(#35)
