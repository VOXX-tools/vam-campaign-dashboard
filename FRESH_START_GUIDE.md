# 完全クリーンスタート - Vercelデプロイ手順

1から作業するための完全な手順です。既存のプロジェクトを削除してから新規作成します。

---

## Phase 1: Vercelプロジェクトの削除（3分）

### ステップ1: Vercel Dashboardにアクセス

1. ブラウザで https://vercel.com/dashboard にアクセス
2. GitHubアカウントでログイン（必要な場合）

### ステップ2: 既存プロジェクトを探す

1. プロジェクト一覧から `vam-campaign-dashboard` を探す
2. プロジェクト名をクリックしてプロジェクト画面を開く

### ステップ3: プロジェクトを削除

1. 「Settings」タブをクリック
2. 左側のメニューで「General」が選択されていることを確認
3. ページを一番下までスクロール
4. 「Delete Project」セクションを見つける
5. 赤い「Delete」ボタンをクリック
6. 確認ダイアログが表示される
7. プロジェクト名 `vam-campaign-dashboard` を入力
8. 「Delete」ボタンをクリックして確認

**期待される結果**: プロジェクトが削除され、ダッシュボードに戻ります。

---

## Phase 2: GitHubの状態確認（1分）

GitHubリポジトリは削除せず、そのまま使用します。

### 確認事項

```bash
# 現在のディレクトリを確認
pwd
# 出力: /Users/wakabayashi/kiro-tool2

# Gitの状態を確認
git status
# 出力: On branch main, Your branch is up to date with 'origin/main'

# リモートリポジトリを確認
git remote -v
# 出力: origin  https://github.com/VOXX-tools/vam-campaign-dashboard.git
```

✅ GitHubリポジトリは既に準備完了しています。

---

## Phase 3: Vercelで新規プロジェクトを作成（10分）

### ステップ1: 新しいプロジェクトをインポート

1. Vercel Dashboard（https://vercel.com/dashboard）で「Add New...」をクリック
2. 「Project」を選択
3. 「Import Git Repository」セクションで検索ボックスに `vam-campaign-dashboard` と入力
4. リポジトリが表示されたら「Import」ボタンをクリック

**リポジトリが見つからない場合**:
- 「Adjust GitHub App Permissions」をクリック
- VOXX-tools organizationへのアクセスを許可
- ページをリロードして再度検索

### ステップ2: プロジェクト設定を確認

「Configure Project」画面で以下を確認（変更不要）：

- ✅ **Project Name**: `vam-campaign-dashboard`
- ✅ **Framework Preset**: `Vite`（自動検出）
- ✅ **Root Directory**: `.`
- ✅ **Build Command**: `npm run build`
- ✅ **Output Directory**: `dist`

**重要**: これらは `vercel.json` で既に設定されているので、変更不要です。


### ステップ3: 環境変数を設定（5分）⚠️ 最重要

「Environment Variables」セクションで以下の5つの環境変数を**1つずつ**追加します。

---

#### 📝 環境変数の追加方法

各変数について：
1. 「Key」欄に変数名を入力
2. 「Value」欄に値を入力（下記の値をコピペ）
3. 「Environment」で **Production, Preview, Development すべてにチェック**
4. 「Add」ボタンをクリック

---

#### 変数1: VITE_GOOGLE_CLIENT_ID

```
Key: VITE_GOOGLE_CLIENT_ID
Value: 997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com
```
- Environment: ✅ Production ✅ Preview ✅ Development
- 「Add」をクリック

---

#### 変数2: VITE_SPREADSHEET_ID

```
Key: VITE_SPREADSHEET_ID
Value: 1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
```
- Environment: ✅ Production ✅ Preview ✅ Development
- 「Add」をクリック

---

#### 変数3: VITE_SHEET_NAME

```
Key: VITE_SHEET_NAME
Value: 進捗率タブ
```
- Environment: ✅ Production ✅ Preview ✅ Development
- 「Add」をクリック

---

#### 変数4: BASIC_AUTH_USER

```
Key: BASIC_AUTH_USER
Value: admin
```
- Environment: ✅ Production ✅ Preview ✅ Development
- 「Add」をクリック

**注意**: `admin` は任意のユーザー名に変更可能です。

---

#### 変数5: BASIC_AUTH_PASSWORD

```
Key: BASIC_AUTH_PASSWORD
Value: VAM2024!Dashboard#Secure
```
- Environment: ✅ Production ✅ Preview ✅ Development
- 「Add」をクリック

**重要**: 
- このパスワードは強力なものを設定してください
- 推奨: `VAM2024!Dashboard#Secure`
- または独自のパスワード（最低12文字、英数字と記号を含む）

---

#### ✅ 環境変数の確認

5つの環境変数がすべて追加されていることを確認：

```
✅ VITE_GOOGLE_CLIENT_ID
✅ VITE_SPREADSHEET_ID
✅ VITE_SHEET_NAME
✅ BASIC_AUTH_USER
✅ BASIC_AUTH_PASSWORD
```

確認できたら次のステップへ。


### ステップ4: デプロイを実行（2分）

1. 「Deploy」ボタンをクリック
2. ビルドプロセスが開始されます
3. 進行状況を確認：

```
Building...
✓ Running "npm install"
✓ Running "npm run build"
✓ Uploading build outputs
✓ Deployment ready
```

**所要時間**: 通常1-3分

### ステップ5: デプロイURLを取得

デプロイが成功すると、以下のような画面が表示されます：

```
🎉 Congratulations!
Your project has been successfully deployed.

https://vam-campaign-dashboard.vercel.app
```

**⚠️ 重要**: 
- このURLをコピーしてください
- 次のステップで使用します
- メモ帳などに保存しておくと便利です

**デプロイURL例**: `https://vam-campaign-dashboard.vercel.app`

---

## Phase 4: Google Cloud Consoleの設定更新（3分）

デプロイしたURLをGoogle Cloud Consoleに登録する必要があります。

### ステップ1: Google Cloud Consoleにアクセス

1. 新しいタブで https://console.cloud.google.com/ にアクセス
2. プロジェクト「VAM Campaign Dashboard」を選択
3. 左側のメニューから「APIとサービス」→「認証情報」をクリック

### ステップ2: OAuth 2.0クライアントIDを編集

1. 「OAuth 2.0 クライアント ID」セクションを探す
2. クライアントID `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com` をクリック

### ステップ3: 承認済みのJavaScript生成元を追加

「承認済みのJavaScript生成元」セクションで：

1. 既存のURLを確認（`http://localhost:5173` があるはず）
2. 「URIを追加」ボタンをクリック
3. VercelのURLを入力

**入力例**:
```
https://vam-campaign-dashboard.vercel.app
```

**重要**: 
- `https://` を使用（`http://` ではない）
- 末尾にスラッシュ `/` を付けない
- 実際のVercel URLに置き換える

### ステップ4: 承認済みのリダイレクトURIを追加

「承認済みのリダイレクトURI」セクションで：

1. 「URIを追加」ボタンをクリック
2. 同じVercelのURLを入力

**入力例**:
```
https://vam-campaign-dashboard.vercel.app
```

### ステップ5: 保存

1. 「保存」ボタンをクリック
2. 確認メッセージが表示される

**注意**: 変更が反映されるまで数分かかる場合があります（通常は即座）。


---

## Phase 5: 動作確認（5分）

### テスト1: Basic認証の確認

1. デプロイURLにアクセス（例: `https://vam-campaign-dashboard.vercel.app`）
2. Basic認証のダイアログが表示される
3. 以下を入力：
   - ユーザー名: `admin`
   - パスワード: `VAM2024!Dashboard#Secure`（設定したパスワード）
4. 「ログイン」または「OK」をクリック

**期待される動作**:
- ✅ Basic認証ダイアログが表示される
- ✅ 正しいパスワードでログインできる
- ✅ 間違ったパスワードではログインできない（401エラー）

### テスト2: Google OAuth認証の確認

1. Basic認証後、「Googleでログイン」ボタンが表示される
2. ボタンをクリック
3. Googleアカウントを選択
4. 権限の承認画面が表示されたら「許可」をクリック

**期待される動作**:
- ✅ Googleログインフローが開始される
- ✅ アカウント選択画面が表示される
- ✅ 権限承認後、ダッシュボードが表示される

### テスト3: データ取得の確認

ログイン後、以下を確認：

- ✅ キャンペーン一覧が表示される
- ✅ ステータスバッジ（CRITICAL/WARNING/HEALTHY）が表示される
- ✅ データが正しく取得されている
- ✅ エラーメッセージが表示されていない

### テスト4: 機能の確認

- ✅ フィルタリング機能が動作する（ステータス、広告種別、代理店名）
- ✅ ソート機能が動作する
- ✅ タブ切り替えが動作する（キャンペーン一覧/時系列分析/代理店別分析）
- ✅ キャンペーン詳細ビューが表示される
- ✅ レスポンシブデザインが動作する

### テスト5: レスポンシブデザインの確認

ブラウザの開発者ツール（F12）を開いて：

1. デバイスツールバーをクリック（Ctrl+Shift+M / Cmd+Shift+M）
2. 以下のデバイスで表示を確認：
   - iPhone（モバイル）
   - iPad（タブレット）
   - デスクトップ

**期待される動作**:
- ✅ すべてのデバイスで正しく表示される
- ✅ レイアウトが崩れていない

---

## 🎉 完了！

すべてのテストが成功したら、デプロイは完了です！

### 📝 デプロイ情報のメモ

以下の情報を記録しておいてください：

```
=== VAM Campaign Dashboard - デプロイ情報 ===

デプロイURL: https://vam-campaign-dashboard.vercel.app

Basic認証:
- ユーザー名: admin
- パスワード: VAM2024!Dashboard#Secure

Google OAuth:
- クライアントID: 997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com

スプレッドシート:
- ID: 1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
- シート名: 進捗率タブ

デプロイ日: 2024年XX月XX日
```

---

## 🔄 今後の更新方法

コードを更新する場合：

```bash
# 1. コードを編集

# 2. 変更をコミット
git add .
git commit -m "Update: 変更内容の説明"

# 3. GitHubにプッシュ
git push origin main

# 4. Vercelが自動的に再デプロイ（1-3分）
```

Vercel Dashboardの「Deployments」タブで進行状況を確認できます。

---

## ❓ トラブルシューティング

### 問題1: Basic認証が表示されない

**原因**: middleware.tsが正しくデプロイされていない、または環境変数が設定されていない

**解決策**:
1. Vercel Dashboard > プロジェクト > Settings > Environment Variables
2. `BASIC_AUTH_USER` と `BASIC_AUTH_PASSWORD` が設定されているか確認
3. Deployments > 最新のデプロイ > Redeploy

### 問題2: 「redirect_uri_mismatch」エラー

**原因**: Google Cloud Consoleで承認済みのJavaScript生成元が正しく設定されていない

**解決策**:
1. Google Cloud Consoleで設定を確認
2. Vercel URLが正確に入力されているか確認（末尾のスラッシュなし）
3. 数分待ってから再試行
4. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete / Cmd+Shift+Delete）

### 問題3: データが表示されない

**原因**: スプレッドシートへのアクセス権限がない、またはシート名が間違っている

**解決策**:
1. ブラウザのコンソール（F12）でエラーメッセージを確認
2. 環境変数 `VITE_SHEET_NAME` が「進捗率タブ」になっているか確認
3. スプレッドシート（https://docs.google.com/spreadsheets/d/1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA/edit）にアクセスできるか確認

### 問題4: ビルドエラー

**原因**: 依存関係の問題、またはコードのエラー

**解決策**:
1. Vercelのビルドログを確認
2. ローカルで `npm run build` を実行してエラーを確認
3. エラーメッセージを確認して修正

---

## 📚 参考ドキュメント

- [VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md) - 環境変数の詳細
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - デプロイチェックリスト
- [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) - ローカル環境のセットアップ
- [README.md](./README.md) - プロジェクト概要

---

## 🎯 次のステップ

デプロイが完了したら：

1. ✅ チームメンバーにURLとBasic認証情報を共有
2. ✅ 定期的にデータを確認（毎時5分に自動更新）
3. ✅ 必要に応じてカスタムドメインを設定
4. ✅ Vercel Dashboardでアクセス統計を確認

---

**デプロイ作業、お疲れ様でした！** 🎉

何か問題があれば、このドキュメントのトラブルシューティングセクションを参照してください。
