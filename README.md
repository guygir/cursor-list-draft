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

**Use Cloudflare Pages + D1.** That is the $0 path that stays fast.

| Stack | Why not (for this PoC) |
| --- | --- |
| Vercel + Supabase | Supabase free pauses after ~7 idle days; wake can take minutes. Vercel Functions cold-start. No built-in SQL on Hobby. |
| Vercel + Neon | Neon free also suspends. Same cold-start on the function. |
| This repo | Static assets on the Cloudflare edge. `/api/board` is a Pages Function + D1 in the same isolate. Client merges in the background. |

No local CLI. Same idea as connecting a repo on Vercel — but pick **Pages**, not Worker.

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → **Create application → Pages → Connect to Git** → this repo.
2. If the form has a **Deploy command** (`npx wrangler deploy`), you are on the Worker wizard. Back out.
3. Pages fields: framework Vite (or none), build `npm run build`, output directory `dist`. Production branch can stay `main`; this PR gets a preview URL if non-production builds are on.
4. After the first deploy: Settings → Bindings → D1 → create `list-draft` → bind as `DB`. Redeploy once so `/api/board` has a database.

The first production push then has a database. Until D1 is bound, the board stays on the device and `/api/board` is a no-op.

Optional CLI (any machine already logged into Cloudflare, including this agent if you add a token): `npx wrangler d1 create list-draft`, paste the id into `wrangler.toml`, `npm run deploy`.

`npm run pages` is a local Pages + Function preview. Vite-only (`npm run dev`) stays local-only if `/api/board` is missing or returns HTML.

The board is scores people already posted — not a live player count, not a 2026 forecast.
