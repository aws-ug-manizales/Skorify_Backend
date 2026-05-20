export declare abstract class StorageContract {
    abstract uploadImage(relativePath: string, image: Buffer | string): string | Promise<string>;
    abstract getAbsolutePath(path: string): string | Promise<string>;
    abstract getBytes(path: string): Buffer | Promise<Buffer>;
}
