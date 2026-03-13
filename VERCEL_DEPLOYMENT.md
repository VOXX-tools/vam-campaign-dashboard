# Vercel Deployment Guide

このドキュメントでは、VAMキャンペーン監視ダッシュボードをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubアカウントでサインアップ可能）
- GitHubリポジトリ: `VOXX-tools/vam-campaign-dashboard`

## デプロイ手順

### 1. GitHubリポジトリの準備

リポジトリが最新の状態であることを確認してください：

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2. Vercelプロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. "Add New..." > "Project"をクリック
3. GitHubリポジトリ`VOXX-tools/vam-campaign-dashboard`を選択
4. "Import"をクリック

### 3. プロジェクト設定

#### Framework Preset
- **Framework Preset**: Vite（自動検出されます）

#### Build and Output Settings
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `dist`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

#### Root Directory
- ルートディレクトリはそのまま（`.`）

### 4. 環境変数の設定

"Environment Variables"セクションで以下の環境変数を追加：

#### 必須の環境変数

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `VITE_GOOGLE_CLIENT_ID` | `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com` | Google OAuth 2.0クライアントID |
| `VITE_SPREADSHEET_ID` | `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA` | GoogleスプレッドシートID |
| `VITE_SHEET_NAME` | `進捗率タブ` | シート名 |
| `BASIC_AUTH_USER` | `your_username` | Basic認証のユーザー名（任意の値を設定） |
| `BASIC_AUTH_PASSWORD` | `your_password` | Basic認証のパスワード（任意の値を設定） |

**重要**: 
- すべての環境変数を"Production", "Preview", "Development"の3つの環境に追加してください
- `BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`は強力なパスワードを設定してください

### 5. デプロイの実行

1. "Deploy"ボタンをクリック
2. ビルドとデプロイが完了するまで待機（通常1-3分）
3. デプロイが成功すると、プロダクションURLが表示されます

### 6. Basic認証の確認

1. デプロイされたURLにアクセス
2. Basic認証のダイアログが表示されることを確認
3. 設定したユーザー名とパスワードでログイン
4. ダッシュボードが正常に表示されることを確認

**注意**: Basic認証はVercel Edge Middlewareを使用して実装されています。`middleware.ts`ファイルがプロジェクトルートに存在することを確認してください。

## 自動デプロイの設定

Vercelは自動的にGitHubリポジトリと連携し、以下のように動作します：

- **mainブランチへのpush**: プロダクション環境に自動デプロイ
- **その他のブランチへのpush**: プレビュー環境に自動デプロイ
- **Pull Request**: プレビュー環境に自動デプロイ（PRコメントにURLが表示）

## Google OAuth 2.0の設定更新

デプロイ後、Google Cloud Consoleで承認済みのJavaScript生成元とリダイレクトURIを更新する必要があります：

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択
3. "APIとサービス" > "認証情報"に移動
4. OAuth 2.0クライアントIDを選択
5. "承認済みのJavaScript生成元"に以下を追加：
   - `https://your-project-name.vercel.app`（プロダクションURL）
6. "承認済みのリダイレクトURI"に以下を追加：
   - `https://your-project-name.vercel.app`
7. "保存"をクリック

## トラブルシューティング

### ビルドエラー

**問題**: ビルドが失敗する

**解決策**:
1. ローカルで`npm run build`を実行してエラーを確認
2. `package.json`の依存関係が正しいことを確認
3. Vercelのビルドログを確認

### 環境変数エラー

**問題**: アプリケーションが環境変数を読み込めない

**解決策**:
1. Vercel Dashboardで環境変数が正しく設定されているか確認
2. 環境変数名が`VITE_`プレフィックスで始まっているか確認（クライアント側で使用する場合）
3. デプロイを再実行（環境変数の変更後は再デプロイが必要）

### Basic認証が機能しない

**問題**: Basic認証のダイアログが表示されない

**解決策**:
1. `middleware.ts`がプロジェクトルートに存在することを確認
2. `BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`が環境変数に設定されていることを確認
3. Vercelのログを確認してエラーメッセージを確認
4. Vercel Edge Middlewareが有効になっているか確認（Vercel Dashboardの"Functions"タブ）

**注意**: Vercel Edge Middlewareは、Vercelの無料プランでも利用可能ですが、一部の機能に制限がある場合があります。詳細は[Vercelのドキュメント](https://vercel.com/docs/concepts/functions/edge-middleware)を参照してください。

### Google OAuth認証エラー

**問題**: "redirect_uri_mismatch"エラーが発生する

**解決策**:
1. Google Cloud Consoleで承認済みのリダイレクトURIにVercelのURLが追加されているか確認
2. URLが完全一致していることを確認（末尾のスラッシュに注意）
3. 変更後、数分待ってから再試行

## カスタムドメインの設定（オプション）

カスタムドメインを使用する場合：

1. Vercel Dashboard > プロジェクト > "Settings" > "Domains"に移動
2. カスタムドメインを追加
3. DNSレコードを設定（Vercelが指示を表示）
4. Google Cloud Consoleで承認済みのJavaScript生成元とリダイレクトURIにカスタムドメインを追加

## セキュリティのベストプラクティス

1. **強力なBasic認証パスワード**: 最低12文字、英数字と記号を含む
2. **環境変数の管理**: 環境変数をGitにコミットしない（`.env`は`.gitignore`に含まれています）
3. **定期的なパスワード変更**: Basic認証のパスワードを定期的に変更
4. **HTTPSの使用**: Vercelは自動的にHTTPSを提供します
5. **アクセスログの監視**: Vercelのアナリティクスで不審なアクセスを監視

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel Edge Middleware](https://vercel.com/docs/concepts/functions/edge-middleware)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
