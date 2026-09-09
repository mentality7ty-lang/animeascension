# Anime Ascension — Milestone 0.1

First playable vertical slice foundation.

## Included
- Cinematic boot screen
- BEGIN flow
- Character creator
- Ninja World arrival
- Human / Power 1 HUD
- TRAIN interaction
- Persistent browser save
- Responsive layout
- Framer Motion animation layer

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Next milestone
- Real stamina
- Strength / Speed / Endurance / Focus
- Multiple training actions
- Server-side save via Supabase

## Supabase note
The save layer is intentionally isolated in `lib/storage.ts`. In the next milestone it can be replaced by a Supabase-backed repository without rewriting the UI/game flow.
