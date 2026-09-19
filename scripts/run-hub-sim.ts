import { publishedHubs } from "../src/systems/modes";
import { nearestNeighborhood } from "../src/systems/demand";
import { formatHubGrid, runHubGrid } from "../src/systems/hub-sim";

const seeds = Number(process.env.HUB_SIM_SEEDS ?? 16);
console.log("leader hills (toy nearest neighborhood)");
for (const hub of publishedHubs()) {
  const hill = nearestNeighborhood(hub.cell);
  console.log(`  ${hub.nameHe}\t${hub.slateId}\t${hill.id}\t${hill.labelHe}\t(${hub.cell.x.toFixed(2)},${hub.cell.y.toFixed(2)})\tM=${hill.mass}`);
}
console.log("");
const rows = runHubGrid({ seeds });
console.log(`seeds=${seeds}`);
console.log(formatHubGrid(rows));
console.log("");
for (const row of [...rows].sort((a, b) => b.avgSeats - a.avgSeats)) {
  console.log(`# ${row.hubHe} · ${row.partyHe} · avg ${row.avgSeats.toFixed(1)} · win ${(row.winRate * 100).toFixed(0)}%`);
}
