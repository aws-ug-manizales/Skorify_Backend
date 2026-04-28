import { MatchEntity } from "@skorify/domain/match";
import { MatchRepository } from "../src/repositories/match.repository";

async function testMatchRepository() {
  const repo = new MatchRepository();

  console.log("=== Testing MatchRepository ===\n");

  // 1. Crear un match
  const match1 = MatchEntity.build({
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    homeTeamId: "team-col-0001-aaaa-bbbb-cccccccccccc",
    awayTeamId: "team-bra-0002-dddd-eeee-ffffffffffff",
    date: new Date("2026-06-15T20:00:00Z"),
  });

  console.log("1. SAVE - Guardando match1...");
  const saved = await repo.save(match1);
  console.log("   Resultado:", saved);

  // 2. Crear otro match
  const match2 = MatchEntity.build({
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    homeTeamId: "team-arg-0003-ffff-gggg-hhhhhhhhhhhh",
    awayTeamId: "team-per-0004-iiii-jjjj-kkkkkkkkkkkk",
    date: new Date("2026-06-16T18:00:00Z"),
  });

  console.log("\n2. SAVE - Guardando match2...");
  await repo.save(match2);
  console.log("   Guardado!");

  // 3. Obtener por ID
  console.log("\n3. GET BY ID - Buscando a1b2c3d4-e5f6-7890-abcd-ef1234567890...");
  const found = await repo.getById("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
  console.log("   Resultado:", found);

  // 4. Obtener todos
  console.log("\n4. GET ALL - Obteniendo todos...");
  const all = await repo.getAll();
  console.log("   Total:", all.length);
  console.log("   Matches:", all);

  // 5. Obtener por IDs
  console.log("\n5. GET BY IDS - Buscando [a1b2c3d4-e5f6-7890-abcd-ef1234567890, b2c3d4e5-f6a7-8901-bcde-f12345678901]...");
  const multiple = await repo.getByIDs(["a1b2c3d4-e5f6-7890-abcd-ef1234567890", "b2c3d4e5-f6a7-8901-bcde-f12345678901"]);
  console.log("   Resultado:", multiple.length, "matches encontrados");

  // 6. Modificar
  console.log("\n6. MODIFY BY ID - Modificando a1b2c3d4-e5f6-7890-abcd-ef1234567890...");
  const modified = await repo.modifyById("a1b2c3d4-e5f6-7890-abcd-ef1234567890", {
    ...match1,
    homeTeamId: "team-colombia-updated",
  } as MatchEntity);
  console.log("   Resultado:", modified);

  // 7. Eliminar
  console.log("\n7. DELETE BY ID - Eliminando b2c3d4e5-f6a7-8901-bcde-f12345678901...");
  const deleted = await repo.deleteById("b2c3d4e5-f6a7-8901-bcde-f12345678901");
  console.log("   Eliminado:", deleted);

  // 8. Verificar estado final
  console.log("\n8. GET ALL - Estado final...");
  const final = await repo.getAll();
  console.log("   Total:", final.length);
  console.log("   Matches:", final);

  console.log("\n=== Tests completados ===");
}

testMatchRepository().catch(console.error);
