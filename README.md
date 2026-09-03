# AWSエンジニアのための Cloud Run ハンズオン

AWS を実務で使っているエンジニアに向けた、Google Cloud / Cloud Run のハンズオン教材です。

- **Web版**: [y-ohgi.com/handson-CloudRun](https://y-ohgi.com/handson-CloudRun/)
- **PDF版**: [handson-cloudrun.pdf](handson-cloudrun.pdf)(A4・全章収録)

## リポジトリ構成

- [`book/`](book/): 教材本文(HonKit 製)。導入・対象者・進め方は [book/README.md](book/README.md) を参照してください
- [`code/`](code/): ハンズオンで受講者がコピーして使うサンプルアプリ
- [`support/`](support/): イベント当日用のリアルタイムサポートアプリ(利用方法は [support/README.md](support/README.md))

## 教材を手元で表示する

```bash
cd book
npm install
npm run serve  # http://localhost:4000
```

PDF は development / main ブランチへの merge 時に GitHub Actions が自動で再生成します。

## フィードバック

誤りや改善点を見つけた場合は Issue / PR をお寄せください。
