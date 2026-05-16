import { RunIracaConfig } from "@scifamek-open-source/iraca/web-api";
import { IncomingMessage, ServerResponse } from "node:http";

export const middleware: RunIracaConfig["enabledHandler"] = (
  usecaseId: string,
) => {
  return async (request: IncomingMessage, response: ServerResponse) => {
    void response;
    return usecaseId != null && request.url != null;
  };
};
