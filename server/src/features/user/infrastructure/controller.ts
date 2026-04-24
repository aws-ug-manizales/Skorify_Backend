import {
  IracaController,
  MassiveRegisterConfiguration,
} from "@scifamek-open-source/iraca/web-api";
import { generalMethodMapper } from "@skorify/domain/core";

export class UserController extends IracaController {
  configureEndpoints(): void {
    this.configureEndpointsByPattern(/[\w]+Usecase$/, {
      methodMapper:
        generalMethodMapper as MassiveRegisterConfiguration["methodMapper"],
    });
  }
}
