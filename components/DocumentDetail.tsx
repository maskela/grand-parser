'use client';

import { useState, useEffect } from 'react';
import { DocumentWithResult } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface DocumentDetailProps {
  documentId: string;
}

export default function DocumentDetail({ documentId }: DocumentDetailProps) {
  const [document, setDocument] = useState<DocumentWithResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  async function fetchDocument() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      const data = await response.json();

      if (data.success) {
        setDocument(data.data.document);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const downloadFile = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/file`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document?.filename || 'document';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardContent className="py-8 text-center">
          <p className="text-red-600">{error || 'Document not found'}</p>
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
    <div className="space-y-6">
      {/* Document Metadata */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Document Information</CardTitle>
            <Button onClick={downloadFile} size="sm">
              Download File
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Filename</p>
              <p className="mt-1 text-sm text-gray-900">{document.filename}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="mt-1">{getStatusBadge(document.status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Upload Date</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(document.upload_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Template</p>
              <p className="mt-1 text-sm text-gray-900">
                {document.template?.name || 'No Template'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {document.result && (
        <>
          {/* Extracted JSON */}
          <Card>
            <CardHeader>
              <CardTitle>Extracted Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm">
                {JSON.stringify(document.result.extracted_json, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Generated Message */}
          {document.result.generated_message && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">
                  {document.result.generated_message}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Confidence & Warnings */}
          {(document.result.confidence || document.result.warnings) && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.result.confidence && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Confidence Score</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {(document.result.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
                {document.result.warnings && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Warnings</p>
                    <pre className="mt-1 overflow-x-auto rounded-lg bg-yellow-50 p-4 text-sm">
                      {JSON.stringify(document.result.warnings, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Raw Text */}
          {document.result.raw_text && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Raw Text</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRawText(!showRawText)}
                  >
                    {showRawText ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>
              {showRawText && (
                <CardContent>
                  <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm">
                    {document.result.raw_text}
                  </pre>
                </CardContent>
              )}
            </Card>
          )}
        </>
      )}

      {/* No Results Yet */}
      {!document.result && document.status === 'processing' && (
        <Card>
          <CardContent className="py-8 text-center">
            <Spinner className="mx-auto mb-4" />
            <p className="text-gray-600">Document is still processing...</p>
          </CardContent>
        </Card>
      )}

      {!document.result && document.status === 'failed' && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-600">Processing failed. Please try uploading again.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


