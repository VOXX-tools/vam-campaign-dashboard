# Firebase (Firestore) セットアップガイド

このガイドでは、VAMキャンペーン監視ダッシュボードでFirestoreを使用してチーム全体でデータを共有するための設定手順を説明します。

## 目次

1. [Firebaseプロジェクトの作成](#1-firebaseプロジェクトの作成)
2. [Firestoreデータベースの有効化](#2-firestoreデータベースの有効化)
3. [Firebase設定情報の取得](#3-firebase設定情報の取得)
4. [環境変数の設定](#4-環境変数の設定)
5. [Firestoreセキュリティルールの設定](#5-firestoreセキュリティルールの設定)
6. [動作確認](#6-動作確認)

---

## 1. Firebaseプロジェクトの作成

### 1.1 Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. Google Workspaceアカウントでログイン

### 1.2 新しいプロジェクトを作成

1. 「プロジェクトを追加」をクリック
2. プロジェクト名を入力（例: `vam-campaign-dashboard`）
3. Google Analyticsは「今は設定しない」を選択（オプション）
4. 「プロジェクトを作成」をクリック

---

## 2. Firestoreデータベースの有効化

### 2.1 Firestoreを作成

1. Firebase Consoleの左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択:
   - **推奨**: `asia-northeast1` (東京)
   - または `asia-northeast2` (大阪)
4. セキュリティルールは「本番環境モード」を選択
5. 「有効にする」をクリック

### 2.2 データベース構造

Firestoreには以下のコレクションが自動的に作成されます:

```
campaigns/
  └── latest (ドキュメント)
      ├── campaigns: EnrichedCampaign[]
      ├── timestamp: Timestamp
      └── updatedAt: Timestamp

timeseries/
  └── {timestamp_ms} (ドキュメント)
      ├── timestamp: Timestamp
      ├── totalImp: number
      ├── reservedImp: number
      ├── programmaticImp: number
      ├── houseImp: number
      └── createdAt: Timestamp
```

---

## 3. Firebase設定情報の取得

### 3.1 ウェブアプリを追加

1. Firebase Consoleのプロジェクト概要ページで「ウェブアプリを追加」（`</>`アイコン）をクリック
2. アプリのニックネームを入力（例: `VAM Dashboard Web`）
3. Firebase Hostingは設定不要（チェックを外す）
4. 「アプリを登録」をクリック

### 3.2 設定情報をコピー

表示される設定情報から以下の値をコピー:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",    // VITE_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",                     // VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",     // VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",       // VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"                // VITE_FIREBASE_APP_ID
};
```

---

## 4. 環境変数の設定

### 4.1 ローカル開発環境

`.env` ファイルに以下を追加:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### 4.2 Vercel本番環境

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択
3. Settings > Environment Variables を開く
4. 以下の環境変数を追加（すべて Production, Preview, Development にチェック）:

| 変数名 | 値 |
|--------|-----|
| `VITE_FIREBASE_API_KEY` | Firebase Console からコピーした API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase プロジェクト ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 送信者 ID |
| `VITE_FIREBASE_APP_ID` | アプリ ID |

5. 「Save」をクリック
6. Deployments タブから「Redeploy」を実行

---

## 5. Firestoreセキュリティルールの設定

### 5.1 セキュリティルールを設定

1. Firebase Console > Firestore Database > ルール タブを開く
2. 以下のルールを設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // campaignsコレクション: 認証済みユーザーのみ読み書き可能
    match /campaigns/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // timeseriesコレクション: 認証済みユーザーのみ読み書き可能
    match /timeseries/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. 「公開」をクリック

### 5.2 セキュリティルールの説明

- `request.auth != null`: Google OAuth 2.0で認証済みのユーザーのみアクセス可能
- チーム全体でデータを共有できます
- 未認証ユーザーはアクセスできません

---

## 6. 動作確認

### 6.1 ローカルで確認

```bash
npm run dev
```

1. ブラウザで `http://localhost:5173` を開く
2. Googleアカウントでログイン
3. データが取得されることを確認
4. Firebase Console > Firestore Database でデータが保存されていることを確認

### 6.2 確認ポイント

- ✅ `campaigns/latest` ドキュメントにキャンペーンデータが保存されている
- ✅ `timeseries` コレクションに時系列データが保存されている
- ✅ 時系列分析タブでグラフが表示される
- ✅ チームメンバーが同じデータを閲覧できる

---

## トラブルシューティング

### エラー: "Firebase: Error (auth/unauthorized-domain)"

**原因**: Firebase Authentication の承認済みドメインにアプリのURLが登録されていない

**解決方法**:
1. Firebase Console > Authentication > Settings > Authorized domains
2. `localhost` と Vercel のデプロイURL（例: `your-app.vercel.app`）を追加

### エラー: "Missing or insufficient permissions"

**原因**: Firestoreセキュリティルールが正しく設定されていない

**解決方法**:
1. Firebase Console > Firestore Database > ルール を確認
2. 上記のセキュリティルールが正しく設定されているか確認
3. 「公開」をクリックして変更を適用

### データが保存されない

**原因**: 環境変数が正しく設定されていない

**解決方法**:
1. `.env` ファイルの内容を確認
2. すべての `VITE_FIREBASE_*` 変数が設定されているか確認
3. 開発サーバーを再起動: `npm run dev`

---

## 無料枠について

Firebaseの無料枠（Spark プラン）:

- **Firestore**: 1GB ストレージ、50K 読み取り/日、20K 書き込み/日
- **認証**: 無制限
- **帯域幅**: 10GB/月

VAMダッシュボードの使用量（推定）:
- 書き込み: 24回/日（毎時1回 × 2コレクション）
- 読み取り: 数百回/日（チームメンバーのアクセス）
- ストレージ: 数MB（90日分のデータ）

**結論**: 無料枠で十分に運用可能です。

---

## 次のステップ

1. ✅ Firebaseプロジェクトを作成
2. ✅ Firestoreを有効化
3. ✅ 環境変数を設定
4. ✅ セキュリティルールを設定
5. ✅ 動作確認
6. 🚀 チームメンバーに共有

これでFirestoreのセットアップは完了です！
