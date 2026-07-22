import { APKBuildConfig, BuildResult } from '@/common/types';
import { permissionService } from '@/permission-manager/services/permissionService';

class APKBuilderService {
  async exportConfig(config: APKBuildConfig): Promise<BuildResult> {
    try {
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join('\n'),
        };
      }

      const configJson = this.generateConfigJson(config);
      return {
        success: true,
        configJson,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  private generateAndroidManifest(packageName: string, permissions: string[], appName: string): string {
    const permissionDeclarations = permissions
      .map((perm) => `    <uses-permission android:name="${perm}" />`)
      .join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    ${permissionDeclarations}

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:label="${appName}"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`;
  }

  private generateBuildGradle(packageName: string, versionName: string, versionCode: number): string {
    return `android {
    namespace "${packageName}"
    compileSdk 34

    defaultConfig {
        applicationId "${packageName}"
        minSdk 21
        targetSdk 34
        versionCode ${versionCode}
        versionName "${versionName}"
    }
}`;
  }

  private generateConfigJson(config: APKBuildConfig): string {
    const androidPermissions = permissionService.getAndroidPermissionNames(config.permissions);
    const manifest = this.generateAndroidManifest(
      config.packageName,
      androidPermissions,
      config.appName || '我的应用',
    );
    const buildGradle = this.generateBuildGradle(config.packageName, config.versionName, config.versionCode);

    const fullConfig = {
      appConfig: {
        appName: config.appName || '我的应用',
        packageName: config.packageName,
        versionName: config.versionName,
        versionCode: config.versionCode,
        icon: config.icon,
        permissions: config.permissions,
        androidPermissions,
      },
      webFiles: config.webFiles,
      manifest,
      buildGradle,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(fullConfig, null, 2);
  }

  validateConfig(config: APKBuildConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.packageName || !/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/.test(config.packageName)) {
      errors.push('包名格式无效（需小写字母和点号）');
    }

    if (!config.versionName || !/^(\d+\.)*\d+$/.test(config.versionName)) {
      errors.push('版本号格式无效（需 X.Y.Z 格式）');
    }

    if (!config.versionCode || config.versionCode <= 0) {
      errors.push('版本代码必须为正数');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const apkBuilderService = new APKBuilderService();
