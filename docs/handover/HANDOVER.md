# Mobile Web IDE - 项目交接文档

## 文档信息

| 字段 | 内容 |
|------|------|
| 项目名称 | Mobile Web IDE |
| 文档版本 | v1.0.0 |
| 创建日期 | 2026-07-21 |
| 交接人 | MobileWebIDE Team |
| 接收人 | [待指定] |
| 交接日期 | [待指定] |

---

## 一、项目概述

### 1.1 项目简介

Mobile Web IDE 是一款运行在 Android 移动端的 Web 开发工具，允许用户在手机上编写、运行和调试 HTML/CSS/JavaScript 代码，并将其打包成可安装的 Android APK 文件。

### 1.2 核心功能

- 代码编辑器：支持 HTML/CSS/JS 语法高亮、代码补全、Emmet
- 实时预览：WebView 实时渲染、控制台输出捕获
- AI 助手：多模型 API 支持、代码生成、代码调试、智能对话
- APK 打包：自定义包名、版本号、图标配置、权限预配置
- 权限管理：打包前权限预配置、运行时动态申请
- 项目管理：单文件/文件夹项目、多文件编辑、项目导入导出

### 1.3 技术栈

| 模块 | 技术 | 版本 |
|------|------|------|
| 主框架 | Capacitor | 8.x |
| 前端框架 | React | 19.x |
| 语言 | TypeScript | 7.x |
| 构建工具 | Vite | 8.x |
| 代码编辑器 | CodeMirror | 6.x |

---

## 二、项目结构

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
│   ├── preview/             # 实时预览模块
│   ├── ai-assistant/        # AI 助手模块
│   ├── apk-builder/         # APK 打包模块
│   ├── permission-manager/  # 权限管理模块
│   ├── project-manager/     # 项目管理模块
│   ├── common/              # 公共模块
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── android/                 # Android 原生项目
├── ios/                     # iOS 原生项目（预留）
├── www/                     # Capacitor 静态资源
└── package.json             # 依赖配置
```

---

## 三、开发环境

### 3.1 环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 18 | 前端开发 |
| npm/pnpm | latest | 包管理 |
| Android Studio | latest | Android 开发 |
| Java JDK | ≥ 17 | Gradle 构建 |

### 3.2 环境配置

1. 安装 Node.js 18+
2. 安装 Android Studio 和 SDK（API 33+）
3. 配置 JAVA_HOME 环境变量
4. 配置 ANDROID_SDK_ROOT 环境变量

---

## 四、开发流程

### 4.1 命令说明

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 代码质量检查 |
| `npm run lint:fix` | 自动修复代码问题 |
| `npm run format` | 代码格式化 |
| `npm run test` | 运行测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run cap:sync` | 同步到 Android 项目 |
| `npm run cap:open` | 打开 Android Studio |
| `npm run cap:build` | 构建 APK |

### 4.2 分支策略

- `main`: 主分支，稳定版本
- `develop`: 开发分支，功能集成
- `feature/*`: 功能分支，开发新功能
- `bugfix/*`: 修复分支，修复 Bug
- `release/*`: 发布分支，准备发布

### 4.3 提交规范

采用 Conventional Commits：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

---

## 五、模块说明

### 5.1 代码编辑器模块

**职责**: 提供 IDE 级别的代码编辑功能
**位置**: `src/editor/`
**技术**: CodeMirror 6 + TypeScript
**核心功能**: 语法高亮、代码补全、Emmet、行号显示、代码折叠

### 5.2 实时预览模块

**职责**: 实时渲染和调试用户代码
**位置**: `src/preview/`
**技术**: WebView + IFrame + TypeScript
**核心功能**: 实时预览、控制台输出捕获、网络请求查看

### 5.3 AI 助手模块

**职责**: 提供 AI 辅助开发能力
**位置**: `src/ai-assistant/`
**技术**: Axios + 多模型 API + TypeScript
**核心功能**: 代码生成、代码调试、智能对话、多模型支持

### 5.4 APK 打包模块

**职责**: 将 Web 代码打包成 APK 文件
**位置**: `src/apk-builder/`
**技术**: Capacitor Plugin + Gradle + TypeScript
**核心功能**: 包名配置、版本号配置、图标配置、权限配置、Gradle 构建

### 5.5 权限管理模块

**职责**: 管理 Android 权限配置和申请
**位置**: `src/permission-manager/`
**技术**: Capacitor Permissions + TypeScript
**核心功能**: 权限列表展示、打包前预配置、运行时动态申请

### 5.6 项目管理模块

**职责**: 管理项目的创建、编辑和存储
**位置**: `src/project-manager/`
**技术**: Capacitor Filesystem + TypeScript
**核心功能**: 项目创建、文件读写、项目列表管理

### 5.7 公共模块

**职责**: 提供全局状态管理和工具函数
**位置**: `src/common/`
**技术**: TypeScript
**核心功能**: 类型定义、工具函数、状态管理、自定义 Hooks

---

## 六、常见问题

### 6.1 构建问题

**问题**: Gradle 构建失败
**解决方案**: 
1. 检查 JAVA_HOME 环境变量配置
2. 检查 Android SDK 版本
3. 清理 Gradle 缓存

**问题**: npm 依赖安装失败
**解决方案**:
1. 使用 `--legacy-peer-deps` 参数
2. 清理 node_modules 和 package-lock.json
3. 使用 pnpm 替代 npm

### 6.2 权限问题

**问题**: 权限申请不生效
**解决方案**:
1. 检查 AndroidManifest.xml 权限声明
2. 确保在 Android 6.0+ 上使用运行时权限
3. 检查权限名称是否正确

### 6.3 编辑器问题

**问题**: 编辑器性能卡顿
**解决方案**:
1. 实现虚拟滚动
2. 延迟加载语法高亮
3. 增量解析代码

---

## 七、联系方式

| 角色 | 姓名 | 联系方式 |
|------|------|---------|
| 产品经理 | MobileWebIDE Team | - |
| 前端开发 | MobileWebIDE Team | - |
| Android 开发 | MobileWebIDE Team | - |
| 测试工程师 | MobileWebIDE Team | - |

---

## 八、附件

### 8.1 文档链接

- [产品需求文档](docs/specs/2026-07-21-mobile-web-ide-prd.md)
- [技术架构文档](docs/architecture/2026-07-21-mobile-web-ide-architecture.md)
- [开发进度计划](docs/plans/2026-07-21-mobile-web-ide-development-plan.md)
- [更新日志](docs/plans/CHANGELOG.md)

### 8.2 资源链接

- [GitHub 仓库]: -
- [CI/CD 流水线]: -
- [应用商店链接]: -