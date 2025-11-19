'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatsResponse } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Spinner from './ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Badge from './ui/Badge';
import CostSavingsCard from './CostSavingsCard';
import UsageQuotaCard from './UsageQuotaCard';
import ProcessingTimeChart from './ProcessingTimeChart';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function StatsChart() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" />
        <p className="mt-4 text-[var(--text-secondary)]">Loading statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardContent className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-[var(--danger)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[var(--danger)] font-semibold">{error || 'Failed to load statistics'}</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="info">Processing</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[var(--text-primary)]">{stats.total_documents}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">All time processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Average Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[var(--success)]">
              {stats.average_confidence
                ? `${(stats.average_confidence * 100).toFixed(1)}%`
                : 'N/A'}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">AI extraction accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Unique Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[var(--primary)]">
              {stats.documents_by_template.length}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">Custom templates created</p>
          </CardContent>
        </Card>
      </div>

      {/* New Statistics Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostSavingsCard costAnalysis={stats.cost_analysis} />
        <UsageQuotaCard usageQuota={stats.usage_quota} />
      </div>

      {/* Processing Time Metrics */}
      <ProcessingTimeChart processingMetrics={stats.processing_metrics} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Documents by Template */}
        {stats.documents_by_template.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="mr-2 h-6 w-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Documents by Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stats.documents_by_template}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                  <XAxis
                    dataKey="template_name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    stroke="var(--text-tertiary)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 600 }} />
                  <Bar dataKey="count" fill="var(--primary)" name="Documents" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Status Breakdown */}
        {stats.status_breakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="mr-2 h-6 w-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={stats.status_breakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                    labelStyle={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {stats.status_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Uploads */}
      {stats.recent_uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="mr-2 h-6 w-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Uploads
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-[var(--border-default)] bg-[var(--hover-bg)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Filename
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Template
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Upload Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {stats.recent_uploads.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[var(--hover-bg)] transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">
                        {doc.filename}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {doc.template?.name || 'No Template'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-tertiary)]">
                        {formatDate(doc.upload_date)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {getStatusBadge(doc.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

