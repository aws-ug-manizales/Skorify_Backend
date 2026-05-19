import { DomainEvent } from "@skorify/domain/core";
import { EditTeamParam, EditTeamUsecase } from "@skorify/domain/team";

export class EditTeamUsecaseImpl extends EditTeamUsecase{
    call(param: EditTeamParam): Promise<DomainEvent> {
        throw new Error("Method not implemented.");
    }

}