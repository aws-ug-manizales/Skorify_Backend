import { StorageMemoryImpl } from "../src/core/storage-memory.impl";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeStorage() {
  return new StorageMemoryImpl();
}

// PNG header: 89 50 4E 47 0D 0A 1A 0A
const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

// JPEG header: FF D8 FF
const jpegBuffer = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
]);

// ---------------------------------------------------------------------------
// uploadImage()
// ---------------------------------------------------------------------------
describe("StorageMemoryImpl – uploadImage()", () => {
  it("uploads a PNG buffer and returns a key", async () => {
    const storage = makeStorage();
    const key = await storage.uploadImage(pngBuffer);

    expect(key).toBeDefined();
    expect(key).toMatch(/^images\/.*\.png$/);
  });

  it("uploads a JPEG buffer and returns a key", async () => {
    const storage = makeStorage();
    const key = await storage.uploadImage(jpegBuffer);

    expect(key).toBeDefined();
    expect(key).toMatch(/^images\/.*\.jpg$/);
  });

  it("uploads a base64 string and returns a key", async () => {
    const storage = makeStorage();
    const base64 = pngBuffer.toString("base64");
    const key = await storage.uploadImage(base64);

    expect(key).toBeDefined();
    expect(key).toMatch(/^images\/.*\.png$/);
  });
});

// ---------------------------------------------------------------------------
// getAbsolutePath()
// ---------------------------------------------------------------------------
describe("StorageMemoryImpl – getAbsolutePath()", () => {
  it("returns a memory:// URL for an existing file", async () => {
    const storage = makeStorage();
    const key = await storage.uploadImage(pngBuffer);
    const path = await storage.getAbsolutePath(key);

    expect(path).toBe(`memory://${key}`);
  });

  it("throws an error for a non-existent file", async () => {
    const storage = makeStorage();

    await expect(storage.getAbsolutePath("non-existent-key")).rejects.toThrow(
      "Archivo no encontrado: non-existent-key"
    );
  });
});

// ---------------------------------------------------------------------------
// getBytes()
// ---------------------------------------------------------------------------
describe("StorageMemoryImpl – getBytes()", () => {
  it("returns the original buffer for an uploaded file", async () => {
    const storage = makeStorage();
    const key = await storage.uploadImage(pngBuffer);
    const retrieved = await storage.getBytes(key);

    expect(retrieved).toEqual(pngBuffer);
  });

  it("returns the original buffer for a base64 upload", async () => {
    const storage = makeStorage();
    const base64 = jpegBuffer.toString("base64");
    const key = await storage.uploadImage(base64);
    const retrieved = await storage.getBytes(key);

    expect(retrieved).toEqual(jpegBuffer);
  });

  it("throws an error for a non-existent file", async () => {
    const storage = makeStorage();

    await expect(storage.getBytes("non-existent-key")).rejects.toThrow(
      "Archivo no encontrado: non-existent-key"
    );
  });
});

// ---------------------------------------------------------------------------
// Integration test
// ---------------------------------------------------------------------------
describe("StorageMemoryImpl – Integration", () => {
  it("completes the full upload -> get path -> get bytes flow", async () => {
    const storage = makeStorage();

    // Upload
    const key = await storage.uploadImage(pngBuffer);
    expect(key).toBeDefined();

    // Get absolute path
    const path = await storage.getAbsolutePath(key);
    expect(path).toBe(`memory://${key}`);

    // Get bytes
    const bytes = await storage.getBytes(key);
    expect(bytes).toEqual(pngBuffer);
  });
});
