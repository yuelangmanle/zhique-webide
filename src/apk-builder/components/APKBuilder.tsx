import { useState } from 'react';
import { apkBuilderService } from '../services/apkBuilderService';
import { permissionService } from '@/permission-manager/services/permissionService';
import { projectService } from '@/project-manager/services/projectService';
import { appStore } from '@/common/store/appStore';
import { type Permission } from '@/common/types';

export const APKBuilder = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [packageName, setPackageName] = useState('com.example.app');
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState(1);
  const [appName, setAppName] = useState('我的应用');

  const permissions = permissionService.getAvailablePermissions();

  const sanitizeFileName = (name: string): string => {
    return name.replace(/[^\w\u4e00-\u9fa5-]/g, '_').slice(0, 32) || 'app';
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    const currentProject = appStore.getState().currentProject;
    if (!currentProject) {
      setExportResult({ success: false, message: '请先选择项目' });
      setIsExporting(false);
      return;
    }

    const htmlContent = await projectService.readFile(currentProject.id, 'index.html');
    let cssContent = '';
    let jsContent = '';
    if (currentProject.type === 'folder') {
      cssContent = await projectService.readFile(currentProject.id, 'style.css');
      jsContent = await projectService.readFile(currentProject.id, 'script.js');
    }

    const webFiles = JSON.stringify({
      'index.html': htmlContent,
      'style.css': cssContent,
      'script.js': jsContent,
    });

    const selectedPermissions = permissions
      .filter((p) => appStore.getState().permissionSettings[p.name])
      .map((p) => p.name);

    const config = {
      packageName,
      versionName,
      versionCode,
      icon: '',
      permissions: selectedPermissions,
      webFiles,
      appName,
    };

    const validation = apkBuilderService.validateConfig(config);
    if (!validation.valid) {
      setExportResult({ success: false, message: validation.errors.join('\n') });
      setIsExporting(false);
      return;
    }

    const result = await apkBuilderService.exportConfig(config);

    if (!result.success || !result.configJson) {
      setExportResult({
        success: false,
        message: result.error || '导出失败',
      });
      setIsExporting(false);
      return;
    }

    try {
      const blob = new Blob([result.configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `zhique-config-${sanitizeFileName(appName)}-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportResult({ success: true, message: '配置已导出' });
    } catch (error) {
      setExportResult({
        success: false,
        message: error instanceof Error ? error.message : '下载失败',
      });
    }

    setIsExporting(false);
  };

  const togglePermission = (permission: Permission) => {
    appStore.togglePermissionSetting(permission.name);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex-shrink-0">
        <h2 className="text-white font-bold text-base">配置导出</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* 应用配置 */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-3">
          <h3 className="text-white font-medium text-sm">应用配置</h3>

          <div>
            <label className="block text-slate-500 text-xs mb-1.5">应用名称</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="我的应用"
            />
          </div>

          <div>
            <label className="block text-slate-500 text-xs mb-1.5">包名</label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="com.example.app"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">版本名</label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="1.0.0"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">版本号</label>
              <input
                type="number"
                value={versionCode}
                onChange={(e) => setVersionCode(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 权限选择 */}
        <div className="bg-slate-900 rounded-xl p-4">
          <h3 className="text-white font-medium text-sm mb-3">权限选择</h3>
          <div className="grid grid-cols-4 gap-2">
            {permissions.map((permission) => (
              <button
                key={permission.name}
                onClick={() => togglePermission(permission)}
                className={`min-h-[44px] p-2.5 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  appStore.getState().permissionSettings[permission.name]
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                <span className="text-lg">{permission.icon}</span>
                <span className="text-[11px] font-medium">{permission.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 导出按钮 */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full min-h-[44px] py-3.5 bg-emerald-500 text-white font-bold rounded-xl active:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-400 transition-colors"
        >
          {isExporting ? '正在导出...' : '导出配置'}
        </button>

        {/* 结果 */}
        {exportResult && (
          <div
            className={`p-3 rounded-xl text-sm whitespace-pre-wrap ${
              exportResult.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            }`}
          >
            {exportResult.message}
          </div>
        )}

        <div className="text-center text-slate-400 text-xs pb-2 leading-relaxed">
          真实 APK 打包请使用桌面端构建工具或云端构建服务。此处导出的配置文件可用于后续构建。
        </div>
      </div>
    </div>
  );
};
