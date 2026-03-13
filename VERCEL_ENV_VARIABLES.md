# Vercel 環境変数の設定内容（コピペ用）

このドキュメントには、Vercelに設定する環境変数の具体的な値が記載されています。
コピー＆ペーストして使用してください。

---

## 📋 環境変数一覧（5つ）

### 変数1: VITE_GOOGLE_CLIENT_ID

**Key（変数名）**:
```
VITE_GOOGLE_CLIENT_ID
```

**Value（値）**:
```
997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com
```

**説明**: Google OAuth 2.0のクライアントID
**Environment**: ✅ Production ✅ Preview ✅ Development（すべてチェック）

---

### 変数2: VITE_SPREADSHEET_ID

**Key（変数名）**:
```
VITE_SPREADSHEET_ID
```

**Value（値）**:
```
1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
```

**説明**: GoogleスプレッドシートのID
**Environment**: ✅ Production ✅ Preview ✅ Development（すべてチェック）

---

### 変数3: VITE_SHEET_NAME

**Key（変数名）**:
```
VITE_SHEET_NAME
```

**Value（値）**:
```
進捗率タブ
```

**説明**: スプレッドシート内のシート名
**Environment**: ✅ Production ✅ Preview ✅ Development（すべてチェック）

---

### 変数4: BASIC_AUTH_USER

**Key（変数名）**:
```
BASIC_AUTH_USER
```

**Value（値）**:
```
admin
```

**説明**: Basic認証のユーザー名（任意の値に変更可能）
**Environment**: ✅ Production ✅ Preview ✅ Development（すべてチェック）

**注意**: `admin` は例です。好きなユーザー名に変更できます。
- 例: `vam-admin`
- 例: `voxx-user`
- 例: `dashboard-user`

---

### 変数5: BASIC_AUTH_PASSWORD ⚠️ 重要

**Key（変数名）**:
```
BASIC_AUTH_PASSWORD
```

**Value（値）**: 以下から選択、または独自のパスワードを作成

#### オプション1: 推奨パスワード（強力）
```
VAM2024!Dashboard#Secure
```

#### オプション2: より強力なパスワード
```
Voxx@VAM2024!Campaign#Monitor$
```

#### オプション3: シンプルだが強力
```
VAMdash2024!Secure#
```

#### オプション4: 独自のパスワードを作成

以下の条件を満たすパスワードを作成してください：
- ✅ 最低12文字以上
- ✅ 大文字を含む（A-Z）
- ✅ 小文字を含む（a-z）
- ✅ 数字を含む（0-9）
- ✅ 記号を含む（!@#$%^&*）

**説明**: Basic認証のパスワード
**Environment**: ✅ Production ✅ Preview ✅ Development（すべてチェック）

**重要**: 
- このパスワードは後で変更できます
- チームメンバーと共有する必要があります
- 安全な場所に保管してください

---

## 📝 設定手順（画面操作）

Vercelの「Configure Project」画面で：

### 1つ目の変数を追加

1. 「Environment Variables」セクションを見つける
2. 「Key」欄に `VITE_GOOGLE_CLIENT_ID` と入力
3. 「Value」欄に `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com` をコピペ
4. 「Environment」で **Production, Preview, Development すべてにチェック**
5. 「Add」ボタンをクリック

### 2つ目の変数を追加

1. 「Key」欄に `VITE_SPREADSHEET_ID` と入力
2. 「Value」欄に `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA` をコピペ
3. 「Environment」で **Production, Preview, Development すべてにチェック**
4. 「Add」ボタンをクリック

### 3つ目の変数を追加

1. 「Key」欄に `VITE_SHEET_NAME` と入力
2. 「Value」欄に `進捗率タブ` をコピペ
3. 「Environment」で **Production, Preview, Development すべてにチェック**
4. 「Add」ボタンをクリック

### 4つ目の変数を追加

1. 「Key」欄に `BASIC_AUTH_USER` と入力
2. 「Value」欄に `admin` と入力（または任意のユーザー名）
3. 「Environment」で **Production, Preview, Development すべてにチェック**
4. 「Add」ボタンをクリック

### 5つ目の変数を追加

1. 「Key」欄に `BASIC_AUTH_PASSWORD` と入力
2. 「Value」欄に選択したパスワードをコピペ（例: `VAM2024!Dashboard#Secure`）
3. 「Environment」で **Production, Preview, Development すべてにチェック**
4. 「Add」ボタンをクリック

---

## ✅ 確認チェックリスト

すべての変数を追加したら、以下を確認：

- [ ] `VITE_GOOGLE_CLIENT_ID` が追加されている
- [ ] `VITE_SPREADSHEET_ID` が追加されている
- [ ] `VITE_SHEET_NAME` が追加されている
- [ ] `BASIC_AUTH_USER` が追加されている
- [ ] `BASIC_AUTH_PASSWORD` が追加されている
- [ ] すべての変数で Production, Preview, Development にチェックが入っている

確認できたら「Deploy」ボタンをクリックしてデプロイを開始します。

---

## 📝 設定内容のメモ（保管用）

デプロイ後、以下の情報を安全な場所に保管してください：

```
=== VAM Campaign Dashboard - 認証情報 ===

デプロイURL: https://vam-campaign-dashboard.vercel.app

Basic認証:
- ユーザー名: admin
- パスワード: （設定したパスワード）

Google OAuth:
- クライアントID: 997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com

スプレッドシート:
- ID: 1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
- シート名: 進捗率タブ

デプロイ日: 2024年XX月XX日
```

---

## ❓ よくある質問

### Q1: パスワードを忘れた場合は？

A: Vercel Dashboardで変更できます：
1. Vercel Dashboard > プロジェクト > Settings > Environment Variables
2. `BASIC_AUTH_PASSWORD` を探す
3. 「Edit」をクリックして新しいパスワードを設定
4. 再デプロイが自動的に実行されます

### Q2: ユーザー名を変更したい場合は？

A: 同様にVercel Dashboardで変更できます：
1. `BASIC_AUTH_USER` を編集
2. 新しいユーザー名を設定
3. 再デプロイが自動的に実行されます

### Q3: 環境変数を間違えた場合は？

A: デプロイ前なら：
- 「Edit」ボタンで修正できます

デプロイ後なら：
- Vercel Dashboard > Settings > Environment Variables で修正
- 修正後、再デプロイが必要です

---

**これで環境変数の設定準備は完了です！** 🎉

次は「Deploy」ボタンをクリックしてデプロイを開始してください。
