/**
 * Pull Wikipedia thumbnails.
 * Exact titles first. Fuzzy search only when last name (and first name
 * for common surnames) appears on the page title. Identity art, not electability.
 */
import { readFile, writeFile } from "node:fs/promises";

const UA = "ListDraft/0.1 (local educational prototype; not a forecast)";
const PORTRAIT_PATH = new URL("../src/data/portraits.ts", import.meta.url);
const POOL_PATH = new URL("../src/data/pool.ts", import.meta.url);

/** Exact titles that already worked or should be retried. */
const EXACT = [
  ["israel-katz", "ישראל כץ (הליכוד)"],
  ["mishraki", "יונתן משריקי"],
  ["yoram-cohen", "יורם כהן"],
  ["altschuler", "עדי אלטשולר"],
  ["meridor", "שאול מרידור"],
  ["rayten", "Efrat Rayten"],
  ["radman", "משה רדמן"],
  ["fink", "Yaya Fink"],
  ["tibon", "נועם תיבון"],
  ["turner", "קרן טרנר"],
  ["bloch", "עליזה בלוך"],
  ["segalovitz", "יואב סגלוביץ"],
  ["khatib-yasin", "Iman Khatib-Yassin"],
  ["tzvika-mor", "צביקה מור"],
  ["hujeirat", "יאסר חוג'יראת"],
  ["mufid-mari", "מופיד מרעי"],
  ["avisar", "לירן אבישר בן-חורין"],
  ["shalev", "יונתן שלו"],
  ["ifergan", "תאיר איפרגן"],
  ["ben-shitrit", "רפי בן שטרית"],
  ["gani-gonen", "אושרת גני גונן"],
  ["alhwashla", "ואליד אלהואשלה"],
];

const COMMON_LAST = new Set([
  "כהן",
  "לוי",
  "אליהו",
  "מור",
  "אוחנה",
  "כץ",
  "כ״ץ",
  "כ'ץ",
  "בן",
  "טל",
  "אבו",
  "מסרי",
  "עזאם",
  "גולדברג",
  "רוזנטל",
]);

const REJECT = {
  "talik-gvili": [/ישראל\s*טל/, /israel\s*tal/i, /טל ישראל/],
  "tzachi-eliyahu": [/עמיחי/, /amihai|amichai/i],
  "david-ohana": [/אמיר אוחנה/, /amir ohana/i],
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tokens(name) {
  return name.split(/[\s־׳'ʼ\-]+/).filter((t) => t.length >= 2);
}

function lastOf(name) {
  return tokens(name).at(-1) ?? name;
}

function firstOf(name) {
  return tokens(name)[0] ?? name;
}

async function wiki(lang, params, attempt = 0) {
  const host = lang === "en" ? "https://en.wikipedia.org/w/api.php" : "https://he.wikipedia.org/w/api.php";
  const url = new URL(host);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 429 && attempt < 6) {
    const wait = Number(res.headers.get("retry-after") ?? 12) * 1000;
    console.log("429", lang, "wait", wait, "ms");
    await sleep(wait);
    return wiki(lang, params, attempt + 1);
  }
  if (!res.ok) throw new Error(`${lang} ${res.status}`);
  return res.json();
}

async function pageimage(lang, title) {
  const data = await wiki(lang, {
    prop: "pageimages|info",
    inprop: "url",
    pithumbsize: 250,
    pilicense: "any",
    redirects: 1,
    titles: title,
  });
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing || page.invalid || !page.thumbnail?.source) return null;
  return {
    title: page.title,
    url: page.thumbnail.source,
    source: page.fullurl ?? `${lang === "en" ? "https://en.wikipedia.org/wiki/" : "https://he.wikipedia.org/wiki/"}${encodeURIComponent(page.title)}`,
  };
}

async function search(lang, query) {
  const data = await wiki(lang, {
    list: "search",
    srsearch: query,
    srnamespace: 0,
    srlimit: 8,
    srprop: "snippet|title",
  });
  return data.query?.search ?? [];
}

function blocked(id, title) {
  return (REJECT[id] ?? []).some((re) => re.test(title));
}

function titleMatches(person, title) {
  const lastHe = lastOf(person.nameHe);
  const lastEn = lastOf(person.nameEn);
  const firstHe = firstOf(person.nameHe);
  const firstEn = firstOf(person.nameEn);
  const hay = title;
  const hasLast = hay.includes(lastHe) || new RegExp(lastEn, "i").test(hay);
  if (!hasLast) return false;
  if (COMMON_LAST.has(lastHe) || COMMON_LAST.has(lastEn.toLowerCase())) {
    return hay.includes(firstHe) || new RegExp(firstEn, "i").test(hay);
  }
  return true;
}

function parseExisting(source) {
  const match = source.match(/export const PORTRAITS[\s\S]*?=\s*(\{[\s\S]*?\});\n/);
  if (!match) throw new Error("Could not parse existing PORTRAITS");
  return JSON.parse(match[1]);
}

function parseSeeds(source) {
  const rows = [];
  const re =
    /\{\s*id:\s*"([^"]+)",\s*nameEn:\s*"([^"]+)",\s*nameHe:\s*"([^"]+)"/g;
  for (const match of source.matchAll(re)) {
    rows.push({ id: match[1], nameEn: match[2], nameHe: match[3] });
  }
  return rows;
}

const portraitsSource = await readFile(PORTRAIT_PATH, "utf8");
const poolSource = await readFile(POOL_PATH, "utf8");
const found = parseExisting(portraitsSource);
const people = parseSeeds(poolSource);
const stillMissing = [];

for (const [id, title] of EXACT) {
  if (found[id]) {
    console.log("have", id);
    continue;
  }
  try {
    const lang = /[A-Za-z]/.test(title[0]) ? "en" : "he";
    const hit = await pageimage(lang, title);
    if (!hit) {
      console.log("skip-exact", id);
      stillMissing.push(id);
    } else {
      found[id] = { url: hit.url, source: hit.source };
      console.log("ok-exact", id, hit.source);
    }
    await sleep(900);
  } catch (err) {
    console.log("err-exact", id, err.message);
    stillMissing.push(id);
    await sleep(3000);
  }
}

const missingPeople = people.filter((p) => !found[p.id]);
console.log("fuzzy-candidates", missingPeople.map((p) => p.id).join(", ") || "none");

for (const person of missingPeople) {
  const queries = [
    { lang: "he", q: person.nameHe },
    { lang: "he", q: `${person.nameHe} כנסת` },
    { lang: "en", q: `${person.nameEn} Israel` },
  ];
  let accepted = null;
  for (const query of queries) {
    if (accepted) break;
    try {
      const hits = await search(query.lang, query.q);
      await sleep(700);
      for (const hit of hits) {
        if (blocked(person.id, hit.title)) {
          console.log("reject-block", person.id, hit.title);
          continue;
        }
        if (!titleMatches(person, hit.title)) {
          console.log("reject-name", person.id, hit.title);
          continue;
        }
        const page = await pageimage(query.lang, hit.title);
        await sleep(700);
        if (!page) {
          console.log("no-thumb", person.id, hit.title);
          continue;
        }
        if (blocked(person.id, page.title) || !titleMatches(person, page.title)) {
          console.log("reject-redirect", person.id, page.title);
          continue;
        }
        accepted = page;
        break;
      }
    } catch (err) {
      console.log("err-fuzzy", person.id, query.q, err.message);
      await sleep(2500);
    }
  }
  if (accepted) {
    found[person.id] = { url: accepted.url, source: accepted.source };
    console.log("ok-fuzzy", person.id, accepted.title, accepted.source);
  } else {
    stillMissing.push(person.id);
    console.log("skip-fuzzy", person.id);
  }
}

const ordered = {};
for (const key of Object.keys(found).sort()) ordered[key] = found[key];

const helpers = portraitsSource.split("export function portraitUrl")[1];
if (!helpers) throw new Error("Could not keep portrait helpers");
const head = portraitsSource.split("export const PORTRAITS")[0];
const body = `${head}export const PORTRAITS: Partial<Record<PersonId, { url: string; source: string }>> = ${JSON.stringify(ordered, null, 2)};

export function portraitUrl${helpers}`;

await writeFile(PORTRAIT_PATH, body);
console.log("wrote", Object.keys(ordered).length, "portraits; still missing", stillMissing.join(", ") || "none");
