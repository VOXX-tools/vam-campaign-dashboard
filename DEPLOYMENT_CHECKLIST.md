# Vercelデプロイチェックリスト

このチェックリストを使用して、VAMキャンペーン監視ダッシュボードのVercelデプロイが正しく設定されていることを確認してください。

## デプロイ前の確認

### コードの準備

- [ ] すべての変更がコミットされている
- [ ] `npm run build`がローカルで成功する
- [ ] `npm run test`がすべて通過する（テストがある場合）
- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] `vercel.json`が存在する
- [ ] `middleware.ts`が存在する
- [ ] `.env.example`が最新の環境変数を反映している

### GitHubリポジトリ

- [ ] リポジトリが`VOXX-tools/vam-campaign-dashboard`に存在する
- [ ] mainブランチが最新の状態である
- [ ] すべての変更がプッシュされている

## Vercelプロジェクトの設定

### プロジェクト作成

- [ ] Vercel Dashboardでプロジェクトを作成済み
- [ ] GitHubリポジトリと連携済み
- [ ] Framework PresetがViteに設定されている

### ビルド設定

- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`
- [ ] Node.js Version: 18.x以上

### 環境変数の設定

#### Production環境

- [ ] `VITE_GOOGLE_CLIENT_ID` = `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com`
- [ ] `VITE_SPREADSHEET_ID` = `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA`
- [ ] `VITE_SHEET_NAME` = `進捗率タブ`
- [ ] `BASIC_AUTH_USER` = （設定した値）
- [ ] `BASIC_AUTH_PASSWORD` = （設定した値）

#### Preview環境

- [ ] `VITE_GOOGLE_CLIENT_ID` = （同上）
- [ ] `VITE_SPREADSHEET_ID` = （同上）
- [ ] `VITE_SHEET_NAME` = （同上）
- [ ] `BASIC_AUTH_USER` = （設定した値）
- [ ] `BASIC_AUTH_PASSWORD` = （設定した値）

#### Development環境

- [ ] `VITE_GOOGLE_CLIENT_ID` = （同上）
- [ ] `VITE_SPREADSHEET_ID` = （同上）
- [ ] `VITE_SHEET_NAME` = （同上）
- [ ] `BASIC_AUTH_USER` = （設定した値）
- [ ] `BASIC_AUTH_PASSWORD` = （設定した値）

## Google Cloud Consoleの設定

### OAuth 2.0クライアントID

- [ ] Google Cloud Consoleでプロジェクトが作成されている
- [ ] Google Sheets APIが有効化されている
- [ ] OAuth 2.0クライアントIDが作成されている

### 承認済みのJavaScript生成元

- [ ] `http://localhost:5173`（開発環境）
- [ ] `https://your-project-name.vercel.app`（本番環境）
- [ ] `https://your-project-name-*.vercel.app`（プレビュー環境、オプション）

### 承認済みのリダイレクトURI

- [ ] `http://localhost:5173`（開発環境）
- [ ] `https://your-project-name.vercel.app`（本番環境）
- [ ] `https://your-project-name-*.vercel.app`（プレビュー環境、オプション）

## デプロイ後の確認

### デプロイの成功

- [ ] Vercelのビルドログにエラーがない
- [ ] デプロイが"Ready"状態になっている
- [ ] プロダクションURLが生成されている

### Basic認証の動作確認

- [ ] プロダクションURLにアクセスするとBasic認証ダイアログが表示される
- [ ] 正しいユーザー名とパスワードでログインできる
- [ ] 間違ったパスワードではログインできない

### Google OAuth認証の動作確認

- [ ] Basic認証後、Googleログインボタンが表示される
- [ ] Googleログインボタンをクリックするとログインフローが開始される
- [ ] Googleアカウントを選択できる
- [ ] 権限の承認画面が表示される
- [ ] 承認後、ダッシュボードが表示される

### データ取得の動作確認

- [ ] ダッシュボードにキャンペーンデータが表示される
- [ ] データが正しく取得されている
- [ ] エラーメッセージが表示されていない

### UI/UXの動作確認

- [ ] レスポンシブデザインが正しく動作する（デスクトップ、タブレット、モバイル）
- [ ] すべてのタブが正しく表示される
- [ ] フィルタリング機能が動作する
- [ ] ソート機能が動作する
- [ ] キャンペーン詳細ビューが表示される

### パフォーマンスの確認

- [ ] 初期ロードが3秒以内に完了する
- [ ] ページ遷移がスムーズである
- [ ] データ更新が1秒以内に完了する

## セキュリティの確認

### Basic認証

- [ ] 強力なパスワードが設定されている（最低12文字、英数字と記号を含む）
- [ ] パスワードがGitにコミットされていない
- [ ] 環境変数がVercel Dashboardでのみ管理されている

### HTTPS

- [ ] すべてのページがHTTPSで提供されている
- [ ] HTTPからHTTPSへのリダイレクトが機能している

### セキュリティヘッダー

- [ ] `X-Content-Type-Options: nosniff`が設定されている
- [ ] `X-Frame-Options: DENY`が設定されている
- [ ] `X-XSS-Protection: 1; mode=block`が設定されている
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`が設定されている

## 自動デプロイの確認

### mainブランチへのpush

- [ ] mainブランチへのpushで自動的にプロダクション環境にデプロイされる
- [ ] デプロイ通知がSlack/Emailで受信される（設定している場合）

### Pull Requestの作成

- [ ] Pull Requestの作成で自動的にプレビュー環境にデプロイされる
- [ ] PRコメントにプレビューURLが表示される

## トラブルシューティング

### ビルドエラーが発生した場合

1. [ ] ローカルで`npm run build`を実行してエラーを確認
2. [ ] Vercelのビルドログを確認
3. [ ] 依存関係が正しくインストールされているか確認
4. [ ] Node.jsのバージョンが正しいか確認

### 環境変数エラーが発生した場合

1. [ ] Vercel Dashboardで環境変数が正しく設定されているか確認
2. [ ] 環境変数名が正しいか確認（`VITE_`プレフィックス）
3. [ ] デプロイを再実行

### Basic認証が機能しない場合

1. [ ] `middleware.ts`がプロジェクトルートに存在するか確認
2. [ ] `BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`が環境変数に設定されているか確認
3. [ ] Vercelのログを確認

### Google OAuth認証エラーが発生した場合

1. [ ] Google Cloud Consoleで承認済みのJavaScript生成元が正しく設定されているか確認
2. [ ] 承認済みのリダイレクトURIが正しく設定されているか確認
3. [ ] URLが完全一致しているか確認（末尾のスラッシュに注意）

## 完了

すべてのチェック項目が完了したら、デプロイは成功です！

デプロイURL: `https://your-project-name.vercel.app`

---

**最終確認日**: ___________

**確認者**: ___________

**備考**: ___________
