# 3. Google Cloudのセットアップ

Google Cloud のプロジェクトを作り、今日使う分だけAPIを有効化して、サンプルコードを手元に用意します。  
ここから先はブラウザ(Google Cloud コンソールと Cloud Shell)だけで進みます。

## 1. Google Cloud プロジェクトを作る

1. [Google Cloud コンソール](https://console.cloud.google.com/)にログイン
2. 初めての場合は無料トライアル(90日 / $300 クレジット)の案内に従う
3. 画面上部のプロジェクトセレクタから「新しいプロジェクト」を作成
  - プロジェクト名: `sandbox` など(IDは自動でユニークになります)
4. 課金が有効になっていることを確認([課金ページ](https://console.cloud.google.com/billing))
  - クレジットカードの登録が必要です。

> **このハンズオンではハンズオン専用プロジェクトを推奨します。**  ハンズオン後にプロジェクトごと削除すれば、消し忘れによる課金の心配がありません。

別のプロジェクトが選ばれたまま進むと、この先のコマンドがすべて無関係なプロジェクトに対して実行されてしまいます。画面上部のプロジェクトセレクタで、今作ったプロジェクトが選ばれていることを確認してください。

## 2. Cloud Shell エディタを開く

[shell.cloud.google.com](https://shell.cloud.google.com/) を開くか、コンソール右上のターミナルアイコンから Cloud Shell を起動し、「エディタを開く」をクリックします。

Cloud Shell は Google Cloud が無料で使える開発環境で、AWS の CloudShell に相当します。  
今日必要なものは最初から揃っています。

### ブラウザで動くコードエディタ
ファイルの編集・保存がそのままブラウザで完結します。今日は主にこれとターミナルを行き来します(使い方は4章で扱います)。

### Docker
`docker` CLI が最初からインストールされています。  
イメージのビルドと実行がその場でできます。今回のハンズオンの鍵です。

### `gcloud` CLI
ログイン済みの状態で使えます。認証設定は不要です。

### 5GB の永続ホームディレクトリ
永続するのは `$HOME` だけです。それ以外への変更はセッション終了で失われます。

> **Cloud Shell を普段からよく使っている人へ:** 週あたりの利用時間クォータ(デフォルト50時間)があり、使い切るとリセット時刻まで一切使えません。  
> 当日その場での回避策がほぼないので、ターミナルの[セッション情報]→[使用量の割り当て]で、**残りが4時間以上あること**を事前に確認してください(残り時間とリセット日時がダイアログに表示されます)。

## 3. APIを有効化する

Cloud Shell のターミナルで、今日使うAPIをまとめて有効化します。  
数分かかることがあるので先に有効化を行います。

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

1. run.googleapis.com
  - Cloud Runの有効化
2. artifactregistry.googleapis.com
  - ArtifactRegistryの有効化
    - コンテナレジストリです。
3. cloudbuild.googleapis.com
  - CloudBuild、(CI/)CDのためのサービスです。

### AWSとの違い
Google Cloud では各サービスの API を明示的に有効化してから使います。  
AWS のようにすべてのサービスが最初から呼べる状態ではなく、プロジェクトごとに使うサービスをオプトインする思想です。

## 4. サンプルコードを手元に用意する

今日使うサンプルコードをこのリポジトリから取得します。  
やり直すときは、このブロックをそのまま再実行すれば初期状態に戻ります(自分で書き換えた `~/cloudrun-handson` の内容は消えます)。

```bash
rm -rf /tmp/handson-CloudRun
git clone --depth 1 https://github.com/y-ohgi/handson-CloudRun.git /tmp/handson-CloudRun
rm -rf ~/cloudrun-handson
mv /tmp/handson-CloudRun/code ~/cloudrun-handson
rm -rf /tmp/handson-CloudRun
```

**成功していれば** `ls ~/cloudrun-handson` で `app` ディレクトリが見えます。ここが今日ずっと作業する場所です。

## 5. 動作確認

```bash
gcloud config get-value project
docker version
```

プロジェクトIDが表示され、`docker version` がエラーにならなければ準備完了です。

`(unset)` と表示された場合や、作った覚えのないプロジェクトIDが表示された場合は、`gcloud` に今日使うプロジェクトが設定されていません。次のコマンドでプロジェクトを設定してから、もう一度 `gcloud config get-value project` を実行してください。

```bash
gcloud config set project <プロジェクトID>
```

> プロジェクトIDはコンソール上部のプロジェクトセレクタで確認できます。「1. Google Cloud プロジェクトを作る」で付けたプロジェクト名とは別に、`sandbox-123456` のように自動採番されたIDです。

## まとめ

- Google Cloud のプロジェクトを作成し、今日使うAPIを有効化した
- サンプルコードを `~/cloudrun-handson/app` に用意した
- ここから先はこの環境の上で、エディタとターミナルを行き来しながら進めます

次の4章で、実際にエディタを開いてコンテナイメージを作っていきます。
