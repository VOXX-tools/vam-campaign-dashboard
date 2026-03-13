/**
 * DataFetcher - ユニットテスト
 * 
 * Requirements: 1.1, 1.3, 1.4, 1.5, 11.1-11.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataFetcher } from './DataFetcher';

describe('DataFetcher', () => {
  let fetcher: DataFetcher;
  const mockAccessToken = 'mock-access-token';

  beforeEach(() => {
    // 環境変数をモック
    vi.stubEnv('VITE_SPREADSHEET_ID', '1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA');
    vi.stubEnv('VITE_SHEET_NAME', '進捗率タブ');
    
    fetcher = new DataFetcher();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    fetcher.stopAutoFetch();
  });

  describe('constructor', () => {
    it('should throw error if environment variables are not set', () => {
      vi.stubEnv('VITE_SPREADSHEET_ID', '');
      vi.stubEnv('VITE_SHEET_NAME', '');
      
      expect(() => new DataFetcher()).toThrow('環境変数が設定されていません');
    });
  });

  describe('fetch', () => {
    it('should successfully fetch and parse data', async () => {
      const mockData = {
        values: [
          // ヘッダー行
          ['CAMPAIGN_URL', 'ORDER_NAME', 'ADVERTISER_NAME', 'AGENCY_NAME', 'CAMPAIGN_ID', 'CAMPAIGN_NAME', '優先度', 'START_TIME', 'END_TIME', '配信日数', '目標Imp', '累積実績Imp', '日割りImp', '配信キャップ', '当日Imp', '全体時間', '経過時間', '時間進捗率', 'imp進捗', '進捗率'],
          // データ行
          ['https://example.com', 'Test Campaign', 'Advertiser A', 'Agency A', 'C001', 'Campaign 1', 1, '2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z', 31, 1000000, 500000, 32258, 50000, 30000, 744, 372, 50, 500000, 50],
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetcher.fetch(mockAccessToken);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].CAMPAIGN_NAME).toBe('Campaign 1');
      expect(result.data[0].targetImp).toBe(1000000);
      expect(result.error).toBeUndefined();
    });

    it('should handle 401 authentication error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await fetcher.fetch(mockAccessToken);

      expect(result.success).toBe(false);
      expect(result.error).toContain('認証エラー');
      expect(result.data).toEqual([]);
    });

    it('should handle 403 permission error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const result = await fetcher.fetch(mockAccessToken);

      expect(result.success).toBe(false);
      expect(result.error).toContain('権限エラー');
    });

    it('should handle 404 not found error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await fetcher.fetch(mockAccessToken);

      expect(result.success).toBe(false);
      expect(result.error).toContain('スプレッドシートが見つかりません');
    });

    it('should handle network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await fetcher.fetch(mockAccessToken);

      expect(result.success).toBe(false);
      expect(result.error).toContain('ネットワーク接続を確認してください');
    });

    it('should handle invalid data format (missing values)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await fetcher.fetch(mockAccessToken);

      expect(result.success).toBe(false);
      expect(result.error).toContain('データ形式が不正です');
    });

    it('should skip empty rows', async () => {
      const mockData = {
        values: [
          ['CAMPAIGN_URL', 'ORDER_NAME', 'ADVERTISER_NAME', 'AGENCY_NAME', 'CAMPAIGN_ID', 'CAMPAIGN_NAME', '優先度', 'START_TIME', 'END_TIME', '配信日数', '目標Imp', '累積実績Imp', '日割りImp', '配信キャップ', '当日Imp', '全体時間', '経過時間', '時間進捗率', 'imp進捗', '進捗率'],
          ['https://example.com', 'Test Campaign', 'Advertiser A', 'Agency A', 'C001', 'Campaign 1', 1, '2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z', 31, 1000000, 500000, 32258, 50000, 30000, 744, 372, 50, 500000, 50],
          [], // 空行
          ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''], // 空データ行
          ['https://example.com', 'Test Campaign 2', 'Advertiser B', 'Agency B', 'C002', 'Campaign 2', 2, '2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z', 31, 2000000, 1000000, 64516, 100000, 60000, 744, 372, 50, 1000000, 50],
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetcher.fetch(mockAccessToken);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should handle rows with insufficient columns', async () => {
      const mockData = {
        values: [
          ['CAMPAIGN_URL', 'ORDER_NAME', 'ADVERTISER_NAME', 'AGENCY_NAME', 'CAMPAIGN_ID', 'CAMPAIGN_NAME', '優先度', 'START_TIME', 'END_TIME', '配信日数', '目標Imp', '累積実績Imp', '日割りImp', '配信キャップ', '当日Imp', '全体時間', '経過時間', '時間進捗率', 'imp進捗', '進捗率'],
          ['https://example.com', 'Test Campaign', 'Advertiser A'], // 不足
          ['https://example.com', 'Test Campaign 2', 'Advertiser B', 'Agency B', 'C002', 'Campaign 2', 2, '2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z', 31, 2000000, 1000000, 64516, 100000, 60000, 744, 372, 50, 1000000, 50],
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await fetcher.fetch(mockAccessToken);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1); // 有効な行のみ
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('startAutoFetch and stopAutoFetch', () => {
    it('should call callback immediately on start', async () => {
      const mockData = {
        values: [
          ['CAMPAIGN_URL', 'ORDER_NAME', 'ADVERTISER_NAME', 'AGENCY_NAME', 'CAMPAIGN_ID', 'CAMPAIGN_NAME', '優先度', 'START_TIME', 'END_TIME', '配信日数', '目標Imp', '累積実績Imp', '日割りImp', '配信キャップ', '当日Imp', '全体時間', '経過時間', '時間進捗率', 'imp進捗', '進捗率'],
          ['https://example.com', 'Test Campaign', 'Advertiser A', 'Agency A', 'C001', 'Campaign 1', 1, '2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z', 31, 1000000, 500000, 32258, 50000, 30000, 744, 372, 50, 500000, 50],
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const callback = vi.fn();

      fetcher.startAutoFetch(mockAccessToken, callback);

      // 初回実行を待つ
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        })
      );

      fetcher.stopAutoFetch();
    });

    it('should stop auto fetch when stopAutoFetch is called', () => {
      const callback = vi.fn();

      fetcher.startAutoFetch(mockAccessToken, callback);
      fetcher.stopAutoFetch();

      // タイマーがクリアされたことを確認（エラーが発生しないこと）
      expect(() => fetcher.stopAutoFetch()).not.toThrow();
    });
  });

  describe('parseSheetData', () => {
    it('should parse all 20 fields correctly', async () => {
      const mockData = {
        values: [
          ['CAMPAIGN_URL', 'ORDER_NAME', 'ADVERTISER_NAME', 'AGENCY_NAME', 'CAMPAIGN_ID', 'CAMPAIGN_NAME', '優先度', 'START_TIME', 'END_TIME', '配信日数', '目標Imp', '累積実績Imp', '日割りImp', '配信キャップ', '当日Imp', '全体時間', '経過時間', '時間進捗率', 'imp進捗', '進捗率'],
          ['https://example.com/campaign', 'PMP Campaign', 'Advertiser X', 'Agency Y', 'C123', 'Test Campaign', 5, '2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z', 31, 5000000, 2500000, 161290, 200000, 150000, 744, 372, 50, 2500000, 50],
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetcher.fetch(mockAccessToken);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);

      const campaign = result.data[0];
      expect(campaign.CAMPAIGN_URL).toBe('https://example.com/campaign');
      expect(campaign.ORDER_NAME).toBe('PMP Campaign');
      expect(campaign.ADVERTISER_NAME).toBe('Advertiser X');
      expect(campaign.AGENCY_NAME).toBe('Agency Y');
      expect(campaign.CAMPAIGN_ID).toBe('C123');
      expect(campaign.CAMPAIGN_NAME).toBe('Test Campaign');
      expect(campaign.priority).toBe(5);
      expect(campaign.START_TIME).toBe('2024-01-01T00:00:00Z');
      expect(campaign.END_TIME).toBe('2024-01-31T23:59:59Z');
      expect(campaign.deliveryDays).toBe(31);
      expect(campaign.targetImp).toBe(5000000);
      expect(campaign.cumulativeImp).toBe(2500000);
      expect(campaign.dailyImp).toBe(161290);
      expect(campaign.deliveryCap).toBe(200000);
      expect(campaign.todayImp).toBe(150000);
      expect(campaign.totalHours).toBe(744);
      expect(campaign.elapsedHours).toBe(372);
      expect(campaign.timeProgressRate).toBe(50);
      expect(campaign.impProgress).toBe(2500000);
      expect(campaign.progressRate).toBe(50);
    });
  });
});
