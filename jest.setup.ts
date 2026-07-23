// jsdom 环境补充
import { TextEncoder, TextDecoder } from 'util';
import { webcrypto } from 'crypto';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// jsdom 的 crypto 仅有 getRandomValues，缺少 subtle（AES-GCM/PBKDF2），
// 用 Node 的 webcrypto.subtle 补齐，使 crypto.ts 在测试中可正常加解密
const cryptoObj = globalThis.crypto as Record<string, unknown> | undefined;
if (cryptoObj && !cryptoObj.subtle) {
  Object.defineProperty(cryptoObj, 'subtle', {
    value: webcrypto.subtle,
    writable: false,
    configurable: true,
  });
}

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// indexedDB mock（简单空实现，projectService 会 fallback 到 localStorage）
Object.defineProperty(global, 'indexedDB', { value: undefined });
