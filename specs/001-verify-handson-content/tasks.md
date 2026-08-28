---

description: "Task list for feature implementation"
---

# Tasks: Cloud Runハンズオン教材の内容再検証と再構成

**Input**: Design documents from `/specs/001-verify-handson-content/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: 本機能はソフトウェアのユニット/統合テストを持たない。検証は「一次情報との突き合わせ」「`gcloud`コマンドの実行確認」「`npm run build`/`npm run pdf`」で行う(quickstart.md参照)。

**Organization**: タスクはspec.mdのUser Story(P1: US1〜US3, P2: US4〜US5, P3: US6)ごとにグループ化。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能(異なるファイル、他タスクへの依存なし)
- **[Story]**: 対応するUser Story(US1〜US6)
- 各タスクに対象ファイルの絶対パスではなくリポジトリルートからの相対パスを明記

---

## Phase 1: Setup

**Purpose**: 検証作業の前提を整える

- [x] T001 リポジトリのビルド環境を確認する。`npm install`(未実施なら)、`npm run build`を実行しベースラインが成功することを確認する(ファイル変更なし)
- [x] T002 [P] `gcloud`コマンドの実行確認に使うGoogle Cloudプロジェクトの認証状態(`gcloud auth list`, `gcloud config get-value project`)を確認する(ファイル変更なし)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全User Storyが参照する事実確認台帳を用意する

**⚠️ CRITICAL**: このフェーズ完了までUser Story作業(Phase 3以降)を開始しない

- [x] T003 `specs/001-verify-handson-content/fact-check-log.md`を新規作成し、`research/deep-research-report.md`の「教材の事実確認」テーブル・「最も重要な発見トップ5」・AWS比較表の指摘を、`data-model.md`の「事実確認項目」フィールド(chapter_id, location, claim, verdict, source_url, confirmed_on, resolution)形式で章ごとに転記する
- [x] T004 `fact-check-log.md`に、`01_aws_and_googlecloud`, `04_deploy`, `05_revision`, `06_traffic`, `08_observability`, `09_source_deploy`, `99_cleanup`, `code/app`, `code/websocket`の現状の記載を読み、deep-research-report.mdでカバーされていない技術的主張(コマンド構文、API名、権限、バージョン指定等)を追加の未確認行として洗い出す

**Checkpoint**: `fact-check-log.md`が初期化され、全User Storyが着手可能

---

## Phase 3: User Story 1 - 正確な実行モデル・料金体系の理解 (Priority: P1)

**Goal**: `03_cloudrun/README.md`の実行モデル(サービス/ジョブ/ワーカープール)・料金体系(request-based/instance-based billing)の記述が最新の一次情報と整合していることを保証する

**Independent Test**: `03_cloudrun/README.md`の記述をCloud Run公式ドキュメント(overview, pricing, release notes)と突き合わせ、矛盾がないことを確認できる

- [x] T005 [US1] `03_cloudrun/README.md`の「3つの実行モデル」節をCloud Run公式ドキュメント(what-is-cloud-run, release notes)と突き合わせ、`fact-check-log.md`へ判定を記録する
- [x] T006 [US1] `03_cloudrun/README.md`の「料金感」節(request-based/instance-based billingの無料枠数値)をCloud Run pricing公式ページと突き合わせ、`fact-check-log.md`へ判定を記録する
- [x] T007 [US1] T005・T006で差分が見つかった場合のみ`03_cloudrun/README.md`を修正する。差分がない場合は`fact-check-log.md`に「変更なし」と記録する

**Checkpoint**: US1完了。`03_cloudrun`の実行モデル・料金記述が一次情報で裏付け済み

---

## Phase 4: User Story 2 - AWSサービスとの正確な比較による接続学習 (Priority: P1)

**Goal**: `01_aws_and_googlecloud/README.md`のAWS比較表・サービス対応表を2026年8月時点のAWS公式ドキュメントと整合させる

**Independent Test**: 比較表の各主張(実行時間上限、HTTPS URL発行手段、同時実行モデル、スケールtoゼロ可否)をAWS公式ドキュメントと1件ずつ突き合わせて確認できる

- [x] T008 [US2] `01_aws_and_googlecloud/README.md`の「ビルディングブロック vs SaaS的アプローチ」表(ECS/Fargate, ALB, ACM等)をAWS公式ドキュメントと突き合わせ、`fact-check-log.md`へ判定を記録する
- [x] T009 [US2] `01_aws_and_googlecloud/README.md`の「サービス対応表」(Artifact Registry↔ECR、Cloud Build↔CodeBuild等の対応関係)を各公式ドキュメントと突き合わせ、`fact-check-log.md`へ判定を記録する
- [x] T010 [US2] T008・T009で見つかった差分に基づき`01_aws_and_googlecloud/README.md`を修正する
- [x] T011 [US2] `03_cloudrun/README.md`の既存AWS比較表(Lambda/Fargate/App Runner、既修正)と`01_aws_and_googlecloud/README.md`の新しい記載内容に矛盾がないか突き合わせ、後退していないことを確認する(regressionチェック)

**Checkpoint**: US2完了。AWS比較箇所が一次情報で裏付け済み

---

## Phase 5: User Story 3 - ハンズオン手順の再現性 (Priority: P1)

**Goal**: `04_deploy`〜`09_source_deploy`・`10_advanced`配下の`gcloud`コマンドと手順が現行のCloud Run仕様と一致し、実際に実行して記載どおりの結果が得られる

**Independent Test**: 各章の`gcloud`コマンドをCloud Shell相当の環境で実際に実行し、記載どおりの出力・挙動になることを確認できる

- [x] T012 [P] [US3] `04_deploy/README.md`の手順(`gcloud run deploy`、Artifact Registry操作等)をCloud Run公式ドキュメントと突き合わせ、`fact-check-log.md`へ記録の上、差分を修正する
- [x] T013 [P] [US3] `05_revision/README.md`の手順(リビジョン・ロールバック関連コマンド)を公式ドキュメントと突き合わせ、`fact-check-log.md`へ記録の上、差分を修正する
- [x] T014 [P] [US3] `06_traffic/README.md`の`gcloud run deploy --no-traffic --tag`・`gcloud run services update-traffic`のオプションを現行のstableコマンド仕様と突き合わせ、`fact-check-log.md`へ記録の上、差分を修正する
- [x] T015 [P] [US3] `08_observability/README.md`のCloud Logging/Cloud Monitoring関連の記載を公式ドキュメントと突き合わせ、`fact-check-log.md`へ記録の上、差分を修正する
- [x] T016 [P] [US3] `09_source_deploy/README.md`の`gcloud run deploy --source`・Buildpacksの記載を公式ドキュメントと突き合わせ、`fact-check-log.md`へ記録の上、差分を修正する
- [x] T017 [P] [US3] `10_advanced/pubsub.md`の既存記載(push認証、`--push-auth-service-account`等)を公式ドキュメントと突き合わせ、`fact-check-log.md`へ記録の上、事実の差分のみ修正する(FR-014により新機能は追加しない)
- [x] T018 [P] [US3] `10_advanced/websocket.md`の既存記載を公式ドキュメントと突き合わせ、`fact-check-log.md`へ記録の上、事実の差分のみ修正する
- [x] T019 [P] [US3] `10_advanced/jobs.md`の既存記載(`gcloud run jobs logs read`のstable/beta区分、Cloud Scheduler API有効化・専用SA)を公式ドキュメントと突き合わせ、`fact-check-log.md`へ記録の上、差分を修正する
- [x] T020 [P] [US3] `code/app`の`package.json`の`engines.node`指定を確認し、`>=`のような無制限指定があれば`24.x`等の固定範囲に修正する(FR-006)。`package-lock.json`が同梱されているか確認し、なければ追加する
- [x] T021 [P] [US3] `code/websocket`について T020 と同様の確認・修正を行う
- [x] T022 [US3] `07_scaling/README.md`・`10_advanced/README.md`(既修正)の記載が、T012〜T021の修正内容と矛盾しないか突き合わせ、後退していないことを確認する(regressionチェック)
- [x] T023 [US3] T012〜T021で修正が確定した`04_deploy`〜`10_advanced`の`gcloud`コマンドを、Cloud Shell相当の環境で最初から順に実際に実行し、記載どおりの出力・挙動になることを確認する(quickstart.md手順4)。差分があれば該当章に反映する

**Checkpoint**: US3完了。ハンズオン手順が一次情報・実機の両方で裏付け済み

---

## Phase 6: User Story 4 - 未修正章の事実確認漏れの解消 (Priority: P2)

**Goal**: `99_cleanup`を含む残りの記載、およびdeep-research-report.md全体の指摘が反映漏れなく教材へ反映されている

**Independent Test**: 各章のコミット履歴とdeep-research-report.mdの指摘事項を突き合わせ、未反映の指摘が残っていないことを確認できる

- [x] T024 [US4] `99_cleanup/README.md`のリソース削除コマンド(`gcloud run services delete`等)を公式ドキュメントと突き合わせ、`fact-check-log.md`へ記録の上、差分を修正する
- [x] T025 [US4] `00_preparation/README.md`・`02_docker/README.md`(既修正)がT005〜T024の修正内容(API有効化リスト、Node.jsバージョン方針等)と矛盾しないか突き合わせ、後退していないことを確認する(regressionチェック)
- [x] T026 [US4] `fact-check-log.md`の全行を確認し、`verdict`が「未確認」のまま残っている項目が0件であることを確認する。残っていれば追加調査して確定させる(spec SC-001, SC-002)

**Checkpoint**: US4完了。全章の事実確認が完了し、未反映項目が0件

---

## Phase 7: User Story 5 - 詰まった時に自力で復旧できる (Priority: P2)

**Goal**: `04_deploy`〜`10_advanced`の各章に期待結果・レスキュー手順を追記し、対応するチェックポイント用gitタグを作成する

**Independent Test**: いずれかの章の手順を意図的に壊した状態から、教材記載のレスキュー手順のみで次章に進める状態まで復旧できることを確認できる

**依存関係**: 本フェーズはUser Story 3(章の内容確定)完了後に着手する。内容確定前にチェックポイントを切ると、後続の修正のたびにタグを作り直すことになるため

- [x] T027 [P] [US5] `04_deploy/README.md`のデプロイ手順末尾に「成功していれば/詰まったら」ブロックを追記し、その状態を指す`checkpoint-04`タグを作成する
- [x] T028 [P] [US5] `05_revision/README.md`に同様のブロックを追記し、`checkpoint-05`タグを作成する
- [x] T029 [P] [US5] `06_traffic/README.md`に同様のブロックを追記し、`checkpoint-06`タグを作成する
- [x] T030 [P] [US5] `07_scaling/README.md`に同様のブロックを追記し、`checkpoint-07`タグを作成する
- [x] T031 [P] [US5] `08_observability/README.md`に同様のブロックを追記し、`checkpoint-08`タグを作成する
- [x] T032 [P] [US5] `09_source_deploy/README.md`に同様のブロックを追記し、`checkpoint-09`タグを作成する
- [x] T033 [P] [US5] `10_advanced/pubsub.md`, `10_advanced/websocket.md`, `10_advanced/jobs.md`それぞれの「詰まったら」に、前提となる`checkpoint-09`への復帰コマンドを追記する(research.md Decision 2。発展編は個別タグを作成しない)
- [x] T034 [US5] `00_preparation/README.md`の「困ったらここ」ブロックに、チェックポイントタグの一覧と使い方(`git tag`, `git reset --hard checkpoint-XX`)への案内を追記する

**Checkpoint**: US5完了。`04`〜`09`にチェックポイントタグと期待結果/レスキューブロックが揃っている

---

## Phase 8: User Story 6 - 未採用の新機能の判断材料を得る (Priority: P3)

**Goal**: 教材本文に追加しない2025〜2026年のCloud Run新機能候補を調査メモとしてまとめる

**Independent Test**: 教材本文とは別のメモとして、各新機能候補ごとに採否判断に必要な情報が揃っていることを確認できる

- [x] T035 [US6] `research/2025-2026-feature-additions.md`を新規作成し、`data-model.md`の「新機能候補」フィールド(name, description, related_chapter, estimated_effort, recommendation)に沿って、Worker pool講師デモ・GPU・Docker Compose deployment・Direct IAP integration・multi-region service health等を`research/deep-research-report.md`の該当表を出発点に記載する
- [x] T036 [US6] `npm run build`の出力に`research/2025-2026-feature-additions.md`の内容が含まれていないこと(honkitのビルド対象外であること)を確認する

**Checkpoint**: US6完了。将来の改訂判断に使える調査メモが独立して存在する

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 全Story共通の最終検証と成果物の整合

- [x] T037 `npm run build`を実行し、全章がエラーなくビルドされることを確認する
- [x] T038 `npm run serve`で実際に表示し、追加した期待結果/レスキューブロックが該当章に表示されることを目視確認する
- [x] T039 本文修正が確定したため`npm run pdf`を実行し、`handson-cloudrun.pdf`を再生成する
- [x] T040 `git tag`で`checkpoint-04`〜`checkpoint-09`が全て存在し、それぞれ`git reset --hard checkpoint-XX`で次章の前提状態に戻れることを確認する(quickstart.md手順4)
- [x] T041 変更内容を責務ごとのcommitに分割する(AGENTS.mdのGit規約に従う。例: 章ごと/チェックポイント追加/調査メモ追加をそれぞれ別commitにする)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。すぐ開始可能
- **Foundational (Phase 2)**: Setup完了後。全User Storyをブロックする
- **User Story 1〜3 (Phase 3〜5, P1)**: Foundational完了後に並行着手可能。互いに独立
- **User Story 4 (Phase 6, P2)**: Foundational完了後に着手可能だが、T025のregressionチェックはUS1〜US3の修正内容を参照するため、実質的にPhase 3〜5と同時並行または後追いが望ましい
- **User Story 5 (Phase 7, P2)**: User Story 3(Phase 5)の章内容確定後に着手(章の内容が固まってからチェックポイントを切るため)
- **User Story 6 (Phase 8, P3)**: Foundational完了後いつでも着手可能。他Storyと独立
- **Polish (Phase 9)**: 全Story完了後

### Parallel Opportunities

- Phase 3(US1)、Phase 4(US2)、Phase 5(US3)、Phase 8(US6)はFoundational完了後、互いに並行して進められる
- Phase 5内のT012〜T021([P]付き)は対象ファイルが異なるため並行可能
- Phase 7内のT027〜T033([P]付き)は対象ファイルが異なるため並行可能

---

## Implementation Strategy

### MVP First

1. Phase 1: Setup
2. Phase 2: Foundational(`fact-check-log.md`初期化)
3. Phase 3〜5: User Story 1〜3(P1、内容の正確性そのもの)
4. **一度ここで検証**: quickstart.md手順1〜4を実施し、内容の正確性が担保されたことを確認
5. Phase 6〜8: User Story 4〜6(P2/P3、抜け漏れ解消・運用性向上・将来判断材料)
6. Phase 9: Polish(ビルド・PDF・commit分割)

### Incremental Delivery

1. Setup + Foundational → 台帳準備完了
2. US1・US2・US3 → 内容の正確性が担保された教材(最重要価値)
3. US4 → 抜け漏れゼロを保証
4. US5 → 当日の事故耐性向上
5. US6 → 将来改訂の判断材料
6. Polish → ビルド・PDF・commit整理

---

## Notes

- [P]タスク = 異なるファイル、依存なし
- [Story]ラベルはspec.mdのUser Story(US1〜US6)に対応
- 各User Storyの完了時点(Checkpoint)で、そのStoryが独立して価値を提供できることを確認する
- commitはタスク単位ではなく、AGENTS.mdの規約に従い責務(章・機能)単位で分割する
- 避けるべきこと: 複数章にまたがる一括修正commit、fact-check-log.mdへの記録を省略した「暗黙の確認」
