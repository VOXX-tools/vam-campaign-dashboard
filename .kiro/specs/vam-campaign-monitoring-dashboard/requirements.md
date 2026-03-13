# Requirements Document

## Introduction

VAM（広告配信サーバー）キャンペーン監視ダッシュボードは、営業メンバーと技術メンバーがキャンペーンの健康状態をリアルタイムで把握し、異常を早期発見するためのWebブラウザベースのツールです。1時間ごとに更新されるGoogleスプレッドシートからデータを取得し、キャンペーンのステータス判定、時系列分析、代理店別分析を提供します。

## Glossary

- **Dashboard**: VAMキャンペーン監視ダッシュボードシステム
- **Data_Source**: Googleスプレッドシート（1時間ごとに更新）
- **Campaign**: 広告配信キャンペーン
- **Status_Evaluator**: キャンペーンステータス判定モジュール
- **Time_Series_Analyzer**: 時系列分析モジュール
- **Agency_Analyzer**: 代理店別分析モジュール
- **Data_Fetcher**: データ取得モジュール
- **Chart_Renderer**: グラフ描画モジュール
- **予約型**: ORDER_NAMEに「PMP」も「自社広告」も含まれない広告種別
- **運用型**: ORDER_NAMEに「PMP」が含まれる広告種別
- **自社広告**: ORDER_NAMEに「自社広告」が含まれる広告種別
- **進捗率**: (累積実績Imp / 目標Imp) × 100
- **時間進捗率**: (経過時間 / 全体時間) × 100
- **残り日数**: 終了日時から現在日時までの日数
- **残り必要imp**: 目標Imp - 累積実績Imp

## Requirements

### Requirement 1: データ取得

**User Story:** As a システム管理者, I want Googleスプレッドシートからキャンペーンデータを取得する, so that 最新のキャンペーン情報をダッシュボードに表示できる

#### Acceptance Criteria

1. WHEN ダッシュボードが初期化される, THE Data_Fetcher SHALL GAS Web AppエンドポイントまたはGoogle Sheets API経由でJSON形式のデータを取得する
2. THE Data_Fetcher SHALL 20項目のデータ（CAMPAIGN_URL, ORDER_NAME, ADVERTISER_NAME, AGENCY_NAME, CAMPAIGN_ID, CAMPAIGN_NAME, 優先度, START_TIME, END_TIME, 配信日数, 目標Imp, 累積実績Imp, 日割りImp, 配信キャップ, 当日Imp, 全体時間, 経過時間, 時間進捗率, imp進捗, 進捗率）を含むレコードを処理する
3. WHEN データ取得が失敗する, THE Data_Fetcher SHALL エラーメッセージをユーザーに表示し、前回取得成功時のデータを保持する
4. THE Data_Fetcher SHALL 1時間ごとに自動的にデータを再取得する
5. WHEN データ取得が成功する, THE Data_Fetcher SHALL 取得時刻をダッシュボードに表示する

### Requirement 2: 広告種別判定

**User Story:** As a 営業メンバー, I want キャンペーンを広告種別で分類する, so that 種別ごとの分析ができる

#### Acceptance Criteria

1. WHEN ORDER_NAMEに「PMP」が含まれる, THE Status_Evaluator SHALL そのキャンペーンを「運用型」として分類する
2. WHEN ORDER_NAMEに「自社広告」が含まれる, THE Status_Evaluator SHALL そのキャンペーンを「自社広告」として分類する
3. WHEN ORDER_NAMEに「PMP」も「自社広告」も含まれない, THE Status_Evaluator SHALL そのキャンペーンを「予約型」として分類する
4. THE Status_Evaluator SHALL 各キャンペーンの広告種別をダッシュボードに表示する

### Requirement 3: キャンペーンステータス判定（要対応）

**User Story:** As a 技術メンバー, I want 要対応が必要なキャンペーンを自動検出する, so that 早期に問題に対処できる

#### Acceptance Criteria

1. WHEN 経過時間が24時間以上かつ進捗率が80%以下である, THE Status_Evaluator SHALL そのキャンペーンを「🔴要対応（ビハインド80%未満）」として判定する
2. WHEN 目標Impが2500000以上かつ経過時間が24時間以上かつ進捗率が100%未満である, THE Status_Evaluator SHALL そのキャンペーンを「🔴要対応（ビハインド250万imp以上）」として判定する
3. WHEN 日割りImpが0より大きくかつ当日Impが日割りImpの10%未満である, THE Status_Evaluator SHALL そのキャンペーンを「🔴要対応（当日imp少なめ）」として判定する
4. WHEN 残り日数が0より大きくかつ配信キャップ×残り日数が残り必要impを下回る, THE Status_Evaluator SHALL そのキャンペーンを「🔴要対応（キャップ未達リスク）」として判定する
5. WHEN 目標Impが0より大きくかつ当日Impが0である, THE Status_Evaluator SHALL そのキャンペーンを「🔴要対応（0imp異常）」として判定する
6. THE Status_Evaluator SHALL 上記の条件を上から順に評価し、最初に該当した条件でステータスを決定する

### Requirement 4: キャンペーンステータス判定（注意）

**User Story:** As a 営業メンバー, I want 注意が必要なキャンペーンを把握する, so that 予防的な対応ができる

#### Acceptance Criteria

1. WHEN 要対応条件に該当せずかつ終了日時が7日以内かつ進捗率が100%未満である, THE Status_Evaluator SHALL そのキャンペーンを「🟡注意（1週間以内終了）」として判定する
2. WHEN 要対応条件に該当せずかつ累積実績Impが目標Imp以上である, THE Status_Evaluator SHALL そのキャンペーンを「🟡注意（早期終了・超過）」として判定する
3. THE Status_Evaluator SHALL 注意条件の評価を要対応条件の後に実行する

### Requirement 5: キャンペーンステータス判定（順調）

**User Story:** As a 営業メンバー, I want 順調なキャンペーンを確認する, so that 問題のないキャンペーンを把握できる

#### Acceptance Criteria

1. WHEN 要対応条件にも注意条件にも該当しない, THE Status_Evaluator SHALL そのキャンペーンを「🟢順調」として判定する
2. THE Status_Evaluator SHALL 各キャンペーンのステータスを色分けして表示する

### Requirement 6: キャンペーン一覧表示

**User Story:** As a 営業メンバー, I want キャンペーン一覧を確認する, so that 全体の状況を把握できる

#### Acceptance Criteria

1. THE Dashboard SHALL 全キャンペーンをテーブル形式で表示する
2. THE Dashboard SHALL 各キャンペーンのステータス、広告種別、進捗率、当日Imp、代理店名を表示する
3. THE Dashboard SHALL ステータスでフィルタリング機能を提供する
4. THE Dashboard SHALL 広告種別でフィルタリング機能を提供する
5. THE Dashboard SHALL 代理店名でフィルタリング機能を提供する
6. THE Dashboard SHALL キャンペーン名、代理店名、進捗率でソート機能を提供する
7. WHEN ユーザーがキャンペーン行をクリックする, THE Dashboard SHALL そのキャンペーンの詳細情報を表示する

### Requirement 7: 時系列分析ビュー

**User Story:** As a 技術メンバー, I want 過去24時間のimp推移を確認する, so that 配信トレンドを分析できる

#### Acceptance Criteria

1. THE Time_Series_Analyzer SHALL 過去24時間の1時間ごとのimp推移をグラフで表示する
2. THE Time_Series_Analyzer SHALL 「全体」「予約型」「運用型」「自社広告」のタブまたは凡例で切り替え可能な表示を提供する
3. THE Time_Series_Analyzer SHALL 時間帯ごとのピーク時間と低調な時間を分析サマリーとして表示する
4. THE Chart_Renderer SHALL RechartsまたはChart.jsを使用してグラフを描画する
5. THE Time_Series_Analyzer SHALL 過去24時間のデータをローカルストレージまたは軽量データベースに保存する

### Requirement 8: 代理店別分析ビュー

**User Story:** As a 営業メンバー, I want 代理店ごとの状況を確認する, so that 代理店別の対応優先度を判断できる

#### Acceptance Criteria

1. THE Agency_Analyzer SHALL 代理店ごとの稼働キャンペーン数を集計して表示する
2. THE Agency_Analyzer SHALL 代理店ごとの要対応キャンペーン数を集計して表示する
3. THE Agency_Analyzer SHALL 代理店ごとの注意キャンペーン数を集計して表示する
4. THE Agency_Analyzer SHALL 代理店ごとの平均進捗率を計算して表示する
5. THE Agency_Analyzer SHALL 代理店ごとの総impを集計して表示する
6. THE Agency_Analyzer SHALL 代理店別サマリーをテーブル形式で表示する
7. THE Agency_Analyzer SHALL 要対応キャンペーン数でソート機能を提供する

### Requirement 9: レスポンシブデザイン

**User Story:** As a 営業メンバー, I want モバイルデバイスでもダッシュボードを閲覧する, so that 外出先でも状況を確認できる

#### Acceptance Criteria

1. THE Dashboard SHALL デスクトップ、タブレット、モバイルの各画面サイズに対応したレイアウトを提供する
2. WHEN 画面幅が768px未満である, THE Dashboard SHALL モバイル向けレイアウトに切り替える
3. WHEN 画面幅が768px以上1024px未満である, THE Dashboard SHALL タブレット向けレイアウトに切り替える
4. THE Dashboard SHALL Tailwind CSSを使用してレスポンシブデザインを実装する

### Requirement 10: パフォーマンス

**User Story:** As a ユーザー, I want ダッシュボードが高速に動作する, so that ストレスなく情報を確認できる

#### Acceptance Criteria

1. WHEN ダッシュボードが初期ロードされる, THE Dashboard SHALL 3秒以内に初期表示を完了する
2. WHEN データが更新される, THE Dashboard SHALL 1秒以内に画面を更新する
3. WHEN フィルタリングまたはソートが実行される, THE Dashboard SHALL 500ミリ秒以内に結果を表示する
4. THE Dashboard SHALL 1000件以上のキャンペーンデータを処理できる

### Requirement 11: エラーハンドリング

**User Story:** As a ユーザー, I want エラー発生時に適切な情報を得る, so that 問題を理解し対処できる

#### Acceptance Criteria

1. WHEN ネットワークエラーが発生する, THE Dashboard SHALL ユーザーにネットワーク接続の確認を促すメッセージを表示する
2. WHEN APIエラーが発生する, THE Dashboard SHALL エラーの内容と再試行ボタンを表示する
3. WHEN データ形式が不正である, THE Dashboard SHALL データ形式エラーメッセージを表示し、管理者に通知する
4. THE Dashboard SHALL エラー発生時も前回取得成功時のデータを表示し続ける

### Requirement 12: データ永続化

**User Story:** As a 技術メンバー, I want 時系列データを蓄積する, so that 長期的なトレンド分析ができる

#### Acceptance Criteria

1. THE Dashboard SHALL 1時間ごとに取得したデータをローカルストレージまたはFirebaseに保存する
2. THE Dashboard SHALL 過去7日間のデータを保持する
3. WHEN データが7日以上経過する, THE Dashboard SHALL 古いデータを自動的に削除する
4. THE Dashboard SHALL 保存されたデータから任意の期間のトレンドを表示できる

### Requirement 13: キャンペーン詳細ビュー

**User Story:** As a 技術メンバー/営業メンバー, I want 個別キャンペーンの詳細情報を確認する, so that 深掘り分析と問題の原因特定ができる

#### Acceptance Criteria

1. THE Dashboard SHALL キャンペーン一覧から選択されたキャンペーンの詳細ビューを表示する
2. THE Dashboard SHALL 詳細ビューにキャンペーンの基本情報（CAMPAIGN_NAME, CAMPAIGN_ID, ADVERTISER_NAME, AGENCY_NAME, 優先度）を表示する
3. THE Dashboard SHALL 詳細ビューに配信期間情報（START_TIME, END_TIME, 配信日数, 残り日数）を表示する
4. THE Dashboard SHALL 詳細ビューにimp関連情報（目標Imp, 累積実績Imp, 日割りImp, 配信キャップ, 当日Imp）を表示する
5. THE Dashboard SHALL 詳細ビューにペーシング分析（時間進捗率と進捗率の比較グラフまたは数値）を表示する
6. WHEN 時間進捗率が進捗率を上回る, THE Dashboard SHALL ビハインド状態であることを視覚的に示す
7. WHEN 進捗率が時間進捗率を上回る, THE Dashboard SHALL 順調または先行状態であることを視覚的に示す
8. THE Dashboard SHALL 詳細ビューに現在のステータス判定理由を表示する
9. THE Dashboard SHALL 詳細ビューから一覧ビューに戻るナビゲーションを提供する
