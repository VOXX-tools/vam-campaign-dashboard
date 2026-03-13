# Firestoreセキュリティルール（開発用）

Firebase Console > Firestore Database > ルール タブで、以下のルールに変更してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 開発用: すべてのユーザーが読み書き可能（一時的）
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**注意**: これは開発用の設定です。本番環境では必ず認証を要求するルールに戻してください。

## 本番用ルール（後で戻す）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
