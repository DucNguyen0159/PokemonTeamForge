import process from "node:process";
import { spawnSync } from "node:child_process";

function runStep(label, script, args) {
  console.log(`\n${label}`);
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const args = process.argv.slice(2);

console.log("PokemonTeamForge data import");
runStep("1/2 Importing items", "scripts/import-item-data.mjs", args);
runStep("2/2 Importing Pokemon, abilities, and moves", "scripts/import-pokemon-data.mjs", args);
console.log("\nImport pipeline finished.");
