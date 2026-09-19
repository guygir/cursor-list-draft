import { getPerson } from "../data/pool";
import type { ElectionResult } from "../systems/resolve";
import { copy } from "./copy";

export interface SharePayload {
  blob: Blob;
  file: File;
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

export function shareCaption(seats: number, party: string, url: string): { title: string; text: string; url: string } {
  return {
    title: `${copy.title} · ${seats} ${copy.seats}`,
    text: `${party}: ${seats} ${copy.seats}. ${copy.winBySeats}\n${url}`,
    url,
  };
}

export function canShareFiles(file: File): boolean {
  return Boolean(navigator.share && navigator.canShare?.({ files: [file] }));
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

export async function shareFilesOrDownload(opts: {
  blob: Blob;
  kind: "square" | "story";
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "saved"> {
  const file = cardFile(opts.blob, opts.kind);
  if (canShareFiles(file)) {
    try {
      await navigator.share({ files: [file], title: opts.title, text: opts.text });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "shared";
    }
  }
  downloadBlob(opts.blob, file.name);
  return "saved";
}

export function whatsAppHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function instagramStoryHref(): string {
  return "instagram://story-camera";
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("png"))), "image/png");
  });
}
