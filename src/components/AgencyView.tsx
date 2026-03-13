/**
 * AgencyView - 代理店別分析ビューコンポーネント
 * 
 * Task 12.1: AgencyViewコンポーネントを実装
 * Requirements: 8.1-8.7
 * 
 * 機能:
 * - テーブル形式で代理店別サマリーを表示
 * - 要対応キャンペーン数でソート
 */

import React, { useState, useMemo } from 'react';
import type { AgencySummary } from '../types';

interface AgencyViewProps {
  summaries: AgencySummary[];
}

type SortField = 'agencyName' | 'totalCampaigns' | 'criticalCount' | 'warningCount' | 'averageProgressRate' | 'totalImp';
type SortOrder = 'asc' | 'desc';

export const AgencyView: React.FC<AgencyViewProps> = ({ summaries }) => {
  const [sortField, setSortField] = useState<SortField>('criticalCount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedSummaries = useMemo(() => {
    const result = [...summaries];
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'agencyName':
          comparison = a.agencyName.localeCompare(b.agencyName);
          break;
        case 'totalCampaigns':
          comparison = a.totalCampaigns - b.totalCampaigns;
          break;
        case 'criticalCount':
          comparison = a.criticalCount - b.criticalCount;
          break;
        case 'warningCount':
          comparison = a.warningCount - b.warningCount;
          break;
        case 'averageProgressRate':
          comparison = a.averageProgressRate - b.averageProgressRate;
          break;
        case 'totalImp':
          comparison = a.totalImp - b.totalImp;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [summaries, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'criticalCount' ? 'desc' : 'asc');
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ja-JP');
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // サマリー統計
  const totalStats = useMemo(() => {
    return {
      totalCampaigns: summaries.reduce((sum, s) => sum + s.totalCampaigns, 0),
      criticalCount: summaries.reduce((sum, s) => sum + s.criticalCount, 0),
      warningCount: summaries.reduce((sum, s) => sum + s.warningCount, 0),
      healthyCount: summaries.reduce((sum, s) => sum + s.healthyCount, 0),
      totalImp: summaries.reduce((sum, s) => sum + s.totalImp, 0),
    };
  }, [summaries]);

  return (
    <div className="space-y-6">
      {/* 全体サマリー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">全体サマリー</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">総キャンペーン数</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totalStats.totalCampaigns}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">要対応</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{totalStats.criticalCount}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">注意</div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">{totalStats.warningCount}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">順調</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{totalStats.healthyCount}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">総Imp</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{formatNumber(totalStats.totalImp)}</div>
          </div>
        </div>
      </div>

      {/* 代理店別テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">代理店別分析</h3>
          <p className="text-sm text-gray-600 mt-1">{summaries.length} 代理店</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('agencyName')}
                >
                  <div className="flex items-center gap-1">
                    代理店名
                    <SortIcon field="agencyName" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalCampaigns')}
                >
                  <div className="flex items-center gap-1">
                    稼働数
                    <SortIcon field="totalCampaigns" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('criticalCount')}
                >
                  <div className="flex items-center gap-1">
                    要対応
                    <SortIcon field="criticalCount" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('warningCount')}
                >
                  <div className="flex items-center gap-1">
                    注意
                    <SortIcon field="warningCount" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('averageProgressRate')}
                >
                  <div className="flex items-center gap-1">
                    平均進捗率
                    <SortIcon field="averageProgressRate" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalImp')}
                >
                  <div className="flex items-center gap-1">
                    総Imp
                    <SortIcon field="totalImp" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    データがありません
                  </td>
                </tr>
              ) : (
                sortedSummaries.map((summary) => (
                  <tr key={summary.agencyName} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {summary.agencyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {summary.totalCampaigns}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {summary.criticalCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {summary.criticalCount}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {summary.warningCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {summary.warningCount}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {summary.averageProgressRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(summary.totalImp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
