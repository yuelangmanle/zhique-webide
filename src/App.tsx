import { useState, useEffect } from 'react';
import { ProjectList } from './project-manager/components/ProjectList';
import { CodeEditor } from './editor/components/CodeEditor';
import { PreviewPanel } from './preview/components/PreviewPanel';
import { AIAssistant } from './ai-assistant/components/AIAssistant';
import { APKBuilder } from './apk-builder/components/APKBuilder';
import { projectService } from './project-manager/services/projectService';
import { appStore } from './common/store/appStore';
import { useStore } from './common/hooks/useStore';
import { type Project } from './common/types';

type TabView = 'editor' | 'preview' | 'ai' | 'builder';
type FileType = 'html' | 'css' | 'js';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<TabView>('editor');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [showProjects, setShowProjects] = useState(false);
  const [activeFile, setActiveFile] = useState<FileType>('html');
  const [showSaved, setShowSaved] = useState(false);

  const state = useStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const loadedProjects = await projectService.loadProjects();
    setProjects(loadedProjects);
  };

  const handleSelectProject = async (project: Project) => {
    appStore.setCurrentProject(project);
    await projectService.listFiles(project.id);

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
    setShowProjects(false);
  };

  const handleCodeGenerated = (code: string) => {
    setHtmlContent(code);
  };

  const handleSaveFiles = async () => {
    if (!state.currentProject) return;

    if (state.currentProject.type === 'single') {
      await projectService.writeFile(state.currentProject.id, 'index.html', htmlContent);
    } else {
      await projectService.writeFile(state.currentProject.id, 'index.html', htmlContent);
      await projectService.writeFile(state.currentProject.id, 'style.css', cssContent);
      await projectService.writeFile(state.currentProject.id, 'script.js', jsContent);
    }
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  const fileTabs: { key: FileType; label: string }[] = [
    { key: 'html', label: 'HTML' },
    { key: 'css', label: 'CSS' },
    { key: 'js', label: 'JS' },
  ];

  const tabs: { key: TabView; label: string; icon: string }[] = [
    { key: 'editor', label: '编辑', icon: '📝' },
    { key: 'preview', label: '预览', icon: '👁' },
    { key: 'ai', label: 'AI', icon: '🤖' },
    { key: 'builder', label: '打包', icon: '📦' },
  ];

  return (
    <div className="h-[100dvh] w-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* 顶部栏 */}
      <header
        className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.625rem)' }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => setShowProjects(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 rounded-lg text-slate-300 active:bg-slate-700 transition-colors flex-shrink-0"
          >
            <span className="text-base">📂</span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-white font-bold text-sm truncate">
              {state.currentProject?.name || '织雀'}
            </div>
            <div className="text-slate-500 text-[10px] truncate">
              {state.currentProject ? '已打开项目' : '点击文件夹图标选择项目'}
            </div>
          </div>
        </div>

        {activeTab === 'editor' && state.currentProject && (
          <button
            onClick={handleSaveFiles}
            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg active:bg-emerald-600 transition-colors flex-shrink-0"
          >
            {showSaved ? '✓ 已保存' : '保存'}
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
              className={`flex-1 py-2 text-xs font-medium transition-colors relative ${
                activeFile === tab.key
                  ? 'text-cyan-400'
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

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'editor' && (
          <div className="h-full">
            {state.currentProject?.type === 'single' ? (
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

        {activeTab === 'preview' && (
          <PreviewPanel html={htmlContent} css={cssContent} js={jsContent} />
        )}

        {activeTab === 'ai' && (
          <AIAssistant onCodeGenerated={handleCodeGenerated} currentCode={htmlContent} />
        )}

        {activeTab === 'builder' && (
          <APKBuilder />
        )}

        {/* 空状态 */}
        {!state.currentProject && activeTab === 'editor' && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="text-5xl mb-4">🐦</div>
            <h2 className="text-white text-lg font-bold mb-2">欢迎使用织雀</h2>
            <p className="text-slate-400 text-sm mb-6">移动端代码编辑器，随时随地编程</p>
            <button
              onClick={() => setShowProjects(true)}
              className="px-6 py-2.5 bg-cyan-500 text-white text-sm font-medium rounded-xl active:bg-cyan-600 transition-colors"
            >
              创建新项目
            </button>
          </div>
        )}

        {!state.currentProject && activeTab === 'preview' && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="text-5xl mb-4">👁</div>
            <p className="text-slate-400 text-sm">请先选择一个项目</p>
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <nav
        className="flex items-center justify-around bg-slate-900 border-t border-slate-800 flex-shrink-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 transition-all ${
              activeTab === tab.key
                ? 'text-cyan-400'
                : 'text-slate-500 active:text-slate-300'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
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
              onClose={() => setShowProjects(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
