# Fact-check: 07_scaling/README.md

**確認日**: 2026-08-19

**判定サマリ**: 全32項目 — 正しい 17件 / 要修正 11件 / 未確認 4件

検証方法: Google Cloud 公式ドキュメント(`docs.cloud.google.com`)および Cloud Run Admin API v1 リファレンスの突き合わせのみ。`gcloud` およびビルド・PDF生成は未実行。行番号は修正後のもの。

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | L9(旧) | Cloud Run は「同時に処理しているリクエスト数」を**主な基準に**インスタンス数を自動調整する | 要修正 | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 公式: 「CPU and concurrency utilization: Cloud Run adjusts instance counts to keep average CPU and concurrency within target thresholds」。CPU使用率は同格のシグナルであり「主な基準はリクエスト数」は不正確。「同時に処理しているリクエスト数(concurrency)とCPU使用率を基準に」へ修正 |
| 2 | L11-13 | `必要インスタンス数 ≒ 同時リクエスト数 ÷ concurrency` | 正しい(概算式として) | https://docs.cloud.google.com/run/docs/about-concurrency | 公式: 「With lower concurrency settings, Cloud Run must use more instances for the same request volume, because each instance handles fewer requests」。方向性は一致。保証値ではない旨は L15 で明示済み |
| 3 | L15(旧) | 実際のオートスケーラーは「CPU使用率や起動状況も加味」するため計算どおりの整数台にならない | 要修正(不足) | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 公式: 「By default, metrics-based scaling sets a 60% threshold for CPU utilization and request concurrency targets」「averaging the request concurrency per second over a 1-minute and 10-minute period」。目標値60%という定量情報が欠けており、単純除算より**多い**台数になる方向性も書かれていなかった。60%目標と「たいてい式より多め」を追記 |
| 4 | L16(旧) | `concurrency` はデフォルト80 | 要修正 | https://docs.cloud.google.com/run/docs/about-concurrency | 公式: 「Cloud Run instances deployed using Google Cloud CLI or Terraform have a maximum concurrency that is 80 times the number of vCPUs. This default only applies when a new service is created.」「Cloud Run instances deployed using Google Cloud console have a default concurrency of 80.」固定値80として教えるのは不正確。本教材は既定1 vCPU(https://docs.cloud.google.com/run/docs/configuring/services/cpu で「1 vCPU by default」)なので実効80だが、「1 vCPU構成なら既定80、gcloud/Terraform では vCPU数×80」へ修正 |
| 5 | L16 | 設定できる concurrency の上限は1インスタンスあたり1000 | 正しい(追記) | https://docs.cloud.google.com/run/docs/about-concurrency | 公式: 「You can increase this to a maximum of 1000.」参加者が「80が天井」と誤解しないよう追記した |
| 6 | L16 | 標準の Lambda は1リクエスト=1実行環境、Cloud Run は1台で複数リクエストを捌く | 未確認(Cloud Run 側は正しい) | https://docs.cloud.google.com/run/docs/about-concurrency | Cloud Run 側は公式と整合。AWS Lambda 側の記述は本タスク(Google Cloud 公式ドキュメント突き合わせ)の対象外。なお `research/deep-research-report.md` は Lambda Managed Instances(2025年11月)を挙げて「standard Lambda では」の限定を推奨しており、本文には既に「標準のLambda」と限定がある |
| 7 | L17(旧) | 0台までスケールインする(スケールtoゼロ) | 要修正(不足) | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 公式: 「When a revision does not receive any traffic, by default, it is scaled to zero instances.」自体は正しい。ただし「To minimize cold starts, Cloud Run might keep instances idle for a period of time after they finish handling requests (up to 15 minutes, or 10 minutes for GPUs)」「A second group of instances remains running until a 15-minute idle timeout occurs」があり、縮小が即座でない点が抜けていた。最大15分のアイドル保持を追記 |
| 8 | L18 | ECS のように CloudWatch アラーム+スケーリングポリシーを組む必要がなく、設定不要で最初から動く | 未確認(Cloud Run 側は正しい) | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | Cloud Run 側は「autoscaling is enabled by default」相当の挙動で整合。AWS(ECS)側の比較は本タスクの対象外 |
| 9 | L22 | デフォルトの concurrency 80 だとなかなかスケールしない | 正しい | https://docs.cloud.google.com/run/docs/about-instance-autoscaling , https://docs.cloud.google.com/run/docs/about-concurrency | 同時50接続・concurrency 80・目標60%(=48並列/台)なら1〜2台にとどまる。本文の主張と整合 |
| 10 | L24-29 | `gcloud run services update handson-app --region ... --concurrency 10 --max-instances 10` の構文 | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update | 公式: `--concurrency` = 「Set the maximum number of concurrent requests allowed per container instance.」、`--max-instances` = 「The maximum number of container instances for this Revision to run」。どちらも現存 |
| 11 | L31 | この操作でも新しいリビジョンが作られる(リビジョン=イメージ+設定のスナップショット) | 正しい | https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update | 公式(`--max-instances`): 「This setting is immutably set on each new Revision and modifying its value will deploy another Revision.」`--concurrency` も `containerConcurrency`(RevisionSpec のフィールド)であり revision-level。なお service-level の `--min` / `--max` は「can be modified without deploying a new Revision」なので、`--max-instances`(revision-level)を使っている本文の記述は正しい |
| 12 | L35 | Cloud Shell には Node.js が入っている(外部ツールのダウンロード不要) | 正しい | https://docs.cloud.google.com/shell/docs/how-cloud-shell-works | プリインストール言語一覧に Node.js「LTS」が記載。`fetch` のグローバル提供とトップレベル await(`.mjs`)はいずれも現行LTS(18以降)で利用可能。`research/deep-research-report.md` が指摘していた `hey` の外部ダウンロード依存はすでに解消済み |
| 13 | L38-67 | `cat > ~/load.mjs <<'EOF'` によるスクリプト作成、`fetch` / トップレベル await の使用 | 正しい | https://docs.cloud.google.com/shell/docs/how-cloud-shell-works | Node.js LTS 前提で成立。実行そのものは未検証(Cloud Shell を起動していない) |
| 14 | L69 | `/heavy` は1秒かかる擬似的に重いエンドポイント | 正しい | (リポジトリ内 `code/app/src/index.ts` L71-74) | `await new Promise((resolve) => setTimeout(resolve, 1000))` を確認 |
| 15 | L71(旧) | 50接続なら概算で5台。「3台や6台になることもあります」 | 要修正 | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 目標値が60%(concurrency 10 なら実効6並列/台)であるため、50同時接続では 50÷6 ≒ 8〜9台と、**5台より多く**なる方向が主。「3台や6台」は実測より少ない側に期待値を寄せており、上限10台に張り付いた参加者が「自分の操作ミス」と誤解しうる。「式のうえでは5台。実際には8台前後や上限の10台まで立ち上がることもある」「台数は当てるものではなく観察するもの」へ書き換え |
| 16 | L73-77 | `gcloud run services describe handson-app --region ... --format 'value(status.url)'` でURLが取れる | 正しい | https://docs.cloud.google.com/run/docs/triggering/https-request | 公式ドキュメントでも同じ形式が案内されている |
| 17 | L83 | コンソールの「指標」タブで「コンテナ インスタンスの数」が見える | 正しい | https://docs.cloud.google.com/run/docs/monitoring | 組み込みメトリクス一覧に「Container instance count」があり、「click the **Metrics tab** in the Cloud Run console」と記載 |
| 18 | L83(旧) | インスタンス数が「数分後にまたゼロに戻っていく」 | 要修正 | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 公式: 「A second group of instances remains running until a 15-minute idle timeout occurs」「These extra instances are destroyed within 15 minutes after they become idle.」「数分後」は短すぎ、当日「ゼロに戻らない」と見える。「負荷を止めたあと十数分かけて」へ修正 |
| 19 | L83 | リクエスト数・レイテンシ・CPU使用率も設定なしで最初から揃っている | 正しい | https://docs.cloud.google.com/run/docs/monitoring | 組み込みメトリクスに「Request count」「Request latencies」「Container CPU utilization」がある |
| 20 | L83 | レイテンシは **p50/p95/p99** で見られる | 未確認 | https://docs.cloud.google.com/run/docs/monitoring | 公式のメトリクス一覧は「Request latencies」までで、パーセンタイル(50/95/99)の内訳に言及する記述が見つからなかった。コンソールUIの実表示は未確認のため本文は変更していない。実機(コンソール)確認の残件 |
| 21 | L85-89 | `/api` はインスタンスごとに違う `instance` ID を返す。`curl` + `jq` で集計できる | 正しい(Cloud Shell の `jq` は未確認) | (リポジトリ内 `code/app/src/index.ts` L62-68) | `instance: INSTANCE_ID` を返すことを確認。Cloud Shell への `jq` プリインストールは公式一覧に明記がなく未確認(6章の #11 と同じ残件) |
| 22 | L91(旧) | 「負荷が落ち着いた数分後」に1台(やがて0台)へ戻る | 要修正 | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | #18 と同根。「数分〜15分ほど待って」へ修正 |
| 23 | L100(旧) | 「10分ほど放置したあと」コールドスタートを計測できる | 要修正 | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 公式のアイドル保持は「up to 15 minutes」。10分では0台に戻っていない可能性が高く、差が出ないことを「失敗」と受け取られる。「最大15分アイドル保持されるため0台に戻るには15分以上」へ修正し、差が出ない場合の扱いを「詰まったら」に記載 |
| 24 | L107 | 1回目だけ遅い(このアプリは軽いので数百ms程度、重いアプリでは数秒〜) | 未確認(妥当) | https://docs.cloud.google.com/run/docs/tips/general | 公式: 「Because instances are scaled as needed, their startup time has impact on the latency of your service.」定性的には整合。具体的なms値は実測依存のため未確認。本文は「程度」と幅を持たせているので変更しない |
| 25 | L109-113 | `gcloud run services update handson-app --region ... --min-instances 1` で常時1台温める | 正しい | https://docs.cloud.google.com/run/docs/configuring/min-instances | 公式に `gcloud run services update SERVICE --min-instances MIN-VALUE` の構文があり、既定は「min-instances turned off, with a setting of 0」 |
| 26 | L115(旧) | min-instances を設定した分はアイドル時も課金される | 正しい(表現を補強) | https://docs.cloud.google.com/run/docs/configuring/min-instances | 公式: request-based billing では「you are billed at a lower rate when instances are idle and waiting to process requests」。課金される点は正しいので、低単価が適用される旨を括弧で補足した |
| 27 | L115(旧) | 最低台数の固定費を払えば「コールドスタートなし」 | 要修正 | https://docs.cloud.google.com/run/docs/configuring/min-instances | 公式: min-instances は「a best-effort target to keep instances warm and ready」であり、ゾーン容量枯渇・インフラ再配置・アプリのクラッシュ等でコールドスタートは起こりうる。「コールドスタートを起きにくくする」へ変更し、保証ではない旨を1文追記 |
| 28 | L117-123 | 確認後 `--min-instances 0` に戻せば課金を避けられる | 正しい | https://docs.cloud.google.com/run/docs/configuring/min-instances | 既定値0へ戻す操作。公式の構文どおり |
| 29 | L130(旧) | まとめ「スケールの基準は『同時リクエスト数 ÷ concurrency』」 | 要修正 | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | #1 と同根。基準(シグナル)と概算式を混同しているため「基準は同時リクエスト数とCPU使用率。台数は式で概算できる」へ分離 |
| 30 | L131(旧) | まとめ「スケールtoゼロ ⇔ コールドスタートはトレードオフ。min-instances で調整」 | 要修正(不足) | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 主張自体は正しい。最大15分のアイドル時間を括弧で補足した(#7/#18/#23 と整合させるため) |
| 31 | L132 | `max-instances` は暴走課金・下流(DB)保護の安全弁 | 正しい | https://docs.cloud.google.com/run/docs/about-instance-autoscaling | 公式(About maximum instances for services): 「for cost control reasons, or for better compatibility with other resources used by your service. For example, your Cloud Run service might interact with a database that can only handle a certain number of concurrent open connections.」および「Consider setting a maximum number of instances to avoid overloading backing services.」 |
| 32 | L94(新) | 復旧手順の `--format 'value(spec.template.spec.containerConcurrency)'` というフィールドパス | 正しい | https://docs.cloud.google.com/run/docs/reference/rest/v1/RevisionSpec , https://docs.cloud.google.com/run/docs/reference/rest/v1/RevisionTemplate , https://docs.cloud.google.com/run/docs/reference/rest/v1/namespaces.services | Admin API v1 で `Service.spec`(ServiceSpec)→ `template`(RevisionTemplate)→ `spec`(RevisionSpec)→ `containerConcurrency` の入れ子を確認。RevisionSpec の説明は「ContainerConcurrency specifies the maximum allowed in-flight (concurrent) requests per container instance of the Revision. If not specified or 0, defaults to 80 when requested CPU >= 1 and defaults to 1 when requested CPU < 1.」。`gcloud ... --format` での実出力は未実行のため未検証 |

## 修正した箇所

- L9: スケールのシグナルを「同時リクエスト数(concurrency)とCPU使用率」に修正(#1)
- L15: 目標値60%と、式より多めの台数になる方向性を追記(#3)
- L16: concurrency の既定値を vCPU依存として書き直し、上限1000を追記(#4、#5)
- L17: スケールtoゼロに「最大15分のアイドル保持」を追記(#7)
- L71: 予想台数の提示を「式では5台/実際は8台前後や上限10台もありうる/台数は観察対象」へ書き換え(#15)
- L83: 「数分後にゼロ」→「負荷を止めたあと十数分かけてゼロ」(#18)
- L91: 「数分後」→「数分〜15分ほど待って」(#22)
- L100: コールドスタート計測の待ち時間を「15分以上」に修正し、根拠(最大15分のアイドル保持)を明記(#23)
- L115: 「コールドスタートなし」→「起きにくくする」、min-instances がベストエフォートである旨とアイドル低単価を補足(#26、#27)
- L130-131: まとめのスケール基準と概算式を分離、15分のアイドル時間を補足(#29、#30)
- L93-94、L125-126: 参加者向け「成功していれば / 詰まったら」ブロックを2箇所追加(T030)。参加者環境に git リポジトリは存在しない前提で、ヒアドキュメントの再実行・環境変数の再export・冪等な `gcloud run services update` の再実行のみで復旧できる手順にした

## 実機確認が必要な残件

- コンソール「指標」タブのレイテンシがパーセンタイル(p50/p95/p99)表示かどうか(#20)
- Cloud Shell に `jq` が存在するか(#21、6章と共通)
- `gcloud run services describe --format 'value(spec.template.spec.containerConcurrency)'` の実出力(#32)
- 当日の実測インスタンス台数(#15 で示した「8台前後や上限の10台」の妥当性)
- コールドスタート1発目の実測レイテンシ(#24)
