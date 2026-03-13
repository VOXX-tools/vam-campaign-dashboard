/**
 * Filter - フィルタリングコンポーネント
 * 
 * Task 9.2: Filterコンポーネントを作成
 * Requirements: 6.3-6.5
 * 
 * 機能:
 * - ステータス、広告種別、代理店名のフィルタリングUI
 */

import React from 'react';
import type { CampaignStatusType, AdType } from '../types';

interface FilterProps {
  statusFilter: CampaignStatusType[];
  adTypeFilter: AdType[];
  agencyFilter: string[];
  availableAgencies: string[];
  onStatusFilterChange: (status: CampaignStatusType[]) => void;
  onAdTypeFilterChange: (adType: AdType[]) => void;
  onAgencyFilterChange: (agency: string[]) => void;
  onClearFilters: () => void;
}

export const Filter: React.FC<FilterProps> = ({
  statusFilter,
  adTypeFilter,
  agencyFilter,
  availableAgencies,
  onStatusFilterChange,
  onAdTypeFilterChange,
  onAgencyFilterChange,
  onClearFilters,
}) => {
  const statusOptions: { value: CampaignStatusType; label: string }[] = [
    { value: 'CRITICAL_BEHIND_80', label: '🔴ビハインド80%未満' },
    { value: 'CRITICAL_BEHIND_2_5M', label: '🔴ビハインド250万imp以上' },
    { value: 'CRITICAL_LOW_TODAY', label: '🔴当日imp少なめ' },
    { value: 'CRITICAL_CAP_RISK', label: '🔴キャップ未達リスク' },
    { value: 'CRITICAL_ZERO_IMP', label: '🔴0imp異常' },
    { value: 'WARNING_ENDING_SOON', label: '🟡1週間以内終了' },
    { value: 'WARNING_EARLY_COMPLETE', label: '🟡早期終了・超過' },
    { value: 'HEALTHY', label: '🟢順調' },
  ];

  const adTypeOptions: { value: AdType; label: string }[] = [
    { value: 'RESERVED', label: '予約型' },
    { value: 'PROGRAMMATIC', label: '運用型' },
    { value: 'HOUSE', label: '自社広告' },
  ];

  const handleStatusChange = (status: CampaignStatusType) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  const handleAdTypeChange = (adType: AdType) => {
    if (adTypeFilter.includes(adType)) {
      onAdTypeFilterChange(adTypeFilter.filter((a) => a !== adType));
    } else {
      onAdTypeFilterChange([...adTypeFilter, adType]);
    }
  };

  const handleAgencyChange = (agency: string) => {
    if (agencyFilter.includes(agency)) {
      onAgencyFilterChange(agencyFilter.filter((a) => a !== agency));
    } else {
      onAgencyFilterChange([...agencyFilter, agency]);
    }
  };

  const hasActiveFilters = statusFilter.length > 0 || adTypeFilter.length > 0 || agencyFilter.length > 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:gap-6">
          {/* ステータスフィルター */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    statusFilter.includes(option.value)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 広告種別フィルター */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">広告種別</label>
            <div className="flex flex-wrap gap-2">
              {adTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAdTypeChange(option.value)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    adTypeFilter.includes(option.value)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 代理店フィルター */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">代理店</label>
            <div className="max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {availableAgencies.map((agency) => (
                  <button
                    key={agency}
                    onClick={() => handleAgencyChange(agency)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      agencyFilter.includes(agency)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {agency}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* クリアボタン */}
        {hasActiveFilters && (
          <div className="lg:self-end">
            <button
              onClick={onClearFilters}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              フィルタをクリア
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
