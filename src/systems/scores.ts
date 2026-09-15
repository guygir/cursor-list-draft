import { NEIGHBORHOODS } from "../data/masses";
import type { DraftList } from "../data/types";
import { scoreCohesion } from "./chemistry";
import { placeList, splitNeighborhoodMass } from "./demand";

/** Largest toy-demand cell = 100 on the demand bar. */
export const DEMAND_SCALE = Math.max(...NEIGHBORHOODS.map((n) => n.mass));

export interface ListMeters {
  cohesion: number;
  cohesionPct: number;
  demandPct: number;
  massAfterSplit: number;
}

export function listMeters(list: DraftList, allLists: DraftList[]): ListMeters {
  const chemistry = scoreCohesion(list.picks);
  const active = allLists.filter((row) => row.picks.length > 0);
  if (list.picks.length === 0) {
    return { cohesion: chemistry.cohesion, cohesionPct: 0, demandPct: 0, massAfterSplit: 0 };
  }
  const placements = active.map(placeList);
  const split = splitNeighborhoodMass(placements).find((row) => row.listId === list.id);
  const mass = split?.massAfterSplit ?? placeList(list).massRaw;
  return {
    cohesion: chemistry.cohesion,
    cohesionPct: Math.round(chemistry.cohesion * 100),
    demandPct: Math.round(Math.min(100, (mass / DEMAND_SCALE) * 100)),
    massAfterSplit: mass,
  };
}
