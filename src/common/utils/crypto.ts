/**
 * Web Crypto API AES-GCM 加密工具
 *
 * 用于加密存储 API Key 等敏感信息。
 * 密钥派生自固定应用口令（移动端无用户登录场景，用应用级口令派生密钥），
 * 通过 PBKDF2 派生 AES-GCM 密钥。
 *
 * 注意：crypto.subtle 在 file:// 协议下通常可用（WebView 中 SubtleCrypto 一般可用）；
 * 若运行环境不可用，会 fallback 到 base64 编码并 console.warn。
 *
 * 输出格式：base64(iv) + ':' + base64(ciphertext)
 */

// 固定应用口令（移动端无用户登录场景，用应用级口令派生密钥）
const APP_PASSPHRASE = 'zhique-webide-v3';
// PBKDF2 盐值（固定，与应用口令一起派生密钥）
const PBKDF2_SALT = 'zhique-webide-salt-v3';
// PBKDF2 迭代次数
const PBKDF2_ITERATIONS = 100000;
// AES-GCM IV 长度（12 字节，NIST 推荐）
const IV_LENGTH = 12;
// IV 与密文的分隔符
const SEPARATOR = ':';

/**
 * 检测 crypto.subtle 是否可用
 */
const isSubtleCryptoAvailable = (): boolean => {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.subtle.deriveKey === 'function' &&
    typeof crypto.subtle.encrypt === 'function'
  );
};

/**
 * Uint8Array -> Base64 字符串
 */
const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Base64 字符串 -> Uint8Array（明确以 ArrayBuffer 为底，兼容 crypto.subtle 的 BufferSource）
 */
const base64ToBytes = (b64: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// 缓存派生出的 AES-GCM 密钥，避免重复派生
let cachedKey: CryptoKey | null = null;

/**
 * 通过 PBKDF2 从固定应用口令派生 AES-GCM 密钥（带缓存）
 */
const deriveAesKey = async (): Promise<CryptoKey> => {
  if (cachedKey) {
    return cachedKey;
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(APP_PASSPHRASE),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  cachedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(PBKDF2_SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return cachedKey;
};

/**
 * 加密字符串
 *
 * 输出格式：base64(iv) + ':' + base64(ciphertext)
 * 若 crypto.subtle 不可用或加密失败，fallback 到 base64 编码（UTF-8 安全）并 console.warn。
 */
export const encrypt = async (plaintext: string): Promise<string> => {
  if (!plaintext) {
    return '';
  }

  if (!isSubtleCryptoAvailable()) {
    console.warn('[crypto] crypto.subtle 不可用，回退到 base64 编码（非加密）');
    return bytesToBase64(new TextEncoder().encode(plaintext));
  }

  try {
    const key = await deriveAesKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );

    return `${bytesToBase64(iv)}${SEPARATOR}${bytesToBase64(new Uint8Array(ciphertext))}`;
  } catch (err) {
    console.warn('[crypto] 加密失败，回退到 base64 编码：', err);
    return bytesToBase64(new TextEncoder().encode(plaintext));
  }
};

/**
 * 解密字符串
 *
 * 输入格式：base64(iv) + ':' + base64(ciphertext)
 * 若输入为 fallback 的 base64 编码（无分隔符），直接 base64 解码。
 */
export const decrypt = async (encrypted: string): Promise<string> => {
  if (!encrypted) {
    return '';
  }

  // 兼容 fallback 模式（无分隔符的 base64）
  if (!encrypted.includes(SEPARATOR)) {
    try {
      return new TextDecoder().decode(base64ToBytes(encrypted));
    } catch (err) {
      console.warn('[crypto] base64 解码失败：', err);
      return '';
    }
  }

  if (!isSubtleCryptoAvailable()) {
    console.warn('[crypto] crypto.subtle 不可用，无法解密 AES-GCM 密文');
    return '';
  }

  try {
    const separatorIndex = encrypted.indexOf(SEPARATOR);
    const ivB64 = encrypted.substring(0, separatorIndex);
    const ctB64 = encrypted.substring(separatorIndex + 1);
    const iv = base64ToBytes(ivB64);
    const ciphertext = base64ToBytes(ctB64);
    const key = await deriveAesKey();

    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(plaintextBuffer);
  } catch (err) {
    console.warn('[crypto] 解密失败：', err);
    return '';
  }
};

/**
 * 加密 JSON 对象（先 JSON.stringify 再加密）
 */
export const encryptJSON = async (value: unknown): Promise<string> => {
  return encrypt(JSON.stringify(value));
};

/**
 * 解密 JSON 字符串并解析为指定类型
 * 解密或解析失败时返回 null
 */
export const decryptJSON = async <T = unknown>(encrypted: string): Promise<T | null> => {
  const plaintext = await decrypt(encrypted);
  if (!plaintext) {
    return null;
  }
  try {
    return JSON.parse(plaintext) as T;
  } catch (err) {
    console.warn('[crypto] JSON 解析失败：', err);
    return null;
  }
};

export default { encrypt, decrypt, encryptJSON, decryptJSON };
