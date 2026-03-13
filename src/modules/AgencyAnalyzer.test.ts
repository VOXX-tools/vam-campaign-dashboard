/**
 * AgencyAnalyzer - ユニットテスト
 * 
 * このファイルは、AgencyAnalyzerクラスの動作を検証します。
 * Requirements: 8.1-8.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AgencyAnalyzer } from './AgencyAnalyzer';
import type { EnrichedCampaign, CampaignStatusType } from '../types';

describe('AgencyAnalyzer', () => {
  let analyzer: AgencyAnalyzer;

  beforeEach(() => {
    analyzer = new AgencyAnalyzer();
  });

  // ヘルパー関数: テスト用のキャンペーンデータを作成
  const createMockCampaign = (
    agencyName: string,
    statusType: CampaignStatusType,
    statusColor: 'red' | 'yellow' | 'green',
    progressRate: number,
    todayImp: number
  ): EnrichedCampaign => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      CAMPAIGN_URL: 'https://example.com/campaign/1',
      ORDER_NAME: 'Test Order',
      ADVERTISER_NAME: 'Test Advertiser',
      AGENCY_NAME: agencyName,
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
      progressRate,
      status: {
        type: statusType,
        label: statusType === 'HEALTHY' ? '🟢順調' : statusType === 'WARNING_ENDING_SOON' ? '🟡注意' : '🔴要対応',
        color: statusColor,
        icon: statusColor === 'green' ? '🟢' : statusColor === 'yellow' ? '🟡' : '🔴',
      },
      adType: {
        type: 'RESERVED',
        label: '予約型',
      },
      remainingDays: 30,
      remainingImp: 500000,
    };
  };

  describe('analyze', () => {
    it('should return empty array for empty campaigns', () => {
      const summaries = analyzer.analyze([]);
      expect(summaries).toEqual([]);
    });

    it('should aggregate campaigns by agency', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'HEALTHY', 'green', 90, 10000),
        createMockCampaign('Agency B', 'HEALTHY', 'green', 80, 20000),
        createMockCampaign('Agency A', 'CRITICAL_BEHIND_80', 'red', 70, 5000),
      ];

      const summaries = analyzer.analyze(campaigns);

      expect(summaries).toHaveLength(2);
      
      const agencyA = summaries.find(s => s.agencyName === 'Agency A');
      const agencyB = summaries.find(s => s.agencyName === 'Agency B');

      expect(agencyA).toBeDefined();
      expect(agencyB).toBeDefined();
      expect(agencyA!.totalCampaigns).toBe(2);
      expect(agencyB!.totalCampaigns).toBe(1);
    });

    it('should count critical campaigns correctly', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'CRITICAL_BEHIND_80', 'red', 70, 10000),
        createMockCampaign('Agency A', 'CRITICAL_ZERO_IMP', 'red', 80, 0),
        createMockCampaign('Agency A', 'HEALTHY', 'green', 90, 20000),
      ];

      const summaries = analyzer.analyze(campaigns);
      const agencyA = summaries.find(s => s.agencyName === 'Agency A');

      expect(agencyA!.criticalCount).toBe(2);
    });

    it('should count warning campaigns correctly', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'WARNING_ENDING_SOON', 'yellow', 85, 10000),
        createMockCampaign('Agency A', 'WARNING_EARLY_COMPLETE', 'yellow', 105, 20000),
        createMockCampaign('Agency A', 'HEALTHY', 'green', 90, 15000),
      ];

      const summaries = analyzer.analyze(campaigns);
      const agencyA = summaries.find(s => s.agencyName === 'Agency A');

      expect(agencyA!.warningCount).toBe(2);
    });

    it('should count healthy campaigns correctly', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'HEALTHY', 'green', 90, 10000),
        createMockCampaign('Agency A', 'HEALTHY', 'green', 85, 20000),
        createMockCampaign('Agency A', 'CRITICAL_BEHIND_80', 'red', 70, 5000),
      ];

      const summaries = analyzer.analyze(campaigns);
      const agencyA = summaries.find(s => s.agencyName === 'Agency A');

      expect(agencyA!.healthyCount).toBe(2);
    });

    it('should calculate average progress rate correctly', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'HEALTHY', 'green', 80, 10000),
        createMockCampaign('Agency A', 'HEALTHY', 'green', 90, 20000),
        createMockCampaign('Agency A', 'HEALTHY', 'green', 100, 15000),
      ];

      const summaries = analyzer.analyze(campaigns);
      const agencyA = summaries.find(s => s.agencyName === 'Agency A');

      expect(agencyA!.averageProgressRate).toBe(90); // (80 + 90 + 100) / 3
    });

    it('should calculate total imp correctly', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'HEALTHY', 'green', 90, 10000),
        createMockCampaign('Agency A', 'HEALTHY', 'green', 85, 20000),
        createMockCampaign('Agency A', 'HEALTHY', 'green', 95, 15000),
      ];

      const summaries = analyzer.analyze(campaigns);
      const agencyA = summaries.find(s => s.agencyName === 'Agency A');

      expect(agencyA!.totalImp).toBe(45000); // 10000 + 20000 + 15000
    });

    it('should handle multiple agencies with different statuses', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'CRITICAL_BEHIND_80', 'red', 70, 10000),
        createMockCampaign('Agency A', 'WARNING_ENDING_SOON', 'yellow', 85, 20000),
        createMockCampaign('Agency A', 'HEALTHY', 'green', 90, 15000),
        createMockCampaign('Agency B', 'HEALTHY', 'green', 95, 30000),
        createMockCampaign('Agency B', 'HEALTHY', 'green', 88, 25000),
      ];

      const summaries = analyzer.analyze(campaigns);

      expect(summaries).toHaveLength(2);

      const agencyA = summaries.find(s => s.agencyName === 'Agency A');
      const agencyB = summaries.find(s => s.agencyName === 'Agency B');

      expect(agencyA!.totalCampaigns).toBe(3);
      expect(agencyA!.criticalCount).toBe(1);
      expect(agencyA!.warningCount).toBe(1);
      expect(agencyA!.healthyCount).toBe(1);
      expect(agencyA!.totalImp).toBe(45000);

      expect(agencyB!.totalCampaigns).toBe(2);
      expect(agencyB!.criticalCount).toBe(0);
      expect(agencyB!.warningCount).toBe(0);
      expect(agencyB!.healthyCount).toBe(2);
      expect(agencyB!.totalImp).toBe(55000);
    });

    it('should handle agency with zero campaigns gracefully', () => {
      const campaigns: EnrichedCampaign[] = [];
      const summaries = analyzer.analyze(campaigns);

      expect(summaries).toEqual([]);
    });

    it('should handle agency with single campaign', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'HEALTHY', 'green', 90, 10000),
      ];

      const summaries = analyzer.analyze(campaigns);
      const agencyA = summaries.find(s => s.agencyName === 'Agency A');

      expect(agencyA!.totalCampaigns).toBe(1);
      expect(agencyA!.averageProgressRate).toBe(90);
      expect(agencyA!.totalImp).toBe(10000);
    });

    it('should handle zero imp values', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'CRITICAL_ZERO_IMP', 'red', 0, 0),
        createMockCampaign('Agency A', 'CRITICAL_ZERO_IMP', 'red', 0, 0),
      ];

      const summaries = analyzer.analyze(campaigns);
      const agencyA = summaries.find(s => s.agencyName === 'Agency A');

      expect(agencyA!.totalImp).toBe(0);
      expect(agencyA!.averageProgressRate).toBe(0);
    });
  });

  describe('sortByCriticalCount', () => {
    it('should sort summaries by critical count in descending order', () => {
      const summaries = [
        {
          agencyName: 'Agency A',
          totalCampaigns: 5,
          criticalCount: 1,
          warningCount: 2,
          healthyCount: 2,
          averageProgressRate: 85,
          totalImp: 50000,
        },
        {
          agencyName: 'Agency B',
          totalCampaigns: 8,
          criticalCount: 5,
          warningCount: 1,
          healthyCount: 2,
          averageProgressRate: 70,
          totalImp: 80000,
        },
        {
          agencyName: 'Agency C',
          totalCampaigns: 3,
          criticalCount: 0,
          warningCount: 1,
          healthyCount: 2,
          averageProgressRate: 95,
          totalImp: 30000,
        },
      ];

      const sorted = analyzer.sortByCriticalCount(summaries);

      expect(sorted[0].agencyName).toBe('Agency B'); // 5 critical
      expect(sorted[1].agencyName).toBe('Agency A'); // 1 critical
      expect(sorted[2].agencyName).toBe('Agency C'); // 0 critical
    });

    it('should handle empty array', () => {
      const sorted = analyzer.sortByCriticalCount([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single summary', () => {
      const summaries = [
        {
          agencyName: 'Agency A',
          totalCampaigns: 5,
          criticalCount: 2,
          warningCount: 1,
          healthyCount: 2,
          averageProgressRate: 85,
          totalImp: 50000,
        },
      ];

      const sorted = analyzer.sortByCriticalCount(summaries);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].agencyName).toBe('Agency A');
    });

    it('should handle summaries with same critical count', () => {
      const summaries = [
        {
          agencyName: 'Agency A',
          totalCampaigns: 5,
          criticalCount: 3,
          warningCount: 1,
          healthyCount: 1,
          averageProgressRate: 80,
          totalImp: 50000,
        },
        {
          agencyName: 'Agency B',
          totalCampaigns: 4,
          criticalCount: 3,
          warningCount: 0,
          healthyCount: 1,
          averageProgressRate: 75,
          totalImp: 40000,
        },
      ];

      const sorted = analyzer.sortByCriticalCount(summaries);
      
      // 同じcriticalCountの場合、元の順序が保持される（安定ソート）
      expect(sorted).toHaveLength(2);
      expect(sorted[0].criticalCount).toBe(3);
      expect(sorted[1].criticalCount).toBe(3);
    });

    it('should not mutate original array', () => {
      const summaries = [
        {
          agencyName: 'Agency A',
          totalCampaigns: 5,
          criticalCount: 1,
          warningCount: 2,
          healthyCount: 2,
          averageProgressRate: 85,
          totalImp: 50000,
        },
        {
          agencyName: 'Agency B',
          totalCampaigns: 8,
          criticalCount: 5,
          warningCount: 1,
          healthyCount: 2,
          averageProgressRate: 70,
          totalImp: 80000,
        },
      ];

      const original = [...summaries];
      const sorted = analyzer.sortByCriticalCount(summaries);

      expect(summaries).toEqual(original); // 元の配列は変更されていない
      expect(sorted).not.toBe(summaries); // 新しい配列が返される
    });

    it('should handle all zero critical counts', () => {
      const summaries = [
        {
          agencyName: 'Agency A',
          totalCampaigns: 5,
          criticalCount: 0,
          warningCount: 2,
          healthyCount: 3,
          averageProgressRate: 90,
          totalImp: 50000,
        },
        {
          agencyName: 'Agency B',
          totalCampaigns: 3,
          criticalCount: 0,
          warningCount: 1,
          healthyCount: 2,
          averageProgressRate: 95,
          totalImp: 30000,
        },
      ];

      const sorted = analyzer.sortByCriticalCount(summaries);
      
      expect(sorted).toHaveLength(2);
      expect(sorted[0].criticalCount).toBe(0);
      expect(sorted[1].criticalCount).toBe(0);
    });
  });

  describe('integration - full workflow', () => {
    it('should analyze and sort in a complete workflow', () => {
      const campaigns = [
        createMockCampaign('Agency A', 'CRITICAL_BEHIND_80', 'red', 70, 10000),
        createMockCampaign('Agency A', 'HEALTHY', 'green', 90, 20000),
        createMockCampaign('Agency B', 'CRITICAL_BEHIND_80', 'red', 65, 15000),
        createMockCampaign('Agency B', 'CRITICAL_ZERO_IMP', 'red', 0, 0),
        createMockCampaign('Agency B', 'WARNING_ENDING_SOON', 'yellow', 85, 10000),
        createMockCampaign('Agency C', 'HEALTHY', 'green', 95, 30000),
      ];

      const summaries = analyzer.analyze(campaigns);
      const sorted = analyzer.sortByCriticalCount(summaries);

      expect(sorted).toHaveLength(3);
      expect(sorted[0].agencyName).toBe('Agency B'); // 2 critical
      expect(sorted[1].agencyName).toBe('Agency A'); // 1 critical
      expect(sorted[2].agencyName).toBe('Agency C'); // 0 critical

      // Agency Bの詳細を確認
      expect(sorted[0].totalCampaigns).toBe(3);
      expect(sorted[0].criticalCount).toBe(2);
      expect(sorted[0].warningCount).toBe(1);
      expect(sorted[0].healthyCount).toBe(0);
    });
  });
});
