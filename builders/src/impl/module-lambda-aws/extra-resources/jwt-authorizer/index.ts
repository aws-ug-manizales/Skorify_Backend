import { CognitoJwtVerifier } from "aws-jwt-verify";
import type {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";

import { Logger } from "@aws-lambda-powertools/logger";
const logger = new Logger({ serviceName: "jwt-authorizer" }); 

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: "access", // cambiar a id
  clientId: null,
});

const M2M_SCOPE = process.env.M2M_SCOPE!;
const M2M_CLIENT_ID = process.env.M2M_CLIENT_ID!;

type RouteRule = {
  methods: string[];       // HTTP verbs this rule covers, or ['*'] for all
  allowedGroups: string[]; // any match grants access
};

// JSON string from env — e.g. {"/tournaments":[{"methods":["POST"],"allowedGroups":["admins"]}]}
// Unlisted routes are accessible to any authenticated principal.
// M2M tokens bypass all rules (they are already scope-validated above).
const ROUTE_AUTHORIZATION: Record<string, RouteRule[]> = process.env.ROUTE_AUTHORIZATION
  ? JSON.parse(process.env.ROUTE_AUTHORIZATION)
  : {};

// Parses method + resource path from the methodArn:
// arn:aws:execute-api:{region}:{account}:{api-id}/{stage}/{METHOD}/{resource+}
function parseMethodArn(methodArn: string): { method: string; resource: string } {
  const parts = methodArn.split("/");
  return { method: parts[2], resource: "/" + parts.slice(3).join("/") };
}

function checkGroupAuthorization(
  methodArn: string,
  groups: string[],
  isM2M: boolean
): boolean {
  if (isM2M) return true;

  const { method, resource } = parseMethodArn(methodArn);
  logger.info("Checking group authorization", { method, resource });
  const rules = ROUTE_AUTHORIZATION[resource];
  if (!rules || rules.length === 0) return true;

  for (const rule of rules) {
    if (rule.methods.includes("*") || rule.methods.includes(method)) {
      logger.info("Found matching rule", { rule });
      return rule.allowedGroups.some((g) => groups.includes(g));
    }
  }
  return true;
}

function buildPolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string,
  context?: Record<string, string>
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [{ Action: "execute-api:Invoke", Effect: effect, Resource: resource }],
    },
    ...(context && { context }),
  };
}

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const token = event.authorizationToken.replace(/^Bearer\s+/i, "");
  logger.info("Received authorization request", { token });

  try {
    const payload: any = await verifier.verify(token);
    logger.info("Token successfully verified", { payload });
    const client_id: string = payload.client_id ?? "";
    const scope: string = payload.scope ?? "";
    const groups: string[] = payload["cognito:groups"] ?? [];
    const isM2M = client_id === M2M_CLIENT_ID;
    logger.info("Token verified", { client_id, scope, groups, isM2M });

    if (isM2M && !scope.includes(M2M_SCOPE)) {
      throw new Error("Unauthorized");
    }

    const allMethodsArn = event.methodArn.split("/")[0] + "/*/*";
    const context = {
      sub: payload.sub,
      is_m2m: isM2M ? "true" : "false",
      groups: groups.join(","),
      scope,
    };

    logger.info("Checking route authorization", { methodArn: event.methodArn, context });

    if (!checkGroupAuthorization(event.methodArn, groups, isM2M)) {
      // Valid token but insufficient groups — returns 403 to the caller
      return buildPolicy(payload.sub, "Deny", allMethodsArn, context);
    }

    return buildPolicy(payload.sub, "Allow", allMethodsArn, context);
  } catch(error) {
    logger.error("Error occurred while processing authorization", { error });
    throw new Error("Unauthorized");
  }
};
