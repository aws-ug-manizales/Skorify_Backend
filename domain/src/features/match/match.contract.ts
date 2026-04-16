import { MatchEntity } from "./match.entity";
import { BaseContract } from "../../core";

export abstract class MatchContract extends BaseContract<MatchEntity> {
    abstract getById(id: string): Promise<MatchEntity | null>;
    abstract save(match: MatchEntity): Promise<MatchEntity | null>;
}