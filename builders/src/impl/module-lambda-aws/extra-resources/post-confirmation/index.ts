import { Logger } from '@aws-lambda-powertools/logger';
import type { Context, PostConfirmationTriggerEvent } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';

const logger = new Logger({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME || 'skorify-post-confirmation',
});
const secretsClient = new SecretsManagerClient({});
const serializeError = (error: unknown): unknown => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
};

interface DbCredentials {
  host: string;
  port: number;
  dbname: string;
  username: string;
  password: string;
}

let cachedCredentials: DbCredentials | null = null;

async function getDbCredentials(): Promise<DbCredentials> {
  if (cachedCredentials) return cachedCredentials;

  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN }),
  );
  cachedCredentials = JSON.parse(response.SecretString!) as DbCredentials;
  return cachedCredentials;
}

export const handler = async (
  event: PostConfirmationTriggerEvent,
  context: Context,
): Promise<PostConfirmationTriggerEvent> => {
  logger.addContext(context);
  const startedAt = Date.now();
  // Solo actuar en confirmación de registro
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    logger.debug('Post-confirmation skipped', { triggerSource: event.triggerSource });
    return event;
  }

  const { email, name, picture, sub } = event.request.userAttributes;
  logger.debug('Processing confirmed user', { triggerSource: event.triggerSource });

  let client: Client | undefined;
  try {
    const creds = await getDbCredentials();
    client = new Client({
      host: creds.host,
      port: creds.port,
      database: creds.dbname,
      user: creds.username,
      password: creds.password,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    const result = await client.query(
      `INSERT INTO public.users (name, email, sub, image, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'general', true, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      [name || email.split('@')[0], email, sub, picture || null],
    );
    logger.info('Post-confirmation completed', {
      triggerSource: event.triggerSource,
      userCreated: result.rowCount === 1,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    logger.error('Post-confirmation failed', {
      triggerSource: event.triggerSource,
      durationMs: Date.now() - startedAt,
      error: serializeError(error),
    });
    throw error;
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (error) {
        logger.warn('Failed to close post-confirmation database connection', {
          error: serializeError(error),
        });
      }
    }
  }

  return event;
};
