import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageContract } from '@skorify/domain/core';

interface StorageConfig {
  bucketName: string;
  region: string;
}

export class StorageImpl extends StorageContract {
  private readonly client: S3Client;

  constructor(private config: StorageConfig) {
    super();
    this.client = new S3Client({ region: config.region });
  }

  async uploadImage(relativePath: string, image: Buffer | string): Promise<string> {
    const key = `images/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const body = typeof image === 'string' ? Buffer.from(image, 'base64') : image;

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      Body: body,
      ContentType: 'image/jpeg',
    });

    try {
      await this.client.send(command);
      return key;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async getAbsolutePath(path: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: path,
    });

    try {
      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      console.error('Error getting absolute path:', error);
      throw error;
    }
  }

  async getBytes(path: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: path,
    });

    try {
      const response = await this.client.send(command);
      const bytes = await response.Body?.transformToByteArray();
      return Buffer.from(bytes || []);
    } catch (error) {
      console.error('Error getting bytes:', error);
      throw error;
    }
  }
}
