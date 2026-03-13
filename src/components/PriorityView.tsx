/**
 * PriorityView - 優先度別分析ビューコンポーネント
 * 
 * 機能:
 * - 優先度別のimp推移を時間別に表示
 * - 各優先度のキャンペーン一覧を表示
 * - 営業チームと技術チームが次の対応に繋げやすくする
 */

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EnrichedCampaign } from '../types';

interface PriorityViewProps {
  campaigns: EnrichedCampaign[];
}

export const PriorityView: React.FC<PriorityViewProps> = ({ campaigns }) => {
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);

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

  // グラフ用データ
  const chartData = prioritySummary.map((item) => ({
    priority: `優先度 ${item.priority}`,
    当日Imp: item.todayImp,
    累積Imp: item.cumulativeImp,
    目標Imp: item.totalImp,
  }));

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ja-JP');
  };

  const selectedPriorityData = selectedPriority !== null
    ? prioritySummary.find((item) => item.priority === selectedPriority)
    : null;

  return (
    <div className="space-y-6">
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
              <div className="flex justify-between">
                <span className="text-gray-600">目標Imp:</span>
                <span className="font-medium text-gray-900">{formatNumber(item.totalImp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* グラフ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">優先度別Imp推移</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="priority" />
            <YAxis tickFormatter={(value: number) => formatNumber(value)} />
            <Tooltip formatter={(value: any) => formatNumber(Number(value))} />
            <Legend />
            <Bar dataKey="当日Imp" fill="#fbbf24" />
            <Bar dataKey="累積Imp" fill="#10b981" />
            <Bar dataKey="目標Imp" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
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
