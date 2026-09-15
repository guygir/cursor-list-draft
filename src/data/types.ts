export type PersonId = string;

export type Role = "leader" | "minister" | "mk" | "newcomer";

export type ReviewStatus = "draft";

export type EdgeType =
  | "same-faction"
  | "served-together"
  | "split"
  | "veto"
  | "cell-distance"
  | "personal";

export type Reliability = "high" | "medium";

export type SlateId =
  | "likud"
  | "otzma"
  | "rz"
  | "shas"
  | "utj"
  | "together"
  | "yashar"
  | "democrats"
  | "yisrael-beiteinu"
  | "raam"
  | "blue-white"
  | "joint-list";

export interface SourceRef {
  url: string;
  date: string;
  contextHe: string;
  contextEn: string;
}

export interface CellPoint {
  x: number;
  y: number;
}

/** toy-aspect axes. Not CHES, not a poll, not electability. */
export type AspectId = "bibi" | "judicial" | "service" | "security";

export interface PersonAspects {
  bibi: number;
  judicial: number;
  service: number;
  security: number;
}

export interface Person {
  id: PersonId;
  nameEn: string;
  nameHe: string;
  partyEn: string;
  partyHe: string;
  slateId: SlateId;
  /** Published 2026 list slot when known. */
  listSlot: number;
  role: Role;
  /** toy hub-draw heuristic, not a poll */
  draw: number;
  /** Demand map: service → x, bibi → y. Derived from aspects. */
  cell: CellPoint;
  /** toy-aspect profile. Slate mean unless a reason override exists. */
  aspects: PersonAspects;
  aspectsNoteHe?: string;
  aspectsNoteEn?: string;
  identitySource: {
    url: string;
    date: string;
    note: string;
    reviewStatus: ReviewStatus;
  };
}

export interface AuthoredEdge {
  from: PersonId;
  to: PersonId;
  type: Exclude<EdgeType, "cell-distance">;
  s: number;
  reliability: Reliability;
  source: SourceRef;
  reviewStatus: ReviewStatus;
}

export type CellId =
  | "bibi-right"
  | "hard-right"
  | "haredi"
  | "change-camp"
  | "left-democrats"
  | "arab"
  | "lieberman";

export interface Neighborhood {
  id: CellId;
  labelHe: string;
  labelEn: string;
  /** toy-cell center */
  center: CellPoint;
  /** toy-demand neighborhood mass */
  mass: number;
}

export interface DraftList {
  id: string;
  labelHe: string;
  labelEn: string;
  picks: PersonId[];
  isPlayer: boolean;
  draftOrder: number;
}
