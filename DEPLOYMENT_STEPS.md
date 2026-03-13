# Vercelデプロイ手順（詳細版）

このガイドでは、VAMキャンペーン監視ダッシュボードをVercelにデプロイする詳細な手順を説明します。

## 所要時間

約10-15分

## 前提条件

- [ ] GitHubアカウント
- [ ] Vercelアカウント（GitHubアカウントでサインアップ可能）
- [ ] GitHubリポジトリ `VOXX-tools/vam-campaign-dashboard` が存在する
- [ ] ローカルでの動作確認が完了している

---

## Phase 1: GitHubリポジトリの準備（2分）

### 1.1 最新のコードをプッシュ

すべての変更がGitHubにプッシュされていることを確認：

```bash
# 現在の状態を確認
git status

# 変更がある場合はコミット
git add .
git commit -m "Complete implementation with Vercel deployment configuration"

# GitHubにプッシュ
git push origin main
```

### 1.2 GitHubリポジトリを確認

ブラウザで https://github.com/VOXX-tools/vam-campaign-dashboard にアクセスし、以下のファイルが存在することを確認：

- ✅ `vercel.json`
- ✅ `middleware.ts`
- ✅ `api/auth.ts`
- ✅ `.vercelignore`
- ✅ `README.md`
- ✅ `.env.example`

---

## Phase 2: Vercelプロジェクトの作成（3分）

### 2.1 Vercelにログイン

1. https://vercel.com/ にアクセス
2. 「Sign Up」または「Log In」をクリック
3. 「Continue with GitHub」を選択してGitHubアカウントでログイン

### 2.2 新しいプロジェクトを作成

1. Vercel Dashboardで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで `VOXX-tools/vam-campaign-dashboard` を検索
3. リポジトリが見つからない場合：
   - 「Adjust GitHub App Permissions」をクリック
   - VOXX-tools organizationへのアクセスを許可
   - 再度検索

4. リポジトリの横にある「Import」ボタンをクリック

### 2.3 プロジェクト設定を確認

「Configure Project」画面で以下を確認：

- **Project Name**: `vam-campaign-dashboard`（自動入力）
- **Framework Preset**: `Vite`（自動検出）
- **Root Directory**: `.`（デフォルト）
- **Build Command**: `npm run build`（自動入力）
- **Output Directory**: `dist`（自動入力）
- **Install Command**: `npm install`（自動入力）

**重要**: これらの設定は`vercel.json`で既に定義されているため、変更不要です。

---

## Phase 3: 環境変数の設定（5分）

### 3.1 環境変数セクションを開く

「Configure Project」画面で「Environment Variables」セクションを展開します。

### 3.2 環境変数を追加

以下の5つの環境変数を**1つずつ**追加します：

#### 変数1: VITE_GOOGLE_CLIENT_ID

- **Key**: `VITE_GOOGLE_CLIENT_ID`
- **Value**: `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com`
- **Environment**: Production, Preview, Development（すべてチェック）
- 「Add」をクリック

#### 変数2: VITE_SPREADSHEET_ID

- **Key**: `VITE_SPREADSHEET_ID`
- **Value**: `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA`
- **Environment**: Production, Preview, Development（すべてチェック）
- 「Add」をクリック

#### 変数3: VITE_SHEET_NAME

- **Key**: `VITE_SHEET_NAME`
- **Value**: `進捗率タブ`
- **Environment**: Production, Preview, Development（すべてチェック）
- 「Add」をクリック

#### 変数4: BASIC_AUTH_USER

- **Key**: `BASIC_AUTH_USER`
- **Value**: `admin`（または任意のユーザー名）
- **Environment**: Production, Preview, Development（すべてチェック）
- 「Add」をクリック

#### 変数5: BASIC_AUTH_PASSWORD

- **Key**: `BASIC_AUTH_PASSWORD`
- **Value**: 強力なパスワード（例: `VAM2024!SecurePass#Dashboard`）
- **Environment**: Production, Preview, Development（すべてチェック）
- 「Add」をクリック

**重要**: 
- `BASIC_AUTH_PASSWORD`は強力なパスワードを設定してください
- 最低12文字、英数字と記号を含む
- このパスワードは後で変更できます

### 3.3 環境変数を確認

5つの環境変数がすべて追加されていることを確認：

```
✅ VITE_GOOGLE_CLIENT_ID
✅ VITE_SPREADSHEET_ID
✅ VITE_SHEET_NAME
✅ BASIC_AUTH_USER
✅ BASIC_AUTH_PASSWORD
```

---

## Phase 4: デプロイの実行（2分）

### 4.1 デプロイを開始

1. 「Deploy」ボタンをクリック
2. ビルドプロセスが開始されます

### 4.2 ビルドログを確認

ビルドプロセスの進行状況を確認：

```
Running "npm install"...
✓ Dependencies installed

Running "npm run build"...
✓ Build completed

Deploying...
✓ Deployment completed
```

**所要時間**: 通常1-3分

### 4.3 デプロイURLを取得

デプロイが成功すると、以下のような画面が表示されます：

```
🎉 Congratulations!
Your project has been successfully deployed.

https://vam-campaign-dashboard.vercel.app
```

**重要**: このURLをコピーしてください。次のステップで使用します。

---

## Phase 5: Google Cloud Consoleの設定更新（3分）

デプロイしたURLをGoogle Cloud Consoleに登録する必要があります。

### 5.1 Google Cloud Consoleにアクセス

1. https://console.cloud.google.com/ にアクセス
2. プロジェクト「VAM Campaign Dashboard」を選択

### 5.2 OAuth 2.0クライアントIDを編集

1. 左側のメニューから「APIとサービス」→「認証情報」をクリック
2. 「OAuth 2.0 クライアント ID」セクションで、クライアントID `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com` をクリック

### 5.3 承認済みのJavaScript生成元を追加

「承認済みのJavaScript生成元」セクションで、以下のURIを追加：

```
https://vam-campaign-dashboard.vercel.app
```

**重要**: 
- `https://` を使用（`http://` ではない）
- 実際のVercel URLに置き換える
- 末尾にスラッシュ `/` を付けない

### 5.4 承認済みのリダイレクトURIを追加

「承認済みのリダイレクトURI」セクションで、以下のURIを追加：

```
https://vam-campaign-dashboard.vercel.app
```

### 5.5 保存

「保存」ボタンをクリックして変更を保存します。

**注意**: 変更が反映されるまで数分かかる場合があります。

---

## Phase 6: 動作確認（5分）

### 6.1 Basic認証の確認

1. デプロイURLにアクセス：`https://vam-campaign-dashboard.vercel.app`
2. Basic認証のダイアログが表示されることを確認
3. 設定したユーザー名とパスワードを入力
4. 「ログイン」または「OK」をクリック

**期待される動作**:
- ✅ Basic認証ダイアログが表示される
- ✅ 正しいパスワードでログインできる
- ✅ 間違ったパスワードではログインできない

### 6.2 Google OAuth認証の確認

1. Basic認証後、「Googleでログイン」ボタンが表示されることを確認
2. ボタンをクリック
3. Googleアカウントを選択
4. 権限の承認画面が表示されたら「許可」をクリック

**期待される動作**:
- ✅ Googleログインフローが開始される
- ✅ アカウント選択画面が表示される
- ✅ 権限承認後、ダッシュボードが表示される

### 6.3 データ取得の確認

ログイン後、以下を確認：

- ✅ キャンペーン一覧が表示される
- ✅ ステータスバッジ（CRITICAL/WARNING/HEALTHY）が表示される
- ✅ データが正しく取得されている
- ✅ エラーメッセージが表示されていない

### 6.4 UI/UX機能の確認

以下の機能が正常に動作することを確認：

#### キャンペーン一覧タブ
- ✅ キャンペーンがテーブル形式で表示される
- ✅ フィルタリング機能（ステータス、広告種別、代理店名）が動作する
- ✅ ソート機能（キャンペーン名、ステータス、進捗率など）が動作する
- ✅ キャンペーン行をクリックすると詳細ビューに遷移する

#### 時系列分析タブ
- ✅ グラフが表示される
- ✅ タブ切り替え（全体/予約型/運用型/自社広告）が動作する
- ✅ 分析サマリーが表示される

#### 代理店別分析タブ
- ✅ 代理店別サマリーがテーブル形式で表示される
- ✅ 要対応キャンペーン数でソートされている

#### キャンペーン詳細ビュー
- ✅ 基本情報が表示される
- ✅ ペーシング分析グラフが表示される
- ✅ 「一覧に戻る」ボタンが動作する

#### レスポンシブデザイン
- ✅ デスクトップ（1024px以上）で正しく表示される
- ✅ タブレット（768px以上1024px未満）で正しく表示される
- ✅ モバイル（768px未満）で正しく表示される

### 6.5 パフォーマンスの確認

- ✅ 初期ロードが3秒以内に完了する
- ✅ ページ遷移がスムーズである
- ✅ データ更新が1秒以内に完了する

---

## Phase 7: 自動デプロイの確認（オプション）

### 7.1 mainブランチへのpushで自動デプロイ

1. ローカルで小さな変更を加える（例: README.mdを編集）
2. コミットしてプッシュ：
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```
3. Vercel Dashboardで自動的にデプロイが開始されることを確認

### 7.2 Pull Requestでプレビュー環境

1. 新しいブランチを作成：
   ```bash
   git checkout -b feature/test-preview
   ```
2. 変更を加えてプッシュ：
   ```bash
   git add .
   git commit -m "Test preview deployment"
   git push origin feature/test-preview
   ```
3. GitHubでPull Requestを作成
4. PRコメントにプレビューURLが表示されることを確認

---

## トラブルシューティング

### 問題1: ビルドエラーが発生する

**症状**: Vercelのビルドが失敗する

**解決策**:
1. ローカルで`npm run build`を実行してエラーを確認
2. Vercelのビルドログを確認
3. 依存関係が正しくインストールされているか確認
4. Node.jsのバージョンを確認（18.x以上）

### 問題2: Basic認証が機能しない

**症状**: Basic認証のダイアログが表示されない

**解決策**:
1. `middleware.ts`がプロジェクトルートに存在することを確認
2. 環境変数`BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`が設定されていることを確認
3. Vercelのログを確認
4. デプロイを再実行

### 問題3: 「redirect_uri_mismatch」エラー

**症状**: Googleログイン時にエラーが発生する

**解決策**:
1. Google Cloud Consoleで承認済みのJavaScript生成元を確認
2. Vercel URLが正確に入力されているか確認（末尾のスラッシュなし）
3. 変更を保存してから数分待つ
4. ブラウザのキャッシュをクリアして再試行

### 問題4: データが表示されない

**症状**: ダッシュボードにデータが表示されない

**解決策**:
1. 環境変数`VITE_SPREADSHEET_ID`と`VITE_SHEET_NAME`が正しいか確認
2. スプレッドシートへのアクセス権限があるか確認
3. ブラウザのコンソール（F12）でエラーメッセージを確認
4. Vercelのログを確認

### 問題5: 環境変数が読み込まれない

**症状**: アプリケーションが環境変数を読み込めない

**解決策**:
1. 環境変数名が`VITE_`プレフィックスで始まっているか確認
2. Vercel Dashboardで環境変数が設定されているか確認
3. デプロイを再実行（環境変数の変更後は再デプロイが必要）

---

## 完了チェックリスト

すべての項目をチェックして、デプロイが成功したことを確認してください：

### デプロイ前
- [ ] GitHubリポジトリが最新の状態
- [ ] ローカルで`npm run build`が成功する
- [ ] ローカルで`npm run test`が成功する

### Vercel設定
- [ ] Vercelプロジェクトが作成されている
- [ ] GitHubリポジトリと連携されている
- [ ] 5つの環境変数が設定されている
- [ ] デプロイが成功している

### Google Cloud Console設定
- [ ] 承認済みのJavaScript生成元にVercel URLが追加されている
- [ ] 承認済みのリダイレクトURIにVercel URLが追加されている

### 動作確認
- [ ] Basic認証が動作する
- [ ] Googleログインが動作する
- [ ] データが正しく表示される
- [ ] すべてのタブが動作する
- [ ] フィルタリング・ソート機能が動作する
- [ ] レスポンシブデザインが動作する

---

## 次のステップ

デプロイが完了したら、以下のオプション設定を検討してください：

### オプション1: カスタムドメインの設定

1. Vercel Dashboard > プロジェクト > "Settings" > "Domains"に移動
2. カスタムドメインを追加
3. DNSレコードを設定
4. Google Cloud Consoleで承認済みのJavaScript生成元にカスタムドメインを追加

### オプション2: Slack通知の設定

1. Vercel Dashboard > プロジェクト > "Settings" > "Notifications"に移動
2. Slack Webhookを設定
3. デプロイ通知を受け取る

### オプション3: アナリティクスの確認

1. Vercel Dashboard > プロジェクト > "Analytics"に移動
2. アクセス数、パフォーマンス、エラーを確認

### オプション4: パフォーマンスの最適化

1. Vercel Dashboard > プロジェクト > "Speed Insights"に移動
2. Core Web Vitalsを確認
3. 最適化の提案を確認

---

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel Edge Middleware](https://vercel.com/docs/concepts/functions/edge-middleware)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - デプロイチェックリスト
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 5分でデプロイする簡易ガイド

---

**デプロイ完了！** 🎉

VAMキャンペーン監視ダッシュボードが本番環境で稼働しています。
