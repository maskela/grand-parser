// Database Types
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  json_schema: Record<string, any> | null;
  message_template: string | null;
  level_of_details: string | null;
  description: string | null;
  created_by: string | null;
  is_public: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  upload_date: string;
  template_id: string | null;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface Result {
  id: string;
  document_id: string;
  extracted_json: Record<string, any> | null;
  generated_message: string | null;
  raw_text: string | null;
  confidence: number | null;
  warnings: Record<string, any> | null;
  created_at: string;
}

// Extended types with relations
export interface DocumentWithTemplate extends Document {
  template: Template | null;
}

export interface DocumentWithResult extends Document {
  result: Result | null;
  template: Template | null;
}

// API Request Types
export interface UploadRequest {
  file: File;
  template_id?: string;
  new_template_description?: string;
  new_template_level_of_details?: string;
  new_template_name?: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  level_of_details: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  document_id: string;
  status: string;
  result?: {
    extracted_json: Record<string, any>;
    generated_message: string;
    raw_text: string;
    confidence: number;
    warnings: Record<string, any>;
  };
}

export interface DocumentsListResponse {
  documents: DocumentWithTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface DocumentDetailResponse {
  document: DocumentWithResult;
}

export interface TemplatesListResponse {
  templates: Template[];
}

export interface StatsResponse {
  total_documents: number;
  documents_by_template: {
    template_id: string | null;
    template_name: string | null;
    count: number;
  }[];
  status_breakdown: {
    status: string;
    count: number;
  }[];
  average_confidence: number | null;
  recent_uploads: DocumentWithTemplate[];
  
  // Processing time metrics
  processing_metrics: {
    average_processing_time: number | null; // in seconds
    fastest_processing_time: number | null;
    slowest_processing_time: number | null;
    total_processing_time: number | null;
    processing_time_trend: {
      date: string;
      avg_time: number;
      document_count: number;
    }[];
  };
  
  // Cost savings calculator
  cost_analysis: {
    total_documents_processed: number;
    estimated_cost_grand_parser: number; // Estimated cost with Grand Parser
    estimated_cost_chatgpt: number; // Estimated cost with ChatGPT-4 Vision
    total_savings: number;
    savings_percentage: number;
    cost_per_document_grand_parser: number;
    cost_per_document_chatgpt: number;
  };
  
  // Usage tracking
  usage_quota: {
    monthly_quota: number;
    documents_processed_this_month: number;
    documents_remaining: number;
    quota_percentage_used: number;
    current_period_start: string;
    current_period_end: string;
    days_remaining: number;
  };
}

// n8n Webhook Types
export interface N8nWebhookPayload {
  document_id: string;
  file_path: string;
  filename: string;
  template_id?: string;
  new_template?: {
    name: string;
    description: string;
    level_of_details: string;
  };
}

export interface N8nWebhookResponse {
  success: boolean;
  document_id: string;
  extracted_json: Record<string, any>;
  generated_message: string;
  raw_text: string;
  confidence?: number;
  warnings?: Record<string, any>;
  template_id?: string;
  error?: string;
}

// Form Types
export interface UploadFormData {
  file: FileList;
  template_mode: 'existing' | 'new';
  template_id?: string;
  new_template_name?: string;
  new_template_description?: string;
  new_template_level_of_details?: string;
}

