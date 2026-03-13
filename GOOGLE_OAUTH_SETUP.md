# Google OAuth 2.0 認証セットアップ手順

組織内ユーザーのみがアクセスできるセキュアな方法です。初回ログイン後は自動的に認証状態を維持します。

## 前提条件

- Googleスプレッドシートへのアクセス権限
- スプレッドシートID: `1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA`
- シート名: `進捗率タブ`
- スプレッドシートの共有設定: 「アクセス権のあるユーザーのみ」でOK

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

### 3. OAuth同意画面を設定

1. 左側のメニューから「APIとサービス」→「OAuth同意画面」を選択
2. ユーザータイプを選択:
   - **内部**: 組織内のユーザーのみ（推奨）
   - **外部**: 誰でもログイン可能
3. 「作成」をクリック
4. アプリ情報を入力:
   - **アプリ名**: `VAM Campaign Dashboard`
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパーの連絡先情報**: あなたのメールアドレス
5. 「保存して次へ」をクリック
6. スコープの追加:
   - 「スコープを追加または削除」をクリック
   - `https://www.googleapis.com/auth/spreadsheets.readonly` を選択
   - 「更新」をクリック
7. 「保存して次へ」をクリック
8. 「ダッシュボードに戻る」をクリック

### 4. OAuth 2.0 クライアントIDを作成

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. 上部の「認証情報を作成」→「OAuth クライアント ID」をクリック
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前: `VAM Campaign Dashboard Web Client`
5. 承認済みのJavaScript生成元:
   - `http://localhost:5173`（開発環境用）
   - `https://your-vercel-domain.vercel.app`（本番環境用）
6. 承認済みのリダイレクトURI:
   - `http://localhost:5173`（開発環境用）
   - `https://your-vercel-domain.vercel.app`（本番環境用）
7. 「作成」をクリック
8. **クライアントID**をコピーして保存（後で使用）


## フロントエンド実装

### 1. 環境変数の設定

`.env`ファイルに以下を追加:

```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_SPREADSHEET_ID=1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA
VITE_SHEET_NAME=進捗率タブ
```

### 2. Google Identity Services ライブラリをインストール

```bash
npm install @react-oauth/google
```

### 3. index.htmlにGoogle Identity Servicesスクリプトを追加

`index.html`の`<head>`タグ内に追加:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 4. GoogleAuthProviderを実装

`src/context/GoogleAuthContext.tsx`を作成:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

interface GoogleAuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ページロード時にトークンを復元
    const savedToken = localStorage.getItem('google_access_token');
    if (savedToken) {
      setAccessToken(savedToken);
      setIsAuthenticated(true);
    }

    // Google Identity Servicesの初期化
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
    }
  }, []);

  const handleCredentialResponse = (response: any) => {
    // IDトークンを取得
    const credential = response.credential;
    
    // アクセストークンを取得するためにトークンエンドポイントを呼び出す
    fetchAccessToken(credential);
  };

  const fetchAccessToken = async (idToken: string) => {
    try {
      // Google OAuth 2.0トークンエンドポイントを使用
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        callback: (response: any) => {
          if (response.access_token) {
            setAccessToken(response.access_token);
            setIsAuthenticated(true);
            localStorage.setItem('google_access_token', response.access_token);
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Failed to fetch access token:', error);
    }
  };

  const login = () => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      callback: (response: any) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          setIsAuthenticated(true);
          localStorage.setItem('google_access_token', response.access_token);
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('google_access_token');
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <GoogleAuthContext.Provider value={{ accessToken, isAuthenticated, login, logout }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within GoogleAuthProvider');
  }
  return context;
};
```

