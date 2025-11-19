import DocumentDetail from '@/components/DocumentDetail';

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Details</h1>
        <p className="mt-2 text-gray-600">
          View extracted data and processing results
        </p>
      </div>
      <DocumentDetail documentId={id} />
    </div>
  );
}


