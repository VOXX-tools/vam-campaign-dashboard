# 既存のVercelプロジェクトを使用する方法

エラー「プロジェクト「vam-campaign-dashboard-63ju」は既に存在します」が表示された場合の対処法です。

## 状況

既にVercelにプロジェクトが作成されているため、新規作成ではなく既存のプロジェクトを更新します。

---

## 解決方法1: 既存のプロジェクトを確認・更新（推奨）

### ステップ1: Vercel Dashboardで既存プロジェクトを確認

1. https://vercel.com/dashboard にアクセス
2. プロジェクト一覧から `vam-campaign-dashboard` を探す
3. プロジェクトをクリック

### ステップ2: 環境変数を確認・設定

1. プロジェクト画面で「Settings」タブをクリック
2. 左側のメニューから「Environment Variables」をクリック
3. 以下の5つの環境変数が設定されているか確認：

#### 必要な環境変数（5つ）

```
✅ VITE_GOOGLE_CLIENT_ID
✅ VITE_SPREADSHEET_ID
✅ VITE_SHEET_NAME
✅ BASIC_AUTH_USER
✅ BASIC_AUTH_PASSWORD
```

### ステップ3: 環境変数が不足している場合

不足している環境変数を追加：

1. 「Add New」ボタンをクリック
2. 以下の値を入力（VERCEL_ENV_VARIABLES.mdを参照）

**変数1: VITE_GOOGLE_CLIENT_ID**
```
Key: VITE_GOOGLE_CLIENT_ID
Value: 997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com
Environment: Production, Preview, Development（すべてチェック）
```

**変数2: VITE_SPREADSHEET_ID**
```
Key: VITE_SPREADSHEET_ID
Value: 1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
Environment: Production, Preview, Development（すべてチェック）
```

**変数3: VITE_SHEET_NAME**
```
Key: VITE_SHEET_NAME
Value: 進捗率タブ
Environment: Production, Preview, Development（すべてチェック）
```

**変数4: BASIC_AUTH_USER**
```
Key: BASIC_AUTH_USER
Value: admin
Environment: Production, Preview, Development（すべてチェック）
```

**変数5: BASIC_AUTH_PASSWORD**
```
Key: BASIC_AUTH_PASSWORD
Value: VAM2024!Dashboard#Secure
Environment: Production, Preview, Development（すべてチェック）
```

3. 各変数を追加したら「Save」をクリック

### ステップ4: 再デプロイ

環境変数を追加・更新した場合、再デプロイが必要です：

1. プロジェクト画面の「Deployments」タブをクリック
2. 最新のデプロイメントの右側にある「...」メニューをクリック
3. 「Redeploy」を選択
4. 「Redeploy」ボタンをクリックして確認

または、GitHubにプッシュすると自動的に再デプロイされます：

```bash
# ダミーコミットを作成して再デプロイをトリガー
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### ステップ5: デプロイURLを確認

1. 「Deployments」タブで最新のデプロイが完了するまで待つ（1-3分）
2. デプロイが成功したら、「Visit」ボタンをクリックしてURLを確認
3. URLをコピー（例: `https://vam-campaign-dashboard-63ju.vercel.app`）

---

## 解決方法2: 新しいプロジェクト名で作成

既存のプロジェクトを使いたくない場合、新しい名前でプロジェクトを作成できます。

### ステップ1: プロジェクト名を変更

Vercelの「Configure Project」画面で：

1. 「Project Name」フィールドを見つける
2. 新しい名前を入力（例）：
   - `vam-campaign-dashboard-v2`
   - `vam-campaign-monitor`
   - `vam-dashboard-2024`

### ステップ2: 環境変数を設定

VERCEL_ENV_VARIABLES.mdの手順に従って5つの環境変数を設定

### ステップ3: デプロイ

「Deploy」ボタンをクリック

---

## 解決方法3: 既存のプロジェクトを削除して再作成

⚠️ 注意: この方法は既存のデプロイが削除されます。

### ステップ1: 既存プロジェクトを削除

1. Vercel Dashboard > プロジェクト一覧
2. `vam-campaign-dashboard` を見つける
3. プロジェクトをクリック
4. 「Settings」タブ > 「General」
5. 一番下までスクロール
6. 「Delete Project」セクションで「Delete」ボタンをクリック
7. プロジェクト名を入力して確認

### ステップ2: 新規プロジェクトを作成

VERCEL_QUICK_START.mdの手順に従って新規作成

---

## 推奨される方法

**解決方法1: 既存のプロジェクトを確認・更新** を推奨します。

理由：
- 既存のデプロイURLを維持できる
- 設定が既に存在する可能性がある
- 最も簡単で安全

---

## 次のステップ

既存プロジェクトの環境変数を設定・確認したら：

1. デプロイURLを取得
2. Google Cloud Consoleで承認済みのJavaScript生成元にURLを追加
3. 動作確認

詳細は VERCEL_QUICK_START.md の「ステップ7以降」を参照してください。

---

## トラブルシューティング

### Q: 既存プロジェクトが見つからない

A: 以下を確認：
- 正しいVercelアカウントでログインしているか
- VOXX-tools organizationのメンバーか
- プロジェクトが別のorganizationに作成されていないか

### Q: 環境変数を変更したのにデプロイに反映されない

A: 再デプロイが必要です：
- Deployments > 最新のデプロイ > Redeploy
- または、GitHubにプッシュして自動デプロイ

---

**既存プロジェクトを使用する場合、環境変数の設定を確認してください！** 🎯
