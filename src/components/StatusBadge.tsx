/**
 * StatusBadge - ステータスバッジコンポーネント
 * 
 * Task 9.1: StatusBadgeコンポーネントを作成
 * Requirements: 5.2
 * 
 * 機能:
 * - ステータスに応じた色とアイコンを表示
 */

import React from 'react';
import type { CampaignStatus } from '../types';

interface StatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const colorClasses = {
    red: 'bg-red-100 text-red-800 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    gray: 'bg-gray-100 text-gray-600 border-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        colorClasses[status.color]
      } ${className}`}
    >
      {status.icon && <span className="mr-1">{status.icon}</span>}
      {status.label}
    </span>
  );
};
