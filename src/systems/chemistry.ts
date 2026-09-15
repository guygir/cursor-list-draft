import { aspectDistance, ASPECT_LABEL_HE, largestAspectGap } from "../data/aspects";
import { authoredEdgesBetween } from "../data/edges";
import { getPerson } from "../data/pool";
import type { AuthoredEdge, EdgeType, PersonId, Reliability } from "../data/types";

export const HUB_WEIGHT = 1.25;
export const GREEN_EPSILON = 0.15;
export const COHESION_K = 4;
export const VETO_LEADER_FLOOR = 0.25;

/** Pair rank product. Slot 1 vs 2 is 1; later pairs fall as 2/(x·y). */
export function pairRankWeight(rankI: number, rankJ: number): number {
  return 2 * (1 / rankI) * (1 / rankJ);
}

export type RelationKind =
  | "veto"
  | "split"
  | "rumor"
  | "opposite-cell"
  | "same-line"
  | "tension"
  | "unknown";

export interface PairRelation {
  a: PersonId;
  b: PersonId;
  s: number;
  kind: RelationKind;
  type: EdgeType;
  reliability: Reliability;
  isSourcedVeto: boolean;
  reasonHe: string;
  reasonEn: string;
  authored: AuthoredEdge[];
}

export interface PairTerm {
  i: number;
  j: number;
  a: PersonId;
  b: PersonId;
  s: number;
  weight: number;
  contribution: number;
  relation: PairRelation;
}

export interface CohesionBreakdown {
  sum: number;
  cohesion: number;
  pairs: PairTerm[];
}

export function rankWeight(rank: number): number {
  const base = 1 / rank;
  return rank === 1 ? base * HUB_WEIGHT : base;
}

export const SAME_SLATE_BONUS = 0.08;

export function cellDistance(a: PersonId, b: PersonId): number {
  const pa = getPerson(a).cell;
  const pb = getPerson(b).cell;
  return Math.hypot(pa.x - pb.x, pa.y - pb.y);
}

/** 2D demand-map leftover. Pair chemistry uses aspectAffinity. */
export function cellAffinity(a: PersonId, b: PersonId): number {
  const pa = getPerson(a).cell;
  const pb = getPerson(b).cell;
  const dist = Math.hypot((pa.x - pb.x) * 0.7, pa.y - pb.y);
  return clamp(0.22 - dist * 1.15, -0.75, 0.22);
}

/** Graded 4D tension. Same-slate pairs can still go cold. */
export function aspectAffinity(a: PersonId, b: PersonId): number {
  const dist = aspectDistance(getPerson(a).aspects, getPerson(b).aspects);
  return clamp(0.22 - dist * 1.05, -0.75, 0.22);
}

export function pairRelation(a: PersonId, b: PersonId): PairRelation {
  const authored = authoredEdgesBetween(a, b);
  const veto = authored.find((e) => e.type === "veto");
  if (veto) {
    return {
      a,
      b,
      s: veto.s,
      kind: "veto",
      type: "veto",
      reliability: veto.reliability,
      isSourcedVeto: true,
      reasonHe: veto.source.contextHe,
      reasonEn: veto.source.contextEn,
      authored,
    };
  }

  const split = authored.find((e) => e.type === "split");
  if (split) {
    return {
      a,
      b,
      s: split.s,
      kind: "split",
      type: "split",
      reliability: split.reliability,
      isSourcedVeto: false,
      reasonHe: split.source.contextHe,
      reasonEn: split.source.contextEn,
      authored,
    };
  }

  const rumor = authored.find((e) => e.type === "personal");
  if (rumor) {
    return {
      a,
      b,
      s: rumor.s,
      kind: rumor.s < 0 ? "rumor" : "same-line",
      type: "personal",
      reliability: rumor.reliability,
      isSourcedVeto: false,
      reasonHe: rumor.source.contextHe,
      reasonEn: rumor.source.contextEn,
      authored,
    };
  }

  const pa = getPerson(a);
  const pb = getPerson(b);
  let s = aspectAffinity(a, b);
  const together = authored.find((e) => e.type === "served-together" || e.type === "same-faction");
  const gap = ASPECT_LABEL_HE[largestAspectGap(pa.aspects, pb.aspects)];

  if (pa.slateId === pb.slateId) {
    s = clamp(s + SAME_SLATE_BONUS, -0.35, 0.22);
    const intra =
      s >= 0.12
        ? {
            kind: "same-line" as const,
            reasonHe: "אותה מפלגה ב־2026. ירוק קל — שייכות, לא אהבה.",
            reasonEn: "Same 2026 slate. Thin green — belonging, not warmth.",
          }
        : s >= 0
          ? {
              kind: "same-line" as const,
              reasonHe: `אותה מפלגה, אבל לא אותו קו. הפער: ${gap}.`,
              reasonEn: `Same slate, not the same line. Gap: ${gap}.`,
            }
          : {
              kind: "tension" as const,
              reasonHe: `אותה מפלגה, וחיכוך על ${gap}. לא וטו — פרופיל צעצוע.`,
              reasonEn: `Same slate, friction on ${gap}. Not a veto — toy profile.`,
            };
    return {
      a,
      b,
      s,
      kind: intra.kind,
      type: "same-faction",
      reliability: "high",
      isSourcedVeto: false,
      reasonHe: intra.reasonHe,
      reasonEn: intra.reasonEn,
      authored,
    };
  }

  if (together) {
    s = clamp(s + 0.08, -0.7, 0.22);
    const tone = describeTone(s);
    return {
      a,
      b,
      s,
      kind: s < 0 ? tone.kind : "same-line",
      type: together.type,
      reliability: together.reliability,
      isSourcedVeto: false,
      reasonHe: `${together.source.contextHe} ${tone.reasonHe}`,
      reasonEn: together.source.contextEn,
      authored,
    };
  }

  const tone = describeTone(s);
  return {
    a,
    b,
    s,
    kind: tone.kind,
    type: "cell-distance",
    reliability: "medium",
    isSourcedVeto: false,
    reasonHe: tone.reasonHe,
    reasonEn: tone.reasonEn,
    authored,
  };
}

function describeTone(s: number): { kind: RelationKind; reasonHe: string; reasonEn: string } {
  if (s >= 0.12) {
    return {
      kind: "same-line",
      reasonHe: "נשמעים כמו אותו מחנה. ירוק קל.",
      reasonEn: "Same neighborhood on the toy map. Thin green.",
    };
  }
  if (s >= 0.02) {
    return {
      kind: "same-line",
      reasonHe: "לא רחוקים. חיבור חלש, לא ברית.",
      reasonEn: "Not far. A weak link, not an alliance.",
    };
  }
  if (s >= -0.2) {
    return {
      kind: "tension",
      reasonHe: "יש חיכוך. לא קרע, גם לא חיבוק.",
      reasonEn: "Some friction. Not a rupture, not a hug.",
    };
  }
  if (s >= -0.45) {
    return {
      kind: "opposite-cell",
      reasonHe: "מחנות שונים. האדום בינוני — הכרזה תיראה מעורבת.",
      reasonEn: "Different camps. Medium red — a mixed poster.",
    };
  }
  return {
    kind: "opposite-cell",
    reasonHe: "רחוקים מאוד על המפה. כרזה כזאת צועקת סתירה.",
    reasonEn: "Very far on the map. The poster looks like a contradiction.",
  };
}

export function shortReasonHe(relation: PairRelation): string {
  if (relation.kind === "veto") return "וטו";
  if (relation.kind === "split") return "קרע";
  if (relation.kind === "rumor") return "שמועה";
  if (relation.kind === "opposite-cell") return "מתח בין מחנות";
  if (relation.kind === "tension") return "חיכוך";
  if (relation.type === "same-faction") return "אותה מפלגה";
  if (relation.type === "served-together") return "כיהנו יחד";
  if (relation.kind === "same-line") return "קרובים";
  return "קשר חלש";
}

export function pairWeight(
  rankI: number,
  rankJ: number,
  relation: PairRelation,
): number {
  if (relation.isSourcedVeto && (rankI === 1 || rankJ === 1)) {
    const other = rankI === 1 ? rankJ : rankI;
    return 2 * Math.max(1 / other, VETO_LEADER_FLOOR);
  }
  return pairRankWeight(rankI, rankJ);
}

export function pairContribution(
  rankI: number,
  rankJ: number,
  relation: PairRelation,
): number {
  const weight = pairWeight(rankI, rankJ, relation);
  const raw = relation.s * weight;
  return relation.s > 0 ? raw * GREEN_EPSILON : raw;
}

export function scoreCohesion(picks: PersonId[]): CohesionBreakdown {
  const pairs: PairTerm[] = [];
  let sum = 0;

  for (let i = 0; i < picks.length; i++) {
    for (let j = i + 1; j < picks.length; j++) {
      const a = picks[i];
      const b = picks[j];
      if (!a || !b) continue;
      const relation = pairRelation(a, b);
      const rankI = i + 1;
      const rankJ = j + 1;
      const weight = pairWeight(rankI, rankJ, relation);
      const contribution = pairContribution(rankI, rankJ, relation);
      sum += contribution;
      pairs.push({ i: rankI, j: rankJ, a, b, s: relation.s, weight, contribution, relation });
    }
  }

  const redPenalty = Math.max(0, -sum);
  const greenSum = pairs
    .filter((p) => p.contribution > 0)
    .reduce((acc, p) => acc + p.contribution, 0);
  const base = 1 / (1 + COHESION_K * redPenalty);
  const greenBump = 1 + Math.min(0.08, greenSum * 2);
  const cohesion = clamp01(base * greenBump);

  return { sum, cohesion, pairs };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function clamp01(n: number): number {
  if (n <= 0) return Number.EPSILON;
  if (n > 1) return 1;
  return n;
}

export function compatibilityWithHub(hub: PersonId, candidate: PersonId): number {
  return 1 + pairRelation(hub, candidate).s;
}
