# 2025〜2026年 Cloud Run 新機能: 教材への採否判断メモ

## このメモの位置づけ

- **教材本文には未反映**。今回の改訂で発展編(3時間版)のスコープは「既存記載の事実確認・修正のみ」と確定したため、ここに挙げた新機能は本文へ追加していない。拡張余地を失わないための判断材料として、教材本体と切り離して残す
- **honkit のビルド対象外**。本ファイルは `SUMMARY.md` に登録していないため、`npm run build` で生成される書籍のナビゲーションにも、`npm run pdf` で生成される `handson-cloudrun.pdf` にも含まれない(`tools/build-pdf.js` は `SUMMARY.md` をパースして対象章を決めるため、載っていない Markdown は PDF に入らない)
- **用途は著者の採否判断**。受講者向けの読み物ではないので、文体は本文と揃えていない
- 確認日: **2026-08-19**
- 出発点は `research/deep-research-report.md`(ChatGPT Deep Research による二次情報)。ただし各機能の状態と時期は `cloud.google.com` の一次情報(release notes および各機能の公式ドキュメント)で裏取りし直した
- **一次情報で裏が取れなかった項目は `status` および該当箇所に「未確認」と明記してある。** 二次情報の時期をそのまま断定した箇所はない

### 一次情報での裏取りにあたっての注意

release notes ページの取得を要約モデル経由で行うと**日付を誤読する事例が実際に発生した**(年の取り違え)。そのため本メモの日付は、生テキストの取得と複数回のクロスチェックで一致を確認したものだけを断定している。著者が本文へ日付を書く際は、念のため release notes の該当エントリを目視確認することを推奨する。

主要な一次情報:

- [Cloud Run release notes](https://cloud.google.com/run/docs/release-notes)

## 全体像(スキャン用)

| 機能 | status | 既存本文での言及 | 推奨 |
|---|---|---|---|
| Worker pools | GA 2026-04-14 | **言及済み**(3章の表・10章) | 採用(講師デモ) |
| Docker Compose deployment | GA 2026-03-25 | **言及済み**(10章) | 採用(講師デモ)※CLI要検証 |
| Direct IAP integration | GA 2026-03-13 | **言及済み**(10章) | 採用(スライド1枚) |
| Cloud Storage volume mount | GA 2024-08-27(mount options は GA 2025-09-23) | なし | 保留寄りの採用(スライド1枚) |
| Jobs task timeout 7日 | GA 2025-11-11 | **言及済み**(10-3章) | 採用済み・注記のみ追記 |
| Budget spend caps | **Preview** 2026-07-27 | なし(予算アラートのみ99章) | 保留 |
| GPU(Services / NVIDIA L4) | GA 2025-04-07 | **言及済み**(10章、日付なし) | 保留(現状の言及で十分) |
| GPU(Jobs) | GA 2025-10-21 | なし | 不採用 |
| RTX PRO 6000 Blackwell GPU | GA 2026-04-13 | なし | 不採用 |
| HTTP/gRPC readiness probe | GA 2026-06-29 | なし | 保留 |
| Multi-region service health(自動フェイルオーバー) | GA 2026-06-29 | なし | 不採用 |
| Ephemeral disk | **Preview** 2026-04-20 | なし | 不採用 |
| custom CPU / concurrency scaling targets | **Preview** 2026-04-16 | なし | 不採用 |

## 候補一覧

### 1. Worker pools

- **name**: Cloud Run worker pools
- **description**: リクエスト起点でない常駐処理を Cloud Run で動かす第3の実行モデル。Pub/Sub の pull 型サブスクライバや Kafka コンシューマのような「起動しっぱなしでキューを引き続ける」ワークロードが対象。
- **status**: **GA**。Preview 2025-06-25 → **GA 2026-04-14**(release notes: "Support for worker pools is in General Availability (GA)")。一次情報で確認済み。
  - 補足: worker pool 向けの GPU 構成は Preview 2025-09-03 に追加(別エントリ)。`--dry-run` など一部の周辺フラグはまだ Pre-GA Offerings Terms の対象という記載がドキュメントにある(**どのフラグが該当するかは未確認**)。
- **related_chapter**: `03_cloudrun/README.md`(「3つの実行モデル」の表と本文、および「制約・向かないもの」)、`10_advanced/README.md`(「さらにその先」)。**既に本文で言及済み**で、GA時期「2026年4月GA」も一次情報と一致している。`10_advanced/pubsub.md` は push 型サブスクリプションを扱っているため、pull 型との対比先として自然につながる。
- **estimated_effort**: **中**(講師デモ想定、5〜8分)。理由: 言及そのものは既に本文にあるので増分はデモのみ。ただし「動くところを見せる」には Pub/Sub トピックと**pull** サブスクリプション、ワーカー用イメージ、worker pool の作成が必要で、手を動かす形にすると 10-1 と題材が重複しつつ手順が倍になる。**受講者ハンズオンには不向き、講師デモが妥当。**
  - **デモ設計上の重要な注意**: worker pool は**既定で手動スケーリング**であり、Pub/Sub のキュー滞留量に応じた自動スケールは別機能。「キューが溜まると勝手に増える」と見せると誤解を与える。デモでは「実行モデルが選べる」ことに焦点を絞り、スケーリング挙動には踏み込まないのが安全。
- **recommendation**: **採用**(3時間版の講師デモとして最優先)。理由: 教材の主題「同じイメージ・同じ開発体験のまま実行モデルだけ選び替えられる」を最も直接的に体現する。3章で表として提示済みの3分類が、発展編で実物として閉じる構成になる。AWS 実務経験者にとっては「SQS をポーリングする ECS 常駐ワーカー」が Cloud Run 側に入ってきた話で、`Cloud Run ≒ App Runner` という誤解を壊す効果が大きい。

### 2. Docker Compose deployment

- **name**: Compose ファイルによる Cloud Run デプロイ
- **description**: `compose.yaml` をそのまま Cloud Run へデプロイできる。複数コンテナ / サイドカー構成を Cloud Run に持ち込む経路になる。
- **status**: **GA**。Preview 2025-11-13 → **GA 2026-03-25**(release notes: "Deploying services using a Compose file is in General Availability")。一次情報で確認済み。
  - **未確認(重要)**: ドキュメントページは GA 表記だが、gcloud CLI 側のコマンドは `gcloud alpha run compose` として記載されており、**GA表記とCLIチャンネル(alpha)が不一致**に見える。元調査にあった `gcloud run compose up` という正式なコマンド綴りは**一次情報で確定できていない**。デモに使う前に手元で `gcloud run compose --help` / `gcloud alpha run compose --help` を実行して確定すること。
  - **URL注意**: `cloud.google.com/run/docs/deploy-compose` は 404。正しいスラッグは `deploy-run-compose`。本文にリンクを貼る場合は要確認。
- **related_chapter**: `10_advanced/README.md`(「さらにその先」に「2026年3月GA」として**言及済み**、時期は一次情報と一致)。`02_docker/README.md` の Docker おさらいからの接続も自然。
- **estimated_effort**: **中**(講師デモ想定、3〜5分)。理由: 見せるだけなら `compose.yaml` 1枚とコマンド1本で済み、AWS/ECS 経験者の理解コストは極めて低い。一方で**CLI チャンネルが未確定**なため、当日動かす前提にするには事前検証が必須で、その検証コストを含めて「低」ではなく「中」。
- **recommendation**: **採用**(講師デモ。ただし CLI コマンドの事前確定が条件)。理由: AWS エンジニアへの刺さり方が候補中もっとも即効性がある。「Compose で書いた開発環境がそのままマネージドに乗る」は Google Cloud の SaaS 的アプローチを説明せずに体感させられる。GPU のような派手さはないが、学習目標への寄与は明確に上位。

### 3. Direct IAP integration

- **name**: Cloud Run への Identity-Aware Proxy 直接統合
- **description**: 外部 Application Load Balancer を前段に構築せずに、Cloud Run サービスへ IAP による Google アカウント認証を有効化できる。
- **status**: **GA**。Preview 2025-04-07 → **GA 2026-03-13**(release notes: "Configuring Identity-Aware Proxy (IAP) directly on Cloud Run to secure your services without the need for load balancers is in General Availability (GA)")。一次情報で確認済み。
  - **混同注意**: release notes には別系統の古い IAP 機能(Preview 2021-05-03 → GA 2023-04-07)がある。こちらは serverless NEG + 外部 HTTP(S) LB 経由の従来方式で、今回の「LB不要な直接統合」とは**別機能**。本文で時期を書くときに取り違えないこと。
- **related_chapter**: `10_advanced/README.md`(「さらにその先」に「2026年3月GA」として**言及済み**、時期は一致)。`01_aws_and_googlecloud/README.md` の AWS 対比、および `04_deploy` の `--allow-unauthenticated` の説明とも接続する。
- **estimated_effort**: **低〜中**(スライド1枚、または5分デモ)。スライド1枚なら低。実際に有効化して認証画面を見せるデモにすると、IAP の有効化に組織/ブランド設定や IAM 権限が絡み、**当日の環境差でコケやすい**ため中。受講者ハンズオンにはしない。
- **recommendation**: **採用**(スライド1枚。デモは環境が固い場合のみ)。理由: 「社内向けアプリに認証を付ける」ために AWS では ALB + Cognito/OIDC + リスナールールを組む必要があるのに対し、Cloud Run では設定1つで済む、という対比が SaaS 的アプローチの説明として非常に強い。既に言及済みなので増分は小さく、費用対効果が良い。

### 4. Cloud Storage volume mount

- **name**: Cloud Storage バケットの volume mount
- **description**: GCS バケットをサービス / ジョブ / worker pool のファイルシステムとしてマウントできる。FUSE をコンテナへ自前で入れる必要がない。
- **status**: **GA**。ただし**元調査の「2025-09 GA」は不正確**で、2段階に分かれる。
  - 基本機能: 初出 2024-01-19 → **GA 2024-08-27**(release notes: "The following Cloud Run volume types are now generally available (GA)")
  - mount options の指定: Preview 2024-11-07 → **GA 2025-09-23**(services / jobs / worker pools 対象)
  - **未確認**: 2024-01-19 の初出エントリには明示的な "(Preview)" 表記が見当たらなかった。初出〜GA の間が Preview 運用だったかは**推測にとどまり、確認できていない**。
- **related_chapter**: 本文に**言及なし**。関連先は `03_cloudrun/README.md`(ステートレス性・制約の節)、`01_aws_and_googlecloud/README.md`(Cloud Storage = S3 の対応表の行)。
- **estimated_effort**: **低**(スライド1枚)。理由: 概念は1文で説明でき、コマンドもフラグ1つ。ハンズオンにするとバケット作成と後片付け(`99_cleanup` への追記)が増え、得られる学びに対して手順が重い。
- **recommendation**: **保留寄りの採用**(入れるならスライド1枚、優先度は上位3件の後)。理由: 「ステートレスだがファイルシステムが必要な場面はある」という補足として有用で、S3 を fuse する手間との対比も効く。一方で教材のゴールである「実行モデルとデプロイ体験」から見ると周辺的。3章の制約の節に1行足す程度が上限。

### 5. Cloud Run Jobs の task timeout 上限(7日)

- **name**: Cloud Run Jobs の task timeout 最大168時間(7日)
- **description**: ジョブの1タスクあたり実行時間上限を最大168時間まで設定できる。
- **status**: **GA**。Preview 2024-11-25 → **GA 2025-11-11**(release notes: "You can set a task timeout up to 168 hours (7 days) for Cloud Run jobs. (GA)")。一次情報で確認済み。
  - **正確な条件(本文の記述に関わる)**: 既定は**10分**で、設定により短縮も延長もできる。**GPU を使うタスクは上限1時間**(公式: "For tasks using GPUs, the maximum available timeout is 1 hour")。
  - **未確認**: 168時間になる**以前の上限値**。release notes を遡って全文検索し、`configuring/task-timeout` の本文も確認したが明記が見つからなかった。「以前は◯時間だった」という書き方はしないこと。
- **related_chapter**: `10_advanced/jobs.md`(サービスとの違いの表に「最大7日間(タスクあたり)」、本文に Lambda 15分との対比)。**既に本文で言及済み**、上限値も一致。
- **estimated_effort**: **低**(既存記述への注記1〜2行)。新規コンテンツは不要。
- **recommendation**: **採用済み・注記のみ追記を推奨**。理由: 上限値は正しいが、「既定は10分」「GPU タスクは1時間上限」が本文に無いため、受講者が「7日がデフォルト」と受け取る余地がある。今回のスコープ(既存記載の事実確認)に照らしても、この2点の注記は本文追加ではなく**精度向上**として扱える。

### 6. Budget spend caps

- **name**: Budget spend caps による Cloud Run ワークロードの停止
- **description**: 予算条件に達したときに Cloud Run のワークロードを止める課金安全機構。
- **status**: **Preview**。2026-07-27(release notes: "Support for Budget spend caps to pause your Cloud Run workloads is in Preview")。GA 化のエントリは 2026-08-19 時点で見当たらない。一次情報で Preview を確認済み。
  - 挙動(公式ドキュメント記載): spend cap 到達時、services は 5xx を返し、jobs は新規タスクの実行が失敗し、worker pools はタスク処理を停止する。VPC コネクタの VM 課金は spend cap の対象外という例外がある。
  - ドキュメントは Cloud Run 側ではなく Cloud Billing 側(`billing/docs/how-to/budgets-spend-caps`)にある。
- **related_chapter**: 本文に**言及なし**。`99_cleanup/README.md` に予算アラート(Budgets & alerts)への言及はあるが、これは**アラートであって停止ではない**別機能。
- **estimated_effort**: **低**(`99_cleanup` に注意書き1〜2行)。ハンズオンにはしない。
- **recommendation**: **保留**。理由: イベント運用の観点では魅力的だが、**Preview であり当日の後片付けの代替にしてはいけない**。「Preview の新しい安全機構がある」と紹介する価値はあるが、受講者が「これを入れておけば課金は止まる」と受け取るリスクの方が大きい。GA 後に `99_cleanup` へ入れるのが妥当。

### 7. GPU 対応(Services / NVIDIA L4)

- **name**: Cloud Run services の GPU 構成(NVIDIA L4)
- **description**: Cloud Run サービスに GPU を割り当てられる。スケールtoゼロと秒単位課金を保ったまま GPU 推論を動かせる。
- **status**: **GA**。Preview 2024-08-21 → **GA 2025-04-07**(release notes: "Configuring GPU in your Cloud Run service is now generally available (GA)")。一次情報で確認済み。
  - **注意**: 公式ブログ(2025-06-03)にも "generally available" の文言と「クォータ申請が不要になった」旨があり、release notes の GA 日付(2025-04-07)とずれる。**ブログ日付が別マイルストーン(クォータ撤廃)かどうかは未確認**。本文に日付を書くなら release notes の 2025-04-07 を採る。
  - リージョン制約あり(例: `asia-south1` は招待制という記載)。「どこでも使える」と書かないこと。
- **related_chapter**: `10_advanced/README.md`(「GPU対応(NVIDIA L4等)」として**言及済み**、日付は書かれていない)。`03_cloudrun/README.md` の「スペック上限の目安…(GPU構成は別枠)」とも整合。
- **estimated_effort**: **高**(ハンズオンにする場合)。理由: モデルのダウンロード、コールドスタート、GPU クォータ、コストがすべて当日リスクになる。スライド1枚なら低いが、既に言及済みなので増分がほぼない。
- **recommendation**: **保留(現状の言及で十分)**。理由: 話題性は最大だが、学習目標「Google Cloud の SaaS 的アプローチを体感する」への寄与は Worker pools や Compose に劣る。「GPU でもスケールtoゼロが効く」という一文は思想の説明として優秀で、それは既に本文にある。**日付を足すなら 2025-04-07、それ以上の拡張は不要。**

### 8. GPU 対応(Jobs)

- **name**: Cloud Run jobs の GPU 構成
- **description**: ジョブでも GPU を使える。バッチ推論や学習前処理が対象。
- **status**: **GA**。Preview 2025-06-16 → **GA 2025-10-21**。一次情報で確認済み。
- **related_chapter**: 本文に**言及なし**。関連先は `10_advanced/jobs.md`。なお項目5のとおり **GPU タスクの timeout 上限は1時間**で、jobs.md の「最大7日」と併記すると混乱を招く点に注意。
- **estimated_effort**: **低**(1行言及)だが、上記の timeout 例外との整合を取る手間が発生する。
- **recommendation**: **不採用**。理由: 2〜3時間の教材で GPU を2箇所(services / jobs)に分けて紹介する価値がない。GPU の話は services 側の1文に集約するのが読者にとって親切。

### 9. NVIDIA RTX PRO 6000 Blackwell GPU

- **name**: RTX PRO 6000 Blackwell GPU 対応
- **description**: より大規模な AI 推論向けの GPU が Cloud Run で選べる。
- **status**: **GA**。Preview 2025-02-02 → **GA 2026-04-13**。一次情報で確認済み。
  - 注: 元調査の「2026-04 GA」は正しいが、Preview 開始は 2025-02-02 であり、要約経由の取得で一度「2026-02-02」と誤読された経緯がある。日付を引くときは注意。
- **related_chapter**: 本文に**言及なし**。関連先は `10_advanced/README.md`。`03_cloudrun/README.md:83` の「通常のCPUサービスで 8 vCPU / 32GiB」と**混同させない**ことが必須。
- **estimated_effort**: **低**(スライド1枚)。ただし混同リスクの注記が必要。
- **recommendation**: **不採用**。理由: 「Cloud Run が最大規模の AI 推論まで広がった」象徴ではあるが、AWS 実務経験者に SaaS 的アプローチを体感させるという目標には寄与しない。GPU 型番の列挙は教材の寿命を縮める(改定が速い)ため、入れないほうが保守が楽。

### 10. HTTP / gRPC readiness probe

- **name**: HTTP / gRPC readiness probe
- **description**: インスタンスがトラフィックを受けてよいかを判定するプローブ。失敗時は新規トラフィックの送信を止める。既存の startup probe(起動完了判定)や liveness probe(再起動判定)とは目的が異なる。
- **status**: **GA**。Preview 2025-11-21 → **GA 2026-06-29**。一次情報で確認済み。
  - **未確認**: 公式の healthchecks ページの gRPC readiness probe の YAML 例に、いまだ `run.googleapis.com/launch-stage: BETA` アノテーションが残っている。GA 化後のドキュメント更新漏れの可能性があるが**確認できていない**。本文でこの YAML を引用するなら注意。
- **related_chapter**: 本文に**言及なし**。関連先は `07_scaling/README.md`(コールドスタートと min-instances)、`08_observability/README.md`。
- **estimated_effort**: **中**。理由: probe 3種の役割分担を正しく説明するには、ECS / Kubernetes のヘルスチェック概念との対応づけが必要で、1枚のスライドには収まりにくい。ハンズオンにすると「わざと unready にする」仕込みが要る。
- **recommendation**: **保留**。理由: ECS / Kubernetes 経験者には「マネージドでも本番向けのライフサイクル制御が増えている」という良い話題だが、本教材は**設定ゼロで動くことの気持ちよさ**を主軸にしている。probe の話は「設定を増やす」方向で、主軸と逆を向く。3時間版でも優先度は上位3件の下。

### 11. Multi-region service health(自動フェイルオーバー)

- **name**: Cloud Run service health によるマルチリージョン自動フェイルオーバー / フェイルバック
- **description**: 複数リージョンに配置した Cloud Run サービスの間で、ヘルスに基づく自動フェイルオーバーとフェイルバックを行う。
- **status**: **GA**。ただし**2つの別機能が混在しているので分けて扱う必要がある**。
  - 単一コマンドでのマルチリージョンデプロイ: Preview 2024-10-10 → **GA 2025-09-10**
  - service health による自動フェイルオーバー / フェイルバック: 内部トラフィック Preview 2025-11-21 → 外部トラフィック Preview 2026-02-24 → 内部+外部 **GA 2026-06-29**
  - いずれも一次情報で確認済み。後者は確認日時点で **GA から2か月弱**と非常に新しい。
- **related_chapter**: 本文に**言及なし**。関連先があるとすれば `03_cloudrun/README.md` の制約の節だが、現行教材はマルチリージョンを扱っていない。
- **estimated_effort**: **高**。理由: マルチリージョン HA は前提知識(DNS / LB / データ層のレプリケーション)が重く、2〜3時間の枠に対して概念が大きすぎる。デモも複数リージョンのリソースを用意する必要がある。
- **recommendation**: **不採用**。理由: 学習目標に対して明確に過大。触れるとしても「Cloud Run 自体でマルチリージョン HA まで組めるようになった」という**一文の紹介が上限**で、それすら今回の主軸を薄める。なお公式ドキュメントには「Cloud Run ネイティブのマルチリージョン機能」と「外部 ALB + serverless NEG による手組み構成」の両方が同居しているため、将来書く場合はどちらの文脈か明示すること。

### 12. Ephemeral disk

- **name**: Ephemeral disk(ディスクベースの一時領域)
- **description**: サービス / ジョブ / worker pool のインスタンス存続期間だけ保持されるボリュームをマウントできる。大きな一時データをメモリから分離できる。
- **status**: **Preview**。2026-04-20(release notes: "…is in Preview"、公式ドキュメントにも Preview バナーと Pre-GA Offerings Terms の記載)。GA 化のエントリは 2026-08-19 時点で見当たらない。一次情報で Preview を確認済み。
- **related_chapter**: 本文に**言及なし**。関連先は `03_cloudrun/README.md` の制約の節。
- **estimated_effort**: **低**(1行言及)。ただし Preview 明記が必須。
- **recommendation**: **不採用**。理由: Preview であり、教材の主題(実行モデル・デプロイ体験)から遠い。既存の in-memory ファイルシステムとの区別を説明するコストに対して、受講者が得るものが小さい。GA 後に3章の制約の節へ1行、が妥当なライン。

### 13. custom CPU / concurrency scaling targets

- **name**: カスタム CPU / 並行数の利用率ターゲット
- **description**: オートスケーラが目標とする CPU 利用率 / 並行数利用率を明示的に指定できる。既定値は CPU・並行数ともに60%。
- **status**: **Preview**。2026-04-16(release notes: "Support for specifying custom CPU or concurrency targets using scaling controls is in Preview"、ドキュメントにも Preview バナー)。一次情報で Preview を確認済み。
  - 設定は `gcloud beta run services update` の `--scaling-cpu-target` / `--scaling-concurrency-target`(**beta** コマンドグループ)。
- **related_chapter**: 本文に**言及なし**。関連先は `07_scaling/README.md`(「必要インスタンス数 ≒ 同時リクエスト数 ÷ concurrency」の概算式と、「実際のオートスケーラーは CPU 使用率も加味する」という注記)。
- **estimated_effort**: **低**(7章の注記に1行)。ハンズオンにはしない。
- **recommendation**: **不採用(ただし将来 GA 時は7章の注記候補として有力)**。理由: 7章は「設定ゼロでスケールする」ことと「概算式は保証ではない」ことを伝える設計になっており、そこへ Preview の詳細チューニングを持ち込むと主張がぼやける。一方で**既定値60%という数字は、7章の「台数が概算どおりにならない理由」の説明を補強できる**ので、GA 後に再検討する価値はある。

## 参考: 今回の候補外だが一次情報で確認できた新機能

いずれも release notes で確認。教材への採用は推奨しないが、著者が全体像を把握するために記録する。

| 機能 | status | 備考 |
|---|---|---|
| Cloud Run sandboxes | Preview 2026-07-08(2026-08-05 に jobs / worker pools へ拡大) | 用途の深掘りは未実施 |
| GitHub Container Registry からのパブリックイメージ取り込み | GA 2026-07-14 | Artifact Registry 前提の説明に影響しうる |
| Node.js 26 ランタイム | Preview 2026-07-27 | 教材は Node.js 24 前提。**現時点で乗り換える理由はない** |
| worker pool 向け GPU 構成 | Preview 2025-09-03 | 項目1の補足 |

## 元調査(二次情報)からの訂正点

著者が `research/deep-research-report.md` を読み返すときのために、一次情報で確認して**修正が必要だった点**を記録する。

- **Cloud Storage volume mount の「2025-09 GA」は不正確。** 基本機能の GA は 2024-08-27 で、2025-09-23 は **mount options** の GA。元調査はこの2つを混同している
- **Multi-region が1項目にまとめられているが、実際は2機能。** マルチリージョンデプロイ(GA 2025-09-10)と service health による自動フェイルオーバー(GA 2026-06-29)は別物
- **Direct IAP には紛らわしい先行機能がある。** LB 経由の従来 IAP(GA 2023-04-07)と、今回の LB 不要な直接統合(GA 2026-03-13)を取り違えないこと
- **`gcloud run compose up` というコマンド綴りは一次情報で確定できなかった。** ドキュメントは GA 表記だが CLI は `gcloud alpha run compose` と記載されており不一致。デモ前に手元検証が必要
- **URL が2件 404。** `run/docs/deploy-compose` → 正しくは `deploy-run-compose`、`run/docs/overview/worker-pools` → `deploy-worker-pools` 系
- 上記以外の時期(Worker pools、GPU services/jobs、RTX PRO 6000、Jobs task timeout、Compose、IAP、readiness probe、ephemeral disk、scaling targets、budget spend caps)は、**元調査の記載と一次情報が一致**していた

## 推奨する優先順位

教材のゴールは **AWS 実務経験者が Google Cloud の SaaS 的アプローチを体感すること**である。話題性(特に GPU)ではなく、この学習目標への寄与で順位づけした。

1. **Worker pools の講師デモ**(5〜8分)
   - 3章で「サービス / ジョブ / ワーカープール」の3分類を表として提示済みなのに、体験できるのはサービスとジョブだけという**構成上の穴を埋められる**
   - 「同じイメージのまま実行モデルだけ選び替える」という教材の中心主張を、唯一直接実演できる候補
   - 条件: 既定が手動スケーリングであることを踏まえ、スケーリング挙動には踏み込まない設計にする
2. **Docker Compose デプロイの講師デモ**(3〜5分)
   - AWS/ECS 経験者の既存知識に最短で接続でき、説明なしで「マネージドに乗る」感覚を渡せる。準備コストも候補中もっとも軽い
   - 条件: `gcloud` のコマンドチャンネル(GA / alpha)を事前に手元で確定すること。ここが未確認のまま当日に持ち込むと失敗する
3. **Direct IAP のスライド1枚**
   - 「認証付き社内アプリに ALB + Cognito を組まなくてよい」という対比が、SaaS 的アプローチの説明として最も分かりやすい
   - 既に言及済みなので増分が小さく、費用対効果が高い。デモ化は環境依存が強いので任意
4. **Jobs task timeout の注記追加**(既存記述の精度向上、1〜2行)
   - 新規コンテンツではないが、「既定10分」「GPU タスクは1時間上限」が欠けており、現状は誤解の余地がある。今回のスコープ(事実確認・修正)の範囲内で処理できる唯一の項目
5. **Cloud Storage volume mount のスライド1枚**(余裕がある場合のみ)
   - ステートレス理解の補足として効くが、主軸からは周辺的。3章の制約の節に1行足す程度が上限

**GPU 系(項目7〜9)を上位に置かなかった理由**: 「GPU でもスケールtoゼロが効く」という一文は Cloud Run の思想を語るのに優秀で、それは既に `10_advanced/README.md` に入っている。それ以上の拡張(型番の列挙、jobs 側の重複紹介、実演)は、当日リスクとコストを増やす一方で、AWS 実務経験者が得る「Google Cloud の抽象化の考え方」を増やさない。話題性で順位を上げるべきではないと判断した。
