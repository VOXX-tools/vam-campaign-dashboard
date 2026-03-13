# LocalStorageからFirestoreへの移行ガイド

## 概要

VAMキャンペーン監視ダッシュボードのデータ永続化を、LocalStorageからFirestore（Firebase）に移行しました。

## 移行の理由

### LocalStorageの制限

- ❌ ブラウザごとにデータが分離（チーム共有不可）
- ❌ 容量制限（5-10MB）
- ❌ デバイス間でデータ同期不可
- ❌ ブラウザキャッシュクリアでデータ消失

### Firestoreの利点

- ✅ チーム全体でデータ共有
- ✅ 大容量（無料枠で1GB）
- ✅ デバイス間で自動同期
- ✅ データの永続性が高い
- ✅ リアルタイム同期対応
- ✅ Google Workspaceとシームレスに統合

## 変更内容

### 1. 新規ファイル

- `src/modules/FirestoreManager.ts` - Firestore操作クラス
- `FIREBASE_SETUP.md` - Firebaseセットアップガイド
- `FIREBASE_MIGRATION_GUIDE.md` - このファイル

### 2. 更新ファイル

- `src/context/AppContext.tsx` - LocalStorageManager → FirestoreManager
- `src/components/TimeSeriesView.tsx` - Firestoreから時系列データを読み込み
- `.env` - Firebase環境変数を追加
- `.env.example` - Firebase環境変数のテンプレートを追加
- `package.json` - firebase パッケージを追加

### 3. 削除予定ファイル（後方互換性のため残存）

- `src/modules/LocalStorageManager.ts` - 使用されなくなりました

## データ構造

### Firestore Collections

#### 1. `campaigns` コレクション

最新のキャンペーンデータを保存:

```typescript
campaigns/latest {
  campaigns: EnrichedCampaign[],
  timestamp: Timestamp,
  updatedAt: Timestamp
}
```

#### 2. `timeseries` コレクション

時系列データポイントを保存（毎時5分に1件追加）:

```typescript
timeseries/{timestamp_ms} {
  timestamp: Timestamp,
  totalImp: number,
  reservedImp: number,
  programmaticImp: number,
  houseImp: number,
  createdAt: Timestamp
}
```

### データ保持期間

- キャンペーンデータ: 最新のみ（上書き保存）
- 時系列データ: 90日間（自動クリーンアップ）

## セットアップ手順

### 1. Firebase プロジェクトを作成

詳細は `FIREBASE_SETUP.md` を参照してください。

### 2. 環境変数を設定

`.env` ファイルに以下を追加:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Vercel環境変数を設定

Vercel Dashboard > Settings > Environment Variables で上記の環境変数を追加。

### 4. デプロイ

```bash
git add .
git commit -m "Migrate from LocalStorage to Firestore"
git push origin main
```

Vercelが自動的にデプロイします。

## 動作確認

### ローカル環境

```bash
npm run dev
```

1. ブラウザで `http://localhost:5173` を開く
2. Googleアカウントでログイン
3. データが取得されることを確認
4. Firebase Console > Firestore Database でデータが保存されていることを確認

### 本番環境

1. Vercelデプロイ後、アプリにアクセス
2. Googleアカウントでログイン
3. データが取得されることを確認
4. 別のデバイスやブラウザでログインして、同じデータが表示されることを確認

## チーム共有の仕組み

### データの流れ

```
Google Sheets (毎時0分更新)
    ↓
DataFetcher (毎時5分取得)
    ↓
StatusEvaluator (ステータス評価)
    ↓
FirestoreManager (Firestoreに保存)
    ↓
Firestore Database (チーム全体で共有)
    ↓
各チームメンバーのブラウザ (自動同期)
```

### 認証とアクセス制御

- Google OAuth 2.0で認証
- Firestoreセキュリティルールで認証済みユーザーのみアクセス可能
- チームメンバー全員が同じデータを閲覧・更新

## トラブルシューティング

### Q: LocalStorageのデータはどうなりますか？

A: LocalStorageのデータは残りますが、使用されなくなります。Firestoreに移行後、LocalStorageは手動でクリアできます。

### Q: 既存のデータは移行されますか？

A: いいえ。Firestore移行後、新しいデータが蓄積されます。過去のLocalStorageデータは参照されません。

### Q: オフラインでも動作しますか？

A: Firestoreはオフラインキャッシュをサポートしていますが、現在の実装では明示的に有効化していません。必要に応じて追加できます。

### Q: データの同期はリアルタイムですか？

A: 現在の実装では、データは毎時5分に取得・保存されます。リアルタイム同期は実装していませんが、Firestoreの機能を使えば追加可能です。

### Q: 無料枠で足りますか？

A: はい。Firebaseの無料枠（Spark プラン）で十分に運用可能です。詳細は `FIREBASE_SETUP.md` を参照してください。

## 今後の拡張可能性

Firestoreを使用することで、以下の機能を追加できます:

1. **リアルタイム同期**: チームメンバー間でデータをリアルタイムに同期
2. **履歴管理**: キャンペーンの変更履歴を追跡
3. **アラート機能**: 特定条件でチームメンバーに通知
4. **レポート機能**: 週次・月次レポートの自動生成
5. **ユーザー権限管理**: 閲覧のみ・編集可能などの権限設定

## サポート

問題が発生した場合は、以下を確認してください:

1. `FIREBASE_SETUP.md` のセットアップ手順
2. Firebase Console のエラーログ
3. ブラウザのコンソールログ

それでも解決しない場合は、開発チームに連絡してください。
