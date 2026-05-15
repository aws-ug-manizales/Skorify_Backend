export abstract class StorageContract {
  abstract uploadImage(image: Buffer | string): string | Promise<string>;
  abstract getAbsolutePath(path: string): string | Promise<string>;
  abstract getBytes(path: string): Buffer | Promise<Buffer>;
}
