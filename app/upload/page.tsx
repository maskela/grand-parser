import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
        <p className="mt-2 text-gray-600">
          Upload a document and process it with AI-powered extraction
        </p>
      </div>
      <UploadForm />
    </div>
  );
}


