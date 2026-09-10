# List Draft — agent brief

Status: proposed · very small PoC, not started  
Last updated: 10 September 2026  
Repo: this directory. Independent of Kalpi and of Election Lane Battler.

Read this file before planning, coding, or adding political content.
This is the product memory, PoC spec, and trust boundary until smaller files exist.

## What this is

A Hebrew-first, single-player browser game: **snake-draft a Knesset list against N CPU lists, then a short election-night simulation awards mandates.** Highest mandate total wins.

The heart is a **visible chemistry tree**. Picking a person lights compatible names and marks contradictions. The sim must agree with what the tree already showed.

Working titles: **List Draft** (en), **הרשימה** (he). Not locked.

## What this is not

- Not Election Lane Battler. No Phaser lanes, decks, Court/Knesset bases, or campaign-pressure combat.
- Not Kalpi. Do not inherit collectibles, paper/ink/foil, factions-as-brand, or Kalpi loops.
- Not [הדרך ל-61 (Mandat 61)](https://mandat61.vercel.app/). Steal broadcast *packaging*, not the 10-week campaign loop, not the daily poll scrape, not “form 61” as the win.
- Not a poll, forecast, endorsement, or claim about a real person’s electability.
- Not a coalition-formation puzzle. Win is **most mandates among the drafted lists**, not assembling 61.

## One-sentence thesis

Draft a list that looks like a real party, sits on a voter hill other lists have not already claimed, and converts that hill into the most Knesset seats.

## Audience and session

- Primary: Hebrew-speaking players who already watch mandate tickers and know the 2026 cast.
- Secondary: English-ready later; code and data keys stay English.
- Session: one snake draft + one ~20 second resolve. Phone and desktop.
- Reason to play: the tree makes “this ticket is a joke” vs “this is a party” visible before election night.

## Locked for the PoC

- Independent web game in a new repo. Do not modify `Cursor_Elections_Game_2` for this.
- Single-player vs N greedy CPU lists. Player chooses N (PoC: 1–4).
- Snake draft from a shared pool.
- Win: most mandates after threshold + seat allocation. Ties: higher cohesion, then higher hub draw, then draft order.
- Chemistry is **asymmetric and rank-weighted**. Opposition/veto dominates. Same-line alignment is a small bonus.
- Two scores, never one: **credibility** (tree) and **demand** (neighborhood mass). A coherent unpopular list loses.
- Outcomes are a labeled toy, not a forecast. Mixed lists are player-created, not alliances.
- Provenance for identity (name, party, list slot if shown) and for every authored edge. Unknown stays unknown.
- No fabricated player counts, polls, endorsements, or live popularity.

## Proposed (not locked)

- Hebrew UI first, RTL, English data.
- Visual vibe: election-night broadcast, mandate ticker, share card. Distinct from Mandat 61 and from the lane battler. No generic AI card-grid default.
- Optional later: daily seeded challenge, hotseat, online rooms.
- Optional climate knob that boosts a bloc for a run. Not “tonight’s poll.”

## Parked

- Multiplayer rooms, accounts, server-authoritative shared totals.
- Live poll ingestion and Channel-interview campaign weeks (Mandat 61’s product).
- Forming 61 / coalition negotiation as the win.
- Production likenesses, Weave art, full 120-MK pool.
- LLM-inferred “who likes whom.”

## Rejected

- Pairwise average of 20 names as the cohesion score (turns to mush).
- Treating Knesset roll-call agreement as intra-list warmth (Israeli parties whip; cohesion is high).
- Scraping [KnessetLens](https://www.knessetlens.com/) as a live API or dependency.
- Inventing person-level poll weights for backbenchers.
- Presenting the sim as a prediction of 27 October 2026.

---

## Signature interaction

Persistent object: the player’s ordered list (slot 1 = leader/hub) plus the chemistry tree of the shared pool.

Information order:

1. Player sets N (number of CPU opponents) and sees the pool on the tree.
2. Snake draft. On hover/focus of a name: cell, draw band, and edges to the current hub.
3. On pick: the tree recolours. Thick red = contradiction involving high ranks. Thin green = same-line. Slot 19–20 noise stays quiet.
4. After the last pick: election night reads cohesion, demand, and overlap, then prints mandates.
5. Result names *why*: “civil war at 1–2,” “tiny hill,” “CPU 2 cloned your neighborhood.”

Controls: tap/click to pick; keyboard-focusable names; confirm on the focused person. Reduced motion: instant recolour, no broadcast animation.

---

## Core loop

`choose N → snake-draft with the tree visible → resolve mandates → read the why → replay`

CPU: greedy. Each CPU pick maximises `hub_draw × compatibility_with_its_current_hub × remaining_neighborhood_mass`, with a penalty for overlapping a stronger existing list in the same cell. CPU uses the same visible rules as the player. No hidden stats.

---

## Scoring model

Implement this formula. Do not replace it with a neural net or an LLM judge.

### Rank weights

`w(rank) ≈ 1/rank` (PoC). Slot 1 may take an extra hub multiplier of `1.25`.

| Pair | Product of weights (approx) | Meaning |
| --- | --- | --- |
| 1 vs 2 | ~0.5–0.63 | The ticket. A veto here is campaign-ending. |
| 1 vs 20 | ~0.05 | Sour name on the poster. Noticeable, not fatal. |
| 19 vs 20 | ~0.003 | Backbencher noise. Almost no score, almost no UI. |

### Pair relation `s_ij`

Signed, from the edge list + vector distance:

- **Veto / sourced will-not-sit / opposite pole:** large negative (PoC: `-1.0`).
- **Opposite cell, no sourced veto:** medium negative (PoC: `-0.45`).
- **Unknown / far but not opposed:** `0`.
- **Same line / same faction / close cell / served together:** small positive (PoC: `+0.15`).

Green contribution must stay about **10–20%** the magnitude of a same-rank red. Stacking clones must not dominate.

**Veto versus the leader is never fully discounted.** If `s_ij` is a sourced veto and one index is slot 1, use at least `w(1) × max(w(j), 0.25)` so a rank-20 veto still cracks the tree.

### Credibility (cohesion)

Sum over pairs `i < j`:

- if `s_ij < 0`: `s_ij * w(i) * w(j)`
- if `s_ij > 0`: `s_ij * w(i) * w(j) * ε` with `ε = 0.15`

Map the sum to `cohesion ∈ (0, 1]` with a simple curve (PoC: `cohesion = 1 / (1 + k * max(0, -sum))` times a small green bump, `k ≈ 4`). Civil war at 1–2 should crush conversion. 19 vs 20 should not.

Leader is the hub for **UI and CPU**, not a second formula. The rank weights already make slot 1 dominate.

### Demand (neighborhood mass)

Each person has a cell in a small issue space (PoC: 2D is enough — e.g. security/religion axis and Netanyahu-as-person / “who serves” axis). Inherit the cell from their real 2022/2026 list when possible. CHES-Israel’s four factors (left–right, socio-cultural, economic, populism) are the research backing; do not require all four in the PoC.

- List position = rank-weighted centroid of members.
- **Neighborhood mass** `M` = how many toy voters live near that centroid. PoC: hand-set mass per cell from a tiny map (see starter data). Later: 2022 (and then 2026) list vote shares from data.gov.il projected onto the same cells.
- Other lists in the same neighborhood **split** `M` (leakage). Two change-camp general tickets steal from each other.
- Extreme cell = small `M`, high intensity. Median cell = large `M`, crowded.

Hub draw is crude, not a poll: `leader > minister > MK > newcomer` as `1.00 / 0.70 / 0.45 / 0.25`. Optional later: preferred-PM polls only for people those polls actually name.

### Effective votes and seats

```
effective_votes = M_after_split × cohesion^α × hub_draw
```

PoC: `α = 1.5` so a top-ticket civil war fails to convert demand.

Then:

1. Drop lists under **3.25%** of total effective votes.
2. Allocate **120** seats with a simplified Bader–Ofer (Hagenbach-Bischoff / D’Hondt on remaining lists). Surplus agreements: skip in the PoC.
3. Winner: max seats. Display seats and the why-line.

A perfectly aligned niche list can convert 100% and still get 8 seats. A wide messy list on a big hill can lose to a slightly narrower clean list. A cloned centrist pair splits and both underperform.

---

## Chemistry tree (UI)

Hierarchical, not a tag cloud:

```
voter cells / issue axes
        ↓
clusters (who belongs together)
        ↓
people
```

Edge types (typed, dated, sourced):

| Type | Reliability | Role |
| --- | --- | --- |
| `same-faction` | High | Current or former faction |
| `served-together` | High | Same cabinet / government, dated |
| `split` | High if sourced | Left / ran against |
| `veto` | High if quoted and dated | Public red line |
| `cell-distance` | Medium, computed | CHES-like / vote-derived vectors |
| `personal` | Only with a source | Otherwise do not add |

UI: red edges thick and rank-sensitive; green edges thin. Clicking an edge shows date + source + one-line context. Never show a red edge without a reason string.

Roll-call vote agreement is for **cross-party distance**, not intra-list warmth.

---

## Data sources (research backing, not live pipes for PoC)

Use these to *author* the tiny PoC table. Do not block the PoC on APIs.

1. **Knesset OData / data.gov.il** — members, factions, governments, roll-calls, election results by list. Identity and later demand. [Israeli election data notes](https://agentskills.co.il/en/skills/government-services/israeli-election-data).
2. **KnessetLens method, not the site as a dependency** — person-level placement from roll-call is proven (~1.7M votes, 18 topics). Replicate later from official votes. [KnessetLens](https://www.knessetlens.com/).
3. **CHES-Israel 2021/2022** (Zur & Bakker, ~50 experts, 16 lists, four latent dimensions). Party-level map. 2026 people inherit the nearest historical list cell. [CHES-Israel](https://www.chesdata.eu/chesisrael).
4. **Election results** (data.gov.il) — voter density per neighborhood. Missing this is why “aligned but the public won’t vote for them” cannot come from votes-in-the-plenum alone.
5. **Sourced red lines** (dated quotes), e.g. Liberman will not sit with Netanyahu or Ra’am; Bennett’s “covenant of those who serve.” Edges, not flavour text.

Do not use an LLM to invent chemistry. Do not scrape live polls as person weights.

Academic caution: Israeli party cohesion in roll-call is high (Rahat). Whip votes hide intra-party feuds. Intra-list red edges must be `split` / `veto` / cell-distance, not “they voted together.”

---

## Trust and editorial

- Disclose before first pick: toy, not a forecast; no party endorses the game; a mixed list is not a real alliance.
- Factual fields (name, party, sourced edge) stay separate from game fields (draw, cell, `s_ij`).
- Every real-person row and every `veto`/`split` edge needs a source URL, date, and review status: `draft` for PoC.
- Do not fabricate totals, momentum, or “Israelis think.”
- Sponsor/editorial identity: private PoC may say “independent prototype.” Public release needs a named responsible sponsor. Do not ship public political advocacy without that.
- Human approval before any public likeness or any new allegation/quote.

---

## Visual direction (PoC)

Audience: Israeli election-night watchers. Job: pick a name, see the tree answer.

Direction (proposed):

- Dark studio, mandate-yellow / alert-red, one Hebrew display face, one taut sans for UI.
- Signature: the tree recolour on pick, then a single election-night bar resolve.
- Spend boldness on the tree and the mandate bars. Keep the draft strip disciplined.
- Real names, real party labels, real why-copy. No “lorem” politicians.
- Mobile: pool + tree must work on a narrow phone. Tree can simplify to a hub-and-spokes view of *the current list* plus a compact “compatible / opposed” list.

Do not default to generic rounded cards, stat tiles, and cream serif. Do not copy Mandat 61’s pixels or Election Lane Battler’s Court/Knesset board.

Quality floor: phone + desktop, visible focus, reduced motion, empty/disabled states, unambiguous primary action (pick this person).

---

## PoC boundary — first vertical slice

**Must prove**

- 12 real people in a shared pool (starter table below).
- Player list of **6 slots** (not 20). Snake draft vs **N ∈ {1,2,3}** CPU lists of 6.
- Tree or hub-and-spokes that recolours on pick, with at least a few sourced red edges.
- Rank-weighted asymmetric cohesion + centroid demand + split + `α` conversion.
- Threshold 3.25% + 120-seat allocation (simplified).
- Why-line on the result.
- Disclosure copy.
- Local only. Deterministic given the same picks (seeded CPU only if you add noise; default greedy is deterministic).

**May fake, labeled**

- Cells and neighborhood masses (hand table, comment `toy-demand`).
- Draw bands (role heuristic).
- CPU as greedy heuristic.
- Geometric / typographic “tree” (no production art).
- Hebrew UI with a few English strings if a translation is missing; do not ship placeholder party names.

**Must be real**

- Playable draft and resolve in the browser.
- Rank × opposition math as specified.
- Identity strings that match public names.
- At least 3 sourced edges in the table (URL + date + context).

**Deferred**

- Live OData, CHES files, KnessetLens replica, poll climate.
- 20-slot lists, 40–60 person pool, 10 CPUs.
- Surplus-vote agreements, 61-coalition, sharing, accounts.

Definition of done: a new player can finish one draft on a phone, see a contradiction at slots 1–2 destroy a wide list, see a tiny coherent list convert but stay small, and see two similar lists split a hill.

---

## Starter pool (PoC — 12 people)

Hand-place these. Cells are toy labels, not CHES scores. Adjust if a source contradicts identity; do not invent new people for the PoC.

Cells (2D toy map):

- `x`: religion-and-state / service / haredi-issue, low = secular-service, high = haredi-exception
- `y`: Netanyahu / bloc, low = not-Bibi change, high = Bibi-right

Neighborhood masses `M` (toy, sum does not need to be 120):

| Cell region | M |
| --- | --- |
| Bibi-right (high y, mid x) | 38 |
| Hard right / RZ-Otzma (high y, mid-high x) | 14 |
| Haredi (high x) | 16 |
| Change-camp center (low y, low-mid x) | 32 |
| Left-Democrats (low y, low x) | 12 |
| Arab lists (own cell) | 10 |
| Lieberman-secular-right (mid y, very low x) | 8 |

People (draft pool):

| id | name | role | draw | cell (x,y) | notes |
| --- | --- | --- | --- | --- | --- |
| netanyahu | Benjamin Netanyahu | leader | 1.00 | (0.4, 0.9) | Likud hub |
| ben-gvir | Itamar Ben-Gvir | leader | 0.70 | (0.55, 0.85) | Otzma |
| smotrich | Bezalel Smotrich | leader | 0.70 | (0.6, 0.8) | RZ |
| deri | Aryeh Deri | leader | 0.70 | (0.9, 0.75) | Shas |
| bennett | Naftali Bennett | leader | 1.00 | (0.35, 0.25) | B’Yachad hub |
| lapid | Yair Lapid | leader | 0.85 | (0.2, 0.2) | with Bennett historically |
| eisenkot | Gadi Eisenkot | leader | 0.90 | (0.3, 0.22) | Yashar; large hill, overlaps Bennett |
| golan | Yair Golan | leader | 0.70 | (0.15, 0.15) | Democrats |
| liberman | Avigdor Liberman | leader | 0.75 | (0.1, 0.45) | vetoes vs Netanyahu and Ra’am |
| abbas | Mansour Abbas | leader | 0.55 | (0.5, 0.05) | Ra’am |
| ohana | Amir Ohana | minister | 0.70 | (0.4, 0.88) | Likud, same line as Netanyahu |
| gantz | Benny Gantz | leader | 0.70 | (0.28, 0.35) | softer not-Bibi; historically sat with Bibi |

Minimum sourced edges (author more if easy; these three are enough to prove the tree):

1. `veto` liberman → netanyahu. Liberman: will not sit with Netanyahu. [Times of Israel, 2026](https://www.timesofisrael.com/liveblog_entry/liberman-vows-not-to-join-any-coalition-with-netanyahu-or-raam-well-establish-a-zionist-government/).
2. `veto` liberman → abbas. Same cluster of red lines vs Ra’am. [JPost](https://www.jpost.com/israel-news/politics-and-diplomacy/article-884505).
3. `split` or `veto-ish` bennett → deri / haredi non-service. Bennett: government with those who serve; haredi partners only if they accept service/core principles. [JPost](https://www.jpost.com/israel-news/politics-and-diplomacy/article-891845).

Also encode as computed (no extra quote required): same-cell closeness (netanyahu–ohana–ben-gvir), change-camp closeness (bennett–lapid–eisenkot–golan), distance (ben-gvir vs golan).

Toy scenarios the sim must get right enough to feel:

1. **Clean small:** Ben-Gvir + Smotrich + (compatible fillers) → high cohesion, small M, few seats.
2. **Wide mess:** Bennett slot 1, Deri slot 2 → huge red at 1–2, demand does not convert.
3. **Clone hill:** Player Bennett-centric, CPU Eisenkot-centric → both split the change-camp mass.
4. **Veto poster:** Liberman slot 1, Netanyahu anywhere high → credibility crash.

---

## Tech for the PoC

- Static web: TypeScript + Vite. No Phaser. No backend.
- Data: one typed TS module or JSON for people, cells, edges, masses.
- Tests: unit-test cohesion, split, threshold, and the four toy scenarios. Then a thin UI.
- Accessibility: keyboard pick, focus, reduced motion, RTL.
- Persistence: optional localStorage for last result; not required.

Suggested first files:

```
AGENTS.md                 ← this brief
index.html
src/data/pool.ts
src/data/edges.ts
src/systems/chemistry.ts  ← cohesion
src/systems/demand.ts     ← centroid, split, M
src/systems/seats.ts      ← threshold + Bader-Ofer
src/systems/*.test.ts
src/ui/draft.ts
src/ui/tree.ts
src/ui/resolve.ts
src/styles.css
```

Implementation order: data + tests for scoring → draft CLI/headless fixture → UI tree + draft → resolve animation.

## Relationship to other repos

- `/Users/guygirmonsky/Cursor_Elections` — Kalpi. Reference only.
- `/Users/guygirmonsky/Cursor_Elections_Game_2` — lane battler. Do not merge this game into it. Roster/source *habits* (provenance, no forecast) may be reused as ideas, not as code.

## Product-memory habit

Keep statuses in this file until it splits: `locked`, `designed`, `proposed`, `parked`, `rejected`, `superseded`, `shipped`. Label toy numbers `toy-demand` / `toy-cell`. Record why a redirection happened.

When the PoC plays, add a `docs/product-memory.md` rather than growing this file forever.

## Agent rules of thumb

- Prove the math and the tree before adding campaign flavour, polls, or art.
- If a change would make the game claim a real 2026 result, stop.
- If cohesion and demand are collapsed into one “power” stat, stop.
- If you need a new politician, add sources first.
- Keep the first slice smaller than the ambition in the design sections above.
