# Phase 0 Research: Cloud Runハンズオン教材の内容再検証と再構成

本機能のTechnical Contextには、一般的なソフトウェア機能開発でいう「言語・フレームワーク選定」のNEEDS CLARIFICATIONは存在しない(spec.mdのクリアリファイ済みスコープ決定を参照)。本ドキュメントは、実行方針上の意思決定を記録する。

## Decision 1: 一次情報の確認方法

**Decision**: 各技術的主張は、`research/deep-research-report.md`に記載された出典URL、またはそこに無い場合はGoogle Cloud/AWSの公式ドキュメントを直接(WebFetch等で)確認し、確認日と確認したURLをfact-check記録(`data-model.md`参照)に残す。

**Rationale**: `research/deep-research-report.md`はChatGPT Deep Researchによる二次情報であり、spec.mdのAssumptionsで「一次情報で裏付けを取った上で反映する」と明記されている。レポートの記載を無検証で転記すると、二次情報側の誤りをそのまま引き継ぐリスクがある。

**Alternatives considered**: レポートの記載をそのまま転記する(却下: 二次情報の誤りを検知できない)。全項目をGoogle Cloudの最新ドキュメントから独自に再調査する(却下: 既にレポートが調査済みの出典URLがあるため、そこを起点に検証すれば十分で工数が半減する)。

## Decision 2: チェックポイントのタグ命名・粒度

**Decision**: `04_deploy`〜`10_advanced`(pubsub/websocket/jobsを含む)の各章の完了時点を指すgitタグを`checkpoint-04`, `checkpoint-05`, ... の形式で作成する。章番号にそのまま対応させ、`10_advanced`配下の3ページはそれぞれ独立したタグ(例: `checkpoint-10-pubsub`)ではなく、発展編は各ページ内の「詰まったら」に前提となる直前チェックポイント(`checkpoint-09`)への復帰を案内する程度に留める(発展編はデモ中心のため厳密な章単位タグは過剰)。

**Rationale**: deep-research-report.mdが提案する形式(`checkpoint-02`, `checkpoint-04`等)に合わせ、参加者が章番号からタグ名を直感的に推測できるようにする。2時間の必修パート(`04`〜`09`)は全員が手を動かすため厳密なタグが有効だが、発展編は前提知識のある参加者向けデモが多く、過剰なタグ管理はメンテナンスコストに見合わない。

**Alternatives considered**: 全章(00〜10)にタグを付与する(却下: `00`〜`03`は座学中心でハンズオン操作を伴わずタグの効果が薄い)。コミットハッシュを直接案内する(却下: 参加者にとって覚えにくく、`git reset --hard <hash>`よりも`git reset --hard checkpoint-XX`の方が意味が伝わる)。

## Decision 3: 「成功していれば/詰まったら」ボックスの配置形式

**Decision**: 各章のハンズオン操作の直後に、Markdownの引用ブロック(`>`)を使い、既存の章と同じです/ます調で「**成功していれば:**」「**詰まったら:**」の2行程度を追記する。既存の見出し階層・トーンは変更しない。

**Rationale**: 別ファイルにまとめたFAQ/トラブルシュート集を作ると、参加者は今どの章で詰まっているかを自分で判断してから別ページを探す必要があり、当日運用リスクがかえって増える(deep-research-report.mdが指摘する「全章共通の困ったらブロック」は事前準備章に既にあるため、章ごとの即時レスキューとは役割が異なる)。

**Alternatives considered**: 章末に「トラブルシューティング」節をまとめて新設する(却下: 該当操作から視線移動が発生し、当日の即時性に欠ける)。別ファイル化(却下: 上記理由と同じ)。

## Decision 4: 新機能調査メモの置き場所とフォーマット

**Decision**: `research/2025-2026-feature-additions.md`を新規作成し、`research/deep-research-report.md`の「2025〜2026年のCloud Run新機能」表を出発点に、Worker pool講師デモ・GPU・Docker Compose deployment・Direct IAP integrationなど教材本文へ未反映の候補ごとに「内容」「関連する既存章」「追加した場合の想定工数・複雑さ」「著者への推奨(採用/保留/不採用)」を記載する。honkitの`SUMMARY.md`には載せず、ビルド対象外の`research/`配下に置く。

**Rationale**: spec.md User Story 6 / FR-014bの要求どおり、教材本文とは切り離した著者向け判断材料として提供する。`research/`ディレクトリは既に`deep-research-report.md`の置き場所として使われており、置き場所として一貫性がある。

**Alternatives considered**: GitHub Issueとして起票する(却下: ユーザーは今回リポジトリ内のテキスト成果物として求めており、後から`research/deep-research-report.md`と一緒に参照できる方が都合が良い)。教材本文に「Coming soon」的な形で軽く触れる(却下: FR-014で教材本文への新規追加は行わないと決定済み)。

## Decision 5: 作業単位の管理方法

**Decision**: 本機能の作業は`tasks.md`(このあと`/speckit-tasks`で生成)のチェックリストで管理し、beads(`bd`)へのタスク登録は行わない。

**Rationale**: `manage-task-queue`skillの境界(SpecKitの`tasks.md`がタスクの分解粒度・実行順序を持つ)に従う。本機能は単一セッション〜数コミットの範囲で完了見込みであり、セッションをまたぐ中断・再開が前提の長時間自律実行(`checkpoint-handoff`/`manage-task-queue`の適用条件)には該当しない。

**Alternatives considered**: `bd create`で章ごとにissueを起票する(却下: 現時点では3 milestone以上の中断耐性が必要な自律実行と判断していないため過剰)。作業が長時間化した場合は、着手時点で`checkpoint-handoff`/`manage-task-queue`の適用を再検討する。
