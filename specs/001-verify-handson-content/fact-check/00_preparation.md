# Fact-check: 00_preparation/README.md

**確認日**: 2026-08-19

**対象タスク**: 00章の全技術的主張の一次情報照合 / T034(参加者向けレスキュー導線の追記)

**検証方法**: `research/deep-research-report.md`(二次情報)の指摘は根拠として採用せず、記載された出典URLを自分で取得して一次情報の本文で裏を取った。`cloud.google.com` は `docs.cloud.google.com` へ301リダイレクトするため、リダイレクト後のURLで取得している。WebFetch が本文を切り詰めるページ(Free Trial FAQ、Cloud Shell 割り当てと上限)は HTML を直接取得してテキスト化し、原文で確認した。UI ラベルは日本語版ドキュメント(`?hl=ja`)で確認した。AWS 側の主張は AWS 公式ドキュメントで確認した。

## 判定表

| # | location | claim | verdict | source_url | resolution |
|---|---|---|---|---|---|
| 1 | 用意するもの | 会社アカウントは Cloud Shell の利用がブロックされることがある | 要修正 | https://docs.cloud.google.com/shell/docs/resetting-cloud-shell | Cloud Shell の無効化は Resource Manager の「組織ポリシー」ではなく Google Admin コンソールの管理者設定(原文「go to the Google Admin console and then navigate to Apps > Additional Google services > Google Cloud Platform > Cloud Shell Settings and disable Cloud Shell Access Settings」)。「組織ポリシーによって Cloud Shell の利用や `--allow-unauthenticated` がブロックされる」という一括りの表現を、管理者設定(Cloud Shell)と組織ポリシー(公開設定)に分けて書き直した |
| 2 | 用意するもの | 組織ポリシーによって `--allow-unauthenticated`(全公開)がブロックされることがある | 正しい | https://docs.cloud.google.com/resource-manager/docs/organization-policy/restricting-domains | 原文「if you implement domain restricted sharing, then users outside of your organization won't be able to access public Cloud Run services」「If you need to share data publicly while using domain restricted sharing, then you need to add an exception for these principals(`allUsers` と `allAuthenticatedUsers`)」。#1 の書き換えで「組織ポリシー(ドメイン制限共有)」として残した |
| 3 | 用意するもの | クレジットカードは課金の有効化に必要 | 正しい | https://cloud.google.com/signup-faqs | 変更なし。原文「During signup, we ask for your name, address, and payment method to verify your identity」。有料化しない限り課金されない点(原文「you won't be charged unless you manually upgrade to a paid account」)とも矛盾しない範囲の記述 |
| 4 | 用意するもの | シークレットモードやサードパーティCookieのブロックで Cloud Shell エディタが開けないことがある | 正しい | https://docs.cloud.google.com/shell/docs/quotas-limits?hl=ja | 変更なし。原文「サードパーティの Cookie が無効になっていると、Cloud Shell エディタは Cloud Shell に読み込めません」「ほとんどのブラウザのシークレット モードやプライベート ブラウザ モードでも Cookie がブロックされます」 |
| 5 | 用意するもの | 手元のPCへのインストールは一切不要(すべて Cloud Shell で完結) | 正しい | https://docs.cloud.google.com/shell/docs/how-cloud-shell-works | 変更なし。Cloud Shell はブラウザから使う VM で、gcloud CLI・Docker・npm 等がプリインストールされている(原文「Cloud Shell always comes with the latest versions of the gcloud CLI, Docker, and other utilities」) |
| 6 | 1. プロジェクトを作る | 無料トライアルは90日 / $300 クレジット | 正しい | https://cloud.google.com/signup-faqs | 変更なし。原文「The Google Cloud Free Trial is a 90-day program」「preloaded with $300 in free Welcome credit which is valid for 90 days」 |
| 7 | 1. プロジェクトを作る | Google Cloud ではプロジェクトが課金・リソースの分離単位 | 正しい | https://cloud.google.com/signup-faqs | 変更なし。Free Trial が「Free Trial billing account」を作りプロジェクトへ紐付ける構造と整合。プロジェクトが分離単位という記述は Resource Manager の階層(組織 → フォルダ → プロジェクト)と一致する |
| 8 | 1. プロジェクトを作る | プロジェクトIDは自動でユニークになる | 未確認 | — | コンソールUIの挙動(プロジェクト名から一意なIDを自動生成する提案)を一次情報の原文で確認できなかった。gcloud/コンソールを実行しない制約下では検証できないため未確認とし、本文は変更していない。**2026-08-19 T026: 未確認のまま残す(カテゴリB: コンソールUI)**。実機検証は既存プロジェクト `sandbox-360407` を使い、プロジェクト新規作成をコンソールで行っていない(ヘッドレス環境のためコンソールの目視自体が未実施。`live-main-path.md` #43) |
| 9 | 2. Cloud Shell | Cloud Shell は Google Cloud が無料で使える | 正しい | https://docs.cloud.google.com/free/docs/free-cloud-features | 変更なし(表現を「無料で提供する」→「無料で使える」に統一)。原文「Cloud Shell — Free access to Cloud Shell, including 5 GB of persistent disk storage」 |
| 10 | 2. Cloud Shell | ブラウザで動くコードエディタが最初から使える | 正しい | https://docs.cloud.google.com/shell/docs/quotas-limits | 変更なし(ただし #11 の対比表現は修正)。Cloud Shell エディタは標準機能で、原文は「Cloud Shell Editor does not support the installation of custom editor extensions. However, the Cloud Shell Editor comes with a set of essential extensions already installed」 |
| 11 | 2. Cloud Shell | ブラウザで動くコードエディタは AWS CloudShell にはない | 要修正 | https://aws.amazon.com/about-aws/whats-new/2026/08/aws-cloudshell-visual-file-editor/ | **事実誤り**。2026年8月17日に AWS CloudShell へ組み込みのビジュアルエディタが追加された(原文「AWS CloudShell now includes a built-in visual file editor that you can launch directly from your shell session using a single 'edit' command, no setup required」)。`docs.aws.amazon.com/cloudshell/latest/userguide/vm-specs.html` のプリインストール一覧にも `edit` が載る。「AWS CloudShell にはない」を削除し、注記で AWS 側の現状(`edit` コマンド)に触れる形へ書き換えた |
| 12 | 2. Cloud Shell | Docker デーモンは AWS CloudShell では使えない | 要修正 | https://docs.aws.amazon.com/cloudshell/latest/userguide/vm-specs.html | **事実誤り**。プリインストール一覧に Docker があり、原文は「It enables you to build Dockerfiles inside AWS CloudShell, and build Docker assets with CDK」。「AWS CloudShell では使えない」を削除し、AWS 側の実際の制約(永続ストレージ1GB、Docker の対応リージョンに制限あり)を注記に書き換えた |
| 13 | 2. Cloud Shell | AWS CloudShell の永続ストレージは1GB | 正しい | https://docs.aws.amazon.com/cloudshell/latest/userguide/vm-specs.html | #12 の書き換えで新規に追記。原文「1-GB persistent storage (storage persists after the session ends)」 |
| 14 | 2. Cloud Shell | AWS CloudShell の Docker は対応リージョンに制限がある | 正しい | https://docs.aws.amazon.com/cloudshell/latest/userguide/vm-specs.html | #12 の書き換えで新規に追記。原文「For information about which AWS Regions are supported with Docker, see Supported AWS Regions for AWS CloudShell」と、リージョン依存があること自体は公式が明示している。ただし**具体的なリージョン一覧は参照先ページが外部リンクのみで、一覧の原文は確認できていない**ため、本文でも「制限があります」までに留めた |
| 15 | 2. Cloud Shell | Cloud Shell に Docker が最初から入っている | 正しい | https://docs.cloud.google.com/shell/docs/how-cloud-shell-works | 変更なし(表現のみ「Docker デーモン」→「Docker」)。原文「Cloud Shell always comes with the latest versions of the gcloud CLI, Docker, and other utilities」、および「Additional tools: Docker」 |
| 16 | 2. Cloud Shell | `gcloud` CLI が認証済みで使える | 正しい | https://docs.cloud.google.com/shell/docs/how-cloud-shell-works | 変更なし。gcloud CLI がプリインストールされ、Cloud Shell はユーザー資格情報で認証された状態で起動する |
| 17 | 2. Cloud Shell | 5GB の永続ホームディレクトリ | 正しい | https://docs.cloud.google.com/shell/docs/quotas-limits | 変更なし。原文「Cloud Shell provisions 5 GB of free persistent disk storage mounted as your `$HOME` directory」 |
| 18 | 2. Cloud Shell | 永続するのは `$HOME` だけで、それ以外の変更はセッション終了で失われる | 正しい | https://docs.cloud.google.com/shell/docs/quotas-limits?hl=ja | 新規に追記。原文「インスタンスが終了すると、$HOME ディレクトリ以外で行った変更はすべて失われます」 |
| 19 | 2. Cloud Shell | 週あたりの利用時間クォータのデフォルトは50時間 | 正しい | https://docs.cloud.google.com/shell/docs/quotas-limits | 変更なし。原文「The default weekly Cloud Shell quota is 50 hours」 |
| 20 | 2. Cloud Shell | クォータを使い切ると当日その場での回避策がほぼない | 正しい | https://docs.cloud.google.com/shell/docs/quotas-limits?hl=ja | 「リセット時刻まで一切使えません」と明示する形へ補強。原文「割り当てに達した場合は、指定された日時まで待ってから、Cloud Shell を再び使用するか、Cloud Workstations にアップグレードする必要があります」 |
| 21 | 2. Cloud Shell | 残りクォータの確認手順は「ターミナル右上のメニュー →『使用状況の割り当て』」 | 要修正 | https://docs.cloud.google.com/shell/docs/quotas-limits?hl=ja | UI ラベルと経路が不正確。日本語版の原文は「[セッション情報] をクリックし、[使用量の割り当て] をクリックします。ダイアログが開き、割り当ての残り時間、割り当ての合計時間数、割り当てのリセット日時が表示されます」。`[セッション情報]→[使用量の割り当て]` に修正し、ダイアログの表示内容も補った |
| 22 | 3. API有効化 | `gcloud config set project` でプロジェクトを設定する | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 変更なし。Cloud Run のクイックスタート類で標準的に案内されている設定手順と一致 |
| 23 | 3. API有効化 | `run.googleapis.com` を有効化する必要がある | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 変更なし。原文「Enable the Cloud Run Admin API」(= `run.googleapis.com`) |
| 24 | 3. API有効化 | `cloudbuild.googleapis.com` を有効化する必要がある | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 変更なし。`--source` デプロイのビルド経路で「Enable the Cloud Build API」が要求される(9章で使用) |
| 25 | 3. API有効化 | `artifactregistry.googleapis.com` を有効化する必要がある | 正しい | (リポジトリ内実測) | 変更なし。`04_deploy/README.md` が `gcloud artifacts repositories create` と `${REGION}-docker.pkg.dev` への `docker push` を行い、同章の「詰まったら」も `gcloud services enable artifactregistry.googleapis.com run.googleapis.com` を案内しているため必須。API名も同章の本文と一致 |
| 26 | 3. API有効化 | `pubsub.googleapis.com` を有効化する必要がある | 正しい | https://docs.cloud.google.com/pubsub/docs/push | 変更なし。発展編(`10_advanced/pubsub.md`)で push サブスクリプションを作るため必要 |
| 27 | 3. API有効化 | `cloudscheduler.googleapis.com` が有効化リストに含まれている | 正しい | (リポジトリ内実測) | 変更なし。`00_preparation/README.md` の `gcloud services enable` に既に含まれていることを再確認した(deep-research-report が「欠けている」と指摘した状態は既に解消済み)。発展編 `10_advanced/jobs.md` で Cloud Scheduler を使うため必要 |
| 28 | 3. API有効化 | 上記5つで教材の範囲をカバーできる | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 変更なし。教材内の `gcloud` は run / artifacts / builds(`--source`)/ pubsub / scheduler / logging / iam に限られる。`storage.googleapis.com` は公式が「deploy without build」の経路でのみ要求しており(原文「Enable the Cloud Run and Cloud Storage APIs」)、教材はビルド経路のみを使うため不要。Cloud Logging / IAM は新規プロジェクトで既定有効のため列挙不要 |
| 29 | 3. API有効化 | Google Cloud では各サービスのAPIを明示的に有効化してから使う | 正しい | https://docs.cloud.google.com/run/docs/deploying-source-code | 変更なし。各プロダクトの「Before you begin」が API 有効化を前提手順として要求している構造と一致 |
| 30 | 4. 動作確認 | Cloud Shell で `docker version` がエラーにならない | 正しい | https://docs.cloud.google.com/shell/docs/how-cloud-shell-works | 変更なし。Docker がプリインストールされている(#15)ため成立 |
| 31 | トラブルシューティング | 課金アカウント未紐付けだと `gcloud services enable` が課金エラーになる | 未確認 | — | 課金アカウント未紐付けプロジェクトでの `services enable` の**エラー文言・失敗すること自体**を明記した一次情報を特定できなかった。gcloud を実行しない制約下では実測もできないため未確認とし、本文は変更していない(対処手順「課金ページから紐付ける」自体は妥当)。**2026-08-19 T026: 未確認のまま残す(カテゴリD)**。実機検証は課金アカウント紐付け済みのプロジェクトで行ったため、この失敗ケースは再現していない。再現には課金アカウント未紐付けのプロジェクトを新規作成する必要があり、許可されたリソース範囲外 |
| 32 | トラブルシューティング | エディタが開かないときは通常モードで開き直す / 新しいウィンドウで開く | 正しい | https://docs.cloud.google.com/shell/docs/quotas-limits?hl=ja | 変更なし。原文「サードパーティの Cookie が無効になっていても、エディタ セッションを開いたときに [新しいウィンドウで開く] ボタンをクリックすると、別のウィンドウで Cloud Shell エディタを使用できます」 |
| 33 | トラブルシューティング | `--allow-unauthenticated` の権限エラーは組織ポリシー(ドメイン制限共有)が原因の可能性が高い | 正しい | https://docs.cloud.google.com/resource-manager/docs/organization-policy/restricting-domains | 変更なし。#2 と同じ根拠 |
| 34 | トラブルシューティング | IAM の変更は反映まで数分かかることがあるので1〜2分待ってリトライ | 要修正 | https://docs.cloud.google.com/iam/docs/access-change-propagation | 待ち時間が過小。原文はポリシー変更の反映を「Typically 2 minutes, potentially 7 minutes or longer」とする。「通常2分程度、場合によっては7分以上」「数分待ってからリトライ」へ修正した |
| 35 | 復旧ブロック | Cloud Shell が切断されてもホームディレクトリのファイルは残る | 正しい | https://docs.cloud.google.com/shell/docs/quotas-limits?hl=ja | 「失われるのは `export` した環境変数だけ」と明示する形へ補強。原文「インスタンスが終了すると、$HOME ディレクトリ以外で行った変更はすべて失われます」= `$HOME` 配下は残る |
| 36 | 復旧ブロック | `export PROJECT_ID=$(gcloud config get-value project)` などで作業状態を復元できる | 正しい | https://docs.cloud.google.com/shell/docs/quotas-limits?hl=ja | 変更なし。環境変数はセッション終了で失われるため再設定が必要という前提と整合。4章「0. 環境変数の準備」と同じ変数定義であることをリポジトリ内で確認した |
| 37 | 復旧ブロック(T034) | 4章以降の各手順の末尾に「成功していれば」「詰まったら」がある | 正しい | (リポジトリ内実測) | T034 で新規に追記。`rg` で `04_deploy` `05_revision` `06_traffic` `07_scaling` `08_observability` `09_source_deploy` `10_advanced/{jobs,pubsub,websocket}.md` に両ブロックが存在することを確認した(2章・3章には無いため「4章以降」と限定して書いた) |
| 38 | 復旧ブロック(T034) | 「詰まったら」には前提状態を再現するコピペ用コマンドがある | 正しい | (リポジトリ内実測) | T034 で新規に追記。例: `04_deploy/README.md` の「`echo ${IMAGE}` が空、または `-docker.pkg.dev//` のように途中が抜けている場合は「0. 環境変数の準備」を再実行してください」など、各章が復旧手順を含むことを確認した |
| 39 | 復旧ブロック(T034) | 教材のコマンドは何度実行しても同じ結果になる(`ALREADY_EXISTS` はそのまま次へ) | 正しい | (リポジトリ内実測) | T034 で新規に追記。`10_advanced/jobs.md`「サービスアカウントと IAM 付与のコマンドは何度実行しても同じ結果になるので(`ALREADY_EXISTS` はそのまま次へ)」、`05_revision/README.md`「何度実行しても同じ結果になる冪等なコマンドです」と本文の記述に一致 |
| 40 | 復旧ブロック(T034) | 発展編は自分の環境で動かなくても講師の画面で先へ進んでよい | 正しい | (リポジトリ内実測) | T034 で新規に追記。`10_advanced/websocket.md`「自分のデプロイがうまくいかないときは、講師が画面に映しているURLで体験に参加してください」、`10_advanced/jobs.md`「この節は本編の内容ではないので、うまくいかなければコンソールの GUI 設定を見るだけにして次へ進んで構いません」に一致 |
| 41 | 復旧ブロック(T034) | 参加者は git を使わないため、git による復旧はできない | 正しい | (リポジトリ内実測) | T034 で新規に追記。`02_docker/README.md` の手順は `mkdir -p ~/cloudrun-handson/app/src` から4ファイルをエディタで手作成する流れで、clone も `git init` も指示していないことを確認した。したがって `git reset --hard` 等は参加者環境では実行不能であり、復旧導線はコピペブロックのみで構成した |

## 確認したが本文に追加していない(参考)

規約により「既存記述の正確性修正」と T034 の追記に範囲を限定したため、以下は確認したうえで本文へは入れていない。

- Cloud Shell の非対話型セッションは40分、セッション全体は最大12時間で終了する(quotas-limits)。2〜3時間のイベントでは影響しない
- `$HOME` は120日アクセスがないと自動削除される(quotas-limits)。事前準備から当日までの期間では影響しない
- Chrome ではアドレスバーのサードパーティCookieブロックアイコンから[Cookie を許可]で回避できる(quotas-limits)。既存のトラブルシューティングで足りると判断した
- 18歳未満または年齢不明のユーザーは Cloud Shell を使えず、Google Workspace for Education は既定でブロックされる(quotas-limits)
- Free Trial 終了後も30日以内なら有料アカウントへのアップグレードでリソースを復旧できる(signup-faqs)

## 集計

- 正しい: 34件(2026-08-19 T026 で判定表の行を機械的に数え直した結果。旧記載は36件だったが、判定表の実行数は41行で 34 + 5 + 2 = 41 が正しい)
- 要修正: 5件(#1, #11, #12, #21, #34)
- 未確認: 2件(#8 カテゴリB / #31 カテゴリD。2026-08-19 T026 の棚卸しでも実機記録から確定できず据え置き)

2026-08-19 T026 の補足: `live-main-path.md`「最重要の結論」により、#33 が想定していた組織ポリシー(ドメイン制限共有)による `--allow-unauthenticated` のブロックは検証プロジェクトでは発生せず、`allUsers` への IAM 付与が `Setting IAM Policy.............done` で成功することを確認した(#33 の判定は「正しい」のまま。組織ポリシーが設定された環境で起きうる事象という位置づけは維持)。

## 本文への変更

1. 「用意するもの」の Google アカウント項: Cloud Shell の無効化は管理者設定、`--allow-unauthenticated` のブロックは組織ポリシー(ドメイン制限共有)と分けて記述(#1)
2. 「2. Cloud Shell エディタを開く」の特徴リスト: AWS CloudShell に対する「エディタがない」「Docker が使えない」という2つの誤りを削除し、AWS 側の現状(`edit` コマンド、永続1GB、Docker のリージョン制限)を注記へ置き換え。`$HOME` のみ永続である点も明記(#11, #12, #13, #14, #18)
3. クォータ確認手順を `[セッション情報]→[使用量の割り当て]` に修正し、リセットまで使えない旨とダイアログの表示内容を補足(#20, #21)
4. IAM 反映待ちを「通常2分程度、場合によっては7分以上」に修正(#34)
5. 復旧ブロックに「途中で分からなくなったら」を新設し、git を前提としない5段階の復帰導線を追記(T034 / #37〜#41)
