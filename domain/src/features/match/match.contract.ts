import { BaseContract } from "../../core";
import { MatchEntity } from "./match.entity";

export abstract class MatchContract extends BaseContract<MatchEntity> {
  abstract getById(id: string): Promise<MatchEntity | null>;
  abstract save(entity: MatchEntity): Promise<MatchEntity | null>;
  abstract deleteById(id: string): Promise<MatchEntity | null>;
  abstract modifyById(id: string, entity: MatchEntity): Promise<MatchEntity | null>;
  abstract getAll(): Promise<MatchEntity[]>;
  abstract getByIDs(ids: string[]): Promise<MatchEntity[]>;
  //abstract filter(filters: any): Promise<MatchEntity[]>;
}
