# Anime Ascension — Milestone 0.1.1

Supabase integration milestone.

## Included
- Supabase Auth (email + password)
- Cookie-based SSR session with `@supabase/ssr`
- Protected game route
- Cloud character creation in `public.characters`
- Cloud-loaded player progression
- `TRAIN` updates Power in Supabase instead of localStorage
- Sign out
- RLS-compatible data flow

## Required Vercel environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Important Supabase dashboard setup
Set the Auth Site URL to the production Vercel URL and add the same origin to Redirect URLs.
If email confirmation is enabled, use the confirmation route `/auth/confirm`.

## Run locally
```bash
npm install
npm run dev
```
