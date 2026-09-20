import { getPerson } from "../data/pool";
import { portraitSrc } from "../data/portraits";
import { pairRelation, relationColor } from "../systems/chemistry";
import type { ElectionResult } from "../systems/resolve";
import { DEMAND_SCALE } from "../systems/scores";
import { KNESSET_SEATS } from "../systems/seats";
import { copy } from "./copy";
import { el } from "./dom";
import { polygonLayout, polygonPoints } from "./tree";

const GRAPH_CX = 210;
const GRAPH_CY = 200;

export interface ShareCaption {
  title: string;
  text: string;
  url: string;
}

export async function makeResultCard(opts: {
  result: ElectionResult;
  playerName: string;
  kind: "square" | "story";
}): Promise<Blob> {
  const player = opts.result.lists.find((row) => row.list.isPlayer);
  const rival = [...opts.result.lists].filter((row) => !row.list.isPlayer).sort((a, b) => b.seats - a.seats)[0];
  const won = opts.result.winnerId === "player";
  const w = 1080;
  const h = opts.kind === "story" ? 1920 : 1080;
  const cardH = opts.kind === "story" ? 700 : 400;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#191817";
  ctx.fillRect(0, 0, w, h);
  drawYellowCard(ctx, {
    x: 40,
    y: 40,
    w: w - 80,
    h: cardH,
    party: player?.list.labelHe ?? copy.yourParty,
    seats: player?.seats ?? 0,
    rivalSeats: rival?.seats ?? 0,
    won,
    names: player?.list.picks.map((id) => getPerson(id).nameHe).join(" · ") ?? "",
    cohesion: player ? Math.round(player.cohesion * 100) : 0,
    demand: player ? Math.round(Math.min(100, (player.massAfterSplit / DEMAND_SCALE) * 100)) : 0,
  });
  await drawGraph(ctx, {
    x: 40,
    y: cardH + 64,
    w: w - 80,
    h: h - cardH - 104,
    picks: player?.list.picks ?? [],
  });
  return await canvasToPng(canvas);
}

export function shareCaption(seats: number, party: string, url: string): ShareCaption {
  return {
    title: `${copy.title} · ${seats} ${copy.seats}`,
    text: `${copy.shareBoast(seats, party)} ${url}`,
    url,
  };
}

/** Stretch the constellation to the share rect instead of leaving a 420-viewBox postage stamp. */
export function fitShareGraph(
  box: { x: number; y: number; w: number; h: number },
  count: number,
): Array<{ x: number; y: number }> {
  const pad = 78;
  if (count <= 1) return [{ x: box.x + box.w / 2, y: box.y + box.h / 2 }];
  const layout = polygonLayout(count);
  const points = polygonPoints(count, layout.radius);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const spanX = Math.max(Math.max(...xs) - Math.min(...xs), layout.radius * 2, 80);
  const spanY = Math.max(Math.max(...ys) - Math.min(...ys), layout.radius * 2, 80);
  const scale = Math.min((box.w - pad * 2) / spanX, (box.h - pad * 2) / spanY);
  return points.map((p) => ({
    x: box.x + box.w / 2 + (p.x - GRAPH_CX) * scale,
    y: box.y + box.h / 2 + (p.y - GRAPH_CY) * scale,
  }));
}

function drawYellowCard(
  ctx: CanvasRenderingContext2D,
  box: {
    x: number;
    y: number;
    w: number;
    h: number;
    party: string;
    seats: number;
    rivalSeats: number;
    won: boolean;
    names: string;
    cohesion: number;
    demand: number;
  },
): void {
  roundRect(ctx, box.x, box.y, box.w, box.h, 36);
  ctx.fillStyle = "#f4d53b";
  ctx.fill();
  ctx.fillStyle = "#191817";
  ctx.textAlign = "right";
  ctx.direction = "rtl";
  ctx.font = "800 42px Rubik, Arial Hebrew, sans-serif";
  ctx.fillText(box.won ? copy.win : copy.loss, box.x + box.w - 48, box.y + 58);
  ctx.font = "800 48px Rubik, Arial Hebrew, sans-serif";
  ctx.fillText(box.party, box.x + box.w - 48, box.y + 112);
  ctx.font = "700 24px Rubik, Arial Hebrew, sans-serif";
  ctx.fillText(copy.yourParty, box.x + box.w - 48, box.y + 146);
  ctx.textAlign = "left";
  ctx.direction = "ltr";
  ctx.font = "800 84px Rubik, sans-serif";
  const seatLabel = `${box.seats}`;
  const seatW = ctx.measureText(seatLabel).width;
  ctx.fillText(seatLabel, box.x + 48, box.y + 168);
  ctx.font = "700 26px Rubik, Arial Hebrew, sans-serif";
  ctx.fillText(`${copy.seats}  ·  ${box.seats}–${box.rivalSeats}`, box.x + 48 + seatW + 20, box.y + 158);
  drawBar(ctx, box.x + 48, box.y + 188, box.w - 96, (box.seats / KNESSET_SEATS) * 100);
  ctx.fillStyle = "#191817";
  ctx.textAlign = "right";
  ctx.direction = "rtl";
  ctx.font = "500 24px Assistant, Arial Hebrew, sans-serif";
  wrapText(ctx, box.names, box.x + box.w - 48, box.y + 250, box.w - 96, 32);
  ctx.font = "600 22px Rubik, Arial Hebrew, sans-serif";
  ctx.fillText(`${copy.demand}  ${box.demand}`, box.x + box.w / 2 + 20, box.y + box.h - 70);
  ctx.fillText(`${copy.credibility}  ${box.cohesion}`, box.x + box.w - 48, box.y + box.h - 70);
  drawBar(ctx, box.x + 48, box.y + box.h - 50, (box.w - 120) / 2, box.demand);
  drawBar(ctx, box.x + box.w / 2 + 12, box.y + box.h - 50, (box.w - 120) / 2, box.cohesion);
}

async function drawGraph(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number; picks: string[] },
): Promise<void> {
  ctx.fillStyle = "#12151c";
  ctx.fillRect(box.x, box.y, box.w, box.h);
  const ids = box.picks;
  if (ids.length === 0) return;
  const mapped = fitShareGraph(box, ids.length);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const rel = pairRelation(ids[i]!, ids[j]!);
      const a = mapped[i]!;
      const b = mapped[j]!;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = relationColor(rel.s);
      ctx.lineWidth = rel.s < 0 ? 4 : 2;
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  const faces = await Promise.all(ids.map((id) => loadFace(portraitSrc(id))));
  const r = 28;
  mapped.forEach((p, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const img = faces[i];
    if (img) ctx.drawImage(img, p.x - r, p.y - r, r * 2, r * 2);
    else {
      ctx.fillStyle = "#2a2618";
      ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = i === 0 ? "#c6a15b" : "#191817";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ede9e0";
    ctx.font = "600 18px Rubik, Arial Hebrew, sans-serif";
    ctx.textAlign = "center";
    ctx.direction = "rtl";
    ctx.fillText(getPerson(ids[i]!).nameHe, p.x, p.y + r + 22);
  });
}

function drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, pct: number): void {
  ctx.fillStyle = "rgba(25, 24, 23, 0.16)";
  roundRect(ctx, x, y, w, 14, 7);
  ctx.fill();
  ctx.fillStyle = "rgba(25, 24, 23, 0.45)";
  roundRect(ctx, x, y, Math.max(10, (w * Math.min(100, pct)) / 100), 14, 7);
  ctx.fill();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lineH: number): void {
  const words = text.split(" · ");
  let line = "";
  let row = 0;
  for (const word of words) {
    const next = line ? `${line} · ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      ctx.fillText(line, x, y + row * lineH);
      line = word;
      row += 1;
      if (row > 1) break;
    } else line = next;
  }
  if (row <= 1) ctx.fillText(line, x, y + row * lineH);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadFace(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function canShareFiles(file: File): boolean {
  try {
    return typeof navigator.share === "function" && Boolean(navigator.canShare?.({ files: [file] }));
  } catch {
    return false;
  }
}

export function downloadBlob(blob: Blob, name: string): void {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 800);
}

export function cardFile(blob: Blob, kind: "square" | "story"): File {
  return new File([blob], kind === "story" ? "harshima-story.png" : "harshima.png", { type: "image/png" });
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

export async function copyShareImage(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") return false;
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export function openHref(href: string): void {
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
}

export function openWhatsAppText(text: string): void {
  openHref(whatsAppHref(text));
}

export function openInstagramStory(): void {
  openHref(instagramStoryHref());
}

export function whatsAppHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function instagramStoryHref(): string {
  return /iPhone|iPad|Android/i.test(navigator.userAgent)
    ? "instagram://story-camera"
    : "https://www.instagram.com/";
}

interface PreparedShare {
  file: File;
  blob: Blob;
  caption: ShareCaption;
}

const shareCache = new Map<string, PreparedShare>();

function shareCacheKey(channel: "whatsapp" | "instagram", result: ElectionResult, url: string): string {
  const player = result.lists.find((row) => row.list.isPlayer);
  return [channel, result.winnerId, player?.seats ?? 0, player?.list.picks.join(","), url].join("|");
}

/** Klafi share: native sheet with the PNG, else save + copy + preview dialog. */
export async function sharePreparedCard(opts: {
  channel: "whatsapp" | "instagram";
  result: ElectionResult;
  playerName: string;
  url: string;
  button: HTMLButtonElement;
}): Promise<void> {
  const markup = opts.button.innerHTML;
  const key = shareCacheKey(opts.channel, opts.result, opts.url);
  const cached = shareCache.get(key);
  if (cached) {
    await launchPreparedShare(opts.channel, cached);
    return;
  }
  opts.button.disabled = true;
  opts.button.setAttribute("aria-busy", "true");
  try {
    const kind = opts.channel === "instagram" ? "story" : "square";
    const blob = await makeResultCard({ result: opts.result, playerName: opts.playerName, kind });
    const file = cardFile(blob, kind);
    const player = opts.result.lists.find((row) => row.list.isPlayer);
    const caption = shareCaption(player?.seats ?? 0, player?.list.labelHe ?? copy.yourParty, opts.url);
    const prepared = { file, blob, caption };
    shareCache.set(key, prepared);
    await launchPreparedShare(opts.channel, prepared);
  } catch (error) {
    if (!(error instanceof Error && error.name === "AbortError")) showShareToast(copy.shareFail);
  } finally {
    opts.button.disabled = false;
    opts.button.removeAttribute("aria-busy");
    opts.button.innerHTML = markup;
  }
}

async function launchPreparedShare(channel: "whatsapp" | "instagram", prepared: PreparedShare): Promise<void> {
  const { file, blob, caption } = prepared;
  if (canShareFiles(file)) {
    try {
      await navigator.share({ title: caption.title, text: caption.text, files: [file] });
      showShareToast(channel === "instagram" ? copy.shareReadyIg : copy.shareReadyWa);
      return;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    }
  }
  downloadBlob(blob, file.name);
  await copyText(channel === "instagram" ? caption.url : caption.text);
  await copyShareImage(blob);
  openShareSheet({ channel, blob, file, ...caption });
  showShareToast(channel === "instagram" ? copy.shareToastIg : copy.shareToastWa);
}

export function klafiShareButtons(): { wa: HTMLButtonElement; ig: HTMLButtonElement } {
  return {
    wa: iconButton("whatsapp", copy.shareWhatsApp, KLAFI_WA_ICON),
    ig: iconButton("instagram", copy.shareInstagram, KLAFI_IG_ICON),
  };
}

function iconButton(kind: string, label: string, svg: string): HTMLButtonElement {
  const btn = el("button", { type: "button", class: "share-icon-button", "aria-label": label, "data-share": kind });
  btn.insertAdjacentHTML("afterbegin", svg);
  btn.append(el("span", {}, label));
  return btn;
}

function openShareSheet(opts: {
  channel: "whatsapp" | "instagram";
  blob: Blob;
  file: File;
  title: string;
  text: string;
  url: string;
}): void {
  document.querySelector(".klafi-share-sheet")?.remove();
  const preview = URL.createObjectURL(opts.blob);
  const dialog = el("dialog", { class: "klafi-share-sheet share-sheet", "aria-labelledby": "share-sheet-title" });
  const close = el("button", { type: "button", class: "dialog-close", "aria-label": "סגירת השיתוף" }, "×");
  const send = el(
    "a",
    {
      class: "primary share-sheet-send",
      href: opts.channel === "instagram" ? instagramStoryHref() : whatsAppHref(opts.text),
      target: "_blank",
      rel: "noopener noreferrer",
    },
    opts.channel === "instagram" ? copy.shareOpenIg : copy.shareOpenWa,
  );
  const save = el("button", { type: "button", class: "share-btn share-sheet-save" }, copy.shareSave);
  const caption = el("p", { class: "share-sheet-caption" });
  const lines = opts.text.split("\n").map((line) => line.trim()).filter(Boolean);
  const urlLine = lines.find((line) => /^https?:\/\//.test(line)) ?? opts.url;
  for (const line of lines.filter((line) => line !== urlLine)) {
    caption.append(document.createTextNode(`${line}\n`));
  }
  caption.append(el("span", { dir: "ltr" }, urlLine));
  const img = el("img", { id: "share-sheet-image", alt: "תמונת השיתוף", src: preview });
  close.addEventListener("click", () => {
    dialog.close();
    URL.revokeObjectURL(preview);
    dialog.remove();
  });
  send.addEventListener("click", async (event) => {
    const href = send.getAttribute("href") ?? "";
    if (canShareFiles(opts.file)) {
      event.preventDefault();
      try {
        await navigator.share({ title: opts.title, text: opts.text, files: [opts.file] });
        close.click();
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (href) openHref(href);
      }
    }
    if (opts.channel === "whatsapp") {
      void copyText(opts.text);
      showShareToast(copy.shareToastWaOpen);
      return;
    }
    void copyText(opts.url);
    showShareToast(copy.shareToastIgOpen);
  });
  save.addEventListener("click", () => downloadBlob(opts.blob, opts.file.name));
  dialog.append(
    close,
    el("p", { class: "eyebrow" }, copy.shareSheetTitle),
    el("h2", { id: "share-sheet-title" }, opts.channel === "instagram" ? copy.shareSheetIg : copy.shareSheetWa),
    img,
    caption,
    el("div", { class: "share-sheet-actions" }, send, save),
  );
  document.body.append(dialog);
  dialog.showModal();
}

function showShareToast(text: string): void {
  document.querySelector(".share-toast")?.remove();
  const toast = el("p", { class: "share-toast", role: "status" }, text);
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("png"))), "image/png");
  });
}

/** Exact Klafi card-dialog share icons. */
export const KLAFI_WA_ICON =
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.7 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 0 1 7 12.5l-.3.4.5 1.8-1.9-.5-.4.2A8.2 8.2 0 1 1 12 3.8zm4.6 10.6c-.2-.1-1.3-.6-1.5-.7s-.3-.1-.5.1-.6.7-.7.8-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.4.1-.3c0-.1 0-.3 0-.4s-.5-1.2-.7-1.6-.3-.4-.5-.4h-.4c-.1 0-.4.1-.6.3s-.8.8-.8 1.9.8 2.2.9 2.3 1.6 2.5 3.9 3.4a13 13 0 0 0 1.3.5 3.1 3.1 0 0 0 1.4.1c.4-.1 1.3-.5 1.5-1.1s.2-1 .1-1.1-.2-.2-.4-.3z"/></svg>`;

export const KLAFI_IG_ICON =
  `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.1" cy="6.9" r="1.15" fill="currentColor"/></svg>`;
