/**
 * TimeSeriesView - 時系列分析ビューコンポーネント
 * 
 * Task 11.1: TimeSeriesViewコンポーネントを実装
 * Requirements: 7.1-7.4
 * 
 * 機能:
 * - Rechartsを使用してグラフを描画
 * - タブ切り替え（全体/予約型/運用型/自社広告）
 * - 分析サマリーを表示
 */

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TimeSeriesAnalysis } from '../types';

interface TimeSeriesViewProps {
  analysis: TimeSeriesAnalysis;
}

type ViewMode = 'total' | 'reserved' | 'programmatic' | 'house';

export const TimeSeriesView: React.FC<TimeSeriesViewProps> = ({ analysis }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('total');

  const formatTimestamp = (timestamp: Date): string => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ja-JP');
  };

  // グラフ用のデータを準備
  const chartData = analysis.dataPoints.map((point) => ({
    time: formatTimestamp(point.timestamp),
    全体: point.totalImp,
    予約型: point.reservedImp,
    運用型: point.programmaticImp,
    自社広告: point.houseImp,
  }));

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
      default:
        return [{ dataKey: '全体', color: '#3b82f6' }];
    }
  };

  const tabs: { mode: ViewMode; label: string }[] = [
    { mode: 'total', label: '全体' },
    { mode: 'reserved', label: '予約型' },
    { mode: 'programmatic', label: '運用型' },
    { mode: 'house', label: '自社広告' },
  ];

  return (
    <div className="space-y-6">
      {/* タブ */}
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

      {/* 分析サマリー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">分析サマリー</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">ピーク時間</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{analysis.peakHour}:00</div>
            <div className="text-xs text-blue-600 mt-1">最も配信が多い時間帯</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">低調な時間</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">{analysis.lowHour}:00</div>
            <div className="text-xs text-orange-600 mt-1">最も配信が少ない時間帯</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">平均Imp</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{formatNumber(Math.round(analysis.averageImp))}</div>
            <div className="text-xs text-green-600 mt-1">1時間あたりの平均</div>
          </div>
        </div>
      </div>

      {/* グラフ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">過去24時間のImp推移</h3>
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
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
