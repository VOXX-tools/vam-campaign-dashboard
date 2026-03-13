# Google OAuth 2.0 実装ガイド（続き）

## 5. LoginButtonコンポーネントを作成

`src/components/LoginButton.tsx`:

```typescript
import React from 'react';
import { useGoogleAuth } from '../context/GoogleAuthContext';

export const LoginButton: React.FC = () => {
  const { isAuthenticated, login, logout } = useGoogleAuth();

  if (isAuthenticated) {
    return (
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        ログアウト
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Googleでログイン
    </button>
  );
};
```

## 6. DataFetcherを修正してOAuth対応

`src/modules/DataFetcher.ts`:

```typescript
export class DataFetcher {
  private spreadsheetId: string;
  private sheetName: string;
  private accessToken: string;
  private intervalId: number | null = null;

  constructor(accessToken: string) {
    this.spreadsheetId = import.meta.env.VITE_SPREADSHEET_ID;
    this.sheetName = import.meta.env.VITE_SHEET_NAME;
    this.accessToken = accessToken;
  }

  async fetch(): Promise<FetchResult> {
    try {
      const range = `${this.sheetName}!A:T`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認証エラー: 再ログインしてください');
        }
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

  // parseSheetDataメソッドは変更なし
}
```

## 7. App.tsxを修正

```typescript
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import { AppContextProvider } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { LoginButton } from './components/LoginButton';
import { useGoogleAuth } from './context/GoogleAuthContext';

function AppContent() {
  const { isAuthenticated } = useGoogleAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">VAMキャンペーン監視ダッシュボード</h1>
          <p className="text-gray-600 mb-6">
            Googleアカウントでログインしてください
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <AppContextProvider>
      <Dashboard />
    </AppContextProvider>
  );
}

function App() {
  return (
    <GoogleAuthProvider>
      <AppContent />
    </GoogleAuthProvider>
  );
}

export default App;
```


## 8. 型定義を追加

`src/types/google.d.ts`:

```typescript
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export {};
```

## テスト方法

### 開発環境でテスト

1. 開発サーバーを起動:
```bash
npm run dev
```

2. ブラウザで `http://localhost:5173` を開く

3. 「Googleでログイン」ボタンをクリック

4. Googleアカウントを選択してログイン

5. 権限の承認画面で「許可」をクリック

6. ダッシュボードが表示されることを確認

### 2回目以降のアクセス

- ブラウザを閉じて再度開いても、自動的にログイン状態が維持されます
- ログインボタンは表示されず、直接ダッシュボードが表示されます

## トークンの管理

### アクセストークンの有効期限

- **有効期限**: 1時間
- **自動更新**: 必要に応じて再取得

### トークンの保存場所

- **LocalStorage**: `google_access_token`キーで保存
- ブラウザを閉じても保持されます

### トークンの更新

トークンが期限切れの場合（401エラー）、自動的に再ログインを促します。

## セキュリティ

### メリット

- スプレッドシートを公開する必要がない
- 組織内ユーザーのみアクセス可能
- ユーザーごとの権限管理が可能
- アクセストークンは1時間で期限切れ

### 注意事項

- アクセストークンはLocalStorageに保存されます
- XSS攻撃に注意（Content Security Policyを設定推奨）
- HTTPSを使用してください（本番環境）

## トラブルシューティング

### エラー: "redirect_uri_mismatch"

- OAuth 2.0クライアントIDの「承認済みのリダイレクトURI」に現在のURLが登録されているか確認
- URLは完全一致する必要があります（末尾のスラッシュも含む）

### エラー: "Access blocked: This app's request is invalid"

- OAuth同意画面の設定を確認
- スコープが正しく設定されているか確認

### エラー: "401 Unauthorized"

- アクセストークンの有効期限が切れています
- 再ログインしてください

### ログインボタンが表示されない

- `index.html`にGoogle Identity Servicesスクリプトが追加されているか確認
- ブラウザのコンソールでエラーを確認

## 次のステップ

1. ✅ Google Cloud Consoleでプロジェクトを作成
2. ✅ Google Sheets APIを有効化
3. ✅ OAuth同意画面を設定
4. ✅ OAuth 2.0クライアントIDを作成
5. ⏭️ フロントエンドの実装
6. ⏭️ テスト
