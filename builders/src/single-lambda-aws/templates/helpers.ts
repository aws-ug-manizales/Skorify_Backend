import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { DomainEvent } from "@skorify/domain/core";

const client = new LambdaClient({ region: "us-east-1" });
export type ConnectionConfig = {
  dependencyName: string;
  methodMapper: any;
};

export const responseMapper = (response: any) => {
  const body = response;
  const code = body["code"];
  const pureCode = code;
  const data = body["data"];
  return new DomainEvent(pureCode, data);
};

export function generate(config: ConnectionConfig) {
  const { dependencyName, methodMapper } = config;
  let methodToUse = "get";

  methodToUse = getMethodToUse(methodMapper, dependencyName, methodToUse);

  const c = class {};

  (c as any).prototype["call"] = async function (param: any) {
    const command = new InvokeCommand({
      FunctionName: `${dependencyName.replace("Usecase", "")}Lambda`,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify(param)),
    });

    const response = await client.send(command);

    const responsePayload = response.Payload
      ? JSON.parse(Buffer.from(response.Payload).toString())
      : null;

    const mapper = responseMapper;
    const t = mapper(responsePayload);
    return t;
  };

  return c;
}

export function getMethodToUse(
  methodMapper: any | undefined,
  identifier: string,
  methodToUse: any,
): any {
  if (methodMapper) {
    for (const posibleMethodConfiguration of methodMapper) {
      const { method, patterns } = posibleMethodConfiguration;
      let matched = false;
      let i = 0;
      while (!matched && i < patterns.length) {
        const insidePattern = patterns[i];
        matched = insidePattern.test(identifier);
        i++;
      }
      if (matched) {
        methodToUse = method;
        break;
      }
    }
  }
  return methodToUse;
}
