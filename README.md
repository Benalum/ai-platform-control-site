# AI Platform Control Website

This is a static website for the **AI Platform Control** project.

It is designed to be pushed to GitHub and connected to **Cloudflare Pages**.

## Recommended domain

Use a separate subdomain so the current locally hosted site stays untouched:

```text
platform.alexhartel.com
```

## Files

```text
.
├── index.html
├── styles.css
├── script.js
├── assets/
│   ├── logo.svg
│   ├── architecture.svg
│   └── queue-flow.svg
├── docs/
│   └── cloudflare-pages-setup.md
├── _headers
├── _redirects
├── .gitignore
└── README.md
```

## Local testing

From inside the repository:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080
```

## GitHub setup

```bash
git init
git add .
git commit -m "Initial AI Platform Control website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-platform-control-site.git
git push -u origin main
```

## Cloudflare Pages setup

In Cloudflare:

```text
Workers & Pages
→ Create application
→ Pages
→ Connect to Git
→ Select this GitHub repository
```

Recommended build settings:

```text
Framework preset: None
Build command: leave blank, or use exit 0 if Cloudflare requires a command
Build output directory: /
Root directory: /
Production branch: main
```

Then add the custom domain:

```text
platform.alexhartel.com
```

## Editing workflow

1. Edit the files locally.
2. Test with `python3 -m http.server 8080`.
3. Commit and push.
4. Cloudflare Pages automatically deploys the new version.
