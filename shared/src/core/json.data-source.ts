import { Entity } from "@skorify/domain/core";
import { DataSource } from "./data-source.interface";
import * as fs from "fs";
import * as path from "path";

/**
 * JsonDataSource lee y escribe datos en un archivo JSON.
 * Los datos persisten entre reinicios del servidor.
 *
 * @param filePath - Ruta completa al archivo JSON, o nombre de archivo (se guarda en data/)
 * @param basePath - Ruta base para archivos (por defecto usa __dirname del caller)
 */
export class JsonDataSource<T extends Entity> implements DataSource<T> {
  private filePath: string;

  constructor(filePath: string, basePath?: string) {
    if (path.isAbsolute(filePath)) {
      this.filePath = filePath;
    } else {
      const base = basePath ?? path.join(process.cwd(), "data");
      this.filePath = path.join(base, filePath);
    }
    this.ensureFileExists();
  }

  private ensureFileExists(): void {
    const dir = path.dirname(this.filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "[]", "utf-8");
    }
  }

  async read(): Promise<T[]> {
    const content = fs.readFileSync(this.filePath, "utf-8");
    return JSON.parse(content) as T[];
  }

  async write(data: T[]): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(this.filePath, content, "utf-8");
  }
}
