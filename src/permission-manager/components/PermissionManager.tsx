import { useState, useEffect } from 'react';
import { permissionService } from '../services/permissionService';
import { appStore } from '../../common/store/appStore';
import { type PermissionState } from '../../common/types';

interface PermissionManagerProps {
  onClose?: () => void;
}

const permissionGroups = [
  {
    name: '相机',
    key: 'camera',
    description: '访问设备摄像头',
    icon: '📷',
  },
  {
    name: '相册',
    key: 'photos',
    description: '访问图片相册',
    icon: '🖼️',
  },
  {
    name: '文件存储',
    key: 'storage',
    description: '访问设备存储空间',
    icon: '📁',
  },
  {
    name: '位置信息',
    key: 'location',
    description: '获取设备地理位置',
    icon: '📍',
  },
  {
    name: '蓝牙',
    key: 'bluetooth',
    description: '使用蓝牙功能',
    icon: '🔵',
  },
  {
    name: '通知推送',
    key: 'notification',
    description: '发送推送通知',
    icon: '🔔',
  },
];

export const PermissionManager = ({ onClose }: PermissionManagerProps) => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Record<string, PermissionState>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    const savedPermissions = appStore.getPermissionSettings();
    setPermissions(savedPermissions);

    for (const group of permissionGroups) {
      try {
        const result = await permissionService.checkPermission(group.key);
        setStatus((prev) => ({ ...prev, [group.key]: result }));
      } catch {
        setStatus((prev) => ({
          ...prev,
          [group.key]: { name: group.key, granted: false, prompt: false },
        }));
      }
    }
    setLoading(false);
  };

  const togglePermission = async (key: string) => {
    const currentState = permissions[key] ?? false;
    const newState = !currentState;

    setPermissions((prev) => ({ ...prev, [key]: newState }));
    appStore.setPermissionSetting(key, newState);

    if (newState) {
      try {
        const result = await permissionService.requestPermission(key);
        setStatus((prev) => ({ ...prev, [key]: result }));
      } catch (error) {
        console.error('权限请求失败:', error);
      }
    }
  };

  const getStatusBadge = (key: string) => {
    const s = status[key];
    if (s?.granted) return <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">已允许</span>;
    if (s?.prompt) return <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">询问</span>;
    if (!s) return <span className="px-2 py-0.5 bg-slate-500 text-white text-xs rounded-full">未知</span>;
    return <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">已拒绝</span>;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <header
        className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.625rem)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🔒</span>
          <h2 className="text-white font-bold text-sm">权限管理</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 active:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {permissionGroups.map((group) => (
              <div
                key={group.key}
                className={`p-3.5 rounded-xl border transition-all ${
                  permissions[group.key]
                    ? 'bg-slate-800 border-cyan-500/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl flex-shrink-0">{group.icon}</span>
                    <div className="min-w-0">
                      <h3 className="text-white font-medium text-sm">{group.name}</h3>
                      <p className="text-slate-400 text-xs truncate">{group.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusBadge(group.key)}
                    <button
                      onClick={() => togglePermission(group.key)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        permissions[group.key] ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          permissions[group.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer
        className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex-shrink-0"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      >
        <p className="text-slate-500 text-xs text-center">
          提示：权限用于打包后的APK正常运行
        </p>
      </footer>
    </div>
  );
};
