# Quickstart: 修正結果の検証手順

本機能(教材の内容再検証・チェックポイント/レスキュー導線追加)が完了したことを確認するための手順。

## 前提

- Node.js(honkitビルド用)、`npm install`済み
- `npm run pdf`用にPlaywrightのChromiumがインストール済み
- gcloud CLIで認証済みのGoogle Cloudプロジェクト(実コマンド検証を行う場合)

## 1. ビルド確認

```bash
npm run build
```

期待結果: エラーなくビルドが完了し、`SUMMARY.md`に列挙された全章が出力に含まれる。

## 2. 表示確認

```bash
npm run serve
```

期待結果: ブラウザで各章が表示でき、追加した「成功していれば/詰まったら」ボックスが該当章に表示される。

## 3. 事実確認項目の充足確認

`data-model.md`の「事実確認項目」で管理した一覧を参照し、以下を確認する。

- `verdict`が`未確認`のまま残っている項目が0件であること(spec SC-001, SC-002)
- 各`要修正`項目について、本文の該当箇所が`resolution`どおりに修正されていること

## 4. ハンズオン手順の実行確認

`04_deploy`〜`10_advanced`に記載の`gcloud`コマンドを、Cloud Shell相当の環境で最初から順に実行する。

期待結果:

- 各コマンドが教材記載どおりのオプションで成立し、記載どおりの出力(サービスURL、リビジョン一覧、トラフィック配分等)が得られる(spec SC-003)
- 各章末尾で `git tag` の一覧に対応する `checkpoint-XX` が存在し、`git reset --hard checkpoint-XX` で次章の前提状態に戻れる(spec SC-006)

## 5. 新機能調査メモの確認

```bash
test -f research/2025-2026-feature-additions.md && echo "OK"
```

期待結果: ファイルが存在し、Worker pool講師デモ・GPU・Compose・IAPそれぞれについて関連章・想定工数・推奨が記載されている(spec SC-007)。honkitのビルド出力(`npm run build`の結果)にこのファイルの内容が含まれていないことも確認する(教材本体には混在させない、spec Assumptions)。

## 6. PDF再生成

本文または`SUMMARY.md`に変更がある場合:

```bash
npm run pdf
```

期待結果: `handson-cloudrun.pdf`が再生成され、章順・リンクが`SUMMARY.md`と一致している。
