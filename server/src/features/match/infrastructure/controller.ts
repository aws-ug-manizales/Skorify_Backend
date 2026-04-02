import { IracaController } from "@scifamek-open-source/iraca/web-api";

export class MatchController extends IracaController {
  configureEndpoints(): void {
    this.configureEndpointsByPattern(/[\w]+Usecase$/, {});
  }
}
