import { useState } from 'react';
import { projectService } from '../services/projectService';
import { appStore } from '@/common/store/appStore';
import { type Project } from '@/common/types';
import { formatDate } from '@/common/utils';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onProjectsChange: () => void;
  onClose?: () => void;
}

export const ProjectList = ({ projects, onSelectProject, onProjectsChange }: ProjectListProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'single' | 'folder'>('folder');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateProject = async () => {
    if (!projectName.trim() || creating) return;

    setCreating(true);
    setError('');
    try {
      const project = await projectService.createProject(projectName.trim(), projectType);
      appStore.setCurrentProject(project);
      setShowCreateDialog(false);
      setProjectName('');
      // 通知父组件刷新项目列表
      onProjectsChange();
      // 自动选中新项目
      onSelectProject(project);
    } catch (e) {
      setError('创建失败: ' + (e instanceof Error ? e.message : '未知错误'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除「${project.name}」吗？此操作不可恢复。`)) {
      try {
        await projectService.deleteProject(project.id);
        onProjectsChange();
      } catch (err) {
        alert('删除失败: ' + (err instanceof Error ? err.message : '未知错误'));
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">我的项目</h2>
          <p className="text-slate-500 text-xs mt-0.5">共 {projects.length} 个项目</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 bg-cyan-500 text-white text-sm font-medium rounded-xl active:bg-cyan-600 transition-colors flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          新建
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {projects.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            <svg className="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm">还没有项目</p>
            <p className="text-xs mt-1 text-slate-600">点击右上角新建一个吧</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`p-3.5 rounded-xl cursor-pointer border-l-[3px] transition-all active:scale-[0.98] flex items-center justify-between ${
                appStore.getState().currentProject?.id === project.id
                  ? 'border-l-cyan-400 bg-slate-800'
                  : 'border-l-transparent bg-slate-800/50 active:bg-slate-800'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{project.name}</div>
                <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${project.type === 'folder' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {project.type === 'single' ? '单文件' : '多文件'}
                  </span>
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteProject(project, e)}
                aria-label="删除项目"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 active:text-red-400 transition-colors flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {showCreateDialog && (
        <div
          className="fixed inset-0 bg-black/70 flex items-end justify-center z-[100] animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateDialog(false);
          }}
        >
          <div className="bg-slate-800 p-5 rounded-t-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>
            <h3 className="text-white font-bold text-lg mb-4">新建项目</h3>

            <input
              type="text"
              placeholder="输入项目名称"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors mb-4"
              autoFocus
            />

            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setProjectType('folder')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  projectType === 'folder'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                多文件 (HTML+CSS+JS)
              </button>
              <button
                onClick={() => setProjectType('single')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  projectType === 'single'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                单文件
              </button>
            </div>

            {error && <div className="text-red-400 text-xs mb-3">{error}</div>}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreateDialog(false); setProjectName(''); setError(''); }}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium active:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim() || creating}
                className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-medium active:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
              >
                {creating ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
