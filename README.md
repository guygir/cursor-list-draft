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

**Pretty free URL:** Vercel Hobby `*.vercel.app` (same idea as [mandat61.vercel.app](https://mandat61.vercel.app/)). **Database stays Cloudflare D1** — do not add Supabase, Neon, or Vercel Postgres. Those free tiers sleep; the wake is a load. D1 already works and does not pause.

`vercel.json` proxies `/api/board` to the live Worker, so the Vercel site and the Worker share one board. The client still paints `localStorage` first.

| Stack | Use? |
| --- | --- |
| Vercel static + this D1 proxy | Yes — clean URL, $0, no sleeping DB. |
| Cloudflare Worker only | Yes — already live, uglier host. |
| Vercel + Supabase / Neon / Vercel Postgres | No — idle pause. |

**Vercel (the Mandat 61-style link):** [vercel.com](https://vercel.com) → Add New → this GitHub repo → Vite → Deploy. Name it `elections-2026` to get `elections-2026.vercel.app`. No env vars. No Vercel database.

**Cloudflare Worker (already live):** https://cursor-list-draft.guygir-728.workers.dev/ — keep this; it is the D1 API.

From **Workers & Pages → Create application → import this GitHub repo**:

1. Project name: `cursor-list-draft` (must match `wrangler.toml`).
2. Build command: can stay empty. `wrangler.toml` runs `npm run build` before upload.
3. Deploy command: `npx wrangler deploy` (non-production: `npx wrangler versions upload`).
4. Builds for non-production branches: on. Access: off.
5. Deploy.

Production branch is `main`. A push here rebuilds https://cursor-list-draft.guygir-728.workers.dev/.

**Next:** Settings → Bindings → D1 → create `list-draft` → bind as `DB` → retry the latest deployment. Until then the board stays on the device.

`npm run pages` is local `wrangler dev`. Vite-only (`npm run dev`) stays local if `/api/board` is missing.

The board is scores people already posted — not a live player count, not a 2026 forecast.
