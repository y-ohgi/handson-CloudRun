# 入門 Cloud Run

AWS を実務で使っているエンジニアに向けた、Google Cloud / Cloud Run のハンズオン教材です。

<!-- Web版: [y-ohgi.com/introduction-CloudRun](https://y-ohgi.com/introduction-CloudRun/) -->

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

- 前半(1〜2章)は座学パートになります。
  - ハンズオン当日スライドもあるため、そちらも参照ください。
  - [実践！Cloud Run ハンズオン！！ / Cloud Run handson - Speaker Deck](https://speakerdeck.com/y0hgi/cloud-run-handson)
- 後半(3章〜)はハンズオンです。  
  - ブラウザ(Cloud Shell エディタと Google Cloud コンソール)だけで完結します。
  - 手元のPCへのアプリやCLIのインストールは不要です。

## 今回持ち帰って欲しい3つのポイント
今回持ち帰って欲しいポイントと、ハンズオンが終わったら最後にまた返ってきて見直していただきたいポイントでもあります。

1. **AWSはビルディングブロック、Google CloudはSaaS的アプローチ**
  - Cloud Run は deploy 1コマンドの裏で、LB・証明書・スケーリング・ログ収集を「しなかった」
2. **イメージの不変性がプラットフォームまで貫かれている**
  - リビジョン・ロールバック・カナリアリリース・タグ付きURL
3. **従量課金と常駐のダイヤルを回せる**
  - スケールtoゼロ・オートスケール（min/max-instances）・concurrency（同時接続数/スロットリング）

AWS や他のクラウドベンダーでもこの目線は使えます。  
「この構成、Cloud Run 的な発想ならどう簡単にできるか?」「ECS・Lambda でなら?」のような別のクラウドの視点を知ることは、いま使っているクラウドをより良く使うことにつながります。

## かかる費用

Cloud Run・Artifact Registry ともに無料枠が大きく、このハンズオンの範囲であればほぼ無料枠に収まります(数円〜数十円程度)。  
心配な場合は最後の[後片付け](99_cleanup/README.md)を必ず実施するか、ハンズオン専用プロジェクトを作って終了後にプロジェクトごと削除してください。

## Repository
- [https://github.com/y-ohgi/introduction-CloudRun](https://github.com/y-ohgi/introduction-CloudRun)

<!--
## この教材を手元で表示する

[HonKit](https://github.com/honkit/honkit)(GitBook 互換)でビルドできます。

```bash
cd book
npm install
npm run serve  # http://localhost:4000
```

## PDF で読む・配布する

全章を1冊にまとめた [handson-cloudrun.pdf](https://github.com/y-ohgi/introduction-CloudRun/blob/main/handson-cloudrun.pdf)(A4)を同梱しています。  
当日ネットワークが不安定な場合の保険や、事前配布に使ってください。

教材の更新が development / main へ merge されると、GitHub Actions が自動で再生成します。  
手元で確認する場合は `book/` で以下を実行します([Playwright](https://playwright.dev/) と Chromium が必要です)。

```bash
npm run pdf
```

## 当日用サポートアプリ

[`support/`](https://github.com/y-ohgi/introduction-CloudRun/tree/main/support) に、この GitBook を iframe 表示しつつ「チャット・進捗共有・ヘルプ要請」ができるリアルタイムのサポートアプリがあります(TypeScript + Hono + WebSocket 製で、それ自体を Cloud Run で動かします)。  
イベントで使う場合は [support/README.md](https://github.com/y-ohgi/introduction-CloudRun/blob/main/support/README.md) を参照してください。  
GitBook 単体での利用には不要です。

## 関連リンク

- [Docker 入門ハンズオン(introduction-docker)](https://github.com/y-ohgi/introduction-docker) — Docker をより深く学びたい人向け
- [クラウドを今から学ぶには](https://speakerdeck.com/y0hgi/kuraudowojin-karaxue-buniha) — 非機能要件・オートスケール周りの背景

 -->
