/**
 * GitHub Actionsから直接実行するスクリプト
 * Google Sheetsからデータを取得してFirestoreに保存する
 */

import { google } from 'googleapis';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Firebase Admin初期化（サービスアカウントキーから）
const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
  console.error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  process.exit(1);
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Google Sheets API認証
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = process.env.VITE_SPREADSHEET_ID;
const sheetName = process.env.VITE_SHEET_NAME;

if (!spreadsheetId || !sheetName) {
  console.error('VITE_SPREADSHEET_ID or VITE_SHEET_NAME is not set');
  process.exit(1);
}

const parseNumber = (value) => {
  if (!value || (typeof value === 'string' && value.startsWith('#'))) return 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const evaluateAdType = (orderName) => {
  if (orderName.includes('PMP')) return { type: 'PROGRAMMATIC', label: '運用型' };
  if (orderName.includes('自社広告')) return { type: 'HOUSE', label: '自社広告' };
  return { type: 'RESERVED', label: '予約型' };
};

const calculateRemainingDays = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diffMs = end.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const evaluateStatus = (campaign, adType) => {
  if (campaign.targetImp === 0) return { type: 'NOT_APPLICABLE', label: '-', color: 'gray', icon: '' };
  if (adType.type === 'HOUSE' || adType.type === 'PROGRAMMATIC') return { type: 'NOT_APPLICABLE', label: '-', color: 'gray', icon: '' };
  if (campaign.elapsedHours >= 24 && campaign.progressRate <= 80) return { type: 'CRITICAL_BEHIND_80', label: '🔴要対応（ビハインド80%未満）', color: 'red', icon: '🔴' };
  if (campaign.targetImp >= 2500000 && campaign.elapsedHours >= 24 && campaign.progressRate < 100) return { type: 'CRITICAL_BEHIND_2_5M', label: '🔴要対応（ビハインド250万imp以上）', color: 'red', icon: '🔴' };
  if (campaign.dailyImp > 0 && campaign.todayImp < campaign.dailyImp * 0.1) return { type: 'CRITICAL_LOW_TODAY', label: '🔴要対応（当日imp少なめ）', color: 'red', icon: '🔴' };
  const remainingDays = calculateRemainingDays(campaign.END_TIME);
  const remainingImp = Math.max(0, campaign.targetImp - campaign.cumulativeImp);
  if (remainingDays > 0 && campaign.deliveryCap * remainingDays < remainingImp) return { type: 'CRITICAL_CAP_RISK', label: '🔴要対応（キャップ未達リスク）', color: 'red', icon: '🔴' };
  if (campaign.targetImp > 0 && campaign.todayImp === 0) return { type: 'CRITICAL_ZERO_IMP', label: '🔴要対応（0imp異常）', color: 'red', icon: '🔴' };
  if (remainingDays <= 7 && remainingDays > 0 && campaign.progressRate < 100) return { type: 'WARNING_ENDING_SOON', label: '🟡注意（1週間以内終了）', color: 'yellow', icon: '🟡' };
  if (campaign.cumulativeImp >= campaign.targetImp) return { type: 'WARNING_EARLY_COMPLETE', label: '🟡注意（早期終了・超過）', color: 'yellow', icon: '🟡' };
  return { type: 'HEALTHY', label: '🟢順調', color: 'green', icon: '🟢' };
};

async function main() {
  console.log('Fetching data from Google Sheets...');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:T`,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found');
    return;
  }

  console.log(`Found ${rows.length - 1} rows`);

  const campaigns = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row[0]) continue;

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

  const enrichedCampaigns = campaigns.map((campaign) => {
    const adType = evaluateAdType(campaign.ORDER_NAME);
    const status = evaluateStatus(campaign, adType);
    const remainingDays = calculateRemainingDays(campaign.END_TIME);
    const remainingImp = Math.max(0, campaign.targetImp - campaign.cumulativeImp);
    return { ...campaign, status, adType, remainingDays, remainingImp };
  });

  const timestamp = new Date();

  // Firestoreにキャンペーンデータを保存
  await db.collection('campaigns').doc('latest').set({
    campaigns: enrichedCampaigns,
    timestamp: Timestamp.fromDate(timestamp),
    updatedAt: Timestamp.now(),
  });

  // 時系列データを保存
  const totalImp = enrichedCampaigns.reduce((sum, c) => sum + c.todayImp, 0);
  const reservedImp = enrichedCampaigns.filter(c => c.adType.type === 'RESERVED').reduce((sum, c) => sum + c.todayImp, 0);
  const programmaticImp = enrichedCampaigns.filter(c => c.adType.type === 'PROGRAMMATIC').reduce((sum, c) => sum + c.todayImp, 0);
  const houseImp = enrichedCampaigns.filter(c => c.adType.type === 'HOUSE').reduce((sum, c) => sum + c.todayImp, 0);

  await db.collection('timeseries').doc(timestamp.getTime().toString()).set({
    timestamp: Timestamp.fromDate(timestamp),
    totalImp,
    reservedImp,
    programmaticImp,
    houseImp,
    createdAt: Timestamp.now(),
  });

  console.log(`✅ Saved ${enrichedCampaigns.length} campaigns to Firestore`);
  console.log(`   totalImp: ${totalImp}, reservedImp: ${reservedImp}, programmaticImp: ${programmaticImp}, houseImp: ${houseImp}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
