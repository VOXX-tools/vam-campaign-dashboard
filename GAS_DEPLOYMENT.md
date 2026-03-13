# Google Apps Script デプロイ手順

このドキュメントでは、VAMキャンペーン監視ダッシュボード用のGoogle Apps Script (GAS) Web Appをデプロイする手順を説明します。

## 前提条件

- Googleスプレッドシートへのアクセス権限
- スプレッドシートID: `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA`
- シート名: `進捗率タブ`

## デプロイ手順

### 1. Google Apps Scriptプロジェクトを開く

1. 対象のGoogleスプレッドシートを開く
2. メニューから「拡張機能」→「Apps Script」を選択
3. 新しいタブでApps Scriptエディタが開きます

### 2. スクリプトをコピー

1. `Code.gs`ファイルの内容をすべてコピー
2. Apps Scriptエディタの`コード.gs`ファイルに貼り付け
3. 保存アイコン（💾）をクリックして保存

### 3. Web Appとしてデプロイ

1. Apps Scriptエディタの右上にある「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. 「種類の選択」で「ウェブアプリ」を選択
4. 以下の設定を行う：
   - **説明**: `VAM Campaign Dashboard API v1`（任意）
   - **次のユーザーとして実行**: `自分`
   - **アクセスできるユーザー**: 
     - 組織内のユーザーのみにアクセスを制限する場合: `組織内のユーザー`
     - 誰でもアクセス可能にする場合: `全員`
5. 「デプロイ」ボタンをクリック
6. 初回デプロイ時は承認が必要です：
   - 「アクセスを承認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「（プロジェクト名）に移動」をクリック
   - 「許可」をクリック

### 4. デプロイURLを取得

1. デプロイが完了すると、**ウェブアプリのURL**が表示されます
2. このURLをコピーして保存してください
   - 形式: `https://script.google.com/macros/s/XXXXX/exec`
3. このURLをフロントエンドアプリケーションの環境変数として設定します

## テスト手順

### ブラウザでテスト

1. デプロイURLをブラウザのアドレスバーに貼り付けてアクセス
2. JSON形式のレスポンスが表示されることを確認
3. 以下の項目が含まれていることを確認：
   - `success: true`
   - `timestamp`: 現在時刻
   - `count`: キャンペーン数
   - `data`: キャンペーンデータの配列

### curlでテスト

```bash
curl "https://script.google.co
m/macros/s/XXXXX/exec"
```

期待されるレスポンス例：

```json
{
  "success": true,
  "timestamp": "2024-01-15T12:00:00.000Z",
  "count": 50,
  "data": [
    {
      "CAMPAIGN_URL": "https://...",
      "ORDER_NAME": "Sample Order",
      "ADVERTISER_NAME": "Sample Advertiser",
      "AGENCY_NAME": "Sample Agency",
      "CAMPAIGN_ID": "12345",
      "CAMPAIGN_NAME": "Sample Campaign",
      "priority": 1,
      "START_TIME": "2024-01-01T00:00:00.000Z",
      "END_TIME": "2024-01-31T23:59:59.000Z",
      "deliveryDays": 30,
      "targetImp": 1000000,
      "cumulativeImp": 500000,
      "dailyImp": 33333,
      "deliveryCap": 50000,
      "todayImp": 25000,
      "totalHours": 720,
      "elapsedHours": 360,
      "timeProgressRate": 50,
      "impProgress": 500000,
      "progressRate": 50
    }
  ]
}
```

## 更新手順

スクリプトを更新する場合：

1. Apps Scriptエディタでコードを編集
2. 保存
3. 「デプロイ」→「デプロイを管理」を選択
4. 既存のデプロイの右側にある鉛筆アイコン（編集）をクリック
5. 「バージョン」を「新バージョン」に変更
6. 「デプロイ」をクリック

**注意**: URLは変わりません。既存のURLがそのまま使用できます。

## トラブルシューティング

### エラー: "ページを再読み込みして、もう一度お試しください"（デプロイ時）

このエラーはGoogle Apps Scriptのデプロイ画面でよく発生する一時的な問題です。以下の対処法を試してください：

**対処法1: ページを再読み込み**
1. ブラウザのページを再読み込み（F5またはCmd+R）
2. 再度「デプロイ」→「新しいデプロイ」を試す

**対処法2: プロジェクトを保存してから再試行**
1. Apps Scriptエディタで「プロジェクトを保存」（💾アイコン）をクリック
2. 数秒待ってから再度デプロイを試す

**対処法3: 別の方法でデプロイ**
1. Apps Scriptエディタの上部メニューから「デプロイ」→「デプロイをテスト」を選択
2. 「ウェブアプリ」を選択
3. 設定を確認して「実行」をクリック
4. テストが成功したら、「デプロイ」→「新しいデプロイ」を再試行

**対処法4: ブラウザのキャッシュをクリア**
1. ブラウザのキャッシュとCookieをクリア
2. Apps Scriptエディタを再度開く
3. デプロイを試す

**対処法5: シークレットモード/プライベートブラウジング**
1. ブラウザのシークレットモード（プライベートブラウジング）で開く
2. Googleアカウントにログイン
3. スプレッドシートを開いてApps Scriptエディタからデプロイ

**対処法6: 時間を置いて再試行**
- Googleのサーバー側の一時的な問題の可能性があります
- 5〜10分待ってから再度試してください

**対処法7: clasp（コマンドライン）を使用してデプロイ**

Google Apps Script CLIツール（clasp）を使用すると、コマンドラインからデプロイできます：

```bash
# claspをインストール（初回のみ）
npm install -g @google/clasp

# Googleアカウントでログイン
clasp login

# 既存のプロジェクトをクローン
clasp clone <SCRIPT_ID>

# または、スプレッドシートに紐付けられたプロジェクトを作成
clasp create --type sheets --title "VAM Campaign Dashboard API" --rootDir .

# コードをプッシュ
clasp push

# デプロイ
clasp deploy --description "VAM Campaign Dashboard API v1"

# デプロイIDを確認
clasp deployments
```

**SCRIPT_IDの確認方法**:
1. Apps Scriptエディタを開く
2. 左側のメニューから「プロジェクトの設定」（⚙️アイコン）をクリック
3. 「スクリプトID」をコピー

**対処法8: 新しいプロジェクトを作成**

現在のプロジェクトに問題がある可能性があります：

1. スプレッドシートで「拡張機能」→「Apps Script」を選択
2. 左上のプロジェクト名の横にある「︙」（縦3点）をクリック
3. 「プロジェクトを削除」を選択
4. 再度「拡張機能」→「Apps Script」を選択して新しいプロジェクトを作成
5. Code.gsの内容を貼り付けて保存
6. デプロイを試す

**対処法9: Google Cloudプロジェクトを確認**

Apps ScriptプロジェクトのGoogle Cloudプロジェクト設定に問題がある可能性があります：

1. Apps Scriptエディタで「プロジェクトの設定」（⚙️アイコン）をクリック
2. 「Google Cloud Platform（GCP）プロジェクト」セクションを確認
3. プロジェクト番号が表示されていることを確認
4. 表示されていない場合は、「プロジェクトを変更」をクリックして新しいプロジェクトを作成

**対処法10: 別のGoogleアカウントで試す**

現在のアカウントに権限の問題がある可能性があります：

1. 別のGoogleアカウント（管理者権限を持つアカウント）でログイン
2. スプレッドシートへのアクセス権限を付与
3. そのアカウントでApps Scriptを開いてデプロイ

**対処法11: 組織のポリシーを確認**

Google Workspaceを使用している場合、組織のポリシーでApps Scriptのデプロイが制限されている可能性があります：

1. Google Workspace管理者に連絡
2. Apps Scriptのデプロイ権限が有効になっているか確認
3. 必要に応じて権限を付与してもらう

### エラー: "Sheet '進捗率タブ' not found"

- スプレッドシートに「進捗率タブ」という名前のシートが存在することを確認
- シート名が完全に一致していることを確認（全角・半角、スペースなど）

### エラー: "No data found in sheet"

- シートにヘッダー行とデータ行が存在することを確認
- 最低2行（ヘッダー + データ1行）が必要

### エラー: "Internal server error"

- Apps Scriptエディタの「実行ログ」を確認
- スプレッドシートIDが正しいことを確認
- スクリプトを実行するユーザーがスプレッドシートへのアクセス権限を持っていることを確認

### CORS エラー

- Google Apps ScriptのWeb Appは自動的にCORSヘッダーを処理します
- フロントエンドから直接アクセスできない場合は、アクセス権限の設定を確認してください

## セキュリティに関する注意事項

- **アクセス権限**: 「全員」に設定すると、URLを知っている誰でもアクセスできます
- **組織内のユーザー**: Google Workspaceを使用している場合、組織内のユーザーのみに制限することを推奨
- **URLの管理**: デプロイURLは秘密情報として扱い、公開リポジトリにコミットしないでください

## 環境変数の設定（フロントエンド）

フロントエンドアプリケーションで以下の環境変数を設定してください：

```bash
VITE_GAS_API_ENDPOINT=https://script.google.com/macros/s/XXXXX/exec
```

`.env`ファイル例：

```
VITE_GAS_API_ENDPOINT=https://script.google.com/macros/s/XXXXX/exec
```

## 次のステップ

1. ✅ タスク 1.5.1: GASスクリプトを作成（完了）
2. ⏭️ タスク 1.5.2: GAS Web Appをデプロイ（このドキュメントの手順に従ってください）
3. ⏭️ タスク 1.5.3: GAS Web Appのテスト
