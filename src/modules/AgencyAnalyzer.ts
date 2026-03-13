/**
 * AgencyAnalyzer - 代理店別分析モジュール
 * 
 * 代理店ごとのキャンペーン状況を集計し、分析します。
 * Requirements: 8.1-8.7
 */

import type { EnrichedCampaign, AgencySummary } from '../types';

export class AgencyAnalyzer {
  /**
   * 代理店別サマリーを生成
   * @param campaigns - エンリッチされたキャンペーンデータ
   * @returns 代理店別サマリーの配列
   */
  analyze(campaigns: EnrichedCampaign[]): AgencySummary[] {
    // 代理店名でグループ化
    const agencyMap = new Map<string, EnrichedCampaign[]>();

    for (const campaign of campaigns) {
      const agencyName = campaign.AGENCY_NAME;
      if (!agencyMap.has(agencyName)) {
        agencyMap.set(agencyName, []);
      }
      agencyMap.get(agencyName)!.push(campaign);
    }

    // 各代理店のサマリーを生成
    const summaries: AgencySummary[] = [];

    for (const [agencyName, agencyCampaigns] of agencyMap.entries()) {
      let criticalCount = 0;
      let warningCount = 0;
      let healthyCount = 0;
      let totalProgressRate = 0;
      let totalImp = 0;

      for (const campaign of agencyCampaigns) {
        // ステータスカウント
        const statusColor = campaign.status.color;
        if (statusColor === 'red') {
          criticalCount++;
        } else if (statusColor === 'yellow') {
          warningCount++;
        } else if (statusColor === 'green') {
          healthyCount++;
        }

        // 進捗率と総impを集計
        totalProgressRate += campaign.progressRate;
        totalImp += campaign.todayImp;
      }

      const averageProgressRate =
        agencyCampaigns.length > 0 ? totalProgressRate / agencyCampaigns.length : 0;

      summaries.push({
        agencyName,
        totalCampaigns: agencyCampaigns.length,
        criticalCount,
        warningCount,
        healthyCount,
        averageProgressRate,
        totalImp,
      });
    }

    return summaries;
  }

  /**
   * 要対応キャンペーン数でソート（降順）
   * @param summaries - 代理店別サマリーの配列
   * @returns ソート済みの代理店別サマリーの配列
   */
  sortByCriticalCount(summaries: AgencySummary[]): AgencySummary[] {
    return [...summaries].sort((a, b) => b.criticalCount - a.criticalCount);
  }
}
