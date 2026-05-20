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

  /**
   * Detecta el tipo de archivo basado en los magic bytes
   * @param buffer Buffer del archivo
   * @returns Extensión del archivo (ej: '.jpg', '.png', '.gif')
   */
  private detectFileType(buffer: Buffer): string {
    const header = buffer.subarray(0, 8).toString('hex').toLowerCase();

    // JPEG: FF D8 FF
    if (header.startsWith('ffd8ff')) {
      return '.jpg';
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (header.startsWith('89504e470d0a1a0a')) {
      return '.png';
    }
    // GIF: 47 49 46 38
    if (header.startsWith('47494638')) {
      return '.gif';
    }
    // PDF: 25 50 44 46
    if (header.startsWith('25504446')) {
      return '.pdf';
    }
    // WebP: 52 49 46 46 ... 57 45 42 50
    if (
      header.startsWith('52494646') &&
      buffer.subarray(8, 12).toString('hex').toLowerCase() === '57454250'
    ) {
      return '.webp';
    }

    // Por defecto, asumir .bin si no se reconoce
    return '.bin';
  }

  /**
   * Obtiene el content type basado en la extensión
   * @param extension Extensión del archivo
   * @returns Content type MIME
   */
  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.bin': 'application/octet-stream',
    };

    return contentTypes[extension] || 'application/octet-stream';
  }
  async uploadImage(relativePath: string, image: Buffer | string): Promise<string> {
    const body = typeof image === 'string' ? Buffer.from(image, 'base64') : image;
    const extension = this.detectFileType(body);
    const contentType = this.getContentType(extension);

    const key = `${relativePath}${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
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
