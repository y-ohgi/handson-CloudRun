# 99. 後片付け

お疲れさまでした！  
リソースの片付けを行います。

Cloud Shell を開き直していると `${PROJECT_ID}` や `${REGION}` などの環境変数が消えているので、先に [5章の「環境変数の準備」](../05_deploy/README.md)を実行し直してください(1. と 2. のどちらを選ぶ場合も必要です)。

## 1. おすすめ: プロジェクトごと削除

ハンズオン専用プロジェクトで進めた場合は、これが一番確実です。

まず削除対象のプロジェクトIDを表示して確認します。

```bash
echo ${PROJECT_ID}
```

表示されたIDがハンズオン専用プロジェクトであることを確認してから実行してください(空の場合は冒頭の環境変数の準備をやり直してください)。

```bash
gcloud projects delete ${PROJECT_ID}
```

(30日間は復元可能な状態で保留されたあと、完全に削除されます)

## 2. 個別に削除する場合

既存プロジェクトを使った場合はこちら。

```bash
# Cloud Run Service
gcloud run services delete handson-app --region ${REGION} --quiet
gcloud run services delete handson-app-src --region ${REGION} --quiet   # 10章を実施した場合

# Artifact Registry(イメージの保管料がかかるため忘れずに)
gcloud artifacts repositories delete ${REPO} --location ${REGION} --quiet
# 10章のソースデプロイは cloud-run-source-deploy というリポジトリを自動で作るため、こちらも削除します
gcloud artifacts repositories delete cloud-run-source-deploy --location ${REGION} --quiet   # 10章を実施した場合

# 10章のソースデプロイは Cloud Build 用のバケットも自動で作ります(アップロードしたソースが残ります)
#   このバケットは `--region` に追従せず US マルチリージョンに作られるので、`gcloud storage ls` で探すときはリージョンで絞らないでください。
gcloud storage rm --recursive gs://${PROJECT_ID}_cloudbuild --quiet   # 10章を実施した場合
```

10章を実施していなければ、行末に「10章」と注記した3行は飛ばしてください(実行しても NOT_FOUND エラーになるだけで実害はありません)。

<!-- 引用ブロックの結合を防ぐ区切り -->

### 課金ポイントの整理
Cloud Run はスケールtoゼロなので、`min-instances` を0に戻してあれば放置してもほぼ課金されません(1以上のままだとアイドル状態でも課金され続けます)。  
継続課金になり得るのは **Artifact Registry のストレージ**(無料枠は課金アカウントあたり0.5GB/月)と **min-instances** です。

## 消し忘れが心配な人へ

[課金レポート](https://console.cloud.google.com/billing)で数日後に確認するか、予算アラート(Budgets & alerts)を設定しておくと安心です。AWS の Budgets と同じ感覚で使えます。
