# 织雀 WebIDE

> 一款专为移动端设计的轻量级代码编辑器，让编程随时随地

[![License](https://img.shields.io/github/license/yuelangmanle/zhique-webide)](https://github.com/yuelangmanle/zhique-webide/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/yuelangmanle/zhique-webide)](https://github.com/yuelangmanle/zhique-webide/stargazers)
[![Issues](https://img.shields.io/github/issues/yuelangmanle/zhique-webide)](https://github.com/yuelangmanle/zhique-webide/issues)
[![GitHub Release](https://img.shields.io/github/v/release/yuelangmanle/zhique-webide)](https://github.com/yuelangmanle/zhique-webide/releases)

## 📱 功能特性

- **代码编辑器**：基于 CodeMirror 6，支持 HTML/CSS/JS 语法高亮、代码折叠、行号显示
- **实时预览**：内置 iframe 预览，代码修改即时生效，支持控制台输出
- **AI 助手**：集成大语言模型 API，支持代码生成、解释、调试和优化建议
- **项目管理**：支持单文件和文件夹项目，本地存储，随时保存
- **权限管理**：相机、相册、位置、蓝牙等权限统一管理
- **移动端优化**：专为手机屏幕设计的交互体验

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **样式方案**：Tailwind CSS 3
- **代码编辑器**：CodeMirror 6
- **状态管理**：Zustand
- **图标库**：Lucide React
- **移动端框架**：Capacitor 6

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### Android 构建

```bash
# 同步原生项目
npx cap sync

# 构建APK
cd android && ./gradlew assembleDebug
```

## 📁 项目结构

```
zhique-webide/
├── src/                    # 源代码目录
│   ├── editor/             # 代码编辑器组件
│   │   ├── components/     # UI组件
│   │   └── utils/          # 工具函数
│   ├── preview/            # 实时预览组件
│   │   ├── components/     # UI组件
│   │   └── services/       # 服务层
│   ├── ai-assistant/       # AI助手组件
│   │   ├── components/     # UI组件
│   │   └── services/       # AI服务
│   ├── project-manager/    # 项目管理组件
│   │   ├── components/     # UI组件
│   │   └── services/       # 项目服务
│   ├── permission-manager/ # 权限管理组件
│   │   ├── components/     # UI组件
│   │   └── services/       # 权限服务
│   ├── apk-builder/        # APK构建组件
│   │   ├── components/     # UI组件
│   │   └── services/       # 构建服务
│   ├── common/             # 公共模块
│   │   ├── components/     # 公共组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── store/          # 状态管理
│   │   ├── types/          # 类型定义
│   │   └── utils/          # 公共工具
│   ├── App.tsx             # 应用入口
│   ├── main.tsx            # 主入口文件
│   └── index.css           # 全局样式
├── android/                # Android原生项目
├── docs/                   # 项目文档
│   ├── specs/              # 产品规格文档
│   ├── architecture/       # 架构设计文档
│   ├── plans/              # 开发计划文档
│   └── handover/           # 交接文档
├── www/                    # Web资源目录
├── package.json            # 依赖配置
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
├── tailwind.config.js      # Tailwind配置
└── capacitor.config.json   # Capacitor配置
```

## 📖 使用说明

1. **创建项目**：点击底部导航的"项目"按钮，创建新的代码项目
2. **编写代码**：在编辑器中编写 HTML、CSS 和 JavaScript 代码
3. **实时预览**：点击预览按钮查看代码效果
4. **AI 辅助**：遇到问题时点击 AI 助手获取帮助
5. **导出项目**：支持导出为 ZIP 文件或构建 APK

## 📋 权限说明

应用需要以下权限以提供完整功能：

| 权限 | 用途 |
|------|------|
| 相机 | 拍照上传、扫码 |
| 相册 | 选择图片文件 |
| 位置 | 获取地理位置信息 |
| 蓝牙 | 蓝牙设备连接 |
| 存储 | 保存项目文件 |

## 📄 许可证

[MIT License](LICENSE)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues：https://github.com/yuelangmanle/zhique-webide/issues

---

**织雀** - 让编程随时随地 ✨