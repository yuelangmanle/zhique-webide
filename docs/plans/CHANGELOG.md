# 更新日志

## [v1.0.0] - 2026-07-21

### ✨ 新增功能

- **代码编辑器模块**：基于 CodeMirror 6 的代码编辑器，支持 HTML/CSS/JS 语法高亮、代码补全、行号显示、历史记录、深色主题
- **实时预览模块**：通过 iframe 实现实时预览，支持控制台输出捕获和消息传递，移动端支持编辑器/预览切换
- **AI 助手模块**：集成大语言模型 API，支持代码生成、代码调试和智能对话功能，支持自定义 API 配置
- **APK 打包模块**：支持自定义包名、版本号、应用名称、权限配置，自动生成 AndroidManifest.xml、build.gradle、资源文件等
- **权限管理模块**：支持相机、相册、位置、蓝牙、麦克风、通知、文件存储等权限的检查和申请，提供可视化权限管理 UI
- **项目管理模块**：支持单文件和文件夹项目的创建、读取、更新和删除，使用 Capacitor Filesystem 进行本地存储
- **状态管理**：基于发布订阅模式的全局状态管理，支持响应式数据更新

### 📱 移动端适配

- **响应式布局**：完整的移动端适配，支持小屏幕设备
- **底部导航栏**：移动端专属底部导航，快速切换编辑器、AI 助手、APK 构建
- **侧边栏切换**：移动端支持抽屉式侧边栏，点击遮罩关闭
- **编辑器/预览切换**：移动端支持编辑器和预览面板的独立显示切换
- **触摸优化**：按钮、开关等控件针对触摸操作进行优化

### 🎨 UI/UX 设计

- **Tailwind CSS 3**：集成 Tailwind CSS，实现现代化样式
- **深色主题**：统一的深色配色方案，适合长时间编码
- **自定义颜色**：自定义主题色（Primary: #6366f1）和深色系列颜色
- **动画效果**：平滑的过渡动画和状态切换效果
- **JetBrains Mono 字体**：集成专业编程字体

### 📁 项目结构

- 采用模块化架构设计，各模块职责清晰
- 目录结构：ai-assistant、apk-builder、editor、permission-manager、preview、project-manager、common
- 统一的类型定义、工具函数和状态管理

### 📝 文档更新

- 编写产品需求文档（PRD）：docs/specs/2026-07-21-mobile-web-ide-prd.md
- 编写技术架构文档：docs/architecture/2026-07-21-mobile-web-ide-architecture.md
- 编写开发进度计划：docs/plans/2026-07-21-mobile-web-ide-development-plan.md
- 创建更新日志：docs/plans/CHANGELOG.md
- 创建交接文档：docs/handover/HANDOVER.md

### 🛠️ 技术栈

- React 19 + TypeScript
- Capacitor 8.x（Android 平台）
- CodeMirror 6（代码编辑器）
- Vite 8（构建工具）
- Tailwind CSS 3（样式框架）
- Axios（HTTP 请求）

### 📋 配置文件

- package.json：项目依赖和脚本配置
- tsconfig.json：TypeScript 编译配置（含路径别名）
- vite.config.ts：Vite 构建配置
- tailwind.config.js：Tailwind CSS 配置
- capacitor.config.json：Capacitor 配置
- AndroidManifest.xml：Android 权限和配置
- .eslintrc.json：ESLint 配置
- .prettierrc：Prettier 配置
- .gitignore：Git 忽略文件

### 🔧 修复问题

- 修复 CodeMirror 导入错误（css/javascript 模块）
- 修复 TypeScript 路径别名配置
- 修复权限服务类型定义错误
- 修复 CSS @import 顺序警告
- 修复 AppStore 缺少 getPermissionSettings 方法