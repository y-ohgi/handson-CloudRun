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

- **AWS を実務で利用したことがある方**
  - Google Cloud は未経験、もしくは BigQuery などを少し触った程度
- **コンテナ技術は知識として知っている方**
  - Docker・devcontainer・ECS・Kubernetes
- **クラウドベンダーの設計思想の違いを学びたい方**
  - AWS と Google Cloud の違いをサービス名の対応ではなく、設計思想の違いとして理解したい方

## 進め方

前半(1〜2章)は座学パートになります。  
後半(3章〜)はブラウザ(Cloud Shell エディタと Google Cloud コンソール)だけで完結するハンズオンです。  

手元のPCへのアプリやCLIのインストールは不要です。

## タイムテーブル

| 時間 | 内容 | 章 |
|---|---|---|
| 0:00 - 0:10 | オープニング・[事前準備](00_preparation/README.md)の確認 | 0 |
| 0:10 - 0:25 | 座学: [AWSとGoogle Cloudの考え方の違い](01_aws_and_googlecloud/README.md) | 1 |
| 0:25 - 0:35 | 座学: [Cloud Runとは](02_cloudrun/README.md) | 2 |
| 0:35 - 0:55 | ハンズオン: [Google Cloudのセットアップ](03_google_cloud_setup/README.md) | 3 |
| 0:55 - 1:10 | ハンズオン: [Dockerのおさらいとコンテナ起動](04_docker/README.md) | 4 |
| 1:10 - 1:30 | ハンズオン: [Cloud Runへデプロイする](05_deploy/README.md) | 5 |
| 1:30 - 1:40 | ハンズオン: [更新とロールバック](06_revision/README.md) | 6 |
| 1:40 - 1:55 | ハンズオン: [カナリアリリースとタグ付きURL](07_traffic/README.md) | 7 |
| 1:55 - 2:05 | ハンズオン: [オートスケールを観察する](08_scaling/README.md)(負荷をかけて観察するところまで) | 8 |
| 2:05 - 2:15 | ハンズオン: [ログとメトリクスをのぞく](09_observability/README.md)・[締め: Dockerfileすら書かないデプロイ](10_source_deploy/README.md) | 9, 10 |
| 2:15 - 2:20 | [8章](08_scaling/README.md)に戻ってコールドスタートを確認・[後片付け](99_cleanup/README.md) | 8, 99 |

このハンズオンの中心は3〜7章です。  
8〜10章は時間があれば進めます(講師のデモに切り替わることもあります)。

> **講師向けメモ:** デプロイ待ちや認証トラブルで数分の遅れは必ず出ます。  
> **7章(カナリアリリース)までを必達ライン**とします。  
> 押している場合は、8〜10章を講師の画面共有デモに切り替えてください。  
> 9〜10章は「見せる」だけでも学習目標は達成できます。  
> 詰まったら[5章0節(環境変数の準備)](05_deploy/README.md)の再実行を促します。
>
> 8章のコールドスタートは、負荷を止めた直後には体感できません。  
> Cloud Run は温まったインスタンスを最大15分アイドル保持するためです。  
> 9〜10章を終えてから戻っても、差が出ないことがあります。  
> 差が出なくても失敗ではないので、概念の説明を優先して先へ進んでください。

## かかる費用

Cloud Run・Artifact Registry ともに無料枠が大きく、このハンズオンの範囲であればほぼ無料枠に収まります(数円〜数十円程度)。  
心配な場合は最後の[後片付け](99_cleanup/README.md)を必ず実施するか、ハンズオン専用プロジェクトを作って終了後にプロジェクトごと削除してください。

<!--
## この教材を手元で表示する

[HonKit](https://github.com/honkit/honkit)(GitBook 互換)でビルドできます。

```bash
cd book
npm install
npm run serve  # http://localhost:4000
```

## PDF で読む・配布する

全章を1冊にまとめた [handson-cloudrun.pdf](https://github.com/y-ohgi/handson-CloudRun/blob/main/handson-cloudrun.pdf)(A4)を同梱しています。  
当日ネットワークが不安定な場合の保険や、事前配布に使ってください。

教材の更新が development / main へ merge されると、GitHub Actions が自動で再生成します。  
手元で確認する場合は `book/` で以下を実行します([Playwright](https://playwright.dev/) と Chromium が必要です)。

```bash
npm run pdf
```

## 当日用サポートアプリ

[`support/`](https://github.com/y-ohgi/handson-CloudRun/tree/main/support) に、この GitBook を iframe 表示しつつ「チャット・進捗共有・ヘルプ要請」ができるリアルタイムのサポートアプリがあります(TypeScript + Hono + WebSocket 製で、それ自体を Cloud Run で動かします)。  
イベントで使う場合は [support/README.md](https://github.com/y-ohgi/handson-CloudRun/blob/main/support/README.md) を参照してください。  
GitBook 単体での利用には不要です。

## 関連リンク

- [Docker 入門ハンズオン(introduction-docker)](https://github.com/y-ohgi/introduction-docker) — Docker をより深く学びたい人向け
- [クラウドを今から学ぶには](https://speakerdeck.com/y0hgi/kuraudowojin-karaxue-buniha) — 非機能要件・オートスケール周りの背景

 -->
