/**
 * LocalStorageManager - データ永続化モジュール
 * 
 * キャンペーンデータと時系列データをLocalStorageに保存・読み込みします。
 * 7日以上前のデータは自動的に削除されます。
 * 
 * Requirements: 12.1-12.4
 */

import type { StorageData, TimeSeriesDataPoint } from '../types';

const STORAGE_KEY_CAMPAIGNS = 'vam_dashboard_campaigns';
const STORAGE_KEY_TIMESERIES = 'vam_dashboard_timeseries';
const DATA_RETENTION_DAYS = 90; // 約3ヶ月分のデータを保存

export class LocalStorageManager {
  /**
   * キャンペーンデータを保存
   * Requirements: 12.1
   */
  save(data: StorageData): void {
    try {
      const serializedData = {
        campaigns: data.campaigns,
        timestamp: data.timestamp.toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(serializedData));
    } catch (error) {
      console.error('Failed to save campaign data to localStorage:', error);
      throw new Error('LocalStorage save failed');
    }
  }

  /**
   * キャンペーンデータを読み込み
   * Requirements: 12.1
   */
  load(): StorageData | null {
    try {
      const serializedData = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
      if (!serializedData) {
        return null;
      }

      const parsed = JSON.parse(serializedData);
      return {
        campaigns: parsed.campaigns,
        timestamp: new Date(parsed.timestamp),
      };
    } catch (error) {
      console.error('Failed to load campaign data from localStorage:', error);
      return null;
    }
  }

  /**
   * 時系列データポイントを保存
   * Requirements: 12.1
   */
  saveTimeSeries(dataPoint: TimeSeriesDataPoint): void {
    try {
      const existingData = this.loadTimeSeries();
      const serializedDataPoint: TimeSeriesDataPoint = {
        timestamp: dataPoint.timestamp,
        totalImp: dataPoint.totalImp,
        reservedImp: dataPoint.reservedImp,
        programmaticImp: dataPoint.programmaticImp,
        houseImp: dataPoint.houseImp,
      };
      
      existingData.push(serializedDataPoint);
      localStorage.setItem(STORAGE_KEY_TIMESERIES, JSON.stringify(existingData));
    } catch (error) {
      console.error('Failed to save time series data to localStorage:', error);
      throw new Error('LocalStorage save failed');
    }
  }

  /**
   * 時系列データを読み込み
   * Requirements: 12.1, 12.4
   */
  loadTimeSeries(): TimeSeriesDataPoint[] {
    try {
      const serializedData = localStorage.getItem(STORAGE_KEY_TIMESERIES);
      if (!serializedData) {
        return [];
      }

      const parsed = JSON.parse(serializedData);
      return parsed.map((item: any) => ({
        timestamp: new Date(item.timestamp),
        totalImp: item.totalImp,
        reservedImp: item.reservedImp,
        programmaticImp: item.programmaticImp,
        houseImp: item.houseImp,
      }));
    } catch (error) {
      console.error('Failed to load time series data from localStorage:', error);
      return [];
    }
  }

  /**
   * 90日以上前のデータを削除
   * Requirements: 12.2, 12.3
   */
  cleanup(): void {
    try {
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000);

      // 時系列データのクリーンアップ
      const timeSeriesData = this.loadTimeSeries();
      const filteredTimeSeries = timeSeriesData.filter(
        (dataPoint) => dataPoint.timestamp >= cutoffDate
      );

      if (filteredTimeSeries.length !== timeSeriesData.length) {
        const serializedData = filteredTimeSeries.map((item) => ({
          timestamp: item.timestamp.toISOString(),
          totalImp: item.totalImp,
          reservedImp: item.reservedImp,
          programmaticImp: item.programmaticImp,
          houseImp: item.houseImp,
        }));
        localStorage.setItem(STORAGE_KEY_TIMESERIES, JSON.stringify(serializedData));
      }

      // キャンペーンデータのクリーンアップ
      const campaignData = this.load();
      if (campaignData && campaignData.timestamp < cutoffDate) {
        localStorage.removeItem(STORAGE_KEY_CAMPAIGNS);
      }
    } catch (error) {
      console.error('Failed to cleanup old data from localStorage:', error);
    }
  }
}
