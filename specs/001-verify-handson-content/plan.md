# Implementation Plan: Cloud Runハンズオン教材の内容再検証と再構成

**Branch**: `001-verify-handson-content` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-verify-handson-content/spec.md`

## Summary

`docs.google.com`を参照できず推測で作成された既存のCloud Runハンズオン教材(`00_preparation`〜`99_cleanup`)のうち、`research/deep-research-report.md`による事実確認がまだ反映されていない章(`01_aws_and_googlecloud`, `04_deploy`, `05_revision`, `06_traffic`, `08_observability`, `09_source_deploy`, `99_cleanup`)を対象に、Google Cloud公式ドキュメント・AWS公式ドキュメントの一次情報で再検証し、矛盾する記述を修正する。あわせて、各ハンズオン章に「成功していれば/詰まったら」の期待結果とチェックポイント用gitタグによるレスキュー導線を追加し、教材本文には含めない2025〜2026年の新機能候補(Worker pool講師デモ・GPU・Compose・IAP)を別の調査メモとして`research/`配下にまとめる。章立て・時間配分・honkitのビルド構成は変更しない。

## Technical Context

<!-- 本機能はソフトウェア実装ではなく教材(Markdown)コンテンツの事実検証・修正のため、一般的なアプリ開発の技術文脈を教材リポジトリの実態に合わせて記載する -->

**Language/Version**: 教材本文はMarkdown(honkit)。サンプルコード(`code/app`, `code/websocket`)はNode.js 24(built-in TypeScript type stripping、`.ts`をビルドせず直接実行)

**Primary Dependencies**: honkit(GitBookビルド)、`tools/build-pdf.js` + Playwright Chromium(PDF生成)、Hono(サンプルアプリのWebフレームワーク)、Google Cloud CLI(`gcloud`)、Cloud Shell(ハンズオン実行環境)

**Storage**: N/A(静的コンテンツ。永続データストアなし)

**Testing**: `npm run serve`(表示確認)、`npm run build`(ビルド確認)、`npm run pdf`(本文/`SUMMARY.md`変更時のPDF再生成)、各章の`gcloud`コマンドをCloud Shell相当の環境で実際に実行して手順の再現性を確認

**Target Platform**: Web(GitHub Pagesで公開するGitBookサイト)+ PDF配布物。ハンズオン自体の実行環境はGoogle Cloud Shell

**Project Type**: ドキュメント/教材コンテンツ(単一リポジトリ、アプリケーションのフロントエンド/バックエンド分離なし)

**Performance Goals**: N/A(教材コンテンツのため性能要件なし)

**Constraints**: 章立て・番号・時間配分(2時間版/3時間発展編)を変更しない(spec FR-013, FR-014)。既修正章(`00_preparation`, `02_docker`, `03_cloudrun`, `07_scaling`, `10_advanced`)の内容を後退させない(FR-010)。教材の技術的主張は一次情報で裏付けが取れること(FR-001)

**Scale/Scope**: 章ファイル12件(`00`〜`10`各README + `10_advanced/pubsub.md`, `websocket.md`, `jobs.md` + `99_cleanup`)、サンプルコード2ディレクトリ(`code/app`, `code/websocket`)、新規成果物1件(2025〜2026年新機能の調査メモ)、チェックポイント用gitタグ最大7件(`04`〜`10`の各章末)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md`はテンプレートのプレースホルダのままで、本プロジェクト固有の憲法(原則)は未制定。そのため、リポジトリ直下の`AGENTS.md`「このリポジトリ固有の規約」節を実質的なガードレールとして適用する。

| ゲート | 内容 | 判定 |
|---|---|---|
| 目次の正 | `SUMMARY.md`が章構成の唯一の正。章の追加・削除・改名時は同時更新 | PASS(本機能は章の追加・削除・改名を行わない。FR-013) |
| PDFビルド整合 | `tools/build-pdf.js`は`SUMMARY.md`をパースするため、そこに載らないMarkdownはPDFに含まれない | PASS(既存の章構成のみを対象とし、新規ページを追加しない) |
| コードとの同期 | `code/`を変更したら参照元の章の本文・手順を同期させる | PASS(FR-006/FR-007でサンプルコードを修正する場合、対応する章の本文も同時に更新する) |
| 検証してから完了報告 | 手順・コマンドは実行して通ることを確認してから本文に書く | PASS(FR-001, SC-001/SC-003で一次情報確認・実コマンド実行を必須化) |
| `support/`非依存 | `support/`は当日運用アプリで教材本体はこれに依存しない | PASS(spec Assumptionsでスコープ外と明記) |

違反なし。Complexity Trackingは不要。

## Project Structure

### Documentation (this feature)

```text
specs/001-verify-handson-content/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

`contracts/`は作成しない。本機能は外部に公開するAPI・CLIインターフェースを持たない(教材Markdownとサンプルコードの内容修正のみ)。

### Source Code (repository root)

```text
00_preparation/README.md         # 事前準備(修正済み。後退させない)
01_aws_and_googlecloud/README.md # AWS比較・サービス対応表(要再検証)
02_docker/README.md              # Docker/Node.js 24(修正済み。後退させない)
03_cloudrun/README.md            # 実行モデル・料金(修正済み。後退させない)
04_deploy/README.md              # 初回デプロイ(要再検証 + checkpoint/rescue追加)
05_revision/README.md            # 更新・ロールバック(要再検証 + checkpoint/rescue追加)
06_traffic/README.md             # トラフィック分割(要再検証 + checkpoint/rescue追加)
07_scaling/README.md             # オートスケール(修正済み。後退させない。checkpoint/rescue追加)
08_observability/README.md       # ログ・メトリクス(要再検証 + checkpoint/rescue追加)
09_source_deploy/README.md       # source deploy(要再検証 + checkpoint/rescue追加)
10_advanced/README.md            # 発展編トップ(修正済み。後退させない)
10_advanced/pubsub.md            # Pub/Sub(事実確認のみ。新機能追加なし。checkpoint/rescue追加)
10_advanced/websocket.md         # WebSocket(事実確認のみ。checkpoint/rescue追加)
10_advanced/jobs.md              # Cloud Run Jobs(事実確認のみ。checkpoint/rescue追加)
99_cleanup/README.md             # 後片付け(要再検証)
code/app/                        # サンプルWebアプリ(Node.js 24 / Hono)。engines指定等を要確認
code/websocket/                  # WebSocketサンプル
research/deep-research-report.md # 既存の事実確認ソース(参照のみ、変更しない)
research/2025-2026-feature-additions.md  # 新規: 新機能候補の調査メモ(FR-014b、ビルド対象外)
SUMMARY.md                       # 章構成の正(変更しない)
handson-cloudrun.pdf              # 本文修正確定後に `npm run pdf` で再生成
```

**Structure Decision**: 既存の単一リポジトリ構成(honkit教材 + `code/`サンプル + `research/`資料)をそのまま維持する。新しいディレクトリ・ビルド構成は追加せず、各章ファイルへの編集と`research/`配下への新規メモ1件の追加のみを行う。チェックポイントはファイルではなくgitタグ(`checkpoint-04`〜`checkpoint-10`程度)として作成する。

## Complexity Tracking

*Constitution Checkに違反なし。記載不要。*
