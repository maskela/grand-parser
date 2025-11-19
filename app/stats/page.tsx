import StatsChart from '@/components/StatsChart';

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] flex items-center">
            <svg className="mr-3 h-10 w-10 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistics Dashboard
          </h1>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            Comprehensive analytics and insights about your document processing
          </p>
        </div>
        <StatsChart />
      </div>
    </div>
  );
}

