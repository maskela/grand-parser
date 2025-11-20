import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] flex items-center justify-center">
            <svg className="mr-3 h-10 w-10 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Document
          </h1>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            Upload a document and process it with AI-powered extraction
          </p>
        </div>
        <UploadForm />
      </div>
    </div>
  );
}


