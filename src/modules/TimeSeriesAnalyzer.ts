/**
 * TimeSeriesAnalyzer - 時系列分析モジュール
 * 
 * 過去24時間のimp推移を分析し、ピーク時間と低調な時間を検出します。
 * Requirements: 7.1-7.5
 */

import type { EnrichedCampaign, TimeSeriesDataPoint, TimeSeriesAnalysis } from '../types';

export class TimeSeriesAnalyzer {
  private dataPoints: TimeSeriesDataPoint[] = [];

  /**
   * 時系列データポイントを追加
   * @param campaigns - エンリッチされたキャンペーンデータ
   * @param timestamp - データポイントのタイムスタンプ
   */
  addDataPoint(campaigns: EnrichedCampaign[], timestamp: Date): void {
    let totalImp = 0;
    let reservedImp = 0;
    let programmaticImp = 0;
    let houseImp = 0;

    // 広告種別ごとにimpを集計
    for (const campaign of campaigns) {
      const imp = campaign.todayImp;
      totalImp += imp;

      switch (campaign.adType.type) {
        case 'RESERVED':
          reservedImp += imp;
          break;
        case 'PROGRAMMATIC':
          programmaticImp += imp;
          break;
        case 'HOUSE':
          houseImp += imp;
          break;
      }
    }

    // データポイントを追加
    this.dataPoints.push({
      timestamp,
      totalImp,
      reservedImp,
      programmaticImp,
      houseImp,
    });

    // 24時間より古いデータを削除
    const cutoffTime = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
    this.dataPoints = this.dataPoints.filter(
      (point) => point.timestamp >= cutoffTime
    );
  }

  /**
   * 過去24時間のデータを取得
   * @returns 過去24時間の時系列データポイント
   */
  getLast24Hours(): TimeSeriesDataPoint[] {
    return [...this.dataPoints];
  }

  /**
   * 時系列データを分析
   * @returns 分析結果（ピーク時間、低調な時間、平均imp）
   */
  analyze(): TimeSeriesAnalysis {
    if (this.dataPoints.length === 0) {
      return {
        dataPoints: [],
        peakHour: 0,
        lowHour: 0,
        averageImp: 0,
      };
    }

    // ピーク時間と低調な時間を検出
    let maxImp = -Infinity;
    let minImp = Infinity;
    let peakHour = 0;
    let lowHour = 0;
    let totalImp = 0;

    for (const point of this.dataPoints) {
      const imp = point.totalImp;
      totalImp += imp;

      if (imp > maxImp) {
        maxImp = imp;
        peakHour = point.timestamp.getUTCHours();
      }

      if (imp < minImp) {
        minImp = imp;
        lowHour = point.timestamp.getUTCHours();
      }
    }

    const averageImp = totalImp / this.dataPoints.length;

    return {
      dataPoints: [...this.dataPoints],
      peakHour,
      lowHour,
      averageImp,
    };
  }
}
