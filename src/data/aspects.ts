import type { AspectId, CellPoint, PersonAspects, PersonId, Role, SlateId } from "./types";

export const ASPECT_IDS: AspectId[] = ["bibi", "judicial", "service", "security"];

/** Bloc and courts weigh more than security-intensity. */
export const ASPECT_WEIGHTS: Record<AspectId, number> = {
  bibi: 1,
  judicial: 0.9,
  service: 0.7,
  security: 0.55,
};

export const ASPECT_LABEL_HE: Record<AspectId, string> = {
  bibi: "נתניהו",
  judicial: "משפט",
  service: "שירות",
  security: "ביטחון",
};

/**
 * Slate means. service/bibi stay near the old toy-cell so hills do not jump.
 * judicial/security are chemistry-only extras. toy-aspect, not CHES.
 */
export const SLATE_ASPECTS: Record<SlateId, PersonAspects> = {
  likud: { bibi: 0.9, judicial: 0.72, service: 0.4, security: 0.7 },
  otzma: { bibi: 0.85, judicial: 0.78, service: 0.55, security: 0.88 },
  rz: { bibi: 0.8, judicial: 0.82, service: 0.6, security: 0.8 },
  shas: { bibi: 0.75, judicial: 0.7, service: 0.9, security: 0.55 },
  utj: { bibi: 0.7, judicial: 0.68, service: 0.92, security: 0.45 },
  together: { bibi: 0.22, judicial: 0.28, service: 0.28, security: 0.52 },
  yashar: { bibi: 0.22, judicial: 0.32, service: 0.3, security: 0.62 },
  democrats: { bibi: 0.15, judicial: 0.18, service: 0.15, security: 0.48 },
  "yisrael-beiteinu": { bibi: 0.45, judicial: 0.4, service: 0.1, security: 0.75 },
  raam: { bibi: 0.05, judicial: 0.35, service: 0.5, security: 0.35 },
  "blue-white": { bibi: 0.35, judicial: 0.38, service: 0.28, security: 0.6 },
  "joint-list": { bibi: 0.08, judicial: 0.22, service: 0.52, security: 0.3 },
};

const BYACHAD: PersonAspects = { bibi: 0.25, judicial: 0.3, service: 0.22, security: 0.68 };
const YESH_ATID: PersonAspects = { bibi: 0.18, judicial: 0.22, service: 0.2, security: 0.48 };

interface AspectOverride {
  aspects: Partial<PersonAspects>;
  noteHe: string;
  noteEn: string;
}

export interface AspectSeed {
  id: PersonId;
  slateId: SlateId;
  role: Role;
  partyHe?: string;
}

/** Public-line faces. Everyone else still sits on the axes via slate + role/wing. */
const OVERRIDES: Partial<Record<PersonId, AspectOverride>> = {
  netanyahu: {
    aspects: { bibi: 0.95, judicial: 0.75, service: 0.4, security: 0.72 },
    noteHe: "הקוטב של הגוש. פרופיל משחק, לא סקר.",
    noteEn: "The bloc pole. Toy profile, not a poll.",
  },
  "eli-cohen": {
    aspects: { bibi: 0.9, judicial: 0.66, service: 0.4, security: 0.76 },
    noteHe: "שר, לא ראש מחנה משפטי. ליד ממוצע הליכוד.",
    noteEn: "A minister, not a judicial-camp face. Near the Likud mean.",
  },
  ohana: {
    aspects: { bibi: 0.93, judicial: 0.82, service: 0.38, security: 0.66 },
    noteHe: "יו״ר כנסת בקו עימות מול בג״ץ. פרופיל משחק.",
    noteEn: "Knesset speaker on a collision line with the court. Toy profile.",
  },
  levin: {
    aspects: { bibi: 0.88, judicial: 0.96, service: 0.4, security: 0.6 },
    noteHe: "הפנים של שינוי מערכת המשפט. פרופיל משחק.",
    noteEn: "The face of the judicial overhaul. Toy profile.",
  },
  regev: {
    aspects: { bibi: 0.92, judicial: 0.68, service: 0.38, security: 0.7 },
    noteHe: "נאמנות וסגנון, לא האדריכלית של המשפט.",
    noteEn: "Loyalty and style, not the legal architect.",
  },
  "israel-katz": {
    aspects: { bibi: 0.9, judicial: 0.64, service: 0.4, security: 0.84 },
    noteHe: "קו חוץ וביטחון יותר ממשפט.",
    noteEn: "Foreign and security line more than courts.",
  },
  saar: {
    aspects: { bibi: 0.58, judicial: 0.4, service: 0.36, security: 0.66 },
    noteHe: "עזב וחזר. פחות ביבי, פחות הפיכה. פרופיל משחק.",
    noteEn: "Left and returned. Less Bibi, less overhaul. Toy profile.",
  },
  "ofir-katz": {
    aspects: { bibi: 0.91, judicial: 0.74, service: 0.4, security: 0.68 },
    noteHe: "ניהול קואליציה. ליד ממוצע הליכוד.",
    noteEn: "Coalition floor. Near the Likud mean.",
  },
  kisch: {
    aspects: { bibi: 0.9, judicial: 0.74, service: 0.36, security: 0.66 },
    noteHe: "חינוך יותר מביטחון. פרופיל משחק.",
    noteEn: "Education more than security. Toy profile.",
  },
  "ben-gvir": {
    aspects: { bibi: 0.86, judicial: 0.82, service: 0.55, security: 0.95 },
    noteHe: "עוצמת הביטחון של המחנה. פרופיל משחק.",
    noteEn: "The security-intensity pole of the camp. Toy profile.",
  },
  gotliv: {
    aspects: { bibi: 0.86, judicial: 0.9, service: 0.54, security: 0.8 },
    noteHe: "קו משפט חד מול היועמ״שית ובג״ץ. פרופיל משחק.",
    noteEn: "A sharp courts line vs the AG and High Court. Toy profile.",
  },
  wasserlauf: {
    aspects: { bibi: 0.84, judicial: 0.76, service: 0.56, security: 0.86 },
    noteHe: "שר פיתוח בקו ההתנחלות. פרופיל משחק.",
    noteEn: "Development minister on a settlement line. Toy profile.",
  },
  "amihai-eliyahu": {
    aspects: { bibi: 0.84, judicial: 0.8, service: 0.58, security: 0.9 },
    noteHe: "מורשת וביטחון חד. פרופיל משחק.",
    noteEn: "Heritage and a sharp security line. Toy profile.",
  },
  "son-har-melech": {
    aspects: { bibi: 0.84, judicial: 0.8, service: 0.6, security: 0.9 },
    noteHe: "קו עוצמה מובהק. פרופיל משחק.",
    noteEn: "A clear Otzma line. Toy profile.",
  },
  kroizer: {
    aspects: { bibi: 0.83, judicial: 0.76, service: 0.56, security: 0.86 },
    noteHe: "ח״כ עוצמה. ליד ממוצע הסיעה.",
    noteEn: "Otzma MK. Near the slate mean.",
  },
  smotrich: {
    aspects: { bibi: 0.78, judicial: 0.88, service: 0.62, security: 0.82 },
    noteHe: "משפט והתנחלויות יותר מליכוד רגיל.",
    noteEn: "Courts and settlement more than ordinary Likud.",
  },
  feiglin: {
    aspects: { bibi: 0.7, judicial: 0.7, service: 0.42, security: 0.78 },
    noteHe: "זהות חירות — פחות חרדי, יותר אזרחי-ימין.",
    noteEn: "Zehut liberty line — less haredi, more civic-right.",
  },
  strook: {
    aspects: { bibi: 0.8, judicial: 0.84, service: 0.64, security: 0.82 },
    noteHe: "התיישבות ומנהל אזרחי. פרופיל משחק.",
    noteEn: "Settlement and civil administration. Toy profile.",
  },
  rothman: {
    aspects: { judicial: 0.94, security: 0.72 },
    noteHe: "ועדת חוקה — קו משפט חד. פרופיל משחק.",
    noteEn: "Constitution committee — a sharp courts line. Toy profile.",
  },
  "tzvika-mor": {
    aspects: { bibi: 0.82, judicial: 0.8, service: 0.58, security: 0.86 },
    noteHe: "קו חטופים-ימין. פרופיל משחק.",
    noteEn: "Hostage-right line. Toy profile.",
  },
  sukkot: {
    aspects: { bibi: 0.78, judicial: 0.84, service: 0.62, security: 0.88 },
    noteHe: "קו גבעות. פרופיל משחק.",
    noteEn: "Hilltop line. Toy profile.",
  },
  deri: {
    aspects: { bibi: 0.76, judicial: 0.72, service: 0.92, security: 0.5 },
    noteHe: "חרדי מובהק. הפער הוא שירות, לא ביבי.",
    noteEn: "Clearly haredi. The gap is service, not Bibi.",
  },
  azoulay: {
    aspects: { bibi: 0.74, judicial: 0.7, service: 0.94, security: 0.48 },
    noteHe: "קו גיוס מול החילונים. פרופיל משחק.",
    noteEn: "Draft-exemption line vs secular partners. Toy profile.",
  },
  malkieli: {
    aspects: { bibi: 0.76, judicial: 0.72, service: 0.9, security: 0.54 },
    noteHe: "שר ש״ס. ליד דרעי.",
    noteEn: "Shas minister. Near Deri.",
  },
  buso: {
    aspects: { bibi: 0.76, judicial: 0.7, service: 0.9, security: 0.56 },
    noteHe: "בריאות בתוך ש״ס. פרופיל משחק.",
    noteEn: "Health inside Shas. Toy profile.",
  },
  "yaakov-asher": {
    aspects: { bibi: 0.74, judicial: 0.7, service: 0.93, security: 0.46 },
    noteHe: "ראש יהדות התורה. פרופיל משחק.",
    noteEn: "UTJ chair. Toy profile.",
  },
  goldknopf: {
    aspects: { bibi: 0.72, judicial: 0.68, service: 0.95, security: 0.42 },
    noteHe: "חסידי — שירות בשיא. פרופיל משחק.",
    noteEn: "Hasidic — service at the ceiling. Toy profile.",
  },
  pindrus: {
    aspects: { bibi: 0.68, judicial: 0.66, service: 0.93, security: 0.44 },
    noteHe: "דגל התורה. פרופיל משחק.",
    noteEn: "Degel. Toy profile.",
  },
  porush: {
    aspects: { bibi: 0.72, judicial: 0.68, service: 0.94, security: 0.44 },
    noteHe: "אגודה/חסידות. פרופיל משחק.",
    noteEn: "Aguda / Hasidic. Toy profile.",
  },
  liberman: {
    aspects: { bibi: 0.42, judicial: 0.38, service: 0.08, security: 0.8 },
    noteHe: "חילוני-ביטחוני. נמוך בשירות, באמצע על ביבי.",
    noteEn: "Secular-security. Low on exemptions, mid on Bibi.",
  },
  forer: {
    aspects: { bibi: 0.44, judicial: 0.4, service: 0.1, security: 0.72 },
    noteHe: "ישראל ביתנו חילוני. ליד ליברמן.",
    noteEn: "Secular Yisrael Beiteinu. Near Liberman.",
  },
  malinovsky: {
    aspects: { bibi: 0.44, judicial: 0.4, service: 0.1, security: 0.7 },
    noteHe: "ח״כית ביתנו. פרופיל משחק.",
    noteEn: "YB MK. Toy profile.",
  },
  amar: {
    aspects: { bibi: 0.42, judicial: 0.38, service: 0.12, security: 0.74 },
    noteHe: "דרוזי משרת. שירות נמוך בהחרגה.",
    noteEn: "Druze who serve. Low on exemptions.",
  },
  illouz: {
    aspects: { bibi: 0.58, judicial: 0.52, service: 0.16, security: 0.76 },
    noteHe: "ימין יותר מביתנו הרגיל. פרופיל משחק.",
    noteEn: "Righter than ordinary YB. Toy profile.",
  },
  bennett: {
    aspects: { bibi: 0.25, judicial: 0.3, service: 0.22, security: 0.68 },
    noteHe: "שירות קודם, ביטחון גבוה למחנה השינוי.",
    noteEn: "Service first, high security for the change camp.",
  },
  lapid: {
    aspects: { bibi: 0.18, judicial: 0.22, service: 0.2, security: 0.48 },
    noteHe: "יותר אזרחי, פחות ביטחוני מבנט.",
    noteEn: "More civic, less security-first than Bennett.",
  },
  "ben-ari": {
    aspects: { bibi: 0.18, judicial: 0.22, service: 0.2, security: 0.5 },
    noteHe: "יש עתיד. ליד לפיד.",
    noteEn: "Yesh Atid. Near Lapid.",
  },
  "meirav-cohen": {
    aspects: { bibi: 0.18, judicial: 0.24, service: 0.2, security: 0.46 },
    noteHe: "יש עתיד חברתית. פרופיל משחק.",
    noteEn: "Yesh Atid social line. Toy profile.",
  },
  eisenkot: {
    aspects: { bibi: 0.2, judicial: 0.32, service: 0.28, security: 0.78 },
    noteHe: "רכז ביטחוני על גבעת השינוי.",
    noteEn: "A security hub on the change-camp hill.",
  },
  "yoram-cohen": {
    aspects: { bibi: 0.22, judicial: 0.34, service: 0.3, security: 0.8 },
    noteHe: "שב״כ לשעבר. ביטחון גבוה.",
    noteEn: "Ex-Shin Bet. High security.",
  },
  farkash: {
    aspects: { bibi: 0.2, judicial: 0.28, service: 0.28, security: 0.58 },
    noteHe: "יותר מוסדי, פחות מבצעי. פרופיל משחק.",
    noteEn: "More institutional, less operational. Toy profile.",
  },
  kahana: {
    aspects: { bibi: 0.28, judicial: 0.34, service: 0.22, security: 0.6 },
    noteHe: "אותה שכונה של בנט. פרופיל משחק.",
    noteEn: "Bennett's neighborhood. Toy profile.",
  },
  tropper: {
    aspects: { bibi: 0.24, judicial: 0.3, service: 0.24, security: 0.58 },
    noteHe: "ממשלת בנט. פרופיל משחק.",
    noteEn: "Bennett government. Toy profile.",
  },
  altschuler: {
    aspects: { bibi: 0.2, judicial: 0.3, service: 0.26, security: 0.5 },
    noteHe: "חברתי יותר מביטחוני. פרופיל משחק.",
    noteEn: "More social than security. Toy profile.",
  },
  golan: {
    aspects: { bibi: 0.12, judicial: 0.12, service: 0.14, security: 0.42 },
    noteHe: "הקוטב הנגדי למשפט ולביבי.",
    noteEn: "The opposite pole on courts and Bibi.",
  },
  lazimi: {
    aspects: { bibi: 0.14, judicial: 0.16, service: 0.14, security: 0.44 },
    noteHe: "שמאל עירוני. פרופיל משחק.",
    noteEn: "Urban left. Toy profile.",
  },
  kariv: {
    aspects: { judicial: 0.1, bibi: 0.14 },
    noteHe: "קו דתי-ליברלי מול ההפיכה. פרופיל משחק.",
    noteEn: "Liberal-religious line against the overhaul. Toy profile.",
  },
  rayten: {
    aspects: { bibi: 0.16, judicial: 0.18, service: 0.16, security: 0.52 },
    noteHe: "עבודה — ביטחון קצת יותר מהשמאל.",
    noteEn: "Labor — a bit more security than the left.",
  },
  lasky: {
    aspects: { bibi: 0.12, judicial: 0.08, service: 0.14, security: 0.4 },
    noteHe: "משפט וזכויות. פרופיל משחק.",
    noteEn: "Courts and rights. Toy profile.",
  },
  rozin: {
    aspects: { bibi: 0.12, judicial: 0.1, service: 0.14, security: 0.4 },
    noteHe: "מרצ לשעבר. פרופיל משחק.",
    noteEn: "Former Meretz. Toy profile.",
  },
  radman: {
    aspects: { bibi: 0.1, judicial: 0.08, service: 0.14, security: 0.4 },
    noteHe: "מחאה מול ההפיכה. פרופיל משחק.",
    noteEn: "Protest vs the overhaul. Toy profile.",
  },
  gantz: {
    aspects: { bibi: 0.38, judicial: 0.36, service: 0.28, security: 0.7 },
    noteHe: "ישב עם ביבי, נשאר רך יותר. פרופיל משחק.",
    noteEn: "Sat with Bibi, still softer. Toy profile.",
  },
  "tamano-shata": {
    aspects: { bibi: 0.32, judicial: 0.34, service: 0.24, security: 0.56 },
    noteHe: "אזרחי-עלייה. פרופיל משחק.",
    noteEn: "Civic / aliya line. Toy profile.",
  },
  bloch: {
    aspects: { bibi: 0.3, judicial: 0.34, service: 0.24, security: 0.52 },
    noteHe: "רשות מקומית וחינוך. פרופיל משחק.",
    noteEn: "Local government and education. Toy profile.",
  },
  schuster: {
    aspects: { bibi: 0.34, judicial: 0.36, service: 0.28, security: 0.58 },
    noteHe: "חקלאות בכחול לבן. פרופיל משחק.",
    noteEn: "Agriculture in Blue and White. Toy profile.",
  },
  abbas: {
    aspects: { bibi: 0.05, judicial: 0.34, service: 0.5, security: 0.32 },
    noteHe: "תא ערבי. לא גוש נתניהו.",
    noteEn: "Arab-list cell. Not the Netanyahu bloc.",
  },
  taha: {
    aspects: { bibi: 0.05, judicial: 0.34, service: 0.5, security: 0.34 },
    noteHe: "רע״ם. ליד עבאס.",
    noteEn: "Ra'am. Near Abbas.",
  },
  "khatib-yasin": {
    aspects: { bibi: 0.05, judicial: 0.32, service: 0.48, security: 0.32 },
    noteHe: "רע״ם חברתית. פרופיל משחק.",
    noteEn: "Ra'am social line. Toy profile.",
  },
  jabareen: {
    aspects: { bibi: 0.08, judicial: 0.2, service: 0.5, security: 0.3 },
    noteHe: "חד״ש בראש המשותפת. פרופיל משחק.",
    noteEn: "Hadash at the Joint List head. Toy profile.",
  },
  tibi: {
    aspects: { bibi: 0.1, judicial: 0.22, service: 0.5, security: 0.32 },
    noteHe: "תע״ל — פרלמנטרי יותר. פרופיל משחק.",
    noteEn: "Ta'al — more parliamentary. Toy profile.",
  },
  "abu-shehadeh": {
    aspects: { bibi: 0.04, judicial: 0.18, service: 0.52, security: 0.28 },
    noteHe: "בל״ד. רחוק יותר מהמרכז.",
    noteEn: "Balad. Farther from the center.",
  },
  cassif: {
    aspects: { bibi: 0.04, judicial: 0.1, service: 0.48, security: 0.24 },
    noteHe: "חד״ש שמאלי. פרופיל משחק.",
    noteEn: "Hadash left. Toy profile.",
  },
  atauna: {
    aspects: { bibi: 0.06, judicial: 0.18, service: 0.5, security: 0.28 },
    noteHe: "חד״ש. פרופיל משחק.",
    noteEn: "Hadash. Toy profile.",
  },
};

export interface ResolvedAspects {
  aspects: PersonAspects;
  overridden: boolean;
  noteHe: string;
  noteEn: string;
}

export function resolveAspects(seed: AspectSeed): ResolvedAspects {
  const override = OVERRIDES[seed.id];
  if (override) {
    return {
      aspects: clampAspects({ ...SLATE_ASPECTS[seed.slateId], ...override.aspects }),
      overridden: true,
      noteHe: override.noteHe,
      noteEn: override.noteEn,
    };
  }

  let aspects = { ...SLATE_ASPECTS[seed.slateId] };
  let noteHe = "ממוצע המפלגה, לפי תפקיד. פרופיל משחק.";
  let noteEn = "Slate mean, tilted by role. Toy profile.";

  if (seed.slateId === "together" && seed.partyHe === "יש עתיד") {
    aspects = mix(aspects, YESH_ATID, 0.45);
    noteHe = "יש עתיד בתוך ביחד. פרופיל משחק.";
    noteEn = "Yesh Atid inside Together. Toy profile.";
  } else if (seed.slateId === "together" && seed.partyHe === "ביחד") {
    aspects = mix(aspects, BYACHAD, 0.45);
    noteHe = "ביחד בתוך הרשימה המשותפת. פרופיל משחק.";
    noteEn = "B'Yachad inside the joint slate. Toy profile.";
  }

  aspects = applyRoleTilt(aspects, seed.slateId, seed.role);
  return { aspects: clampAspects(aspects), overridden: false, noteHe, noteEn };
}

function applyRoleTilt(base: PersonAspects, slateId: SlateId, role: Role): PersonAspects {
  const peak = peakAxis(SLATE_ASPECTS[slateId]);
  if (role === "leader") return { ...base, [peak]: clamp01(base[peak] + 0.04) };
  if (role === "minister") return { ...base, security: clamp01(base.security + 0.04) };
  if (role === "mk") return { ...base, [peak]: clamp01(base[peak] + 0.015) };
  return mix(base, { bibi: 0.5, judicial: 0.5, service: 0.5, security: 0.5 }, 0.18);
}

function peakAxis(aspects: PersonAspects): AspectId {
  let best: AspectId = "bibi";
  let value = -1;
  for (const id of ASPECT_IDS) {
    if (aspects[id] > value) {
      value = aspects[id];
      best = id;
    }
  }
  return best;
}

function mix(a: PersonAspects, b: PersonAspects, t: number): PersonAspects {
  return {
    bibi: a.bibi + (b.bibi - a.bibi) * t,
    judicial: a.judicial + (b.judicial - a.judicial) * t,
    service: a.service + (b.service - a.service) * t,
    security: a.security + (b.security - a.security) * t,
  };
}

export function cellFromAspects(aspects: PersonAspects): CellPoint {
  return { x: aspects.service, y: aspects.bibi };
}

export function aspectDistance(a: PersonAspects, b: PersonAspects): number {
  return Math.hypot(
    (a.bibi - b.bibi) * ASPECT_WEIGHTS.bibi,
    (a.judicial - b.judicial) * ASPECT_WEIGHTS.judicial,
    (a.service - b.service) * ASPECT_WEIGHTS.service,
    (a.security - b.security) * ASPECT_WEIGHTS.security,
  );
}

export function largestAspectGap(a: PersonAspects, b: PersonAspects): AspectId {
  let best: AspectId = "bibi";
  let mag = -1;
  for (const id of ASPECT_IDS) {
    const d = Math.abs(a[id] - b[id]) * ASPECT_WEIGHTS[id];
    if (d > mag) {
      mag = d;
      best = id;
    }
  }
  return best;
}

/** The axis farthest from this person's slate mean; else the slate's strongest axis. */
export function peakAspect(aspects: PersonAspects, slateId: SlateId): AspectId {
  const slate = SLATE_ASPECTS[slateId];
  let best: AspectId = "bibi";
  let mag = -1;
  for (const id of ASPECT_IDS) {
    const d = Math.abs(aspects[id] - slate[id]);
    if (d > mag) {
      mag = d;
      best = id;
    }
  }
  if (mag >= 0.04) return best;
  return peakAxis(aspects);
}

function clampAspects(aspects: PersonAspects): PersonAspects {
  return {
    bibi: clamp01(aspects.bibi),
    judicial: clamp01(aspects.judicial),
    service: clamp01(aspects.service),
    security: clamp01(aspects.security),
  };
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
