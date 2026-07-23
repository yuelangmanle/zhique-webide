import { useState, useEffect, useMemo } from 'react';
import { checkForUpdate, downloadUpdate, type UpdateCheckResult } from '../services/updateService';
import { IconBird, IconGithub, IconExternalLink, IconDownload, IconRefresh } from '@/common/components/Icons';
import { toast } from '@/common/components/Toast';
import changelogRaw from '../../../CHANGELOG.md?raw';

const GITHUB_REPO_URL = 'https://github.com/yuelangmanle/zhique-webide';

export const About = () => {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  const [changelogExpanded, setChangelogExpanded] = useState(false);

  const currentVersion = __APP_VERSION__;

  // 初始化：尝试读取上次缓存的检查结果（同一会话内保持）
  useEffect(() => {
    const cached = sessionStorage.getItem('zhique-update-check');
    if (cached) {
      try {
        setResult(JSON.parse(cached));
      } catch {}
    }
  }, []);

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      const res = await checkForUpdate(currentVersion);
      setResult(res);
      sessionStorage.setItem('zhique-update-check', JSON.stringify(res));
      if (res.error) {
        toast.error('检查更新失败：' + res.error);
      } else if (res.hasUpdate && res.latest) {
        toast.success(`发现新版本 v${res.latest.version}`);
      } else {
        toast.info('已是最新版本');
      }
    } finally {
      setChecking(false);
    }
  };

  const handleDownload = () => {
    const url = result?.latest?.downloadUrl ?? result?.latest?.htmlUrl;
    if (!url) {
      toast.error('没有可用的下载链接');
      return;
    }
    downloadUpdate(url);
    toast.info('已打开下载页面');
  };

  // 格式化 GitHub API 返回的 ISO 时间为本地可读字符串
  const formatDate = (iso: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('zh-CN');
    } catch {
      return iso;
    }
  };

  // 日志摘要：默认折叠只显示第一个版本的更新内容
  const changelogSections = useMemo(() => {
    return changelogRaw.split(/^##\s+/m).filter((section) => section.trim());
  }, []);

  const visibleChangelog = changelogExpanded ? changelogRaw : `## ${changelogSections[0] ?? ''}`;

  return (
    <div className="h-full flex flex-col bg-slate-950 animate-tab-in">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
          {/* 应用信息卡片 */}
          <div className="text-center space-y-3">
            <IconBird size={72} className="mx-auto" />
            <h1 className="text-white text-xl font-bold">织雀 WebIDE</h1>
            <p className="text-slate-400 text-sm">移动端网页代码编辑器</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full text-xs text-slate-400">
              <span>当前版本</span>
              <span className="text-cyan-400 font-mono">v{currentVersion}</span>
            </div>
          </div>

          {/* GitHub 仓库入口 */}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-slate-900 rounded-xl active:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <IconGithub size={24} className="text-white" />
              <div className="text-left">
                <div className="text-white text-sm font-medium">GitHub 仓库</div>
                <div className="text-slate-500 text-xs">yuelangmanle/zhique-webide</div>
              </div>
            </div>
            <IconExternalLink size={18} className="text-slate-500" />
          </a>

          {/* 检查更新 */}
          <div className="bg-slate-900 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-sm font-medium">检查更新</h2>
                <p className="text-slate-500 text-xs mt-0.5">从 GitHub Release 获取最新版本</p>
              </div>
              <button
                onClick={handleCheckUpdate}
                disabled={checking}
                className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 bg-cyan-500 text-white text-xs font-medium rounded-lg active:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
              >
                <span className={checking ? 'animate-spin' : ''}>
                  <IconRefresh size={14} />
                </span>
                {checking ? '检查中...' : '检查更新'}
              </button>
            </div>

            {result && !result.error && result.latest && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">最新版本</span>
                  <span className="text-white font-mono">v{result.latest.version}</span>
                </div>
                {result.latest.versionCode && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">versionCode</span>
                    <span className="text-slate-300 font-mono">{result.latest.versionCode}</span>
                  </div>
                )}
                {result.latest.publishedAt && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">发布时间</span>
                    <span className="text-slate-300">{formatDate(result.latest.publishedAt)}</span>
                  </div>
                )}

                {result.hasUpdate ? (
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg active:bg-emerald-600 transition-colors"
                  >
                    <IconDownload size={16} />
                    一键下载更新
                  </button>
                ) : (
                  <div className="text-center text-xs text-emerald-400 py-2">已是最新版本</div>
                )}
              </div>
            )}
          </div>

          {/* 更新日志 */}
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <button
              onClick={() => setChangelogExpanded((v) => !v)}
              className="w-full flex items-center justify-between p-4 text-left active:bg-slate-800 transition-colors"
            >
              <h2 className="text-white text-sm font-medium">更新日志</h2>
              <span className="text-cyan-400 text-xs">{changelogExpanded ? '收起' : '展开'}</span>
            </button>
            <div className="px-4 pb-4">
              <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed bg-transparent p-0">
                  {visibleChangelog}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
