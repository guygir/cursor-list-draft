/** Invented list titles from Hebrew words — not real parties, not a poll. */

export const PLAYER_NAME_KEY = "list-draft:player-name";
export const PARTY_NAME_KEY = "list-draft:party-name";

/** Common given names. Not the 2026 published roster. */
export const PLAYER_NAME_BANK = [
  "נועה",
  "יובל",
  "מאיה",
  "דני",
  "שירה",
  "עומר",
  "ליאור",
  "הילה",
  "רותם",
  "טל",
  "עדן",
  "נועם",
  "מיכל",
  "אורי",
  "יעל",
  "עידו",
  "נטע",
  "סיון",
  "אביב",
  "דור",
  "תמר",
  "גיא",
  "הדר",
  "כרמל",
] as const;

/** Landscape / virtue words. Never real party brands. */
export const PARTY_WORD_BANK = [
  "נחל",
  "שחר",
  "ברק",
  "אופק",
  "דקל",
  "גבע",
  "רמון",
  "כרמל",
  "ערבה",
  "שקד",
  "תמר",
  "אלון",
  "ירדן",
  "כנרת",
  "הדר",
  "ניצן",
  "סלע",
  "מרום",
  "גל",
  "ארז",
  "נוף",
  "זית",
  "שמש",
  "רוח",
  "אבן",
  "חוף",
  "עוז",
  "אור",
  "נשר",
  "לביא",
  "שדה",
  "קדם",
  "מגדל",
  "חרוב",
  "רימון",
  "אתרוג",
  "נגב",
  "גליל",
  "חרמון",
  "תבור",
  "מעיין",
  "שושן",
  "רקפת",
  "כלנית",
  "אגם",
  "צוק",
  "רכס",
  "עמק",
  "פסגה",
  "ברכה",
] as const;

const FORBIDDEN_PARTY = [
  "ליכוד",
  "שס",
  "ש״ס",
  "עוצמה",
  "ישראל ביתנו",
  "יש עתיד",
  "כחול לבן",
  "המחנה",
  "הציונות",
  "העבודה",
  "מרצ",
  "רעם",
  "רע״ם",
  "חדש",
  "חד״ש",
  "בלד",
  "בל״ד",
  "ימינה",
  "הבית היהודי",
  "תקווה חדשה",
  "עוצמה יהודית",
  "הציונות הדתית",
];

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function sanitizeDisplayName(raw: string, max = 18): string {
  return raw.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function pickFrom<T>(bank: readonly T[], rand: () => number): T {
  const index = Math.floor(rand() * bank.length) % bank.length;
  return bank[index]!;
}

export function randomPlayerName(rand: () => number = Math.random): string {
  return pickFrom(PLAYER_NAME_BANK, rand);
}

export function randomPartyName(rand: () => number = Math.random, taken: Iterable<string> = []): string {
  const used = new Set(taken);
  for (let i = 0; i < 80; i++) {
    const a = pickFrom(PARTY_WORD_BANK, rand);
    let b = pickFrom(PARTY_WORD_BANK, rand);
    if (b === a) b = pickFrom(PARTY_WORD_BANK, rand);
    const name = `${a} ${b}`;
    if (!used.has(name) && !isForbiddenPartyName(name)) {
      used.add(name);
      return name;
    }
  }
  return "נחל אור";
}

export function uniquePartyNames(count: number, rand: () => number): string[] {
  const names: string[] = [];
  for (let i = 0; i < count; i++) names.push(randomPartyName(rand, names));
  return names;
}

export function isForbiddenPartyName(name: string): boolean {
  const compact = name.replace(/["״׳']/g, "");
  return FORBIDDEN_PARTY.some((banned) => compact.includes(banned));
}

export interface NameStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStore(): NameStore | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function loadOrCreatePlayerName(store: NameStore | null = defaultStore(), rand: () => number = Math.random): string {
  const stored = sanitizeDisplayName(store?.getItem(PLAYER_NAME_KEY) ?? "");
  if (stored) return stored;
  const name = randomPlayerName(rand);
  store?.setItem(PLAYER_NAME_KEY, name);
  return name;
}

export function loadOrCreatePartyName(store: NameStore | null = defaultStore(), rand: () => number = Math.random): string {
  const stored = sanitizeDisplayName(store?.getItem(PARTY_NAME_KEY) ?? "");
  if (stored) return stored;
  const name = randomPartyName(rand);
  store?.setItem(PARTY_NAME_KEY, name);
  return name;
}

export function savePlayerName(name: string, store: NameStore | null = defaultStore()): string {
  const clean = sanitizeDisplayName(name) || loadOrCreatePlayerName(store);
  store?.setItem(PLAYER_NAME_KEY, clean);
  return clean;
}

export function savePartyName(name: string, store: NameStore | null = defaultStore()): string {
  const clean = sanitizeDisplayName(name) || loadOrCreatePartyName(store);
  store?.setItem(PARTY_NAME_KEY, clean);
  return clean;
}
