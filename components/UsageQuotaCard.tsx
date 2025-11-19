'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { StatsResponse } from '@/lib/types';

interface UsageQuotaCardProps {
  usageQuota: StatsResponse['usage_quota'];
}

export default function UsageQuotaCard({ usageQuota }: UsageQuotaCardProps) {
  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return 'var(--danger)';
    if (percentage >= 75) return 'var(--warning)';
    return 'var(--success)';
  };

  const getQuotaStatus = (percentage: number) => {
    if (percentage >= 90) return { text: 'Critical', color: 'danger' };
    if (percentage >= 75) return { text: 'High Usage', color: 'warning' };
    if (percentage >= 50) return { text: 'Moderate', color: 'info' };
    return { text: 'Healthy', color: 'success' };
  };

  const status = getQuotaStatus(usageQuota.quota_percentage_used);
  const quotaColor = getQuotaColor(usageQuota.quota_percentage_used);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="mr-2 h-6 w-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Monthly Usage Quota
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Ring/Bar */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--border-default)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={quotaColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - usageQuota.quota_percentage_used / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-[var(--text-primary)]">
                {usageQuota.quota_percentage_used.toFixed(0)}%
              </span>
              <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mt-1">
                Used
              </span>
            </div>
          </div>
          <div className={`mt-4 px-4 py-2 rounded-full bg-[var(--${status.color}-light)] border border-[var(--${status.color})]`}>
            <span className={`text-sm font-bold text-[var(--${status.color}-dark)] dark:text-[var(--${status.color})]`}>
              {status.text}
            </span>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--hover-bg)] rounded-lg border border-[var(--border-default)]">
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
              Processed
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {usageQuota.documents_processed_this_month.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-[var(--hover-bg)] rounded-lg border border-[var(--border-default)]">
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
              Remaining
            </p>
            <p className="text-2xl font-bold text-[var(--primary)]">
              {usageQuota.documents_remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Period Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-[var(--hover-bg)] rounded-lg">
            <span className="text-sm font-semibold text-[var(--text-secondary)]">
              Monthly Quota
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {usageQuota.monthly_quota.toLocaleString()} documents
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-[var(--hover-bg)] rounded-lg">
            <span className="text-sm font-semibold text-[var(--text-secondary)]">
              Period Ends In
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {usageQuota.days_remaining} days
            </span>
          </div>
        </div>

        {/* Action Message */}
        {usageQuota.quota_percentage_used >= 90 && (
          <div className="p-3 bg-[var(--danger-light)] border border-[var(--danger)] rounded-lg">
            <p className="text-sm font-semibold text-[var(--danger-dark)] dark:text-[var(--danger)]">
              ⚠️ You're approaching your monthly limit. Consider upgrading your plan.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


