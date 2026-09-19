import { publishedHubs } from "../src/systems/modes";
import { nearestNeighborhood } from "../src/systems/demand";
import { formatHubTablesByN, runHubGrid, type PlayerPolicy } from "../src/systems/hub-sim";

const seeds = Number(process.env.HUB_SIM_SEEDS ?? 16);
const policies: PlayerPolicy[] = ["noisy", "greedy"];

console.log("leader hills (toy nearest neighborhood)");
for (const hub of publishedHubs()) {
  const hill = nearestNeighborhood(hub.cell);
  console.log(`  ${hub.nameHe}\t${hub.slateId}\t${hill.id}\t${hill.labelHe}\t(${hub.cell.x.toFixed(2)},${hub.cell.y.toFixed(2)})\tM=${hill.mass}`);
}
console.log("");
console.log(`seeds=${seeds}`);
console.log("Previous blended table mixed N=1/2/3 and all difficulties.");
console.log("");

for (const playerPolicy of policies) {
  const rows = runHubGrid({ seeds, playerPolicy });
  const title =
    playerPolicy === "noisy"
      ? "Player + CPU both 35/25/15/25. Opening pick = published #1. Not a forecast."
      : "Player greedy (opt). CPU still 35/25/15/25. Opening pick = published #1. Not a forecast.";
  console.log(formatHubTablesByN(rows, title));
  console.log("");
}
