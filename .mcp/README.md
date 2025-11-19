# MCP Configuration for Supabase

This directory contains the Model Context Protocol (MCP) configuration for development-time access to Supabase.

## What is MCP?

MCP (Model Context Protocol) enables AI assistants like Cursor to directly interact with your Supabase database during development. This allows for:
- Querying database structure and data
- Running SQL queries
- Inspecting tables and relationships
- Testing database operations

## Setup

1. Make sure you have your Supabase credentials in your environment or `.env.local` file:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. The MCP server will be automatically available to Cursor AI for development assistance.

## Note

This is for **development only**. The runtime application uses the standard Supabase JavaScript client, not the MCP server.


