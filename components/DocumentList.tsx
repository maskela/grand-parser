'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DocumentWithTemplate } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { Card, CardContent } from './ui/Card';

export default function DocumentList() {
  const [documents, setDocuments] = useState<DocumentWithTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    fetchDocuments();
  }, [page]);

  async function fetchDocuments() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setDocuments(data.data.documents);
        setTotal(data.data.total);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-8 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">No documents found.</p>
          <Link href="/upload">
            <Button className="mt-4">Upload Your First Document</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Documents Table */}
      <Card>
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
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {documents.map((doc) => (
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
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link href={`/documents/${doc.id}`}>
                        <Button size="sm" variant="primary">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-[var(--hover-bg)]">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} documents
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </Button>
                <div className="flex items-center px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-bold">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

