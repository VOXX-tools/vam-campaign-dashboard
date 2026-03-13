/**
 * AppContext - アプリケーション全体の状態管理
 * 
 * Tasks: 8.1, 8.2, 8.3
 * Requirements: 全体
 * 
 * 機能:
 * - useReducerとuseContextを使用したグローバル状態管理
 * - DataFetcherとの統合（自動データ取得）
 * - GoogleAuthContextからアクセストークンを取得
 * - LocalStorageManagerとの統合（データ永続化）
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, AppAction, EnrichedCampaign, FetchResult } from '../types';
import { DataFetcher } from '../modules/DataFetcher';
import { StatusEvaluator } from '../modules/StatusEvaluator';
import { LocalStorageManager } from '../modules/LocalStorageManager';
import { useGoogleAuth } from './GoogleAuthContext';

/**
 * AppContextの型定義
 */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refetch: () => void;
}

/**
 * 初期状態
 */
const initialState: AppState = {
  campaigns: [],
  lastFetchTime: null,
  isLoading: false,
  error: null,
  selectedCampaign: null,
  filters: {
    status: [],
    adType: [],
    agency: [],
  },
  sortBy: 'name',
  sortOrder: 'asc',
};

/**
 * appReducer - 状態更新ロジック
 * 
 * Task 8.2: appReducerの実装
 * アクション:
 * - FETCH_START: データ取得開始
 * - FETCH_SUCCESS: データ取得成功
 * - FETCH_ERROR: データ取得エラー
 * - SELECT_CAMPAIGN: キャンペーン選択
 * - SET_FILTERS: フィルタ設定
 * - SET_SORT: ソート設定
 */
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        campaigns: action.payload.campaigns,
        lastFetchTime: action.payload.timestamp,
        isLoading: false,
        error: null,
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'SELECT_CAMPAIGN':
      return {
        ...state,
        selectedCampaign: action.payload,
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };

    default:
      return state;
  }
};

/**
 * AppContext
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppContextProvider - コンテキストプロバイダー
 * 
 * Task 8.3: AppContextProviderの実装
 * 機能:
 * - useReducerで状態管理
 * - DataFetcherとの統合（自動データ取得）
 * - GoogleAuthContextからaccessTokenを取得
 * - LocalStorageManagerでデータ永続化
 */
export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { accessToken, isAuthenticated } = useGoogleAuth();
  
  // DataFetcherとLocalStorageManagerのインスタンス
  const dataFetcherRef = React.useRef<DataFetcher | null>(null);
  const storageManagerRef = React.useRef<LocalStorageManager>(new LocalStorageManager());
  const statusEvaluatorRef = React.useRef<StatusEvaluator>(new StatusEvaluator());

  /**
   * データ取得処理
   */
  const fetchData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    dispatch({ type: 'FETCH_START' });

    try {
      // DataFetcherインスタンスを作成（初回のみ）
      if (!dataFetcherRef.current) {
        dataFetcherRef.current = new DataFetcher();
      }

      const result: FetchResult = await dataFetcherRef.current.fetch(accessToken);

      if (result.success) {
        // ステータス評価を実行してEnrichedCampaignに変換
        const enrichedCampaigns: EnrichedCampaign[] = result.data.map((campaign) => {
          const status = statusEvaluatorRef.current.evaluateStatus(campaign);
          const adType = statusEvaluatorRef.current.evaluateAdType(campaign.ORDER_NAME);
          const remainingDays = statusEvaluatorRef.current.calculateRemainingDays(campaign.END_TIME);
          const remainingImp = statusEvaluatorRef.current.calculateRemainingImp(
            campaign.targetImp,
            campaign.cumulativeImp
          );

          return {
            ...campaign,
            status,
            adType,
            remainingDays,
            remainingImp,
          };
        });

        // LocalStorageに保存
        storageManagerRef.current.save({
          campaigns: enrichedCampaigns,
          timestamp: result.timestamp,
        });

        // 時系列データポイントを保存
        const totalImp = enrichedCampaigns.reduce((sum, c) => sum + c.todayImp, 0);
        const reservedImp = enrichedCampaigns
          .filter((c) => c.adType.type === 'RESERVED')
          .reduce((sum, c) => sum + c.todayImp, 0);
        const programmaticImp = enrichedCampaigns
          .filter((c) => c.adType.type === 'PROGRAMMATIC')
          .reduce((sum, c) => sum + c.todayImp, 0);
        const houseImp = enrichedCampaigns
          .filter((c) => c.adType.type === 'HOUSE')
          .reduce((sum, c) => sum + c.todayImp, 0);

        storageManagerRef.current.saveTimeSeries({
          timestamp: result.timestamp,
          totalImp,
          reservedImp,
          programmaticImp,
          houseImp,
        });

        // 状態を更新
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            campaigns: enrichedCampaigns,
            timestamp: result.timestamp,
          },
        });
      } else {
        dispatch({
          type: 'FETCH_ERROR',
          payload: result.error || '不明なエラーが発生しました',
        });
      }
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: error instanceof Error ? error.message : '不明なエラーが発生しました',
      });
    }
  }, [accessToken]);

  /**
   * 手動でデータを再取得
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 初期化処理
   * - LocalStorageからデータを読み込み
   * - 認証済みの場合は自動データ取得を開始
   */
  useEffect(() => {
    // LocalStorageからデータを読み込み
    const savedData = storageManagerRef.current.load();
    if (savedData) {
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          campaigns: savedData.campaigns,
          timestamp: savedData.timestamp,
        },
      });
    }

    // 古いデータをクリーンアップ（7日以上前）
    storageManagerRef.current.cleanup();
  }, []);

  /**
   * 認証状態が変わったら自動データ取得を開始/停止
   */
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      // 認証されていない場合は自動取得を停止
      if (dataFetcherRef.current) {
        dataFetcherRef.current.stopAutoFetch();
      }
      return;
    }

    // 初回データ取得
    fetchData();

    // 自動データ取得を開始
    if (!dataFetcherRef.current) {
      dataFetcherRef.current = new DataFetcher();
    }

    dataFetcherRef.current.startAutoFetch(accessToken, (result: FetchResult) => {
      if (result.success) {
        // ステータス評価を実行してEnrichedCampaignに変換
        const enrichedCampaigns: EnrichedCampaign[] = result.data.map((campaign) => {
          const status = statusEvaluatorRef.current.evaluateStatus(campaign);
          const adType = statusEvaluatorRef.current.evaluateAdType(campaign.ORDER_NAME);
          const remainingDays = statusEvaluatorRef.current.calculateRemainingDays(campaign.END_TIME);
          const remainingImp = statusEvaluatorRef.current.calculateRemainingImp(
            campaign.targetImp,
            campaign.cumulativeImp
          );

          return {
            ...campaign,
            status,
            adType,
            remainingDays,
            remainingImp,
          };
        });

        // LocalStorageに保存
        storageManagerRef.current.save({
          campaigns: enrichedCampaigns,
          timestamp: result.timestamp,
        });

        // 時系列データポイントを保存
        const totalImp = enrichedCampaigns.reduce((sum, c) => sum + c.todayImp, 0);
        const reservedImp = enrichedCampaigns
          .filter((c) => c.adType.type === 'RESERVED')
          .reduce((sum, c) => sum + c.todayImp, 0);
        const programmaticImp = enrichedCampaigns
          .filter((c) => c.adType.type === 'PROGRAMMATIC')
          .reduce((sum, c) => sum + c.todayImp, 0);
        const houseImp = enrichedCampaigns
          .filter((c) => c.adType.type === 'HOUSE')
          .reduce((sum, c) => sum + c.todayImp, 0);

        storageManagerRef.current.saveTimeSeries({
          timestamp: result.timestamp,
          totalImp,
          reservedImp,
          programmaticImp,
          houseImp,
        });

        // 状態を更新
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            campaigns: enrichedCampaigns,
            timestamp: result.timestamp,
          },
        });
      } else {
        dispatch({
          type: 'FETCH_ERROR',
          payload: result.error || '不明なエラーが発生しました',
        });
      }
    });

    // クリーンアップ: コンポーネントがアンマウントされたら自動取得を停止
    return () => {
      if (dataFetcherRef.current) {
        dataFetcherRef.current.stopAutoFetch();
      }
    };
  }, [isAuthenticated, accessToken, fetchData]);

  const value: AppContextType = {
    state,
    dispatch,
    refetch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * useAppContext - AppContextを使用するカスタムフック
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};
