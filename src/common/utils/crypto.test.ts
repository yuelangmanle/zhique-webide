import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  encrypt,
  decrypt,
  encryptJSON,
  decryptJSON,
  isEncryptionSupported,
} from './crypto';

describe('crypto', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('isEncryptionSupported', () => {
    it('jsdom 环境下应返回 true', () => {
      expect(isEncryptionSupported()).toBe(true);
    });
  });

  describe('encrypt / decrypt 往返', () => {
    it('普通字符串加解密后应还原原值', async () => {
      const plaintext = 'sk-1234567890abcdef';
      const encrypted = await encrypt(plaintext);
      expect(encrypted).not.toBe('');
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.includes(':')).toBe(true);

      const decrypted = await decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('含特殊字符与中文的字符串应正确往返', async () => {
      const plaintext = '密钥：!@#$%^&*()_+ 空格 与 emoji 🚀';
      const encrypted = await encrypt(plaintext);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('每次加密生成不同密文（随机 IV）', async () => {
      const plaintext = 'same-input';
      const a = await encrypt(plaintext);
      const b = await encrypt(plaintext);
      expect(a).not.toBe(b);
      // 但两者都能正确解密
      expect(await decrypt(a)).toBe(plaintext);
      expect(await decrypt(b)).toBe(plaintext);
    });

    it('长字符串应正确往返', async () => {
      const plaintext = 'x'.repeat(10000);
      const encrypted = await encrypt(plaintext);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('空串处理', () => {
    it('encrypt 空串返回空串', async () => {
      expect(await encrypt('')).toBe('');
    });

    it('decrypt 空串返回空串', async () => {
      expect(await decrypt('')).toBe('');
    });
  });

  describe('异常输入', () => {
    it('decrypt 缺少分隔符的密文返回空串', async () => {
      const result = await decrypt('aGVsbG8'); // 无 ':'
      expect(result).toBe('');
    });

    it('decrypt 被篡改的密文返回空串', async () => {
      const encrypted = await encrypt('secret');
      // 篡改密文部分
      const [ivB64, ctB64] = encrypted.split(':');
      const tampered = `${ivB64}:${ctB64.slice(0, -2)}XX`;
      const result = await decrypt(tampered);
      expect(result).toBe('');
    });

    it('decrypt 无效 base64 返回空串', async () => {
      const result = await decrypt('!!!:!!!');
      expect(result).toBe('');
    });
  });

  describe('encryptJSON / decryptJSON', () => {
    it('对象加解密后应深度相等', async () => {
      const data = { id: 'openai', key: 'sk-xxx', nested: { a: 1, b: [true, null] } };
      const encrypted = await encryptJSON(data);
      expect(encrypted).not.toBe('');

      const decrypted = await decryptJSON(encrypted);
      expect(decrypted).toEqual(data);
    });

    it('decryptJSON 空串返回 null', async () => {
      expect(await decryptJSON('')).toBeNull();
    });

    it('decryptJSON 无效密文返回 null', async () => {
      expect(await decryptJSON('no-separator')).toBeNull();
    });

    it('encryptJSON 空串输入应正常往返（JSON.stringify("") 非空）', async () => {
      // JSON.stringify('') === '""'（2 字符），非空串，应正常加密
      const encrypted = await encryptJSON('');
      expect(encrypted).not.toBe('');
      const decrypted = await decryptJSON<string>(encrypted);
      expect(decrypted).toBe('');
    });
  });
});
