import { useState, useEffect } from 'react';
import { ProjectList } from './project-manager/components/ProjectList';
import { CodeEditor } from './editor/components/CodeEditor';
import { PreviewPanel } from './preview/components/PreviewPanel';
import { AIAssistant } from './ai-assistant/components/AIAssistant';
import { APKBuilder } from './apk-builder/components/APKBuilder';
import { BottomNav } from './common/components/BottomNav';
import { projectService } from './project-manager/services/projectService';
import { appStore } from './common/store/appStore';
import { useStore } from './common/hooks/useStore';
import { type Project } from './common/types';

type MainView = 'editor' | 'ai' | 'builder';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeView, setActiveView] = useState<MainView>('editor');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [mobilePreviewMode, setMobilePreviewMode] = useState<'editor' | 'preview'>('editor');

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

    if (window.innerWidth < 640) {
      setShowSidebar(false);
    }
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
  };

  return (
    <div className="h-screen w-screen bg-dark-900 flex overflow-hidden">
      <aside
        className={`fixed sm:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0 w-64 sm:w-64 border-r border-dark-700`}
      >
        <ProjectList projects={projects} onSelectProject={handleSelectProject} onClose={() => setShowSidebar(false)} />
      </aside>

      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">💻</span>
              <span className="text-white font-bold text-lg">织雀</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeView === 'editor' && state.currentProject && (
              <button
                onClick={handleSaveFiles}
                className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
              >
                Save
              </button>
            )}

            <nav className="hidden sm:flex items-center gap-1 bg-dark-700 rounded-lg p-1">
              <button
                onClick={() => setActiveView('editor')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'editor'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveView('ai')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'ai'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                AI Assistant
              </button>
              <button
                onClick={() => setActiveView('builder')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'builder'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                APK Builder
              </button>
            </nav>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeView === 'editor' && (
            <div className="h-full flex flex-col sm:flex-row">
              <div className="flex-1 flex flex-col overflow-hidden">
                {state.currentProject?.type === 'single' ? (
                  <div className="flex-1">
                    <CodeEditor content={htmlContent} onChange={setHtmlContent} language="html" />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 border-b border-dark-700">
                      <div className="flex items-center justify-between px-3 py-2 bg-dark-700">
                        <span className="text-gray-400 text-xs font-medium">index.html</span>
                      </div>
                      <CodeEditor content={htmlContent} onChange={setHtmlContent} language="html" />
                    </div>
                    <div className="flex-1 border-b border-dark-700">
                      <div className="flex items-center justify-between px-3 py-2 bg-dark-700">
                        <span className="text-gray-400 text-xs font-medium">style.css</span>
                      </div>
                      <CodeEditor content={cssContent} onChange={setCssContent} language="css" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between px-3 py-2 bg-dark-700">
                        <span className="text-gray-400 text-xs font-medium">script.js</span>
                      </div>
                      <CodeEditor content={jsContent} onChange={setJsContent} language="javascript" />
                    </div>
                  </>
                )}
              </div>

              <div className="sm:hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-dark-700 border-b border-dark-600">
                  <button
                    onClick={() => setMobilePreviewMode('editor')}
                    className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                      mobilePreviewMode === 'editor'
                        ? 'bg-dark-600 text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setMobilePreviewMode('preview')}
                    className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                      mobilePreviewMode === 'preview'
                        ? 'bg-dark-600 text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              <div className={`hidden sm:block sm:w-1/2 ${mobilePreviewMode === 'preview' ? 'sm:hidden' : ''}`}>
                <PreviewPanel html={htmlContent} css={cssContent} js={jsContent} />
              </div>
            </div>
          )}

          {activeView === 'editor' && mobilePreviewMode === 'preview' && (
            <div className="sm:hidden h-full">
              <PreviewPanel html={htmlContent} css={cssContent} js={jsContent} />
            </div>
          )}

          {activeView === 'ai' && (
            <div className="h-full">
              <AIAssistant onCodeGenerated={handleCodeGenerated} currentCode={htmlContent} />
            </div>
          )}

          {activeView === 'builder' && (
            <div className="h-full">
              <APKBuilder />
            </div>
          )}
        </div>
      </main>

      <BottomNav activeView={activeView} onViewChange={setActiveView} />

      <div className="sm:hidden h-14" />
    </div>
  );
}

export default App;
