/**
 * LocalStorageManager - ユニットテスト
 * 
 * このファイルは、LocalStorageManagerクラスの動作を検証します。
 * Requirements: 12.1-12.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageManager } from './LocalStorageManager';
import type { StorageData, TimeSeriesDataPoint, EnrichedCampaign } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global localStorage with mock
(globalThis as any).localStorage = localStorageMock;

describe('LocalStorageManager', () => {
  let manager: LocalStorageManager;

  // ヘルパー関数: テスト用のキャンペーンデータを作成
  const createMockEnrichedCampaign = (overrides: Partial<EnrichedCampaign> = {}): EnrichedCampaign => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      CAMPAIGN_URL: 'https://example.com/campaign/1',
      ORDER_NAME: 'Test Order',
      ADVERTISER_NAME: 'Test Advertiser',
      AGENCY_NAME: 'Test Agency',
      CAMPAIGN_ID: 'CAMP001',
      CAMPAIGN_NAME: 'Test Campaign',
      priority: 1,
      START_TIME: now.toISOString(),
      END_TIME: endDate.toISOString(),
      deliveryDays: 30,
      targetImp: 1000000,
      cumulativeImp: 500000,
      dailyImp: 33333,
      deliveryCap: 50000,
      todayImp: 30000,
      totalHours: 720,
      elapsedHours: 360,
      timeProgressRate: 50,
      impProgress: 500000,
      progressRate: 50,
      status: {
        type: 'HEALTHY',
        label: '🟢順調',
        color: 'green',
        icon: '🟢',
      },
      adType: {
        type: 'RESERVED',
        label: '予約型',
      },
      remainingDays: 30,
      remainingImp: 500000,
      ...overrides,
    };
  };

  // ヘルパー関数: テスト用の時系列データポイントを作成
  const createMockTimeSeriesDataPoint = (timestamp: Date): TimeSeriesDataPoint => ({
    timestamp,
    totalImp: 100000,
    reservedImp: 50000,
    programmaticImp: 30000,
    houseImp: 20000,
  });

  beforeEach(() => {
    manager = new LocalStorageManager();
    // LocalStorageをクリア
    localStorage.clear();
  });

  afterEach(() => {
    // テスト後のクリーンアップ
    localStorage.clear();
  });

  describe('save and load', () => {
    // Requirement 12.1: キャンペーンデータの保存と読み込み
    it('should save and load campaign data correctly', () => {
      const campaign = createMockEnrichedCampaign();
      const timestamp = new Date();
      const data: StorageData = {
        campaigns: [campaign],
        timestamp,
      };

      manager.save(data);
      const loaded = manager.load();

      expect(loaded).not.toBeNull();
      expect(loaded!.campaigns).toHaveLength(1);
      expect(loaded!.campaigns[0].CAMPAIGN_ID).toBe('CAMP001');
      expect(loaded!.timestamp.toISOString()).toBe(timestamp.toISOString());
    });

    it('should return null when no data is stored', () => {
      const loaded = manager.load();
      expect(loaded).toBeNull();
    });

    it('should handle multiple campaigns', () => {
      const campaign1 = createMockEnrichedCampaign({ CAMPAIGN_ID: 'CAMP001' });
      const campaign2 = createMockEnrichedCampaign({ CAMPAIGN_ID: 'CAMP002' });
      const campaign3 = createMockEnrichedCampaign({ CAMPAIGN_ID: 'CAMP003' });
      const timestamp = new Date();
      const data: StorageData = {
        campaigns: [campaign1, campaign2, campaign3],
        timestamp,
      };

      manager.save(data);
      const loaded = manager.load();

      expect(loaded).not.toBeNull();
      expect(loaded!.campaigns).toHaveLength(3);
      expect(loaded!.campaigns[0].CAMPAIGN_ID).toBe('CAMP001');
      expect(loaded!.campaigns[1].CAMPAIGN_ID).toBe('CAMP002');
      expect(loaded!.campaigns[2].CAMPAIGN_ID).toBe('CAMP003');
    });

    it('should overwrite existing data when saving', () => {
      const campaign1 = createMockEnrichedCampaign({ CAMPAIGN_ID: 'CAMP001' });
      const data1: StorageData = {
        campaigns: [campaign1],
        timestamp: new Date(),
      };

      manager.save(data1);

      const campaign2 = createMockEnrichedCampaign({ CAMPAIGN_ID: 'CAMP002' });
      const data2: StorageData = {
        campaigns: [campaign2],
        timestamp: new Date(),
      };

      manager.save(data2);
      const loaded = manager.load();

      expect(loaded).not.toBeNull();
      expect(loaded!.campaigns).toHaveLength(1);
      expect(loaded!.campaigns[0].CAMPAIGN_ID).toBe('CAMP002');
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('vam_dashboard_campaigns', 'invalid json');
      const loaded = manager.load();
      expect(loaded).toBeNull();
    });

    it('should preserve all campaign fields', () => {
      const campaign = createMockEnrichedCampaign({
        CAMPAIGN_NAME: 'テストキャンペーン',
        ADVERTISER_NAME: '広告主A',
        AGENCY_NAME: '代理店B',
        priority: 5,
        targetImp: 2500000,
        progressRate: 75.5,
      });
      const data: StorageData = {
        campaigns: [campaign],
        timestamp: new Date(),
      };

      manager.save(data);
      const loaded = manager.load();

      expect(loaded).not.toBeNull();
      expect(loaded!.campaigns[0].CAMPAIGN_NAME).toBe('テストキャンペーン');
      expect(loaded!.campaigns[0].ADVERTISER_NAME).toBe('広告主A');
      expect(loaded!.campaigns[0].AGENCY_NAME).toBe('代理店B');
      expect(loaded!.campaigns[0].priority).toBe(5);
      expect(loaded!.campaigns[0].targetImp).toBe(2500000);
      expect(loaded!.campaigns[0].progressRate).toBe(75.5);
    });
  });

  describe('saveTimeSeries and loadTimeSeries', () => {
    // Requirement 12.1: 時系列データの保存と読み込み
    it('should save and load time series data correctly', () => {
      const timestamp = new Date();
      const dataPoint = createMockTimeSeriesDataPoint(timestamp);

      manager.saveTimeSeries(dataPoint);
      const loaded = manager.loadTimeSeries();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].timestamp.toISOString()).toBe(timestamp.toISOString());
      expect(loaded[0].totalImp).toBe(100000);
      expect(loaded[0].reservedImp).toBe(50000);
      expect(loaded[0].programmaticImp).toBe(30000);
      expect(loaded[0].houseImp).toBe(20000);
    });

    it('should return empty array when no time series data is stored', () => {
      const loaded = manager.loadTimeSeries();
      expect(loaded).toEqual([]);
    });

    it('should append new data points to existing time series', () => {
      const timestamp1 = new Date('2024-01-01T10:00:00Z');
      const timestamp2 = new Date('2024-01-01T11:00:00Z');
      const timestamp3 = new Date('2024-01-01T12:00:00Z');

      manager.saveTimeSeries(createMockTimeSeriesDataPoint(timestamp1));
      manager.saveTimeSeries(createMockTimeSeriesDataPoint(timestamp2));
      manager.saveTimeSeries(createMockTimeSeriesDataPoint(timestamp3));

      const loaded = manager.loadTimeSeries();

      expect(loaded).toHaveLength(3);
      expect(loaded[0].timestamp.toISOString()).toBe(timestamp1.toISOString());
      expect(loaded[1].timestamp.toISOString()).toBe(timestamp2.toISOString());
      expect(loaded[2].timestamp.toISOString()).toBe(timestamp3.toISOString());
    });

    it('should handle corrupted time series data gracefully', () => {
      localStorage.setItem('vam_dashboard_timeseries', 'invalid json');
      const loaded = manager.loadTimeSeries();
      expect(loaded).toEqual([]);
    });

    it('should preserve all time series fields', () => {
      const timestamp = new Date();
      const dataPoint: TimeSeriesDataPoint = {
        timestamp,
        totalImp: 250000,
        reservedImp: 100000,
        programmaticImp: 100000,
        houseImp: 50000,
      };

      manager.saveTimeSeries(dataPoint);
      const loaded = manager.loadTimeSeries();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].totalImp).toBe(250000);
      expect(loaded[0].reservedImp).toBe(100000);
      expect(loaded[0].programmaticImp).toBe(100000);
      expect(loaded[0].houseImp).toBe(50000);
    });
  });

  describe('cleanup', () => {
    // Requirement 12.2, 12.3: 7日以上前のデータを削除
    it('should remove time series data older than 7 days', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3日前
      const old = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000); // 8日前

      manager.saveTimeSeries(createMockTimeSeriesDataPoint(old));
      manager.saveTimeSeries(createMockTimeSeriesDataPoint(recent));

      manager.cleanup();

      const loaded = manager.loadTimeSeries();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].timestamp.toISOString()).toBe(recent.toISOString());
    });

    it('should keep data exactly 7 days old', () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      manager.saveTimeSeries(createMockTimeSeriesDataPoint(sevenDaysAgo));
      manager.cleanup();

      const loaded = manager.loadTimeSeries();
      expect(loaded).toHaveLength(1);
    });

    it('should remove all time series data if all are older than 7 days', () => {
      const now = new Date();
      const old1 = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      const old2 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const old3 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

      manager.saveTimeSeries(createMockTimeSeriesDataPoint(old1));
      manager.saveTimeSeries(createMockTimeSeriesDataPoint(old2));
      manager.saveTimeSeries(createMockTimeSeriesDataPoint(old3));

      manager.cleanup();

      const loaded = manager.loadTimeSeries();
      expect(loaded).toEqual([]);
    });

    it('should remove campaign data older than 7 days', () => {
      const now = new Date();
      const old = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      const campaign = createMockEnrichedCampaign();
      const data: StorageData = {
        campaigns: [campaign],
        timestamp: old,
      };

      manager.save(data);
      manager.cleanup();

      const loaded = manager.load();
      expect(loaded).toBeNull();
    });

    it('should keep campaign data within 7 days', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const campaign = createMockEnrichedCampaign();
      const data: StorageData = {
        campaigns: [campaign],
        timestamp: recent,
      };

      manager.save(data);
      manager.cleanup();

      const loaded = manager.load();
      expect(loaded).not.toBeNull();
      expect(loaded!.campaigns).toHaveLength(1);
    });

    it('should handle cleanup when no data exists', () => {
      expect(() => manager.cleanup()).not.toThrow();
    });

    it('should handle cleanup with corrupted data gracefully', () => {
      localStorage.setItem('vam_dashboard_timeseries', 'invalid json');
      localStorage.setItem('vam_dashboard_campaigns', 'invalid json');
      expect(() => manager.cleanup()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty campaigns array', () => {
      const data: StorageData = {
        campaigns: [],
        timestamp: new Date(),
      };

      manager.save(data);
      const loaded = manager.load();

      expect(loaded).not.toBeNull();
      expect(loaded!.campaigns).toEqual([]);
    });

    it('should handle very large campaign data', () => {
      const campaigns = Array.from({ length: 1000 }, (_, i) =>
        createMockEnrichedCampaign({ CAMPAIGN_ID: `CAMP${i.toString().padStart(4, '0')}` })
      );
      const data: StorageData = {
        campaigns,
        timestamp: new Date(),
      };

      manager.save(data);
      const loaded = manager.load();

      expect(loaded).not.toBeNull();
      expect(loaded!.campaigns).toHaveLength(1000);
    });

    it('should handle time series data with same timestamp', () => {
      const timestamp = new Date();
      const dataPoint1 = { ...createMockTimeSeriesDataPoint(timestamp), totalImp: 100000 };
      const dataPoint2 = { ...createMockTimeSeriesDataPoint(timestamp), totalImp: 200000 };

      manager.saveTimeSeries(dataPoint1);
      manager.saveTimeSeries(dataPoint2);

      const loaded = manager.loadTimeSeries();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].totalImp).toBe(100000);
      expect(loaded[1].totalImp).toBe(200000);
    });

    it('should handle zero values in time series data', () => {
      const timestamp = new Date();
      const dataPoint: TimeSeriesDataPoint = {
        timestamp,
        totalImp: 0,
        reservedImp: 0,
        programmaticImp: 0,
        houseImp: 0,
      };

      manager.saveTimeSeries(dataPoint);
      const loaded = manager.loadTimeSeries();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].totalImp).toBe(0);
      expect(loaded[0].reservedImp).toBe(0);
      expect(loaded[0].programmaticImp).toBe(0);
      expect(loaded[0].houseImp).toBe(0);
    });
  });
});
