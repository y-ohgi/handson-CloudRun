# 実機検証: 本編4〜8章 + Pub/Sub

**実行日**: 2026-08-19
**環境**: sandbox-360407(プロジェクト番号 113111026602)/ asia-northeast1 / ローカルDocker(arm64、`--platform linux/amd64` でビルド)/ Google Cloud SDK 501.0.0

4章から8章と `10_advanced/pubsub.md` の手順を上から順に実行し、教材の記述と実際の出力・挙動を突き合わせた。作成したリソースはすべて削除済み(末尾「後片付けの結果」参照)。

## 最重要の結論

- **`--allow-unauthenticated` は再デプロイで維持される。** 4章でフラグ付きデプロイ後、5章でフラグを付けずに再デプロイしても公開URLは 200 を返し続けた。IAM の `allUsers` → `roles/run.invoker` バインディングはサービスに残り、その後の `services update`(concurrency / max-instances / min-instances)や `update-traffic` を6リビジョン分繰り返しても消えなかった。**5章に追加の対処は不要。**
- **組織ポリシーによる拒否はなかった。** `allUsers` への IAM 付与は成功し(`Setting IAM Policy.............done`)、ドメイン制限共有ポリシーによるエラーは一切出なかった。
- **`jq` / `curl` はどちらも利用可能。**(jq-1.7.1 / curl 8.7.1)

## 検証結果

| # | 章 | 検証項目 | 教材の記述 | 実際の結果 | 判定 | 対応 |
|---|---|---|---|---|---|---|
| 1 | 04 L35 | AR リポジトリ作成の出力 | `Created repository [handson].` | `Created repository [handson].` | 一致 | なし |
| 2 | 04 L35 | `repositories list` に `handson` が1行 | `handson` が1行表示 | `handson  DOCKER  STANDARD_REPOSITORY  Cloud Run handson  asia-northeast1 ...` の1行 | 一致 | なし |
| 3 | 04 L35 | 認証ヘルパー設定の出力 | `Docker configuration file updated.` のようなメッセージ | 既に設定済みだったため `gcloud credential helpers already registered correctly.` | 一致 | 教材は「のようなメッセージ」とヘッジ済み。初回実行時の文言は未確認 |
| 4 | 04 L56 | `docker push` の最終行 | `v1: digest: sha256:... size: ...` | `v1: digest: sha256:a1721194773f1662d98cb216879db58dc784a6dd51c584d176531d12185e39c1 size: 2199` | 一致 | なし |
| 5 | 04 L56 | `artifacts docker images list` に1行 | `.../handson/app` の行が1つ | `asia-northeast1-docker.pkg.dev/sandbox-360407/handson/app  sha256:a172...  ...` の1行 | 一致 | なし |
| 6 | 04 L75 | デプロイ成功時の文言 | `Service [handson-app] revision [handson-app-00001-xxx] has been deployed and is serving 100 percent of traffic.` | `Service [handson-app] revision [handson-app-00001-bvd] has been deployed and is serving 100 percent of traffic.` | 一致 | なし |
| 7 | 04 L73/L75 | Service URL の形式 | `https://handson-app-<プロジェクト番号>.asia-northeast1.run.app` | `Service URL: https://handson-app-113111026602.asia-northeast1.run.app` | 一致 | なし |
| 8 | 04 L75 | `describe --format 'value(status.url)'` で同じ形式のURLが取れる | 「`サービス名-プロジェクト番号.リージョン.run.app` という決まった形式なので、あとから describe で取り直せます」 | `describe --format 'value(status.url)'` は**旧形式**の `https://handson-app-nv5rboaedq-an.a.run.app` を返す。既定書式の `describe` の `URL:` 行と `run deploy` の出力は決定的形式。`metadata.annotations."run.googleapis.com/urls"` に両方が入っており、どちらのURLも 200 を返す | 不一致(修正した) | 04章 L75 に「`describe` は古い形式の URL を返すが、どちらも同じサービスを指す有効な URL」である旨を追記 |
| 9 | 04 L84 | リビジョン名の形式 | `handson-app-00001-xxx` | `handson-app-00001-bvd`(サフィックスは英小文字3文字) | 一致 | なし |
| 10 | 04 L84 | HTML に Service / Revision / Instance が出る | `K_SERVICE` / `K_REVISION` をアプリが表示 | `<tr><td>Service</td><td>handson-app</td></tr>` `<tr><td>Revision</td><td>handson-app-00006-vn9</td></tr>` `<tr><td>Instance</td><td>fe35f111</td></tr>` | 一致 | なし |
| 11 | **05 L28** | **2回目以降は `--allow-unauthenticated` を繰り返さなくてもサービス設定が維持される** | 「サービスの設定は維持され、変更したもの(イメージ)だけが新しいリビジョンとして記録されます」 | **フラグなし再デプロイ後も公開URLは `status=200`。`get-iam-policy` は `allUsers` / `roles/run.invoker` を保持。出力に `Setting IAM Policy` の行は出ず、IAM は触られない** | 一致 | なし(当日の致命的問題は存在しない) |
| 12 | 05 L32 | 2回目デプロイの文言 | `revision [handson-app-00002-xxx] has been deployed and is serving 100 percent of traffic.` | `Service [handson-app] revision [handson-app-00002-vjk] has been deployed and is serving 100 percent of traffic.` | 一致 | なし |
| 13 | 05 L32 | `revisions list` の行が2つ | 2行 | `handson-app-00002-vjk` / `handson-app-00001-bvd` の2行 | 一致 | なし |
| 14 | 05 L69 | ロールバック時のトラフィック表示 | `100% handson-app-00001-xxx` | `Traffic:` の下に `  100% handson-app-00001-bvd` | 一致 | なし |
| 15 | 05 L69 | ロールバック後に v1 が返る | 画面が青(v1)に戻る | `{"message":"Hello, Cloud Run!","revision":"handson-app-00001-bvd",...}` | 一致 | なし |
| 16 | 05 L84 | `--to-latest` 後のトラフィック表示 | `100% LATEST (currently handson-app-00002-xxx)` | `  100% LATEST (currently handson-app-00002-vjk)` | 一致 | なし |
| 17 | 06 L36-39 | `--no-traffic --tag` デプロイで**2つ**のURLが表示される | 「出力に2つのURLが表示されます」(本番URL + タグ付きURL) | **タグ付きURLの1つだけ。** `Service [handson-app] revision [handson-app-00005-dar] has been deployed and is serving 0 percent of traffic.` の次行に `The revision can be reached directly at https://staging---handson-app-nv5rboaedq-an.a.run.app` のみ。`Service URL:` の行は出ない | 不一致(修正した) | 06章 L36 を「タグ付きURLが表示される(`--no-traffic` のときは `Service URL:` の行は出ません)。本番URLは4〜5章で使ってきたものと同じ」に修正。URL 例の表記も実測形式へ更新 |
| 18 | 06 L43 | 成功時の2つの文言 | `serving 0 percent of traffic` と `The revision can be reached directly at https://staging---...` | どちらもそのまま出力された | 一致 | なし |
| 19 | 06 L43 | 本番=赤(v2)、タグ付き=緑(v3) | 本番は赤のまま、タグ付きが緑 | 本番 `Hello, Cloud Run v2!` / タグ付き `Hello, Cloud Run v3!` | 一致 | なし |
| 20 | **06 L85** | **3つ目のリビジョンが `handson-app-00003-xxx` になる** | `100% LATEST (currently handson-app-00003-xxx)` | **`handson-app-00005-dar`。** リビジョン番号は連番にならない。教材の手順どおりに進めると 00001 → 00002 →(`update-traffic` ×2)→ **00005** となる。さらに `services update` で作られるリビジョンは 00004 → 00005 → 00006 と番号が前後し、**同じ番号(00005)が別サフィックスで2つ**存在する状態にもなった(観測: `00001-bvd` / `00002-vjk` / `00005-dar` / `00004-bl6` / `00005-qwm` / `00006-vn9`) | 不一致(修正した) | 06章 L43 に「リビジョン名の連番は 00003 にならないことがある」旨を追記し、L85 の番号を `000xx-xxx` に一般化。番号採番の内部ルールは未確認 |
| 21 | 06 L70 | カナリア時の Traffic 欄 | 「`90%` と `10% (tag: staging)` の2行」 | 3行構成。`  90% handson-app-00002-vjk` / `  10% handson-app-00005-dar` / `        staging: https://staging---handson-app-nv5rboaedq-an.a.run.app` | 不一致(修正した) | 06章 L70 を実際の表示に合わせて修正 |
| 22 | 06 L64/L70 | 20回集計で v3 が数回混ざる | おおよそ v2 が18回・v3 が2回 | `18 Hello, Cloud Run v2!` / `2 Hello, Cloud Run v3!`(教材の予想と完全一致) | 一致 | なし |
| 23 | **06 L85** | **`--to-latest` 後の Traffic 欄が1行だけになる** | 「Traffic 欄が `100% LATEST (...)` の1行だけになり」 | **4行になる。**`staging` タグが残るため `  0%   (currently -) handson-app-00005-dar` / `staging (Adding):` / `  100%  LATEST (currently handson-app-00005-dar)` / `staging (Deleting): https://staging---...` と表示される。`spec.traffic` は `latestRevision:true percent:100` と `revisionName:00005-dar tag:staging`(percent なし)の2要素で、実際のトラフィックは100%最新リビジョン。20回集計は20回すべて v3 | 不一致(修正した) | 06章 L85 を実際の表示に合わせて修正し、「表示上の見え方でトラフィックは100%最新リビジョン」と明記 |
| 24 | 07 L28 | concurrency / max-instances 更新で新リビジョン | 「この操作でも新しいリビジョンが作られます」 | `Service [handson-app] revision [handson-app-00004-bl6] has been deployed and is serving 100 percent of traffic.` | 一致 | なし |
| 25 | 07 L16 | 既定 concurrency は 80 | 1 vCPU構成なら既定80 | 更新前の `describe` が `Concurrency: 80` / `CPU: 1000m` | 一致 | なし |
| 26 | 07 L94 | concurrency 確認コマンド | `--format 'value(spec.template.spec.containerConcurrency)'` が `10` を返す | `10` | 一致 | なし |
| 27 | **07 L71/L93** | **concurrency 10 + 50接続でのインスタンス数** | 「5台より多く、8台前後や上限の10台まで立ち上がることもあります」 | **上限の10台まで到達。**Cloud Monitoring の `run.googleapis.com/container/instance_count`(リビジョン `handson-app-00004-bl6`)のピークは `active=9` + `idle=1` = **10台**(`max-instances 10` の上限に張り付いた)。負荷停止1分後は active=2 + idle=6 = 8台、2分後は idle=8 | 一致 | なし(教材の記述は実測と整合) |
| 28 | 07 L93 | 負荷試験スクリプトの結果 | `done: success=<数百〜数千> failure=0` | `done: success=1415 failure=0` | 一致 | なし |
| 29 | 07 L93 | `/api` の instance ID が2つ以上 | 2つ以上の instance ID が並ぶ | 3回のサンプリング(30/40/40回)で計 **8種類** の instance ID を観測(`09e9e40e` `5b2d9db5` `6d65bafd` `806f29c0` `8a1c0239` `8f5ea067` `b10d50ce` `f3cd029f`) | 一致 | なし |
| 30 | 07 L107/L125 | コールドスタート時の応答時間 | 「このアプリは軽いので**数百ms程度**」「1回目が数百ms、2回目は数十ms程度」 | **16分アイドル後の1回目は `1.454798s`**、2回目 `0.043257s` / 3回目 `0.052684s`。数百msではなく**1秒を超える**。温まった状態では差が出ない(`0.057146s` / `0.044170s`)ことも確認 | 不一致(修正した) | 07章 L107 を「0台の状態からだと1秒〜1.5秒ほど」、L125 を「1回目が1秒〜1.5秒、2回目は数十ms程度」に修正。詳細は下記「コールドスタートの追試」 |
| 31 | 07 L125 | `--min-instances` 更新で新リビジョン | 「どちらも新しいリビジョン名を出力して完了」 | `--min-instances 1` → `handson-app-00005-qwm`、`--min-instances 0` → `handson-app-00006-vn9`。`revisions list` の行も増えた | 一致 | なし |
| 32 | 07 L119-123 | min-instances を 0 に戻せる | 課金を避けるため戻す | 実行済み。`spec.template.metadata.annotations` から `autoscaling.knative.dev/minScale` が消え、`maxScale: '10'` のみが残った | 一致 | なし |
| 33 | 08 L15 | `gcloud run services logs read` の出力 | 「`{"severity":"INFO","message":"index accessed",...}` のような行が、これまでのアクセス分だけ並びます」 | **1行JSONは表示されない。**このコマンドはログ本文を `textPayload` としてしか読まないため、`jsonPayload` を持つ `index accessed` のエントリは**時刻だけの空行**になる(gcloud 581.0.0 で実測: `2026-08-19 09:28:58 $`)。表示されるのはリクエストログ(`GET 200 https://.../`)と `textPayload` の行(`listening on port 8080` など) | 不一致(修正した) | 08章 L18 の成功条件を実際の見え方に修正し、JSON の中身を CLI で見る手段として `gcloud logging read ... --format 'yaml(timestamp,severity,jsonPayload)'` を追記 |
| 34 | 08 L10/L40 | 1行JSONが構造化ログとして解釈される | `jsonPayload.message="index accessed"` で絞り込める | `gcloud logging read` で `jsonPayload: {instance: fe35f111, message: index accessed}` / `severity: INFO` を取得。クエリで絞り込めることを確認 | 一致 | なし |
| 35 | 08 L10 | (補足)追加フィールドの有無で記録形式が変わる | (記述なし) | `log("INFO", msg, {instance})` のように**追加フィールドがある**エントリは `jsonPayload` になるが、`log("INFO", msg)` のみのエントリ(`listening on port 8080`、`Pub/Sub message received: ...`)は `textPayload` として記録される | 不一致(修正した) | 10-1 の該当記述のみ修正(下記 #40)。08章の L10 は `index accessed` を例にしており記述自体は正しいため変更せず |
| 36 | 08 L52-56 | 「指標」タブに揃うメトリクス | リクエスト数/レイテンシ/インスタンス数/CPU・メモリ | Cloud Monitoring API 経由で `run.googleapis.com/container/instance_count` が `state`(active/idle)・`revision_name` ラベル付きで取得できることを確認。コンソール画面自体は未確認 | 一致(部分) | なし。コンソールUIの表示は未実施 |
| 37 | 10-1 L40 | トピック作成の出力 | `Created topic [projects/.../topics/handson-topic].` | `Created topic [projects/sandbox-360407/topics/handson-topic].` | 一致 | なし |
| 38 | 10-1 L40 | サブスクリプション作成の出力 | `Created subscription [projects/.../subscriptions/handson-sub].` | `Created subscription [projects/sandbox-360407/subscriptions/handson-sub].` | 一致 | なし |
| 39 | 10-1 L57 | publish の出力 | `messageIds:` を返す | `messageIds:` / `- '21370077283260424'` | 一致 | なし |
| 40 | 10-1 L55/L57 | 認証なし push が届き、ログに出る | 数秒後のログに `Pub/Sub message received: Hello from Pub/Sub` の1行 | **届いた。**リクエストログに `POST 204 https://handson-app-nv5rboaedq-an.a.run.app/pubsub`、stdout に `textPayload: 'Pub/Sub message received: Hello from Pub/Sub'`(severity INFO)。publish から約20秒でログ反映。`gcloud run services logs read` でも `2026-08-19 09:27:38 Pub/Sub message received: Hello from Pub/Sub` として表示された | 一致 | L55 の「構造化ログとして届いている」のみ不正確だったため、「severity `INFO` のログとして届いている(追加フィールドを持たないため `jsonPayload` ではなく本文だけのログとして記録される)」に修正 |
| 41 | 10-1 L72 | Pub/Sub サービスエージェントの形式 | `service-<プロジェクト番号>@gcp-sa-pubsub.iam.gserviceaccount.com` | プロジェクトIAMポリシーに `serviceAccount:service-113111026602@gcp-sa-pubsub.iam.gserviceaccount.com` が存在(read-only で確認) | 一致 | なし |
| 42 | 10-1 L66-73 | 認証付き push(`--push-auth-service-account` + `roles/iam.serviceAccountTokenCreator`) | 本番向けの補足として記述 | 未実施 | 未実施 | サービスアカウントの新規作成とプロジェクトIAMの変更が必要で、許可されたリソース範囲(AR `handson` / Cloud Run `handson-app` / トピック `handson-topic` / サブスクリプション `handson-sub`)を超えるため見送った。該当節はコマンド手順ではなく説明文であり、成功条件の提示もない |
| 43 | 04-08 | ブラウザでの目視確認 | 青→赤→緑の画面、コンソールの各タブ | 未実施(HTTP レスポンスの `background: #34A853` / `<h1>Hello, Cloud Run v3!</h1>` までは curl で確認) | 未実施 | ヘッドレス環境のためブラウザとコンソールUIの目視は行っていない |
| 44 | 07 L17/L100 | 15分以上放置で0台に戻る | 「最大15分ほどインスタンスがアイドルのまま残る」 | 最後のリクエスト(09:30:16Z)から**13分以上経ってもアイドルのまま1台残っていた**(09:44 時点で `instance_count` = 1)。16分後には0台まで縮小し、コールドスタートが発生した | 一致 | なし。詳細は下記「コールドスタートの追試」 |

## 検証環境固有の事象(教材の不具合ではない)

- **`gcloud run services logs read` が SDK 501.0.0 でクラッシュする。** 取得範囲に `jsonPayload` 形式の stdout エントリが含まれると `ERROR: gcloud crashed (TypeError): sequence item 1: expected str instance, NoneType found` で必ず落ちる(`--limit 20` / `--limit 50` で再現)。原因は `api_lib/logging/formatter.py` の `GetAttributeFieldFromLog()` が `getattr(..., '')` を使っており、`textPayload` が `None` のまま `' '.join()` に渡されるため。**現行 SDK では `getattr(..., None) or ''` に修正済みで、SDK 581.0.0 の実バイナリで同じコマンドを実行したところクラッシュしなかった**(修正は 551.0.0 で導入)。Cloud Shell は最新の gcloud を持つため参加者環境では再現しない見込み。**この件で教材は書き換えていない。**
- `docker build` に `--platform linux/amd64` が必要(検証マシンが arm64)。Cloud Shell は amd64 なので教材の不具合ではない。教材は書き換えていない。
- 表 #33 の「1行JSONが空行になる」は上記クラッシュとは**別の事象**で、SDK 581.0.0(修正済みバージョン)でも再現するため教材を修正した。

## コールドスタートの追試

### インスタンスの縮小の様子

`--min-instances 0` に戻した状態で、最後のリクエスト(09:30:16Z)以降の `instance_count`(active + idle の合計)を追跡した。

| 時刻 (UTC) | インスタンス数 | 備考 |
|---|---|---|
| 09:23 | 11 | 負荷試験のピーク(負荷対象リビジョン `00004-bl6` が10台 + 旧リビジョンのidle 1台) |
| 09:27 | 7 | 負荷停止から約5分 |
| 09:28〜09:35 | 2 | |
| 09:36〜09:44 | 1 | **最後のリクエストから13分以上経ってもアイドルのまま1台残っていた** |

7章 L17 / L100 の「トラフィックが来なくなっても最大15分ほどインスタンスがアイドルのまま残る」という記述は、この観測と整合する(判定: 一致)。

### 16分アイドル後のコールドスタート計測

最後のリクエスト(09:30:16Z)から16分間アクセスを止めたあと、09:50:42Z に連続3回計測した:

```
1st time_total: 1.454798s
2nd time_total: 0.043257s
3rd time_total: 0.052684s
```

**1回目は約1.45秒、2回目以降は40〜50ms。**コールドスタートと温まった状態の差は明確に出た。

ただし教材(7章 L107 / L125)は「このアプリは軽いので**数百ms程度**」「1回目が**数百ms**、2回目は数十ms程度」と書いていた。**実測は1.45秒で、数百msではなく1秒を超える**。参加者が「1秒以上かかったから失敗では」と誤認する、あるいは逆に「数百msのはずなのに」と混乱する可能性があるため修正した(判定: 不一致(修正した))。

なお、デプロイ直後のリビジョンへの初回リクエストは 0.584秒だった。これは `gcloud run deploy` がリビジョン作成時にコンテナを起動しているため、完全な0台状態からのコールドスタートより速い。**「数百ms」という元の記述はこのケースに近い数字**で、0台からの計測とは条件が違う。

## 後片付けの結果

| リソース | 削除コマンド | 結果 |
|---|---|---|
| Pub/Sub サブスクリプション `handson-sub` | `gcloud pubsub subscriptions delete handson-sub` | 成功 `Deleted subscription [projects/sandbox-360407/subscriptions/handson-sub].` |
| Pub/Sub トピック `handson-topic` | `gcloud pubsub topics delete handson-topic` | 成功 `Deleted topic [projects/sandbox-360407/topics/handson-topic].` |
| Cloud Run サービス `handson-app` | `gcloud run services delete handson-app --region asia-northeast1` | 成功 `Deleted service [handson-app].` |
| Artifact Registry リポジトリ `handson` | `gcloud artifacts repositories delete handson --location asia-northeast1` | 成功 `Deleted repository [handson].` |

削除後の確認(4件すべて実行):

- `gcloud run services list --region asia-northeast1` → `genie` のみ
- `gcloud artifacts repositories list --location asia-northeast1` → `y-ohgi` のみ
- `gcloud pubsub topics list` → `Listed 0 items.`
- `gcloud pubsub subscriptions list` → `Listed 0 items.`

**削除できなかったリソースはない。** 既存の本番サービス `genie` と既存の Artifact Registry リポジトリ `y-ohgi` には一切触れていない。他の検証担当が作成した `handson-jobs` / `handson-ws` のリポジトリにも触れておらず、これらは各担当が削除済み。
