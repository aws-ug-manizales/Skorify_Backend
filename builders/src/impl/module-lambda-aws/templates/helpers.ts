import { LambdaClient } from '@aws-sdk/client-lambda';
import { IracaContainer } from '@scifamek-open-source/iraca/dependency-injection';
import { IracaHttpIntegrator } from '@scifamek-open-source/iraca/integrations';
import { DomainEvent } from '@skorify/domain/core';

const client = new LambdaClient({ region: 'us-east-1' });
export type ConnectionConfig = {
  dependencyName: string;
  methodMapper: any;
  module: string;
};

export const responseMapper = (response: any) => {
  console.log('Response ');
  console.log(response);

  const body = response;
  const code = body['meta']['code'];
  const fragments = code.split(':') ?? ['-', '-'];
  const pureCode = fragments[1];
  const data = body['data'];
  return new DomainEvent(pureCode, data);
};

// export function generate(config: ConnectionConfig) {
//   const { dependencyName, methodMapper } = config;
//   let methodToUse = "get";

//   methodToUse = getMethodToUse(methodMapper, dependencyName, methodToUse);

//   const c = class {};

//   (c as any).prototype["call"] = async function (param: any) {
//     const command = new InvokeCommand({
//       FunctionName: `Skorify-Backend-DEV-${dependencyName.replace("Usecase", "")}Lambda-Yvl4u2N8RXLQ`,
//       InvocationType: "RequestResponse",
//       Payload: Buffer.from(JSON.stringify(param)),
//     });

//     const response = await client.send(command);

//     const responsePayload = response.Payload
//       ? JSON.parse(Buffer.from(response.Payload).toString())
//       : null;

//     const mapper = responseMapper;
//     const t = mapper(responsePayload);
//     return t;
//   };

//   return c;
// }

export function generate(
  env: string,
  container: IracaContainer,
  config: ConnectionConfig,
  headers: any,
) {
  const { dependencyName, methodMapper, module } = config;

  // const keys = Object.keys(headers);

  // const copy = {} as any;
  // for (const key of keys) {
  //   if (!key.startsWith('CloudFront-')) {
  //     const value = headers[key];
  //     copy[key] = value;
  //   }
  // }

  // delete headers['host'];
  // delete headers['via'];
  // delete headers['x-amz-cf-id'];
  // delete headers['cloudfront-forwarded-proto'];
  // delete headers['cloudfront-is-desktop-viewer'];
  // delete headers['cloudfront-is-mobile-viewer'];
  // delete headers['cloudfront-is-tablet-viewer'];
  // delete headers['cloudfront-is-smarttv-viewer'];
  // delete headers['cloudfront-viewer-country'];
  // delete headers['cloudfront-viewer-asn'];

  const newHeaders = {
    Authorization: headers['Authorization'] ?? headers['authorization'] ?? '',
    'Content-Type': headers['Content-Type'] ?? headers['content-type'] ?? '',
  };
  console.log('Nuevos headers');
  console.log(newHeaders);

  const runtimeUrl =
    env == 'prod'
      ? 'https://api.skorify.cloud-manizales.com'
      : 'https://api.skorify-dev.cloud-manizales.com';
  IracaHttpIntegrator.generate(container, [
    {
      dependencyNames: [dependencyName],
      methodMapper,
      responseMapper,
      runtimeUrl,
      prefix: `${module}`,
      headers: newHeaders,
      kind: 'class',
    },
  ]);
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
