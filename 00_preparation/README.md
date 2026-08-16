# 0. 事前準備

ハンズオン当日までに以下を済ませておいてください。**所要時間は10分程度**ですが、当日に始めると全体が遅れるので必ず事前にお願いします。

## 用意するもの

- Google アカウント
- クレジットカード(課金の有効化に必要。ハンズオンの範囲はほぼ無料枠に収まります)
- Chrome などのモダンブラウザ

手元のPCへのインストールは**一切不要**です。ハンズオンはすべてブラウザ上の Cloud Shell エディタで完結します。

## 1. Google Cloud プロジェクトを作る

AWS と大きく違うポイントその1です。AWS では「アカウント」が課金・リソースの分離単位でしたが、Google Cloud では1つのアカウント(組織)の下に**プロジェクト**をいくつも作り、それが分離単位になります。AWS のマルチアカウント運用(Organizations)でやっていたことを、Google Cloud はプロジェクトで軽量にやるイメージです。

1. [Google Cloud コンソール](https://console.cloud.google.com/)にログイン
2. 初めての場合は無料トライアル(90日 / $300 クレジット)の案内に従う
3. 画面上部のプロジェクトセレクタから「新しいプロジェクト」を作成
    - プロジェクト名: `cloudrun-handson` など(IDは自動でユニークになります)
4. 課金が有効になっていることを確認([課金ページ](https://console.cloud.google.com/billing))

> **ハンズオン専用プロジェクトを推奨します。** 終わったらプロジェクトごと削除すれば、消し忘れによる課金の心配がありません。

## 2. Cloud Shell エディタを開く

[shell.cloud.google.com](https://shell.cloud.google.com/) を開くか、コンソール右上のターミナルアイコンから Cloud Shell を起動し、「エディタを開く」をクリックします。

Cloud Shell は Google Cloud が無料で提供する開発環境で、AWS の CloudShell に相当しますが、以下が最初から揃っています。

- VS Code ベースのエディタ(AWS CloudShell にはない)
- **Docker デーモン**(AWS CloudShell では使えない。今回のハンズオンの鍵)
- `gcloud` CLI(認証済み)
- 5GB の永続ホームディレクトリ

## 3. プロジェクトの設定とAPIの有効化

Cloud Shell のターミナルで以下を実行します。`YOUR_PROJECT_ID` は自分のプロジェクトIDに置き換えてください。

```bash
gcloud config set project YOUR_PROJECT_ID
```

続けて、ハンズオンで使うAPIを有効化します(数分かかることがあるので事前にやっておくのがおすすめです)。

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  pubsub.googleapis.com
```

> **AWSとの違い:** Google Cloud では各サービスの API を明示的に有効化してから使います。AWS のようにすべてのサービスが最初から呼べる状態ではなく、プロジェクトごとに使うサービスをオプトインする思想です。

## 4. 動作確認

```bash
gcloud config get-value project
docker version
```

プロジェクトIDが表示され、`docker version` がエラーにならなければ準備完了です。

## トラブルシューティング

- **`gcloud services enable` で課金エラーが出る** — プロジェクトに課金アカウントが紐付いていません。[課金ページ](https://console.cloud.google.com/billing/projects)から紐付けてください。
- **Cloud Shell がタイムアウトした** — 無操作で切断されることがあります。再接続すればホームディレクトリの内容は残っています(環境変数は消えるので再設定してください)。
