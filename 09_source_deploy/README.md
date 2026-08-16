# 9. 締め: Dockerfileすら書かないデプロイ

最後に、今日学んだ手順を巻き戻すような機能を紹介します。**ソースコードだけで Cloud Run にデプロイする**方法です。

## ソースデプロイ

`--image` の代わりに `--source` を指定すると、Cloud Build がソースからイメージをビルドして GAR に push し、そのままデプロイまで行います。

```bash
cd ~/cloudrun-handson/app
gcloud run deploy handson-app-src \
  --source . \
  --region ${REGION} \
  --allow-unauthenticated
```

数分待つと、別サービス `handson-app-src` として同じアプリが公開されます。

このディレクトリには Dockerfile があるのでそれが使われますが、**Dockerfile を消しても動きます**。その場合は [Cloud Native Buildpacks](https://buildpacks.io/) が `package.json` を見て「Node.js アプリだな」と判断し、`npm start` で起動する良い感じのイメージを自動生成します。

> **AWSとの比較:** App Runner のソースデプロイに相当しますが、できあがるものは今日ずっと触ってきた「普通の Cloud Run サービス」です。カナリアも、タグ付きURLも、スケール設定も全部同じように使えます。

## では、なぜ今日 Dockerfile から始めたのか

「最初からこれを教えてくれれば良かったのに」と思うかもしれません。でも順番には意図があります。

- ソースデプロイは**中でやっていることが今日の手順そのもの**です(build → push → deploy)。仕組みを知った上で使う自動化と、知らずに使う魔法は違います
- 実務では Dockerfile を書く場面が必ず来ます(依存OSパッケージ、マルチステージビルド、社内ベースイメージ…)
- 逆に、プロトタイプや社内ツールなら「Dockerfile なしでとりあえず公開」で十分なことも多い

**手軽さの階段を自分で選べる**のが Cloud Run です:

```
gcloud run deploy --source .          # ソースだけ(Buildpacks におまかせ)
gcloud run deploy --source .          # ソース+ Dockerfile(ビルドはおまかせ)
docker build && push && deploy        # 全部自分で制御(今日やったこと)
+ Cloud Build トリガー                # git push で自動デプロイ(CI/CD)
```

## 今日のまとめ

1. **AWSはビルディングブロック、Google CloudはSaaS的アプローチ** — deploy 1コマンドの裏で、LB・証明書・スケーリング・ログ収集を「しなかった」
2. **イメージの不変性がプラットフォームまで貫かれている** — リビジョン、ロールバック、カナリア、タグ付きURL
3. **従量課金と常駐のダイヤルを回せる** — スケールtoゼロ、concurrency、min/max-instances

AWS に帰っても、この目線は使えます。「この構成、Cloud Run 的な発想ならどう簡単にできるか?」「App Runner や Lambda で十分では?」——別のクラウドを知ることは、いま使っているクラウドをより良く使うことにつながります。

時間に余裕があれば[発展編](../10_advanced/README.md)へ。終わったら必ず[後片付け](../99_cleanup/README.md)をしてください。
