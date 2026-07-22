# 更新日志

本项目版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)：`主版本.次版本.修订号`

## [3.1.0] - 2026-07-22

### 新增

#### 视觉基础层
- 引入霞鹜文楷中文显示字体（`.font-display`），告别 generic 系统字体
- JetBrains Mono 等宽字体经 Google Fonts 加载，代码编辑器字体不再静默回退
- tailwind 新增圆角 token（`icon`/`btn`/`card`）+ 文件标签语义色（`lang-html`/`lang-css`/`lang-js`）
- `shadow-elevated`/`shadow-overlay` 深色阴影工具类，强化 z 轴层级感
- 移动端隐藏滚动条，靠手势滚动
- Icons.tsx 新增 8 个图标（Alert/Refresh/Plus/Trash/Close/ChevronUp/ChevronDown/ScreenRotate）

#### 共享交互组件
- `Toast`：全局单例，`toast.success/error/info(msg)`，2.5s 自动消失，最多 3 条
- `ConfirmSheet`：底部 Sheet 确认弹窗，Promise 风格 `await confirm({...})`，危险操作红色按钮
- `Skeleton`：骨架屏组件 + `ProjectCardSkeleton` 项目卡片骨架

#### App.tsx 主框架
- `visualViewport` 键盘高度监听，注入 `--keyboard-height` CSS 变量
- 横屏适配（`landscape:` 底部导航缩放 + 主内容区限高）
- loading 态用 `ProjectCardSkeleton` 骨架屏替代纯 spinner
- 触觉反馈 `haptic()` helper + `navigator.vibrate`（标签切换 5ms / 保存 10ms）
- 顶部栏右侧上下文操作（预览标签显示刷新按钮）

### 优化

#### 信息架构（O9）
- 底部导航从 编辑/预览/AI/打包 改为 **编辑/预览/AI/项目**
- "打包"入口移至顶部栏常驻 `IconPackage` 图标按钮，所有标签下可见
- 新增"项目"全屏标签视图，复用 `ProjectList` 组件
- 保留项目抽屉作为从编辑器快速切换项目的入口
- 手势循环改为 editor→preview→ai→projects→editor，builder 不参与
- AI 三子标签改为 segmented control 胶囊样式

#### 组件级
- `PreviewPanel`：空状态增强 + 控制台高度三档可调（sm/md/lg）
- `APKBuilder`：权限选择改为列表+开关样式（与 PermissionManager 统一），emoji 换 `IconAlert`
- `PermissionManager`：emoji 全部替换为 `IconAlert`
- `ErrorBoundary`：😵 emoji 换 `IconAlert` 图标
- `CodeEditor`：自定义主题，背景 `#020617` 与 App 统一，光标 cyan-400
- `AIAssistant`：`alert` 换 `toast` + 子标签切换动画 + 按钮触觉缩放
- `ProjectList`：`confirm`/`alert` 换 `ConfirmSheet`/`Toast` + 内联 SVG 换 `IconPlus`/`IconTrash`

### 修复（承接 3.0.0 第二轮）
- Safe-area 变量绑定 `env()`，刘海屏顶部栏不再被状态栏遮挡
- 编辑器标签下禁用左右滑动手势 + 阈值提至 80px，修复与代码横滚/文本选择冲突
- APKBuilder 单文件项目导出按 `type` 区分，不再因读取不存在的 style.css/script.js 崩溃
- 辅助文字 `text-slate-600` 全部改 `text-slate-400`，满足 WCAG AA 4.5:1 对比度
- `text-[10px]` 全部提到 `text-[11px]`
- AI 回复/控制台输出/错误信息可长按复制（`user-select: text` 放行）
- `webFiles` 导出含真实项目内容，不再硬编码空字符串
- 所有可点击按钮触摸区域补足 ≥44×44pt（7 个文件 23 个按钮）

### 版本号
- AndroidManifest: versionCode=31, versionName=3.1.0
- package.json: 3.1.0

---

## [3.0.0] - 2026-07-22

### 阶段一·止血（P0）
- **状态管理不可变更新**：appStore 所有 setter 改为 `this.state = { ...this.state, ... }`，清理 6 个死字段
- **移除假打包**：APKBuilder 从假进度条改为"导出配置 JSON"
- **安全加固**：keystore 出库、API Key 经 AES-GCM 加密存储、WebView/sandbox 收紧

### 阶段二·体验（P1）
- 清理 Capacitor 残留（android/、ios/、capacitor.config.json、旧 build-apk.sh）
- 自动保存 debounce 1s + 状态指示器
- 左右滑动手势切换标签
- 预览防抖 300ms + 可访问性 ≥44pt + aria-label

### 阶段三·质量（P2）
- `ErrorBoundary` 包裹 App
- Jest 测试体系（17 个测试全部通过）
- README 以代码实际为准重写
- AndroidManifest versionCode=30 / versionName=3.0.0
