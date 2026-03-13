# クイックデプロイガイド

このガイドは、VAMキャンペーン監視ダッシュボードを最速でVercelにデプロイするための簡易手順です。

## 前提条件

- [ ] GitHubアカウント
- [ ] Vercelアカウント
- [ ] Google Cloud Consoleでプロジェクトが設定済み

## 5分でデプロイ

### 1. Vercelにインポート（1分）

1. https://vercel.com/new にアクセス
2. GitHubリポジトリ `VOXX-tools/vam-campaign-dashboard` を選択
3. "Import"をクリック

### 2. 環境変数を設定（2分）

以下の5つの環境変数を追加（すべての環境: Production, Preview, Development）：

```
VITE_GOOGLE_CLIENT_ID=997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com
VITE_SPREADSHEET_ID=1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
VITE_SHEET_NAME=進捗率タブ
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=your-strong-password-here
```

**重要**: `BASIC_AUTH_PASSWORD`は強力なパスワードに変更してください！

### 3. デプロイ（1分）

1. "Deploy"ボタンをクリック
2. ビルドが完了するまで待機
3. デプロイURLをコピー

### 4. Google Cloud Consoleを更新（1分）

1. https://console.cloud.google.com/ にアクセス
2. "APIとサービス" > "認証情報"に移動
3. OAuth 2.0クライアントIDを選択
4. "承認済みのJavaScript生成元"に追加：
   ```
   https://your-project-name.vercel.app
   ```
5. "承認済みのリダイレクトURI"に追加：
   ```
   https://your-project-name.vercel.app
   ```
6. "保存"をクリック

### 5. 動作確認（30秒）

1. デプロイURLにアクセス
2. Basic認証でログイン（設定したユーザー名とパスワード）
3. Googleでログイン
4. ダッシュボードが表示されることを確認

## 完了！

デプロイが完了しました。詳細な設定やトラブルシューティングは`VERCEL_DEPLOYMENT.md`を参照してください。

## よくある質問

### Q: Basic認証のダイアログが表示されない

A: 以下を確認してください：
- `middleware.ts`がプロジェクトルートに存在する
- 環境変数`BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`が設定されている
- デプロイが完了している（ビルドログを確認）

### Q: "redirect_uri_mismatch"エラーが発生する

A: Google Cloud Consoleで承認済みのリダイレクトURIにVercelのURLが追加されているか確認してください。URLは完全一致する必要があります。

### Q: データが表示されない

A: 以下を確認してください：
- 環境変数`VITE_SPREADSHEET_ID`と`VITE_SHEET_NAME`が正しい
- Googleスプレッドシートへのアクセス権限がある
- ブラウザのコンソールにエラーメッセージがないか確認

### Q: 自動デプロイを無効にしたい

A: Vercel Dashboard > プロジェクト > "Settings" > "Git" > "Production Branch"で設定を変更できます。

## 次のステップ

- [ ] カスタムドメインを設定する
- [ ] Slackに通知を設定する
- [ ] アナリティクスを確認する
- [ ] パフォーマンスを最適化する

詳細は`VERCEL_DEPLOYMENT.md`を参照してください。
