# AWSエンジニアのための Cloud Run ハンズオン

AWS を実務で使っているエンジニアに向けた、Google Cloud / Cloud Run のハンズオン教材です。

Web版: [y-ohgi.com/handson-CloudRun](https://y-ohgi.com/handson-CloudRun/)

## この教材のゴール

1. **Cloud Run を通して Google Cloud の良さを知る**
  - 「デプロイしたら HTTPS の URL が返ってくる」体験から、Google Cloud の SaaS 的なアプローチを体感する
2. **AWS との違いを知る**
  - 単なるサービス名の読み替えではなく、思想の違いを理解する
3. **異なるクラウドの目線を持ち帰る**
  - 普段 AWS で組んでいる構成を「Google Cloud ならどう組むか」で考えられるようになる

## 対象者

- AWS を実務で利用したことがある方
  - Google Cloud は未経験、もしくは BigQuery などを少し触った程度
- コンテナ技術は知識として知っている方
  - Docker・devcontainer・ECS・Kubernetes
- クラウドベンダーの設計思想の違いを学びたい方
  - AWS と Google Cloud の違いをサービス名の対応ではなく、設計思想の違いとして理解したい方

## 進め方

前半(1〜3章)は座学パートの内容をそのまま収録しています。  
ただし2章には Cloud Shell 上で Docker イメージを実際に作って動かすハンズオンも含まれます。  
イベントではスライドで進行しますが、この GitBook 単体でも最初から最後まで完結するように書いてあります。

後半(4章〜)はブラウザ(Cloud Shell エディタと Google Cloud コンソール)だけで完結するハンズオンです。  
手元へのインストールは不要です。

## タイムテーブル

### 2時間版

| 時間 | 内容 | 章 |
|---|---|---|
| 0:00 - 0:10 | オープニング・[事前準備](00_preparation/README.md)の確認 | 0 |
| 0:10 - 0:25 | 座学: [AWS と Google Cloud の考え方の違い](01_aws_and_googlecloud/README.md) | 1 |
| 0:25 - 0:40 | 座学: [Docker のおさらい](02_docker/README.md)・[Cloud Run とは](03_cloudrun/README.md) | 2, 3 |
| 0:40 - 0:55 | ハンズオン: [コンテナを作って動かす](02_docker/README.md) | 2 |
| 0:55 - 1:15 | ハンズオン: [Artifact Registry と Cloud Run へのデプロイ](04_deploy/README.md) | 4 |
| 1:15 - 1:30 | ハンズオン: [更新とロールバック](05_revision/README.md) | 5 |
| 1:30 - 1:45 | ハンズオン: [カナリアリリースとタグ付きURL](06_traffic/README.md) | 6 |
| 1:45 - 1:55 | ハンズオン: [オートスケールを観察する](07_scaling/README.md) | 7 |
| 1:55 - 2:00 | [ログをのぞく](08_observability/README.md)・[締め: ソースデプロイ](09_source_deploy/README.md)・[後片付け](99_cleanup/README.md) | 8, 9 |

> **講師向けペース設計メモ:** デプロイ待ちやアカウントトラブルで数分の遅れは必ず発生します。**6章(カナリアリリース)までを必達ライン**とし、押している場合は 7〜9章を講師の画面共有デモに切り替えてください。8〜9章は「見せる」だけでも学習目標は達成できます。詰まった参加者には[復旧ブロック](00_preparation/README.md#復旧ブロック困ったらここ)を案内してください。
>
> **7章のコールドスタート観察は、直前の負荷試験でインスタンスが温まっているため多くの場合10分では体感できません。** Cloud Run は最大15分インスタンスをアイドル保持するためです。差が出なくても失敗ではないので、概念の説明を優先して先へ進んでください。

### 3時間版(2時間版に追加)

| 時間 | 内容 | 章 |
|---|---|---|
| +20分 | ハンズオン: [Pub/Sub とつなぐ](10_advanced/pubsub.md) | 10 |
| +10分 | デモ: [WebSocket チャット](10_advanced/websocket.md) | 10 |
| +10分 | デモ or ハンズオン: [Cloud Run Jobs](10_advanced/jobs.md) | 10 |
| +20分 | 各章の深掘り・質疑・バッファ | - |

## かかる費用

Cloud Run・Artifact Registry ともに無料枠が大きく、このハンズオンの範囲であればほぼ無料枠に収まります(数円〜数十円程度)。  
心配な場合は最後の[後片付け](99_cleanup/README.md)を必ず実施するか、ハンズオン専用プロジェクトを作って終了後にプロジェクトごと削除してください。

## この教材を手元で表示する

[HonKit](https://github.com/honkit/honkit)(GitBook 互換)でビルドできます。

```bash
npm install
npm run serve  # http://localhost:4000
```

## PDF で読む・配布する

全章を1冊にまとめた [handson-cloudrun.pdf](handson-cloudrun.pdf)(A4)を同梱しています。  
当日ネットワークが不安定な場合の保険や、事前配布に使ってください。

教材を更新したあとは以下で再生成できます([Playwright](https://playwright.dev/) と Chromium が必要です)。

```bash
npm run pdf
```

## 当日用サポートアプリ

[`support/`](support/) に、この GitBook を iframe 表示しつつ「チャット・進捗共有・ヘルプ要請」ができるリアルタイムのサポートアプリがあります(TypeScript + Hono + WebSocket 製で、それ自体を Cloud Run で動かします)。  
イベントで使う場合は [support/README.md](support/README.md) を参照してください。  
GitBook 単体での利用には不要です。

## 関連リンク

- [Docker 入門ハンズオン(introduction-docker)](https://github.com/y-ohgi/introduction-docker) — Docker をより深く学びたい人向け
- [クラウドを今から学ぶには](https://speakerdeck.com/y0hgi/kuraudowojin-karaxue-buniha) — 非機能要件・オートスケール周りの背景
