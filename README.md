# List Draft (הרשימה)

Independent Israeli election **list-draft** game. Snake-draft a ticket against CPU lists; a chemistry tree and a toy mandate sim decide who gets the most seats.

This is not Election Lane Battler and not [Mandat 61](https://mandat61.vercel.app/).

**Start here:** [`AGENTS.md`](./AGENTS.md) — product thesis, scoring, trust rules, and the first PoC slice.

## Run the PoC

```bash
npm install
npm test
npm run dev
```

Open the local Vite URL. Hebrew UI, RTL. Toy mandate math — not a forecast.

The setup screen and the board paint from `localStorage` immediately. A live `/api/board` is optional and never blocks the first frame.

See [`AGENTS.md`](./AGENTS.md) and [`docs/product-memory.md`](./docs/product-memory.md).

## Deploy (free, no loads)

**Use Cloudflare Workers + D1** (the current dashboard no longer has a separate Pages-only create button). Same $0, same edge static files, same isolate for `/api/board`.

| Stack | Why not (for this PoC) |
| --- | --- |
| Vercel + Supabase | Supabase free pauses after ~7 idle days; wake can take minutes. Vercel Functions cold-start. No built-in SQL on Hobby. |
| Vercel + Neon | Neon free also suspends. Same cold-start on the function. |
| This repo | Static assets on the Cloudflare edge. `worker.js` serves `/api/board`; Vite `dist` is the site. Client merges in the background. |

From **Workers & Pages → Create application → import this GitHub repo**:

1. Project name: `cursor-list-draft` (must match `wrangler.toml`).
2. Build command: can stay empty. `wrangler.toml` runs `npm run build` before upload.
3. Deploy command: `npx wrangler deploy` (non-production: `npx wrangler versions upload`).
4. Builds for non-production branches: on. Access: off.
5. Deploy.

Until this branch is merged, production-on-`main` is the old game. Leave non-production builds on and open the **preview URL** for this PR, or point production at this branch.

**Next:** Settings → Bindings → D1 → create `list-draft` → bind as `DB` → retry the latest deployment. Until then the board stays on the device.

`npm run pages` is local `wrangler dev`. Vite-only (`npm run dev`) stays local if `/api/board` is missing.

The board is scores people already posted — not a live player count, not a 2026 forecast.
