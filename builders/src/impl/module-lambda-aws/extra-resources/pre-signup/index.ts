import { Logger } from '@aws-lambda-powertools/logger';
import type { Context, PreSignUpTriggerEvent } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminLinkProviderForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});
const logger = new Logger({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME || 'skorify-pre-signup',
});

const federatedAccountExistsMessage =
  'Ya existe una cuenta con este correo electrónico. Por favor inicia sesión con Google.';

const serializeError = (error: unknown): unknown => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  return error;
};

export const handler = async (
  event: PreSignUpTriggerEvent,
  context: Context,
): Promise<PreSignUpTriggerEvent> => {
  logger.addContext(context);
  const startedAt = Date.now();

  try {
    const email = event.request.userAttributes.email;
    const userPoolId = event.userPoolId;

    // ─────────────────────────────────────────────
    // CASO 1: Usuario entra con Google y ya existe con email/password
    // ─────────────────────────────────────────────
    if (event.triggerSource === 'PreSignUp_ExternalProvider') {
      const listResponse = await cognitoClient.send(
        new ListUsersCommand({
          UserPoolId: userPoolId,
          Filter: `email = "${email}"`,
        })
      );

      const existingUsers = listResponse.Users || [];

      const nativeUser = existingUsers.find(
        (u) => u.UserStatus !== 'EXTERNAL_PROVIDER'
      );

      if (nativeUser) {
        const [providerName, providerUserId] = event.userName.split('_');

        await cognitoClient.send(
          new AdminLinkProviderForUserCommand({
            UserPoolId: userPoolId,
            DestinationUser: {
              ProviderName: 'Cognito',
              ProviderAttributeValue: nativeUser.Username,
            },
            SourceUser: {
              ProviderName: providerName,
              ProviderAttributeName: 'Cognito_Subject',
              ProviderAttributeValue: providerUserId,
            },
          })
        );
      }

      event.response.autoConfirmUser = true;
      event.response.autoVerifyEmail = true;

      logger.info('Pre-signup completed', {
        triggerSource: event.triggerSource,
        action: nativeUser ? 'linked_existing_native_user' : 'auto_confirmed_external_user',
        durationMs: Date.now() - startedAt,
      });

      return event;
    }

    // ─────────────────────────────────────────────
    // CASO 2: Usuario intenta registrarse con email/password
    //         y ya existe con Google (proveedor externo)
    // ─────────────────────────────────────────────
    if (event.triggerSource === 'PreSignUp_SignUp') {
      const listResponse = await cognitoClient.send(
        new ListUsersCommand({
          UserPoolId: userPoolId,
          Filter: `email = "${email}"`,
        })
      );

      const existingUsers = listResponse.Users || [];

      const federatedUser = existingUsers.find(
        (u) =>
          u.UserStatus === 'EXTERNAL_PROVIDER' ||
          u.Username?.startsWith('google_') ||
          u.Username?.startsWith('Google_')
      );

      if (federatedUser) {
        // Bloquear el registro: ya existe una cuenta con ese email via Google
        throw new Error(federatedAccountExistsMessage);
      }

      // Auto-confirmar usuario y verificar email (sin código por correo)
      event.response.autoConfirmUser = true;
      event.response.autoVerifyEmail = true;
      logger.info('Pre-signup completed', {
        triggerSource: event.triggerSource,
        action: 'auto_confirmed_native_user',
        durationMs: Date.now() - startedAt,
      });

    }

    return event;
  } catch (error) {
    const metadata = {
      triggerSource: event.triggerSource,
      durationMs: Date.now() - startedAt,
      error: serializeError(error),
    };

    if (error instanceof Error && error.message === federatedAccountExistsMessage) {
      logger.warn('Pre-signup blocked', {
        ...metadata,
        reason: 'federated_account_exists',
      });
    } else {
      logger.error('Pre-signup failed', metadata);
    }

    throw error;
  }
};
