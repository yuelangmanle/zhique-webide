import { useState, useEffect, useRef, type TouchEvent as ReactTouchEvent } from 'react';
import { ProjectList } from './project-manager/components/ProjectList';
import { CodeEditor } from './editor/components/CodeEditor';
import { PreviewPanel } from './preview/components/PreviewPanel';
import { AIAssistant } from './ai-assistant/components/AIAssistant';
import { APKBuilder } from './apk-builder/components/APKBuilder';
import { projectService } from './project-manager/services/projectService';
import { appStore } from './common/store/appStore';
import { useStore } from './common/hooks/useStore';
import { type Project } from './common/types';
import { IconFolder, IconSave, IconCheck, IconEdit, IconEye, IconAI, IconPackage, IconBird, IconRefresh } from './common/components/Icons';
import { toast, ToastContainer } from './common/components/Toast';
import { ConfirmSheetContainer } from './common/components/ConfirmSheet';
import { ProjectCardSkeleton } from './common/components/Skeleton';

type TabView = 'editor' | 'preview' | 'ai' | 'projects' | 'builder';
type FileType = 'html' | 'css' | 'js';
type SaveStatus = 'idle' | 'saving' | 'saved';

// 触觉反馈 helper：在不支持振动的设备上静默无操作
const haptic = (ms: number) => {
  if ('vibrate' in navigator) navigator.vibrate(ms);
};

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<TabView>('editor');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [showProjects, setShowProjects] = useState(false);
  const [activeFile, setActiveFile] = useState<FileType>('html');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(true);
  // 预览刷新：递增 key 强制重置 iframe
  const [previewKey, setPreviewKey] = useState(0);

  // 手势导航：记录触摸起点（useRef 避免重渲染）
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  // 自动保存：debounce 计时器与状态重置计时器
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const state = useStore();

  useEffect(() => {
    initApp();
  }, []);

  // E6: visualViewport 键盘适配 —— 注入 --keyboard-height 变量供 CSS 使用
  useEffect(() => {
    if (!window.visualViewport) return;
    const handler = () => {
      const root = document.getElementById('root');
      if (root) {
        const keyboardHeight = window.innerHeight - window.visualViewport!.height;
        root.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      }
    };
    window.visualViewport.addEventListener('resize', handler);
    return () => window.visualViewport?.removeEventListener('resize', handler);
  }, []);

  // 初始化：加载项目列表 + 自动恢复上次打开的项目
  const initApp = async () => {
    try {
      const loadedProjects = await projectService.loadProjects();
      setProjects(loadedProjects);

      // 自动恢复上次的项目
      const lastProjectId = localStorage.getItem('zhique-last-project');
      if (lastProjectId) {
        const lastProject = loadedProjects.find((p) => p.id === lastProjectId);
        if (lastProject) {
          await loadProjectContent(lastProject);
        }
      }
    } catch (e) {
      console.error('初始化失败', e);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    const loadedProjects = await projectService.loadProjects();
    setProjects(loadedProjects);
  };

  const loadProjectContent = async (project: Project) => {
    appStore.setCurrentProject(project);
    localStorage.setItem('zhique-last-project', project.id);

    if (project.type === 'single') {
      const content = await projectService.readFile(project.id, 'index.html');
      setHtmlContent(content);
      setCssContent('');
      setJsContent('');
    } else {
      const html = await projectService.readFile(project.id, 'index.html');
      const css = await projectService.readFile(project.id, 'style.css');
      const js = await projectService.readFile(project.id, 'script.js');
      setHtmlContent(html);
      setCssContent(css);
      setJsContent(js);
    }
  };

  const handleSelectProject = async (project: Project) => {
    try {
      await loadProjectContent(project);
      setShowProjects(false);
      setActiveTab('editor'); // 选中项目后切到编辑器
    } catch (e) {
      console.error('打开项目失败', e);
      // E5: 用 toast 替换 alert
      toast.error('打开项目失败: ' + (e instanceof Error ? e.message : '未知错误'));
    }
  };

  // AI 生成的代码统一写入 HTML 内容（单文件模式）
  // 设计意图：AI 助手生成的是完整 HTML 文档，直接覆盖 htmlContent 即可
  const handleCodeGenerated = (code: string) => {
    setHtmlContent(code);
  };

  // 自动保存逻辑（不弹 toast，失败只 console.error）—— 返回是否成功，供手动保存判断
  // 实时从 appStore 读取 currentProject，避免闭包捕获到已删除/已切换的旧项目
  const autoSave = async (): Promise<boolean> => {
    const currentProject = appStore.getState().currentProject;
    if (!currentProject) return false;
    try {
      if (currentProject.type === 'single') {
        await projectService.writeFile(currentProject.id, 'index.html', htmlContent);
      } else {
        await projectService.writeFile(currentProject.id, 'index.html', htmlContent);
        await projectService.writeFile(currentProject.id, 'style.css', cssContent);
        await projectService.writeFile(currentProject.id, 'script.js', jsContent);
      }
      setSaveStatus('saved');
      loadProjects(); // 刷新更新时间
      if (savedResetTimer.current) clearTimeout(savedResetTimer.current);
      savedResetTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
      return true;
    } catch (e) {
      console.error('自动保存失败', e);
      setSaveStatus('idle');
      return false;
    }
  };

  // 手动保存：取消 pending debounce，立即触发 autoSave，并提示结果
  const handleManualSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    const ok = await autoSave();
    if (ok) {
      toast.success('保存成功');
      haptic(10);
    } else {
      toast.error('保存失败');
    }
  };

  // 预览刷新：重置 iframe
  const handleRefreshPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  // debounce 自动保存：内容变化 1s 后触发
  useEffect(() => {
    if (!state.currentProject) return;
    setSaveStatus('saving');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      autoSave();
    }, 1000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlContent, cssContent, jsContent]);

  // 组件卸载时清理所有 pending 计时器，避免内存泄漏与卸载后 setState
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      if (savedResetTimer.current) clearTimeout(savedResetTimer.current);
    };
  }, []);

  const fileTabs: { key: FileType; label: string; color: string }[] = [
    { key: 'html', label: 'HTML', color: 'text-orange-400' },
    { key: 'css', label: 'CSS', color: 'text-blue-400' },
    { key: 'js', label: 'JS', color: 'text-yellow-400' },
  ];

  const tabs: { key: TabView; label: string; icon: typeof IconEdit }[] = [
    { key: 'editor', label: '编辑', icon: IconEdit },
    { key: 'preview', label: '预览', icon: IconEye },
    { key: 'ai', label: 'AI', icon: IconAI },
    { key: 'projects', label: '项目', icon: IconFolder },
  ];

  // 手势导航：触摸开始，记录起点
  const handleTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  // 手势导航：触摸结束，计算滑动方向并切换标签
  const handleTouchEnd = (e: ReactTouchEvent) => {
    // 编辑器标签下禁用切换手势，避免与代码横向滚动/文本选择冲突
    // projects 标签下也禁用，避免与项目列表滚动冲突
    if (activeTab === 'editor' || activeTab === 'projects') return;
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    const threshold = 80;
    // 水平位移需超过阈值，且水平占主导（避免干扰垂直滚动/选择）
    if (Math.abs(deltaX) <= threshold) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

    const tabsOrder = tabs.map((t) => t.key);
    const currentIndex = tabsOrder.indexOf(activeTab);
    if (currentIndex === -1) return;

    // O3: 标签切换触觉反馈
    haptic(5);
    if (deltaX > 0) {
      // 右滑 → 左邻标签（循环）
      const prevIndex = (currentIndex - 1 + tabsOrder.length) % tabsOrder.length;
      setActiveTab(tabsOrder[prevIndex]);
    } else {
      // 左滑 → 右邻标签（循环）
      const nextIndex = (currentIndex + 1) % tabsOrder.length;
      setActiveTab(tabsOrder[nextIndex]);
    }
  };

  if (loading) {
    // O2: 保留 IconBird + 进度文字 + 3 个骨架卡片预览
    return (
      <div className="h-[100dvh] w-screen bg-slate-950 flex flex-col">
        <div className="text-center pt-12 pb-6">
          <IconBird size={64} className="mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400 text-sm">正在加载项目...</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* 顶部栏 */}
      <header
        className="flex items-center justify-between px-3 py-2.5 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex-shrink-0"
        style={{ paddingTop: 'calc(var(--safe-area-inset-top, 0px) + 0.625rem)' }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => { loadProjects(); setShowProjects(true); }}
            className="min-w-0 flex-1 text-left active:bg-slate-800/50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="text-white font-bold text-sm truncate">
              {state.currentProject?.name || '织雀'}
            </div>
            <div className="text-slate-500 text-[11px] truncate">
              {state.currentProject ? `${state.currentProject.type === 'folder' ? '多文件项目' : '单文件'} · 已打开` : '点击选择项目'}
            </div>
          </button>
        </div>

        {/* E10: 顶部栏右侧上下文操作，按 activeTab 条件渲染 */}
        {activeTab === 'editor' && state.currentProject && (
          <button
            onClick={handleManualSave}
            className={`flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg flex-shrink-0 transition-all active:scale-[0.97] ${
              saveStatus === 'saved'
                ? 'bg-emerald-500 text-white active:bg-emerald-600'
                : saveStatus === 'saving'
                ? 'bg-slate-700 text-slate-400'
                : 'bg-slate-800 text-slate-400 active:bg-slate-700'
            }`}
          >
            {/* E14: 保存状态图标过渡，saved 态微缩放 */}
            <span className={`inline-flex transition-all duration-200 ${saveStatus === 'saved' ? 'scale-110' : ''}`}>
              {saveStatus === 'saved' ? <IconCheck size={14} /> : <IconSave size={14} />}
            </span>
            {saveStatus === 'saving' ? '保存中...' : '已保存'}
          </button>
        )}
        {activeTab === 'preview' && state.currentProject && (
          <button
            onClick={handleRefreshPreview}
            aria-label="刷新预览"
            className="flex items-center justify-center w-11 h-11 bg-slate-800 rounded-lg text-slate-300 active:bg-slate-700 transition-colors flex-shrink-0"
          >
            <IconRefresh size={18} />
          </button>
        )}

        {/* O9: 常驻打包按钮，所有标签下都显示 */}
        <button
          onClick={() => { haptic(5); setActiveTab('builder'); }}
          aria-label="打包"
          className={`flex items-center justify-center w-11 h-11 rounded-lg transition-colors flex-shrink-0 ${
            activeTab === 'builder' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 active:bg-slate-700'
          }`}
        >
          <IconPackage size={18} />
        </button>
      </header>

      {/* 文件标签栏 */}
      {activeTab === 'editor' && state.currentProject?.type === 'folder' && (
        <div className="flex items-center bg-slate-900 border-b border-slate-800 flex-shrink-0">
          {fileTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFile(tab.key)}
              className={`flex-1 min-h-[44px] py-2.5 text-xs font-medium transition-colors relative ${
                activeFile === tab.key
                  ? tab.color
                  : 'text-slate-500 active:text-slate-300'
              }`}
            >
              {tab.label}
              {activeFile === tab.key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* 主内容区（绑定手势导航） */}
      <div
        className="flex-1 overflow-hidden relative landscape:max-h-[calc(100dvh-3.5rem)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* E7: 每个标签内容块加 key + animate-tab-in 淡入过渡 */}
        {activeTab === 'editor' && state.currentProject && (
          <div key={activeTab + (activeFile || '')} className="h-full animate-tab-in">
            {state.currentProject.type === 'single' ? (
              <CodeEditor content={htmlContent} onChange={setHtmlContent} language="html" />
            ) : (
              <div className="h-full">
                {activeFile === 'html' && (
                  <CodeEditor content={htmlContent} onChange={setHtmlContent} language="html" />
                )}
                {activeFile === 'css' && (
                  <CodeEditor content={cssContent} onChange={setCssContent} language="css" />
                )}
                {activeFile === 'js' && (
                  <CodeEditor content={jsContent} onChange={setJsContent} language="javascript" />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && state.currentProject && (
          <div key={activeTab} className="h-full animate-tab-in">
            <PreviewPanel key={previewKey} html={htmlContent} css={cssContent} js={jsContent} />
          </div>
        )}

        {activeTab === 'ai' && (
          <div key={activeTab} className="h-full animate-tab-in">
            <AIAssistant onCodeGenerated={handleCodeGenerated} currentCode={htmlContent} />
          </div>
        )}

        {activeTab === 'builder' && (
          <div key={activeTab} className="h-full animate-tab-in">
            <APKBuilder />
          </div>
        )}

        {activeTab === 'projects' && (
          <div key={activeTab} className="h-full animate-tab-in">
            <ProjectList
              projects={projects}
              onSelectProject={handleSelectProject}
              onProjectsChange={loadProjects}
              onClose={() => setActiveTab('editor')}
            />
          </div>
        )}

        {/* 空状态 - 没有项目时 */}
        {!state.currentProject && (activeTab === 'editor' || activeTab === 'preview') && (
          <div key={activeTab} className="h-full flex flex-col items-center justify-center text-center px-8 animate-tab-in">
            {activeTab === 'editor' ? (
              <>
                <IconBird size={72} className="mb-5" />
                <h2 className="text-white text-xl font-bold mb-2">欢迎使用织雀</h2>
                <p className="text-slate-400 text-sm mb-6">移动端代码编辑器，随时随地编程</p>
                <button
                  onClick={() => { haptic(10); loadProjects(); setShowProjects(true); }}
                  className="px-6 py-2.5 min-h-[44px] bg-cyan-500 text-white text-sm font-medium rounded-xl active:bg-cyan-600 active:scale-[0.97] transition-all"
                >
                  创建新项目
                </button>
              </>
            ) : (
              <>
                <IconEye size={56} className="mb-4 text-slate-400" />
                <p className="text-slate-400 text-sm">请先选择一个项目</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <nav
        className="flex items-center justify-around bg-slate-900/95 backdrop-blur border-t border-slate-800 flex-shrink-0 landscape:py-1 landscape:scale-90"
        style={{ paddingBottom: 'var(--safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { haptic(5); setActiveTab(tab.key); }}
              className={`flex flex-col items-center gap-0.5 min-h-[44px] py-2 px-3 transition-all active:scale-[0.97] ${
                activeTab === tab.key
                  ? 'text-cyan-400'
                  : 'text-slate-500 active:text-slate-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 项目列表抽屉 */}
      {showProjects && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowProjects(false)}
          />
          <div className="relative h-[85%] mt-auto bg-slate-900 rounded-t-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-center py-2">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>
            <ProjectList
              projects={projects}
              onSelectProject={handleSelectProject}
              onProjectsChange={loadProjects}
              onClose={() => setShowProjects(false)}
            />
          </div>
        </div>
      )}

      {/* 全局浮层容器：Toast 与 ConfirmSheet */}
      <ToastContainer />
      <ConfirmSheetContainer />
    </div>
  );
}

export default App;
