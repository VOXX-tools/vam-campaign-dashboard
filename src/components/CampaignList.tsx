/**
 * CampaignList - キャンペーン一覧コンポーネント
 * 
 * Task 10.1: CampaignListコンポーネントを実装
 * Requirements: 6.1-6.7
 * 
 * 機能:
 * - テーブル形式でキャンペーン一覧を表示
 * - フィルタリング・ソート機能を統合
 * - キャンペーン行クリックで詳細ビューに遷移
 */

import React, { useMemo, useState } from 'react';
import type { EnrichedCampaign, CampaignStatusType, AdType } from '../types';
import { StatusBadge } from './StatusBadge';
import { Filter } from './Filter';

interface CampaignListProps {
  campaigns: EnrichedCampaign[];
  onCampaignClick: (campaign: EnrichedCampaign) => void;
}

type SortField = 'name' | 'agency' | 'progressRate';
type SortOrder = 'asc' | 'desc';

export const CampaignList: React.FC<CampaignListProps> = ({ campaigns, onCampaignClick }) => {
  const [statusFilter, setStatusFilter] = useState<CampaignStatusType[]>([]);
  const [adTypeFilter, setAdTypeFilter] = useState<AdType[]>([]);
  const [agencyFilter, setAgencyFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // 利用可能な代理店リストを取得（キャンペーン数の多い順）
  const availableAgencies = useMemo(() => {
    const agencyCounts = campaigns.reduce((acc, campaign) => {
      acc[campaign.AGENCY_NAME] = (acc[campaign.AGENCY_NAME] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(agencyCounts)
      .sort((a, b) => b[1] - a[1]) // 件数の多い順
      .map(([agency]) => agency);
  }, [campaigns]);

  // フィルタリングとソートを適用
  const filteredAndSortedCampaigns = useMemo(() => {
    let result = [...campaigns];

    // フィルタリング
    if (statusFilter.length > 0) {
      result = result.filter((c) => statusFilter.includes(c.status.type));
    }
    if (adTypeFilter.length > 0) {
      result = result.filter((c) => adTypeFilter.includes(c.adType.type));
    }
    if (agencyFilter.length > 0) {
      result = result.filter((c) => agencyFilter.includes(c.AGENCY_NAME));
    }

    // ソート
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.CAMPAIGN_NAME.localeCompare(b.CAMPAIGN_NAME);
          break;
        case 'agency':
          comparison = a.AGENCY_NAME.localeCompare(b.AGENCY_NAME);
          break;
        case 'progressRate':
          comparison = a.progressRate - b.progressRate;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [campaigns, statusFilter, adTypeFilter, agencyFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setStatusFilter([]);
    setAdTypeFilter([]);
    setAgencyFilter([]);
  };

  const formatNumber = (num: number): string => {
    // 数値をカンマ区切りで表示
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

  return (
    <div>
      {/* フィルター */}
      <Filter
        statusFilter={statusFilter}
        adTypeFilter={adTypeFilter}
        agencyFilter={agencyFilter}
        availableAgencies={availableAgencies}
        onStatusFilterChange={setStatusFilter}
        onAdTypeFilterChange={setAdTypeFilter}
        onAgencyFilterChange={setAgencyFilter}
        onClearFilters={handleClearFilters}
      />

      {/* 結果サマリー */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredAndSortedCampaigns.length} 件のキャンペーン
        {filteredAndSortedCampaigns.length !== campaigns.length && (
          <span className="ml-2">（全 {campaigns.length} 件中）</span>
        )}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                  style={{ minWidth: '200px', maxWidth: '300px' }}
                >
                  <div className="flex items-center gap-1">
                    キャンペーン名
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('agency')}
                  style={{ minWidth: '120px' }}
                >
                  <div className="flex items-center gap-1">
                    代理店
                    <SortIcon field="agency" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                  広告種別
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                  ステータス
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '80px' }}>
                  優先度
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('progressRate')}
                  style={{ minWidth: '80px' }}
                >
                  <div className="flex items-center gap-1">
                    進捗率
                    <SortIcon field="progressRate" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  当日Imp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  累積Imp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    該当するキャンペーンがありません
                  </td>
                </tr>
              ) : (
                filteredAndSortedCampaigns.map((campaign) => (
                  <tr
                    key={campaign.CAMPAIGN_ID}
                    onClick={() => onCampaignClick(campaign)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4" style={{ maxWidth: '300px' }}>
                      <div className="text-sm font-medium text-gray-900 truncate" title={campaign.CAMPAIGN_NAME}>
                        {campaign.CAMPAIGN_NAME}
                      </div>
                      <div className="text-xs text-gray-500 truncate" title={campaign.ADVERTISER_NAME}>
                        {campaign.ADVERTISER_NAME}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="truncate" title={campaign.AGENCY_NAME}>
                        {campaign.AGENCY_NAME}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {campaign.adType.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {campaign.priority}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.progressRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(campaign.todayImp)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(campaign.cumulativeImp)}
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
