import axios from 'axios';

export interface ReleaseInfo {
  version: string;
  versionCode: number | null;
  publishedAt: string;
  body: string;
  downloadUrl: string | null;
  htmlUrl: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latest: ReleaseInfo | null;
  error?: string;
}

// GitHub 仓库配置（与 App 顶部栏跳转保持一致）
const REPO_OWNER = 'yuelangmanle';
const REPO_NAME = 'zhique-webide';

/**
 * 将版本号字符串拆分为可比较的整数数组
 * 例如 "3.1.1" -> [3, 1, 1]；"3.1.0-beta" -> [3, 1, 0]
 */
function parseVersion(version: string): number[] {
  const clean = version.replace(/^v/, '').replace(/-.*$/, '');
  return clean.split('.').map((part) => parseInt(part, 10) || 0);
}

/**
 * 比较两个版本号。
 * @returns >0 表示 v1 更新，=0 相同，<0 表示 v2 更新
 */
export function compareVersion(v1: string, v2: string): number {
  const a = parseVersion(v1);
  const b = parseVersion(v2);
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    const n1 = a[i] ?? 0;
    const n2 = b[i] ?? 0;
    if (n1 !== n2) return n1 - n2;
  }
  return 0;
}

/**
 * 从 Release 正文中提取 APK 下载链接。
 * 优先取 release asset 中文件名以 .apk 结尾的资源，否则返回 null。
 */
function extractDownloadUrl(assets: unknown[]): string | null {
  if (!Array.isArray(assets)) return null;
  const apkAsset = assets.find(
    (asset) =>
      typeof asset === 'object' &&
      asset !== null &&
      'browser_download_url' in asset &&
      'name' in asset &&
      typeof (asset as { name: unknown }).name === 'string' &&
      (asset as { name: string }).name.endsWith('.apk'),
  ) as { browser_download_url: string } | undefined;
  return apkAsset?.browser_download_url ?? null;
}

/**
 * 从 Release 正文中提取 versionCode（用于 Android 覆盖安装判断）
 */
function extractVersionCode(body: string): number | null {
  const match = body.match(/versionCode\s*[:=]\s*(\d+)/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

/**
 * 检查 GitHub Release 是否有新版本。
 * 当前版本号从 package.json 的 version 字段注入（Vite 在构建时替换 import.meta.env.PACKAGE_VERSION）。
 */
export async function checkForUpdate(currentVersion: string): Promise<UpdateCheckResult> {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
    const response = await axios.get(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      timeout: 10000,
    });

    const data = response.data;
    const latestTag = typeof data.tag_name === 'string' ? data.tag_name.replace(/^v/, '') : '';
    const publishedAt = typeof data.published_at === 'string' ? data.published_at : '';
    const body = typeof data.body === 'string' ? data.body : '';
    const htmlUrl = typeof data.html_url === 'string' ? data.html_url : `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases`;
    const assets = Array.isArray(data.assets) ? data.assets : [];

    if (!latestTag) {
      return { hasUpdate: false, currentVersion, latest: null, error: '无法解析最新版本号' };
    }

    const latest: ReleaseInfo = {
      version: latestTag,
      versionCode: extractVersionCode(body),
      publishedAt,
      body,
      downloadUrl: extractDownloadUrl(assets),
      htmlUrl,
    };

    const hasUpdate = compareVersion(latestTag, currentVersion) > 0;
    return { hasUpdate, currentVersion, latest };
  } catch (err) {
    const message = axios.isAxiosError(err) ? err.message : '网络请求失败';
    return { hasUpdate: false, currentVersion, latest: null, error: message };
  }
}

/**
 * 触发 APK 下载（或在新标签页打开 Release 页面）
 */
export function downloadUpdate(downloadUrl: string): void {
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = '';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
