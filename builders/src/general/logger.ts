import { Logger } from '@aws-lambda-powertools/logger';

export const logger = new Logger({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME || 'skorify-builders',
});

export const serializeError = (error: unknown): unknown => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
};
