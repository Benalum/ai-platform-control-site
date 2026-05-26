# AI Image Testing Lab

A focused static website for testing the user experience of an AI image generation service.

## Purpose

This page is only for image generation and testing:

- Prompt testing
- Negative prompt testing
- Mode selection
- Style selection
- Size, steps, CFG, and seed controls
- Mock queue behavior
- Test request history
- Future API connection point

## Files

```text
index.html
styles.css
script.js
```

## Local preview

```bash
python3 -m http.server 8080
```

Open:

```text
http://127.0.0.1:8080
```

## Cloudflare Pages settings

```text
Framework preset: None
Build command: leave blank
Build output directory: /
Root directory: /
Production branch: main
```

## Connect the real backend later

In `script.js`, change:

```js
const API_ENDPOINT = "";
```

to your future endpoint:

```js
const API_ENDPOINT = "https://studio.alexhartel.com/api/v1/images/generate";
```

Expected request body:

```json
{
  "prompt": "realistic trail...",
  "negative_prompt": "blurry, watermark...",
  "mode": "Text to Image",
  "style": "Realistic",
  "size": "1024 × 1024",
  "steps": 30,
  "cfg": 7,
  "seed": 123456
}
```
