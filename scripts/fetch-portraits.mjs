/**
 * Pull Wikipedia thumbnails for the draft pool (Action API, batched).
 * Identity only — not electability. Skip missing pages and pages with no photo.
 */
import { writeFile } from "node:fs/promises";

const UA = "ListDraft/0.1 (local educational prototype; not a forecast)";

/** [id, lang, title] — titles must match an existing article, not a disambiguation. */
const PEOPLE = [
  ["netanyahu", "he", "בנימין נתניהו"],
  ["eli-cohen", "he", "אלי כהן (פוליטיקאי, 1972)"],
  ["ohana", "he", "אמיר אוחנה"],
  ["levin", "he", "יריב לוין"],
  ["regev", "he", "מירי רגב"],
  ["israel-katz", "he", "ישראל כ\"ץ"],
  ["saar", "he", "גדעון סער"],
  ["ofir-katz", "he", "אופיר כץ"],
  ["kisch", "he", "יואב קיש"],
  ["ben-gvir", "he", "איתמר בן גביר"],
  ["gotliv", "he", "טלי גוטליב"],
  ["wasserlauf", "he", "יצחק וסרלאוף"],
  ["amihai-eliyahu", "he", "עמיחי אליהו"],
  ["son-har-melech", "he", "לימור סון הר-מלך"],
  ["kroizer", "he", "יצחק קרויזר"],
  ["smotrich", "he", "בצלאל סמוטריץ'"],
  ["feiglin", "he", "משה פייגלין"],
  ["strook", "he", "אורית סטרוק"],
  ["rothman", "he", "שמחה רוטמן"],
  ["sukkot", "he", "צבי סוכות"],
  ["deri", "he", "אריה דרעי"],
  ["azoulay", "he", "ינון אזולאי"],
  ["malkieli", "he", "מיכאל מלכיאלי"],
  ["ben-tzur", "he", "יואב בן-צור"],
  ["biton", "he", "חיים ביטון"],
  ["abutbul", "he", "משה אבוטבול"],
  ["buso", "he", "אוריאל בוסו"],
  ["taieb", "he", "יוסף טייב"],
  ["yaakov-asher", "he", "יעקב אשר"],
  ["goldknopf", "he", "יצחק גולדקנופף"],
  ["pindrus", "he", "יצחק פינדרוס"],
  ["porush", "he", "מאיר פרוש"],
  ["tessler", "he", "יעקב טסלר"],
  ["bennett", "he", "נפתלי בנט"],
  ["lapid", "he", "יאיר לפיד"],
  ["ben-ari", "he", "מירב בן-ארי"],
  ["ginzburg", "he", "איתן גינזבורג"],
  ["meirav-cohen", "he", "מירב כהן"],
  ["eisenkot", "he", "גדי איזנקוט"],
  ["farkash", "he", "אורית פרקש-הכהן"],
  ["kahana", "he", "מתן כהנא"],
  ["tropper", "he", "חילי טרופר"],
  ["golan", "he", "יאיר גולן"],
  ["lazimi", "he", "נעמה לזימי"],
  ["kariv", "he", "גלעד קריב"],
  ["rayten", "he", "עפרת רייטן"],
  ["lasky", "he", "גבי לסקי"],
  ["rozin", "he", "מיכל רוזין"],
  ["liberman", "he", "אביגדור ליברמן"],
  ["forer", "he", "עודד פורר"],
  ["malinovsky", "he", "יוליה מלינובסקי"],
  ["amar", "he", "חמד עמאר"],
  ["sova", "he", "יבגני סובה"],
  ["illouz", "he", "דן אילוז"],
  ["abbas", "he", "מנסור עבאס"],
  ["taha", "he", "וליד טאהא"],
  ["khatib-yasin", "he", "אימאן חטיב-יאסין"],
  ["gantz", "he", "בני גנץ"],
  ["tamano-shata", "he", "פנינה תמנו-שטה"],
  ["schuster", "he", "אלון שוסטר"],
  ["jabareen", "he", "יוסף ג'בארין"],
  ["tibi", "he", "אחמד טיבי"],
  ["abu-shehadeh", "he", "סמי אבו שחאדה"],
  ["cassif", "he", "עופר כסיף"],
  ["atauna", "he", "יוסף עטאונה"],
];

async function queryLang(lang, titles) {
  const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("prop", "pageimages|info");
  url.searchParams.set("inprop", "url");
  url.searchParams.set("pithumbsize", "160");
  url.searchParams.set("pilicense", "any");
  url.searchParams.set("redirects", "1");
  url.searchParams.set("titles", titles.join("|"));

  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`${lang} ${res.status}`);
  return res.json();
}

function indexPages(data) {
  const byTitle = new Map();
  const normalized = new Map();
  for (const red of data.query?.redirects ?? []) normalized.set(red.from, red.to);
  for (const norm of data.query?.normalized ?? []) normalized.set(norm.from, norm.to);
  for (const page of Object.values(data.query?.pages ?? {})) {
    if (page.missing || page.invalid) continue;
    byTitle.set(page.title, page);
  }
  return { byTitle, normalized };
}

function resolvePage(title, index) {
  let key = title;
  for (let i = 0; i < 3; i++) {
    const next = index.normalized.get(key);
    if (!next) break;
    key = next;
  }
  return index.byTitle.get(key) ?? null;
}

const byLang = new Map();
for (const [id, lang, title] of PEOPLE) {
  const bucket = byLang.get(lang) ?? [];
  bucket.push({ id, title });
  byLang.set(lang, bucket);
}

const rows = {};
for (const [lang, items] of byLang) {
  for (let i = 0; i < items.length; i += 40) {
    const chunk = items.slice(i, i + 40);
    const data = await queryLang(
      lang,
      chunk.map((item) => item.title),
    );
    const index = indexPages(data);
    for (const item of chunk) {
      const page = resolvePage(item.title, index);
      const thumb = page?.thumbnail?.source;
      if (!thumb) {
        console.log("skip", item.id);
        continue;
      }
      rows[item.id] = {
        url: thumb,
        source: page.fullurl ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
      };
      console.log("ok", item.id);
    }
  }
}

const body = `import type { PersonId } from "./types";

/** Wikipedia thumbnails. Identity art only — not an endorsement or electability claim. */
export const PORTRAITS: Partial<Record<PersonId, { url: string; source: string }>> = ${JSON.stringify(rows, null, 2)};

export function portraitUrl(id: PersonId): string | null {
  return PORTRAITS[id]?.url ?? null;
}
`;

await writeFile(new URL("../src/data/portraits.ts", import.meta.url), body);
console.log("wrote", Object.keys(rows).length, "portraits");
