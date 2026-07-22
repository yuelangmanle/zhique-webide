import { useState } from 'react';
import { apkBuilderService } from '../services/apkBuilderService';
import { permissionService } from '@/permission-manager/services/permissionService';
import { appStore } from '@/common/store/appStore';
import { type Permission } from '@/common/types';

export const APKBuilder = () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<{ success: boolean; message: string } | null>(null);
  const [buildProgress, setBuildProgress] = useState(0);
  const [packageName, setPackageName] = useState('com.example.app');
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState(1);
  const [appName, setAppName] = useState('我的应用');

  const permissions = permissionService.getAvailablePermissions();

  const handleBuild = async () => {
    setIsBuilding(true);
    setBuildResult(null);
    setBuildProgress(0);

    const selectedPermissions = permissions
      .filter((p) => appStore.getState().permissionSettings[p.name])
      .map((p) => p.name);

    const config = {
      packageName,
      versionName,
      versionCode,
      icon: '',
      permissions: selectedPermissions,
      webFiles: '',
      appName,
    };

    const validation = apkBuilderService.validateConfig(config);
    if (!validation.valid) {
      setBuildResult({ success: false, message: validation.errors.join('\n') });
      setIsBuilding(false);
      return;
    }

    setBuildProgress(25);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setBuildProgress(50);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setBuildProgress(75);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = await apkBuilderService.build(config);
    setBuildProgress(100);

    setBuildResult({
      success: result.success,
      message: result.success ? `打包成功！路径：${result.apkPath}` : result.error || '打包失败',
    });
    setIsBuilding(false);
  };

  const togglePermission = (permission: Permission) => {
    appStore.togglePermissionSetting(permission.name);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex-shrink-0">
        <h2 className="text-white font-bold text-base">APK 打包</h2>
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
                className={`p-2.5 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  appStore.getState().permissionSettings[permission.name]
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                <span className="text-lg">{permission.icon}</span>
                <span className="text-[10px] font-medium">{permission.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 打包按钮 */}
        <button
          onClick={handleBuild}
          disabled={isBuilding}
          className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl active:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 transition-colors"
        >
          {isBuilding ? '正在打包...' : '开始打包'}
        </button>

        {/* 进度条 */}
        {isBuilding && (
          <div className="bg-slate-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs">打包进度</span>
              <span className="text-white font-semibold text-sm">{buildProgress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${buildProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 结果 */}
        {buildResult && (
          <div
            className={`p-3 rounded-xl text-sm whitespace-pre-wrap ${
              buildResult.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            }`}
          >
            {buildResult.message}
          </div>
        )}

        <div className="text-center text-slate-600 text-xs pb-2">
          权限用于生成的 APK，不影响织雀本身
        </div>
      </div>
    </div>
  );
};
