import { MatchEntity } from "@skorify/domain/match";
import { DataSource } from "./data-source.interface";
import { DBClient, Match } from "skorifydata";

export class PostgresMatchDataSource implements DataSource<MatchEntity> {
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
      id: dbMatch.id as any, // TypeORM uses string, domain uses UUID template
      homeTeamId: dbMatch.home_team_id,
      awayTeamId: dbMatch.away_team_id,
      tournamentId: dbMatch.tournament_id,
      kickOff: dbMatch.kick_off || new Date(), // Ensure kick_off is always defined
      homeGoals: dbMatch.home_goals,
      awayGoals: dbMatch.away_goals,
      status: dbMatch.status,
      stage: dbMatch.stage,
      venue: dbMatch.venue,
      createdAt: dbMatch.created_at,
      updatedAt: dbMatch.updated_at,
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
      home_goals: entity.homeGoals,
      away_goals: entity.awayGoals,
      status: entity.status,
      stage: entity.stage,
      venue: entity.venue,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}
