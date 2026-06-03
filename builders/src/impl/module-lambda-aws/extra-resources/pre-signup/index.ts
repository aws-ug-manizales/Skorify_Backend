import { PreSignUpTriggerEvent } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminLinkProviderForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});

export const handler = async (event: PreSignUpTriggerEvent): Promise<PreSignUpTriggerEvent> => {
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
      throw new Error(
        'Ya existe una cuenta con este correo electrónico. Por favor inicia sesión con Google.'
      );
    }

    // Auto-confirmar usuario y verificar email (sin código por correo)
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
  }

  return event;
};
