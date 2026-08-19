// 簡易負荷試験スクリプト。Node.js 標準APIのみで動く(外部バイナリのダウンロード不要)。
//   node load.mjs <URL> [同時接続数=50] [継続秒数=30]
const [url, concurrency = "50", duration = "30"] = process.argv.slice(2);

if (!url) {
  console.error("usage: node load.mjs <URL> [concurrency] [durationSec]");
  process.exit(1);
}

const until = Date.now() + Number(duration) * 1000;
let ok = 0;
let ng = 0;

const worker = async () => {
  while (Date.now() < until) {
    try {
      const res = await fetch(url);
      await res.arrayBuffer(); // レスポンスを読み切って接続を再利用する
      res.ok ? ok++ : ng++;
    } catch {
      ng++;
    }
  }
};

console.log(`load: ${url} concurrency=${concurrency} duration=${duration}s`);
await Promise.all(Array.from({ length: Number(concurrency) }, worker));
console.log(`done: success=${ok} failure=${ng}`);
