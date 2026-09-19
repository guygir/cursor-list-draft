import { formatHubGrid, runHubGrid } from "../src/systems/hub-sim";

const rows = runHubGrid();
console.log(formatHubGrid(rows));
console.log("");
for (const row of [...rows].sort((a, b) => b.avgSeats - a.avgSeats)) {
  console.log(`# ${row.hubHe} · ${row.partyHe} · avg ${row.avgSeats.toFixed(1)} · win ${(row.winRate * 100).toFixed(0)}%`);
  for (const cell of row.cells) {
    console.log(
      `  ${cell.difficulty} n=${cell.nCpus}: ${cell.playerSeats} seats ${cell.won ? "WIN" : "loss"} · coh ${(cell.cohesion * 100).toFixed(0)} · ${cell.neighborhoodHe} · rivals ${cell.rivalSeats.join("/")}`,
    );
  }
}
