# GitHub Actions セットアップガイド

## 概要

GitHub Actionsを使用して、毎時5分にサーバーサイドでデータを取得・保存します。
完全無料で、ブラウザを開いていなくてもデータ収集が継続されます。

## セットアップ手順

### ステップ1: Google Cloud Console - Service Accountの作成

1. **Google Cloud Consoleにアクセス**:
   - https://console.cloud.google.com/
   - プロジェクト: `VAM Campaign Dashboard`を選択

2. **Service Accountを作成**:
   - 左メニュー → 「IAMと管理」 → 「サービスアカウント」
   - 「サービスアカウントを作成」をクリック
   - サービスアカウント名: `vam-dashboard-cron`
   - サービスアカウントID: `vam-dashboard-cron`（自動生成）
   - 「作成して続行」をクリック
   - 役割: なし（スキップ）
   - 「完了」をクリック

3. **JSONキーをダウンロード**:
   - 作成したサービスアカウント（`vam-dashboard-cron@...`）をクリック
   - 「キー」タブをクリック
   - 「鍵を追加」 → 「新しい鍵を作成」
   - キーのタイプ: JSON
   - 「作成」をクリック
   - JSONファイルがダウンロードされます（安全に保管してください）

4. **Google Sheets APIを有効化**（既に有効化済みの場合はスキップ）:
   - 左メニュー → 「APIとサービス」 → 「ライブラリ」
   - 「Google Sheets API」を検索
   - 「有効にする」をクリック

### ステップ2: スプレッドシートに共有権限を付与

1. **スプレッドシートを開く**:
   - https://docs.google.com/spreadsheets/d/1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA/edit

2. **共有設定**:
   - 右上の「共有」ボタンをクリック
   - Service Accountのメールアドレスを追加:
     - 例: `vam-dashboard-cron@vam-campaign-dashboard-66377.iam.gserviceaccount.com`
     - （JSONファイルの`client_email`フィールドに記載）
   - 権限: 「閲覧者」
   - 「送信」をクリック

### ステップ3: GitHub Secretsの設定

1. **GitHubリポジトリにアクセス**:
   - https://github.com/VOXX-tools/vam-campaign-dashboard

2. **Secretsを追加**:
   - 「Settings」タブ → 「Secrets and variables」 → 「Actions」
   - 「New repository secret」をクリック

3. **GOOGLE_SERVICE_ACCOUNT_KEYを追加**:
   - Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Secret: 
     ```bash
     # ダウンロードしたJSONファイルをBase64エンコード
     cat service-account-key.json | base64
     ```
     - 出力された文字列をコピーして貼り付け
   - 「Add secret」をクリック

4. **CRON_SECRETを追加**:
   - Name: `CRON_SECRET`
   - Secret: ランダムな文字列（例: `your-random-secret-key-here-12345`）
   - 「Add secret」をクリック

### ステップ4: Vercel環境変数の設定

1. **Vercelダッシュボードにアクセス**:
   - https://vercel.com/voxx-tools/vam-campaign-dashboard

2. **環境変数を追加**:
   - 「Settings」 → 「Environment Variables」
   - 以下の変数を追加（Production, Preview, Development すべてにチェック）:

   **GOOGLE_SERVICE_ACCOUNT_KEY**:
   ```bash
   # 同じBase64エンコードされた文字列
   cat service-account-key.json | base64
   ```

   **CRON_SECRET**:
   ```
   your-random-secret-key-here-12345
   ```
   （GitHub Secretsと同じ値）

3. **既存の環境変数を確認**:
   - `VITE_SPREADSHEET_ID`: `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA`
   - `VITE_SHEET_NAME`: `進捗率タブ`
   - Firebase関連の環境変数（既に設定済み）

4. **Redeployを実行**:
   - 「Deployments」タブ → 最新のデプロイの「...」 → 「Redeploy」

### ステップ5: 動作確認

1. **手動実行でテスト**:
   - GitHubリポジトリ → 「Actions」タブ
   - 「Fetch Campaign Data」ワークフローをクリック
   - 「Run workflow」 → 「Run workflow」
   - 実行結果を確認（緑色のチェックマークが表示されればOK）

2. **ログを確認**:
   - ワークフローの実行をクリック
   - 「fetch」ジョブをクリック
   - ログに「✅ Data fetched and saved successfully」が表示されることを確認

3. **Firestoreを確認**:
   - Firebase Console → Firestore Database
   - `campaigns/latest`ドキュメントが更新されていることを確認
   - `timeseries`コレクションに新しいドキュメントが追加されていることを確認

4. **ダッシュボードを確認**:
   - https://vam-campaign-dashboard.vercel.app/
   - 「更新」ボタンをクリックせずにページをリロード
   - 最新のデータが表示されることを確認

### ステップ6: 自動実行の確認

1. **次回の実行を待つ**:
   - 毎時5分に自動実行されます
   - 例: 10:05, 11:05, 12:05, ...

2. **24時間監視**:
   - 翌日、すべての時間帯（0-23時）のデータが保存されていることを確認
   - 特に20時・21時のデータが欠けていないか確認

## トラブルシューティング

### エラー: 401 Unauthorized

- `CRON_SECRET`がGitHub SecretsとVercel環境変数で一致していることを確認

### エラー: 403 Forbidden

- Service Accountにスプレッドシートの閲覧権限が付与されていることを確認
- Google Sheets APIが有効化されていることを確認

### エラー: 500 Internal Server Error

- Vercelのログを確認: https://vercel.com/voxx-tools/vam-campaign-dashboard/logs
- `GOOGLE_SERVICE_ACCOUNT_KEY`が正しくBase64エンコードされていることを確認

### データが保存されない

- Firestoreのセキュリティルールを確認
- Firebase環境変数が正しく設定されていることを確認

## 料金

- **GitHub Actions**: 無料（月2,000分まで、このワークフローは1回あたり数秒）
- **Vercel Serverless Functions**: 無料（月100,000リクエストまで）
- **Firebase Firestore**: 無料枠内（読み取り: 50,000/日、書き込み: 20,000/日）

## 次のステップ

1. セットアップ完了後、24時間監視
2. すべての時間帯のデータが保存されることを確認
3. 問題がなければ、ブラウザを閉じても安心

## 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
