/**
 * DataFetcher - Google Sheets APIからキャンペーンデータを取得するモジュール
 * 
 * Requirements: 1.1, 1.3, 1.4, 1.5, 11.1-11.4
 * 
 * 機能:
 * - OAuth 2.0アクセストークンを使用してGoogle Sheets APIにアクセス
 * - 毎時5分に自動的にデータを取得（スプレッドシートは毎時0分に更新）
 * - エラーハンドリング（ネットワークエラー、APIエラー、データ形式エラー）
 */

import type { CampaignData, FetchResult } from '../types';

/**
 * カスタムエラークラス
 */
class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

class DataFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataFormatError';
  }
}

/**
 * DataFetcherクラス
 * Google Sheets APIからデータを取得し、自動更新機能を提供
 */
export class DataFetcher {
  private spreadsheetId: string;
  private sheetName: string;
  private intervalId: number | null = null;
  private timeoutId: number | null = null;

  constructor() {
    this.spreadsheetId = import.meta.env.VITE_SPREADSHEET_ID;
    this.sheetName = import.meta.env.VITE_SHEET_NAME;

    if (!this.spreadsheetId || !this.sheetName) {
      throw new Error('環境変数が設定されていません: VITE_SPREADSHEET_ID, VITE_SHEET_NAME');
    }
  }

  /**
   * Google Sheets APIからデータを取得
   * 
   * @param accessToken - OAuth 2.0アクセストークン
   * @returns FetchResult - 取得結果
   */
  async fetch(accessToken: string): Promise<FetchResult> {
    try {
      // A列からT列まで（20項目）を取得
      const range = `${this.sheetName}!A:T`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new APIError('認証エラー: アクセストークンが無効です。再ログインしてください', 401);
        }
        if (response.status === 403) {
          throw new APIError('権限エラー: スプレッドシートへのアクセス権限がありません', 403);
        }
        if (response.status === 404) {
          throw new APIError('スプレッドシートが見つかりません', 404);
        }
        throw new APIError(`APIエラー: ${response.status} ${response.statusText}`, response.status);
      }

      const data = await response.json();

      if (!data.values || !Array.isArray(data.values)) {
        throw new DataFormatError('データ形式が不正です: valuesプロパティが見つかりません');
      }

      const campaigns = this.parseSheetData(data.values);

      return {
        data: campaigns,
        timestamp: new Date(),
        success: true,
      };
    } catch (error) {
      // ネットワークエラーの検出
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          data: [],
          timestamp: new Date(),
          success: false,
          error: 'ネットワーク接続を確認してください',
        };
      }

      // その他のエラー
      return {
        data: [],
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      };
    }
  }

  /**
   * スプレッドシートのデータをCampaignData配列に変換
   * 
   * @param values - スプレッドシートの生データ
   * @returns CampaignData[] - パースされたキャンペーンデータ
   */
  private parseSheetData(values: any[][]): CampaignData[] {
    if (values.length === 0) {
      return [];
    }

    // ヘッダー行をスキップ（1行目）
    const dataRows = values.slice(1);
    const campaigns: CampaignData[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      // 空行をスキップ
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      try {
        const campaign = this.parseRow(row, i + 2); // +2 because: 1-indexed + header row
        campaigns.push(campaign);
      } catch (error) {
        console.error(`行 ${i + 2} のパースに失敗しました:`, error);
        // 個別の行のエラーは無視して続行
      }
    }

    return campaigns;
  }

  /**
   * 1行のデータをCampaignDataオブジェクトに変換
   * 
   * @param row - スプレッドシートの1行
   * @param rowNumber - 行番号（エラーメッセージ用）
   * @returns CampaignData - パースされたキャンペーンデータ
   */
  private parseRow(row: any[], rowNumber: number): CampaignData {
    // 20項目すべてが存在することを確認
    if (row.length < 20) {
      throw new DataFormatError(
        `行 ${rowNumber}: 必要な項目数が不足しています（期待: 20, 実際: ${row.length}）`
      );
    }

    // デバッグ用: 最初の数行のデータをログ出力
    if (rowNumber <= 5) {
      console.log(`Row ${rowNumber} raw data:`, {
        todayImp: row[14],
        cumulativeImp: row[11],
        targetImp: row[10],
      });
    }

    // 数値フィールドのパース（エラー値を0として扱う）
    const parseNumber = (value: any): number => {
      // エラー値（#DIV/0!、#VALUE!、#N/A など）や空文字列の場合は0を返す
      if (!value || typeof value === 'string' && value.startsWith('#')) {
        return 0;
      }
      
      // 文字列の場合、カンマを削除してから数値に変換
      if (typeof value === 'string') {
        const cleanedValue = value.replace(/,/g, '');
        const num = parseFloat(cleanedValue);
        if (isNaN(num)) {
          return 0;
        }
        return num;
      }
      
      // 数値の場合はそのまま返す
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(num)) {
        return 0;
      }
      return num;
    };

    return {
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
    };
  }

  /**
   * 自動更新を開始
   * 初回は即座に実行し、その後は毎時5分に実行
   * 
   * @param accessToken - OAuth 2.0アクセストークン
   * @param callback - データ取得後に呼び出されるコールバック関数
   */
  startAutoFetch(accessToken: string, callback: (result: FetchResult) => void): void {
    // 既存のスケジューラーを停止
    this.stopAutoFetch();

    // 初回実行
    this.fetch(accessToken).then(callback);

    // 次回の毎時5分までの時間を計算
    const scheduleNextFetch = () => {
      const now = new Date();
      const nextFetch = new Date(now);
      
      // 次の毎時5分を計算
      nextFetch.setMinutes(5);
      nextFetch.setSeconds(0);
      nextFetch.setMilliseconds(0);
      
      // 現在時刻が5分を過ぎている場合は、次の時間の5分に設定
      if (now.getMinutes() >= 5) {
        nextFetch.setHours(nextFetch.getHours() + 1);
      }
      
      const delay = nextFetch.getTime() - now.getTime();
      
      // タイムアウトを設定
      this.timeoutId = window.setTimeout(() => {
        // データ取得を実行
        this.fetch(accessToken).then(callback);
        
        // 1時間ごとに繰り返し実行
        this.intervalId = window.setInterval(() => {
          this.fetch(accessToken).then(callback);
        }, 60 * 60 * 1000); // 1時間 = 3600000ミリ秒
      }, delay);
    };

    scheduleNextFetch();
  }

  /**
   * 自動更新を停止
   */
  stopAutoFetch(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
