/**
 * Pull Wikipedia thumbnails for known exact titles only.
 * No search — a fuzzy hit can attach the wrong face.
 * Identity art, not electability.
 */
import { readFile, writeFile } from "node:fs/promises";

const UA = "ListDraft/0.1 (local educational prototype; not a forecast)";
const PORTRAIT_PATH = new URL("../src/data/portraits.ts", import.meta.url);

/** Exact Hebrew Wikipedia titles only. */
const EXACT = [
  ["israel-katz", "ישראל כץ (הליכוד)"],
  ["mishraki", "יונתן משריקי"],
  ["yoram-cohen", "יורם כהן"],
  ["altschuler", "עדי אלטשולר"],
  ["meridor", "שאול מרידור"],
  ["rayten", "עפרת רייטן"],
  ["radman", "משה רדמן"],
  ["fink", "יאיה פינק"],
  ["tibon", "נועם תיבון"],
  ["turner", "קרן טרנר"],
  ["bloch", "עליזה בלוך"],
  ["segalovitz", "יואב סגלוביץ"],
  ["khatib-yasin", "אימאן חטיב-יאסין"],
  ["tzvika-mor", "צביקה מור"],
  ["hujeirat", "יאסר חוג'יראת"],
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function wiki(params, attempt = 0) {
  const url = new URL("https://he.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 429 && attempt < 6) {
    const wait = Number(res.headers.get("retry-after") ?? 12) * 1000;
    console.log("429, wait", wait, "ms");
    await sleep(wait);
    return wiki(params, attempt + 1);
  }
  if (!res.ok) throw new Error(`he ${res.status}`);
  return res.json();
}

async function pageimage(title) {
  const data = await wiki({
    prop: "pageimages|info",
    inprop: "url",
    pithumbsize: 250,
    pilicense: "any",
    redirects: 1,
    titles: title,
  });
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing || page.invalid || !page.thumbnail?.source) return null;
  if (page.title && page.title !== title) {
    console.log("redirect", title, "->", page.title);
  }
  return {
    url: page.thumbnail.source,
    source: page.fullurl ?? `https://he.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

function parseExisting(source) {
  const match = source.match(/export const PORTRAITS[\s\S]*?=\s*(\{[\s\S]*?\});\n/);
  if (!match) throw new Error("Could not parse existing PORTRAITS");
  return JSON.parse(match[1]);
}

const source = await readFile(PORTRAIT_PATH, "utf8");
const found = parseExisting(source);
const stillMissing = [];

for (const [id, title] of EXACT) {
  if (found[id]) {
    console.log("have", id);
    continue;
  }
  try {
    const hit = await pageimage(title);
    if (!hit) {
      console.log("skip", id);
      stillMissing.push(id);
    } else {
      found[id] = hit;
      console.log("ok", id, hit.source);
    }
    await sleep(1200);
  } catch (err) {
    console.log("err", id, err.message);
    stillMissing.push(id);
    await sleep(4000);
  }
}

const ordered = {};
for (const key of Object.keys(found).sort()) ordered[key] = found[key];

const helpers = source.split("export function portraitUrl")[1];
if (!helpers) throw new Error("Could not keep portrait helpers");
const head = source.split("export const PORTRAITS")[0];
const body = `${head}export const PORTRAITS: Partial<Record<PersonId, { url: string; source: string }>> = ${JSON.stringify(ordered, null, 2)};

export function portraitUrl${helpers}`;

await writeFile(PORTRAIT_PATH, body);
console.log("wrote", Object.keys(ordered).length, "portraits; still missing exact", stillMissing.join(", ") || "none");
