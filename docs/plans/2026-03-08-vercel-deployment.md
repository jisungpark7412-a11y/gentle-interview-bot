# Vercel Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy the gentle-interview-bot Vite/React SPA to Vercel via GitHub integration so anyone can access it on the internet.

**Architecture:** The frontend is a static SPA built by Vite — Vercel hosts the `dist/` output. The Supabase Edge Function backend is already live in Supabase's cloud and requires no changes. A `vercel.json` rewrite rule is needed so React Router's client-side routes don't 404 on hard refresh.

**Tech Stack:** Vite, React, React Router, Vercel (GitHub integration), Supabase (existing, unchanged)

---

### Task 1: Remove `.env` from git tracking

**Files:**
- Modify: `.gitignore`

**Step 1: Add `.env` to `.gitignore`**

Open `.gitignore` and add this line (if not already present):

```
.env
```

**Step 2: Untrack `.env` from git index**

```bash
git rm --cached .env
```

Expected output:
```
rm '.env'
```

The file stays on disk (local dev still works) but git will no longer track it.

**Step 3: Verify `.env` is untracked**

```bash
git status
```

Expected: `.env` appears under "Untracked files", NOT under "Changes to be committed".

**Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: remove .env from git tracking"
```

---

### Task 2: Add Vercel SPA routing config

**Files:**
- Create: `vercel.json`

**Step 1: Create `vercel.json`**

Create the file at the repo root with this content:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This tells Vercel to serve `index.html` for any path, letting React Router handle routing on the client side. Without this, navigating directly to any non-root URL returns a 404.

**Step 2: Verify the file is valid JSON**

```bash
node -e "require('./vercel.json'); console.log('valid')"
```

Expected output: `valid`

**Step 3: Commit**

```bash
git add vercel.json
git commit -m "chore: add vercel.json for SPA routing"
```

---

### Task 3: Push to GitHub

**Step 1: Push both commits to main**

```bash
git push origin main
```

Expected: both commits pushed successfully.

---

### Task 4: Connect repo to Vercel (manual — done in browser)

> This task is performed by the user in the Vercel dashboard. No code changes required.

**Step 1: Go to [vercel.com](https://vercel.com) and sign in**

**Step 2: Click "Add New Project"**

**Step 3: Import the GitHub repository**

- Click "Import" next to `gentle-interview-bot`
- Vercel will auto-detect it as a Vite project and pre-fill:
  - Framework Preset: **Vite**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
- Leave all of these as-is.

**Step 4: Add environment variables**

Before clicking Deploy, expand the "Environment Variables" section and add:

| Name | Value (copy from your local `.env`) |
|------|--------------------------------------|
| `VITE_SUPABASE_URL` | `https://hapurdxixwsezogitktm.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | *(your anon key from `.env`)* |
| `VITE_SUPABASE_PROJECT_ID` | `hapurdxixwsezogitktm` |

**Step 5: Click "Deploy"**

Vercel will build and deploy. Wait for the build to complete (typically ~1 minute).

---

### Task 5: Verify the deployment

**Step 1: Open the Vercel URL**

Once deployed, Vercel shows a URL like `https://gentle-interview-bot.vercel.app`. Open it in a browser.

**Step 2: Verify the app loads**

- The welcome screen ("Ready to Practice?") should appear.
- Click "Begin Interview" — the AI should respond with the first question.
- If the AI question streams in correctly, the Supabase env vars are wired up properly.

**Step 3: Verify SPA routing**

- Navigate to the app URL directly (hard refresh). It should load correctly, not 404.

**Step 4: Verify auto-deploy works**

Make a trivial change (e.g., edit a comment), push to `main`, and confirm Vercel triggers a new deployment automatically in the Vercel dashboard.
