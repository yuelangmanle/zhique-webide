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
import { IconFolder, IconSave, IconCheck, IconEdit, IconEye, IconAI, IconPackage, IconBird } from './common/components/Icons';

type TabView = 'editor' | 'preview' | 'ai' | 'builder';
type FileType = 'html' | 'css' | 'js';
type SaveStatus = 'idle' | 'saving' | 'saved';

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
    } catch (e) {
      console.error('打开项目失败', e);
      alert('打开项目失败: ' + (e instanceof Error ? e.message : '未知错误'));
    }
  };

  const handleCodeGenerated = (code: string) => {
    setHtmlContent(code);
  };

  // 自动保存逻辑（不弹 alert，失败只 console.error）
  const autoSave = async () => {
    if (!state.currentProject) return;
    try {
      if (state.currentProject.type === 'single') {
        await projectService.writeFile(state.currentProject.id, 'index.html', htmlContent);
      } else {
        await projectService.writeFile(state.currentProject.id, 'index.html', htmlContent);
        await projectService.writeFile(state.currentProject.id, 'style.css', cssContent);
        await projectService.writeFile(state.currentProject.id, 'script.js', jsContent);
      }
      setSaveStatus('saved');
      loadProjects(); // 刷新更新时间
      if (savedResetTimer.current) clearTimeout(savedResetTimer.current);
      savedResetTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('自动保存失败', e);
      setSaveStatus('idle');
    }
  };

  // 手动保存：取消 pending debounce，立即触发 autoSave
  const handleManualSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSave();
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

  const fileTabs: { key: FileType; label: string; color: string }[] = [
    { key: 'html', label: 'HTML', color: 'text-orange-400' },
    { key: 'css', label: 'CSS', color: 'text-blue-400' },
    { key: 'js', label: 'JS', color: 'text-yellow-400' },
  ];

  const tabs: { key: TabView; label: string; icon: typeof IconEdit }[] = [
    { key: 'editor', label: '编辑', icon: IconEdit },
    { key: 'preview', label: '预览', icon: IconEye },
    { key: 'ai', label: 'AI', icon: IconAI },
    { key: 'builder', label: '打包', icon: IconPackage },
  ];

  // 手势导航：触摸开始，记录起点
  const handleTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  // 手势导航：触摸结束，计算滑动方向并切换标签
  const handleTouchEnd = (e: ReactTouchEvent) => {
    // 编辑器标签下禁用切换手势，避免与代码横向滚动/文本选择冲突
    if (activeTab === 'editor') return;
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
    return (
      <div className="h-[100dvh] w-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <IconBird size={64} className="mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400 text-sm">加载中...</p>
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
            aria-label="项目列表"
            className="flex items-center justify-center w-11 h-11 bg-slate-800 rounded-lg text-slate-300 active:bg-slate-700 transition-colors flex-shrink-0"
          >
            <IconFolder size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-white font-bold text-sm truncate">
              {state.currentProject?.name || '织雀'}
            </div>
            <div className="text-slate-500 text-[11px] truncate">
              {state.currentProject ? `${state.currentProject.type === 'folder' ? '多文件项目' : '单文件'} · 已打开` : '点击文件夹图标选择项目'}
            </div>
          </div>
        </div>

        {/* 保存状态指示器（点击可手动立即保存） */}
        {activeTab === 'editor' && state.currentProject && (
          <button
            onClick={handleManualSave}
            className={`flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex-shrink-0 ${
              saveStatus === 'saved'
                ? 'bg-emerald-500 text-white active:bg-emerald-600'
                : saveStatus === 'saving'
                ? 'bg-slate-700 text-slate-400'
                : 'bg-slate-800 text-slate-400 active:bg-slate-700'
            }`}
          >
            {saveStatus === 'saved' ? <IconCheck size={14} /> : <IconSave size={14} />}
            {saveStatus === 'saving' ? '保存中...' : '已保存'}
          </button>
        )}
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
        className="flex-1 overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeTab === 'editor' && state.currentProject && (
          <div className="h-full">
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
          <PreviewPanel html={htmlContent} css={cssContent} js={jsContent} />
        )}

        {activeTab === 'ai' && (
          <AIAssistant onCodeGenerated={handleCodeGenerated} currentCode={htmlContent} />
        )}

        {activeTab === 'builder' && (
          <APKBuilder />
        )}

        {/* 空状态 - 没有项目时 */}
        {!state.currentProject && (activeTab === 'editor' || activeTab === 'preview') && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            {activeTab === 'editor' ? (
              <>
                <IconBird size={72} className="mb-5" />
                <h2 className="text-white text-xl font-bold mb-2">欢迎使用织雀</h2>
                <p className="text-slate-400 text-sm mb-6">移动端代码编辑器，随时随地编程</p>
                <button
                  onClick={() => { loadProjects(); setShowProjects(true); }}
                  className="px-6 py-2.5 min-h-[44px] bg-cyan-500 text-white text-sm font-medium rounded-xl active:bg-cyan-600 transition-colors"
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
        className="flex items-center justify-around bg-slate-900/95 backdrop-blur border-t border-slate-800 flex-shrink-0"
        style={{ paddingBottom: 'var(--safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-0.5 min-h-[44px] py-2 px-3 transition-all ${
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
    </div>
  );
}

export default App;
