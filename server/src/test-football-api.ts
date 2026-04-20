/**
 * Script de prueba para la integración de Football Data API
 * Team: Gamers
 * 
 * Este script prueba la funcionalidad directamente sin necesidad de levantar el servidor
 */

import { FootballDataRepository } from "./features/match/infrastructure/match.football-data-repository";
import { GetFutureMatchesUsecaseImpl } from "./features/match/usecases/get-future-matches.usecase-impl";
import {
  FutureMatchesRetrievedDomainEvent,
  NoFutureMatchesFoundDomainEvent,
  InvalidDateProvidedDomainEvent,
  MatchEntity,
} from "@skorify/domain/match";

async function testFootballDataIntegration() {
  console.log("🚀 Iniciando prueba de Football Data API Integration\n");
  console.log("=".repeat(60));

  // 1. Configurar el repositorio con el token
  const API_TOKEN = "c917afa1702e4b2c9902076b4119e9ea";
  const repository = new FootballDataRepository(API_TOKEN);

  // 2. Crear el caso de uso
  const getFutureMatchesUsecase = new GetFutureMatchesUsecaseImpl(repository);

  // 3. Preparar la fecha actual en Colombia (GMT-5)
  const currentDate = new Date("2026-04-20T10:00:00-05:00");
  
  console.log("\n📅 Fecha de consulta (Colombia GMT-5):");
  console.log(`   ${currentDate.toISOString()}`);
  console.log(`   ${currentDate.toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);

  // 4. Ejecutar el caso de uso
  console.log("\n🔍 Buscando partidos futuros...\n");

  try {
    const result = await getFutureMatchesUsecase.call({
      currentDate,
      daysAhead: 7, // Próximos 7 días
      limit: 5, // Solo 5 partidos
    });

    // 5. Analizar el resultado
    console.log("=".repeat(60));
    console.log("📊 RESULTADO:\n");

    if (result.is<MatchEntity[]>(FutureMatchesRetrievedDomainEvent)) {
      const matches = result.payload;
      console.log(`✅ Se encontraron ${matches.length} partidos:\n`);

      matches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        console.log(`   📅 Fecha: ${new Date(match.utcDate).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);
        console.log(`   🏆 Competición: ${match.competition?.name || 'N/A'}`);
        console.log(`   📍 Estado: ${match.status}`);
        console.log(`   🆔 ID: ${match.id}`);
        console.log("");
      });

      // Mostrar ejemplo de estructura completa del primer partido
      if (matches.length > 0) {
        console.log("=".repeat(60));
        console.log("📋 Estructura completa del primer partido:\n");
        console.log(JSON.stringify(matches[0], null, 2));
      }

    } else if (result.is(NoFutureMatchesFoundDomainEvent)) {
      console.log("ℹ️  No se encontraron partidos futuros para la fecha especificada");

    } else if (result.is<string>(InvalidDateProvidedDomainEvent)) {
      console.log(`❌ Error: ${result.payload}`);
    }

  } catch (error) {
    console.error("\n❌ Error durante la ejecución:");
    console.error(error);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Prueba completada");
}

// Ejecutar la prueba
testFootballDataIntegration().catch(console.error);
