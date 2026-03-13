# Vercel Cron Job セットアップガイド

## 問題

現在の実装では、ブラウザが開いている時のみデータ取得が行われます。そのため、ブラウザを閉じている時間帯（例: 20時、21時）のデータがFirestoreに保存されません。

## 解決策

Vercel Cron Jobsを使用して、サーバーサイドで定期的にデータを取得・保存します。

## 現在の制限事項

**重要**: 現在の実装はOAuth 2.0（ユーザー認証）を使用しているため、サーバーサイドでは動作しません。

サーバーサイドでGoogle Sheets APIにアクセスするには、以下のいずれかが必要です：

### オプション1: Service Account認証（推奨）

1. **Google Cloud Consoleでサービスアカウントを作成**:
   - https://console.cloud.google.com/iam-admin/serviceaccounts
   - プロジェクト: `VAM Campaign Dashboard`
   - 「サービスアカウントを作成」をクリック
   - 名前: `vam-dashboard-cron`
   - 役割: なし（スプレッドシートへのアクセス権のみ必要）

2. **JSONキーをダウンロード**:
   - 作成したサービスアカウントをクリック
   - 「キー」タブ → 「鍵を追加」 → 「新しい鍵を作成」
   - JSON形式を選択してダウンロード

3. **スプレッドシートに共有権限を付与**:
   - スプレッドシート（ID: `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA`）を開く
   - 「共有」をクリック
   - サービスアカウントのメールアドレス（例: `vam-dashboard-cron@xxx.iam.gserviceaccount.com`）を追加
   - 権限: 閲覧者

4. **Vercel環境変数に設定**:
   ```bash
   # JSONキーの内容をBase64エンコード
   cat service-account-key.json | base64
   
   # Vercelに環境変数を追加
   GOOGLE_SERVICE_ACCOUNT_KEY=<base64エンコードされたJSON>
   CRON_SECRET=<ランダムな文字列>
   ```

5. **api/cron-fetch.tsを実装**:
   - Service Account認証を使用してGoogle Sheets APIにアクセス
   - データを取得してFirestoreに保存

### オプション2: スプレッドシートを公開（非推奨）

スプレッドシートを「リンクを知っている全員」に公開し、APIキーで認証します。

**セキュリティリスク**: データが公開されるため推奨しません。

## Vercel Cron Jobsの設定

`vercel.json`に以下を追加済み：

\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron-fetch",
      "schedule": "5 * * * *"
    }
  ]
}
\`\`\`

- **schedule**: `5 * * * *` = 毎時5分に実行
- **path**: `/api/cron-fetch` = 実行するAPIエンドポイント

## 料金

- **Vercel Cron Jobs**: Hobby（無料）プランでは利用不可、Pro（$20/月）プラン以上が必要
- **代替案**: GitHub Actionsを使用（無料）

## GitHub Actionsを使用する場合（無料代替案）

`.github/workflows/cron-fetch.yml`を作成：

\`\`\`yaml
name: Fetch Campaign Data

on:
  schedule:
    - cron: '5 * * * *'  # 毎時5分
  workflow_dispatch:  # 手動実行も可能

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Call Vercel API
        run: |
          curl -X POST https://your-app.vercel.app/api/cron-fetch \\
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
\`\`\`

## 次のステップ

1. Service Account認証を実装するか、GitHub Actionsを使用するか決定
2. 実装を完了
3. テスト実行
4. 24時間監視して、すべての時間帯のデータが保存されることを確認

## 現在の状態

- ✅ Vercel Cron Jobsの設定完了（`vercel.json`）
- ✅ APIエンドポイント作成（`api/cron-fetch.ts`）
- ❌ Service Account認証の実装（未完了）
- ❌ 本番環境でのテスト（未完了）
