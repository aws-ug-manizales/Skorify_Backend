import { MatchEntity } from "@skorify/domain/match";
import { Id } from "libs/domain/core";
import { Match as MatchDbEntity} from "skorifydata";

export class MatchMapper {
  static toDomain(raw: MatchDbEntity): MatchEntity {
    return MatchEntity.build({
      id: raw.id as Id,
      localTeamId: raw.home_team_id,
      awayTeamId: raw.away_team_id,
      date: raw.kick_off || new Date(),
      // localTeamScore: raw.home_goals ?? 0,
      // awayTeamScore: raw.away_goals ?? 0,
    });
  }

  static toPersistence(entity: MatchEntity): Partial<MatchDbEntity> {
    return {
      id: entity.id,
      home_team_id: entity.localTeamId,
      away_team_id: entity.awayTeamId,
      home_goals: entity.localTeamScore,
      away_goals: entity.awayTeamScore,
      kick_off: entity.date,
    };
  }
}
