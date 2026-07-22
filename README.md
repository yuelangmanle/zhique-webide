# 织雀 WebIDE

> 一款专为移动端设计的轻量级代码编辑器，让编程随时随地

## 🛠️ 技术栈

- React 19 + TypeScript 5.9 + Vite 8
- Tailwind CSS 3.4
- CodeMirror 6（代码编辑器）
- 自研发布订阅状态管理（不可变更新）
- IndexedDB + localStorage 双写持久化
- 手写 Android WebView 壳（aapt2/d8/zipalign/apksigner 构建，无 Gradle）
- AES-GCM 加密 API Key（Web Crypto API）
- Jest 30 + ts-jest 测试

## 📱 功能特性

- HTML/CSS/JS 多文件项目编辑 + 单文件项目
- 实时预览（iframe srcdoc，debounce 300ms，console 捕获）
- AI 助手（多 Provider 预设：OpenAI/DeepSeek/月之暗面/通义千问/自定义，API Key 加密存储）
- 配置导出（生成 AndroidManifest/build.gradle 配置 JSON 下载）
- 自动保存（debounce 1s）
- 手势导航（左右滑动切换标签）
- 移动端优先（100dvh、safe-area-inset、44pt 触摸区域、aria-label）
- 全中文界面

## 🚀 构建方式

### 前端

```bash
npm install
npm run build   # 输出 www/
```

### APK

```bash
bash /workspace/zhique-apk/scripts/build-apk.sh
```

需提供 keystore，详见 `KEYSTORE.md`。

## 📁 项目结构

```
mobile-web-ide/
├── src/
│   ├── ai-assistant/       # AI 助手
│   ├── apk-builder/        # 配置导出
│   ├── common/             # 状态管理、类型、工具、图标、错误边界
│   ├── editor/             # CodeMirror 编辑器
│   ├── permission-manager/ # 权限元数据
│   ├── preview/            # iframe 预览
│   ├── project-manager/    # 项目 CRUD
│   ├── App.tsx             # 入口
│   └── main.tsx
├── jest.config.ts / jest.setup.ts
├── KEYSTORE.md             # 签名密钥说明
└── README.md
zhique-apk/
├── src/com/example/zhique/MainActivity.java
├── res/                    # 图标、主题、字符串
├── assets/www/             # 前端构建产物
├── scripts/build-apk.sh    # 一键构建脚本
└── AndroidManifest.xml
```

## 📄 许可证

[MIT License](LICENSE)
