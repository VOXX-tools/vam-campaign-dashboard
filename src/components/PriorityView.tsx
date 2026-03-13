/**
 * PriorityView - 優先度別分析ビューコンポーネント
 * 
 * 機能:
 * - 優先度別のimp推移を時間別に表示
 * - 時間帯別（0-23時）または曜日別の切り替え
 * - 各優先度のキャンペーン一覧を表示
 * - 営業チームと技術チームが次の対応に繋げやすくする
 */

import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FirestoreManager } from '../modules/FirestoreManager';
import type { EnrichedCampaign, TimeSeriesDataPoint } from '../types';

interface PriorityViewProps {
  campaigns: EnrichedCampaign[];
}

type AnalysisType = 'hourly' | 'daily';
type ChartType = 'line' | 'bar';

export const PriorityView: React.FC<PriorityViewProps> = ({ campaigns }) => {
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('hourly');
  const [chartType, setChartType] = useState<ChartType>('line');
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

  // 優先度別の集計
  const prioritySummary = useMemo(() => {
    const summary = campaigns.reduce((acc, campaign) => {
      const priority = campaign.priority;
      if (!acc[priority]) {
        acc[priority] = {
          priority,
          totalCampaigns: 0,
          totalImp: 0,
          todayImp: 0,
          cumulativeImp: 0,
          campaigns: [],
        };
      }
      acc[priority].totalCampaigns++;
      acc[priority].totalImp += campaign.targetImp;
      acc[priority].todayImp += campaign.todayImp;
      acc[priority].cumulativeImp += campaign.cumulativeImp;
      acc[priority].campaigns.push(campaign);
      return acc;
    }, {} as Record<number, {
      priority: number;
      totalCampaigns: number;
      totalImp: number;
      todayImp: number;
      cumulativeImp: number;
      campaigns: EnrichedCampaign[];
    }>);

    return Object.values(summary).sort((a, b) => a.priority - b.priority);
  }, [campaigns]);

  // 優先度ごとの色を定義
  const priorityColors: Record<number, string> = {
    0: '#ef4444', // 赤
    1: '#f59e0b', // オレンジ
    2: '#10b981', // 緑
    3: '#3b82f6', // 青
    4: '#8b5cf6', // 紫
    5: '#ec4899', // ピンク
  };

  // 時間帯別データ（0-23時）- 実際の時系列データから集計
  const hourlyData = useMemo(() => {
    if (timeSeriesData.length === 0) {
      // データがない場合は空配列を返す
      return [];
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    // 時間帯別に集計（0-23時）
    const hourlyMap: Record<number, Record<number, number>> = {};
    
    // 初期化
    for (let hour = 0; hour < 24; hour++) {
      hourlyMap[hour] = {};
      prioritySummary.forEach((item) => {
        hourlyMap[hour][item.priority] = 0;
      });
    }

    // 時系列データから時間帯別に集計
    timeSeriesData
      .filter((point) => {
        const pointDate = new Date(point.timestamp);
        return pointDate >= startDate && pointDate <= endDate;
      })
      .forEach((point) => {
        const hour = new Date(point.timestamp).getHours();
        // 各優先度のimpを推定（全体impから優先度別に按分）
        const totalTodayImp = prioritySummary.reduce((sum, item) => sum + item.todayImp, 0);
        prioritySummary.forEach((item) => {
          const ratio = totalTodayImp > 0 ? item.todayImp / totalTodayImp : 0;
          hourlyMap[hour][item.priority] += point.totalImp * ratio;
        });
      });

    // グラフ用データに変換
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
      const dataPoint: any = {
        time: `${hour}:00`,
      };
      prioritySummary.forEach((item) => {
        dataPoint[`優先度${item.priority}`] = Math.round(hourlyMap[hour][item.priority]);
      });
      data.push(dataPoint);
    }
    return data;
  }, [timeSeriesData, dateRange, prioritySummary]);

  // 曜日別データ - 実際の時系列データから集計
  const dailyData = useMemo(() => {
    if (timeSeriesData.length === 0) {
      return [];
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    
    // 曜日別に集計（0=日曜, 6=土曜）
    const dailyMap: Record<number, Record<number, number>> = {};
    
    // 初期化
    for (let day = 0; day < 7; day++) {
      dailyMap[day] = {};
      prioritySummary.forEach((item) => {
        dailyMap[day][item.priority] = 0;
      });
    }

    // 時系列データから曜日別に集計
    timeSeriesData
      .filter((point) => {
        const pointDate = new Date(point.timestamp);
        return pointDate >= startDate && pointDate <= endDate;
      })
      .forEach((point) => {
        const day = new Date(point.timestamp).getDay();
        // 各優先度のimpを推定（全体impから優先度別に按分）
        const totalTodayImp = prioritySummary.reduce((sum, item) => sum + item.todayImp, 0);
        prioritySummary.forEach((item) => {
          const ratio = totalTodayImp > 0 ? item.todayImp / totalTodayImp : 0;
          dailyMap[day][item.priority] += point.totalImp * ratio;
        });
      });

    // グラフ用データに変換
    const data = [];
    for (let day = 0; day < 7; day++) {
      const dataPoint: any = {
        time: weekdays[day],
      };
      prioritySummary.forEach((item) => {
        dataPoint[`優先度${item.priority}`] = Math.round(dailyMap[day][item.priority]);
      });
      data.push(dataPoint);
    }
    return data;
  }, [timeSeriesData, dateRange, prioritySummary]);

  const chartData = analysisType === 'hourly' ? hourlyData : dailyData;

  const selectedPriorityData = selectedPriority !== null
    ? prioritySummary.find((item) => item.priority === selectedPriority)
    : null;

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
          </div>
        </div>
      </div>

      {/* 分析タイプとグラフタイプの切り替え */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAnalysisType('hourly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                analysisType === 'hourly'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 時間帯別（0-23時）
            </button>
            <button
              onClick={() => setAnalysisType('daily')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                analysisType === 'daily'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 曜日別
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 折れ線グラフ
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 棒グラフ
            </button>
          </div>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {prioritySummary.map((item) => (
          <div
            key={item.priority}
            onClick={() => setSelectedPriority(item.priority === selectedPriority ? null : item.priority)}
            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
              selectedPriority === item.priority ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">優先度 {item.priority}</h3>
              <span className="text-sm text-gray-600">{item.totalCampaigns} 件</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">当日Imp:</span>
                <span className="font-medium text-gray-900">{formatNumber(item.todayImp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">累積Imp:</span>
                <span className="font-medium text-gray-900">{formatNumber(item.cumulativeImp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* グラフ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          優先度別 {analysisType === 'hourly' ? '時間帯別' : '曜日別'} Imp推移（{dateRange.start} 〜 {dateRange.end}）
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
        ) : timeSeriesData.length === 0 ? (
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
        ) : chartData.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-gray-500">
            選択した期間にデータがありません
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                📊 実際の時系列データから集計（全{timeSeriesData.length}件、最大60日間保存）
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatNumber(value)} />
                <Tooltip formatter={(value: any) => formatNumber(typeof value === 'number' ? value : 0)} />
                <Legend />
                {prioritySummary.map((item) => (
                  <Line
                    key={item.priority}
                    type="monotone"
                    dataKey={`優先度${item.priority}`}
                    stroke={priorityColors[item.priority] || '#6b7280'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatNumber(value)} />
                <Tooltip formatter={(value: any) => formatNumber(typeof value === 'number' ? value : 0)} />
                <Legend />
                {prioritySummary.map((item) => (
                  <Bar
                    key={item.priority}
                    dataKey={`優先度${item.priority}`}
                    fill={priorityColors[item.priority] || '#6b7280'}
                    stackId="a"
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
          </>
        )}
      </div>

      {/* 選択された優先度のキャンペーン一覧 */}
      {selectedPriorityData && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              優先度 {selectedPriorityData.priority} のキャンペーン一覧
            </h3>
            <button
              onClick={() => setSelectedPriority(null)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              閉じる
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    キャンペーン名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    代理店
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    広告種別
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    進捗率
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    当日Imp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    累積Imp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedPriorityData.campaigns.map((campaign) => (
                  <tr key={campaign.CAMPAIGN_ID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{campaign.CAMPAIGN_NAME}</div>
                      <div className="text-xs text-gray-500">{campaign.ADVERTISER_NAME}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{campaign.AGENCY_NAME}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {campaign.adType.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {campaign.progressRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatNumber(campaign.todayImp)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatNumber(campaign.cumulativeImp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
