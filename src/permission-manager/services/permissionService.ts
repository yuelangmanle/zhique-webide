import { Permission, PermissionState } from '@/common/types';

class PermissionService {
  private permissions: Permission[] = [
    {
      name: 'camera',
      androidName: 'android.permission.CAMERA',
      description: '相机',
      icon: '📷',
      default: false,
    },
    {
      name: 'photos',
      androidName: 'android.permission.READ_MEDIA_IMAGES',
      description: '相册',
      icon: '🖼️',
      default: false,
    },
    {
      name: 'location',
      androidName: 'android.permission.ACCESS_FINE_LOCATION',
      description: '位置',
      icon: '📍',
      default: false,
    },
    {
      name: 'bluetooth',
      androidName: 'android.permission.BLUETOOTH_CONNECT',
      description: '蓝牙',
      icon: '🔵',
      default: false,
    },
    {
      name: 'storage',
      androidName: 'android.permission.MANAGE_EXTERNAL_STORAGE',
      description: '文件',
      icon: '📁',
      default: false,
    },
    {
      name: 'microphone',
      androidName: 'android.permission.RECORD_AUDIO',
      description: '麦克风',
      icon: '🎤',
      default: false,
    },
    {
      name: 'notification',
      androidName: 'android.permission.POST_NOTIFICATIONS',
      description: '通知',
      icon: '🔔',
      default: false,
    },
    {
      name: 'wifi',
      androidName: 'android.permission.ACCESS_WIFI_STATE',
      description: 'WiFi',
      icon: '📶',
      default: false,
    },
  ];

  private webPermissionMap: Record<string, string> = {
    camera: 'camera',
    microphone: 'microphone',
    location: 'geolocation',
    notification: 'notifications',
  };

  getAvailablePermissions(): Permission[] {
    return this.permissions;
  }

  async checkPermission(name: string): Promise<PermissionState> {
    const webName = this.webPermissionMap[name];
    if (!webName || !navigator.permissions) {
      return { name, granted: false, prompt: true };
    }

    try {
      const result = await navigator.permissions.query({
        name: webName as PermissionName,
      });
      return {
        name,
        granted: result.state === 'granted',
        prompt: result.state === 'prompt',
      };
    } catch {
      return { name, granted: false, prompt: true };
    }
  }

  async requestPermission(name: string): Promise<PermissionState> {
    try {
      if (name === 'camera' || name === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({
          [name === 'camera' ? 'video' : 'audio']: true,
        });
        stream.getTracks().forEach((t) => t.stop());
        return { name, granted: true, prompt: false };
      }
      if (name === 'location') {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        return { name, granted: true, prompt: false };
      }
      if (name === 'notification') {
        if ('Notification' in window) {
          const result = await Notification.requestPermission();
          return { name, granted: result === 'granted', prompt: result === 'default' };
        }
      }
    } catch {
      // 请求被拒绝
    }
    return { name, granted: false, prompt: false };
  }

  async checkAllPermissions(): Promise<Record<string, PermissionState>> {
    const results: Record<string, PermissionState> = {};
    for (const permission of this.permissions) {
      results[permission.name] = await this.checkPermission(permission.name);
    }
    return results;
  }

  getAndroidPermissionNames(permissionNames: string[]): string[] {
    return permissionNames
      .map((name) => {
        const permission = this.permissions.find((p) => p.name === name);
        return permission?.androidName;
      })
      .filter(Boolean) as string[];
  }
}

export const permissionService = new PermissionService();
