# Grand Parser - Cloud Architecture Documentation

## Overview

Grand Parser is a **document processing orchestration platform** that coordinates multiple cloud services to provide AI-powered document extraction. **The application itself does not perform document parsing or extraction** - instead, it orchestrates the workflow and delegates processing to an n8n automation workflow.

## Architecture Philosophy

This application follows a **separation of concerns** design:

- **Next.js App**: Handles user interface, authentication, file management, and data persistence
- **n8n Workflow**: Performs all document processing, OCR, AI extraction, and data transformation
- **Supabase**: Provides database, file storage, and real-time capabilities
- **Clerk**: Manages authentication and user identity

## Cloud Services Stack

### 1. Frontend & API Layer (Next.js on Vercel/Self-hosted)

**Technology**: Next.js 14+ with App Router

**Responsibilities**:
- User interface and interaction
- API endpoints for CRUD operations
- Authentication middleware
- File upload handling
- Webhook coordination
- Results visualization

**Does NOT handle**:
- Document parsing
- OCR processing
- AI-powered extraction
- Template-based data extraction

**Deployment Options**:
- Vercel (Recommended - zero configuration)
- Railway
- Render
- Self-hosted (Docker/VM)
- AWS Amplify
- Netlify

**Port Configuration**: Runs on port 7777 (configurable via `PORT` env var)

---

### 2. Processing Engine (n8n Workflow)

**Technology**: n8n (self-hosted or n8n.cloud)

**⚠️ CRITICAL ROLE**: This is where ALL document processing happens.

#### n8n Workflow Responsibilities:

1. **Receive Processing Request**
   - Webhook receives document metadata from Next.js app
   - Gets document ID, file path, template configuration

2. **File Retrieval**
   - Downloads document from Supabase Storage using file_path
   - Authenticates with Supabase service role key

3. **Document Processing** (The Core Processing)
   - **OCR**: Extracts text from PDF/images
   - **AI Analysis**: Uses LLM (OpenAI, Anthropic, local models) to understand content
   - **Structured Extraction**: Applies template rules to extract specific data points
   - **Validation**: Validates extracted data against schema
   - **Message Generation**: Creates natural language summary based on template
   - **Confidence Scoring**: Calculates extraction confidence level

4. **Template Management**
   - If `new_template` is provided: Creates new template in `templates` table
   - If `template_id` is provided: Uses existing template for extraction

5. **Results Storage**
   - Saves extraction results to `results` table
   - Updates document status in `documents` table ('completed' or 'failed')
   - Stores warnings and metadata

6. **Response to App**
   - Returns structured JSON response
   - Includes extracted data, generated message, confidence scores

#### n8n Workflow Input Schema:

```json
{
  "document_id": "uuid",
  "file_path": "user-id/timestamp-filename.pdf",
  "filename": "original-document.pdf",
  "template_id": "uuid (optional)",
  "new_template": {
    "name": "Invoice Extractor",
    "description": "Extract invoice details: invoice number, date, total, vendor",
    "level_of_details": "Basic | Detailed"
  }
}
```

#### n8n Workflow Output Schema:

```json
{
  "success": true,
  "document_id": "uuid",
  "extracted_json": {
    "invoice_number": "INV-2024-001",
    "date": "2024-03-15",
    "total": 1234.56,
    "vendor": "Acme Corp"
  },
  "generated_message": "This is an invoice from Acme Corp dated March 15, 2024, for $1,234.56.",
  "raw_text": "Full extracted text from document...",
  "confidence": 0.95,
  "warnings": {
    "low_quality": false,
    "missing_fields": []
  },
  "template_id": "uuid"
}
```

#### n8n Deployment Options:

- **n8n.cloud**: Managed service (easiest, recommended for production)
- **Self-hosted**: Docker, Kubernetes, or VM
- **n8n Desktop**: For development and testing

#### n8n Workflow Components (Typical):

1. **Webhook Trigger** - Receives requests from Next.js
2. **Supabase Storage Node** - Downloads document file
3. **HTTP Request Node** - Calls OCR API (e.g., OCR.space, Tesseract API)
4. **OpenAI/Anthropic Node** - AI-powered extraction
5. **Code Node** - Data transformation and validation
6. **Supabase Node** - Save results to database
7. **Response Node** - Return results to Next.js

**Environment Variables Required by n8n**:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
# or
ANTHROPIC_API_KEY=your_anthropic_key
```

---

### 3. Database & Storage (Supabase)

**Technology**: PostgreSQL + Object Storage

#### Database Schema:

##### `users` Table
Stores user accounts synced from Clerk.

```sql
id              UUID PRIMARY KEY
clerk_id        TEXT UNIQUE NOT NULL
email           TEXT NOT NULL
created_at      TIMESTAMP WITH TIME ZONE
```

##### `templates` Table
Stores extraction templates created by users or n8n.

```sql
id                  UUID PRIMARY KEY
name                TEXT NOT NULL
json_schema         JSONB (defines expected data structure)
message_template    TEXT (template for message generation)
level_of_details    TEXT (Basic/Detailed/Expert)
description         TEXT
created_by          UUID REFERENCES users(id)
created_at          TIMESTAMP WITH TIME ZONE
```

##### `documents` Table
Tracks all uploaded documents and their processing status.

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
filename        TEXT NOT NULL
file_path       TEXT NOT NULL (path in Supabase Storage)
upload_date     TIMESTAMP WITH TIME ZONE
template_id     UUID REFERENCES templates(id)
status          TEXT ('processing' | 'completed' | 'failed')
created_at      TIMESTAMP WITH TIME ZONE
```

##### `results` Table
Stores extraction results produced by n8n workflow.

```sql
id                  UUID PRIMARY KEY
document_id         UUID UNIQUE REFERENCES documents(id)
extracted_json      JSONB (structured data extracted)
generated_message   TEXT (AI-generated summary)
raw_text            TEXT (full OCR text)
confidence          DECIMAL(5,4) (0.0000 to 1.0000)
warnings            JSONB (validation issues, quality warnings)
created_at          TIMESTAMP WITH TIME ZONE
```

#### Row Level Security (RLS):

All tables have RLS enabled for multi-tenant security:

- **users**: Users can only view/update their own data
- **templates**: All authenticated users can view; creators can update their own
- **documents**: Users can only access their own documents
- **results**: Users can only view results for their documents
- **Service role bypass**: n8n uses service role key to write results (bypasses RLS)

#### Supabase Storage:

**Bucket**: `documents` (Private)

**Structure**:
```
documents/
  ├── {user_id}/
  │   ├── {timestamp}-{random}.pdf
  │   ├── {timestamp}-{random}.jpg
  │   └── {timestamp}-{random}.png
```

**Access Control**:
- Users can upload to their own folder
- Users can download their own files
- n8n (service role) can read all files for processing
- Files are private (not publicly accessible)

**Storage Policies**:
```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own documents
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Service role can access everything (for n8n)
CREATE POLICY "Service role has full access"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'documents');
```

---

### 4. Authentication (Clerk)

**Technology**: Clerk.dev

**Responsibilities**:
- User registration and login
- Session management
- OAuth providers (Google, GitHub, etc.)
- User profile management
- Webhook notifications for user lifecycle events

**Integration Pattern**:

1. User authenticates via Clerk
2. Clerk issues JWT with `userId`
3. Next.js middleware validates JWT
4. API routes extract `clerk_id` from auth context
5. App queries/creates user in Supabase using `clerk_id`
6. Operations are performed on behalf of that user

**User Sync Flow**:

```
User Signs Up in Clerk
    ↓
Clerk Webhook (optional) → /api/webhooks/clerk
    ↓
User Record Created in Supabase users table
    ↓
OR (fallback if webhook fails)
    ↓
First API Request → getCurrentUser() → Auto-creates user if not exists
```

**Security Notes**:
- Never expose service role key to frontend
- Always validate Clerk tokens server-side
- RLS policies ensure users can only access their data
- Clerk webhook uses SVIX signature verification

---

## Data Flow: Complete Request Lifecycle

### Upload & Processing Flow:

```
1. USER UPLOADS DOCUMENT
   ↓
   Browser → POST /api/upload (with file)
   
2. NEXT.JS APP
   ↓
   • Validates user authentication (Clerk)
   • Validates file (type, size)
   • Uploads file to Supabase Storage
   • Creates document record (status: 'processing')
   • Prepares webhook payload
   ↓
   
3. CALLS N8N WEBHOOK (Synchronous)
   ↓
   POST {n8n_webhook_url}
   Body: {
     document_id,
     file_path,
     filename,
     template_id (optional),
     new_template (optional)
   }
   ↓
   
4. N8N WORKFLOW PROCESSING
   ↓
   • Downloads file from Supabase Storage
   • Performs OCR extraction
   • Uses AI (GPT-4, Claude) for structured extraction
   • Validates against template schema
   • Generates natural language message
   • Calculates confidence scores
   ↓
   • IF new_template provided:
       Creates template in templates table
   • Saves results to results table
   • Updates document status to 'completed'
   ↓
   
5. N8N RETURNS RESPONSE TO NEXT.JS
   ↓
   {
     success: true,
     extracted_json: {...},
     generated_message: "...",
     ...
   }
   ↓
   
6. NEXT.JS RETURNS TO USER
   ↓
   • User sees results immediately
   • Results are stored in Supabase
   • Available in /documents and /documents/[id]
```

**Processing Time**: Typically 10-60 seconds depending on:
- Document complexity
- OCR processing time
- AI model response time
- Template complexity

**Timeout Configuration**: 2 minutes (configurable in `/api/upload/route.ts`)

---

### Document Retrieval Flow:

```
1. USER VIEWS DOCUMENTS
   ↓
   Browser → GET /api/documents
   
2. NEXT.JS APP
   ↓
   • Authenticates user (Clerk)
   • Gets user_id from Supabase
   • Queries documents table (with RLS)
   • Joins with templates table
   • Paginates results
   ↓
   
3. RETURNS DOCUMENT LIST
   ↓
   • Shows filename, status, template, upload date
   • User clicks document to view details
   ↓
   
4. USER VIEWS DOCUMENT DETAILS
   ↓
   Browser → GET /api/documents/[id]
   
5. NEXT.JS APP
   ↓
   • Authenticates user
   • Queries documents table (with RLS)
   • Joins with results table
   • Joins with templates table
   ↓
   
6. RETURNS DOCUMENT WITH RESULTS
   ↓
   {
     document: {...},
     result: {
       extracted_json: {...},
       generated_message: "...",
       raw_text: "...",
       confidence: 0.95
     },
     template: {...}
   }
```

---

## Environment Variables Reference

### Next.js Application (.env.local)

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Clerk Sign-in/Sign-up URLs (for embedded mode)
# These tell Clerk to use your embedded sign-in pages instead of hosted pages
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx (public anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx (private service key - NEVER expose to frontend)

# n8n Webhook
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/process-document
N8N_WEBHOOK_SECRET=your_webhook_secret (optional, for authentication)

# Optional: Custom port
PORT=7777
```

### n8n Workflow Environment Variables

```bash
# Supabase Access (for file download and data storage)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# AI Services (choose one or more)
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx

# OCR Service (if using external OCR)
OCR_SPACE_API_KEY=xxxxx
# or use Tesseract locally

# Webhook Authentication (optional)
WEBHOOK_SECRET=your_webhook_secret
```

---

## Security Architecture

### Authentication & Authorization:

1. **User Authentication**: Clerk handles login, session management
2. **API Authorization**: Clerk middleware on all protected routes
3. **Database Security**: RLS policies enforce row-level access control
4. **File Access**: Supabase Storage policies restrict access to file owners
5. **Service Access**: n8n uses service role key (bypasses RLS for legitimate processing)

### Data Protection:

- **In Transit**: HTTPS/TLS for all connections
- **At Rest**: Supabase encrypts all data at rest
- **File Storage**: Private bucket, no public access
- **Secrets**: Environment variables, never in code
- **Webhook Security**: Optional signature verification for n8n webhook

### Multi-Tenancy:

- Each user's data is isolated via RLS policies
- Users cannot access other users' documents or results
- Templates can be shared (viewable by all) or private (creator only)
- File paths include user_id to prevent path traversal

---

## Scaling Considerations

### Horizontal Scaling:

- **Next.js**: Stateless, scales easily on Vercel/Railway/Kubernetes
- **n8n**: Can run multiple instances with queue-based processing
- **Supabase**: Managed scaling (or self-hosted with read replicas)

### Performance Optimization:

1. **Async Processing** (Future Enhancement):
   - Change n8n webhook to async (immediate response)
   - Use polling or webhooks for completion notification
   - Implement job queue (Bull, Redis)

2. **Caching**:
   - Cache template list (changes infrequently)
   - Use Supabase Realtime for live updates
   - CDN for static assets

3. **Database Optimization**:
   - Indexes already on clerk_id, user_id, document_id, status
   - Pagination on document lists
   - Consider archiving old documents

4. **File Storage Optimization**:
   - Implement file compression
   - Use CDN for frequently accessed files
   - Lifecycle policies to archive old files to cheaper storage

### Cost Optimization:

- **Supabase**: Free tier includes 500MB database, 1GB storage
- **n8n.cloud**: Starter plan $20/month for 2,500 executions
- **Clerk**: Free tier includes 10,000 MAU
- **AI Costs**: Biggest variable - use efficient models, cache results
- **Vercel**: Free tier for hobby projects, $20/month pro

**Estimated Monthly Costs** (1000 documents):
- Supabase: $0-25 (depending on usage)
- n8n: $20-50
- Clerk: $0 (under 10k users)
- OpenAI: $50-200 (depends on document complexity)
- Vercel: $0-20

**Total**: ~$70-295/month for 1000 documents

---

## Monitoring & Debugging

### Application Logs:

- **Next.js**: Console logs, Vercel logs
- **n8n**: Execution logs in n8n dashboard
- **Supabase**: Logs & Analytics dashboard
- **Clerk**: User events and logs

### Key Metrics to Monitor:

1. **Processing Success Rate**: % of documents completed vs failed
2. **Average Processing Time**: Time from upload to completion
3. **Webhook Timeouts**: Track n8n webhook failures
4. **Storage Usage**: Monitor Supabase storage growth
5. **Database Performance**: Query times, connection pool
6. **User Activity**: Uploads per day, active users

### Common Issues & Solutions:

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Upload fails immediately | File validation, Clerk auth | Check file type/size, verify Clerk session |
| Document stuck in 'processing' | n8n webhook timeout/failure | Check n8n execution logs, increase timeout |
| Results not showing | n8n didn't save to Supabase | Verify n8n has correct service role key |
| File download fails | Storage policy, invalid path | Check RLS policies, verify file_path |
| 401 Unauthorized | Clerk token expired | User needs to re-login |
| Slow query performance | Missing indexes, large dataset | Add indexes, implement pagination |

### Debug Endpoints:

```
GET /api/debug        - System health check
GET /api/debug/db     - Database connectivity test
```

---

## Deployment Checklist

### Pre-Deployment:

- [ ] All environment variables configured
- [ ] Supabase database migration run (`001_initial_schema.sql`)
- [ ] Supabase Storage bucket created (`documents`)
- [ ] Storage policies applied
- [ ] Clerk application configured
- [ ] Clerk webhook endpoint added (optional)
- [ ] n8n workflow deployed and tested
- [ ] n8n webhook URL configured in Next.js
- [ ] Test document upload end-to-end
- [ ] Verify RLS policies work correctly

### Production Setup:

- [ ] Custom domain configured
- [ ] HTTPS/SSL enabled
- [ ] Environment-specific variables set
- [ ] Database backups enabled (Supabase)
- [ ] n8n workflow version controlled
- [ ] Monitoring/alerting set up
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Rate limiting on API routes
- [ ] CORS policies configured
- [ ] Webhook signature verification enabled

---

## API Reference

### Upload Document

```
POST /api/upload
Content-Type: multipart/form-data
Authorization: Clerk Session

Body:
  file: File (PDF, JPEG, PNG)
  template_id: string (optional)
  new_template_name: string (optional)
  new_template_description: string (optional)
  new_template_level_of_details: string (optional)

Response:
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "status": "completed",
    "result": {
      "extracted_json": {...},
      "generated_message": "...",
      "confidence": 0.95
    }
  }
}
```

### List Documents

```
GET /api/documents?page=1&limit=10
Authorization: Clerk Session

Response:
{
  "success": true,
  "data": {
    "documents": [...],
    "total": 42,
    "page": 1,
    "limit": 10
  }
}
```

### Get Document Details

```
GET /api/documents/[id]
Authorization: Clerk Session

Response:
{
  "success": true,
  "data": {
    "document": {...},
    "result": {...},
    "template": {...}
  }
}
```

### Download Document File

```
GET /api/documents/[id]/file
Authorization: Clerk Session

Response:
  - 302 Redirect to Supabase Storage signed URL
  - URL valid for 60 seconds
```

### List Templates

```
GET /api/templates
Authorization: Clerk Session

Response:
{
  "success": true,
  "data": {
    "templates": [...]
  }
}
```

### Get Statistics

```
GET /api/stats
Authorization: Clerk Session

Response:
{
  "success": true,
  "data": {
    "total_documents": 42,
    "status_breakdown": [...],
    "documents_by_template": [...],
    "average_confidence": 0.92,
    "processing_metrics": {...},
    "cost_analysis": {...},
    "usage_quota": {...}
  }
}
```

---

## Future Enhancements

### Planned Features:

1. **Async Processing**
   - Queue-based document processing
   - Real-time status updates via Supabase Realtime
   - Email notifications on completion

2. **Batch Upload**
   - Upload multiple documents at once
   - Bulk processing via n8n

3. **Advanced Templates**
   - Visual template builder
   - Template versioning
   - Template marketplace

4. **AI Improvements**
   - Support for multiple AI providers
   - Model selection per template
   - Custom prompt engineering

5. **Export & Integrations**
   - Export results to CSV, JSON, Excel
   - Zapier integration
   - REST API webhooks for results

6. **Analytics**
   - Advanced cost tracking
   - Processing time analytics
   - Confidence score trends
   - Custom dashboards

---

## Support & Troubleshooting

### Getting Help:

1. Check application logs (Next.js console)
2. Review n8n execution logs
3. Check Supabase logs and metrics
4. Review Clerk dashboard for auth issues
5. Check this documentation

### Common Questions:

**Q: Why is document processing slow?**
A: Processing time depends on n8n workflow complexity, OCR speed, and AI API response time. Optimize n8n workflow, use faster OCR, or upgrade AI model.

**Q: Can I use a different AI provider?**
A: Yes! Modify n8n workflow to use Anthropic, local models (Ollama), or any LLM API.

**Q: How do I handle large files?**
A: Increase file size limit in `/api/upload/route.ts`, ensure Supabase storage has capacity, and optimize n8n processing (chunk large PDFs).

**Q: Can I self-host everything?**
A: Yes! All services can be self-hosted: Next.js (Docker), n8n (Docker), Supabase (self-hosted), Clerk (consider alternative like Auth.js).

**Q: How do I backup my data?**
A: Supabase offers automated backups. For self-hosted, use `pg_dump` for database and sync Supabase Storage bucket to S3/local storage.

---

## Conclusion

Grand Parser is a **cloud-native orchestration platform** that connects best-in-class services:

- **Next.js**: Modern, scalable web application
- **n8n**: Flexible, powerful workflow automation for document processing
- **Supabase**: Reliable, scalable database and storage
- **Clerk**: Simple, secure authentication

The key architectural decision is **delegating all processing to n8n**, keeping the Next.js app focused on coordination and user experience. This makes the system:

- **Flexible**: Change processing logic without redeploying the app
- **Scalable**: Process documents in parallel with multiple n8n instances
- **Maintainable**: Clear separation of concerns
- **Cost-effective**: Pay only for what you use

For questions or contributions, see `README.md` and `SETUP_GUIDE.md`.

---

*Last Updated: November 2024*
*Version: 1.0.0*

