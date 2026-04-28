import { MatchEntity, MatchStatus } from "@skorify/domain/match";
import { DataSource } from "./data-source.interface";
import { DBClient, Match } from "@skorify/data";
import { Id } from "@skorify/domain/core";

export class MatchPostgresDataSource implements DataSource<MatchEntity> {
  constructor(private dbClient: DBClient) {}

  async read(): Promise<MatchEntity[]> {
    const matches = await this.dbClient.matches.findAllActive();
    return matches.map(this.toDomain);
  }

  async write(data: MatchEntity[]): Promise<void> {
    // This implementation saves all entities
    for (const entity of data) {
      const dbMatch = this.toDatabase(entity);
      await this.dbClient.matches.create(dbMatch);
    }
  }

  // Convert from database Match to domain MatchEntity
  private toDomain(dbMatch: Match): MatchEntity {
    return MatchEntity.build({
      id: dbMatch.id as Id, // TypeORM uses string, domain uses UUID template
      homeTeamId: dbMatch.home_team_id as Id,
      awayTeamId: dbMatch.away_team_id as Id,
      tournamentId: dbMatch.tournament_id as Id,
      kickOff: dbMatch.kick_off || new Date(), // Ensure kick_off is always defined
      homeTeamScore:
        dbMatch.home_goals == null ? undefined : dbMatch.home_goals,
      awayTeamScore:
        dbMatch.away_goals == null ? undefined : dbMatch.away_goals,
      status: MatchStatus.InProgress,
      stage: dbMatch.stage,
      venue: dbMatch.venue,
      createdAt: dbMatch.created_at!,
      updatedAt: dbMatch.updated_at == null ? undefined : dbMatch.updated_at,
    });
  }

  // Convert from domain MatchEntity to database Match
  private toDatabase(entity: MatchEntity): Partial<Match> {
    return {
      id: entity.id,
      home_team_id: entity.homeTeamId,
      away_team_id: entity.awayTeamId,
      tournament_id: entity.tournamentId,
      kick_off: entity.kickOff,
      home_goals: entity.homeTeamScore,
      away_goals: entity.awayTeamScore,
      status: "in_progress",
      stage: entity.stage,
      venue: "entity.venue",
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}
