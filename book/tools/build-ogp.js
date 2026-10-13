// SNS シェア用の OGP 画像(1200x630 PNG)を imgs/ogp.png へ生成する。実行: node tools/build-ogp.js
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.env.BOOK_ROOT || process.cwd();
const OUT = process.env.OGP_OUT || path.join(ROOT, "imgs", "ogp.png");

const WIDTH = 1200;
const HEIGHT = 630;

const TITLE = "AWSエンジニアのための\nCloud Run ハンズオン";
const SUBTITLE = "Google Cloud / Cloud Run を、AWS との違いから学ぶ";
const FOOTER = "y-ohgi.com/handson-CloudRun";

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

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
    background: #10202e;
    color: #f4f7fa;
    overflow: hidden;
  }
  .card {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 84px 96px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background:
      linear-gradient(135deg, #12283a 0%, #10202e 55%, #0d1a26 100%);
  }
  .glow {
    position: absolute;
    top: -180px;
    right: -140px;
    width: 620px;
    height: 620px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(96,165,196,0.20) 0%, rgba(96,165,196,0) 70%);
  }
  .rule {
    width: 96px;
    height: 6px;
    border-radius: 3px;
    background: #e8a75c;
    margin-bottom: 40px;
  }
  .eyebrow {
    font-size: 25px;
    letter-spacing: 0.14em;
    color: #8fb3cc;
    margin-bottom: 26px;
    font-weight: 600;
  }
  h1 {
    font-size: 78px;
    line-height: 1.28;
    font-weight: 700;
    letter-spacing: 0.01em;
    white-space: pre-line;
  }
  .subtitle {
    margin-top: 36px;
    font-size: 33px;
    line-height: 1.5;
    color: #a9c4d8;
    font-weight: 500;
  }
  footer {
    position: absolute;
    left: 96px;
    bottom: 56px;
    font-size: 25px;
    color: #6f8ea6;
    letter-spacing: 0.04em;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="glow"></div>
    <div class="rule"></div>
    <div class="eyebrow">HANDS-ON</div>
    <h1>${TITLE}</h1>
    <p class="subtitle">${SUBTITLE}</p>
    <footer>${FOOTER}</footer>
  </div>
</body>
</html>`;

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const browser = await loadChromium().launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: OUT, type: "png" });
  } finally {
    await browser.close();
  }

  console.log(`OGP image written to ${OUT}`);
})();
