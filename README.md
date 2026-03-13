# VAMキャンペーン監視ダッシュボード

Googleスプレッドシートから取得したキャンペーンデータをリアルタイムで可視化し、異常検知とトレンド分析を提供するReact + TypeScriptベースのWebアプリケーションです。

## プロジェクト概要

VAM（広告配信サーバー）キャンペーン監視ダッシュボードは、営業メンバーと技術メンバーがキャンペーンの健康状態をリアルタイムで把握し、異常を早期発見するためのWebブラウザベースのツールです。

### 主要機能

- **キャンペーンステータス自動判定**: 要対応/注意/順調の3段階で自動判定
- **広告種別分類**: 予約型/運用型/自社広告の自動分類
- **時系列分析**: 過去24時間のimp推移をグラフで可視化
- **代理店別分析**: 代理店ごとの稼働状況と問題キャンペーンを集計
- **キャンペーン詳細ビュー**: 個別キャンペーンの詳細情報とペーシング分析
- **レスポンシブデザイン**: デスクトップ/タブレット/モバイル対応

### 技術スタック

- **Frontend Framework**: React 18 + TypeScript
- **UI Library**: Tailwind CSS
- **Chart Library**: Recharts
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **認証**: Google OAuth 2.0
- **データソース**: Google Sheets API
- **データ永続化**: Firebase Firestore（チーム全体でデータ共有）
- **デプロイ**: Vercel

## セットアップ手順

### 前提条件

- Node.js 18以上
- npm または yarn
- Googleアカウント
- Google Cloud Consoleへのアクセス権限

### 1. リポジトリのクローン

```bash
git clone https://github.com/VOXX-tools/vam-campaign-dashboard.git
cd vam-campaign-dashboard
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集し、以下の環境変数を設定：

```env
# Google OAuth 2.0 Client ID
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Google Spreadsheet Configuration
VITE_SPREADSHEET_ID=your-spreadsheet-id
VITE_SHEET_NAME=進捗率タブ

# Firebase Configuration (Firestore)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Google Cloud Consoleの設定

詳細な手順は`GOOGLE_OAUTH_SETUP.md`を参照してください。

#### 簡易手順

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Google Sheets APIを有効化
3. OAuth 2.0クライアントIDを作成（Webアプリケーション）
4. 承認済みのJavaScript生成元を設定：
   - 開発環境: `http://localhost:5173`
   - 本番環境: `https://your-vercel-domain.vercel.app`
5. クライアントIDを`.env`ファイルに設定

### 5. Firebase (Firestore) の設定

詳細な手順は`FIREBASE_SETUP.md`を参照してください。

#### 簡易手順

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestoreデータベースを有効化（ロケーション: asia-northeast1）
3. ウェブアプリを追加して設定情報を取得
4. Firebase設定を`.env`ファイルに追加
5. Firestoreセキュリティルールを設定（認証済みユーザーのみアクセス可能）

### 6. Googleスプレッドシートの準備

スプレッドシートには以下の20項目のカラムが必要です：

- CAMPAIGN_URL
- ORDER_NAME
- ADVERTISER_NAME
- AGENCY_NAME
- CAMPAIGN_ID
- CAMPAIGN_NAME
- 優先度
- START_TIME
- END_TIME
- 配信日数
- 目標Imp
- 累積実績Imp
- 日割りImp
- 配信キャップ
- 当日Imp
- 全体時間
- 経過時間
- 時間進捗率
- imp進捗
- 進捗率

## 開発コマンド

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

### ビルド

```bash
npm run build
```

ビルド成果物は`dist/`ディレクトリに出力されます。

### プレビュー

ビルド後のアプリケーションをローカルでプレビュー：

```bash
npm run preview
```

### テスト実行

```bash
# すべてのテストを実行
npm run test

# ウォッチモードでテスト実行
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

### コード品質チェック

```bash
# TypeScriptの型チェック
npx tsc --noEmit

# ESLintでコードチェック
npx eslint src/
```

## デプロイ手順

### Vercelへのデプロイ

詳細な手順は以下のドキュメントを参照してください：

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)**: 5分でデプロイする簡易ガイド
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**: 詳細なデプロイ手順
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**: デプロイ前後の確認項目

#### 簡易手順

1. **Vercelアカウントの作成**
   - [Vercel](https://vercel.com/)にアクセスしてアカウントを作成

2. **GitHubリポジトリの連携**
   - Vercelダッシュボードで「New Project」をクリック
   - GitHubリポジトリ（vam-campaign-dashboard）をインポート

3. **環境変数の設定**
   
   Vercelダッシュボードの「Settings」→「Environment Variables」で以下を設定：

   | 変数名 | 説明 | 例 |
   |--------|------|-----|
   | `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0クライアントID | `xxxxx.apps.googleusercontent.com` |
   | `VITE_SPREADSHEET_ID` | GoogleスプレッドシートのID | `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA` |
   | `VITE_SHEET_NAME` | シート名 | `進捗率タブ` |
   | `BASIC_AUTH_USER` | Basic認証のユーザー名 | `admin` |
   | `BASIC_AUTH_PASSWORD` | Basic認証のパスワード | `your-secure-password` |

4. **デプロイの実行**
   - 「Deploy」ボタンをクリック
   - デプロイが完了するまで待機（通常1-2分）

5. **Google Cloud Consoleの更新**
   - デプロイ後のVercel URLを確認
   - Google Cloud Consoleで承認済みのJavaScript生成元に追加：
     - `https://your-app.vercel.app`

6. **動作確認**
   - デプロイされたURLにアクセス
   - Basic認証でログイン
   - Googleアカウントでログイン
   - ダッシュボードが正常に表示されることを確認

### Basic認証について

本番環境では、Vercel Edge Middlewareを使用したBasic認証が自動的に有効になります。

- **認証方式**: HTTP Basic Authentication
- **実装ファイル**: `middleware.ts`
- **認証情報**: 環境変数`BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`で設定
- **適用範囲**: すべてのページ（開発環境では無効）

### デプロイ関連ファイル

| ファイル | 説明 |
|---------|------|
| `vercel.json` | Vercelのビルドとデプロイの設定 |
| `middleware.ts` | Basic認証の実装（Edge Middleware） |
| `api/auth.ts` | Basic認証API（Serverless Function） |
| `.vercelignore` | Vercelにアップロードしないファイルの指定 |

## 環境変数の説明

### 必須環境変数

#### `VITE_GOOGLE_CLIENT_ID`
- **説明**: Google OAuth 2.0のクライアントID
- **取得方法**: Google Cloud Consoleで作成
- **形式**: `xxxxx-xxxxxxxx.apps.googleusercontent.com`
- **用途**: Googleアカウントでのログイン認証

#### `VITE_SPREADSHEET_ID`
- **説明**: データソースとなるGoogleスプレッドシートのID
- **取得方法**: スプレッドシートのURLから抽出
  - URL例: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
- **形式**: 英数字とハイフンの文字列
- **用途**: Google Sheets APIでデータを取得

#### `VITE_SHEET_NAME`
- **説明**: スプレッドシート内のシート名
- **デフォルト**: `進捗率タブ`
- **用途**: 特定のシートからデータを取得

### デプロイ時のみ必要な環境変数

#### `BASIC_AUTH_USER`
- **説明**: Basic認証のユーザー名
- **推奨**: 推測されにくい文字列
- **用途**: Vercelデプロイ時のアクセス制限

#### `BASIC_AUTH_PASSWORD`
- **説明**: Basic認証のパスワード
- **推奨**: 強力なパスワード（12文字以上、英数字記号混在）
- **用途**: Vercelデプロイ時のアクセス制限

### 環境変数の設定場所

- **開発環境**: `.env`ファイル（ローカル）
- **本番環境**: Vercelダッシュボード → Settings → Environment Variables

## プロジェクト構造

```
vam-campaign-dashboard/
├── src/
│   ├── components/          # UIコンポーネント
│   │   └── LoginButton.tsx  # Googleログインボタン
│   ├── context/             # React Context
│   │   ├── AppContext.tsx   # アプリケーション状態管理
│   │   └── GoogleAuthContext.tsx  # Google認証管理
│   ├── modules/             # ビジネスロジック
│   │   ├── AgencyAnalyzer.ts      # 代理店別分析
│   │   ├── DataFetcher.ts         # データ取得
│   │   ├── LocalStorageManager.ts # データ永続化
│   │   ├── StatusEvaluator.ts     # ステータス判定
│   │   └── TimeSeriesAnalyzer.ts  # 時系列分析
│   ├── types/               # TypeScript型定義
│   │   ├── index.ts         # 共通型定義
│   │   └── google.d.ts      # Google API型定義
│   ├── App.tsx              # メインアプリケーション
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── api/
│   └── auth.ts              # Basic認証API
├── .kiro/                   # Kiro仕様ファイル
│   └── specs/
│       └── vam-campaign-monitoring-dashboard/
├── middleware.ts            # Vercel Edge Middleware
├── vercel.json              # Vercel設定
├── .env.example             # 環境変数テンプレート
├── package.json             # 依存関係とスクリプト
├── tsconfig.json            # TypeScript設定
├── tailwind.config.js       # Tailwind CSS設定
├── vite.config.ts           # Vite設定
└── README.md                # このファイル
```

## 実装済み機能

### コアモジュール

- ✅ **StatusEvaluator**: キャンペーンステータス判定と広告種別分類
- ✅ **DataFetcher**: Google Sheets APIからのデータ取得
- ✅ **LocalStorageManager**: データの永続化と7日間保持
- ✅ **TimeSeriesAnalyzer**: 時系列データ分析とピーク時間検出
- ✅ **AgencyAnalyzer**: 代理店別集計とソート

### 認証・セキュリティ

- ✅ **Google OAuth 2.0**: Googleアカウントでのログイン
- ✅ **Basic認証**: Vercelデプロイ時のアクセス制限
- ✅ **トークン管理**: アクセストークンの自動更新

### テスト

- ✅ **ユニットテスト**: 各モジュールの単体テスト
- ✅ **プロパティベーステスト**: fast-checkを使用した網羅的テスト
- ✅ **テストカバレッジ**: 80%以上を達成

## トラブルシューティング

### ログインできない

1. **Google Cloud Consoleの設定を確認**
   - OAuth 2.0クライアントIDが正しく設定されているか
   - 承認済みのJavaScript生成元にアプリのURLが登録されているか

2. **環境変数を確認**
   - `VITE_GOOGLE_CLIENT_ID`が正しく設定されているか
   - `.env`ファイルが存在するか

3. **ブラウザのキャッシュをクリア**
   - LocalStorageをクリア
   - ブラウザを再起動

### データが取得できない

1. **スプレッドシートの権限を確認**
   - ログインしているGoogleアカウントにスプレッドシートの閲覧権限があるか

2. **環境変数を確認**
   - `VITE_SPREADSHEET_ID`が正しいか
   - `VITE_SHEET_NAME`がスプレッドシートのシート名と一致しているか

3. **Google Sheets APIが有効か確認**
   - Google Cloud ConsoleでGoogle Sheets APIが有効になっているか

### ビルドエラー

1. **依存関係を再インストール**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScriptの型エラーを確認**
   ```bash
   npx tsc --noEmit
   ```

### Vercelデプロイエラー

1. **環境変数が設定されているか確認**
   - Vercelダッシュボードで必須環境変数がすべて設定されているか

2. **ビルドログを確認**
   - Vercelダッシュボードの「Deployments」→「Build Logs」を確認

3. **ローカルでビルドを確認**
   ```bash
   npm run build
   ```

## 関連ドキュメント

- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - Google OAuth 2.0の詳細設定手順
- [GOOGLE_SHEETS_API_SETUP.md](./GOOGLE_SHEETS_API_SETUP.md) - Google Sheets APIの設定手順
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Vercelデプロイの詳細手順
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 5分でデプロイする簡易ガイド
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - デプロイ前後の確認項目
- [GAS_DEPLOYMENT.md](./GAS_DEPLOYMENT.md) - Google Apps Scriptの設定手順

## ライセンス

Private

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
