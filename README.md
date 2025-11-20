# Grand Parser - Document Processing Platform

A full-stack MVP application for document upload, AI-powered processing via n8n webhooks, and results visualization with Supabase backend and Clerk authentication.

## Features

- 🔐 **Clerk Authentication** - Secure user authentication and management
- 📄 **Document Upload** - Support for PDF, JPEG, and PNG files
- 🤖 **AI Processing** - n8n webhook integration for document extraction
- 📊 **Template Management** - Use existing templates or create custom ones
- 📈 **Statistics Dashboard** - Visual analytics with charts and metrics
- 💾 **Supabase Backend** - PostgreSQL database and file storage
- 🔧 **MCP Support** - Model Context Protocol for development tooling

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Clerk.dev
- **Processing**: n8n Webhook
- **Charts**: Recharts
- **Form Handling**: React Hook Form + Zod
- **Development**: MCP for Supabase

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Clerk account and application
- Supabase project
- n8n instance with configured webhook

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:

```bash
cd grand-parser
```

2. **Install dependencies**:

```bash
npm install
```

3. **Setup environment variables**:

Copy `.env.example` to `.env` (or `.env.local` for local development) and fill in your credentials:

```bash
cp .env.example .env
# OR for local development:
cp .env.example .env.local
```

**Note**: Next.js will automatically load `.env.local` in development and `.env` in production. Make sure to set `N8N_WEBHOOK_URL` with your actual n8n webhook URL.

Required environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Clerk Sign-in/Sign-up URLs (for embedded mode)
# These tell Clerk to use your embedded sign-in pages instead of hosted pages
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# n8n Webhook
N8N_WEBHOOK_URL=your_n8n_webhook_url
N8N_WEBHOOK_SECRET=your_webhook_secret

# MCP (for development)
SUPABASE_URL=your_supabase_url
```

4. **Setup Supabase Database**:

- Go to your Supabase project SQL Editor
- Run the migration file: `supabase/migrations/001_initial_schema.sql`
- This will create all necessary tables and RLS policies

5. **Setup Supabase Storage**:

- Navigate to Storage in your Supabase dashboard
- Create a new bucket named `documents`
- Set it to **Private** (not public)
- Run the storage policies from `supabase/README.md`

6. **Configure Clerk Webhooks** (Optional):

- Go to your Clerk dashboard → Webhooks
- Add a new endpoint: `https://your-domain.com/api/webhooks/clerk`
- Subscribe to `user.created` and `user.updated` events
- Copy the webhook secret to your `.env.local`

**Note:** Webhooks are optional. Users are automatically synced to Supabase on first API call if they don't exist.

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:7777](http://localhost:7777) in your browser.

**Note:** The app runs on port 7777 to avoid conflicts with other services.

## n8n Webhook Configuration

Your n8n workflow should:

1. **Receive webhook data** with:
   - `document_id`: UUID of the document
   - `file_path`: Path to file in Supabase Storage
   - `filename`: Original filename
   - `template_id`: (optional) Existing template ID
   - `new_template`: (optional) New template configuration

2. **Process the document**:
   - Download file from Supabase Storage using `file_path`
   - Perform OCR/extraction
   - Extract structured JSON based on template
   - Generate message using template
   - Extract raw text

3. **Save results to Supabase**:
   - If `new_template` provided: Create template record in `templates` table
   - Save extraction results to `results` table
   - Update document status to 'completed' or 'failed' in `documents` table

4. **Return response**:
```json
{
  "success": true,
  "document_id": "uuid",
  "extracted_json": {},
  "generated_message": "string",
  "raw_text": "string",
  "confidence": 0.95,
  "warnings": {},
  "template_id": "uuid"
}
```

## API Routes

All API routes support both frontend UI and programmatic/headless access:

### Upload
- `POST /api/upload` - Upload and process document

### Documents
- `GET /api/documents` - List user's documents (with pagination)
- `GET /api/documents/[id]` - Get document details with results
- `GET /api/documents/[id]/file` - Download original file

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create new template
- `GET /api/templates/[id]` - Get template details

### Statistics
- `GET /api/stats` - Get user statistics and analytics

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user sync webhook

## Project Structure

```
grand-parser/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── documents/         # Documents pages
│   ├── stats/             # Statistics page
│   ├── upload/            # Upload page
│   ├── sign-in/           # Clerk sign-in
│   ├── sign-up/           # Clerk sign-up
│   ├── layout.tsx         # Root layout with Clerk
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Navigation.tsx    # Navigation bar
│   ├── UploadForm.tsx    # Upload form
│   ├── DocumentList.tsx  # Documents list
│   ├── DocumentDetail.tsx # Document details
│   └── StatsChart.tsx    # Statistics charts
├── lib/                   # Utilities and configs
│   ├── supabase/         # Supabase clients
│   ├── types.ts          # TypeScript types
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # Helper functions
├── supabase/             # Database migrations
│   ├── migrations/       # SQL migrations
│   └── README.md         # Supabase setup guide
├── .mcp/                 # MCP configuration
│   └── config.json       # MCP server config
├── middleware.ts         # Clerk auth middleware
├── env.example           # Environment variables template
└── README.md             # This file
```

## Database Schema

### users
- `id` (uuid, primary key)
- `clerk_id` (text, unique)
- `email` (text)
- `created_at` (timestamp)

### templates
- `id` (uuid, primary key)
- `name` (text)
- `json_schema` (jsonb)
- `message_template` (text)
- `level_of_details` (text)
- `description` (text)
- `created_by` (uuid, references users)
- `created_at` (timestamp)

### documents
- `id` (uuid, primary key)
- `user_id` (uuid, references users)
- `filename` (text)
- `file_path` (text)
- `upload_date` (timestamp)
- `template_id` (uuid, references templates)
- `status` (text: processing/completed/failed)
- `created_at` (timestamp)

### results
- `id` (uuid, primary key)
- `document_id` (uuid, references documents)
- `extracted_json` (jsonb)
- `generated_message` (text)
- `raw_text` (text)
- `confidence` (decimal)
- `warnings` (jsonb)
- `created_at` (timestamp)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted with Docker

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all secrets
- RLS policies enforce data isolation per user
- Service role key is only used server-side
- Clerk handles authentication securely
- n8n webhook should verify requests (use webhook secret)

## Troubleshooting

### Upload fails
- Check n8n webhook URL is correct
- Verify Supabase storage bucket exists and is configured
- Check file size (max 10MB) and type (PDF, JPEG, PNG)

### Authentication issues
- Verify Clerk keys are correct
- Ensure middleware is properly configured
- Check Clerk webhook is receiving events

### Database errors
- Verify RLS policies are applied
- Check user exists in users table
- Ensure migrations have been run

### n8n webhook timeout
- Increase timeout in upload route if needed (default: 2 minutes)
- Optimize n8n workflow processing time
- Consider async processing for large files

## MCP Development Tools

The project includes MCP (Model Context Protocol) configuration for development-time database access. This allows AI assistants like Cursor to:
- Query database structure and data
- Run SQL queries for debugging
- Inspect tables and relationships
- Test database operations

Note: MCP is for development only. The runtime application uses the standard Supabase JavaScript client.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Supabase logs
- Check n8n workflow execution logs
- Review Next.js server logs

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
