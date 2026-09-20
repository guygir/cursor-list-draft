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

  const winner = scores.find((s) => s.list.id === winnerId);
  const won = player.list.id === winnerId;
  const headline = won
    ? `ניצחת עם ${player.seats} מנדטים — הכי הרבה בין הרשימות`
    : `${winner?.list.labelHe ?? "יריב"} ניצח עם ${winner?.seats ?? 0} מנדטים מול ${player.seats} שלך`;

  const because = supportWhy(player, scores, won);
  return {
    he: because ? `${headline}. ${because.he}` : `${headline}.`,
    en: because ? `${headlineToEn(won, player, winner)}. ${because.en}` : `${headlineToEn(won, player, winner)}.`,
  };
}

function headlineToEn(won: boolean, player: WhyList, winner: WhyList | undefined): string {
  if (won) return `You won with ${player.seats} seats — most among the drafted lists`;
  return `${winner?.list.labelEn ?? "A rival"} won with ${winner?.seats ?? 0} seats against your ${player.seats}`;
}

function supportWhy(player: WhyList, scores: WhyList[], won: boolean): WhyLine | null {
  const civil = topTicketWar(player);
  if (civil) return civil;
  const veto = leaderVeto(player);
  if (veto) return veto;
  if (!player.passedThreshold) {
    const winner = scores.find((s) => s.list.id !== player.list.id && s.seats === 120);
    return {
      he: winner
        ? `הרשימה נשארה מתחת לאחוז החסימה — ${winner.list.labelHe} לקחה את כל 120`
        : "הרשימה נשארה מתחת לאחוז החסימה",
      en: winner
        ? `The list stayed under the toy threshold — ${winner.list.labelEn} took all 120`
        : "The list stayed under the toy threshold",
    };
  }
  const clone = clonedHill(player, scores);
  if (clone) return clone;
  if (!won && player.massRaw <= 16 && player.cohesion > 0.75) {
    return {
      he: "רשימה נקייה על גוש קטן — מעט מנדטים",
      en: "Clean list on a small bloc — few seats",
    };
  }
  if (won) {
    return { he: `גוש: ${player.neighborhood.labelHe}`, en: `Bloc: ${player.neighborhood.labelEn}` };
  }
  return {
    he: "מי עם הכי הרבה מנדטים — ניצח",
    en: "Most mandates wins",
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
      he: `קרע במקומות 1–2: ${name(a)} מול ${name(b)} — הביקוש כמעט לא הופך למנדטים`,
      en: `Civil war at 1–2: ${en(a)} vs ${en(b)} — demand barely converts`,
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
    he: `וטו מול ראש הרשימה: ${name(veto.a)} / ${name(veto.b)}`,
    en: `Veto on the hub: ${en(veto.a)} / ${en(veto.b)}`,
  };
}

function clonedHill(player: WhyList, scores: WhyList[]): WhyLine | null {
  if (player.splitWith.length === 0) return null;
  const rivals = scores.filter((s) => player.splitWith.includes(s.list.id));
  if (rivals.length === 0) return null;
  const rival = rivals[0]!;
  return {
    he: `${rival.list.labelHe} ישבה על אותו גוש (${player.neighborhood.labelHe}) והקולות התחלקו`,
    en: `${rival.list.labelEn} sat on the same bloc (${player.neighborhood.labelEn}) and the votes split`,
  };
}

function name(id: PersonId): string {
  return getPerson(id).nameHe;
}

function en(id: PersonId): string {
  return getPerson(id).nameEn;
}
