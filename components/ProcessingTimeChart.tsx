'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatsResponse } from '@/lib/types';

interface ProcessingTimeChartProps {
  processingMetrics: StatsResponse['processing_metrics'];
}

export default function ProcessingTimeChart({ processingMetrics }: ProcessingTimeChartProps) {
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toFixed(0)}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[var(--text-secondary)]">
              Average Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[var(--primary)]">
              {formatTime(processingMetrics.average_processing_time)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[var(--text-secondary)]">
              Fastest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[var(--success)]">
              {formatTime(processingMetrics.fastest_processing_time)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[var(--text-secondary)]">
              Slowest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[var(--warning)]">
              {formatTime(processingMetrics.slowest_processing_time)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[var(--text-secondary)]">
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {formatTime(processingMetrics.total_processing_time)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Processing Time Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg className="mr-2 h-6 w-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Processing Time Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processingMetrics.processing_time_trend.some(d => d.document_count > 0) ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={processingMetrics.processing_time_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="var(--text-tertiary)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
                  stroke="var(--text-tertiary)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                  }}
                  labelFormatter={formatDate}
                  formatter={(value: any, name: string) => {
                    if (name === 'avg_time') return [formatTime(value), 'Avg Processing Time'];
                    if (name === 'document_count') return [value, 'Documents'];
                    return [value, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_time"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--primary)', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Avg Processing Time"
                />
                <Line
                  type="monotone"
                  dataKey="document_count"
                  stroke="var(--success)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--success)', r: 4 }}
                  name="Document Count"
                  yAxisId={1}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-[var(--text-tertiary)]">No processing data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-[var(--primary)]">⚡ Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🚀</span>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Lightning Fast Processing</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Your documents are processed {processingMetrics.average_processing_time 
                  ? `in an average of ${formatTime(processingMetrics.average_processing_time)}`
                  : 'efficiently'
                }, ensuring rapid data extraction.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Consistent Performance</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Our AI maintains stable processing times across all document types, 
                providing reliable and predictable results.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💪</span>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Enterprise-Grade Scale</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Handle thousands of documents without degradation in processing speed or accuracy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





