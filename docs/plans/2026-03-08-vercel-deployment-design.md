# Vercel Deployment Design

**Date:** 2026-03-08
**Goal:** Deploy the gentle-interview-bot frontend to Vercel via GitHub integration so others can access it on the internet.

## Approach

GitHub integration with clean `.env` removal (Option A). Every push to `main` auto-deploys to Vercel.

## Repository Changes

1. **Add `.env` to `.gitignore`** — prevents future accidental commits of credentials.
2. **Untrack `.env` from git** (`git rm --cached .env`) — removes the file from git's index while keeping it on disk for local development.
3. **Add `vercel.json`** — minimal SPA routing config that rewrites all paths to `index.html` so React Router handles client-side routing correctly on Vercel.

## Vercel Dashboard Setup

1. Import the GitHub repo into Vercel. Vercel auto-detects Vite and sets:
   - Build command: `npm run build`
   - Output directory: `dist`
2. Add three environment variables in project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
3. Trigger first deploy. Subsequent pushes to `main` auto-deploy.

## What Does Not Change

- The Supabase Edge Function (`interview-chat`) is already deployed in Supabase's cloud and requires no changes. The Vercel-hosted frontend calls it the same way as local dev.

## Out of Scope

- Custom domain
- Preview deployments / branch deploys (Vercel enables these by default; no config needed)
- Rotating the Supabase anon key (low-risk, not required)
