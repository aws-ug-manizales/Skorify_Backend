import { MatchContract, MatchEntity } from "@skorify/domain/match";

const match = new MatchEntity(
  "3feb69ea-d146-4964-a007-233eb36dac82",
  "Colombia",
  "Portugal",
  new Date()
);
export class MatchInMemoryRepository extends MatchContract {
  matches: MatchEntity[] = [
    match
  ];
  constructor() {
    super();
  }

  async getById(id: string): Promise<MatchEntity | null> {
    const response = this.matches.find((m) => m.id == id);

    if (!response) {
      return null;
    }
    return response;
  }
  save(match: MatchEntity): Promise<MatchEntity | null> {
    const matchExists = this.matches.find((m) => m.id == match.id);
    if (matchExists) {
      return Promise.resolve(matchExists);
    }
    this.matches.push(match);
    return Promise.resolve(match);
  }
}
