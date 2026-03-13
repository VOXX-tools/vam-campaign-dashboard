# Google Sheets API セットアップ手順

GAS Web Appのデプロイが不要な方法です。Google Sheets APIを使用してフロントエンドから直接スプレッドシートを読み取ります。

## 前提条件

- Googleスプレッドシートへのアクセス権限
- スプレッドシートID: `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA`
- シート名: `進捗率タブ`

## セットアップ手順

### 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
   - プロジェクト名: `VAM Campaign Dashboard`
   - 組織: VOXX-tools（該当する場合）
3. プロジェクトを選択

### 2. Google Sheets APIを有効化

1. 左側のメニューから「APIとサービス」→「ライブラリ」を選択
2. 検索バーで「Google Sheets API」を検索
3. 「Google Sheets API」をクリック
4. 「有効にする」ボタンをクリック

### 3. APIキーを作成

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. 上部の「認証情報を作成」→「APIキー」をクリック
3. APIキーが生成されます（後で使用するのでコピーして保存）

### 4. APIキーを制限（セキュリティ強化）

1. 作成したAPIキーの右側にある「編集」アイコンをクリック
2. 「アプリケーションの制限」セクション:
   - 「HTTPリファラー（ウェブサイト）」を選択
   - 「ウェブサイトの制限」に以下を追加:
     - `http://localhost:*`（開発環境用）
     - `https://your-vercel-domain.vercel.app/*`（本番環境用）
3. 「APIの制限」セクション:
   - 「キーを制限」を選択
   - 「Google Sheets API」のみを選択
4. 「保存」をクリック

### 5. スプレッドシートを公開設定

**重要**: Google Sheets APIでアクセスするには、スプレッドシートを「リンクを知っている全員」に共有する必要があります。

1. スプレッドシートを開く
2. 右上の「共有」ボタンをクリック
3. 「一般的なアクセス」を「制限付き」から「リンクを知っている全員」に変更
4. 権限を「閲覧者」に設定
5. 「完了」をクリック

**注意**: 組織内のみに制限したい場合は、「組織内のユーザー」を選択してください。


## フロントエンド実装

### 環境変数の設定

`.env`ファイルに以下を追加:

```
VITE_GOOGLE_SHEETS_API_KEY=YOUR_API_KEY_HERE
VITE_SPREADSHEET_ID=1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
VITE_SHEET_NAME=進捗率タブ
```

### DataFetcherの実装を変更

`src/modules/DataFetcher.ts`を以下のように変更します:

```typescript
export class DataFetcher {
  private apiKey: string;
  private spreadsheetId: string;
  private sheetName: string;
  private intervalId: number | null = null;

  constructor(config: DataFetcherConfig) {
    this.apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
    this.spreadsheetId = import.meta.env.VITE_SPREADSHEET_ID;
    this.sheetName = import.meta.env.VITE_SHEET_NAME;
  }

  async fetch(): Promise<FetchResult> {
    try {
      const range = `${this.sheetName}!A:T`; // A列からT列まで（20列）
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const campaigns = this.parseSheetData(data.values);
      
      return {
        data: campaigns,
        timestamp: new Date(),
        success: true
      };
    } catch (error) {
      return {
        data: [],
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private parseSheetData(values: any[][]): CampaignData[] {
    if (!values || values.length < 2) {
      return [];
    }

    const headers = values[0];
    const campaigns: CampaignData[] = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      
      const campaign: CampaignData = {
        CAMPAIGN_URL: row[headers.indexOf('CAMPAIGN_URL')] || '',
        ORDER_NAME: row[headers.indexOf('ORDER_NAME')] || '',
        ADVERTISER_NAME: row[headers.indexOf('ADVERTISER_NAME')] || '',
        AGENCY_NAME: row[headers.indexOf('AGENCY_NAME')] || '',
        CAMPAIGN_ID: String(row[headers.indexOf('CAMPAIGN_ID')] || ''),
        CAMPAIGN_NAME: row[headers.indexOf('CAMPAIGN_NAME')] || '',
        priority: Number(row[headers.indexOf('優先度')] || 0),
        START_TIME: row[headers.indexOf('START_TIME')] || '',
        END_TIME: row[headers.indexOf('END_TIME')] || '',
        deliveryDays: Number(row[headers.indexOf('配信日数')] || 0),
        targetImp: Number(row[headers.indexOf('目標Imp')] || 0),
        cumulativeImp: Number(row[headers.indexOf('累積実績Imp')] || 0),
        dailyImp: Number(row[headers.indexOf('日割りImp')] || 0),
        deliveryCap: Number(row[headers.indexOf('配信キャップ')] || 0),
        todayImp: Number(row[headers.indexOf('当日Imp')] || 0),
        totalHours: Number(row[headers.indexOf('全体時間')] || 0),
        elapsedHours: Number(row[headers.indexOf('経過時間')] || 0),
        timeProgressRate: Number(row[headers.indexOf('時間進捗率')] || 0),
        impProgress: Number(row[headers.indexOf('imp進捗')] || 0),
        progressRate: Number(row[headers.indexOf('進捗率')] || 0)
      };
      
      campaigns.push(campaign);
    }

    return campaigns;
  }

  startAutoFetch(callback: (result: FetchResult) => void): void {
    // 1時間ごとに自動更新
    this.intervalId = window.setInterval(async () => {
      const result = await this.fetch();
      callback(result);
    }, 3600000); // 1時間 = 3600000ミリ秒
  }

  stopAutoFetch(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
```

## テスト方法

### ブラウザでテスト

以下のURLをブラウザで開いてテスト:

```
https://sheets.googleapis.com/v4/spreadsheets/1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA/values/進捗率タブ!A:T?key=YOUR_API_KEY
```

成功すると、以下のようなJSON形式のレスポンスが返ります:

```json
{
  "range": "進捗率タブ!A:T",
  "majorDimension": "ROWS",
  "values": [
    ["CAMPAIGN_URL", "ORDER_NAME", ...],
    ["https://...", "Sample Order", ...]
  ]
}
```

## メリット・デメリット

### メリット
- GAS Web Appのデプロイが不要
- シンプルな実装
- Google公式APIで安定性が高い
- レート制限が緩い（1日あたり500リクエスト/ユーザー）

### デメリット
- スプレッドシートを「リンクを知っている全員」に共有する必要がある
- APIキーがフロントエンドに露出する（HTTPリファラーで制限可能）
- データ加工はフロントエンド側で行う必要がある

## セキュリティに関する注意

- APIキーは環境変数で管理し、公開リポジトリにコミットしない
- HTTPリファラーでAPIキーの使用を制限する
- スプレッドシートの共有設定を適切に管理する
- 組織内のみに制限する場合は、OAuth 2.0認証を検討する

## 次のステップ

1. ✅ Google Cloud Consoleでプロジェクトを作成
2. ✅ Google Sheets APIを有効化
3. ✅ APIキーを作成・制限
4. ✅ スプレッドシートを公開設定
5. ⏭️ フロントエンドの実装を変更
6. ⏭️ テスト
