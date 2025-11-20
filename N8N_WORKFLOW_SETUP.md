# n8n Workflow Setup Guide - Grand Parser

## Pregled

Ovaj workflow procesira dokumente (PDF ili slike) koristeći:
1. Supabase Storage za preuzimanje fajlova
2. Paddle OCR za ekstrakciju teksta
3. OpenAI GPT-4o za ekstrakciju strukturiranih podataka
4. Supabase za čuvanje rezultata

## Instalacija

### 1. Import Workflow-a

1. Otvori n8n dashboard
2. Klikni na "Workflows" → "Import from File"
3. Učitaj `n8n-workflow.json` fajl

### 2. Konfiguracija Environment Variables

U n8n Settings → Environment Variables, dodaj:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
```

### 3. Konfiguracija Credentials

#### Supabase Credentials
1. Klikni na bilo koji Supabase node
2. Klikni na "Create New Credential"
3. Unesi:
   - **Host**: `https://your-project.supabase.co`
   - **Service Role Secret**: `your-service-role-key`

#### OpenAI Credentials
1. Klikni na bilo koji OpenAI node
2. Klikni na "Create New Credential"
3. Unesi:
   - **API Key**: `your-openai-api-key`

### 4. Konfiguracija Webhook URL-a

1. Aktiviraj workflow
2. Klikni na "Webhook" node
3. Kopiraj Production URL (npr. `https://your-n8n.com/webhook/grand-parser`)
4. Dodaj u Next.js `.env`:
   ```
   N8N_WEBHOOK_URL=https://your-n8n.com/webhook/grand-parser
   ```

## Struktura Workflow-a

### 1. Webhook Trigger
- Prima POST request sa:
  - `document_id`: UUID dokumenta
  - `file_path`: Putanja fajla u Supabase Storage
  - `filename`: Ime fajla
  - `template_id`: (opciono) ID postojećeg template-a
  - `new_template`: (opciono) Objekat sa `name`, `description`, `level_of_details`

### 2. Download File from Storage
- Preuzima fajl iz Supabase Storage koristeći REST API
- Koristi Service Role Key za autentifikaciju

### 3. OCR Extraction
- Proverava tip fajla (PDF ili Image)
- Poziva odgovarajući Paddle OCR endpoint:
  - PDF: `http://paddleocr-api:8000/ocr/pdf`
  - Image: `http://paddleocr-api:8000/ocr/image`

### 4. Template Handling
- **Ako postoji `template_id`**: Dohvata template iz Supabase sa `json_schema`, `message_template`, `level_of_details`
- **Ako postoji `new_template`**: Generiše novi JSON schema koristeći AI

### 5. Data Extraction
- Koristi LangChain Agent sa GPT-4o
- Ekstrahuje strukturirane podatke prema `json_schema`
- Koristi Structured Output Parser za validaciju

### 6. Message Generation
- Generiše human-readable message koristeći GPT-4o-mini
- Koristi `message_template` iz template-a ako postoji

### 7. Save Results
- Čuva rezultate u Supabase `results` tabelu:
  - `extracted_json`: Strukturirani podaci
  - `generated_message`: Human-readable sažetak
  - `raw_text`: Ekstrahovani tekst
  - `confidence`: Confidence score (0.0 - 1.0)
  - `warnings`: Objekat sa upozorenjima

### 8. Create Template (Conditional)
- Ako je poslat `new_template`, kreira novi template u Supabase
- Generiše `json_schema` na osnovu ekstrahovanih podataka

### 9. Update Document Status
- Ažurira `documents.status` na `completed`
- Postavlja `template_id` (novi ili postojeći)

### 10. Response
- Vraća response u formatu:
  ```json
  {
    "success": true,
    "document_id": "uuid",
    "extracted_json": {...},
    "generated_message": "...",
    "raw_text": "...",
    "confidence": 0.95,
    "warnings": {},
    "template_id": "uuid"
  }
  ```

## Error Handling

Workflow ima error handling node koji:
- Hvata greške iz bilo kog koraka
- Vraća response sa `success: false` i `error` message-om
- Next.js aplikacija će automatski ažurirati status na 'failed'

## Napomene

1. **Paddle OCR API**: Mora biti dostupan na `http://paddleocr-api:8000`. Ako koristiš Docker, proveri da li je servis pokrenut.

2. **Supabase Storage**: Fajlovi moraju biti u bucket-u `documents` sa pravilnim putanjama.

3. **Template Logic**: 
   - Ako postoji `template_id`, koristi se postojeći template
   - Ako postoji `new_template`, generiše se novi template
   - Ako nema ni jednog, workflow će koristiti default ponašanje

4. **Response Format**: Response mora biti tačno u formatu `N8nWebhookResponse` kako bi Next.js aplikacija mogla da ga parsira.

## Troubleshooting

### Workflow ne prima webhook
- Proveri da li je workflow aktiviran
- Proveri webhook URL u Next.js aplikaciji
- Proveri da li n8n instance može da prima vanjske requeste

### Greška pri preuzimanju fajla
- Proveri `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY`
- Proveri da li fajl postoji u Storage bucket-u
- Proveri da li Service Role ima pristup Storage bucket-u

### OCR ne radi
- Proveri da li je Paddle OCR API pokrenut
- Proveri URL u HTTP Request node-ovima
- Proveri da li je binary data pravilno prosleđen

### AI ekstrakcija ne radi
- Proveri `OPENAI_API_KEY`
- Proveri da li imaš dovoljno kredita na OpenAI account-u
- Proveri da li su modeli dostupni (gpt-4o, gpt-4o-mini)

### Rezultati se ne čuvaju u Supabase
- Proveri Supabase credentials
- Proveri da li `results` tabela postoji
- Proveri da li Service Role ima prava za insert u `results` tabelu

