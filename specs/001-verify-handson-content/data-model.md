# Data Model: Cloud Runハンズオン教材の内容再検証と再構成

本機能はソフトウェアのデータベースを持たないため、ここでの「エンティティ」は教材コンテンツの管理単位を指す。実データはリポジトリ内のMarkdownファイル・gitタグ・調査メモファイルとして存在する。

## 章 (Chapter)

`SUMMARY.md`に列挙された学習単位。

| フィールド | 説明 |
|---|---|
| id | 章番号(例: `04`) |
| path | 本文ファイルパス(例: `04_deploy/README.md`) |
| status | `修正済み`(00,02,03,07,10) / `要再検証`(01,04,05,06,08,09,99) |
| has_handson_steps | ハンズオン操作(`gcloud`コマンド等)を含むか。含む場合のみチェックポイント/レスキューボックスの対象(FR-015) |
| checkpoint_tag | 対応するgitタグ名(例: `checkpoint-04`)。座学のみの章(00,01,02,03)はNULL |

## 事実確認項目 (Fact-check item)

教材内の個々の技術的主張。`research/deep-research-report.md`の事実確認テーブル、および未反映章から抽出した主張が初期セットになる。

| フィールド | 説明 |
|---|---|
| chapter_id | 対象の章 |
| location | 対象箇所(見出し・行の目安) |
| claim | 主張の内容 |
| verdict | `正しい` / `要修正` / `未確認` |
| source_url | 判定の根拠となる一次情報のURL(FR-001) |
| confirmed_on | 一次情報を確認した日付 |
| resolution | 要修正の場合の修正内容 |

## 一次情報源 (Source of truth)

| フィールド | 説明 |
|---|---|
| name | 例: "Cloud Run pricing", "AWS Lambda Function URLs" |
| url | 公式ドキュメントURL |
| category | `Google Cloud公式` / `AWS公式` |
| note | `research/deep-research-report.md`自体はここに含めない(二次情報のため) |

## チェックポイント (Checkpoint)

`04`〜`10`(pubsub/websocket/jobsを除く主要ハンズオン章)の完了状態を指すgitタグ。

| フィールド | 説明 |
|---|---|
| tag_name | 例: `checkpoint-04` |
| chapter_id | 対応する章 |
| description | このタグが指す完了状態の説明(次章の前提条件) |

## 新機能候補 (Future feature candidate)

`research/2025-2026-feature-additions.md`に記載する、教材本文へ未反映の2025〜2026年Cloud Run新機能候補。

| フィールド | 説明 |
|---|---|
| name | 例: "Worker pool講師デモ", "Docker Compose deployment" |
| description | 何ができる機能か |
| related_chapter | 関連する既存章(例: `03_cloudrun`, `10_advanced/jobs.md`) |
| estimated_effort | 追加した場合の想定工数・複雑さ(高/中/低 + 理由) |
| recommendation | 著者への推奨(採用/保留/不採用)とその理由 |

## 参加者ペルソナ (Learner persona)

| フィールド | 値 |
|---|---|
| background | AWSを主に使う実務経験者 |
| goal | Cloud Runを中心にGoogle Cloudを学ぶ |
| known_concepts | VPC, IAM, コンテナデプロイ等のクラウド全般の基礎概念 |

## 関係

- 章(Chapter) 1 : N 事実確認項目(Fact-check item)
- 事実確認項目(Fact-check item) N : 1 一次情報源(Source of truth)
- 章(Chapter) 1 : 0..1 チェックポイント(Checkpoint)(ハンズオン操作を含む章のみ)
- 新機能候補(Future feature candidate) N : 1 章(Chapter)(関連章として参照するのみで、本文には反映しない)
