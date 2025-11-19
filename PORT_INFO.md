# Port Configuration

## Ports Used by Grand Parser

**Port 7777** - Next.js Development & Production Server

## Ports Avoided (Docker Conflicts)

The following ports are intentionally NOT used to avoid conflicts with other Docker projects:

- ❌ Port 3000 - (Typically default Next.js)
- ❌ Port 5432 - (Typically PostgreSQL/Supabase local)
- ❌ Port 5678 - (Typically n8n local instance)
- ❌ Port 8000 - (Reserved for other projects)

## External Services (Cloud - No Local Ports)

- **Supabase** - Cloud-hosted (supabase.co)
- **Clerk** - Cloud-hosted (clerk.dev)
- **n8n** - Remote webhook (your n8n instance URL)

## Running the Application

```bash
# Development (runs on port 3001)
npm run dev

# Production (runs on port 3001)
npm run build
npm start
```

Access the app at: **http://localhost:7777**

## Changing the Port

If you need to use a different port, edit `package.json`:

```json
"scripts": {
  "dev": "next dev -p YOUR_PORT",
  "start": "next start -p YOUR_PORT"
}
```

Or set environment variable:

```bash
PORT=YOUR_PORT npm run dev
```

