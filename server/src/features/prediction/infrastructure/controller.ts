import { IracaController } from "@scifamek-open-source/iraca/web-api";

export class PredictionController extends IracaController {
  configureEndpoints(): void {
    this.configureEndpointsByPattern(/[\w]+Usecase$/, {
      methodMapper: [
        {
          method: "get",
          patterns: [/[\w]+/],
        },
      ],
    });
  }
}
