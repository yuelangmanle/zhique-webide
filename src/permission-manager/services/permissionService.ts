import { Permissions, type Permission as CapacitorPermission } from '@capawesome/capacitor-permissions';
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

  private getCapacitorPermissionName(name: string): CapacitorPermission | undefined {
    const mapping: Record<string, string> = {
      camera: 'CAMERA',
      photos: 'PHOTOS',
      location: 'LOCATION',
      bluetooth: 'BLUETOOTH',
      microphone: 'MICROPHONE',
      notification: 'NOTIFICATIONS',
    };
    return mapping[name] as CapacitorPermission | undefined;
  }

  getAvailablePermissions(): Permission[] {
    return this.permissions;
  }

  async checkPermission(name: string): Promise<PermissionState> {
    const permission = this.permissions.find((p) => p.name === name);
    if (!permission) throw new Error('Permission not found');

    const capPermission = this.getCapacitorPermissionName(name);
    if (!capPermission) {
      return {
        name,
        granted: false,
        prompt: false,
      };
    }

    const result = await Permissions.check({
      permissions: [capPermission],
    });

    const status = result.statuses[0];
    return {
      name,
      granted: status?.state === 'granted',
      prompt: status?.state === 'prompt',
    };
  }

  async requestPermission(name: string): Promise<PermissionState> {
    const permission = this.permissions.find((p) => p.name === name);
    if (!permission) throw new Error('Permission not found');

    const capPermission = this.getCapacitorPermissionName(name);
    if (!capPermission) {
      return {
        name,
        granted: false,
        prompt: false,
      };
    }

    const result = await Permissions.request({
      permissions: [capPermission],
    });

    const status = result.statuses[0];
    return {
      name,
      granted: status?.state === 'granted',
      prompt: status?.state === 'prompt',
    };
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