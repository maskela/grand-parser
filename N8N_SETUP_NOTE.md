# n8n Webhook Configuration

## Current Error
```
Error [AxiosError]: Request failed with status code 404
POST /api/upload 500
```

This error occurs because the n8n webhook endpoint is not yet configured or is unreachable.

## How to Fix

### 1. Set up your n8n workflow
- Create a workflow in n8n with a Webhook trigger
- The webhook should accept POST requests with the following payload:
  ```json
  {
    "document_id": "uuid",
    "file_path": "path/to/file",
    "filename": "document.pdf",
    "template_id": "optional-template-id",
    "new_template": {
      "name": "template-name",
      "description": "template-description",
      "level_of_details": "details"
    }
  }
  ```

### 2. Configure the webhook URL
Set your n8n webhook URL in the environment variables:

```bash
# .env.local
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

### 3. Workflow Response Format
Your n8n workflow should return this response format:

```json
{
  "success": true,
  "document_id": "uuid",
  "extracted_json": { /* extracted data */ },
  "generated_message": "extraction summary",
  "raw_text": "raw document text",
  "confidence": 0.95,
  "warnings": {},
  "template_id": "uuid"
}
```

## Temporary Workaround (Development)
If you want to test without n8n, you can modify `/app/api/upload/route.ts` to mock the response:

```typescript
// Replace the axios call with:
const webhookResponse = {
  data: {
    success: true,
    document_id: document.id,
    extracted_json: { placeholder: "Mock data" },
    generated_message: "Document processed (mock)",
    raw_text: "Mock text extraction",
    confidence: 0.85
  }
};
```

## Production Setup
For production, ensure:
1. n8n instance is running and accessible
2. Webhook URL is correctly configured
3. Network allows communication between Next.js app and n8n
4. n8n workflow has proper error handling




