import type { DraftList, Neighborhood } from "../data/types";
import { scoreCohesion, type PairTerm } from "./chemistry";
import {
  effectiveVotes,
  placeList,
  splitNeighborhoodMass,
  type ListPlacement,
} from "./demand";
import { allocateSeats } from "./seats";
import { whyLine, type WhyLine } from "./why";

export interface ListScore {
  list: DraftList;
  cohesion: number;
  cohesionSum: number;
  pairs: PairTerm[];
  centroid: ListPlacement["centroid"];
  neighborhood: Neighborhood;
  massRaw: number;
  massAfterSplit: number;
  splitWith: string[];
  hubDraw: number;
  effectiveVotes: number;
  share: number;
  passedThreshold: boolean;
  seats: number;
}

export interface ElectionResult {
  lists: ListScore[];
  winnerId: string;
  why: WhyLine;
}

export function resolveElection(lists: DraftList[]): ElectionResult {
  const active = lists.filter((list) => list.picks.length > 0);
  const placements = active.map(placeList);
  const splits = splitNeighborhoodMass(placements);
  const splitById = new Map(splits.map((s) => [s.listId, s]));

  const scored: ListScore[] = active.map((list, index) => {
    const chemistry = scoreCohesion(list.picks);
    const place = placements[index]!;
    const split = splitById.get(list.id)!;
    const votes = effectiveVotes(split.massAfterSplit, chemistry.cohesion, place.hubDraw);
    return {
      list,
      cohesion: chemistry.cohesion,
      cohesionSum: chemistry.sum,
      pairs: chemistry.pairs,
      centroid: place.centroid,
      neighborhood: place.neighborhood,
      massRaw: place.massRaw,
      massAfterSplit: split.massAfterSplit,
      splitWith: split.splitWith,
      hubDraw: place.hubDraw,
      effectiveVotes: votes,
      share: 0,
      passedThreshold: false,
      seats: 0,
    };
  });

  const allocated = allocateSeats(
    scored.map((row) => ({ id: row.list.id, effectiveVotes: row.effectiveVotes })),
  );
  const byId = new Map(allocated.map((row) => [row.id, row]));
  for (const row of scored) {
    const seat = byId.get(row.list.id);
    if (!seat) continue;
    row.share = seat.share;
    row.passedThreshold = seat.passedThreshold;
    row.seats = seat.seats;
  }

  const winnerId = pickWinner(scored);
  return {
    lists: scored,
    winnerId,
    why: whyLine(scored, winnerId),
  };
}

function pickWinner(scores: ListScore[]): string {
  const ranked = [...scores].sort((a, b) => {
    if (b.seats !== a.seats) return b.seats - a.seats;
    if (b.cohesion !== a.cohesion) return b.cohesion - a.cohesion;
    if (b.hubDraw !== a.hubDraw) return b.hubDraw - a.hubDraw;
    return a.list.draftOrder - b.list.draftOrder;
  });
  return ranked[0]?.list.id ?? "player";
}

