import { webcrypto } from 'node:crypto';

// Los usecases usan `crypto.randomUUID()` (global en el runtime Node 22 del Lambda).
// El entorno Node de jest no expone `crypto` global, así que lo inyectamos desde node:crypto.
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as typeof globalThis.crypto;
}
