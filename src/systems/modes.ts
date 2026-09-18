import { ASPECT_IDS, SLATE_ASPECTS, aspectDistance, cellFromAspects } from "../data/aspects";
import { PEOPLE, getPerson, registerPerson, slateLabelHe } from "../data/pool";
import type { Person, PersonAspects, PersonId, SlateId } from "../data/types";

export const INVENTED_NOTE = "invented-leader";
export const CUSTOM_ID_PREFIX = "custom:";

const ASPECT_SCALE = 99;

export interface CustomLeaderSpec {
  nameHe: string;
  aspects: PersonAspects;
  slateId: SlateId;
}

export function isInvented(id: PersonId): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX);
}

export function israelDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function dailySeed(dateKey: string): number {
  let hash = 2166136261;
  for (const ch of dateKey) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || 1;
}

/** Published slot-1 leaders — today's "play with X". */
export function publishedHubs(): Person[] {
  return PEOPLE.filter((person) => person.listSlot === 1 && person.role === "leader");
}

export function dailyHubId(dateKey = israelDateKey()): PersonId {
  const hubs = publishedHubs();
  const index = dailySeed(dateKey) % hubs.length;
  return hubs[index]!.id;
}

export function nearestSlate(aspects: PersonAspects): SlateId {
  let best: SlateId = "together";
  let mag = Number.POSITIVE_INFINITY;
  for (const [slateId, mean] of Object.entries(SLATE_ASPECTS) as Array<[SlateId, PersonAspects]>) {
    const dist = aspectDistance(aspects, mean);
    if (dist < mag) {
      mag = dist;
      best = slateId;
    }
  }
  return best;
}

export function clampAspects(aspects: PersonAspects): PersonAspects {
  const out = { ...aspects };
  for (const id of ASPECT_IDS) out[id] = Math.min(1, Math.max(0, aspects[id]));
  return out;
}

export function defaultAspects(): PersonAspects {
  return { bibi: 0.5, judicial: 0.5, service: 0.5, security: 0.5, economy: 0.5 };
}

export function sanitizeLeaderName(raw: string): string {
  return raw.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
}

export function nameClash(nameHe: string): Person | undefined {
  const needle = sanitizeLeaderName(nameHe);
  return PEOPLE.find((person) => person.nameHe === needle);
}

export function encodeCustomCode(spec: CustomLeaderSpec): string {
  const name = sanitizeLeaderName(spec.nameHe) || "בלי-שם";
  const digits = ASPECT_IDS.map((id) => String(Math.round(spec.aspects[id] * ASPECT_SCALE)).padStart(2, "0")).join("");
  return `${spec.slateId}_${digits}_${name}`;
}

export function decodeCustomCode(raw: string): CustomLeaderSpec | null {
  const match = raw.match(/^([a-z-]+)_(\d{10})_(.+)$/u);
  if (!match) return null;
  const slateId = match[1] as SlateId;
  if (!(slateId in SLATE_ASPECTS)) return null;
  const digits = match[2]!;
  const nameHe = sanitizeLeaderName(match[3] ?? "");
  if (!nameHe) return null;
  const aspects = clampAspects({
    bibi: Number(digits.slice(0, 2)) / ASPECT_SCALE,
    judicial: Number(digits.slice(2, 4)) / ASPECT_SCALE,
    service: Number(digits.slice(4, 6)) / ASPECT_SCALE,
    security: Number(digits.slice(6, 8)) / ASPECT_SCALE,
    economy: Number(digits.slice(8, 10)) / ASPECT_SCALE,
  });
  return { nameHe, aspects, slateId };
}

export function makeCustomLeader(spec: CustomLeaderSpec): Person {
  const nameHe = sanitizeLeaderName(spec.nameHe) || "בלי שם";
  const aspects = clampAspects(spec.aspects);
  const slateId = spec.slateId;
  const id = `${CUSTOM_ID_PREFIX}${encodeCustomCode({ nameHe, aspects, slateId })}`;
  const sample = PEOPLE.find((row) => row.slateId === slateId);
  const person: Person = {
    id,
    nameEn: nameHe,
    nameHe,
    partyEn: `${sample?.partyEn ?? slateId} (invented)`,
    partyHe: `${slateLabelHe(slateId)} · מומצא`,
    slateId,
    listSlot: 1,
    role: "leader",
    draw: 0.7,
    aspects,
    cell: cellFromAspects(aspects),
    aspectsNoteHe: "פרופיל שציירת. צעצוע, לא אדם אמיתי.",
    aspectsNoteEn: "A profile you painted. Toy, not a real person.",
    identitySource: {
      url: `?c=${encodeURIComponent(encodeCustomCode({ nameHe, aspects, slateId }))}`,
      date: israelDateKey(),
      note: INVENTED_NOTE,
      reviewStatus: "draft",
    },
  };
  registerPerson(person);
  return person;
}

export function ensureCustomLeader(code: string): Person | null {
  const spec = decodeCustomCode(code);
  if (!spec) return null;
  const id = `${CUSTOM_ID_PREFIX}${encodeCustomCode(spec)}`;
  try {
    return getPerson(id);
  } catch {
    return makeCustomLeader(spec);
  }
}

export function customSharePath(spec: CustomLeaderSpec): string {
  return `?c=${encodeURIComponent(encodeCustomCode(spec))}`;
}

export function dailySharePath(dateKey = israelDateKey()): string {
  return `?day=${dateKey}`;
}
