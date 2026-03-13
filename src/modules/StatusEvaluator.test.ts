/**
 * StatusEvaluator - ユニットテスト
 * 
 * このファイルは、StatusEvaluatorクラスの動作を検証します。
 * Requirements: 2.1-2.4, 3.1-3.6, 4.1-4.3, 5.1-5.2
 */

import { describe, it, expect } from 'vitest';
import { StatusEvaluator } from './StatusEvaluator';
import type { CampaignData } from '../types';

describe('StatusEvaluator', () => {
  const evaluator = new StatusEvaluator();

  // ヘルパー関数: テスト用のキャンペーンデータを作成
  const createMockCampaign = (overrides: Partial<CampaignData> = {}): CampaignData => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30日後

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
      ...overrides,
    };
  };

  describe('evaluateAdType', () => {
    // Requirement 2.1: ORDER_NAMEに「PMP」が含まれる → PROGRAMMATIC
    it('should classify campaigns with "PMP" in ORDER_NAME as PROGRAMMATIC', () => {
      const result = evaluator.evaluateAdType('Test PMP Campaign');
      expect(result.type).toBe('PROGRAMMATIC');
      expect(result.label).toBe('運用型');
    });

    it('should classify campaigns with "PMP" at the start as PROGRAMMATIC', () => {
      const result = evaluator.evaluateAdType('PMP Test Campaign');
      expect(result.type).toBe('PROGRAMMATIC');
    });

    it('should classify campaigns with "PMP" at the end as PROGRAMMATIC', () => {
      const result = evaluator.evaluateAdType('Test Campaign PMP');
      expect(result.type).toBe('PROGRAMMATIC');
    });

    // Requirement 2.2: ORDER_NAMEに「自社広告」が含まれる → HOUSE
    it('should classify campaigns with "自社広告" in ORDER_NAME as HOUSE', () => {
      const result = evaluator.evaluateAdType('Test 自社広告 Campaign');
      expect(result.type).toBe('HOUSE');
      expect(result.label).toBe('自社広告');
    });

    it('should classify campaigns with "自社広告" at the start as HOUSE', () => {
      const result = evaluator.evaluateAdType('自社広告 Test Campaign');
      expect(result.type).toBe('HOUSE');
    });

    // Requirement 2.3: それ以外 → RESERVED
    it('should classify campaigns without "PMP" or "自社広告" as RESERVED', () => {
      const result = evaluator.evaluateAdType('Test Campaign');
      expect(result.type).toBe('RESERVED');
      expect(result.label).toBe('予約型');
    });

    it('should classify empty ORDER_NAME as RESERVED', () => {
      const result = evaluator.evaluateAdType('');
      expect(result.type).toBe('RESERVED');
    });
  });

  describe('evaluateStatus', () => {
    // 目標impが0の場合はステータス判定対象外
    it('should mark as NOT_APPLICABLE when targetImp is 0', () => {
      const campaign = createMockCampaign({
        targetImp: 0,
        cumulativeImp: 0,
        progressRate: 0,
        todayImp: 0,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('NOT_APPLICABLE');
      expect(result.label).toBe('-');
      expect(result.color).toBe('gray');
    });

    // Requirement 3.1: ビハインド80%未満
    it('should mark as CRITICAL_BEHIND_80 when elapsed >= 24h and progress <= 80%', () => {
      const campaign = createMockCampaign({
        elapsedHours: 24,
        progressRate: 80,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('CRITICAL_BEHIND_80');
      expect(result.color).toBe('red');
    });

    it('should mark as CRITICAL_BEHIND_80 when elapsed > 24h and progress < 80%', () => {
      const campaign = createMockCampaign({
        elapsedHours: 48,
        progressRate: 50,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('CRITICAL_BEHIND_80');
    });

    it('should NOT mark as CRITICAL_BEHIND_80 when elapsed < 24h', () => {
      const campaign = createMockCampaign({
        elapsedHours: 23,
        progressRate: 50,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).not.toBe('CRITICAL_BEHIND_80');
    });

    it('should NOT mark as CRITICAL_BEHIND_80 when progress > 80%', () => {
      const campaign = createMockCampaign({
        elapsedHours: 48,
        progressRate: 85,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).not.toBe('CRITICAL_BEHIND_80');
    });

    // Requirement 3.2: ビハインド250万imp以上
    it('should mark as CRITICAL_BEHIND_2_5M when targetImp >= 2.5M and elapsed >= 24h and progress < 100%', () => {
      const campaign = createMockCampaign({
        targetImp: 2500000,
        elapsedHours: 24,
        progressRate: 90,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('CRITICAL_BEHIND_2_5M');
      expect(result.color).toBe('red');
    });

    it('should NOT mark as CRITICAL_BEHIND_2_5M when targetImp < 2.5M', () => {
      const campaign = createMockCampaign({
        targetImp: 2499999,
        elapsedHours: 24,
        progressRate: 90,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).not.toBe('CRITICAL_BEHIND_2_5M');
    });

    it('should NOT mark as CRITICAL_BEHIND_2_5M when progress >= 100%', () => {
      const campaign = createMockCampaign({
        targetImp: 2500000,
        elapsedHours: 24,
        progressRate: 100,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).not.toBe('CRITICAL_BEHIND_2_5M');
    });

    // Requirement 3.3: 当日imp少なめ
    it('should mark as CRITICAL_LOW_TODAY when dailyImp > 0 and todayImp < dailyImp * 0.1', () => {
      const campaign = createMockCampaign({
        dailyImp: 100000,
        todayImp: 5000, // 5% of dailyImp
        progressRate: 90, // 80%より大きいので3.1には該当しない
        elapsedHours: 10, // 24時間未満なので3.1には該当しない
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('CRITICAL_LOW_TODAY');
      expect(result.color).toBe('red');
    });

    it('should mark as CRITICAL_LOW_TODAY when todayImp is exactly 10% of dailyImp - 1', () => {
      const campaign = createMockCampaign({
        dailyImp: 100000,
        todayImp: 9999, // Just under 10%
        progressRate: 90,
        elapsedHours: 10,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('CRITICAL_LOW_TODAY');
    });

    it('should NOT mark as CRITICAL_LOW_TODAY when todayImp >= dailyImp * 0.1', () => {
      const campaign = createMockCampaign({
        dailyImp: 100000,
        todayImp: 10000, // Exactly 10%
        progressRate: 90,
        elapsedHours: 10,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).not.toBe('CRITICAL_LOW_TODAY');
    });

    // Requirement 3.4: キャップ未達リスク
    it('should mark as CRITICAL_CAP_RISK when remainingDays > 0 and cap * days < remainingImp', () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10日後

      const campaign = createMockCampaign({
        END_TIME: endDate.toISOString(),
        targetImp: 1000000,
        cumulativeImp: 500000, // 残り500000 imp
        deliveryCap: 40000, // 40000 * 10 = 400000 < 500000
        progressRate: 90,
        elapsedHours: 10,
        dailyImp: 0, // 3.3に該当しないように
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('CRITICAL_CAP_RISK');
      expect(result.color).toBe('red');
    });

    // Requirement 3.5: 0imp異常
    it('should mark as CRITICAL_ZERO_IMP when targetImp > 0 and todayImp === 0', () => {
      const campaign = createMockCampaign({
        targetImp: 1000000,
        todayImp: 0,
        progressRate: 90,
        elapsedHours: 10,
        dailyImp: 0, // 3.3に該当しないように
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('CRITICAL_ZERO_IMP');
      expect(result.color).toBe('red');
    });

    it('should NOT mark as CRITICAL_ZERO_IMP when todayImp > 0', () => {
      const campaign = createMockCampaign({
        targetImp: 1000000,
        todayImp: 1,
        progressRate: 90,
        elapsedHours: 10,
        dailyImp: 100000,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).not.toBe('CRITICAL_ZERO_IMP');
    });

    // Requirement 4.1: 1週間以内終了
    it('should mark as WARNING_ENDING_SOON when remainingDays <= 7 and progress < 100%', () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5日後

      const campaign = createMockCampaign({
        END_TIME: endDate.toISOString(),
        targetImp: 1000000,
        cumulativeImp: 900000, // 残り100000 imp
        progressRate: 90,
        elapsedHours: 10,
        dailyImp: 100000,
        todayImp: 50000, // 3.3に該当しないように
        deliveryCap: 100000, // 100000 * 5 = 500000 > 100000 (3.4に該当しないように)
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('WARNING_ENDING_SOON');
      expect(result.color).toBe('yellow');
    });

    it('should mark as WARNING_ENDING_SOON when remainingDays is exactly 7', () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7日後

      const campaign = createMockCampaign({
        END_TIME: endDate.toISOString(),
        targetImp: 1000000,
        cumulativeImp: 900000, // 残り100000 imp
        progressRate: 90,
        elapsedHours: 10,
        dailyImp: 100000,
        todayImp: 50000,
        deliveryCap: 100000, // 100000 * 7 = 700000 > 100000 (3.4に該当しないように)
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('WARNING_ENDING_SOON');
    });

    it('should NOT mark as WARNING_ENDING_SOON when progress >= 100%', () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      const campaign = createMockCampaign({
        END_TIME: endDate.toISOString(),
        progressRate: 100,
        cumulativeImp: 1000000,
        targetImp: 1000000,
        elapsedHours: 10,
        dailyImp: 100000,
        todayImp: 50000,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).not.toBe('WARNING_ENDING_SOON');
    });

    // Requirement 4.2: 早期終了・超過
    it('should mark as WARNING_EARLY_COMPLETE when cumulativeImp >= targetImp', () => {
      const campaign = createMockCampaign({
        targetImp: 1000000,
        cumulativeImp: 1000000,
        progressRate: 100,
        elapsedHours: 10,
        dailyImp: 100000,
        todayImp: 50000,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('WARNING_EARLY_COMPLETE');
      expect(result.color).toBe('yellow');
    });

    it('should mark as WARNING_EARLY_COMPLETE when cumulativeImp > targetImp', () => {
      const campaign = createMockCampaign({
        targetImp: 1000000,
        cumulativeImp: 1200000,
        progressRate: 120,
        elapsedHours: 10,
        dailyImp: 100000,
        todayImp: 50000,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('WARNING_EARLY_COMPLETE');
    });

    // Requirement 5.1: 順調
    it('should mark as HEALTHY when no critical or warning conditions are met', () => {
      const campaign = createMockCampaign({
        elapsedHours: 10,
        progressRate: 90,
        targetImp: 1000000,
        cumulativeImp: 900000,
        dailyImp: 100000,
        todayImp: 50000,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('HEALTHY');
      expect(result.color).toBe('green');
    });

    // Requirement 3.6, 4.3: ステータス判定の優先順位
    it('should prioritize CRITICAL_BEHIND_80 over other conditions', () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      const campaign = createMockCampaign({
        elapsedHours: 24,
        progressRate: 80,
        END_TIME: endDate.toISOString(), // WARNING_ENDING_SOONにも該当
        dailyImp: 100000,
        todayImp: 50000,
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('CRITICAL_BEHIND_80'); // 要対応が優先
    });

    it('should prioritize CRITICAL conditions over WARNING conditions', () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      const campaign = createMockCampaign({
        targetImp: 1000000,
        cumulativeImp: 900000, // 残り100000 imp
        todayImp: 0,
        END_TIME: endDate.toISOString(), // WARNING_ENDING_SOONにも該当
        progressRate: 90,
        elapsedHours: 10,
        dailyImp: 0,
        deliveryCap: 100000, // 100000 * 5 = 500000 > 100000 (3.4に該当しないように)
      });
      const result = evaluator.evaluateStatus(campaign);
      expect(result.type).toBe('CRITICAL_ZERO_IMP'); // 要対応が優先
    });
  });

  describe('calculateRemainingDays', () => {
    it('should calculate remaining days correctly', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10日後
      const result = evaluator.calculateRemainingDays(future.toISOString());
      expect(result).toBe(10);
    });

    it('should return negative days for past dates', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5日前
      const result = evaluator.calculateRemainingDays(past.toISOString());
      expect(result).toBeLessThan(0);
    });

    it('should return 0 for today', () => {
      const now = new Date();
      const result = evaluator.calculateRemainingDays(now.toISOString());
      expect(result).toBe(0);
    });
  });

  describe('calculateRemainingImp', () => {
    it('should calculate remaining imp correctly', () => {
      const result = evaluator.calculateRemainingImp(1000000, 600000);
      expect(result).toBe(400000);
    });

    it('should return 0 when cumulativeImp >= targetImp', () => {
      const result = evaluator.calculateRemainingImp(1000000, 1000000);
      expect(result).toBe(0);
    });

    it('should return 0 when cumulativeImp > targetImp', () => {
      const result = evaluator.calculateRemainingImp(1000000, 1200000);
      expect(result).toBe(0);
    });

    it('should handle zero targetImp', () => {
      const result = evaluator.calculateRemainingImp(0, 0);
      expect(result).toBe(0);
    });
  });
});
