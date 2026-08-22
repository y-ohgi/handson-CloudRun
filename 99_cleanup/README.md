# 99. 後片付け

お疲れさまでした!課金が発生し続けるリソースを片付けます。

## おすすめ: プロジェクトごと削除

ハンズオン専用プロジェクトで進めた場合は、これが一番確実です。

```bash
gcloud projects delete ${PROJECT_ID}
```

(30日間は復元可能な状態で保留されたあと、完全に削除されます)

## 個別に削除する場合

既存プロジェクトを使った場合はこちら。Cloud Shell を開き直していると `${REGION}` などの環境変数が消えているので、先に [4章の「環境変数の準備」](../04_deploy/README.md)を実行し直してください。

```bash
# Cloud Run サービス
gcloud run services delete handson-app --region ${REGION} --quiet
gcloud run services delete handson-app-src --region ${REGION} --quiet   # 9章を実施した場合
gcloud run services delete handson-chat --region ${REGION} --quiet      # 10-2を実施した場合

# Cloud Scheduler とサービスアカウント(10-3を実施した場合)
gcloud scheduler jobs delete handson-job-schedule --location ${REGION} --quiet
gcloud iam service-accounts delete "handson-scheduler@${PROJECT_ID}.iam.gserviceaccount.com" --quiet

# Cloud Run ジョブ(10-3を実施した場合)
gcloud run jobs delete handson-job --region ${REGION} --quiet

# Pub/Sub(10-1を実施した場合)
gcloud pubsub subscriptions delete handson-sub
gcloud pubsub topics delete handson-topic

# Artifact Registry(イメージの保管料がかかるため忘れずに)
gcloud artifacts repositories delete ${REPO} --location ${REGION} --quiet
# 9章のソースデプロイは cloud-run-source-deploy というリポジトリを自動で作るため、こちらも削除します
gcloud artifacts repositories delete cloud-run-source-deploy --location ${REGION} --quiet

# 9章のソースデプロイは Cloud Build 用のバケットも自動で作ります(アップロードしたソースが残ります)
gcloud storage rm --recursive gs://${PROJECT_ID}_cloudbuild --quiet
```

> このバケットは `--region` に追従せず US マルチリージョンに作られるので、`gcloud storage ls` で探すときはリージョンで絞らないでください。

<!-- 引用ブロックの結合を防ぐ区切り -->

> **課金ポイントの整理:** Cloud Run はスケールtoゼロなので、`min-instances` を0に戻してあれば放置してもほぼ課金されません(1以上のままだとアイドル状態でも課金され続けます)。継続課金になり得るのは **Artifact Registry のストレージ**(無料枠は課金アカウントあたり0.5GB/月)、**min-instances**、そして **Cloud Scheduler のジョブ**(無料枠は課金アカウントあたり3ジョブ/月)です。

<!-- 引用ブロックの結合を防ぐ区切り -->

> **講師の方へ:** 当日のサポートアプリ(`handson-support`)は上の一覧に含まれていません。`--min-instances 1` で動かしているためアイドル状態でも課金が続くので、リポジトリの `support/README.md` の「後片付け」節も実行してください(受講者の方はこの節は不要です)。

## 消し忘れが心配な人へ

[課金レポート](https://console.cloud.google.com/billing)で数日後に確認するか、予算アラート(Budgets & alerts)を設定しておくと安心です。AWS の Budgets と同じ感覚で使えます。

---

## 続けて学びたい人へ

- [Cloud Run 公式ドキュメント](https://cloud.google.com/run/docs?hl=ja) — 品質が高く日本語も充実
- [introduction-docker](https://github.com/y-ohgi/introduction-docker) — Docker を基礎から
- [クラウドを今から学ぶには](https://speakerdeck.com/y0hgi/kuraudowojin-karaxue-buniha) — 非機能要件の考え方
- 次の一歩: Cloud Build トリガーで「git push したら自動デプロイ」、Secret Manager 連携、`--no-allow-unauthenticated` + IAM でのサービス間認証、Cloud SQL 接続あたりが実務への近道です
