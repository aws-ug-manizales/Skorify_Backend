import { MatchEntity } from "./match.entity";

export abstract class MatchContract {
  abstract getById(id: string): Promise<MatchEntity | null>;
  abstract save(match: MatchEntity): Promise<MatchEntity | null>;
}
