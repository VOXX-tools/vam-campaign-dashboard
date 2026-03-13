# Vercel環境変数エラーの解決方法

## エラー内容

```
Environment Variable "VITE_GOOGLE_CLIENT_ID" references Secret "vite_google_client_id", which does not exist.
```

このエラーは、環境変数が正しく設定されていないことを示しています。

---

## 問題の原因

`vercel.json` ファイルに以下の設定があります：

```json
"env": {
  "VITE_GOOGLE_CLIENT_ID": "@vite_google_client_id",
  "VITE_SPREADSHEET_ID": "@vite_spreadsheet_id",
  "VITE_SHEET_NAME": "@vite_sheet_name"
}
```

この `@` 記号は「Vercel Secret」を参照する構文ですが、Secretが作成されていないためエラーになっています。

---

## 解決方法1: vercel.jsonを修正（推奨）

`vercel.json` から `env` セクションを削除します。環境変数はVercel Dashboardで直接設定します。

### 修正手順

1. プロジェクトの `vercel.json` を開く
2. `env` セクション全体を削除
3. GitHubにプッシュ

修正後の `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**注意**: `env` セクションを完全に削除してください。

---

## 環境変数の設定場所（画像付き説明）

### ステップ1: Vercel Dashboardで環境変数を設定

1. Vercel Dashboard > プロジェクト > **Settings** タブをクリック
2. 左側のメニューから **Environment Variables** をクリック
3. 環境変数の追加画面が表示されます

### ステップ2: 環境変数を追加

画面には以下のフィールドがあります：

```
┌─────────────────────────────────────────────┐
│ Key                                         │
│ ┌─────────────────────────────────────────┐ │
│ │ VITE_GOOGLE_CLIENT_ID                   │ │ ← ここに変数名を入力
│ └─────────────────────────────────────────┘ │
│                                             │
│ Value                                       │
│ ┌─────────────────────────────────────────┐ │
│ │ 997500214167-v2jp7tancj9clig85oq1...   │ │ ← ここに値を入力
│ └─────────────────────────────────────────┘ │
│                                             │
│ Environment                                 │
│ ☐ Production                                │ ← ここにチェック
│ ☐ Preview                                   │ ← ここにチェック
│ ☐ Development                               │ ← ここにチェック
│                                             │
│ [Add]                                       │ ← クリックして追加
└─────────────────────────────────────────────┘
```

### ステップ3: チェックボックスの場所

**「Environment」セクション**に3つのチェックボックスがあります：

- ☐ **Production** ← クリックしてチェックを入れる
- ☐ **Preview** ← クリックしてチェックを入れる
- ☐ **Development** ← クリックしてチェックを入れる

**すべてにチェックを入れてください**（3つとも）。

### ステップ4: 追加ボタンをクリック

すべて入力したら、画面下部の **「Add」** ボタンをクリックします。

---

## 正しい環境変数の設定手順（詳細版）

### 変数1: VITE_GOOGLE_CLIENT_ID

1. **Key** 欄に入力:
   ```
   VITE_GOOGLE_CLIENT_ID
   ```

2. **Value** 欄に入力:
   ```
   997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com
   ```

3. **Environment** で3つすべてにチェック:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **「Add」** ボタンをクリック

---

### 変数2: VITE_SPREADSHEET_ID

1. **Key** 欄に入力:
   ```
   VITE_SPREADSHEET_ID
   ```

2. **Value** 欄に入力:
   ```
   1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
   ```

3. **Environment** で3つすべてにチェック:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **「Add」** ボタンをクリック

---

### 変数3: VITE_SHEET_NAME

1. **Key** 欄に入力:
   ```
   VITE_SHEET_NAME
   ```

2. **Value** 欄に入力:
   ```
   進捗率タブ
   ```

3. **Environment** で3つすべてにチェック:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **「Add」** ボタンをクリック

---

### 変数4: BASIC_AUTH_USER

1. **Key** 欄に入力:
   ```
   BASIC_AUTH_USER
   ```

2. **Value** 欄に入力:
   ```
   admin
   ```

3. **Environment** で3つすべてにチェック:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **「Add」** ボタンをクリック

---

### 変数5: BASIC_AUTH_PASSWORD

1. **Key** 欄に入力:
   ```
   BASIC_AUTH_PASSWORD
   ```

2. **Value** 欄に入力:
   ```
   VAM2024!Dashboard#Secure
   ```

3. **Environment** で3つすべてにチェック:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **「Add」** ボタンをクリック

---

## 確認方法

すべての環境変数を追加したら、画面に以下のように表示されます：

```
Environment Variables

VITE_GOOGLE_CLIENT_ID
  Production, Preview, Development
  997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com

VITE_SPREADSHEET_ID
  Production, Preview, Development
  1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA

VITE_SHEET_NAME
  Production, Preview, Development
  進捗率タブ

BASIC_AUTH_USER
  Production, Preview, Development
  admin

BASIC_AUTH_PASSWORD
  Production, Preview, Development
  ••••••••••••••••••••••••
```

5つの変数がすべて表示され、それぞれに「Production, Preview, Development」と表示されていることを確認してください。

---

## エラー解決の完全な手順

### ステップ1: vercel.jsonを修正

現在のプロジェクトで `vercel.json` の `env` セクションを削除します。

### ステップ2: 変更をコミット＆プッシュ

```bash
git add vercel.json
git commit -m "Fix: Remove env section from vercel.json"
git push origin main
```

### ステップ3: Vercel Dashboardで環境変数を設定

上記の手順に従って5つの環境変数を追加します。

### ステップ4: 再デプロイ

1. Vercel Dashboard > プロジェクト > **Deployments** タブ
2. 最新のデプロイの右側にある **「...」** メニューをクリック
3. **「Redeploy」** を選択
4. **「Redeploy」** ボタンをクリックして確認

または、GitHubにプッシュすると自動的に再デプロイされます。

---

## トラブルシューティング

### Q: チェックボックスが見つからない

A: 「Environment」というラベルの下に3つのチェックボックスがあります。画面をスクロールして探してください。

### Q: 環境変数を追加したのにエラーが出る

A: 以下を確認：
1. `vercel.json` の `env` セクションを削除したか
2. 5つの環境変数すべてを追加したか
3. すべての変数で3つの環境にチェックを入れたか
4. 再デプロイを実行したか

### Q: 「Add」ボタンが押せない

A: 以下を確認：
1. Key と Value の両方が入力されているか
2. 少なくとも1つの Environment にチェックが入っているか

---

**この手順に従えば、エラーは解決します！** 🎯
