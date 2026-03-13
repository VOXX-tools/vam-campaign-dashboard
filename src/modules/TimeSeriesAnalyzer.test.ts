/**
 * TimeSeriesAnalyzer - ユニットテスト
 * 
 * このファイルは、TimeSeriesAnalyzerクラスの動作を検証します。
 * Requirements: 7.1-7.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TimeSeriesAnalyzer } from './TimeSeriesAnalyzer';
import type { EnrichedCampaign } from '../types';

describe('TimeSeriesAnalyzer', () => {
  let analyzer: TimeSeriesAnalyzer;

  beforeEach(() => {
    analyzer = new TimeSeriesAnalyzer();
  });

  // ヘルパー関数: テスト用のキャンペーンデータを作成
  const createMockCampaign = (
    adType: 'RESERVED' | 'PROGRAMMATIC' | 'HOUSE',
    todayImp: number
  ): EnrichedCampaign => {
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
      todayImp,
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
        type: adType,
        label: adType === 'RESERVED' ? '予約型' : adType === 'PROGRAMMATIC' ? '運用型' : '自社広告',
      },
      remainingDays: 30,
      remainingImp: 500000,
    };
  };

  describe('addDataPoint', () => {
    it('should add a data point with correct aggregation', () => {
      const campaigns = [
        createMockCampaign('RESERVED', 10000),
        createMockCampaign('PROGRAMMATIC', 20000),
        createMockCampaign('HOUSE', 5000),
      ];
      const timestamp = new Date('2024-01-01T10:00:00Z');

      analyzer.addDataPoint(campaigns, timestamp);

      const dataPoints = analyzer.getLast24Hours();
      expect(dataPoints).toHaveLength(1);
      expect(dataPoints[0].timestamp).toEqual(timestamp);
      expect(dataPoints[0].totalImp).toBe(35000);
      expect(dataPoints[0].reservedImp).toBe(10000);
      expect(dataPoints[0].programmaticImp).toBe(20000);
      expect(dataPoints[0].houseImp).toBe(5000);
    });

    it('should handle empty campaigns array', () => {
      const timestamp = new Date('2024-01-01T10:00:00Z');

      analyzer.addDataPoint([], timestamp);

      const dataPoints = analyzer.getLast24Hours();
      expect(dataPoints).toHaveLength(1);
      expect(dataPoints[0].totalImp).toBe(0);
      expect(dataPoints[0].reservedImp).toBe(0);
      expect(dataPoints[0].programmaticImp).toBe(0);
      expect(dataPoints[0].houseImp).toBe(0);
    });

    it('should aggregate multiple campaigns of the same type', () => {
      const campaigns = [
        createMockCampaign('RESERVED', 10000),
        createMockCampaign('RESERVED', 15000),
        createMockCampaign('RESERVED', 20000),
      ];
      const timestamp = new Date('2024-01-01T10:00:00Z');

      analyzer.addDataPoint(campaigns, timestamp);

      const dataPoints = analyzer.getLast24Hours();
      expect(dataPoints[0].reservedImp).toBe(45000);
      expect(dataPoints[0].totalImp).toBe(45000);
    });

    it('should remove data points older than 24 hours', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      const campaigns = [createMockCampaign('RESERVED', 10000)];

      // 26時間分のデータポイントを追加
      for (let i = 0; i < 26; i++) {
        const timestamp = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
        analyzer.addDataPoint(campaigns, timestamp);
      }

      const dataPoints = analyzer.getLast24Hours();
      // 最初のデータポイント（10:00）は削除され、11:00以降の25ポイントが残る
      expect(dataPoints.length).toBe(25);
      
      // 最も古いデータポイントは24時間以内
      const oldestPoint = dataPoints[0];
      const newestPoint = dataPoints[dataPoints.length - 1];
      const timeDiff = newestPoint.timestamp.getTime() - oldestPoint.timestamp.getTime();
      expect(timeDiff).toBe(24 * 60 * 60 * 1000); // ちょうど24時間
    });
  });

  describe('getLast24Hours', () => {
    it('should return empty array when no data points exist', () => {
      const dataPoints = analyzer.getLast24Hours();
      expect(dataPoints).toEqual([]);
    });

    it('should return all data points within 24 hours', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      const campaigns = [createMockCampaign('RESERVED', 10000)];

      // 5つのデータポイントを追加
      for (let i = 0; i < 5; i++) {
        const timestamp = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
        analyzer.addDataPoint(campaigns, timestamp);
      }

      const dataPoints = analyzer.getLast24Hours();
      expect(dataPoints).toHaveLength(5);
    });

    it('should return a copy of the data points array', () => {
      const campaigns = [createMockCampaign('RESERVED', 10000)];
      const timestamp = new Date('2024-01-01T10:00:00Z');

      analyzer.addDataPoint(campaigns, timestamp);

      const dataPoints1 = analyzer.getLast24Hours();
      const dataPoints2 = analyzer.getLast24Hours();

      expect(dataPoints1).not.toBe(dataPoints2); // 異なる配列インスタンス
      expect(dataPoints1).toEqual(dataPoints2); // 同じ内容
    });
  });

  describe('analyze', () => {
    it('should return default values when no data points exist', () => {
      const analysis = analyzer.analyze();

      expect(analysis.dataPoints).toEqual([]);
      expect(analysis.peakHour).toBe(0);
      expect(analysis.lowHour).toBe(0);
      expect(analysis.averageImp).toBe(0);
    });

    it('should detect peak hour correctly', () => {
      // 異なるimpのデータポイントを追加
      analyzer.addDataPoint([createMockCampaign('RESERVED', 5000)], new Date('2024-01-01T08:00:00Z'));
      analyzer.addDataPoint([createMockCampaign('RESERVED', 15000)], new Date('2024-01-01T14:00:00Z')); // ピーク
      analyzer.addDataPoint([createMockCampaign('RESERVED', 10000)], new Date('2024-01-01T20:00:00Z'));

      const analysis = analyzer.analyze();

      expect(analysis.peakHour).toBe(14); // 14時がピーク
    });

    it('should detect low hour correctly', () => {
      // 異なるimpのデータポイントを追加
      analyzer.addDataPoint([createMockCampaign('RESERVED', 15000)], new Date('2024-01-01T08:00:00Z'));
      analyzer.addDataPoint([createMockCampaign('RESERVED', 3000)], new Date('2024-01-01T03:00:00Z')); // 低調
      analyzer.addDataPoint([createMockCampaign('RESERVED', 10000)], new Date('2024-01-01T20:00:00Z'));

      const analysis = analyzer.analyze();

      expect(analysis.lowHour).toBe(3); // 3時が低調
    });

    it('should calculate average imp correctly', () => {
      analyzer.addDataPoint([createMockCampaign('RESERVED', 10000)], new Date('2024-01-01T08:00:00Z'));
      analyzer.addDataPoint([createMockCampaign('RESERVED', 20000)], new Date('2024-01-01T14:00:00Z'));
      analyzer.addDataPoint([createMockCampaign('RESERVED', 30000)], new Date('2024-01-01T20:00:00Z'));

      const analysis = analyzer.analyze();

      expect(analysis.averageImp).toBe(20000); // (10000 + 20000 + 30000) / 3
    });

    it('should return a copy of data points in analysis', () => {
      const campaigns = [createMockCampaign('RESERVED', 10000)];
      const timestamp = new Date('2024-01-01T10:00:00Z');

      analyzer.addDataPoint(campaigns, timestamp);

      const analysis = analyzer.analyze();
      const dataPoints = analyzer.getLast24Hours();

      expect(analysis.dataPoints).not.toBe(dataPoints); // 異なる配列インスタンス
      expect(analysis.dataPoints).toEqual(dataPoints); // 同じ内容
    });

    it('should handle single data point', () => {
      const campaigns = [createMockCampaign('RESERVED', 10000)];
      const timestamp = new Date('2024-01-01T15:00:00Z');

      analyzer.addDataPoint(campaigns, timestamp);

      const analysis = analyzer.analyze();

      expect(analysis.peakHour).toBe(15);
      expect(analysis.lowHour).toBe(15);
      expect(analysis.averageImp).toBe(10000);
    });

    it('should handle zero imp values', () => {
      analyzer.addDataPoint([createMockCampaign('RESERVED', 0)], new Date('2024-01-01T08:00:00Z'));
      analyzer.addDataPoint([createMockCampaign('RESERVED', 0)], new Date('2024-01-01T14:00:00Z'));

      const analysis = analyzer.analyze();

      expect(analysis.averageImp).toBe(0);
    });
  });

  describe('integration - full workflow', () => {
    it('should handle a complete 24-hour cycle', () => {
      const baseTime = new Date('2024-01-01T00:00:00Z');

      // 24時間分のデータを追加（時間ごとに異なるimp）
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(baseTime.getTime() + hour * 60 * 60 * 1000);
        const imp = 5000 + hour * 1000; // 時間とともに増加
        analyzer.addDataPoint([createMockCampaign('RESERVED', imp)], timestamp);
      }

      const analysis = analyzer.analyze();

      expect(analysis.dataPoints).toHaveLength(24);
      expect(analysis.peakHour).toBe(23); // 最後の時間が最大
      expect(analysis.lowHour).toBe(0); // 最初の時間が最小
      expect(analysis.averageImp).toBeGreaterThan(0);
    });
  });
});
