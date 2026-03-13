/**
 * ErrorBanner - エラーバナーコンポーネント
 * 
 * Task 9.3: ErrorBannerコンポーネントを作成
 * Requirements: 11.1-11.4
 * 
 * 機能:
 * - エラーメッセージと再試行ボタンを表示
 */

import React from 'react';

interface ErrorBannerProps {
  error: string;
  onRetry: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onRetry, onDismiss }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={onRetry}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              再試行
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                閉じる
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
