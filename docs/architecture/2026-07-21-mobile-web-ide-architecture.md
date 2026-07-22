# Mobile Web IDE - 技术架构文档

## 文档信息

| 字段 | 内容 |
|------|------|
| 项目名称 | Mobile Web IDE |
| 文档版本 | v1.0.0 |
| 创建日期 | 2026-07-21 |
| 最后更新 | 2026-07-21 |
| 状态 | 草案 |

---

## 一、架构概述

### 1.1 架构原则

1. **模块化设计**：每个功能模块职责单一，独立开发、测试和部署
2. **插件化扩展**：支持通过插件系统扩展功能
3. **平台无关性**：核心逻辑不依赖具体平台，便于跨平台迁移
4. **渐进增强**：基础功能可用，高级功能按需加载

### 1.2 架构风格

采用 **分层架构** + **模块化架构**，结合 **微前端** 思想：

```
┌─────────────────────────────────────────────────────────────┐
│                      UI 层 (Web)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Editor     │ │  Preview    │ │  AI Assistant│          │
│  │  Component  │ │  Component  │ │  Component  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Project    │ │  Permission │ │  APK Builder│          │
│  │  Manager    │ │  Manager    │ │  UI         │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    应用层 (TypeScript)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Editor     │ │  Preview    │ │  AI Service │          │
│  │  Service    │ │  Service    │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Project    │ │  Permission │ │  APK Builder│          │
│  │  Service    │ │  Service    │ │  Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    Capacitor 桥接层                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Capacitor Plugins (Camera, Filesystem, Location...)│   │
│  │  Custom Plugins (APK Builder, Permission Manager)   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    原生层 (Android)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  WebView    │ │  Gradle     │ │  Permission │          │
│  │  Container  │ │  Builder    │ │  System     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、模块划分

### 2.1 模块列表

| 模块名称 | 职责描述 | 技术栈 |
|---------|---------|--------|
| **editor** | 代码编辑器核心功能 | CodeMirror 6 + TypeScript |
| **preview** | 实时预览和调试控制台 | Android WebView + TypeScript |
| **ai-assistant** | AI 代码生成、调试、对话 | TypeScript + 多模型 API |
| **apk-builder** | APK 打包和配置 | Capacitor Plugin + Gradle |
| **permission-manager** | 权限配置和管理 | Capacitor Plugin + Android Permission |
| **project-manager** | 项目创建、管理、版本控制 | TypeScript + Capacitor Filesystem |
| **common** | 公共工具、类型定义、状态管理 | TypeScript |

### 2.2 模块依赖关系

```
editor ──→ common
preview ──→ common
ai-assistant ──→ common
apk-builder ──→ permission-manager ──→ common
project-manager ──→ common
```

---

## 三、目录结构

```
mobile-web-ide/
├── docs/                    # 文档目录
│   ├── specs/               # 产品需求文档
│   ├── architecture/        # 技术架构文档
│   ├── plans/               # 开发计划文档
│   ├── progress/            # 开发进度记录
│   └── handover/            # 交接文档
├── src/                     # 源代码目录
│   ├── editor/              # 代码编辑器模块
│   │   ├── components/      # React 组件
│   │   ├── hooks/           # React Hooks
│   │   ├── utils/           # 工具函数
│   │   └── index.ts         # 模块入口
│   ├── preview/             # 实时预览模块
│   │   ├── components/      # React 组件
│   │   ├── hooks/           # React Hooks
│   │   ├── utils/           # 工具函数
│   │   └── index.ts         # 模块入口
│   ├── ai-assistant/        # AI 助手模块
│   │   ├── services/        # API 服务
│   │   ├── components/      # React 组件
│   │   ├── prompts/         # 提示词模板
│   │   └── index.ts         # 模块入口
│   ├── apk-builder/         # APK 打包模块
│   │   ├── services/        # 打包服务
│   │   ├── components/      # React 组件
│   │   ├── templates/       # Android 项目模板
│   │   └── index.ts         # 模块入口
│   ├── permission-manager/  # 权限管理模块
│   │   ├── services/        # 权限服务
│   │   ├── components/      # React 组件
│   │   └── index.ts         # 模块入口
│   ├── project-manager/     # 项目管理模块
│   │   ├── services/        # 项目服务
│   │   ├── components/      # React 组件
│   │   └── index.ts         # 模块入口
│   ├── common/              # 公共模块
│   │   ├── types/           # 类型定义
│   │   ├── utils/           # 工具函数
│   │   ├── hooks/           # 公共 Hooks
│   │   ├── store/           # 全局状态管理
│   │   └── index.ts         # 模块入口
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── android/                 # Android 原生项目
│   ├── app/                 # 应用模块
│   │   ├── src/main/        # 源代码
│   │   │   ├── java/        # Java/Kotlin 代码
│   │   │   ├── res/         # 资源文件
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle.kts
│   ├── build.gradle.kts
│   └── settings.gradle.kts
├── ios/                     # iOS 原生项目（预留）
├── www/                     # Capacitor 静态资源
├── package.json
├── tsconfig.json
├── vite.config.ts
└── capacitor.config.ts
```

---

## 四、核心技术方案

### 4.1 代码编辑器

#### 技术选型：CodeMirror 6

**理由**：
- 现代化架构，性能优异
- 模块化设计，易于扩展
- 支持语法高亮、代码补全、Emmet 等
- 活跃的社区和丰富的插件

**核心配置**：

```typescript
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { html, css, javascript } from '@codemirror/lang-html';
import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';

const createEditor = (container: HTMLElement) => {
  const state = EditorState.create({
    doc: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n</body>\n</html>',
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      history(),
      html(),
      css(),
      javascript(),
      autocompletion(),
      closeBrackets(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...closeBracketsKeymap,
      ]),
    ],
  });
  
  const view = new EditorView({
    state,
    parent: container,
  });
  
  return view;
};
```

### 4.2 实时预览

#### 技术选型：Android WebView + IFrame

**理由**：
- Android WebView 原生支持，性能好
- IFrame 隔离代码执行环境，安全性高
- 支持 console.log 捕获和调试

**核心逻辑**：

```typescript
interface PreviewService {
  render(html: string, css: string, js: string): void;
  getConsoleOutput(): string[];
  clearConsole(): void;
}

class WebViewPreviewService implements PreviewService {
  private webView: HTMLIFrameElement;
  private consoleOutput: string[] = [];

  constructor(container: HTMLElement) {
    this.webView = document.createElement('iframe');
    this.webView.sandbox.add('allow-scripts', 'allow-modals');
    container.appendChild(this.webView);
    this.setupConsoleCapture();
  }

  render(html: string, css: string, js: string): void {
    const documentContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${this.getConsoleOverride()}${js}</script>
      </body>
      </html>
    `;
    this.webView.srcdoc = documentContent;
  }

  private getConsoleOverride(): string {
    return `
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog.apply(console, args);
        window.parent.postMessage({
          type: 'console',
          message: JSON.stringify(args)
        }, '*');
      };
    `;
  }

  setupConsoleCapture(): void {
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'console') {
        this.consoleOutput.push(event.data.message);
      }
    });
  }

  getConsoleOutput(): string[] {
    return this.consoleOutput;
  }

  clearConsole(): void {
    this.consoleOutput = [];
  }
}
```

### 4.3 AI 助手

#### 技术选型：多模型 API + Axios

**支持模型**：
- OpenAI (GPT-3.5/4)
- 豆包
- 文心一言
- Gemini

**核心设计**：

```typescript
interface AIProvider {
  name: string;
  apiKey: string;
  baseURL: string;
  model: string;
}

interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider: string = 'openai';

  registerProvider(name: string, provider: AIProvider): void {
    this.providers.set(name, provider);
  }

  async generateCode(prompt: string): Promise<AIResponse> {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) throw new Error('No provider configured');

    const response = await axios.post(`${provider.baseURL}/chat/completions`, {
      model: provider.model,
      messages: [{
        role: 'system',
        content: 'You are a web development assistant. Generate clean, well-structured HTML/CSS/JavaScript code.'
      }, {
        role: 'user',
        content: prompt
      }],
      max_tokens: 2000,
    }, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      content: response.data.choices[0].message.content,
      model: provider.model,
      usage: response.data.usage,
    };
  }

  async debugCode(code: string, error: string): Promise<AIResponse> {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) throw new Error('No provider configured');

    const response = await axios.post(`${provider.baseURL}/chat/completions`, {
      model: provider.model,
      messages: [{
        role: 'system',
        content: 'You are a web development debugger. Analyze code errors and provide fix suggestions.'
      }, {
        role: 'user',
        content: `Code:\n${code}\n\nError:\n${error}\n\nPlease provide a fix.`
      }],
      max_tokens: 2000,
    }, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      content: response.data.choices[0].message.content,
      model: provider.model,
      usage: response.data.usage,
    };
  }
}
```

### 4.4 APK 打包

#### 技术选型：Capacitor Plugin + Gradle

**核心流程**：

```typescript
interface APKBuildConfig {
  packageName: string;
  versionName: string;
  versionCode: number;
  icon: string;
  permissions: string[];
  webFiles: string;
}

interface BuildResult {
  success: boolean;
  apkPath?: string;
  error?: string;
}

class APKBuilderService {
  async build(config: APKBuildConfig): Promise<BuildResult> {
    try {
      const result = await Capacitor.Plugins.APKBuilder.build({
        ...config,
      });
      return {
        success: result.success,
        apkPath: result.apkPath,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

**Android Plugin 设计**：

```kotlin
class APKBuilderPlugin : Plugin() {
  @PluginMethod
  fun build(call: PluginCall) {
    val packageName = call.getString("packageName") ?: return
    val versionName = call.getString("versionName") ?: "1.0.0"
    val versionCode = call.getInt("versionCode") ?: 1
    val permissions = call.getArray("permissions")?.toTypedArray() ?: arrayOf()
    
    // 创建 Android 项目模板
    // 配置 AndroidManifest.xml
    // 配置 build.gradle
    // 复制 web 文件
    // 执行 Gradle 构建
    // 返回 APK 路径
    
    call.resolve(jsObject {
      put("success", true)
      put("apkPath", apkPath)
    })
  }
}
```

### 4.5 权限管理

#### 技术选型：Capacitor Plugins + Android Permission System

**核心设计**：

```typescript
interface Permission {
  name: string;
  androidName: string;
  description: string;
  icon: string;
  default: boolean;
}

interface PermissionState {
  name: string;
  granted: boolean;
  prompt: boolean;
}

class PermissionManagerService {
  private permissions: Permission[] = [
    { name: 'camera', androidName: 'android.permission.CAMERA', description: '相机', icon: '📷', default: false },
    { name: 'photos', androidName: 'android.permission.READ_MEDIA_IMAGES', description: '相册', icon: '🖼️', default: false },
    { name: 'location', androidName: 'android.permission.ACCESS_FINE_LOCATION', description: '位置', icon: '📍', default: false },
    { name: 'bluetooth', androidName: 'android.permission.BLUETOOTH_CONNECT', description: '蓝牙', icon: '🔵', default: false },
    { name: 'storage', androidName: 'android.permission.MANAGE_EXTERNAL_STORAGE', description: '文件', icon: '📁', default: false },
    { name: 'microphone', androidName: 'android.permission.RECORD_AUDIO', description: '麦克风', icon: '🎤', default: false },
  ];

  async checkPermission(name: string): Promise<PermissionState> {
    const result = await Capacitor.Plugins.Permissions.check({
      permission: name,
    });
    return {
      name,
      granted: result.status === 'granted',
      prompt: result.status === 'prompt',
    };
  }

  async requestPermission(name: string): Promise<PermissionState> {
    const result = await Capacitor.Plugins.Permissions.request({
      permission: name,
    });
    return {
      name,
      granted: result.status === 'granted',
      prompt: result.status !== 'denied',
    };
  }

  getAvailablePermissions(): Permission[] {
    return this.permissions;
  }
}
```

### 4.6 项目管理

#### 技术选型：Capacitor Filesystem + Simple Git

**核心设计**：

```typescript
interface Project {
  id: string;
  name: string;
  type: 'single' | 'folder';
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectFile {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
}

class ProjectManagerService {
  private projects: Project[] = [];

  async createProject(name: string, type: 'single' | 'folder'): Promise<Project> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const path = `projects/${id}`;
    
    await Capacitor.Plugins.Filesystem.mkdir({
      path,
      directory: Capacitor.Directory.Data,
      recursive: true,
    });

    const project: Project = {
      id,
      name,
      type,
      path,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.projects.push(project);
    await this.saveProjects();
    
    return project;
  }

  async saveProjects(): Promise<void> {
    await Capacitor.Plugins.Filesystem.writeFile({
      path: 'projects.json',
      data: JSON.stringify(this.projects),
      directory: Capacitor.Directory.Data,
    });
  }

  async loadProjects(): Promise<Project[]> {
    try {
      const result = await Capacitor.Plugins.Filesystem.readFile({
        path: 'projects.json',
        directory: Capacitor.Directory.Data,
      });
      this.projects = JSON.parse(result.data);
    } catch {
      this.projects = [];
    }
    return this.projects;
  }

  async readFile(projectId: string, filePath: string): Promise<string> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const result = await Capacitor.Plugins.Filesystem.readFile({
      path: `${project.path}/${filePath}`,
      directory: Capacitor.Directory.Data,
    });
    
    return result.data;
  }

  async writeFile(projectId: string, filePath: string, content: string): Promise<void> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    await Capacitor.Plugins.Filesystem.writeFile({
      path: `${project.path}/${filePath}`,
      data: content,
      directory: Capacitor.Directory.Data,
    });
    
    project.updatedAt = new Date();
    await this.saveProjects();
  }
}
```

---

## 五、状态管理

### 5.1 全局状态

```typescript
interface AppState {
  currentProject: Project | null;
  openedFiles: ProjectFile[];
  selectedFile: ProjectFile | null;
  editorContent: Record<string, string>;
  previewMode: 'split' | 'full' | 'editor-only' | 'preview-only';
  aiProvider: string;
  aiProviders: AIProvider[];
  buildConfig: APKBuildConfig;
  permissionSettings: Record<string, boolean>;
}

class AppStore {
  private state: AppState = {
    currentProject: null,
    openedFiles: [],
    selectedFile: null,
    editorContent: {},
    previewMode: 'split',
    aiProvider: 'openai',
    aiProviders: [],
    buildConfig: {
      packageName: 'com.example.app',
      versionName: '1.0.0',
      versionCode: 1,
      icon: '',
      permissions: [],
      webFiles: '',
    },
    permissionSettings: {},
  };

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  updateState(updates: Partial<AppState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener());
  }

  getState(): AppState {
    return this.state;
  }
}

export const appStore = new AppStore();
```

---

## 六、API 设计

### 6.1 AI 助手 API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `generateCode(prompt)` | `prompt: string` | `Promise<AIResponse>` | 根据提示生成代码 |
| `debugCode(code, error)` | `code: string, error: string` | `Promise<AIResponse>` | 分析代码错误 |
| `chat(message)` | `message: string` | `Promise<AIResponse>` | 智能对话 |
| `registerProvider(name, provider)` | `name: string, provider: AIProvider` | `void` | 注册 AI 提供商 |

### 6.2 APK Builder API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `build(config)` | `config: APKBuildConfig` | `Promise<BuildResult>` | 构建 APK |
| `getTemplates()` | 无 | `Promise<string[]>` | 获取可用模板 |
| `validateConfig(config)` | `config: APKBuildConfig` | `Promise<ValidationResult>` | 验证配置 |

### 6.3 Permission Manager API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `checkPermission(name)` | `name: string` | `Promise<PermissionState>` | 检查权限状态 |
| `requestPermission(name)` | `name: string` | `Promise<PermissionState>` | 请求权限 |
| `checkAllPermissions()` | 无 | `Promise<Record<string, PermissionState>>` | 检查所有权限 |
| `getAvailablePermissions()` | 无 | `Promise<Permission[]>` | 获取可用权限列表 |

### 6.4 Project Manager API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `createProject(name, type)` | `name: string, type: string` | `Promise<Project>` | 创建项目 |
| `loadProjects()` | 无 | `Promise<Project[]>` | 加载项目列表 |
| `deleteProject(id)` | `id: string` | `Promise<void>` | 删除项目 |
| `readFile(projectId, filePath)` | `projectId: string, filePath: string` | `Promise<string>` | 读取文件 |
| `writeFile(projectId, filePath, content)` | `projectId: string, filePath: string, content: string` | `Promise<void>` | 写入文件 |

---

## 七、安全设计

### 7.1 API Key 安全

- **加密存储**：使用 AES-256 加密存储 API Key
- **运行时解密**：仅在调用 API 时解密，用完即销毁
- **权限控制**：只有 AI 服务模块可以访问 API Key

### 7.2 代码执行安全

- **沙箱隔离**：预览代码在 IFrame 沙箱中执行
- **权限限制**：限制 IFrame 的权限（禁止跨域、禁止文件访问）
- **内容过滤**：过滤恶意代码（如 `eval`、`document.write`）

### 7.3 网络安全

- **HTTPS**：所有网络请求使用 HTTPS
- **证书验证**：验证服务器证书
- **请求签名**：API 请求添加签名验证

---

## 八、性能优化

### 8.1 代码编辑器优化

- **延迟加载**：按需加载语法高亮和语言支持
- **虚拟滚动**：对于大文件使用虚拟滚动
- **增量解析**：只解析修改的部分

### 8.2 实时预览优化

- **增量更新**：只更新修改的部分，而非重新渲染整个页面
- **缓存策略**：缓存编译结果，减少重复计算
- **Web Worker**：将代码编译移到 Web Worker

### 8.3 APK 构建优化

- **增量构建**：只重新构建修改的部分
- **缓存 Gradle**：缓存 Gradle 构建结果
- **并行构建**：并行处理多个构建任务

---

## 九、测试策略

### 9.1 单元测试

- **测试框架**：Jest + React Testing Library
- **测试范围**：所有服务层代码、工具函数、状态管理
- **覆盖率目标**：> 70%

### 9.2 集成测试

- **测试框架**：Playwright
- **测试范围**：模块间的集成、API 调用
- **测试场景**：正常流程、异常流程、边界条件

### 9.3 端到端测试

- **测试框架**：Capacitor E2E + Appium
- **测试范围**：完整的用户流程
- **测试场景**：创建项目、编辑代码、预览、打包

---

## 十、部署策略

### 10.1 Android 部署

- **构建工具**：Gradle
- **签名**：使用 JKS 签名文件
- **发布渠道**：Google Play、华为应用市场、小米应用商店

### 10.2 版本管理

- **版本号规则**：Semantic Versioning (MAJOR.MINOR.PATCH)
- **更新日志**：每次版本更新编写更新日志
- **热更新**：支持 Web 内容的热更新

---

## 十一、可维护性设计

### 11.1 代码规范

- **TypeScript**：全项目使用 TypeScript
- **ESLint**：代码质量检查
- **Prettier**：代码格式化

### 11.2 文档规范

- **README**：项目说明文档
- **API 文档**：自动生成 API 文档
- **注释规范**：使用 JSDoc 注释

### 11.3 日志规范

- **结构化日志**：使用 JSON 格式记录日志
- **日志级别**：DEBUG、INFO、WARN、ERROR
- **日志存储**：本地存储 + 可选远程日志

---

## 十二、扩展设计

### 12.1 插件系统

```typescript
interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  entry: string;
  dependencies: string[];
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  registerPlugin(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  loadPlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error('Plugin not found');
    
    return import(plugin.entry);
  }
}
```

### 12.2 主题系统

```typescript
interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    error: string;
    success: string;
  };
}

class ThemeManager {
  private themes: Map<string, Theme> = new Map();
  private currentTheme: string = 'default';

  registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  applyTheme(id: string): void {
    const theme = this.themes.get(id);
    if (!theme) throw new Error('Theme not found');
    
    this.currentTheme = id;
    // 应用主题样式
  }
}
```