# Feature Specification: Cloud Runハンズオン教材の内容再検証と再構成

**Feature Branch**: `001-verify-handson-content`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "まずはこのリポジトリの成果物を参考にしてください。CloudRunのハンズオンを作成しています。ペルソナはAWSをメインに使っていてCloud RunをメインにGoogle Cloudを学ぶ既に実務経験のある方です。現在のリポジトリの成果物は docs.google.com を参照にしていないため、再作成をします。そのため再度調査からお願いします。また、ChatGPTのDeepResearch結果がresearch/deep-research-report.mdに入っているため、参考にしてください。https://github.com/y-ohgi/handson-CloudRun/issues/3"

## 背景

現行のハンズオン教材(`00_preparation`〜`99_cleanup`)は、著者が閲覧できなかった `docs.google.com` 上の元資料を参照せず、推測で作成された(Issue #3)。その後 `research/deep-research-report.md`(ChatGPTのDeep Research結果)による事実確認が行われ、一部の章(`00_preparation`, `02_docker`, `03_cloudrun`, `07_scaling`, `10_advanced`)はすでに修正済みだが、残りの章(`01_aws_and_googlecloud`, `04_deploy`, `05_revision`, `06_traffic`, `08_observability`, `09_source_deploy`, `99_cleanup`)は元の推測ベースの記述のまま残っている可能性がある。本機能は、教材全体を公式一次情報と付き合わせて再検証し、必要な修正を行うことを目的とする。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 正確な実行モデル・料金体系の理解 (Priority: P1)

AWSを主戦場とし実務経験のある参加者が、Cloud Runの「サービス / ジョブ / ワーカープール」という3つの実行モデルと、「request-based billing / instance-based billing」という2つの課金モデルを、2026年時点のGoogle Cloud公式ドキュメントと矛盾しない説明で理解する。

**Why this priority**: 実行モデルと料金体系はCloud Run理解の土台であり、ここが不正確だと後続の全ハンズオン(デプロイ・トラフィック制御・スケーリング)の理解が歪む。

**Independent Test**: 該当章(`03_cloudrun`など)の記述を、Cloud Run公式ドキュメント(pricing, overview, release notes)の該当ページと突き合わせ、矛盾がないことを確認できる。

**Acceptance Scenarios**:

1. **Given** 参加者が座学パートを読み終えた状態、**When** Cloud Runの実行モデルを問われる、**Then** 「サービス・ジョブ・ワーカープール」の3種を挙げ、それぞれの用途を説明できる。
2. **Given** 参加者が料金セクションを読み終えた状態、**When** 課金モデルを問われる、**Then** request-based billingとinstance-based billingの違いと、それぞれの無料枠が別枠であることを説明できる。

---

### User Story 2 - AWSサービスとの正確な比較による接続学習 (Priority: P1)

参加者が既知のAWSサービス(Lambda、App Runner、ECS on Fargate)との比較表を通じてCloud Runの特徴を理解する際、比較表の各セルが2026年8月時点のAWS公式ドキュメントの仕様(実行時間上限、同時実行モデル、HTTPS発行手段)と一致している。

**Why this priority**: 誤ったAWS比較は、参加者がすでに持っている実務知識と矛盾し、教材全体の信頼性を損なう。Issue #3・deep-research-report.md双方が最優先の修正対象として指摘している。

**Independent Test**: 比較表に登場する各主張(実行時間上限、HTTPS URL発行手段、同時実行モデル、スケールtoゼロ可否)を、各AWSサービスの公式ドキュメントの該当記載と1件ずつ突き合わせて確認できる。

**Acceptance Scenarios**:

1. **Given** 比較表にLambdaの実行モデルの記載がある、**When** 現在のAWS Lambda公式ドキュメントと突き合わせる、**Then** 標準Lambdaと2025年11月以降のLambda Managed Instancesの違いが区別して記載されている。
2. **Given** 比較表にApp Runnerの実行時間上限の記載がある、**When** AWS App Runner公式ドキュメントと突き合わせる、**Then** 「上限なし」ではなく実際の上限値(公式記載どおりの秒数)が記載されている。

---

### User Story 3 - ハンズオン手順の再現性 (Priority: P1)

参加者がハンズオンパート(`04_deploy`〜`09_source_deploy`)に記載された `gcloud` コマンドや手順をCloud Shell上でそのまま実行したとき、現行のCloud Run仕様と食い違うことなく、教材に記載された結果が得られる。

**Why this priority**: 手順とツールの実際の挙動が食い違うと、当日その場で参加者がつまずき、講師1人では全員を救済できない。deep-research-report.mdは「運用リスク」として最重要項目に挙げている。

**Independent Test**: `04_deploy`〜`09_source_deploy`・`10_advanced` に記載された各 `gcloud` コマンドを実際にCloud Shell相当の環境で実行し、記載どおりの出力・挙動になることを確認できる。

**Acceptance Scenarios**:

1. **Given** 参加者がトラフィック分割の章の手順どおりに `gcloud run services update-traffic` を実行する、**When** コマンドを実行する、**Then** 教材記載のオプション(`--to-tags`, `--to-latest` 等)が現行のstableコマンドとして成立し、記載どおりの結果になる。
2. **Given** 参加者がオートスケールの章でconcurrency設定後に負荷をかける、**When** 実際のインスタンス数を観察する、**Then** 教材が「保証された台数」ではなく「概算・観察対象」として説明しているため、想定と異なる台数でも参加者が誤りと感じない。

---

### User Story 4 - 未修正章の事実確認漏れの解消 (Priority: P2)

教材作成者が、`research/deep-research-report.md` による事実確認が未反映のまま残っている章(`01_aws_and_googlecloud`, `04_deploy`, `05_revision`, `06_traffic`, `08_observability`, `09_source_deploy`, `99_cleanup`)を特定し、既存の一次情報の確認結果を反映する。

**Why this priority**: 一部の章(`00_preparation`, `02_docker`, `03_cloudrun`, `07_scaling`, `10_advanced`)はすでに修正済みであり、重複調査を避けつつ抜け漏れを解消することが効率的な完了への近道になる。

**Independent Test**: 各章のコミット履歴とdeep-research-report.mdの指摘事項を突き合わせ、未反映の指摘が残っていないことを確認できる。

**Acceptance Scenarios**:

1. **Given** `01_aws_and_googlecloud/README.md` のサービス対応表、**When** deep-research-report.mdの「先行事例・類似教材から取り入れるべきもの」および比較表の指摘と突き合わせる、**Then** 矛盾する記載が残っていない。

---

### User Story 5 - 詰まった時に自力で復旧できる (Priority: P2)

参加者がハンズオン中に手順を誤って壊してしまった、または大きく遅れてしまった場合に、各章の冒頭で示される「成功していれば」の期待結果と、用意されたチェックポイント(gitタグ)への復旧コマンドにより、講師を長時間占有せずに本隊へ合流できる。

**Why this priority**: 講師1人で多人数を捌くイベント形式では、個別の詰まりに対する説明コストが最大のボトルネックになる。deep-research-report.mdが運用リスクの主要な緩和策として挙げている。

**Independent Test**: いずれかの章の手順を意図的に壊した状態から、教材に記載のレスキュー手順(`git reset --hard checkpoint-XX`等)のみで、次章に進める状態まで復旧できることを確認できる。

**Acceptance Scenarios**:

1. **Given** 参加者が`04_deploy`章の手順を途中で誤った、**When** 教材記載の`checkpoint-04`への復旧コマンドを実行する、**Then** `05_revision`章の前提となる状態に戻る。
2. **Given** 参加者がいずれかの章のコマンドを実行し終えた、**When** 教材の「成功していれば」の記載と自分の出力を見比べる、**Then** 成功/失敗を自己判定できる。

---

### User Story 6 - 未採用の新機能の判断材料を得る (Priority: P3)

教材作成者が、今回教材本文には追加しない2025〜2026年のCloud Run新機能(Worker pool講師デモ、GPU、Docker Compose deployment、Direct IAP integration等)について、追加候補・想定効果・追加コストをまとめた調査メモを受け取り、将来の改訂で採用するかどうかを自分で判断できる。

**Why this priority**: 教材本文の記述精度の修正(P1)を優先しつつ、deep-research-report.mdが提示した拡張余地を失わずに次回以降の改訂判断に引き継ぐため。

**Independent Test**: 教材本文とは別のメモとして、各新機能候補ごとに「何ができるか」「教材のどこに関連するか」「追加した場合の想定工数・複雑さ」が1件ずつ記載されていることを確認できる。

**Acceptance Scenarios**:

1. **Given** 教材本文がFR-014の方針(既存記載の事実確認のみ)で確定した、**When** 調査メモを受け取る、**Then** Worker pool講師デモ・GPU・Compose・IAPそれぞれについて採否判断に必要な情報が揃っている。

---

### Edge Cases

- 公式ドキュメントの数値(料金単価・無料枠・上限値)が今後改定された場合に教材が古くなる問題にどう備えるか(本文中の単価を最小限にし、公式ページへのリンクを併記する等)。
- `research/deep-research-report.md` の指摘同士、または指摘と公式ドキュメントの現物が食い違う場合に何を正とするか(一次情報である公式ドキュメントの現物確認を優先する)。
- 参加者の企業アカウントでCloud Shellが禁止されている、または `allUsers` へのIAM付与が組織ポリシーで拒否される場合に、教材のどこでその可能性に触れるか。
- 一次情報のURLが将来的にリンク切れ・仕様変更した場合の教材側の記載の耐用年数をどう扱うか。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 教材の全ページ(`00_preparation`〜`99_cleanup`、`10_advanced/*.md`)は、記載された技術的主張についてGoogle Cloud公式ドキュメントまたはAWS公式ドキュメントの一次情報で裏付けが取れる内容であること。裏付けが取れない、または一次情報と矛盾する記載を含まないこと。
- **FR-002**: 教材はCloud Runの実行モデルを「サービス / ジョブ / ワーカープール」の3種として一貫して説明すること。
- **FR-003**: 教材の料金説明は「request-based billing / instance-based billing」の2モデルと、それぞれ異なる無料枠を区別して説明すること。
- **FR-004**: AWSサービス(Lambda、App Runner、ECS on Fargate)との比較箇所は、2026年8月時点の各AWS公式ドキュメントの仕様(実行時間上限、同時実行モデル、HTTPS発行手段、課金体系)と整合すること。
- **FR-005**: オートスケールに関する説明は、インスタンス数を保証値ではなく概算・観察対象として説明すること。
- **FR-006**: サンプルコード・Dockerfile等のNode.jsバージョン指定は、`>=`のような無制限な範囲指定を避け、固定的なメジャーバージョン範囲(例: `24.x`)を用いること。
- **FR-007**: ハンズオン手順は、参加者環境からの外部ダウンロード(実行バイナリの取得等)に失敗する可能性がある依存を可能な限り避け、リポジトリに同梱した代替手段を優先すること。
- **FR-008**: `gcloud` コマンドは可能な限りstableなコマンドグループを使用し、`beta`限定のコマンドを使う場合はその理由を教材内に明記すること。
- **FR-009**: 追加のAPI有効化やIAM権限付与が必要な手順(Cloud Scheduler等)は、必要なAPI名・権限・サービスアカウントを手順内に明示すること。
- **FR-010**: すでに`research/deep-research-report.md`を反映済みの章(`00_preparation`, `02_docker`, `03_cloudrun`, `07_scaling`, `10_advanced`)の既存の修正内容を後退させないこと。
- **FR-011**: 未反映の章(`01_aws_and_googlecloud`, `04_deploy`, `05_revision`, `06_traffic`, `08_observability`, `09_source_deploy`, `99_cleanup`)を対象に、`research/deep-research-report.md`の指摘事項および公式ドキュメントとの突き合わせ結果を反映すること。
- **FR-012**: 本文または`SUMMARY.md`の変更を伴う修正を行った場合、`handson-cloudrun.pdf`を再生成し同じ変更に含めること(既存のリポジトリ規約に準拠)。
- **FR-013**: 教材全体の章立て・時間配分は現行の構成(Dockerfile理解→イメージ→GAR→デプロイ→…→source deployを締めに置く、`SUMMARY.md`記載の章順・番号)を維持し、再編しない。修正は各章の記述内容(事実関係)に限定する。
- **FR-014**: 発展編(3時間版、`10_advanced`)は、既存記載(Pub/Sub・WebSocket・Cloud Run Jobs)の事実確認・修正のみをスコープとし、Worker pool講師デモ・GPU/Compose/IAPなどの新機能を教材本文へ新規追加しない。
- **FR-014b**: 上記で教材本文への追加を見送った2025〜2026年の新機能(Worker pool講師デモ、GPU、Docker Compose deployment、Direct IAP integration等)については、教材とは別の調査メモとして、追加候補・想定効果・追加コスト(時間・複雑さ)をまとめ、著者(ユーザー)が別途採否を判断できる形で提供すること。
- **FR-015**: 当日運用の事故耐性向上策として、各ハンズオン章に「成功していれば」(期待結果)と「詰まったら」(レスキュー手順)を明記すること。
- **FR-015a**: レスキュー手順は**gitに依存しない自己完結したコピペ用コマンド**で記述すること。参加者は教材リポジトリをcloneせず、`~/cloudrun-handson/app` を手作成して作業するため(`02_docker`の手順)、参加者の環境にgitリポジトリは存在せず`git reset --hard`による復旧は原理的に不可能である。
- **FR-015b**: チェックポイント用のgitタグは**講師・著者が各章の想定完成状態を追うための参照**として位置づけ、参加者向け手順には登場させないこと。
- **FR-016**: `support/`配下の講師用サポートアプリについて、後片付け手順を用意すること。`--min-instances 1`でデプロイされるため放置するとアイドル課金が継続するが、削除手順が`support/README.md`にも`99_cleanup`にも存在しない。

### Key Entities *(include if feature involves data)*

- **章 (Chapter)**: `SUMMARY.md`に列挙された学習単位。1つの`README.md`(または`10_advanced/*.md`)、関連するサンプルコード、実行するコマンド群を持つ。
- **事実確認項目 (Fact-check item)**: 教材内の個々の技術的主張。対象箇所(ファイル・見出し)、主張内容、判定(正しい/要修正/未確認)、根拠となる一次情報のURLを持つ。`research/deep-research-report.md`の事実確認テーブルが初期セットになる。
- **一次情報源 (Source of truth)**: Google Cloud公式ドキュメント、AWS公式ドキュメントなど、事実確認の根拠として直接引用できる情報源。`research/deep-research-report.md`自体はAIによる二次的な検証結果であり、一次情報そのものではない。
- **参加者ペルソナ (Learner persona)**: AWSを主に使い、実務経験があり、Cloud Runを中心にGoogle Cloudを学ぶ学習者。VPC・IAM・デプロイ等クラウド全般の基礎概念は既知という前提を持つ。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 教材内の技術的主張(料金・実行時間上限・API仕様・コマンド構文)のうち、出典となる一次情報のURLを明記できないものが0件である。
- **SC-002**: `research/deep-research-report.md`の「最も重要な発見トップ5」および「教材の事実確認」テーブルに挙げられた指摘事項が、未反映(unresolved)のまま残っている件数が0件である。
- **SC-003**: `04_deploy`〜`10_advanced`に記載された全ての`gcloud`コマンドを実行環境で実際に実行し、記載どおりの結果が得られなかった件数が0件である。
- **SC-004**: AWS実務経験者である参加者が、ハンズオン終了後に「Cloud Runの3実行モデル」と「2種類の課金モデル」を自分の言葉で説明できる(講義後アンケート等で計測)。
- **SC-005**: オートスケール実験において、参加者が得た実際のインスタンス数が教材の事前予告と異なった場合でも、それを「教材の誤り」ではなく「autoscalerの挙動」と理解できる(教材の記述表現のみで判定可能)。
- **SC-006**: ハンズオンパートの全章(`04_deploy`〜`09_source_deploy`、`10_advanced`)に、期待結果とレスキュー手順(該当checkpointへの復旧コマンド)が1件以上記載されている。
- **SC-007**: 教材本文へ追加しなかった2025〜2026年新機能候補(Worker pool講師デモ、GPU、Compose、IAP)について、採否判断に必要な情報(内容・関連章・想定工数)を含む調査メモが1件提供されている。

## Assumptions

- 対象読者は「AWSを主に使い、実務経験があり、Cloud Runを中心にGoogle Cloudを学ぶ学習者」であり、VPC・IAM・コンテナデプロイ等クラウド全般の基礎概念は既知とする。
- 一次情報の確認基準日は2026年8月19日時点のGoogle Cloud公式ドキュメント・AWS公式ドキュメントとする。数値(単価・無料枠等)は改定され得るため、確認日を明記するか公式ページへのリンクを併記する。
- `research/deep-research-report.md`はAIによるDeep Researchの結果であり二次情報として扱う。反映時は指摘に記載された出典URLを実際に確認し、一次情報で裏付けを取った上で反映する。
- 教材のフォーマット(honkitによるMarkdown構成、`SUMMARY.md`の見出し階層)自体は本仕様の対象外とし、変更しない。章の追加・削除・大幅な並べ替えが必要と判断された場合は計画フェーズで別途扱う。
- `support/`配下(当日運用サポートアプリ)は`.bookignore`によりビルド対象外のため当初はスコープ外としたが、`--min-instances 1`による講師側のアイドル課金が後片付け手順の不在で放置される問題が判明したため、利用者の承認を得てFR-016としてスコープへ追加した。教材本体が`support/`に依存しないという前提は維持する。
- 参加者はCloud Shell上で`~/cloudrun-handson/app`を手作成して作業し、教材リポジトリをcloneしない。この前提はFR-015a/FR-015bの根拠であり、変更するとレスキュー導線の設計全体に影響する。
- チェックポイント用gitタグは教材リポジトリ側の参照であり、参加者の作業ディレクトリの状態とは対応しない。
- PDF成果物(`handson-cloudrun.pdf`)は本文修正が確定した後に`npm run pdf`で再生成する。
- チェックポイント用のgitタグは、各章の完成状態を指す非破壊的な参照であり、リポジトリの通常のコミット履歴に追加する形で作成する。
- FR-014bの調査メモは教材本体(honkitでビルドされるMarkdown)には含めず、`research/`配下など教材のビルド対象外の場所に独立した成果物として保存する。
