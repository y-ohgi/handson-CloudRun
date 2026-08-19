# 6. カナリアリリースとタグ付きURL

前章のトラフィック制御を一歩進めて、**新バージョンを10%のユーザーにだけ出すカナリアリリース**と、**トラフィックを流さずに本番環境で動作確認できるタグ付きURL**を体験します。

> **AWSとの比較:** これを ECS でやるには CodeDeploy のブルー/グリーン+ALB の加重ターゲットグループ、検証用リスナーの設定が必要でした。Cloud Run では**サービスに元から組み込まれた機能**です。

## 1. v3 を作る

`src/index.ts` を再度書き換えます。

```typescript
const MESSAGE = "Hello, Cloud Run v3!";
const BG_COLOR = "#34A853"; // 緑
```

ビルドと push まで行います(まだ deploy はしません)。

```bash
cd ~/cloudrun-handson/app
docker build -t ${IMAGE}:v3 .
docker push ${IMAGE}:v3
```

## 2. トラフィックを流さずにデプロイする

`--no-traffic` を付けてデプロイすると、リビジョンは作られますが**ユーザーへのトラフィックは1%も流れません**。さらに `--tag` を付けると、そのリビジョン専用のURLが発行されます。

```bash
gcloud run deploy handson-app \
  --image ${IMAGE}:v3 \
  --region ${REGION} \
  --no-traffic \
  --tag staging
```

出力に2つのURLが表示されます:

- 本番URL: `https://handson-app-xxxxx.a.run.app` → **まだ赤(v2)のまま**
- タグ付きURL: `https://staging---handson-app-xxxxx.a.run.app` → **緑(v3)**

両方をブラウザで開いて確認してください。**本番と同じ環境・同じ設定で、リリース前のバージョンだけを検証できるURL**が手に入りました。ステージング環境を別に組む代わりに、本番サービスの中に検証チャネルを持てるということです。

## 3. 10%だけ流す(カナリアリリース)

v3 の動作確認が取れた想定で、まず10%のユーザーにだけ出します。

```bash
gcloud run services update-traffic handson-app \
  --region ${REGION} \
  --to-tags staging=10
```

確認してみましょう。`/api` エンドポイントを20回叩いて、どのリビジョンが応答したかを集計します。

```bash
URL=$(gcloud run services describe handson-app --region ${REGION} --format 'value(status.url)')

for i in $(seq 1 20); do curl -s ${URL}/api | jq -r .message; done | sort | uniq -c
```

おおよそ `v2` が18回・`v3` が2回、という比率になるはずです。ブラウザを何度もリロードして「たまに緑が出る」のを見るのも楽しいです。

> 実務ではこの状態でエラーレートやレイテンシのメトリクス(8章)を監視し、問題なければ段階的に割合を増やしていきます。

## 4. 100%に昇格する

```bash
gcloud run services update-traffic handson-app \
  --region ${REGION} \
  --to-latest
```

> `--to-latest` は「いま動いているリビジョンに固定する」という意味ではなく、**`LATEST`(=最新リビジョン)に100%割り当てる**という設定です。そのため、この状態で次のデプロイを行うと、新しく作られたリビジョンがそのまま `LATEST` になってトラフィックを受け取ります(4〜5章で体験した普通のデプロイ挙動に戻る、ということです)。

ブラウザで全リロードが緑(v3)になれば完了です。もし v3 に問題が見つかっていたら?——前章でやった通り、v2 に一瞬で戻せます。

## まとめ

- `--no-traffic` + `--tag` で「デプロイ」と「リリース」を分離できる
- タグ付きURLで、本番環境そのものを使ったリリース前検証ができる
- カナリア → 段階的昇格 → 即ロールバック、が追加インフラなしで完結する

**デプロイのたびに緊張するチームほど、この機能の価値は大きい**はずです。
