# Quick Setup Guide

## What's Been Built

Your complete MVP application is ready with:

✅ **Authentication** - Clerk integration with user sync to Supabase
✅ **Document Upload** - Multi-file format support with validation
✅ **Template System** - Use existing or create new templates
✅ **n8n Integration** - Synchronous webhook processing
✅ **Database** - Full Supabase schema with RLS policies
✅ **Storage** - Supabase Storage for document files
✅ **API Routes** - Complete REST API for all operations
✅ **Frontend Pages** - Upload, Documents List, Document Detail, Statistics
✅ **UI Components** - Reusable Tailwind components
✅ **Charts & Analytics** - Recharts visualizations
✅ **MCP Configuration** - Development tooling for Supabase

## Quick Start (5 Steps)

### 1. Setup Environment Variables

Copy `env.example` to `.env.local` and fill in your credentials:

```bash
cp env.example .env.local
```

You'll need:
- Clerk keys (from clerk.com dashboard)
- Supabase credentials (from supabase.com project settings)
- n8n webhook URL (from your n8n instance)

### 2. Setup Supabase Database

Go to your Supabase SQL Editor and run:
```sql
-- Copy and paste the entire content of supabase/migrations/001_initial_schema.sql
```

This creates:
- users, templates, documents, results tables
- All RLS policies for data security
- Indexes for performance

### 3. Setup Supabase Storage

In your Supabase dashboard:
1. Go to Storage
2. Create bucket named `documents` (Private)
3. Run the storage policies from `supabase/README.md`

### 4. Configure Clerk Webhook

In your Clerk dashboard:
1. Go to Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - For local dev: `http://localhost:7777/api/webhooks/clerk` (or use ngrok/localtunnel)
3. Subscribe to: `user.created`, `user.updated`
4. Copy webhook secret to `.env.local`

### 5. Run Development Server

```bash
npm install
npm run dev
```

Open http://localhost:7777

**Note:** App runs on port 7777 (ports 3000, 5432, 5678, 8000 avoided for Docker compatibility)

## n8n Workflow Requirements

Your n8n workflow must:

**Input (receives from webhook):**
```json
{
  "document_id": "uuid",
  "file_path": "user-id/filename.pdf",
  "filename": "document.pdf",
  "template_id": "uuid" // optional
  "new_template": {  // optional
    "name": "Template Name",
    "description": "What to extract",
    "level_of_details": "Basic/Detailed"
  }
}
```

**Processing Steps:**
1. Download file from Supabase Storage using `file_path`
2. Perform OCR/extraction
3. Extract structured JSON
4. Generate message
5. Extract raw text
6. If `new_template`: Create record in `templates` table
7. Save results to `results` table
8. Update document `status` to 'completed' or 'failed'

**Output (returns to app):**
```json
{
  "success": true,
  "document_id": "uuid",
  "extracted_json": {},
  "generated_message": "Generated text",
  "raw_text": "Raw extracted text",
  "confidence": 0.95,
  "warnings": {},
  "template_id": "uuid"
}
```

## Testing the Application

1. **Sign Up** - Create an account at `/sign-up`
2. **Upload Document** - Go to `/upload` and upload a test file
3. **View Results** - Check `/documents` to see processing results
4. **Check Stats** - Visit `/stats` for analytics

## API Endpoints (For Programmatic Access)

All authenticated with Clerk:

- `POST /api/upload` - Upload document
- `GET /api/documents?page=1&limit=10` - List documents
- `GET /api/documents/[id]` - Get document details
- `GET /api/documents/[id]/file` - Download file
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `GET /api/templates/[id]` - Get template
- `GET /api/stats` - Get statistics

## File Structure Overview

```
grand-parser/
├── app/                    # Next.js pages & API routes
├── components/             # React components
├── lib/                    # Utilities, types, validations
├── supabase/              # Database migrations
├── .mcp/                  # MCP configuration
└── env.example            # Environment template
```

## Troubleshooting

**Can't sign in?**
- Check Clerk keys in `.env.local`
- Verify Clerk application is configured

**Upload fails?**
- Check n8n webhook URL is correct
- Verify Supabase storage bucket exists
- Check file type and size

**No results showing?**
- Check n8n workflow is running
- Verify webhook returns correct format
- Check Supabase for saved results

**Database errors?**
- Ensure migration has been run
- Verify RLS policies are applied
- Check user exists in users table

## Next Steps

1. **Deploy n8n workflow** - Set up your processing logic
2. **Test end-to-end** - Upload → Process → View results
3. **Customize templates** - Add your specific extraction needs
4. **Deploy application** - Use Vercel, Netlify, or your preferred platform
5. **Monitor usage** - Check Supabase logs and n8n execution logs

## Support

- Check `README.md` for detailed documentation
- Review `supabase/README.md` for database setup
- See `.mcp/README.md` for development tools

## Development Tips

- Use MCP in Cursor for database queries during development
- Check Next.js logs for API errors
- Monitor Supabase logs for database issues
- Review n8n execution logs for processing problems

---

**Your MVP is complete and ready to use!** 🎉

Just configure your services and start processing documents.

