import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';
const secretsClient = new SecretsManagerClient({});

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
): Promise<PostConfirmationTriggerEvent> => {
  // Solo actuar en confirmación de registro
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    return event;
  }

  const { email, name, picture, sub } = event.request.userAttributes;
  console.log({ email, name, picture, sub });

  const creds = await getDbCredentials();
  const client = new Client({
    host: creds.host,
    port: creds.port,
    database: creds.dbname,
    user: creds.username,
    password: creds.password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    await client.query(
      `INSERT INTO public.users (name, email, sub, image, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'general', true, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      [name || email.split('@')[0], email, sub, picture || null],
    );
  } finally {
    await client.end();
  }

  return event;
};
