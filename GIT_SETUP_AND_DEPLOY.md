# GitリポジトリのセットアップとVercelデプロイ手順

## 現在の状況

プロジェクトディレクトリ `/Users/wakabayashi/kiro-tool2` はまだGitリポジトリとして初期化されていません。

## 手順

### Phase 1: Gitリポジトリの初期化（2分）

#### 1.1 プロジェクトディレクトリにいることを確認

```bash
pwd
# 出力: /Users/wakabayashi/kiro-tool2
```

もし違うディレクトリにいる場合は、プロジェクトディレクトリに移動：

```bash
cd /Users/wakabayashi/kiro-tool2
```

#### 1.2 Gitリポジトリを初期化

```bash
git init
```

**期待される出力**:
```
Initialized empty Git repository in /Users/wakabayashi/kiro-tool2/.git/
```

#### 1.3 .gitignoreファイルを確認

```bash
cat .gitignore
```

`.gitignore`が存在し、以下が含まれていることを確認：
- `node_modules`
- `.env`
- `dist`


#### 1.4 すべてのファイルをステージング

```bash
git add .
```

#### 1.5 初回コミット

```bash
git commit -m "Initial commit: VAM Campaign Monitoring Dashboard"
```

**期待される出力**:
```
[main (root-commit) xxxxxxx] Initial commit: VAM Campaign Monitoring Dashboard
 XX files changed, XXXX insertions(+)
 create mode 100644 README.md
 create mode 100644 package.json
 ...
```

---

### Phase 2: GitHubリポジトリの作成（3分）

#### 2.1 GitHubにアクセス

ブラウザで https://github.com/orgs/VOXX-tools/repositories にアクセス

#### 2.2 新しいリポジトリを作成

1. 「New repository」ボタンをクリック
2. 以下の情報を入力：
   - **Repository name**: `vam-campaign-dashboard`
   - **Description**: `VAM Campaign Monitoring Dashboard - キャンペーン監視ダッシュボード`
   - **Visibility**: Private（推奨）または Public
   - **Initialize this repository with**: 何もチェックしない（重要！）

3. 「Create repository」ボタンをクリック


#### 2.3 リモートリポジトリを追加

GitHubのリポジトリ作成後に表示される画面から、以下のコマンドをコピーして実行：

```bash
git remote add origin https://github.com/VOXX-tools/vam-campaign-dashboard.git
```

または、SSH を使用する場合：

```bash
git remote add origin git@github.com:VOXX-tools/vam-campaign-dashboard.git
```

#### 2.4 リモートリポジトリを確認

```bash
git remote -v
```

**期待される出力**:
```
origin  https://github.com/VOXX-tools/vam-campaign-dashboard.git (fetch)
origin  https://github.com/VOXX-tools/vam-campaign-dashboard.git (push)
```

#### 2.5 mainブランチにプッシュ

```bash
git branch -M main
git push -u origin main
```

**期待される出力**:
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
...
To https://github.com/VOXX-tools/vam-campaign-dashboard.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```


---

### Phase 3: Vercelにデプロイ（10分）

#### 3.1 Vercelにログイン

1. https://vercel.com/ にアクセス
2. 「Sign Up」または「Log In」をクリック
3. 「Continue with GitHub」を選択

#### 3.2 新しいプロジェクトをインポート

1. Vercel Dashboardで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで `vam-campaign-dashboard` を検索
3. リポジトリが見つからない場合：
   - 「Adjust GitHub App Permissions」をクリック
   - VOXX-tools organizationへのアクセスを許可
   - 再度検索
4. リポジトリの横にある「Import」ボタンをクリック

#### 3.3 プロジェクト設定

「Configure Project」画面で以下を確認：

- **Project Name**: `vam-campaign-dashboard`
- **Framework Preset**: `Vite`（自動検出）
- **Root Directory**: `.`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`


#### 3.4 環境変数を設定

「Environment Variables」セクションで以下の5つの環境変数を追加：

**変数1: VITE_GOOGLE_CLIENT_ID**
- Key: `VITE_GOOGLE_CLIENT_ID`
- Value: `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com`
- Environment: Production, Preview, Development（すべてチェック）

**変数2: VITE_SPREADSHEET_ID**
- Key: `VITE_SPREADSHEET_ID`
- Value: `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA`
- Environment: Production, Preview, Development（すべてチェック）

**変数3: VITE_SHEET_NAME**
- Key: `VITE_SHEET_NAME`
- Value: `進捗率タブ`
- Environment: Production, Preview, Development（すべてチェック）

**変数4: BASIC_AUTH_USER**
- Key: `BASIC_AUTH_USER`
- Value: `admin`（または任意のユーザー名）
- Environment: Production, Preview, Development（すべてチェック）

**変数5: BASIC_AUTH_PASSWORD**
- Key: `BASIC_AUTH_PASSWORD`
- Value: 強力なパスワード（例: `VAM2024!SecurePass`）
- Environment: Production, Preview, Development（すべてチェック）


#### 3.5 デプロイを実行

1. 「Deploy」ボタンをクリック
2. ビルドプロセスが開始されます（1-3分）
3. デプロイが成功すると、URLが表示されます

**デプロイURL例**: `https://vam-campaign-dashboard.vercel.app`

---

### Phase 4: Google Cloud Consoleの設定更新（3分）

#### 4.1 デプロイURLをコピー

Vercelから表示されたURLをコピー（例: `https://vam-campaign-dashboard.vercel.app`）

#### 4.2 Google Cloud Consoleにアクセス

1. https://console.cloud.google.com/ にアクセス
2. プロジェクト「VAM Campaign Dashboard」を選択
3. 「APIとサービス」→「認証情報」をクリック
4. OAuth 2.0クライアントID `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com` をクリック

#### 4.3 承認済みのJavaScript生成元を追加

「承認済みのJavaScript生成元」セクションで、VercelのURLを追加：

```
https://vam-campaign-dashboard.vercel.app
```

**重要**: 
- `https://` を使用
- 末尾にスラッシュ `/` を付けない
- 実際のVercel URLに置き換える


#### 4.4 承認済みのリダイレクトURIを追加

「承認済みのリダイレクトURI」セクションで、同じURLを追加：

```
https://vam-campaign-dashboard.vercel.app
```

#### 4.5 保存

「保存」ボタンをクリック

**注意**: 変更が反映されるまで数分かかる場合があります。

---

### Phase 5: 動作確認（5分）

#### 5.1 Basic認証の確認

1. デプロイURLにアクセス
2. Basic認証ダイアログが表示される
3. 設定したユーザー名とパスワードを入力
4. ログイン成功

#### 5.2 Google OAuth認証の確認

1. 「Googleでログイン」ボタンをクリック
2. Googleアカウントを選択
3. 権限を承認
4. ダッシュボードが表示される

#### 5.3 データ取得の確認

- ✅ キャンペーン一覧が表示される
- ✅ ステータスバッジが表示される
- ✅ フィルタリング・ソート機能が動作する
- ✅ すべてのタブが動作する

---

## トラブルシューティング

### 問題1: git push時に認証エラー

**症状**: `Authentication failed` エラー

**解決策**:
1. GitHubの個人アクセストークンを作成
2. https://github.com/settings/tokens にアクセス
3. 「Generate new token (classic)」をクリック
4. `repo` スコープを選択
5. トークンをコピー
6. git pushの際、パスワードの代わりにトークンを使用


### 問題2: Vercelでビルドエラー

**症状**: ビルドが失敗する

**解決策**:
1. ローカルで `npm run build` を実行してエラーを確認
2. Vercelのビルドログを確認
3. 環境変数が正しく設定されているか確認

### 問題3: リポジトリがVercelに表示されない

**症状**: Vercelでリポジトリが見つからない

**解決策**:
1. 「Adjust GitHub App Permissions」をクリック
2. VOXX-tools organizationへのアクセスを許可
3. Vercelページをリロード

---

## 完了チェックリスト

- [ ] Gitリポジトリを初期化（`git init`）
- [ ] 初回コミット（`git commit`）
- [ ] GitHubリポジトリを作成
- [ ] リモートリポジトリを追加（`git remote add origin`）
- [ ] GitHubにプッシュ（`git push -u origin main`）
- [ ] Vercelプロジェクトを作成
- [ ] 環境変数を設定（5つ）
- [ ] デプロイを実行
- [ ] Google Cloud Consoleを更新
- [ ] Basic認証の動作確認
- [ ] Googleログインの動作確認
- [ ] データ取得の動作確認

---

## 次のステップ

デプロイが完了したら：

1. チームメンバーにURLとBasic認証情報を共有
2. 定期的にデータを確認
3. 必要に応じてカスタムドメインを設定

**デプロイ完了！** 🎉
