import { StorageContract } from "@skorify/domain/core";

interface StoredFile {
    key: string;
    content: Buffer;
    contentType: string;
    uploadedAt: Date;
    size: number;
}

export class StorageMemoryImpl extends StorageContract {
    private readonly storage: Map<string, StoredFile> = new Map();

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
        if (header.startsWith('52494646') && buffer.subarray(8, 12).toString('hex').toLowerCase() === '57454250') {
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

    /**
     * Sube una imagen a memoria y retorna la clave generada
     * @param image Buffer o string en base64
     * @returns Clave única del archivo almacenado
     */
    async uploadImage(image: Buffer | string): Promise<string> {
        const buffer = typeof image === 'string' ? Buffer.from(image, 'base64') : image;
        const extension = this.detectFileType(buffer);
        const key = `images/${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;
        const contentType = this.getContentType(extension);

        const storedFile: StoredFile = {
            key,
            content: buffer,
            contentType,
            uploadedAt: new Date(),
            size: buffer.length,
        };

        this.storage.set(key, storedFile);
        console.log(`Archivo almacenado en memoria: ${key} (${buffer.length} bytes, ${contentType})`);

        return key;
    }

    /**
     * Obtiene la ruta absoluta (en este caso, una URL en memoria)
     * @param path Clave del archivo
     * @returns URL en formato memory://
     */
    async getAbsolutePath(path: string): Promise<string> {
        if (!this.storage.has(path)) {
            throw new Error(`Archivo no encontrado: ${path}`);
        }

        // Retorna una URL ficticia para compatibilidad
        return `memory://${path}`;
    }

    /**
     * Obtiene los bytes del archivo almacenado
     * @param path Clave del archivo
     * @returns Buffer con el contenido del archivo
     */
    async getBytes(path: string): Promise<Buffer> {
        const file = this.storage.get(path);
        
        if (!file) {
            throw new Error(`Archivo no encontrado: ${path}`);
        }

        return file.content;
    }
}