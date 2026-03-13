/**
 * VAMキャンペーン監視ダッシュボード - 型定義
 * 
 * このファイルは、アプリケーション全体で使用される型定義を提供します。
 * Requirements: 1.2, 2.1-2.4, 3.1-3.5, 4.1-4.2, 5.1
 */

/**
 * キャンペーンデータ（20項目）
 * Googleスプレッドシートから取得される生データ
 */
export interface CampaignData {
  CAMPAIGN_URL: string;
  ORDER_NAME: string;
  ADVERTISER_NAME: string;
  AGENCY_NAME: string;
  CAMPAIGN_ID: string;
  CAMPAIGN_NAME: string;
  priority: number;
  START_TIME: string; // ISO 8601 format
  END_TIME: string; // ISO 8601 format
  deliveryDays: number;
  targetImp: number;
  cumulativeImp: number;
  dailyImp: number;
  deliveryCap: number;
  todayImp: number;
  totalHours: number;
  elapsedHours: number;
  timeProgressRate: number; // percentage
  impProgress: number;
  progressRate: number; // percentage
}

/**
 * キャンペーンステータスの種類
 * 
 * 要対応（CRITICAL）:
 * - CRITICAL_BEHIND_80: ビハインド80%未満
 * - CRITICAL_BEHIND_2_5M: ビハインド250万imp以上
 * - CRITICAL_LOW_TODAY: 当日imp少なめ
 * - CRITICAL_CAP_RISK: キャップ未達リスク
 * - CRITICAL_ZERO_IMP: 0imp異常
 * 
 * 注意（WARNING）:
 * - WARNING_ENDING_SOON: 1週間以内終了
 * - WARNING_EARLY_COMPLETE: 早期終了・超過
 * 
 * 順調（HEALTHY）:
 * - HEALTHY: 順調
 * 
 * 対象外（NOT_APPLICABLE）:
 * - NOT_APPLICABLE: ステータス判定対象外（自社広告・運用型）
 */
export type CampaignStatusType =
  | 'CRITICAL_BEHIND_80'
  | 'CRITICAL_BEHIND_2_5M'
  | 'CRITICAL_LOW_TODAY'
  | 'CRITICAL_CAP_RISK'
  | 'CRITICAL_ZERO_IMP'
  | 'WARNING_ENDING_SOON'
  | 'WARNING_EARLY_COMPLETE'
  | 'HEALTHY'
  | 'NOT_APPLICABLE';

/**
 * キャンペーンステータス情報
 */
export interface CampaignStatus {
  type: CampaignStatusType;
  label: string;
  color: 'red' | 'yellow' | 'green' | 'gray';
  icon: string;
}

/**
 * 広告種別
 * - RESERVED: 予約型
 * - PROGRAMMATIC: 運用型（PMPを含む）
 * - HOUSE: 自社広告
 */
export type AdType = 'RESERVED' | 'PROGRAMMATIC' | 'HOUSE';

/**
 * 広告種別情報
 */
export interface AdTypeInfo {
  type: AdType;
  label: string;
}

/**
 * エンリッチされたキャンペーンデータ
 * CampaignDataにステータスと広告種別情報を追加
 */
export interface EnrichedCampaign extends CampaignData {
  status: CampaignStatus;
  adType: AdTypeInfo;
  remainingDays: number;
  remainingImp: number;
}

/**
 * データ取得結果
 */
export interface FetchResult {
  data: CampaignData[];
  timestamp: Date;
  success: boolean;
  error?: string;
}

/**
 * DataFetcherの設定
 */
export interface DataFetcherConfig {
  apiEndpoint: string;
  fetchInterval: number; // milliseconds
}

/**
 * 時系列データポイント
 */
export interface TimeSeriesDataPoint {
  timestamp: Date;
  totalImp: number;
  reservedImp: number;
  programmaticImp: number;
  houseImp: number;
}

/**
 * 時系列分析結果
 */
export interface TimeSeriesAnalysis {
  dataPoints: TimeSeriesDataPoint[];
  peakHour: number;
  lowHour: number;
  averageImp: number;
}

/**
 * 代理店別サマリー
 */
export interface AgencySummary {
  agencyName: string;
  totalCampaigns: number;
  criticalCount: number;
  warningCount: number;
  healthyCount: number;
  averageProgressRate: number;
  totalImp: number;
}

/**
 * LocalStorageに保存するデータ
 */
export interface StorageData {
  campaigns: EnrichedCampaign[];
  timestamp: Date;
}

/**
 * エラー状態
 */
export interface ErrorState {
  type: 'network' | 'api' | 'data_format' | 'storage' | null;
  message: string;
  timestamp: Date;
  retryCount: number;
}

/**
 * アプリケーション状態
 */
export interface AppState {
  campaigns: EnrichedCampaign[];
  lastFetchTime: Date | null;
  isLoading: boolean;
  error: string | null;
  selectedCampaign: EnrichedCampaign | null;
  filters: {
    status: CampaignStatusType[];
    adType: AdType[];
    agency: string[];
  };
  sortBy: 'name' | 'agency' | 'progressRate';
  sortOrder: 'asc' | 'desc';
}

/**
 * アプリケーションアクション
 */
export type AppAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { campaigns: EnrichedCampaign[]; timestamp: Date } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SELECT_CAMPAIGN'; payload: EnrichedCampaign | null }
  | { type: 'SET_FILTERS'; payload: Partial<AppState['filters']> }
  | { type: 'SET_SORT'; payload: { sortBy: AppState['sortBy']; sortOrder: AppState['sortOrder'] } };
