# 4. Cloud Runへデプロイする

2章で作ったイメージを Artifact Registry(GAR)に push し、Cloud Run にデプロイして、世界中からアクセスできる HTTPS URL を手に入れます。

## 0. 環境変数の準備

この先の章でも使うので、まとめて設定しておきます(Cloud Shell が切断された場合はここから再実行してください)。

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-northeast1   # 東京リージョン
export REPO=handson
export IMAGE=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/app
```

> `asia-northeast1` = 東京です。AWS の `ap-northeast-1` と対応が覚えやすいですね。

## 1. Artifact Registry にリポジトリを作る

ECR と同じく、イメージの置き場をまず作ります。

```bash
gcloud artifacts repositories create ${REPO} \
  --repository-format=docker \
  --location=${REGION} \
  --description="Cloud Run handson"
```

docker コマンドが GAR に push できるよう、認証ヘルパーを設定します(ECR の `aws ecr get-login-password` に相当。こちらは一度設定すれば期限切れがありません)。

```bash
gcloud auth configure-docker ${REGION}-docker.pkg.dev
```

## 2. イメージにタグを付けて push する

GAR のイメージパスは `リージョン-docker.pkg.dev/プロジェクト/リポジトリ/イメージ名:タグ` という形式です。2章で作ったイメージにこのパスでタグを付け直して push します。

```bash
cd ~/cloudrun-handson/app
docker tag handson-app:v1 ${IMAGE}:v1
docker push ${IMAGE}:v1
```

push できたか確認してみましょう。

```bash
gcloud artifacts docker images list ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}
```

[コンソールの Artifact Registry](https://console.cloud.google.com/artifacts) からも見えます。

## 3. Cloud Run にデプロイする

いよいよ本番です。**このコマンド1つで、ECS なら ALB・ターゲットグループ・ACM 証明書・サービス・タスク定義を組み立てていた作業がすべて終わります。**

```bash
gcloud run deploy handson-app \
  --image ${IMAGE}:v1 \
  --region ${REGION} \
  --allow-unauthenticated
```

- `handson-app` がサービス名になります
- `--allow-unauthenticated` は「認証なしで公開」。デフォルトは IAM 認証必須(=閉じている)で、AWS と逆のデフォルトです

30秒ほどで完了し、`Service URL: https://handson-app-xxxxx.a.run.app` が表示されます。

## 4. アクセスして確認する

表示された URL をブラウザで開いてください。**2章で Cloud Shell の中で見たのと同じ青い画面が、今度は本物のインターネット越しに表示されます。**

2章との違いを見てみましょう:

- `Service` が `handson-app` に、`Revision` が `handson-app-00001-xxx` になっている(Cloud Run が注入する環境変数 `K_SERVICE` / `K_REVISION` をアプリが表示している)
- URL が最初から **HTTPS**。証明書の発行も更新も何もしていない

コンソールの [Cloud Run のページ](https://console.cloud.google.com/run) も開いてみてください。サービスの一覧、リビジョン、メトリクス、ログがすべて1画面に集約されています。

## ふりかえり: 何をしなかったか

ここまでで「したこと」は リポジトリ作成 → push → deploy の3コマンドです。それより「**しなかったこと**」に注目してください。

- VPC・サブネット・セキュリティグループを作らなかった
- ロードバランサーもリスナーも作らなかった
- TLS 証明書を発行しなかった
- タスク定義(CPU/メモリ/ポート)を書かなかった ※デフォルト値で開始し、必要なら後から変える
- キャパシティ(台数)を決めなかった

1章で話した「ビルディングブロック vs SaaS的アプローチ」が、これで体感できたはずです。
