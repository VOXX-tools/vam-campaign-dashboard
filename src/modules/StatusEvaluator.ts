/**
 * StatusEvaluator - キャンペーンステータス判定モジュール
 * 
 * このモジュールは、キャンペーンデータからステータスと広告種別を判定します。
 * Requirements: 2.1-2.4, 3.1-3.6, 4.1-4.3, 5.1-5.2
 */

import type { CampaignData, CampaignStatus, AdTypeInfo } from '../types';

/**
 * StatusEvaluatorクラス
 * キャンペーンのステータス判定と広告種別判定を行います
 */
export class StatusEvaluator {
  /**
   * 広告種別を判定します
   * 
   * Requirements:
   * - 2.1: ORDER_NAMEに「PMP」が含まれる → PROGRAMMATIC
   * - 2.2: ORDER_NAMEに「自社広告」が含まれる → HOUSE
   * - 2.3: それ以外 → RESERVED
   * 
   * @param orderName - ORDER_NAME文字列
   * @returns 広告種別情報
   */
  evaluateAdType(orderName: string): AdTypeInfo {
    // Requirement 2.1: ORDER_NAMEに「PMP」が含まれる → PROGRAMMATIC
    if (orderName.includes('PMP')) {
      return {
        type: 'PROGRAMMATIC',
        label: '運用型',
      };
    }

    // Requirement 2.2: ORDER_NAMEに「自社広告」が含まれる → HOUSE
    if (orderName.includes('自社広告')) {
      return {
        type: 'HOUSE',
        label: '自社広告',
      };
    }

    // Requirement 2.3: それ以外 → RESERVED
    return {
      type: 'RESERVED',
      label: '予約型',
    };
  }

  /**
   * キャンペーンのステータスを判定します
   * 
   * 判定順序（Requirement 3.6, 4.3）:
   * 1. 自社広告と運用型は常に「対象外」を返す
   * 2. 予約型のみ要対応条件を上から順に評価（3.1→3.2→3.3→3.4→3.5）
   * 3. 次に注意条件を評価（4.1→4.2）
   * 4. どれにも該当しない → 順調
   * 
   * @param campaign - キャンペーンデータ
   * @returns キャンペーンステータス
   */
  evaluateStatus(campaign: CampaignData): CampaignStatus {
    // 広告種別を判定
    const adType = this.evaluateAdType(campaign.ORDER_NAME);
    
    // 自社広告と運用型はステータス判定対象外
    if (adType.type === 'HOUSE' || adType.type === 'PROGRAMMATIC') {
      return {
        type: 'NOT_APPLICABLE',
        label: '-',
        color: 'gray',
        icon: '',
      };
    }
    // 残り日数と残り必要impを計算
    const remainingDays = this.calculateRemainingDays(campaign.END_TIME);
    const remainingImp = this.calculateRemainingImp(campaign.targetImp, campaign.cumulativeImp);

    // === 要対応条件の評価（上から順に） ===

    // Requirement 3.1: ビハインド80%未満
    // 経過時間が24時間以上かつ進捗率が80%以下
    if (campaign.elapsedHours >= 24 && campaign.progressRate <= 80) {
      return {
        type: 'CRITICAL_BEHIND_80',
        label: '🔴要対応（ビハインド80%未満）',
        color: 'red',
        icon: '🔴',
      };
    }

    // Requirement 3.2: ビハインド250万imp以上
    // 目標Impが2500000以上かつ経過時間が24時間以上かつ進捗率が100%未満
    if (campaign.targetImp >= 2500000 && campaign.elapsedHours >= 24 && campaign.progressRate < 100) {
      return {
        type: 'CRITICAL_BEHIND_2_5M',
        label: '🔴要対応（ビハインド250万imp以上）',
        color: 'red',
        icon: '🔴',
      };
    }

    // Requirement 3.3: 当日imp少なめ
    // 日割りImpが0より大きくかつ当日Impが日割りImpの10%未満
    if (campaign.dailyImp > 0 && campaign.todayImp < campaign.dailyImp * 0.1) {
      return {
        type: 'CRITICAL_LOW_TODAY',
        label: '🔴要対応（当日imp少なめ）',
        color: 'red',
        icon: '🔴',
      };
    }

    // Requirement 3.4: キャップ未達リスク
    // 残り日数が0より大きくかつ配信キャップ×残り日数が残り必要impを下回る
    if (remainingDays > 0 && campaign.deliveryCap * remainingDays < remainingImp) {
      return {
        type: 'CRITICAL_CAP_RISK',
        label: '🔴要対応（キャップ未達リスク）',
        color: 'red',
        icon: '🔴',
      };
    }

    // Requirement 3.5: 0imp異常
    // 目標Impが0より大きくかつ当日Impが0
    if (campaign.targetImp > 0 && campaign.todayImp === 0) {
      return {
        type: 'CRITICAL_ZERO_IMP',
        label: '🔴要対応（0imp異常）',
        color: 'red',
        icon: '🔴',
      };
    }

    // === 注意条件の評価 ===

    // Requirement 4.1: 1週間以内終了
    // 要対応条件に該当せずかつ終了日時が7日以内かつ進捗率が100%未満
    if (remainingDays <= 7 && remainingDays > 0 && campaign.progressRate < 100) {
      return {
        type: 'WARNING_ENDING_SOON',
        label: '🟡注意（1週間以内終了）',
        color: 'yellow',
        icon: '🟡',
      };
    }

    // Requirement 4.2: 早期終了・超過
    // 要対応条件に該当せずかつ累積実績Impが目標Imp以上
    if (campaign.cumulativeImp >= campaign.targetImp) {
      return {
        type: 'WARNING_EARLY_COMPLETE',
        label: '🟡注意（早期終了・超過）',
        color: 'yellow',
        icon: '🟡',
      };
    }

    // === 順調 ===

    // Requirement 5.1: 順調
    // 要対応条件にも注意条件にも該当しない
    return {
      type: 'HEALTHY',
      label: '🟢順調',
      color: 'green',
      icon: '🟢',
    };
  }

  /**
   * 残り日数を計算します
   * 
   * @param endTime - 終了日時（ISO 8601形式）
   * @returns 残り日数
   */
  calculateRemainingDays(endTime: string): number {
    const now = new Date();
    const end = new Date(endTime);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * 残り必要impを計算します
   * 
   * @param targetImp - 目標Imp
   * @param cumulativeImp - 累積実績Imp
   * @returns 残り必要imp
   */
  calculateRemainingImp(targetImp: number, cumulativeImp: number): number {
    return Math.max(0, targetImp - cumulativeImp);
  }
}
