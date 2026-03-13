# Implementation Plan: VAMキャンペーン監視ダッシュボード

## Overview

React + TypeScript + Viteを使用したWebアプリケーションとして実装します。Googleスプレッドシートからデータを取得し、キャンペーンの健康状態を可視化します。Vercelにデプロイし、Basic認証でアクセス制限を設定します。

## Tasks

- [x] 1. プロジェクトセットアップとGitHubリポジトリ作成
  - Vite + React + TypeScriptプロジェクトを初期化
  - Tailwind CSS、Recharts、Vitest、fast-checkをインストール
  - GitHubリポジトリ（vam-campaign-dashboard）を作成し、初期コミットをプッシュ
  - .gitignoreとREADME.mdを設定
  - _Requirements: 全体_

- [x] 1.5. Google OAuth 2.0とSheets APIのセットアップ
  - [x] 1.5.1 Google Cloud Consoleでプロジェクトを作成
    - Google Cloud Consoleで新しいプロジェクトを作成
    - Google Sheets APIを有効化
    - _Requirements: 1.1_
  
  - [ ] 1.5.2 OAuth 2.0認証を設定
    - OAuth同意画面を設定（内部ユーザー）
    - OAuth 2.0クライアントIDを作成
    - 承認済みのJavaScript生成元とリダイレクトURIを設定
    - _Requirements: 1.1, アクセス制限要件_
  
  - [ ] 1.5.3 Google認証ライブラリをインストール
    - @react-oauth/googleをインストール
    - index.htmlにGoogle Identity Servicesスクリプトを追加
    - _Requirements: 1.1_
  
  - [ ] 1.5.4 GoogleAuthContextを実装
    - OAuth 2.0認証フローを実装
    - アクセストークンの管理（LocalStorage）
    - ログイン/ログアウト機能
    - src/context/GoogleAuthContext.tsxに配置
    - _Requirements: 1.1, アクセス制限要件_
  
  - [ ] 1.5.5 LoginButtonコンポーネントを作成
    - Googleログインボタンを実装
    - ログアウトボタンを実装
    - src/components/LoginButton.tsxに配置
    - _Requirements: アクセス制限要件_

- [x] 2. データモデルとインターフェース定義
  - [~] 2.1 型定義ファイルを作成
    - CampaignData、CampaignStatus、AdType、EnrichedCampaignなどの型を定義
    - src/types/index.tsに配置
    - _Requirements: 1.2, 2.1-2.4, 3.1-3.5, 4.1-4.2, 5.1_
  
  - [ ]* 2.2 データモデルのプロパティテストを作成
    - **Property 1: データレコード完全性**
    - **Validates: Requirements 1.2**

- [~] 3. コアビジネスロジックモジュールの実装
  - [~] 3.1 StatusEvaluatorクラスを実装
    - 広告種別判定ロジック（evaluateAdType）
    - ステータス判定ロジック（evaluateStatus）
    - 残り日数・残り必要imp計算
    - src/modules/StatusEvaluator.tsに配置
    - _Requirements: 2.1-2.4, 3.1-3.6, 4.1-4.3, 5.1-5.2_
  
  - [ ]* 3.2 StatusEvaluatorのプロパティテストを作成
    - **Property 2-4: 広告種別判定**
    - **Property 5-13: ステータス判定**
    - **Property 10: ステータス判定の優先順位**
    - **Validates: Requirements 2.1-2.4, 3.1-3.6, 4.1-4.3, 5.1-5.2**
  
  - [ ]* 3.3 StatusEvaluatorのユニットテストを作成
    - 境界値テスト（進捗率80%、24時間、7日など）
    - エッジケーステスト
    - _Requirements: 3.1-3.6, 4.1-4.3_

- [~] 4. データ取得モジュールの実装
  - [~] 4.1 DataFetcherクラスを実装
    - fetch()メソッド（GAS Web AppまたはGoogle Sheets API経由）
    - startAutoFetch()とstopAutoFetch()メソッド（1時間ごとの自動更新）
    - エラーハンドリング（ネットワークエラー、APIエラー、データ形式エラー）
    - src/modules/DataFetcher.tsに配置
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 11.1-11.4_
  
  - [ ]* 4.2 DataFetcherのユニットテストを作成
    - 正常系テスト
    - エラーハンドリングテスト
    - リトライロジックテスト
    - _Requirements: 1.1, 1.3, 11.1-11.4_

- [~] 5. データ永続化モジュールの実装
  - [~] 5.1 LocalStorageManagerクラスを実装
    - save()とload()メソッド
    - saveTimeSeries()とloadTimeSeries()メソッド
    - cleanup()メソッド（7日以上前のデータ削除）
    - src/modules/LocalStorageManager.tsに配置
    - _Requirements: 12.1-12.4_
  
  - [ ]* 5.2 LocalStorageManagerのプロパティテストを作成
    - **Property 20: データ永続化ラウンドトリップ**
    - **Property 21: データ保持期間管理**
    - **Property 22: 期間指定データ取得**
    - **Validates: Requirements 12.1-12.4**
  
  - [ ]* 5.3 LocalStorageManagerのユニットテストを作成
    - ストレージ容量不足時の動作テスト
    - 不正なデータ形式の処理テスト
    - _Requirements: 12.1-12.4_

- [~] 6. Checkpoint - コアモジュールの動作確認
  - Ensure all tests pass, ask the user if questions arise.

- [~] 7. 分析モジュールの実装
  - [~] 7.1 TimeSeriesAnalyzerクラスを実装
    - addDataPoint()メソッド
    - getLast24Hours()メソッド
    - analyze()メソッド（ピーク時間・低調な時間の検出）
    - src/modules/TimeSeriesAnalyzer.tsに配置
    - _Requirements: 7.1-7.5_
  
  - [-]* 7.2 TimeSeriesAnalyzerのプロパティテストを作成
    - **Property 16: 時系列分析 - ピーク時間検出**
    - **Validates: Requirements 7.3**
  
  - [~] 7.3 AgencyAnalyzerクラスを実装
    - analyze()メソッド（代理店別集計）
    - sortByCriticalCount()メソッド
    - src/modules/AgencyAnalyzer.tsに配置
    - _Requirements: 8.1-8.7_
  
  - [ ]* 7.4 AgencyAnalyzerのプロパティテストを作成
    - **Property 17: 代理店別集計**
    - **Property 18: 代理店別ソート**
    - **Validates: Requirements 8.1-8.7**

- [~] 8. 状態管理の実装
  - [~] 8.1 AppStateとAppActionの型定義
    - src/context/AppContext.tsxに配置
    - _Requirements: 全体_
  
  - [~] 8.2 appReducerの実装
    - FETCH_START、FETCH_SUCCESS、FETCH_ERROR
    - SELECT_CAMPAIGN、SET_FILTERS、SET_SORT
    - _Requirements: 全体_
  
  - [~] 8.3 AppContextProviderの実装
    - useReducerとuseContextを使用
    - DataFetcherとの統合
    - _Requirements: 全体_

- [~] 9. 共通UIコンポーネントの実装
  - [~] 9.1 StatusBadgeコンポーネントを作成
    - ステータスに応じた色とアイコンを表示
    - src/components/StatusBadge.tsxに配置
    - _Requirements: 5.2_
  
  - [~] 9.2 Filterコンポーネントを作成
    - ステータス、広告種別、代理店名のフィルタリングUI
    - src/components/Filter.tsxに配置
    - _Requirements: 6.3-6.5_
  
  - [~] 9.3 ErrorBannerコンポーネントを作成
    - エラーメッセージと再試行ボタンを表示
    - src/components/ErrorBanner.tsxに配置
    - _Requirements: 11.1-11.4_

- [~] 10. キャンペーン一覧ビューの実装
  - [~] 10.1 CampaignListコンポーネントを実装
    - テーブル形式でキャンペーン一覧を表示
    - フィルタリング・ソート機能を統合
    - キャンペーン行クリックで詳細ビューに遷移
    - src/components/CampaignList.tsxに配置
    - _Requirements: 6.1-6.7_
  
  - [ ]* 10.2 CampaignListのプロパティテストを作成
    - **Property 14: フィルタリング機能**
    - **Property 15: ソート機能**
    - **Validates: Requirements 6.3-6.6**
  
  - [ ]* 10.3 CampaignListのユニットテストを作成
    - ユーザーインタラクションテスト
    - _Requirements: 6.1-6.7_

- [~] 11. 時系列分析ビューの実装
  - [~] 11.1 TimeSeriesViewコンポーネントを実装
    - Rechartsを使用してグラフを描画
    - タブ切り替え（全体/予約型/運用型/自社広告）
    - 分析サマリーを表示
    - src/components/TimeSeriesView.tsxに配置
    - _Requirements: 7.1-7.4_
  
  - [ ]* 11.2 TimeSeriesViewのユニットテストを作成
    - グラフ描画テスト
    - タブ切り替えテスト
    - _Requirements: 7.1-7.4_

- [~] 12. 代理店別分析ビューの実装
  - [~] 12.1 AgencyViewコンポーネントを実装
    - テーブル形式で代理店別サマリーを表示
    - 要対応キャンペーン数でソート
    - src/components/AgencyView.tsxに配置
    - _Requirements: 8.1-8.7_
  
  - [ ]* 12.2 AgencyViewのユニットテストを作成
    - テーブル表示テスト
    - ソート機能テスト
    - _Requirements: 8.1-8.7_

- [~] 13. キャンペーン詳細ビューの実装
  - [~] 13.1 CampaignDetailコンポーネントを実装
    - 基本情報、配信期間情報、imp関連情報を表示
    - ペーシング分析グラフを表示
    - ビハインド/順調状態を視覚的に表示
    - 一覧ビューに戻るナビゲーション
    - src/components/CampaignDetail.tsxに配置
    - _Requirements: 13.1-13.9_
  
  - [ ]* 13.2 CampaignDetailのプロパティテストを作成
    - **Property 23: ペーシング状態判定**
    - **Validates: Requirements 13.6-13.7**
  
  - [ ]* 13.3 CampaignDetailのユニットテストを作成
    - 詳細情報表示テスト
    - ナビゲーションテスト
    - _Requirements: 13.1-13.9_

- [~] 14. メインダッシュボードの実装
  - [~] 14.1 Dashboardコンポーネントを実装
    - タブ切り替え（キャンペーン一覧/時系列分析/代理店別分析）
    - 最終取得時刻の表示
    - エラーバナーの統合
    - src/components/Dashboard.tsxに配置
    - _Requirements: 1.5, 6.1-6.7, 7.1-7.5, 8.1-8.7_
  
  - [~] 14.2 App.tsxを実装
    - AppContextProviderでラップ
    - Dashboardコンポーネントをレンダリング
    - _Requirements: 全体_

- [x] 15. レスポンシブデザインの実装
  - [~] 15.1 Tailwind CSSでレスポンシブレイアウトを実装
    - デスクトップ（1024px以上）
    - タブレット（768px以上1024px未満）
    - モバイル（768px未満）
    - すべてのコンポーネントに適用
    - _Requirements: 9.1-9.4_
  
  - [ ]* 15.2 レスポンシブデザインのユニットテストを作成
    - 各画面サイズでのレイアウトテスト
    - _Requirements: 9.1-9.4_

- [~] 16. Checkpoint - UIコンポーネントの動作確認
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. パフォーマンス最適化
  - [~] 17.1 大量データ処理の最適化
    - React.memoとuseMemoを使用
    - 仮想スクロールの検討（1000件以上のデータ）
    - _Requirements: 10.1-10.4_
  
  - [x]* 17.2 パフォーマンステストを作成
    - **Property 19: 大量データ処理**
    - **Validates: Requirements 10.4**
    - 初期ロード時間テスト（3秒以内）
    - データ更新時間テスト（1秒以内）
    - フィルタリング・ソート時間テスト（500ミリ秒以内）
    - _Requirements: 10.1-10.4_

- [ ] 18. Vercelデプロイ設定
  - [x] 18.1 vercel.jsonを作成
    - ビルド設定とルーティング設定
    - _Requirements: デプロイ要件_
  
  - [x] 18.2 環境変数の設定
    - GAS Web AppエンドポイントURLを環境変数として設定
    - Vercelダッシュボードで環境変数を登録
    - _Requirements: 1.1, デプロイ要件_
  
  - [ ] 18.3 Basic認証の設定
    - Vercel Middlewareを使用してBasic認証を実装
    - middleware.tsを作成
    - 認証情報を環境変数として設定
    - _Requirements: アクセス制限要件_
  
  - [ ] 18.4 GitHubとVercelの連携
    - Vercelプロジェクトを作成
    - GitHubリポジトリと連携
    - 自動デプロイを有効化
    - _Requirements: デプロイ要件_

- [ ] 19. ドキュメント作成
  - [ ] 19.1 README.mdを更新
    - プロジェクト概要
    - セットアップ手順
    - 開発コマンド
    - デプロイ手順
    - 環境変数の説明
    - _Requirements: 全体_
  
  - [ ] 19.2 .env.exampleを作成
    - 必要な環境変数のテンプレート
    - _Requirements: 1.1_

- [ ] 20. Final Checkpoint - 統合テストと動作確認
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- タスクに`*`が付いているものはオプションで、スキップ可能です
- 各タスクは特定の要件を参照しており、トレーサビリティを確保しています
- Checkpointタスクで段階的に検証を行います
- プロパティテストは設計ドキュメントのプロパティを検証します
- ユニットテストは特定の例とエッジケースを検証します
