# Fact-check: Cloud Run instances(第4のリソースタイプ)の提供状況

**確認日**: 2026-08-30

**背景**: 2026-08 の調査で、Cloud Run instances の提供状況について2つの情報が食い違っていた。(a) リリースノートに 2026-08-25 付で Preview 掲載があり `gcloud beta run instances` が存在する / (b) リリースノートに項目がなく、招待制の select customers 限定 Preview で `gcloud alpha` サーフェス。どちらが正かで本文の書き方が変わり、「誰でも試せる」と読める書き方をすると受講者が権限エラーで詰まる。本フラグメントはこの食い違いを一次情報で決着させる。

**検証方法**: `cloud.google.com` / `docs.cloud.google.com` 配下の公式リリースノート・公式ドキュメント・gcloud リファレンスのみを一次情報として取得した。二次情報(ニュース記事・個人ブログ・検索結果の要約)は根拠に採用していない。`https://cloud.google.com/run/pricing` は本文が長大で取得時に切り詰められ、instances 専用の料金区分の有無を直接確認できなかったため「未確認」として残している。

**結論**: (a) が正しい。Cloud Run instances は 2026-08-25 付でリリースノートに掲載された Preview 機能で、公式の手順ドキュメントは `gcloud beta run instances`(BETA サーフェス)を案内している。招待制であることを明示する記載は、確認した公式ページのいずれにも存在しなかった。

**verdict 列の語彙について**: 本フラグメントのスコープは「本文の主張が正しいかの検証」ではなく「提供状況という事実の確定」である。したがって他のフラグメントが使う `正しい` / `要修正` は意味を持たず、`確認済み` / `未確認` の2値を使う。

## 判定表

| # | 確認項目 | 確定した内容 | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | launch stage | Preview。リリースノート 2026-08-25 に「Cloud Run instances are available in Preview. Instances are specifically designed for running long-lived and individually addressable workloads.」とある。instances の各ドキュメント冒頭にも Preview / Pre-GA Offerings Terms 表記がある | 確認済み | https://docs.cloud.google.com/run/docs/release-notes | 本文で触れる場合は「Preview」と明記する |
| 2 | 招待制(allowlist / select customers)か | 公式の作成手順・クイックスタートいずれも Before you begin は通常の API 有効化・課金設定・gcloud コンポーネント更新のみを要求し、invitation-only / select customers / allowlist / request access の文言はない。リリースノートの当該エントリにも記載なし | 確認済み(「公式に明記なし」という事実として。招待制か否かの Yes/No は確定していない) | https://docs.cloud.google.com/run/docs/instances/create-and-manage-instances 、https://docs.cloud.google.com/run/docs/quickstarts/instances/create-instance | 「招待制」とは書かない。ただし裏側で段階的に配布されている可能性は公式ドキュメントからは判断できないため、「誰でも試せる」とも断定しない |
| 3 | gcloud サーフェス | beta。公式の手順ドキュメントは `gcloud beta run instances create/update/stop` を使い、前提条件として gcloud beta コンポーネントの導入を求める。beta リファレンスが実在し、コマンドグループの説明は「view and manage your Cloud Run instances」。`gcloud alpha run instances` も存在するが、公式手順が案内しているのは beta | 確認済み | https://docs.cloud.google.com/sdk/gcloud/reference/beta/run/instances 、https://docs.cloud.google.com/run/docs/instances/create-and-manage-instances 、https://docs.cloud.google.com/sdk/gcloud/reference/alpha/run/instances | コマンドを載せる場合は `gcloud beta run instances` を使い、`gcloud beta` コンポーネントの更新が必要である旨を添える |
| 4 | 対応リージョン | 「You can use any of the Cloud Run-supported regions to create Cloud Run instances (Preview). However, the following high latency regions are not supported: us-central1, us-east1, europe-west1」 | 確認済み | https://docs.cloud.google.com/run/docs/locations | 本文で触れる場合、教材が使うリージョンが非対応3リージョンに該当しないかを確認する |
| 5 | instances 専用の料金区分の有無 | instances の概要・作成手順ページに料金の記載はない。「instance-based billing」は既存の Services / Jobs 向け課金モデルの名称であり、新リソースタイプ専用の料金区分と断定できる一次情報は見つからなかった。料金ページは取得時に本文が切り詰められ確認できていない | 未確認 | https://cloud.google.com/run/pricing | 料金には言及しない。言及する必要が生じたら料金ページを原文で再取得して確定させる |
| 6 | GPU 対応可否 | instances の専用ページ(overview / lifecycle / quickstart)に GPU 関連の記載は見つからなかった。検索結果に現れる「GPU support」は既存の services / jobs / worker pools 向け GPU ドキュメント由来の可能性が高く、新リソースタイプへの言及と断定できない | 未確認 | https://docs.cloud.google.com/run/docs/instances/instance-lifecycle | GPU 対応の有無には言及しない |

## 集計

確認済み4 / 未確認2(計6項目)。本文(教材)の修正は0件 — 本フラグメントは提供状況の確定のみを扱うため。

## 注意点

- 「instance」という語は Cloud Run 全体で多義的である。(1) 新リソースタイプ「Cloud Run instances」、(2) サービスが実行するコンテナインスタンス、(3) 課金モデル名の「instance-based billing」の3つが同じ語で表記される。検索結果の要約はこれらを混同しやすいため、#5 と #6 は混同リスクを踏まえて「未確認」に倒した。既存フラグメント(`03_cloudrun.md` #25 付近、`07_scaling.md`)に現れる「インスタンス」はいずれも (2) の意味であり、本フラグメントの判定と矛盾しない。
- 本フラグメントは提供状況の確定のみを扱う。本文へどう書くか(3モデル→4モデルへの更新、発展編での紹介、後片付け手順の追加)は別タスクで扱う。
