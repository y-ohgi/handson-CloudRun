// SUMMARY.md の章立て順に Markdown を結合し、1冊の PDF として出力する。
// honkit pdf は Calibre(ebook-convert)必須のため、Chromium 経由で生成する。
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.env.BOOK_ROOT || process.cwd();
const OUT = process.env.PDF_OUT || path.join(ROOT, "handson-cloudrun.pdf");
const GITHUB_BASE = "https://github.com/y-ohgi/handson-CloudRun/blob/main/";

// kramed / highlight.js は honkit の依存として node_modules に入っている
const kramed = require(path.join(ROOT, "node_modules/kramed"));
const hljs = require(path.join(ROOT, "node_modules/highlight.js"));

// Playwright はローカル・グローバルどちらにあってもよい
const loadChromium = () => {
  const candidates = [
    "playwright",
    "playwright-core",
    path.join(ROOT, "node_modules/playwright"),
    "/opt/node22/lib/node_modules/playwright",
  ];
  for (const id of candidates) {
    try {
      return require(id).chromium;
    } catch {
      // 次の候補を試す
    }
  }
  throw new Error(
    "Playwright が見つかりません。`npm i -D playwright && npx playwright install chromium` を実行してください。",
  );
};

// ---- SUMMARY.md をパースして章の並びを得る ----
const summary = fs.readFileSync(path.join(ROOT, "SUMMARY.md"), "utf-8");
const items = [];
for (const line of summary.split("\n")) {
  const part = line.match(/^##\s+(.+?)\s*$/);
  if (part) {
    items.push({ type: "part", title: part[1] });
    continue;
  }
  const entry = line.match(/^(\s*)\*\s*\[(.+?)\]\((.+?)\)/);
  if (entry) {
    items.push({
      type: "chapter",
      level: Math.floor(entry[1].length / 4),
      title: entry[2],
      href: entry[3].replace(/#.*$/, ""),
    });
  }
}

// ---- パス -> アンカー の対応表(章間リンクを PDF 内リンクに変換するため)----
const anchorOf = new Map();
items
  .filter((i) => i.type === "chapter")
  .forEach((item, index) => {
    item.anchor = `ch${index}`;
    anchorOf.set(path.posix.normalize(item.href), item.anchor);
  });

// ---- Markdown レンダリング設定 ----
kramed.setOptions({ gfm: true, tables: true, breaks: false });

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const unescapeHtml = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

// kramed は highlight オプションを持たないため、描画後の HTML を後処理して
// コードブロックに highlight.js を適用する
const highlightCode = (html) =>
  html.replace(
    /<pre><code(?: class="lang-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (full, lang, escaped) => {
      const code = unescapeHtml(escaped);
      try {
        const value = lang && hljs.getLanguage(lang)
          ? hljs.highlight(code, { language: lang }).value
          : hljs.highlightAuto(code).value;
        return `<pre><code class="hljs">${value}</code></pre>`;
      } catch {
        return full; // ハイライトに失敗したらエスケープ済みのまま出す
      }
    },
  );

// 章内の相対リンクを、PDF内アンカー or GitHub の URL に置き換える
const rewriteLinks = (html, chapterHref) => {
  const dir = path.posix.dirname(chapterHref);
  return html.replace(/href="([^"]+)"/g, (full, href) => {
    if (/^(https?:|mailto:|#)/.test(href)) return full;
    const [rawPath, frag] = href.split("#");
    const resolved = path.posix.normalize(path.posix.join(dir, rawPath || "."));
    const anchor = anchorOf.get(resolved);
    if (anchor) return `href="#${anchor}"`;
    // 章ではないパス(code/ や support/)は GitHub 上の URL にする
    return `href="${GITHUB_BASE}${resolved}${frag ? `#${frag}` : ""}"`;
  });
};

// 章内の相対 img src を、リポジトリ内の絶対 file:// URL に置き換える。
// 生成HTMLはtmpdirへ書いてfile://で開くため、相対パスのままでは画像が解決できない。
const rewriteImages = (html, chapterHref) => {
  const dir = path.posix.dirname(chapterHref);
  return html.replace(/src="([^"]+)"/g, (full, src) => {
    if (/^(https?:|data:|file:|\/)/.test(src)) return full;
    const resolved = path.posix.normalize(path.posix.join(dir, src));
    const abs = path.join(ROOT, resolved);
    if (!fs.existsSync(abs)) {
      console.warn(`warning: 画像が見つかりません: ${resolved} (${chapterHref})`);
      return full;
    }
    return `src="file://${abs}"`;
  });
};

// ---- 本文 HTML の組み立て ----
const bodyParts = [];
const tocParts = [];

for (const item of items) {
  if (item.type === "part") {
    tocParts.push(`<li class="toc-part">${escapeHtml(item.title)}</li>`);
    continue;
  }
  const md = fs.readFileSync(path.join(ROOT, item.href), "utf-8");
  const html = highlightCode(rewriteImages(rewriteLinks(kramed(md), item.href), item.href));
  bodyParts.push(`<section class="chapter" id="${item.anchor}">${html}</section>`);
  tocParts.push(
    `<li class="toc-item toc-level-${item.level}"><a href="#${item.anchor}">${escapeHtml(item.title)}</a></li>`,
  );
}

const doc = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>AWSエンジニアのための Cloud Run ハンズオン</title>
<style>
  @page { size: A4; }
  * { box-sizing: border-box; }
  body {
    /* 欧文はプロポーショナルの DejaVu Sans、日本語は IPAGothic にフォールバックさせる */
    font-family: "DejaVu Sans", "IPAPGothic", "IPAGothic", sans-serif;
    font-size: 10pt;
    line-height: 1.75;
    color: #1f2328;
    margin: 0;
  }

  /* 表紙 */
  .cover {
    height: 245mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    break-after: page;
  }
  .cover .mark { font-size: 40pt; margin-bottom: 8mm; }
  .cover h1 { font-size: 24pt; margin: 0 0 6mm; border: none; padding: 0; }
  .cover p { font-size: 11pt; color: #555; margin: 0 0 3mm; }
  .cover .stack { margin-top: 14mm; font-size: 9.5pt; color: #777; }

  /* 目次 */
  .toc { break-after: page; }
  .toc h2 { font-size: 15pt; border-bottom: 2px solid #4285F4; padding-bottom: 2mm; }
  .toc ul { list-style: none; padding: 0; margin: 0; }
  .toc-part {
    margin: 5mm 0 2mm;
    font-weight: bold;
    font-size: 9pt;
    color: #4285F4;
    letter-spacing: 0.08em;
  }
  .toc-item { margin: 1.2mm 0; }
  .toc-item.toc-level-1 { padding-left: 7mm; font-size: 9.5pt; }
  .toc a { color: #1f2328; text-decoration: none; }

  /* 章 */
  .chapter { break-before: page; }
  h1, h2, h3 { line-height: 1.4; break-after: avoid; }
  h1 {
    font-size: 17pt;
    margin: 0 0 5mm;
    padding-bottom: 2.5mm;
    border-bottom: 3px solid #4285F4;
  }
  h2 {
    font-size: 13pt;
    margin: 7mm 0 3mm;
    padding-left: 3mm;
    border-left: 4px solid #4285F4;
  }
  h3 { font-size: 11pt; margin: 5mm 0 2mm; }
  p, ul, ol { margin: 0 0 3mm; }
  li { margin-bottom: 1mm; }
  a { color: #1a56c4; }

  /* コード */
  code {
    font-family: "DejaVu Sans Mono", monospace;
    font-size: 8.5pt;
    background: #f0f2f5;
    padding: 0.3mm 1.2mm;
    border-radius: 2px;
  }
  pre {
    background: #f6f8fa;
    border: 1px solid #d8dee4;
    border-radius: 4px;
    padding: 3mm;
    margin: 0 0 4mm;
    /* 長いコードは改ページをまたいでよい(横切れを防ぐため折り返す)*/
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  pre code { background: none; padding: 0; font-size: 8pt; line-height: 1.5; }

  /* シンタックスハイライト(印刷でも読める彩度に調整)*/
  .hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }
  .hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #cf222e; }
  .hljs-string, .hljs-attr { color: #0a3069; }
  .hljs-number, .hljs-literal { color: #0550ae; }
  .hljs-title, .hljs-function, .hljs-name { color: #8250df; }
  .hljs-variable, .hljs-template-variable { color: #953800; }
  .hljs-meta { color: #116329; }

  /* 表 */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin: 0 0 4mm;
  }
  thead { display: table-header-group; }  /* 改ページ時にヘッダを繰り返す */
  th, td {
    border: 1px solid #d0d7de;
    padding: 1.5mm 2mm;
    text-align: left;
    vertical-align: top;
  }
  th { background: #eef1f4; font-weight: bold; }
  tr { break-inside: avoid; }

  blockquote {
    margin: 0 0 4mm;
    padding: 2mm 0 2mm 4mm;
    border-left: 4px solid #FBBC05;
    background: #fffdf5;
    color: #444;
  }
  blockquote p:last-child { margin-bottom: 0; }
  hr { border: none; border-top: 1px solid #d0d7de; margin: 6mm 0; }
  img { max-width: 100%; }
</style>
</head>
<body>
  <div class="cover">
    <div class="mark">☁️</div>
    <h1>AWSエンジニアのための<br>Cloud Run ハンズオン</h1>
    <p>Google Cloud / Cloud Run を、AWS との違いから学ぶ</p>
    <div class="stack">TypeScript + Hono / Artifact Registry / Cloud Run</div>
  </div>

  <div class="toc">
    <h2>目次</h2>
    <ul>${tocParts.join("\n")}</ul>
  </div>

  ${bodyParts.join("\n")}
</body>
</html>`;

// ---- PDF 出力 ----
(async () => {
  const htmlPath = path.join(require("node:os").tmpdir(), "handson-book.html");
  fs.writeFileSync(htmlPath, doc);

  const browser = await loadChromium().launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
  await page.pdf({
    path: OUT,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate:
      '<div style="width:100%;text-align:center;font-size:8pt;color:#999;font-family:sans-serif;">' +
      '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    margin: { top: "16mm", bottom: "14mm", left: "15mm", right: "15mm" },
  });
  await browser.close();

  // CreationDate/ModDate を固定値へ置換し、同一ソースから同一バイト列のPDFを得る。
  // CIがブランチごとに再生成しても差分が出ず、branch間のbinary conflictを防ぐ。
  // 置換前後で文字列長が同じため、xrefのオフセットは壊れない。
  const FIXED_DATE = "D:20250101000000+00'00'";
  const raw = fs
    .readFileSync(OUT, "latin1")
    .replace(/\/CreationDate \(D:[^)]+\)/, `/CreationDate (${FIXED_DATE})`)
    .replace(/\/ModDate \(D:[^)]+\)/, `/ModDate (${FIXED_DATE})`);
  fs.writeFileSync(OUT, raw, "latin1");

  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(`generated: ${OUT} (${kb} KB)`);
})();
