# Halal AI Backend

A Node.js/Express API for AI assistance, lead management, CRM, workflow automation, and business analytics.

## Features

- JWT user authentication
- Lead capture and management
- Client profile management
- Workflow automation and analytics
- Authenticated AI assistant endpoints for chat, text summaries, text-to-speech voice-over, and image generation
- MongoDB integration and CORS support

## Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- An API key for an OpenAI-compatible AI provider (needed for assistant endpoints)

### Installation

```bash
git clone https://github.com/biihafidh/fluxa-ai-backend.git
cd fluxa-ai-backend
npm install
cp .env.example .env
```

Set `MONGODB_URI`, a strong `JWT_SECRET`, `FRONTEND_URL`, and `AI_API_KEY` in `.env`. Optionally configure `AI_BASE_URL`, `AI_CHAT_MODEL`, `AI_IMAGE_MODEL`, `AI_TTS_MODEL`, and `AI_TTS_VOICE` for your provider. Keep the provider key on the server; never expose it in frontend code.

### Run

```bash
npm run dev
# or
npm start
```

## API

Every `/api/assistant` endpoint requires `Authorization: Bearer <JWT>` from the existing login/register endpoints. Requests are JSON unless specified.

### Chat

`POST /api/assistant/chat`

```json
{
  "messages": [
    { "role": "user", "content": "Help me plan my day" }
  ]
}
```

Returns `{ "reply": "...", "usage": { ... } }`. Up to 20 user/assistant messages are accepted; each is limited to 8,000 characters.

### Summaries

`POST /api/assistant/summarize`

```json
{ "text": "Text to summarize", "style": "concise" }
```

Returns `{ "summary": "...", "usage": { ... } }`.

### Voice-over (text to speech)

`POST /api/assistant/voice`

```json
{ "text": "Welcome to Halal AI", "voice": "alloy" }
```

Returns `audio/mpeg` bytes that can be played as an MP3. Text is limited to 4,000 characters. Configure voice/model options for your provider.

### Image generation

`POST /api/assistant/image`

```json
{ "prompt": "A calm geometric pattern in teal and gold", "size": "1024x1024" }
```

Returns `{ "image": { "url": "..." }, "revisedPrompt": null }` or base64 image data if the provider returns it that way. Allowed sizes: `1024x1024`, `1024x1536`, `1536x1024`.

### Existing endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `/api/leads`, `/api/clients`, `/api/workflows`, `/api/analytics`, `/api/contacts`
- `GET /api/health`

## Notes

The assistant sends only the supplied messages/text/prompts to the configured AI provider; it does not automatically access CRM records or persist chat history. Provider usage may incur charges and follows the provider's data policies. Review generated content before relying on it, especially for religious, legal, medical, or financial decisions.

## License

MIT
