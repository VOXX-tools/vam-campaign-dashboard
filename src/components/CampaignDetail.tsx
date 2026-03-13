/**
 * CampaignDetail - キャンペーン詳細ビューコンポーネント
 * 
 * Task 13.1: CampaignDetailコンポーネントを実装
 * Requirements: 13.1-13.9
 * 
 * 機能:
 * - 基本情報、配信期間情報、imp関連情報を表示
 * - ペーシング分析グラフを表示
 * - ビハインド/順調状態を視覚的に表示
 * - 一覧ビューに戻るナビゲーション
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { EnrichedCampaign } from '../types';
import { StatusBadge } from './StatusBadge';

interface CampaignDetailProps {
  campaign: EnrichedCampaign;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaign }) => {
  const navigate = useNavigate();
  const formatNumber = (num: number): string => {
    // 数値をカンマ区切りで表示
    return num.toLocaleString('ja-JP');
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // ペーシング分析データ
  const pacingData = [
    {
      name: '時間進捗率',
      value: campaign.timeProgressRate,
      fill: '#3b82f6',
    },
    {
      name: '進捗率',
      value: campaign.progressRate,
      fill: campaign.progressRate >= campaign.timeProgressRate ? '#10b981' : '#ef4444',
    },
  ];

  const isBehind = campaign.timeProgressRate > campaign.progressRate;
  const pacingStatus = isBehind ? 'ビハインド' : '順調';
  const pacingStatusColor = isBehind ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          一覧に戻る
        </button>
        
        {/* キャンペーンURL - 最上部に移動 */}
        {campaign.CAMPAIGN_URL && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">キャンペーンURL</div>
            <a
              href={campaign.CAMPAIGN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
            >
              {campaign.CAMPAIGN_URL}
            </a>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{campaign.CAMPAIGN_NAME}</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>キャンペーンID: {campaign.CAMPAIGN_ID}</p>
              <p>広告主: {campaign.ADVERTISER_NAME}</p>
              <p>代理店: {campaign.AGENCY_NAME}</p>
              <p>優先度: {campaign.priority}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <StatusBadge status={campaign.status} />
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {campaign.adType.label}
            </span>
          </div>
        </div>
      </div>

      {/* ペーシング分析 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ペーシング分析</h3>
        <div className={`mb-4 p-4 rounded-lg ${pacingStatusColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">配信状態</div>
              <div className="text-2xl font-bold mt-1">{pacingStatus}</div>
            </div>
            <div className="text-right">
              <div className="text-sm">差分</div>
              <div className="text-xl font-bold">
                {Math.abs(campaign.progressRate - campaign.timeProgressRate).toFixed(1)}%
              </div>
            </div>
          </div>
          {isBehind && (
            <p className="text-sm mt-2">
              時間進捗率に対して配信が遅れています。配信ペースの調整が必要です。
            </p>
          )}
          {!isBehind && campaign.progressRate > campaign.timeProgressRate && (
            <p className="text-sm mt-2">
              時間進捗率を上回る配信ペースです。順調に配信されています。
            </p>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pacingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} />
            <Tooltip 
              formatter={(value: any) => {
                if (typeof value === 'number') return `${value.toFixed(1)}%`;
                return value || '';
              }} 
            />
            <Legend />
            <Bar dataKey="value" name="進捗率 (%)" radius={[8, 8, 0, 0]}>
              {pacingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 配信期間情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">配信期間情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">開始日時</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{formatDate(campaign.START_TIME)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">終了日時</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{formatDate(campaign.END_TIME)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">配信日数</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{campaign.deliveryDays} 日</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">残り日数</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {campaign.remainingDays > 0 ? `${campaign.remainingDays} 日` : '終了'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">全体時間</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{campaign.totalHours} 時間</div>
            <div className="text-xs text-gray-500 mt-1">配信開始から終了までの総時間</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">経過時間</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{campaign.elapsedHours} 時間</div>
            <div className="text-xs text-gray-500 mt-1">配信開始から現在までの経過時間</div>
          </div>
        </div>
      </div>

      {/* Imp関連情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Imp関連情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">目標Imp</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{formatNumber(campaign.targetImp)}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">累積実績Imp</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{formatNumber(campaign.cumulativeImp)}</div>
            <div className="text-xs text-green-600 mt-1">進捗率: {campaign.progressRate.toFixed(1)}%</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">残り必要Imp</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">{formatNumber(campaign.remainingImp)}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">日割りImp</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">{formatNumber(campaign.dailyImp)}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">当日Imp</div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">{formatNumber(campaign.todayImp)}</div>
            <div className="text-xs text-yellow-600 mt-1">
              日割り比: {campaign.dailyImp > 0 ? ((campaign.todayImp / campaign.dailyImp) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">配信キャップ</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{formatNumber(campaign.deliveryCap)}</div>
          </div>
        </div>
      </div>

      {/* ステータス判定理由 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ステータス判定理由</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <StatusBadge status={campaign.status} className="mb-3" />
          <div className="text-sm text-gray-700 space-y-2">
            {campaign.status.type === 'CRITICAL_BEHIND_80' && (
              <p>経過時間が24時間以上で、進捗率が80%以下のため、要対応と判定されました。</p>
            )}
            {campaign.status.type === 'CRITICAL_BEHIND_2_5M' && (
              <p>目標Impが250万以上で、経過時間が24時間以上、進捗率が100%未満のため、要対応と判定されました。</p>
            )}
            {campaign.status.type === 'CRITICAL_LOW_TODAY' && (
              <p>当日Impが日割りImpの10%未満のため、要対応と判定されました。</p>
            )}
            {campaign.status.type === 'CRITICAL_CAP_RISK' && (
              <p>配信キャップ×残り日数が残り必要impを下回るため、キャップ未達リスクがあります。</p>
            )}
            {campaign.status.type === 'CRITICAL_ZERO_IMP' && (
              <p>目標Impが設定されているにも関わらず、当日Impが0のため、異常と判定されました。</p>
            )}
            {campaign.status.type === 'WARNING_ENDING_SOON' && (
              <p>終了日時が7日以内で、進捗率が100%未満のため、注意が必要です。</p>
            )}
            {campaign.status.type === 'WARNING_EARLY_COMPLETE' && (
              <p>累積実績Impが目標Imp以上に達しているため、早期終了または超過の可能性があります。</p>
            )}
            {campaign.status.type === 'HEALTHY' && (
              <p>特に問題は検出されていません。順調に配信されています。</p>
            )}
          </div>
        </div>
      </div>

      {/* キャンペーンURL - 削除（最上部に移動済み） */}
    </div>
  );
};
