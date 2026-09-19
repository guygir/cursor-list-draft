import { getPerson } from "../data/pool";
import type { DraftList, PersonId, SlateId } from "../data/types";
import { scoreCohesion } from "./chemistry";
import { effectiveVotes, hubDraw, placeList, splitNeighborhoodMass } from "./demand";

const PARTNER_WEIGHT = 0.35;

export interface CpuCandidate {
  id: PersonId;
  score: number;
  draw: number;
}

export function rankCpuCandidates(
  cpu: DraftList,
  allLists: DraftList[],
  remaining: PersonId[],
  slateCap: number | null = null,
): CpuCandidate[] {
  const lookAhead = slateCap == null || slateCap > 1;
  const ranked: CpuCandidate[] = remaining.map((id) => {
    const hypothetical: DraftList = { ...cpu, picks: [...cpu.picks, id] };
    const others = allLists.map((list) => (list.id === cpu.id ? hypothetical : list));
    const chemistry = scoreCohesion(hypothetical.picks);
    const placements = others.filter((list) => list.picks.length > 0).map(placeList);
    const split = splitNeighborhoodMass(placements).find((row) => row.listId === cpu.id);
    const mass = split?.massAfterSplit ?? placeList(hypothetical).massRaw;
    let score = effectiveVotes(mass, chemistry.cohesion, hubDraw(hypothetical.picks));
    if (lookAhead) {
      score += PARTNER_WEIGHT * partnerBoost(hypothetical, remaining, id);
    }
    return { id, score, draw: getPerson(id).draw };
  });

  ranked.sort((a, b) => {
    if (a.score > b.score + 1e-9) return -1;
    if (a.score < b.score - 1e-9) return 1;
    if (a.draw !== b.draw) return b.draw - a.draw;
    return a.id < b.id ? -1 : 1;
  });
  return ranked;
}

/** If this pick opens a slate, count a compatible leftover partner on that slate. */
function partnerBoost(hypothetical: DraftList, remaining: PersonId[], picked: PersonId): number {
  const slate = getPerson(picked).slateId;
  const already = slateCount(hypothetical.picks, slate);
  if (already !== 1) return 0;
  const mates = remaining.filter((id) => id !== picked && getPerson(id).slateId === slate);
  if (mates.length === 0) return 0;
  let best = 0;
  for (const mate of mates) {
    const chemistry = scoreCohesion([...hypothetical.picks, mate]);
    const mass = placeList({ ...hypothetical, picks: [...hypothetical.picks, mate] }).massRaw;
    const votes = effectiveVotes(mass, chemistry.cohesion, hubDraw(hypothetical.picks));
    if (votes > best) best = votes;
  }
  return best;
}

function slateCount(picks: PersonId[], slate: SlateId): number {
  return picks.filter((id) => getPerson(id).slateId === slate).length;
}

/** Always the greedy max. Ties break on hub draw, then id. Used by the auto-pick button. */
export function chooseCpuCandidate(ranked: CpuCandidate[]): PersonId {
  if (ranked.length === 0) throw new Error("Empty pool");
  return ranked[0]!.id;
}

/** 35% best, 25% 2nd, 15% 3rd, 25% uniform among the legal pool. */
export const PICK_NOISE = { first: 0.35, second: 0.25, third: 0.15, random: 0.25 } as const;

export function chooseNoisyCandidate(ranked: CpuCandidate[], rand: () => number): PersonId {
  if (ranked.length === 0) throw new Error("Empty pool");
  if (ranked.length === 1) return ranked[0]!.id;
  const roll = rand();
  const first = PICK_NOISE.first;
  const second = first + PICK_NOISE.second;
  const third = second + PICK_NOISE.third;
  if (roll < first) return ranked[0]!.id;
  if (roll < second) return (ranked[1] ?? ranked[0]!).id;
  if (roll < third) return (ranked[2] ?? ranked[1] ?? ranked[0]!).id;
  return ranked[Math.floor(rand() * ranked.length)]!.id;
}

export function greedyCpuPick(
  cpu: DraftList,
  allLists: DraftList[],
  remaining: PersonId[],
  slateCap: number | null = null,
): PersonId {
  return chooseCpuCandidate(rankCpuCandidates(cpu, allLists, remaining, slateCap));
}

export function noisyCpuPick(
  cpu: DraftList,
  allLists: DraftList[],
  remaining: PersonId[],
  slateCap: number | null,
  rand: () => number,
): PersonId {
  return chooseNoisyCandidate(rankCpuCandidates(cpu, allLists, remaining, slateCap), rand);
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
