/**
 * Vercel Serverless Function - 毎時5分にGoogle Sheets APIからデータを取得してFirestoreに保存
 * 
 * このAPIエンドポイントは、GitHub Actionsによって定期的に呼び出されます。
 * Service Account認証を使用してGoogle Sheets APIにアクセスします。
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Firebase Admin初期化
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '', 'base64').toString('utf-8')
  );
  
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

interface CampaignData {
  CAMPAIGN_URL: string;
  ORDER_NAME: string;
  ADVERTISER_NAME: string;
  AGENCY_NAME: string;
  CAMPAIGN_ID: string;
  CAMPAIGN_NAME: string;
  priority: number;
  START_TIME: string;
  END_TIME: string;
  deliveryDays: number;
  targetImp: number;
  cumulativeImp: number;
  dailyImp: number;
  deliveryCap: number;
  todayImp: number;
  totalHours: number;
  elapsedHours: number;
  timeProgressRate: number;
  impProgress: number;
  progressRate: number;
}

interface EnrichedCampaign extends CampaignData {
  status: any;
  adType: any;
  remainingDays: number;
  remainingImp: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 認証チェック
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Service Account認証
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '', 'base64').toString('utf-8')
    );

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // スプレッドシートからデータを取得
    const spreadsheetId = process.env.VITE_SPREADSHEET_ID;
    const sheetName = process.env.VITE_SHEET_NAME;
    const range = `${sheetName}!A:T`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).json({ message: 'No data found', timestamp: new Date().toISOString() });
    }

    // データをパース（ヘッダー行をスキップ）
    const campaigns: CampaignData[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row[0]) continue;

      const parseNumber = (value: any): number => {
        if (!value || typeof value === 'string' && value.startsWith('#')) return 0;
        if (typeof value === 'string') {
          const cleanedValue = value.replace(/,/g, '');
          const num = parseFloat(cleanedValue);
          return isNaN(num) ? 0 : num;
        }
        const num = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(num) ? 0 : num;
      };

      campaigns.push({
        CAMPAIGN_URL: String(row[0] || ''),
        ORDER_NAME: String(row[1] || ''),
        ADVERTISER_NAME: String(row[2] || ''),
        AGENCY_NAME: String(row[3] || ''),
        CAMPAIGN_ID: String(row[4] || ''),
        CAMPAIGN_NAME: String(row[5] || ''),
        priority: parseNumber(row[6]),
        START_TIME: String(row[7] || ''),
        END_TIME: String(row[8] || ''),
        deliveryDays: parseNumber(row[9]),
        targetImp: parseNumber(row[10]),
        cumulativeImp: parseNumber(row[11]),
        dailyImp: parseNumber(row[12]),
        deliveryCap: parseNumber(row[13]),
        todayImp: parseNumber(row[14]),
        totalHours: parseNumber(row[15]),
        elapsedHours: parseNumber(row[16]),
        timeProgressRate: parseNumber(row[17]),
        impProgress: parseNumber(row[18]),
        progressRate: parseNumber(row[19]),
      });
    }

    // ステータス評価（簡易版）
    const enrichedCampaigns: EnrichedCampaign[] = campaigns.map((campaign) => {
      const adType = evaluateAdType(campaign.ORDER_NAME);
      const status = evaluateStatus(campaign, adType);
      const remainingDays = calculateRemainingDays(campaign.END_TIME);
      const remainingImp = Math.max(0, campaign.targetImp - campaign.cumulativeImp);

      return {
        ...campaign,
        status,
        adType,
        remainingDays,
        remainingImp,
      };
    });

    const timestamp = new Date();

    // Firestoreに保存
    await db.collection('campaigns').doc('latest').set({
      campaigns: enrichedCampaigns,
      timestamp: Timestamp.fromDate(timestamp),
      updatedAt: Timestamp.now(),
    });

    // 時系列データを保存
    const totalImp = enrichedCampaigns.reduce((sum, c) => sum + c.todayImp, 0);
    const reservedImp = enrichedCampaigns
      .filter((c) => c.adType.type === 'RESERVED')
      .reduce((sum, c) => sum + c.todayImp, 0);
    const programmaticImp = enrichedCampaigns
      .filter((c) => c.adType.type === 'PROGRAMMATIC')
      .reduce((sum, c) => sum + c.todayImp, 0);
    const houseImp = enrichedCampaigns
      .filter((c) => c.adType.type === 'HOUSE')
      .reduce((sum, c) => sum + c.todayImp, 0);

    const docId = timestamp.getTime().toString();
    await db.collection('timeseries').doc(docId).set({
      timestamp: Timestamp.fromDate(timestamp),
      totalImp,
      reservedImp,
      programmaticImp,
      houseImp,
      createdAt: Timestamp.now(),
    });

    return res.status(200).json({
      success: true,
      message: 'Data fetched and saved successfully',
      timestamp: timestamp.toISOString(),
      campaignCount: enrichedCampaigns.length,
      totalImp,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ヘルパー関数
function evaluateAdType(orderName: string) {
  if (orderName.includes('PMP')) {
    return { type: 'PROGRAMMATIC', label: '運用型' };
  }
  if (orderName.includes('自社広告')) {
    return { type: 'HOUSE', label: '自社広告' };
  }
  return { type: 'RESERVED', label: '予約型' };
}

function evaluateStatus(campaign: CampaignData, adType: any) {
  if (campaign.targetImp === 0) {
    return { type: 'NOT_APPLICABLE', label: '-', color: 'gray', icon: '' };
  }
  if (adType.type === 'HOUSE' || adType.type === 'PROGRAMMATIC') {
    return { type: 'NOT_APPLICABLE', label: '-', color: 'gray', icon: '' };
  }
  if (campaign.elapsedHours >= 24 && campaign.progressRate <= 80) {
    return { type: 'CRITICAL_BEHIND_80', label: '🔴要対応（ビハインド80%未満）', color: 'red', icon: '🔴' };
  }
  if (campaign.targetImp >= 2500000 && campaign.elapsedHours >= 24 && campaign.progressRate < 100) {
    return { type: 'CRITICAL_BEHIND_2_5M', label: '🔴要対応（ビハインド250万imp以上）', color: 'red', icon: '🔴' };
  }
  if (campaign.dailyImp > 0 && campaign.todayImp < campaign.dailyImp * 0.1) {
    return { type: 'CRITICAL_LOW_TODAY', label: '🔴要対応（当日imp少なめ）', color: 'red', icon: '🔴' };
  }
  const remainingDays = calculateRemainingDays(campaign.END_TIME);
  const remainingImp = Math.max(0, campaign.targetImp - campaign.cumulativeImp);
  if (remainingDays > 0 && campaign.deliveryCap * remainingDays < remainingImp) {
    return { type: 'CRITICAL_CAP_RISK', label: '🔴要対応（キャップ未達リスク）', color: 'red', icon: '🔴' };
  }
  if (campaign.targetImp > 0 && campaign.todayImp === 0) {
    return { type: 'CRITICAL_ZERO_IMP', label: '🔴要対応（0imp異常）', color: 'red', icon: '🔴' };
  }
  if (remainingDays <= 7 && remainingDays > 0 && campaign.progressRate < 100) {
    return { type: 'WARNING_ENDING_SOON', label: '🟡注意（1週間以内終了）', color: 'yellow', icon: '🟡' };
  }
  if (campaign.cumulativeImp >= campaign.targetImp) {
    return { type: 'WARNING_EARLY_COMPLETE', label: '🟡注意（早期終了・超過）', color: 'yellow', icon: '🟡' };
  }
  return { type: 'HEALTHY', label: '🟢順調', color: 'green', icon: '🟢' };
}

function calculateRemainingDays(endTime: string): number {
  const now = new Date();
  const end = new Date(endTime);
  const diffMs = end.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
