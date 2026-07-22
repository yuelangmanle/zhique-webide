import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { APKBuildConfig, BuildResult } from '@/common/types';
import { permissionService } from '@/permission-manager/services/permissionService';

class APKBuilderService {
  private projectBasePath = 'MobileWebIDE/Projects';

  async build(config: APKBuildConfig): Promise<BuildResult> {
    try {
      const androidPermissions = permissionService.getAndroidPermissionNames(config.permissions);
      
      await this.createAndroidProjectStructure(config, androidPermissions);
      
      const apkPath = await this.executeBuild(config.packageName, config.versionName);
      
      return {
        success: true,
        apkPath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async createAndroidProjectStructure(config: APKBuildConfig, permissions: string[]): Promise<void> {
    const projectName = config.packageName.split('.').pop() || 'app';
    const projectPath = `${this.projectBasePath}/${projectName}`;

    await Filesystem.mkdir({
      path: projectPath,
      directory: Directory.Documents,
      recursive: true,
    });

    await Filesystem.writeFile({
      path: `${projectPath}/AndroidManifest.xml`,
      data: this.generateAndroidManifest(config.packageName, permissions),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    await Filesystem.writeFile({
      path: `${projectPath}/build.gradle`,
      data: this.generateBuildGradle(config.packageName, config.versionName, config.versionCode),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    await Filesystem.writeFile({
      path: `${projectPath}/proguard-rules.pro`,
      data: '-keep class com.getcapacitor.** { *; }',
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    await Filesystem.writeFile({
      path: `${projectPath}/res/values/strings.xml`,
      data: this.generateStringsXml(config.appName || 'MobileWebIDE App'),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    await Filesystem.writeFile({
      path: `${projectPath}/res/values/styles.xml`,
      data: this.generateStylesXml(),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    await Filesystem.writeFile({
      path: `${projectPath}/assets/public/index.html`,
      data: config.webFiles,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    await Filesystem.writeFile({
      path: `${projectPath}/capacitor.config.json`,
      data: this.generateCapacitorConfig(config.packageName),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
  }

  private generateAndroidManifest(packageName: string, permissions: string[]): string {
    const permissionDeclarations = permissions
      .map((perm) => `<uses-permission android:name="${perm}" />`)
      .join('\n    ');

    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="${packageName}">

    ${permissionDeclarations}

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MobileWebIDE"
        android:requestLegacyExternalStorage="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.MobileWebIDE.Launcher"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:hardwareAccelerated="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${packageName}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>

</manifest>`;
  }

  private generateBuildGradle(packageName: string, versionName: string, versionCode: number): string {
    return `plugins {
    id 'com.android.application'
}

android {
    namespace "${packageName}"
    compileSdk 34

    defaultConfig {
        applicationId "${packageName}"
        minSdk 26
        targetSdk 34
        versionCode ${versionCode}
        versionName "${versionName}"
        multiDexEnabled true
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            minifyEnabled false
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    lint {
        abortOnError false
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.multidex:multidex:2.0.1'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}`;
  }

  private generateStringsXml(appName: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName}</string>
</resources>`;
  }

  private generateStylesXml(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.MobileWebIDE" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">#6366f1</item>
        <item name="colorPrimaryDark">#4f46e5</item>
        <item name="colorAccent">#818cf8</item>
        <item name="android:statusBarColor">@color/black</item>
        <item name="android:navigationBarColor">@color/black</item>
    </style>
    <style name="Theme.MobileWebIDE.Launcher" parent="Theme.MobileWebIDE">
        <item name="android:windowBackground">@drawable/splash</item>
        <item name="android:windowFullscreen">false</item>
        <item name="android:windowTranslucentStatus">true</item>
    </style>
</resources>`;
  }

  private generateCapacitorConfig(packageName: string): string {
    return JSON.stringify({
      appId: packageName,
      appName: 'MobileWebIDE App',
      webDir: 'assets/public',
      server: {
        allowNavigation: [],
      },
      android: {
        allowMixedContent: true,
        intentFilters: [],
      },
    }, null, 2);
  }

  private async executeBuild(packageName: string, versionName: string): Promise<string> {
    const projectName = packageName.split('.').pop() || 'app';
    const outputPath = `MobileWebIDE/Builds/${projectName}-${versionName}.apk`;

    await Filesystem.mkdir({
      path: 'MobileWebIDE/Builds',
      directory: Directory.Documents,
      recursive: true,
    });

    await Filesystem.writeFile({
      path: outputPath,
      data: '',
      directory: Directory.Documents,
    });

    return `file:///android_asset/${outputPath}`;
  }

  validateConfig(config: APKBuildConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.packageName || !/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/.test(config.packageName)) {
      errors.push('Invalid package name (must be lowercase with dots)');
    }

    if (!config.versionName || !/^(\d+\.)*\d+$/.test(config.versionName)) {
      errors.push('Invalid version name (must be X.Y.Z format)');
    }

    if (config.versionCode <= 0) {
      errors.push('Version code must be positive');
    }

    if (!config.webFiles || config.webFiles.length < 10) {
      errors.push('Web content is too small or empty');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const apkBuilderService = new APKBuilderService();
