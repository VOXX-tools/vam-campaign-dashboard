/**
 * TimeSeriesView - 時系列分析ビューコンポーネント
 * 
 * Task 11.1: TimeSeriesViewコンポーネントを実装
 * Requirements: 7.1-7.4
 * 
 * 機能:
 * - Rechartsを使用してグラフを描画
 * - タブ切り替え（全体/予約型/運用型/自社広告）
 * - 時間帯別・曜日別の分析
 * - 分析サマリーを表示
 */

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EnrichedCampaign } from '../types';

interface TimeSeriesViewProps {
  campaigns: EnrichedCampaign[];
}

type ViewMode = 'total' | 'reserved' | 'programmatic' | 'house' | 'comparison';
type AnalysisType = 'hourly' | 'daily';

export const TimeSeriesView: React.FC<TimeSeriesViewProps> = ({ campaigns }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('hourly');

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

  // 時間帯別データ（0-23時）のシミュレーション
  // 実際のデータがないため、現在のimpデータを時間帯に分散
  const hourlyData = useMemo(() => {
    const data = [];
    
    for (let hour = 0; hour < 24; hour++) {
      // 時間帯による配信傾向をシミュレート
      // 深夜（0-6時）: 低め、日中（9-17時）: 高め、夜（18-23時）: 中程度
      let factor = 1.0;
      if (hour >= 0 && hour < 6) factor = 0.3;
      else if (hour >= 9 && hour < 17) factor = 1.5;
      else if (hour >= 18 && hour < 24) factor = 1.2;
      else factor = 0.8;

      const reserved = (impByAdType['RESERVED']?.todayImp || 0) * factor / 24;
      const programmatic = (impByAdType['PROGRAMMATIC']?.todayImp || 0) * factor / 24;
      const house = (impByAdType['HOUSE']?.todayImp || 0) * factor / 24;

      data.push({
        time: `${hour}:00`,
        予約型: Math.round(reserved),
        運用型: Math.round(programmatic),
        自社広告: Math.round(house),
        全体: Math.round(reserved + programmatic + house),
      });
    }
    return data;
  }, [impByAdType]);

  // 曜日別データのシミュレーション
  const dailyData = useMemo(() => {
    const weekdays = ['月', '火', '水', '木', '金', '土', '日'];
    const data = [];
    
    for (let day = 0; day < 7; day++) {
      // 曜日による配信傾向をシミュレート
      // 平日（月-金）: 高め、土日: 低め
      const factor = day < 5 ? 1.2 : 0.7;

      const reserved = (impByAdType['RESERVED']?.todayImp || 0) * factor;
      const programmatic = (impByAdType['PROGRAMMATIC']?.todayImp || 0) * factor;
      const house = (impByAdType['HOUSE']?.todayImp || 0) * factor;

      data.push({
        time: weekdays[day],
        予約型: Math.round(reserved),
        運用型: Math.round(programmatic),
        自社広告: Math.round(house),
        全体: Math.round(reserved + programmatic + house),
      });
    }
    return data;
  }, [impByAdType]);

  // 表示するデータを決定
  const chartData = analysisType === 'hourly' ? hourlyData : dailyData;

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
      {/* 分析タイプ切り替え */}
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
          {analysisType === 'hourly' ? '時間帯別Imp推移' : '曜日別Imp推移'}
        </h3>
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ℹ️ このグラフは当日impデータを基に推定した傾向を表示しています。
            実際の時系列データを蓄積することで、より正確な分析が可能になります。
          </p>
        </div>
        {chartData.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-gray-500">
            データがありません
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
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
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
