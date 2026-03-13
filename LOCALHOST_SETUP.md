# ローカル開発環境のセットアップ手順

このガイドでは、ローカル環境でVAMキャンペーン監視ダッシュボードを起動し、Googleスプレッドシートからデータを取得する手順を説明します。

## 前提条件

- ✅ Node.jsがインストールされている
- ✅ 依存関係がインストールされている（`npm install`実行済み）
- ✅ `.env`ファイルが存在し、環境変数が設定されている
- ⚠️ Google Cloud Consoleでローカルホストを承認する必要がある

## 手順

### 1. Google Cloud Consoleでローカルホストを承認

スプレッドシートからデータを取得するには、Google Cloud Consoleでローカルホストを承認済みのJavaScript生成元として追加する必要があります。

#### 1.1 Google Cloud Consoleにアクセス

1. https://console.cloud.google.com/ にアクセス
2. プロジェクト「VAM Campaign Dashboard」を選択

#### 1.2 OAuth 2.0クライアントIDを編集

1. 左側のメニューから「APIとサービス」→「認証情報」をクリック
2. 「OAuth 2.0 クライアント ID」セクションで、クライアントID `997500214167-v2jp7tancj9clig85oq1k80a8quumpo8.apps.googleusercontent.com` をクリック

#### 1.3 承認済みのJavaScript生成元を追加

「承認済みのJavaScript生成元」セクションで、以下のURIを追加：

```
http://localhost:5173
```

**重要**: 
- `http://` を使用（`https://` ではない）
- ポート番号 `:5173` を含める
- 末尾にスラッシュ `/` を付けない

#### 1.4 承認済みのリダイレクトURIを追加

「承認済みのリダイレクトURI」セクションで、以下のURIを追加：

```
http://localhost:5173
```

#### 1.5 保存

「保存」ボタンをクリックして変更を保存します。

**注意**: 変更が反映されるまで数分かかる場合があります。

### 2. 開発サーバーを起動

ターミナルで以下のコマンドを実行：

```bash
npm run dev
```

以下のような出力が表示されます：

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 3. ブラウザでアクセス

ブラウザで http://localhost:5173 にアクセスします。

### 4. Googleでログイン

1. 「Googleでログイン」ボタンが表示されます
2. ボタンをクリックしてGoogleアカウントを選択
3. 権限の承認画面が表示されたら「許可」をクリック
4. ログインが成功すると、ダッシュボードが表示されます

### 5. データ取得の確認

ログイン後、以下を確認してください：

- ✅ キャンペーン一覧が表示される
- ✅ ステータスバッジ（CRITICAL/WARNING/HEALTHY）が表示される
- ✅ フィルタリング機能が動作する
- ✅ タブ切り替え（キャンペーン一覧/時系列分析/代理店別分析）が動作する

## トラブルシューティング

### 問題1: 「redirect_uri_mismatch」エラーが発生する

**原因**: Google Cloud Consoleで承認済みのJavaScript生成元またはリダイレクトURIが正しく設定されていない

**解決策**:
1. Google Cloud Consoleで設定を確認
2. `http://localhost:5173` が正確に入力されているか確認（末尾のスラッシュなし）
3. 変更を保存してから数分待つ
4. ブラウザのキャッシュをクリアして再試行

### 問題2: データが表示されない

**原因**: スプレッドシートへのアクセス権限がない、またはシート名が間違っている

**解決策**:
1. `.env`ファイルの`VITE_SHEET_NAME`が「進捗率タブ」になっているか確認
2. スプレッドシート（https://docs.google.com/spreadsheets/d/1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA/edit）にアクセスできるか確認
3. ブラウザのコンソール（F12）でエラーメッセージを確認

### 問題3: ログインボタンが表示されない

**原因**: Google Identity Servicesスクリプトが読み込まれていない

**解決策**:
1. ブラウザのコンソール（F12）でエラーメッセージを確認
2. インターネット接続を確認
3. 開発サーバーを再起動（Ctrl+C → `npm run dev`）

### 問題4: 「Access blocked: This app's request is invalid」エラー

**原因**: OAuth同意画面の設定が不完全

**解決策**:
1. Google Cloud Consoleで「APIとサービス」→「OAuth同意画面」に移動
2. 「公開ステータス」が「テスト」になっているか確認
3. 「テストユーザー」にログインするGoogleアカウントが追加されているか確認

## データ更新のタイミング

- **スプレッドシート更新**: 毎時0分
- **ダッシュボード取得**: 毎時5分（自動）
- **手動更新**: ページをリロード（F5）

## 次のステップ

ローカルで動作確認ができたら、Vercelにデプロイします：

1. `QUICK_DEPLOY.md`を参照して5分でデプロイ
2. または`VERCEL_DEPLOYMENT.md`を参照して詳細な手順を確認

## 参考リンク

- [Google Cloud Console](https://console.cloud.google.com/)
- [スプレッドシート](https://docs.google.com/spreadsheets/d/1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA/edit)
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - OAuth 2.0の詳細設定
- [GOOGLE_SHEETS_API_SETUP.md](./GOOGLE_SHEETS_API_SETUP.md) - Sheets APIの詳細設定
