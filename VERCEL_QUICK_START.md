# Vercel クイックスタートガイド

GitHubリポジトリへのプッシュが完了しました。次はVercelでデプロイします。

## ✅ 完了した作業

- [x] Gitリポジトリの初期化
- [x] GitHubリポジトリへの接続（VOXX-tools/vam-campaign-dashboard）
- [x] 最新のコードをGitHubにプッシュ

## 📋 次の作業: Vercelでデプロイ（10分）

### ステップ1: Vercelにログイン（1分）

1. ブラウザで https://vercel.com/ にアクセス
2. 「Sign Up」または「Log In」をクリック
3. 「Continue with GitHub」を選択してログイン

### ステップ2: 新しいプロジェクトをインポート（2分）

1. Vercel Dashboardで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで検索ボックスに `vam-campaign-dashboard` と入力
3. リポジトリが表示されたら「Import」ボタンをクリック

**リポジトリが見つからない場合**:
- 「Adjust GitHub App Permissions」をクリック
- VOXX-tools organizationへのアクセスを許可
- 再度検索

### ステップ3: プロジェクト設定を確認（1分）

「Configure Project」画面で以下を確認（変更不要）：

- ✅ **Project Name**: `vam-campaign-dashboard`
- ✅ **Framework Preset**: `Vite`（自動検出）
- ✅ **Root Directory**: `.`
- ✅ **Build Command**: `npm run build`
- ✅ **Output Directory**: `dist`

**重要**: これらは `vercel.json` で既に設定されているので、変更不要です。


### ステップ4: 環境変数を設定（5分）⚠️ 重要

「Environment Variables」セクションで以下の5つの環境変数を**1つずつ**追加します。

#### 📝 環境変数の追加方法

各変数について：
1. 「Key」欄に変数名を入力
2. 「Value」欄に値を入力
3. 「Environment」で **Production, Preview, Development すべてにチェック**
4. 「Add」ボタンをクリック

---

#### 変数1: VITE_GOOGLE_CLIENT_ID

```
Key: VITE_GOOGLE_CLIENT_ID
Value: 997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com
Environment: ✅ Production ✅ Preview ✅ Development
```

#### 変数2: VITE_SPREADSHEET_ID

```
Key: VITE_SPREADSHEET_ID
Value: 1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
Environment: ✅ Production ✅ Preview ✅ Development
```

#### 変数3: VITE_SHEET_NAME

```
Key: VITE_SHEET_NAME
Value: 進捗率タブ
Environment: ✅ Production ✅ Preview ✅ Development
```

#### 変数4: BASIC_AUTH_USER

```
Key: BASIC_AUTH_USER
Value: admin
Environment: ✅ Production ✅ Preview ✅ Development
```

**注意**: `admin` は任意のユーザー名に変更可能です。

#### 変数5: BASIC_AUTH_PASSWORD

```
Key: BASIC_AUTH_PASSWORD
Value: （強力なパスワードを設定）
Environment: ✅ Production ✅ Preview ✅ Development
```

**重要**: 強力なパスワードを設定してください。
- 推奨例: `VAM2024!Dashboard#Secure`
- 最低12文字、英数字と記号を含む
- このパスワードは後で変更可能です

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


### ステップ5: デプロイを実行（1分）

1. 「Deploy」ボタンをクリック
2. ビルドプロセスが開始されます
3. 進行状況を確認：
   ```
   Running "npm install"...
   ✓ Dependencies installed
   
   Running "npm run build"...
   ✓ Build completed
   
   Deploying...
   ✓ Deployment completed
   ```

**所要時間**: 通常1-3分

### ステップ6: デプロイURLを取得

デプロイが成功すると、以下のような画面が表示されます：

```
🎉 Congratulations!
Your project has been successfully deployed.

https://vam-campaign-dashboard.vercel.app
```

**⚠️ 重要**: このURLをコピーしてください。次のステップで使用します。

---

## 📋 次の作業: Google Cloud Consoleの設定更新（3分）

デプロイしたURLをGoogle Cloud Consoleに登録する必要があります。

### ステップ7: Google Cloud Consoleにアクセス

1. https://console.cloud.google.com/ にアクセス
2. プロジェクト「VAM Campaign Dashboard」を選択
3. 左側のメニューから「APIとサービス」→「認証情報」をクリック

### ステップ8: OAuth 2.0クライアントIDを編集

1. 「OAuth 2.0 クライアント ID」セクションを探す
2. クライアントID `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com` をクリック

### ステップ9: 承認済みのJavaScript生成元を追加

「承認済みのJavaScript生成元」セクションで：

1. 「URIを追加」ボタンをクリック
2. VercelのURLを入力（例: `https://vam-campaign-dashboard.vercel.app`）
3. **重要**: 
   - `https://` を使用（`http://` ではない）
   - 末尾にスラッシュ `/` を付けない
   - 実際のVercel URLに置き換える

### ステップ10: 承認済みのリダイレクトURIを追加

「承認済みのリダイレクトURI」セクションで：

1. 「URIを追加」ボタンをクリック
2. 同じVercelのURLを入力（例: `https://vam-campaign-dashboard.vercel.app`）

### ステップ11: 保存

「保存」ボタンをクリックして変更を保存します。

**注意**: 変更が反映されるまで数分かかる場合があります。


---

## 🎯 最終確認: 動作テスト（5分）

### テスト1: Basic認証の確認

1. デプロイURLにアクセス（例: `https://vam-campaign-dashboard.vercel.app`）
2. Basic認証のダイアログが表示されることを確認
3. 設定したユーザー名とパスワードを入力
4. 「ログイン」または「OK」をクリック

**期待される動作**:
- ✅ Basic認証ダイアログが表示される
- ✅ 正しいパスワードでログインできる
- ✅ 間違ったパスワードではログインできない

### テスト2: Google OAuth認証の確認

1. Basic認証後、「Googleでログイン」ボタンが表示されることを確認
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

- ✅ フィルタリング機能が動作する
- ✅ ソート機能が動作する
- ✅ タブ切り替えが動作する
- ✅ キャンペーン詳細ビューが表示される
- ✅ レスポンシブデザインが動作する（モバイル、タブレット、デスクトップ）

---

## 🎉 完了！

すべてのテストが成功したら、デプロイは完了です！

### 📝 デプロイ情報のメモ

以下の情報を記録しておいてください：

```
デプロイURL: https://vam-campaign-dashboard.vercel.app
Basic認証ユーザー名: admin
Basic認証パスワード: （設定したパスワード）
デプロイ日: 2024年XX月XX日
```

### 🔄 今後の更新方法

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

### 📊 Vercel Dashboardで確認できること

- デプロイ履歴
- ビルドログ
- アクセス統計
- パフォーマンス指標
- エラーログ

---

## ❓ トラブルシューティング

### 問題1: Basic認証が表示されない

**解決策**:
1. Vercelのビルドログを確認
2. `middleware.ts` が正しくデプロイされているか確認
3. 環境変数 `BASIC_AUTH_USER` と `BASIC_AUTH_PASSWORD` が設定されているか確認

### 問題2: 「redirect_uri_mismatch」エラー

**解決策**:
1. Google Cloud Consoleで承認済みのJavaScript生成元を確認
2. Vercel URLが正確に入力されているか確認（末尾のスラッシュなし）
3. 数分待ってから再試行

### 問題3: データが表示されない

**解決策**:
1. ブラウザのコンソール（F12）でエラーメッセージを確認
2. 環境変数 `VITE_SPREADSHEET_ID` と `VITE_SHEET_NAME` が正しいか確認
3. スプレッドシートへのアクセス権限があるか確認

---

## 📚 参考ドキュメント

- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - デプロイチェックリスト
- [DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md) - 詳細なデプロイ手順
- [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) - ローカル環境のセットアップ
- [README.md](./README.md) - プロジェクト概要

---

**デプロイ作業、お疲れ様でした！** 🎉
