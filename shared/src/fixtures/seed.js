#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { teamsFixture } = require("./teams.fixture");
const { tournamentsFixture } = require("./tournaments.fixture");
const { matchesFixture } = require("./matches.fixture");

const DATA_DIR = path.join(__dirname, "../data");

/**
 * Script para generar archivos JSON de datos de prueba
 *
 * Uso:
 *   node seed.js         # Genera todos los archivos
 *   node seed.js --clean # Limpia y regenera
 *
 *   O desde package.json:
 *   pnpm run seed
 *   pnpm run seed:clean
 */

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created data directory: ${DATA_DIR}`);
  }
}

function writeJsonFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Generated ${filename} (${data.length} records)`);
}

function cleanDataDir() {
  if (fs.existsSync(DATA_DIR)) {
    const files = fs.readdirSync(DATA_DIR);
    files.forEach((file) => {
      if (file.endsWith(".json")) {
        fs.unlinkSync(path.join(DATA_DIR, file));
        console.log(`Removed ${file}`);
      }
    });
  }
}

function seedData() {
  console.log("Starting seed process...\n");

  ensureDataDir();

  // Generate all fixture files
  writeJsonFile("teams.json", teamsFixture);
  writeJsonFile("tournaments.json", tournamentsFixture);
  writeJsonFile("matches.json", matchesFixture);

  // Generate empty files for other entities
  writeJsonFile("users.json", []);
  writeJsonFile("predictions.json", []);
  writeJsonFile("tournament-intances.json", []);

  console.log("\nSeed completed successfully!");
  console.log(`Data files created in: ${DATA_DIR}`);
}

function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes("--clean");

  if (shouldClean) {
    console.log("Cleaning existing data...\n");
    cleanDataDir();
  }

  seedData();
}

main();
