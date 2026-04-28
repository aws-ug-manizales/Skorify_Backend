import { Entity, Id } from "../../core/entity";

export class CompetitionInstanceEntity extends Entity {
  competitionId: Id;

  private constructor(id: Id, competitionId: Id) {
    super(id);
    this.competitionId = competitionId;
  }

  build(params: { competitionId: Id }): CompetitionInstanceEntity {
    return new CompetitionInstanceEntity(this.id, params.competitionId);
  }
}
