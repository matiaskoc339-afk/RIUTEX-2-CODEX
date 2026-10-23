const { spawnSync } = require("node:child_process");
for (const args of [
  [
    "--test",
    "tests/blue.test.js",
    "tests/horror.test.js",
    "tests/revision.test.js",
    "tests/presentation.test.js",
    "tests/adventure.test.js",
    "tests/fielddesk.test.js",
    "tests/survival.test.js",
    "tests/finale.test.js",
    "tests/works.test.js",
    "tests/depths.test.js",
    "tests/flamethrower.test.js",
    "tests/castle.test.js",
    "tests/endgame.test.js",
    "tests/polish.test.js",
    "tests/pov.test.js",
    "tests/experience.test.js",
  ],
  ["tests/t3.js"],
  ["tests/t4.js"],
  ["tests/t5.js"],
  ["tests/t6.js"],
]) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
