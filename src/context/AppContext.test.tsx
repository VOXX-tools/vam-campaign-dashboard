/**
 * AppContext - ユニットテスト
 * 
 * Tasks: 8.1, 8.2, 8.3
 * 
 * テスト内容:
 * - appReducerの各アクションの動作確認
 * - 状態遷移の検証
 */

import { describe, it, expect } from 'vitest';
import { appReducer } from './AppContext';
import type { AppState, EnrichedCampaign, CampaignStatusType, AdType } from '../types';

describe('appReducer', () => {
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

  describe('FETCH_START', () => {
    it('should set isLoading to true and clear error', () => {
      const state = {
        ...initialState,
        error: 'Previous error',
      };

      const newState = appReducer(state, { type: 'FETCH_START' });

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBe(null);
    });
  });

  describe('FETCH_SUCCESS', () => {
    it('should update campaigns, lastFetchTime, and set isLoading to false', () => {
      const mockCampaigns: EnrichedCampaign[] = [
        {
          CAMPAIGN_URL: 'https://example.com',
          ORDER_NAME: 'Test Order',
          ADVERTISER_NAME: 'Test Advertiser',
          AGENCY_NAME: 'Test Agency',
          CAMPAIGN_ID: '123',
          CAMPAIGN_NAME: 'Test Campaign',
          priority: 1,
          START_TIME: '2024-01-01T00:00:00Z',
          END_TIME: '2024-12-31T23:59:59Z',
          deliveryDays: 365,
          targetImp: 1000000,
          cumulativeImp: 500000,
          dailyImp: 2740,
          deliveryCap: 10000,
          todayImp: 2500,
          totalHours: 8760,
          elapsedHours: 4380,
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
          remainingDays: 183,
          remainingImp: 500000,
        },
      ];
      const timestamp = new Date('2024-06-01T00:00:00Z');

      const state = {
        ...initialState,
        isLoading: true,
      };

      const newState = appReducer(state, {
        type: 'FETCH_SUCCESS',
        payload: { campaigns: mockCampaigns, timestamp },
      });

      expect(newState.campaigns).toEqual(mockCampaigns);
      expect(newState.lastFetchTime).toEqual(timestamp);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(null);
    });
  });

  describe('FETCH_ERROR', () => {
    it('should set error message and set isLoading to false', () => {
      const state = {
        ...initialState,
        isLoading: true,
      };

      const errorMessage = 'Network error';
      const newState = appReducer(state, {
        type: 'FETCH_ERROR',
        payload: errorMessage,
      });

      expect(newState.error).toBe(errorMessage);
      expect(newState.isLoading).toBe(false);
    });
  });

  describe('SELECT_CAMPAIGN', () => {
    it('should set selectedCampaign', () => {
      const mockCampaign: EnrichedCampaign = {
        CAMPAIGN_URL: 'https://example.com',
        ORDER_NAME: 'Test Order',
        ADVERTISER_NAME: 'Test Advertiser',
        AGENCY_NAME: 'Test Agency',
        CAMPAIGN_ID: '123',
        CAMPAIGN_NAME: 'Test Campaign',
        priority: 1,
        START_TIME: '2024-01-01T00:00:00Z',
        END_TIME: '2024-12-31T23:59:59Z',
        deliveryDays: 365,
        targetImp: 1000000,
        cumulativeImp: 500000,
        dailyImp: 2740,
        deliveryCap: 10000,
        todayImp: 2500,
        totalHours: 8760,
        elapsedHours: 4380,
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
        remainingDays: 183,
        remainingImp: 500000,
      };

      const newState = appReducer(initialState, {
        type: 'SELECT_CAMPAIGN',
        payload: mockCampaign,
      });

      expect(newState.selectedCampaign).toEqual(mockCampaign);
    });

    it('should clear selectedCampaign when payload is null', () => {
      const state = {
        ...initialState,
        selectedCampaign: {} as EnrichedCampaign,
      };

      const newState = appReducer(state, {
        type: 'SELECT_CAMPAIGN',
        payload: null,
      });

      expect(newState.selectedCampaign).toBe(null);
    });
  });

  describe('SET_FILTERS', () => {
    it('should update filters partially', () => {
      const newState = appReducer(initialState, {
        type: 'SET_FILTERS',
        payload: {
          status: ['CRITICAL_BEHIND_80', 'WARNING_ENDING_SOON'],
        },
      });

      expect(newState.filters.status).toEqual(['CRITICAL_BEHIND_80', 'WARNING_ENDING_SOON']);
      expect(newState.filters.adType).toEqual([]);
      expect(newState.filters.agency).toEqual([]);
    });

    it('should merge filters with existing values', () => {
      const state: AppState = {
        ...initialState,
        filters: {
          status: ['HEALTHY'] as CampaignStatusType[],
          adType: ['RESERVED'] as AdType[],
          agency: [],
        },
      };

      const newState = appReducer(state, {
        type: 'SET_FILTERS',
        payload: {
          adType: ['PROGRAMMATIC'],
        },
      });

      expect(newState.filters.status).toEqual(['HEALTHY']);
      expect(newState.filters.adType).toEqual(['PROGRAMMATIC']);
      expect(newState.filters.agency).toEqual([]);
    });
  });

  describe('SET_SORT', () => {
    it('should update sortBy and sortOrder', () => {
      const newState = appReducer(initialState, {
        type: 'SET_SORT',
        payload: {
          sortBy: 'progressRate',
          sortOrder: 'desc',
        },
      });

      expect(newState.sortBy).toBe('progressRate');
      expect(newState.sortOrder).toBe('desc');
    });
  });

  describe('default case', () => {
    it('should return the same state for unknown action', () => {
      const newState = appReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);

      expect(newState).toEqual(initialState);
    });
  });
});
