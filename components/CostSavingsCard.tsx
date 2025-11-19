'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { StatsResponse } from '@/lib/types';

interface CostSavingsCardProps {
  costAnalysis: StatsResponse['cost_analysis'];
}

export default function CostSavingsCard({ costAnalysis }: CostSavingsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-[var(--success)]">
      <CardHeader>
        <CardTitle className="flex items-center text-[var(--success-dark)] dark:text-[var(--success)]">
          <svg className="mr-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Cost Savings vs ChatGPT-4 Vision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Savings Highlight */}
        <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
          <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
            Total Savings
          </p>
          <p className="text-5xl font-bold text-[var(--success)] mb-2">
            {formatCurrency(costAnalysis.total_savings)}
          </p>
          <p className="text-xl font-semibold text-[var(--text-tertiary)]">
            ({costAnalysis.savings_percentage.toFixed(1)}% cheaper)
          </p>
        </div>

        {/* Cost Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-[var(--primary)]">
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">
              Grand Parser
            </p>
            <p className="text-2xl font-bold text-[var(--primary)]">
              {formatCurrency(costAnalysis.estimated_cost_grand_parser)}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {formatCurrency(costAnalysis.cost_per_document_grand_parser)}/doc
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-slate-300 dark:border-slate-600">
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">
              ChatGPT-4 Vision
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {formatCurrency(costAnalysis.estimated_cost_chatgpt)}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {formatCurrency(costAnalysis.cost_per_document_chatgpt)}/doc
            </p>
          </div>
        </div>

        {/* Documents Processed */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg">
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            Documents Processed
          </span>
          <span className="text-lg font-bold text-[var(--text-primary)]">
            {costAnalysis.total_documents_processed.toLocaleString()}
          </span>
        </div>

        {/* Info Message */}
        <div className="text-xs text-[var(--text-tertiary)] p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-[var(--info)]">
          <p className="font-semibold mb-1">💡 Cost Calculation</p>
          <p>Grand Parser: {formatCurrency(costAnalysis.cost_per_document_grand_parser)} per document</p>
          <p>ChatGPT-4 Vision: {formatCurrency(costAnalysis.cost_per_document_chatgpt)} per document (API + processing)</p>
        </div>
      </CardContent>
    </Card>
  );
}


