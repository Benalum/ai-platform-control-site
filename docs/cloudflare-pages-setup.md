# Cloudflare Pages Setup

## Why GitHub + Cloudflare Pages

This setup is better than manual uploads because:

- Every push to `main` can deploy automatically.
- Branches and pull requests can get preview deployments.
- The website history is saved in GitHub.
- You can roll back by reverting a commit.
- The current locally hosted `alexhartel.com` site can stay untouched.

## Create GitHub repository

Create a new GitHub repo named:

```text
ai-platform-control-site
```

Upload or push this folder into that repo.

## Connect to Cloudflare Pages

Cloudflare dashboard path:

```text
Workers & Pages
→ Create application
→ Pages
→ Connect to Git
```

Select the GitHub repo.

## Build settings

Use:

```text
Framework preset: None
Production branch: main
Build command: leave blank, or use exit 0 if the UI requires a command
Build output directory: /
Root directory: /
```

This is a plain static site. There is no npm build step.

## Custom domain

After the first deployment works:

```text
Workers & Pages
→ ai-platform-control-site
→ Custom domains
→ Set up a domain
→ platform.alexhartel.com
```

This keeps your current locally hosted website separate from this new project website.

## Rollback

Use either:

1. Cloudflare Pages deployment rollback in the dashboard, or
2. Git revert:

```bash
git log --oneline
git revert COMMIT_HASH
git push
```
