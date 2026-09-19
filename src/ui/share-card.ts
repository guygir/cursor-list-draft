import { getPerson } from "../data/pool";
import type { ElectionResult } from "../systems/resolve";
import { copy } from "./copy";
import { el } from "./dom";

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
  const won = opts.result.winnerId === "player";
  const w = 1080;
  const h = opts.kind === "story" ? 1920 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#191817";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#f4d53b";
  ctx.fillRect(0, 0, w, 18);
  ctx.fillStyle = "#ede9e0";
  ctx.textAlign = "center";
  ctx.font = "700 72px Rubik, Arial Hebrew, sans-serif";
  ctx.fillText(copy.title, w / 2, 160);
  ctx.fillStyle = "#f4d53b";
  ctx.font = "700 48px Rubik, Arial Hebrew, sans-serif";
  ctx.fillText(player?.list.labelHe ?? copy.yourParty, w / 2, 250);
  ctx.fillStyle = "#a8a291";
  ctx.font = "500 32px Assistant, Arial Hebrew, sans-serif";
  ctx.fillText(opts.playerName, w / 2, 310);
  const hub = player?.list.picks[0] ? getPerson(player.list.picks[0]).nameHe : "";
  if (hub) ctx.fillText(hub, w / 2, 360);
  ctx.fillStyle = "#f4d53b";
  ctx.font = "800 220px Rubik, sans-serif";
  ctx.fillText(String(player?.seats ?? 0), w / 2, h / 2 + 40);
  ctx.fillStyle = "#ede9e0";
  ctx.font = "700 48px Rubik, Arial Hebrew, sans-serif";
  ctx.fillText(copy.seats, w / 2, h / 2 + 110);
  ctx.fillStyle = won ? "#f4d53b" : "#c45a4e";
  ctx.font = "700 40px Rubik, Arial Hebrew, sans-serif";
  ctx.fillText(won ? copy.win : copy.loss, w / 2, h / 2 + 180);
  ctx.fillStyle = "#a8a291";
  ctx.font = "500 28px Assistant, Arial Hebrew, sans-serif";
  const why = opts.result.why.he.slice(0, 72);
  ctx.fillText(why, w / 2, h - 160);
  ctx.fillStyle = "#f4d53b";
  ctx.font = "600 26px Assistant, Arial Hebrew, sans-serif";
  ctx.fillText(copy.winBySeats, w / 2, h - 100);
  return await canvasToPng(canvas);
}

export function shareCaption(seats: number, party: string, url: string): ShareCaption {
  return {
    title: `${copy.title} · ${seats} ${copy.seats}`,
    text: `${party}: ${seats} ${copy.seats}. ${copy.winBySeats}\n${url}`,
    url,
  };
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

export function openWhatsAppText(text: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

export function openInstagramStory(): void {
  window.open("instagram://story-camera", "_blank", "noopener");
  window.setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.open("https://www.instagram.com/", "_blank", "noopener");
    }
  }, 700);
}

export function whatsAppHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function instagramStoryHref(): string {
  return "instagram://story-camera";
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
  opts.button.disabled = true;
  opts.button.setAttribute("aria-busy", "true");
  try {
    const kind = opts.channel === "instagram" ? "story" : "square";
    const blob = await makeResultCard({ result: opts.result, playerName: opts.playerName, kind });
    const file = cardFile(blob, kind);
    const player = opts.result.lists.find((row) => row.list.isPlayer);
    const caption = shareCaption(player?.seats ?? 0, player?.list.labelHe ?? copy.yourParty, opts.url);
    if (canShareFiles(file)) {
      try {
        await navigator.share({ title: caption.title, text: caption.text, files: [file] });
        showShareToast(opts.channel === "instagram" ? copy.shareReadyIg : copy.shareReadyWa);
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    downloadBlob(blob, file.name);
    await copyText(opts.channel === "instagram" ? caption.url : caption.text);
    await copyShareImage(blob);
    openShareSheet({ channel: opts.channel, blob, file, ...caption });
    showShareToast(opts.channel === "instagram" ? copy.shareToastIg : copy.shareToastWa);
  } catch (error) {
    if (!(error instanceof Error && error.name === "AbortError")) showShareToast(copy.shareFail);
  } finally {
    opts.button.disabled = false;
    opts.button.removeAttribute("aria-busy");
    opts.button.innerHTML = markup;
  }
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
    "button",
    { type: "button", class: "primary share-sheet-send" },
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
  send.addEventListener("click", async () => {
    if (canShareFiles(opts.file)) {
      try {
        await navigator.share({ title: opts.title, text: opts.text, files: [opts.file] });
        close.click();
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    if (opts.channel === "whatsapp") {
      await copyText(opts.text);
      openWhatsAppText(opts.text);
      showShareToast(copy.shareToastWaOpen);
      return;
    }
    await copyText(opts.url);
    openInstagramStory();
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
