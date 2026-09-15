import { NEIGHBORHOODS } from "../data/masses";
import { getPerson } from "../data/pool";
import type { CellId, CellPoint, DraftList, Neighborhood, PersonId } from "../data/types";
import { rankWeight } from "./chemistry";

export const CONVERSION_ALPHA = 1.5;

export interface ListPlacement {
  listId: string;
  centroid: CellPoint;
  neighborhood: Neighborhood;
  massRaw: number;
  hubDraw: number;
}

export interface SplitMass {
  listId: string;
  massAfterSplit: number;
  splitWith: string[];
}

export function listCentroid(picks: PersonId[]): CellPoint {
  if (picks.length === 0) {
    return { x: 0.5, y: 0.5 };
  }
  let wx = 0;
  let wy = 0;
  let wsum = 0;
  picks.forEach((id, index) => {
    const w = rankWeight(index + 1);
    const cell = getPerson(id).cell;
    wx += cell.x * w;
    wy += cell.y * w;
    wsum += w;
  });
  return { x: wx / wsum, y: wy / wsum };
}

export function nearestNeighborhood(point: CellPoint): Neighborhood {
  let best = NEIGHBORHOODS[0];
  if (!best) {
    throw new Error("No neighborhoods configured");
  }
  let bestDist = Number.POSITIVE_INFINITY;
  for (const n of NEIGHBORHOODS) {
    const d = Math.hypot(point.x - n.center.x, point.y - n.center.y);
    if (d < bestDist) {
      bestDist = d;
      best = n;
    }
  }
  return best;
}

export function hubDraw(picks: PersonId[]): number {
  const leader = picks[0];
  return leader ? getPerson(leader).draw : 0;
}

export function placeList(list: DraftList): ListPlacement {
  const centroid = listCentroid(list.picks);
  const neighborhood = nearestNeighborhood(centroid);
  return {
    listId: list.id,
    centroid,
    neighborhood,
    massRaw: neighborhood.mass,
    hubDraw: hubDraw(list.picks),
  };
}

/** Equal split of a cell's toy-demand mass among lists that landed there. */
export function splitNeighborhoodMass(placements: ListPlacement[]): SplitMass[] {
  const byCell = new Map<CellId, ListPlacement[]>();
  for (const p of placements) {
    const bucket = byCell.get(p.neighborhood.id) ?? [];
    bucket.push(p);
    byCell.set(p.neighborhood.id, bucket);
  }

  return placements.map((p) => {
    const room = byCell.get(p.neighborhood.id) ?? [p];
    const splitWith = room.filter((other) => other.listId !== p.listId).map((o) => o.listId);
    return {
      listId: p.listId,
      massAfterSplit: p.massRaw / room.length,
      splitWith,
    };
  });
}

export function effectiveVotes(
  massAfterSplit: number,
  cohesion: number,
  draw: number,
): number {
  return massAfterSplit * cohesion ** CONVERSION_ALPHA * draw;
}
