# AGENTS Guide

## Project Overview
- Project name: `notionic`
- Type: Next.js blog based on Notion content.
- Deployment: hosted on Vercel.
- Content source: Notion pages (`NOTION_PAGE_ID` and related env vars).
- Comment system: Supabase-backed threaded comments (`components/Post/SupaComments.js`, schema at `scripts/supabase-comments-schema.sql`).
- Styling/UI: Tailwind CSS.
- Package manager: pnpm.

## Key Runtime/Infra
- Frontend/runtime: Next.js 13 + React 18.
- Hosting platform: Vercel (`vercel.json` + Vercel env vars).
- Database: Supabase (for comments only in current setup).
- Optional integrations configured in `blog.config.js`:
  - Analytics providers
  - Telegram bot/channel settings
  - Newsletter/contact-related pages

## Common Commands
- Install deps: `pnpm install`
- Local dev: `./dev.sh` or `pnpm dev`
- Lint: `pnpm lint`
- Build: `pnpm build`
- Start production build: `pnpm start`

## Collaboration Agreement
- For small and low-risk changes, implement directly and commit + push to remote without asking for confirmation.
- Interrupt and ask for confirmation only when:
  - the operation is high-risk or potentially destructive;
  - critical information is missing and assumptions may cause incorrect results;
  - external credentials/permissions are required and unavailable.
- Keep commits focused, with clear commit messages.

## Change Safety Baseline
- Do not run destructive git/file operations unless explicitly requested.
- Prefer minimal, reversible edits.
- Run at least lint checks when code paths are affected.
