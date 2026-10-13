// SNS シェア用の OGP 画像(1200x630 PNG)を imgs/ogp.png へ生成する。実行: node tools/build-ogp.js
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.env.BOOK_ROOT || process.cwd();
const OUT = process.env.OGP_OUT || path.join(ROOT, "imgs", "ogp.png");

const WIDTH = 1200;
const HEIGHT = 630;

const TITLE = "入門 Cloud Run";

// 右下に載せる著者アバター(入門 Docker の OGP と揃える)
const AVATAR = `data:image/jpeg;base64,${fs
  .readFileSync(path.join(__dirname, "ogp", "avatar.jpg"))
  .toString("base64")}`;

// Google Cloud 公式アイコン(Cloud Run)を単色背景に載せるため白系で塗り直したもの
const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2.5 1.8 19.8 20.4">
  <polygon fill="#ffffff" fill-opacity="0.7" points="8.9 2.63 12.02 12 21.38 12 8.9 2.63"/>
  <polygon fill="#ffffff" points="21.38 12 12.02 12 8.9 21.38 21.38 12"/>
  <polygon fill="#ffffff" points="3.44 21.38 6.57 19.81 8.9 12 5.78 12 3.44 21.38"/>
  <polygon fill="#ffffff" fill-opacity="0.7" points="3.44 2.63 5.78 12 8.9 12 6.57 4.19 3.44 2.63"/>
</svg>`;

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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&family=Roboto:wght@500;700&display=block">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    font-family: "Roboto", "Noto Sans JP", "Hiragino Sans", sans-serif;
    background: #4285f4;
    color: #ffffff;
    overflow: hidden;
  }
  .card {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .brand {
    position: absolute;
    top: 52px;
    left: 46px;
    display: flex;
    align-items: center;
    gap: 22px;
  }
  .brand svg {
    width: 96px;
    height: 99px;
  }
  .brand span {
    font-size: 78px;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  h1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 112px;
    font-weight: 700;
    letter-spacing: 0.01em;
  }
  .avatar {
    position: absolute;
    right: 38px;
    bottom: 28px;
    width: 120px;
    height: 120px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="brand">${LOGO}<span>Cloud Run</span></div>
    <h1>${TITLE}</h1>
    <img class="avatar" src="${AVATAR}" alt="">
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
