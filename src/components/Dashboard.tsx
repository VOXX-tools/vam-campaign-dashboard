/**
 * Dashboard - メインダッシュボードコンポーネント
 * 
 * Task 14.1: Dashboardコンポーネントを実装
 * Requirements: 1.5, 6.1-6.7, 7.1-7.5, 8.1-8.7
 * 
 * 機能:
 * - タブ切り替え（キャンペーン一覧/時系列分析/代理店別分析）
 * - 最終取得時刻の表示
 * - エラーバナーの統合
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { AgencyAnalyzer } from '../modules/AgencyAnalyzer';
import { CampaignList } from './CampaignList';
import { TimeSeriesView } from './TimeSeriesView';
import { AgencyView } from './AgencyView';
import { PriorityView } from './PriorityView';
import { ErrorBanner } from './ErrorBanner';
import type { EnrichedCampaign } from '../types';

type TabType = 'list' | 'timeSeries' | 'agency' | 'priority';

export const Dashboard: React.FC = () => {
  const { state, refetch } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('list');

  // 代理店別分析を実行
  const agencySummaries = useMemo(() => {
    const analyzer = new AgencyAnalyzer();
    return analyzer.analyze(state.campaigns);
  }, [state.campaigns]);

  const handleCampaignClick = (campaign: EnrichedCampaign) => {
    navigate(`/campaign/${campaign.CAMPAIGN_ID}`);
  };

  const formatLastFetchTime = (date: Date | null): string => {
    if (!date) return '未取得';
    const d = new Date(date);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'list' as TabType, label: 'キャンペーン一覧', icon: '📋' },
    { id: 'timeSeries' as TabType, label: '時系列分析', icon: '📈' },
    { id: 'agency' as TabType, label: '代理店別分析', icon: '🏢' },
    { id: 'priority' as TabType, label: '優先度別分析', icon: '🎯' },
  ];

  return (
    <div className="space-y-6">
      {/* エラーバナー */}
      {state.error && (
        <ErrorBanner
          error={state.error}
          onRetry={refetch}
          onDismiss={() => {
            // エラーを閉じる処理は省略（状態管理を簡略化）
          }}
        />
      )}

      {/* ヘッダー情報 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">ダッシュボード</h2>
            <p className="text-sm text-gray-600 mt-1">
              最終取得: {formatLastFetchTime(state.lastFetchTime)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              総キャンペーン数: <span className="font-semibold text-gray-900">{state.campaigns.length}</span>
            </div>
            <button
              onClick={refetch}
              disabled={state.isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {state.isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  更新中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  更新
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div>
        {state.isLoading && state.campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600">データを読み込んでいます...</p>
          </div>
        ) : state.campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="h-12 w-12 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-600">キャンペーンデータがありません</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              データを取得
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'list' && (
              <CampaignList campaigns={state.campaigns} onCampaignClick={handleCampaignClick} />
            )}
            {activeTab === 'timeSeries' && <TimeSeriesView campaigns={state.campaigns} />}
            {activeTab === 'agency' && <AgencyView summaries={agencySummaries} />}
            {activeTab === 'priority' && <PriorityView campaigns={state.campaigns} />}
          </>
        )}
      </div>
    </div>
  );
};
