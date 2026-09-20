export const TIPS_COOKIE = "harshima_tips";
export const TIPS_STORAGE = "list-draft:tips";

export type TipsPref = "on" | "off";

export function tipsAllowed(): boolean {
  return readPref() !== "off";
}

export function disableTips(): void {
  writePref("off");
}

export function enableTips(): void {
  writePref("on");
}

export function resetTips(): void {
  try {
    document.cookie = `${TIPS_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  } catch {
    /* private mode */
  }
  try {
    localStorage.removeItem(TIPS_STORAGE);
  } catch {
    /* private mode */
  }
}

function readPref(): TipsPref {
  try {
    const cookie = readCookie(TIPS_COOKIE);
    if (cookie === "off" || cookie === "on") return cookie;
  } catch {
    /* cookies blocked */
  }
  try {
    const stored = localStorage.getItem(TIPS_STORAGE);
    if (stored === "off" || stored === "on") return stored;
  } catch {
    /* storage blocked */
  }
  return "on";
}

function writePref(value: TipsPref): void {
  try {
    document.cookie = `${TIPS_COOKIE}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax`;
  } catch {
    /* cookies blocked */
  }
  try {
    localStorage.setItem(TIPS_STORAGE, value);
  } catch {
    /* storage blocked */
  }
}

function readCookie(name: string): string | null {
  const parts = document.cookie.split(";").map((part) => part.trim());
  const hit = parts.find((part) => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}
