# AI Image Queue Console

A no-header Cloudflare Pages frontend for AI image generation testing.

The page lets a user:

1. Enter an image prompt and generation settings.
2. Check if your backend/server is online.
3. Request a wake-up if the server is offline.
4. Submit the job to a ComfyUI queue endpoint.
5. See queue/job status responses.

The frontend runs in mock mode until you add an API base URL.

## Frontend files

```text
index.html
styles.css
script.js
_headers
_redirects
```

## Expected backend routes

The page expects these routes under your API base URL:

```text
GET  /health
POST /wake
POST /jobs/comfyui
```

Example API base URL:

```text
https://api.alexhartel.com
```

Then the frontend calls:

```text
GET  https://api.alexhartel.com/health
POST https://api.alexhartel.com/wake
POST https://api.alexhartel.com/jobs/comfyui
```

## Why wake and queue logic belongs in the backend

Do not put Wake-on-LAN secrets, router credentials, Proxmox tokens, Tailscale auth, or queue credentials in browser JavaScript.

The browser should only call your public API. Your API should:

1. Authenticate/rate-limit the request.
2. Check server health.
3. Wake the server if needed.
4. Save the job to a queue.
5. Let a worker submit the job to ComfyUI.

## Suggested JSON for `/jobs/comfyui`

```json
{
  "program": "comfyui",
  "job_type": "txt2img",
  "user_label": "Alex test 001",
  "prompt": "A realistic dirt trail...",
  "negative_prompt": "blurry, low quality, watermark",
  "style": "realistic",
  "settings": {
    "width": 1024,
    "height": 1024,
    "steps": 28,
    "cfg": 7,
    "seed": -1
  },
  "requested_at": "2026-05-26T05:00:00.000Z"
}
```

## Suggested backend responses

### `GET /health`

```json
{
  "online": true,
  "status": "ok",
  "worker": "image-worker-01"
}
```

### `POST /wake`

```json
{
  "wake_requested": true,
  "target": "image-worker",
  "message": "Wake packet sent"
}
```

### `POST /jobs/comfyui`

```json
{
  "accepted": true,
  "job_id": "img_20260526_000001",
  "queue_status": "queued",
  "queue_position": 1
}
```

## Deploy

Push to GitHub. Cloudflare Pages should deploy automatically.

```bash
git add .
git commit -m "Update image queue console"
git push
```
