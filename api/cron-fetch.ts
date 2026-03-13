/**
 * Vercel Cron Job - 毎時5分にGoogle Sheets APIからデータを取得してFirestoreに保存
 * 
 * このAPIエンドポイントは、Vercel Cronによって定期的に呼び出されます。
 * ブラウザが閉じていても、サーバーサイドでデータ取得・保存を継続します。
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Vercel Cronからのリクエストのみ許可
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Google Sheets APIからデータを取得
    // 注意: サーバーサイドではService Accountを使用する必要があります
    
    // TODO: Service Account認証の実装が必要
    // 現在の実装はOAuth 2.0（ユーザー認証）を使用しているため、
    // サーバーサイドでは動作しません。
    
    return res.status(200).json({ 
      message: 'Cron job executed successfully',
      timestamp: new Date().toISOString(),
      note: 'Service Account authentication required for server-side execution'
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
