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
  const [appName, setAppName] = useState('My App');

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
      message: result.success ? `APK built successfully! Path: ${result.apkPath}` : result.error || 'Build failed',
    });
    setIsBuilding(false);
  };

  const togglePermission = (permission: Permission) => {
    appStore.togglePermissionSetting(permission.name);
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-700">
        <h2 className="text-lg font-bold text-white">APK Builder</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-dark-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">App Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">App Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="My App"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Package Name</label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                placeholder="com.example.app"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Version Name</label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Version Code</label>
                <input
                  type="number"
                  value={versionCode}
                  onChange={(e) => setVersionCode(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Permissions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {permissions.map((permission) => (
              <button
                key={permission.name}
                onClick={() => togglePermission(permission)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                  appStore.getState().permissionSettings[permission.name]
                    ? 'bg-primary-500/20 border-primary-500 text-white'
                    : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-dark-500'
                }`}
              >
                <span className="text-xl">{permission.icon}</span>
                <span className="text-xs font-medium">{permission.description}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleBuild}
          disabled={isBuilding}
          className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:bg-dark-600 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
        >
          {isBuilding ? 'Building APK...' : 'Build APK'}
        </button>

        {isBuilding && (
          <div className="bg-dark-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Build Progress</span>
              <span className="text-white font-semibold">{buildProgress}%</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300 ease-out"
                style={{ width: `${buildProgress}%` }}
              />
            </div>
          </div>
        )}

        {buildResult && (
          <div
            className={`p-4 rounded-xl font-mono text-sm whitespace-pre-wrap ${
              buildResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {buildResult.message}
          </div>
        )}
      </div>
    </div>
  );
};
