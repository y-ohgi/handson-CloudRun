# 8. ログとメトリクスをのぞく

短い章です。ここまでのハンズオンで一度も「ログの設定」をしていないのに、実はすべて記録されています。それを見に行きます。

## 1. ログを見る

[Cloud Run のコンソール](https://console.cloud.google.com/run) → `handson-app` → 「ログ」タブを開いてください。

- コンテナが stdout/stderr に出しただけのログが、すべて収集されている
- アプリが出していた `{"severity": "INFO", "message": "index accessed", ...}` という**1行JSONが構造化ログとして解釈され**、severity で色分けされている

CLI からも見られます:

```bash
gcloud run services logs read handson-app --region ${REGION} --limit 20
```

> **AWSとの比較:** CloudWatch Logs へ送るには awslogs ログドライバやロググループの設定、IAM 権限が必要でした。Cloud Run では**コンテナが stdout に書く、以上**です。構造化ログにしたければ1行JSONにするだけで、フィールド検索・severityフィルタが効くようになります。

## 2. Logs Explorer で検索する

「ログ」タブの上部から「ログ エクスプローラで表示」を開くと、プロジェクト全体のログを横断検索できます。クエリ欄に以下を入れてみてください:

```
resource.type="cloud_run_revision"
resource.labels.service_name="handson-app"
jsonPayload.message="index accessed"
```

アプリが出した構造化ログだけに絞り込めます。`jsonPayload.instance` など、`log()` 関数で自分が入れたフィールドもそのまま検索条件に使えます。

## 3. メトリクスを見る

「指標」タブ(7章でも見ました)には以下が最初から揃っています:

- リクエスト数 / レイテンシ(p50, p95, p99)
- コンテナインスタンス数 / 課金対象インスタンス時間
- CPU / メモリ使用率

実務では、6章のカナリアリリース中にこの画面を開き、「新リビジョンだけエラー率が上がっていないか」を見ながら昇格判断をします。リビジョン別にメトリクスをフィルタできることも確認してみてください。

## まとめ

- ログもメトリクスも「設定する」のではなく「最初からある」
- アプリ側の作法は「stdout に(できれば1行JSONで)書く」だけ
- 1章で話した SaaS 的アプローチは、オブザーバビリティにも一貫している
