import { useState, useEffect } from 'react';
import { permissionService } from '../services/permissionService';
import { appStore } from '../../common/store/appStore';
import { type PermissionState } from '../../common/types';

interface PermissionManagerProps {
  onClose?: () => void;
}

const permissionGroups = [
  {
    name: 'Camera',
    key: 'camera',
    description: 'Access device camera',
    icon: '📷',
  },
  {
    name: 'Photos',
    key: 'photos',
    description: 'Access photo gallery',
    icon: '🖼️',
  },
  {
    name: 'Files',
    key: 'storage',
    description: 'Access device storage',
    icon: '📁',
  },
  {
    name: 'Location',
    key: 'location',
    description: 'Access device location',
    icon: '📍',
  },
  {
    name: 'Bluetooth',
    key: 'bluetooth',
    description: 'Access Bluetooth',
    icon: '🔵',
  },
  {
    name: 'Notifications',
    key: 'notification',
    description: 'Send push notifications',
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
        console.error('Failed to request permission:', error);
      }
    }
  };

  const getStatusBadge = (key: string) => {
    const s = status[key];
    if (s?.granted) return <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Granted</span>;
    if (s?.prompt) return <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">Ask</span>;
    if (!s) return <span className="px-2 py-0.5 bg-gray-500 text-white text-xs rounded-full">Unknown</span>;
    return <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">Denied</span>;
  };

  return (
    <div className="h-full flex flex-col bg-dark-900">
      <header className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔒</span>
          <h2 className="text-white font-semibold">Permission Manager</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {permissionGroups.map((group) => (
              <div
                key={group.key}
                className={`p-4 rounded-lg border transition-all ${
                  permissions[group.key]
                    ? 'bg-dark-700 border-primary-500/30'
                    : 'bg-dark-800 border-dark-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{group.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{group.name}</h3>
                      <p className="text-gray-400 text-sm">{group.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(group.key)}
                    <button
                      onClick={() => togglePermission(group.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        permissions[group.key] ? 'bg-primary-500' : 'bg-dark-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          permissions[group.key] ? 'translate-x-7' : 'translate-x-1'
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

      <footer className="px-4 py-3 bg-dark-800 border-t border-dark-700">
        <p className="text-gray-400 text-xs text-center">
          Note: Permissions are required for the generated APK to function properly
        </p>
      </footer>
    </div>
  );
};
