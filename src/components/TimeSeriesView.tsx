/**
 * TimeSeriesView - 時系列分析ビューコンポーネント
 * 
 * Task 11.1: TimeSeriesViewコンポーネントを実装
 * Requirements: 7.1-7.4
 * 
 * 機能:
 * - Rechartsを使用してグラフを描画
 * - タブ切り替え（全体/予約型/運用型/自社広告）
 * - Firestoreから時系列データを読み込み
 * - 分析サマリーを表示
 */

import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FirestoreManager } from '../modules/FirestoreManager';
import type { EnrichedCampaign, TimeSeriesDataPoint } from '../types';

interface TimeSeriesViewProps {
  campaigns: EnrichedCampaign[];
}

type ViewMode = 'total' | 'reserved' | 'programmatic' | 'house' | 'comparison';

export const TimeSeriesView: React.FC<TimeSeriesViewProps> = ({ campaigns }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 昨日
    end: new Date().toISOString().split('T')[0], // 今日
  });

  const storageManagerRef = React.useRef<FirestoreManager>(new FirestoreManager());

  // Firestoreから時系列データを読み込み
  useEffect(() => {
    const loadTimeSeriesData = async () => {
      setIsLoading(true);
      try {
        const data = await storageManagerRef.current.loadTimeSeries();
        setTimeSeriesData(data);
      } catch (error) {
        console.error('Failed to load time series data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeSeriesData();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ja-JP');
  };

  // 広告種別ごとのimp集計
  const impByAdType = useMemo(() => {
    return campaigns.reduce((acc, campaign) => {
      const type = campaign.adType.type;
      if (!acc[type]) {
        acc[type] = {
          totalImp: 0,
          todayImp: 0,
          cumulativeImp: 0,
          count: 0,
        };
      }
      acc[type].totalImp += campaign.targetImp;
      acc[type].todayImp += campaign.todayImp;
      acc[type].cumulativeImp += campaign.cumulativeImp;
      acc[type].count++;
      return acc;
    }, {} as Record<string, { totalImp: number; todayImp: number; cumulativeImp: number; count: number }>);
  }, [campaigns]);

  // 時系列データをグラフ用に変換（日付範囲フィルター適用）
  const chartData = useMemo(() => {
    if (timeSeriesData.length === 0) return [];

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // 終了日の最後まで含める

    const filtered = timeSeriesData.filter((point) => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= startDate && pointDate <= endDate;
    });

    return filtered.map((point) => {
      const date = new Date(point.timestamp);
      const dataPoint = {
        time: `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`,
        timestamp: point.timestamp.getTime(),
        予約型: point.reservedImp || 0,
        運用型: point.programmaticImp || 0,
        自社広告: point.houseImp || 0,
        全体: point.totalImp || 0,
      };
      return dataPoint;
    });
  }, [timeSeriesData, dateRange]);

  // 表示するラインを決定
  const getVisibleLines = () => {
    switch (viewMode) {
      case 'total':
        return [{ dataKey: '全体', color: '#3b82f6' }];
      case 'reserved':
        return [{ dataKey: '予約型', color: '#10b981' }];
      case 'programmatic':
        return [{ dataKey: '運用型', color: '#f59e0b' }];
      case 'house':
        return [{ dataKey: '自社広告', color: '#8b5cf6' }];
      case 'comparison':
        return [
          { dataKey: '予約型', color: '#10b981' },
          { dataKey: '運用型', color: '#f59e0b' },
          { dataKey: '自社広告', color: '#8b5cf6' },
        ];
      default:
        return [{ dataKey: '全体', color: '#3b82f6' }];
    }
  };

  const tabs: { mode: ViewMode; label: string }[] = [
    { mode: 'comparison', label: '広告種別比較' },
    { mode: 'total', label: '全体' },
    { mode: 'reserved', label: '予約型' },
    { mode: 'programmatic', label: '運用型' },
    { mode: 'house', label: '自社広告' },
  ];

  return (
    <div className="space-y-6">
      {/* 日付範囲フィルター */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">期間:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">〜</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
                setDateRange({
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0],
                });
              }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              過去7日
            </button>
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
                setDateRange({
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0],
                });
              }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              過去30日
            </button>
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date(end.getTime() - 60 * 24 * 60 * 60 * 1000);
                setDateRange({
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0],
                });
              }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              過去60日
            </button>
          </div>
        </div>
      </div>

      {/* 広告種別タブ */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.mode}
              onClick={() => setViewMode(tab.mode)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === tab.mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-sm text-green-600 font-medium">予約型</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {formatNumber(impByAdType['RESERVED']?.todayImp || 0)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {impByAdType['RESERVED']?.count || 0} キャンペーン
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4">
          <div className="text-sm text-orange-600 font-medium">運用型</div>
          <div className="text-2xl font-bold text-orange-900 mt-1">
            {formatNumber(impByAdType['PROGRAMMATIC']?.todayImp || 0)}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {impByAdType['PROGRAMMATIC']?.count || 0} キャンペーン
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <div className="text-sm text-purple-600 font-medium">自社広告</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {formatNumber(impByAdType['HOUSE']?.todayImp || 0)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {impByAdType['HOUSE']?.count || 0} キャンペーン
          </div>
        </div>
      </div>

      {/* グラフ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          時系列Imp推移（{dateRange.start} 〜 {dateRange.end}）
        </h3>
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-gray-500">
            <svg className="h-16 w-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p>時系列データがまだ蓄積されていません</p>
            <p className="text-sm mt-2">データは毎時5分に自動的に保存されます</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                📊 {chartData.length}件のデータポイントを表示中（全{timeSeriesData.length}件、最大60日間保存）
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip
                  formatter={(value: any) => formatNumber(typeof value === 'number' ? value : 0)}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                {getVisibleLines().map((line) => (
                  <Line
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};
