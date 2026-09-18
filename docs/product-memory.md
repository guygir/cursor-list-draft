# Product memory

Status: shipped · playable PoC  
Date: 18 September 2026

The first vertical slice is playable locally (`npm run dev`). Scoring is the AGENTS.md formula, not a judge model. Cells and neighborhood masses stay `toy-cell` / `toy-demand`.

## What landed

- Shared pool is 2026 published top-10s for every slate in the game (Ra'am, Blue and White, and the Joint List now have the CEC/Wikipedia names through slot 10). Snake draft vs 1–3 CPUs fills **10 names** each. Short unpublished tails stay unpublished — no invented people.
- Difficulty levels cap how many names a list may take from one slate: none / 5 / 3 / 2 / 1. Easy is open. Hardest is one per party.
- Rank-weighted cohesion, centroid demand, equal hill-split, α = 1.5, 3.25% threshold, 120-seat D’Hondt.
- Hebrew RTL UI: disclosure, chemistry map / hub-and-spokes, election-night bars, why-line.
- Unit tests for cohesion, split, threshold, and the four toy scenarios.

## Toy, not a forecast

Identity and sourced veto/split edges are labeled `draft`. Mixed lists are player-created, not alliances. No live polls, no 27 October 2026 claim.

## Draft UI (10 September 2026)

- Chemistry graph is no longer a 100-dot scatter. Before a hub: party board grouped by visual blocs. After a hub: radial ticket with **all pairwise edges**.
- Pair weight is `2/(x·y)` on draft order (1–2 = 1). Tree and cohesion use the same product.
- Chemistry is graded: 5D toy-aspect distance (`bibi` / `judicial` / `service` / `security` / `economy`) plus camp rumors, not only a few 1-or-0 vetoes. Every published name sits on the axes. A pair is those two people, not their parties. Faces with a public line get a reason override; everyone else is slate mean + role/wing tilt. Same-party green is a bonus, not a floor. Rumors are gameplay color, not quotes. Demand cell stays the 2D projection of service × bibi. Economy is CHES-Israel *lrecon* at slate-mean level (high = more state); it colors chemistry only. Populism stays parked.
- Pick flow is party → member. After a party is opened, only that slate’s remaining names are shown. Taken names (player or CPU) leave the pool.
- Every published name has an image: Wikipedia thumbnail when an exact-title page has a free photo, otherwise a slate-colored initials card (first+last). Fuzzy wiki search is allowed only if first and last name are title tokens and the hit is political (Knesset / 2026 slate). Reviewed keeps: Mishraki, Omri Ronen, Somaya Bashir. Rejected same-name strangers (Ran Gvili, Michal Negrin, film-director Rosenthal, professor David Ohana, professor Amos Drory). Talik Gvili still has no matching page. Identity art, not an endorsement.
- Five pips under a name are the toy axes (Bibi / courts / service / security / economy). The side stripe is `teamRelation` — rank-weighted mean of `pairRelation` vs the whole current ticket (`w(1)=1.25`). Tooltip names the sharpest pair. Tree edges stay every pair: color maps `s` from −1 (veto red) through muted 0 to +0.22 (thin green); thickness is rank-weighted.
- Credibility and demand meters sit on the draft rail from the first pick and recompute after every pick. Hover (desktop) or tap (phone) opens a one-line explainer: tree vs hill. Bars grow and numbers count up (Fermi.gg motion). The site uses Fermi’s gray-and-yellow: dark page `#191817`, paper `#f5f3ec` (not cardboard), punch `#f4d53b`. Every bar is ink at 34%. Reduced motion snaps.
- Modes on setup: open draft; **צור מנהיג** (paint five toy axes, lock that invented hub at slot 1, share `?c=slate_digits_name` like Mandat 61’s custom candidate — still our draft, not their campaign); **אתגר היום** (published slot-1 leader of the Israel date, `?day=`). Leaderboard is local-first: every finish writes `localStorage` immediately. On Cloudflare Pages, `GET/POST /api/board` (D1) hydrates and posts in the background — no spinner. A missing API is a no-op. Do not invent a global player count from an empty store.
- Election night leads with yellow like the create screen: the player card is Fermi yellow, CPU cards stay paper, why-line is yellow.
- Opponent picks this snake pass show as side notices on the draft graph.
- CPU always takes the greedy max of projected election-night votes (cohesion + split hill + hub). Party-cap levels look one partner ahead when a second name from the same slate is still legal. No near-tie noise.
- Chemistry edges scale in color and thickness with signed `s`, not a binary red/green switch.
- Draft is one `100dvh` page with no page scroll.
- Visual blocs on the board (including גוש השינוי) are packaging only. They do not change scoring and are not a 61 claim.

## Proposed — agenda toward גוש השינוי

Not locked. Do not build yet.

Keep act 1 as the snake draft. Win stays most mandates among lists, not assembling 61.

Act 2, if we add it: a short agenda/climate pass on hills, not coalition math. One or two issue knobs (service, Netanyahu-as-person, courts) boost a neighborhood’s toy `M` for that run, labeled toy, never “tonight’s poll.” Opposition / גוש השינוי is the other lists already sitting on the change-camp hill (Together, Yashar, Democrats, Blue and White). The puzzle is claim that hill without cloning it, or raid it with a veto-clean ticket. The tree already shows whether a change-camp ticket is a party or a joke.

Optional later packaging: group those lists as one rival bloc on election night while still scoring list-vs-list.

Do not invent chemistry from a web pair-scan, person-level polls, or a Mandat-61 campaign week. Aspect overrides need a reason line; unknown stays the slate mean.

## Deploy (shipped path · Sep 2026)

**Cloudflare Pages + D1**, not Vercel + Supabase.

Why: the brief is *fast, no loads, $0*. Pages serves the Vite static build from the edge. A Pages Function talks to D1 in the same isolate — Workers do not have Vercel-style function cold starts. D1 stays on the free tier (5 GB, millions of reads). The client never waits on it.

Why not the usual stack: Supabase free projects pause after about a week of inactivity; the wake can take minutes (a load). Vercel Hobby has no database; pairing it with Supabase or a sleeping Neon branch reintroduces that pause. Vercel Functions cold-start. We only need one JSON board, not auth or Postgres.

Local `npm run dev` has no `/api/board` — ignored. Production is Cloudflare dashboard → connect this GitHub repo (no laptop CLI). Bind a D1 database named `list-draft` as `DB`. Wrangler is optional if an API token exists.

## Next (still parked)

Surplus agreements, 20-slot lists, live OData / CHES ingest, public sponsor identity, accounts.
