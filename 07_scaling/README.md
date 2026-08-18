# 7. オートスケールを観察する

Cloud Run の非機能まわりの主役、オートスケールを実際に負荷をかけて観察します。あわせてコールドスタートとその対策も体験します。

> オートスケールや非機能要件の背景を体系的に知りたい人は [クラウドを今から学ぶには](https://speakerdeck.com/y0hgi/kuraudowojin-karaxue-buniha) も参照してください。

## Cloud Run のスケールの仕組み

Cloud Run は**同時に処理しているリクエスト数**を主な基準にインスタンス数を自動調整します。

```
必要インスタンス数 ≒ 同時リクエスト数 ÷ concurrency(1台が同時に受ける数)
```

- この式は**キャパシティの直感をつかむための概算**です。実際のオートスケーラーはCPU使用率や起動状況も加味して判断するため、計算どおりの整数台になるとは限りません
- `concurrency` はデフォルト80。**標準のLambda(1リクエスト=1環境)と違い、1台で複数リクエストを捌く**
- 0台までスケールインする(スケールtoゼロ)
- ECS のように CloudWatch アラーム+スケーリングポリシーを組む必要はなく、**設定不要で最初から動いている**

## 1. 観察しやすいように設定を変える

デフォルトの concurrency 80 だとなかなかスケールしないので、実験用に1台あたり10接続に絞り、上限を10台にします。

```bash
gcloud run services update handson-app \
  --region ${REGION} \
  --concurrency 10 \
  --max-instances 10
```

> この操作でも新しいリビジョンが作られます。リビジョン=イメージ+**設定**のスナップショットだからです。

## 2. 負荷をかける

負荷試験スクリプトを作ります。Node.js の標準APIだけで動く30行のスクリプトで、外部ツールのダウンロードは不要です(Cloud Shell には Node.js が入っています)。

```bash
cat > ~/load.mjs <<'EOF'
// 簡易負荷試験スクリプト。 node load.mjs <URL> [同時接続数=50] [継続秒数=30]
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
      await res.arrayBuffer();
      res.ok ? ok++ : ng++;
    } catch {
      ng++;
    }
  }
};

console.log(`load: ${url} concurrency=${concurrency} duration=${duration}s`);
await Promise.all(Array.from({ length: Number(concurrency) }, worker));
console.log(`done: success=${ok} failure=${ng}`);
EOF
```

アプリの `/heavy` は1秒かかる擬似的に重いエンドポイントです。同時50接続で30秒間叩きます。

**実行する前に、何台までスケールアウトするか予想してみてください。** concurrency を10に絞ったので、1台で受けられる同時リクエストは10。50接続なら概算で5台——ただし実際のオートスケーラーはCPU使用率なども見て判断するため、3台や6台になることもあります。予想と違ったら「なぜ?」を考えるのがこの実験の面白いところです。

```bash
URL=$(gcloud run services describe handson-app --region ${REGION} --format 'value(status.url)')

node ~/load.mjs ${URL}/heavy 50 30
```

## 3. 観察する

負荷をかけている間(および直後)に、2つの方法で観察します。

**コンソールで:** [Cloud Run](https://console.cloud.google.com/run) → `handson-app` → 「指標」タブ。「コンテナ インスタンスの数」がゼロから跳ね上がり、数分後にまたゼロに戻っていく様子が見えます。リクエスト数・レイテンシ(p50/p95/p99)・CPU使用率も**何も設定していないのに**最初から揃っています。

**手元で:** `/api` はインスタンスごとに違う `instance` ID を返します。何台に分散しているか数えてみましょう。

```bash
for i in $(seq 1 30); do curl -s ${URL}/api | jq -r .instance; done | sort | uniq -c
```

複数の instance ID が出てくれば、リクエストが複数台に分散している証拠です。負荷が落ち着いた数分後に同じコマンドを打つと、1台(やがて0台)に戻ります。

## 4. コールドスタートと min-instances

スケールtoゼロの代償が**コールドスタート**です。0台の状態への最初のリクエストは、コンテナ起動を待つ分だけ遅くなります。

10分ほど放置したあと(または講師の説明を聞いたあと)、1発目のレスポンスタイムを計ってみてください。

```bash
curl -s -o /dev/null -w "time_total: %{time_total}s\n" ${URL}/
curl -s -o /dev/null -w "time_total: %{time_total}s\n" ${URL}/
```

1回目だけ遅い(このアプリは軽いので数百ms程度。重いアプリでは数秒〜)のがわかります。対策は常時1台温めておくことです。

```bash
gcloud run services update handson-app \
  --region ${REGION} \
  --min-instances 1
```

> **トレードオフ:** min-instances を設定した分はアイドル時も課金されます。「完全従量制(コールドスタートあり)」と「最低台数の固定費(コールドスタートなし)」を、**サービスごとにダイヤルで選べる**のが Cloud Run の良いところです。Lambda の Provisioned Concurrency と ECS の常駐、両方の選択肢が1つのサービスに入っていると考えてください。

確認できたら、課金を避けるため戻しておきます。

```bash
gcloud run services update handson-app \
  --region ${REGION} \
  --min-instances 0
```

## まとめ

- スケールの基準は「同時リクエスト数 ÷ concurrency」。設定ゼロで動く
- スケールtoゼロ ⇔ コールドスタートはトレードオフ。`min-instances` で調整
- `max-instances` は暴走課金・下流(DB)保護の安全弁としても重要
