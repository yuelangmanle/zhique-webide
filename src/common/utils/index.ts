export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const validatePackageName = (packageName: string): boolean => {
  const regex = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/;
  return regex.test(packageName);
};

export const validateVersionName = (versionName: string): boolean => {
  const regex = /^(\d+\.)*\d+$/;
  return regex.test(versionName);
};

export const sanitizeCode = (code: string): string => {
  return code.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
};

export const encryptString = (str: string, key: string): string => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

export const decryptString = (encrypted: string, key: string): string => {
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};