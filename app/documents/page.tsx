import DocumentList from '@/components/DocumentList';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--text-primary)] flex items-center">
              <svg className="mr-3 h-10 w-10 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              My Documents
            </h1>
            <p className="mt-3 text-lg text-[var(--text-secondary)]">
              View and manage all your uploaded documents
            </p>
          </div>
          <Link href="/upload">
            <Button size="lg">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload New
            </Button>
          </Link>
        </div>
        <DocumentList />
      </div>
    </div>
  );
}

