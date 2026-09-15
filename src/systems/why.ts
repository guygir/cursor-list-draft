import { getPerson } from "../data/pool";
import type { DraftList, Neighborhood, PersonId } from "../data/types";
import type { PairTerm } from "./chemistry";

export interface WhyLine {
  he: string;
  en: string;
}

export interface WhyList {
  list: DraftList;
  cohesion: number;
  pairs: PairTerm[];
  neighborhood: Neighborhood;
  massRaw: number;
  massAfterSplit: number;
  splitWith: string[];
  passedThreshold: boolean;
  seats: number;
}

export function whyLine(scores: WhyList[], winnerId: string): WhyLine {
  const player = scores.find((s) => s.list.isPlayer);
  if (!player) {
    return { he: "אין רשימת שחקן.", en: "No player list." };
  }

  const civil = topTicketWar(player);
  if (civil) return civil;

  const vetoPoster = leaderVeto(player);
  if (vetoPoster) return vetoPoster;

  const clone = clonedHill(player, scores);
  if (clone) return clone;

  if (!player.passedThreshold) {
    return {
      he: "הרשימה נשארה מתחת לאחוז החסימה בצעצוע.",
      en: "The list stayed under the toy electoral threshold.",
    };
  }

  if (player.massRaw <= 16 && player.cohesion > 0.75) {
    return {
      he: "רשימה נקייה על גבעה קטנה — המרה טובה, מעט מנדטים.",
      en: "Clean list on a tiny hill — converts well, few seats.",
    };
  }

  if (player.list.id === winnerId) {
    return {
      he: `ניצחון בצעצוע: ${player.seats} מנדטים על גבעת ${player.neighborhood.labelHe}.`,
      en: `Toy win: ${player.seats} seats on the ${player.neighborhood.labelEn} hill.`,
    };
  }

  const winner = scores.find((s) => s.list.id === winnerId);
  return {
    he: `${winner?.list.labelHe ?? "יריב"} לקח יותר מנדטים. אמינות ${fmt(player.cohesion)} · ביקוש אחרי פיצול ${fmt(player.massAfterSplit)}.`,
    en: `${winner?.list.labelEn ?? "A rival"} took more seats. Credibility ${fmt(player.cohesion)} · demand after split ${fmt(player.massAfterSplit)}.`,
  };
}

function topTicketWar(player: WhyList): WhyLine | null {
  const a = player.list.picks[0];
  const b = player.list.picks[1];
  if (!a || !b) return null;
  const pair = player.pairs.find((p) => p.i === 1 && p.j === 2);
  if (!pair || pair.s >= 0) return null;
  if (pair.relation.kind === "veto" || pair.relation.kind === "split") {
    return {
      he: `מלחמת אזרחים ב־1–2: ${name(a)} מול ${name(b)}. הביקוש כמעט לא מומר.`,
      en: `Civil war at 1–2: ${en(a)} vs ${en(b)}. Demand barely converts.`,
    };
  }
  if (pair.relation.kind === "opposite-cell" && player.cohesion < 0.55) {
    return {
      he: `סתירה ב־1–2 בין ${name(a)} ל־${name(b)}.`,
      en: `Contradiction at 1–2 between ${en(a)} and ${en(b)}. The tree already showed red.`,
    };
  }
  return null;
}

function leaderVeto(player: WhyList): WhyLine | null {
  const veto = player.pairs.find(
    (p) => p.relation.isSourcedVeto && (p.i === 1 || p.j === 1),
  );
  if (!veto) return null;
  return {
    he: `כרזה עם וטו מול ראש הרשימה: ${name(veto.a)} / ${name(veto.b)}. האמינות נשברת.`,
    en: `Veto on the poster against the hub: ${en(veto.a)} / ${en(veto.b)}. Credibility cracks.`,
  };
}

function clonedHill(player: WhyList, scores: WhyList[]): WhyLine | null {
  if (player.splitWith.length === 0) return null;
  const rivals = scores.filter((s) => player.splitWith.includes(s.list.id));
  if (rivals.length === 0) return null;
  const rival = rivals[0]!;
  return {
    he: `${rival.list.labelHe} שיכפל את השכונה (${player.neighborhood.labelHe}). הגבעה התפצלה.`,
    en: `${rival.list.labelEn} cloned the neighborhood (${player.neighborhood.labelEn}). The hill split.`,
  };
}

function name(id: PersonId): string {
  return getPerson(id).nameHe;
}

function en(id: PersonId): string {
  return getPerson(id).nameEn;
}

function fmt(n: number): string {
  return n.toFixed(2);
}
