'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadFormSchema } from '@/lib/validations';
import { UploadFormData, Template } from '@/lib/types';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

export default function UploadForm() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [templateMode, setTemplateMode] = useState<'existing' | 'new'>('existing');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false); // Test mode without n8n

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      template_mode: 'existing',
    },
  });

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data.templates);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      }
    }
    fetchTemplates();
  }, []);

  const onSubmit = async (data: UploadFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', data.file[0]);

      if (data.template_mode === 'existing' && data.template_id) {
        formData.append('template_id', data.template_id);
      } else if (data.template_mode === 'new') {
        formData.append('new_template_name', data.new_template_name || '');
        formData.append('new_template_description', data.new_template_description || '');
        formData.append('new_template_level_of_details', data.new_template_level_of_details || '');
      }

      const endpoint = testMode ? '/api/upload-test' : '/api/upload';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadSuccess(true);
        setDocumentId(result.data.document_id);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsLoading(false);
    }
  };

  if (uploadSuccess && documentId) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Upload Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Your document has been processed successfully.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push(`/documents/${documentId}`)}>
              View Results
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Upload Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Test Mode Toggle */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-blue-900">
                  🧪 Test Mode (No n8n Required)
                </span>
                <p className="text-xs text-blue-700">
                  Upload files without n8n webhook. Creates mock results for testing.
                </p>
              </div>
            </label>
          </div>

          {/* File Upload */}
          <div>
            <Input
              type="file"
              label="Select File"
              accept=".pdf,.jpg,.jpeg,.png"
              {...register('file')}
              error={errors.file?.message as string}
            />
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: PDF, JPEG, PNG (max 10MB)
            </p>
          </div>

          {/* Template Mode Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Template Mode
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="existing"
                  {...register('template_mode')}
                  onChange={() => setTemplateMode('existing')}
                  className="mr-2"
                />
                Use Existing Template
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="new"
                  {...register('template_mode')}
                  onChange={() => setTemplateMode('new')}
                  className="mr-2"
                />
                Create New Template
              </label>
            </div>
          </div>

          {/* Existing Template Selection */}
          {templateMode === 'existing' && (
            <Select
              label="Select Template"
              {...register('template_id')}
              error={errors.template_id?.message}
            >
              <option value="">Choose a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </Select>
          )}

          {/* New Template Fields */}
          {templateMode === 'new' && (
            <div className="space-y-4">
              <Input
                label="Template Name"
                placeholder="e.g., Invoice Template"
                {...register('new_template_name')}
                error={errors.new_template_name?.message}
              />
              <Textarea
                label="Description"
                placeholder="Describe what this template should extract..."
                rows={3}
                {...register('new_template_description')}
                error={errors.new_template_description?.message}
              />
              <Input
                label="Level of Details"
                placeholder="e.g., Basic, Detailed, Comprehensive"
                {...register('new_template_level_of_details')}
                error={errors.new_template_level_of_details?.message}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" isLoading={isLoading}>
            {isLoading ? 'Processing...' : 'Upload and Process'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

