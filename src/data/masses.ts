import type { Neighborhood } from "./types";

/** toy-demand: hand-set neighborhood masses, not election results. */
export const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: "bibi-right",
    labelHe: "ימין־נתניהו",
    labelEn: "Bibi-right",
    center: { x: 0.4, y: 0.88 },
    mass: 38,
  },
  {
    id: "hard-right",
    labelHe: "ימין קשה",
    labelEn: "Hard right / RZ-Otzma",
    center: { x: 0.58, y: 0.82 },
    mass: 14,
  },
  {
    id: "haredi",
    labelHe: "חרדי",
    labelEn: "Haredi",
    center: { x: 0.9, y: 0.75 },
    mass: 16,
  },
  {
    id: "change-camp",
    labelHe: "מחנה השינוי",
    labelEn: "Change-camp center",
    center: { x: 0.28, y: 0.22 },
    mass: 32,
  },
  {
    id: "left-democrats",
    labelHe: "שמאל־דמוקרטים",
    labelEn: "Left-Democrats",
    center: { x: 0.15, y: 0.15 },
    mass: 12,
  },
  {
    id: "arab",
    labelHe: "רשימות ערביות",
    labelEn: "Arab lists",
    center: { x: 0.5, y: 0.05 },
    mass: 10,
  },
  {
    id: "lieberman",
    labelHe: "חילוני־ימין (ליברמן)",
    labelEn: "Lieberman secular-right",
    center: { x: 0.1, y: 0.45 },
    mass: 8,
  },
];
