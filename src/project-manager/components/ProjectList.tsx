import { useState } from 'react';
import { projectService } from '../services/projectService';
import { appStore } from '@/common/store/appStore';
import { type Project } from '@/common/types';
import { formatDate } from '@/common/utils';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onClose?: () => void;
}

export const ProjectList = ({ projects, onSelectProject }: ProjectListProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'single' | 'folder'>('folder');

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    const project = await projectService.createProject(projectName.trim(), projectType);
    appStore.setCurrentProject(project);
    onSelectProject(project);
    setShowCreateDialog(false);
    setProjectName('');
  };

  const handleDeleteProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除「${project.name}」吗？`)) {
      await projectService.deleteProject(project.id);
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="px-4 py-3 flex items-center justify-between">
        <h2 className="text-white font-bold text-base">我的项目</h2>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 bg-cyan-500 text-white text-sm font-medium rounded-xl active:bg-cyan-600 transition-colors"
        >
          + 新建
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {projects.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-sm">还没有项目</p>
            <p className="text-xs mt-1 text-slate-600">点击右上角新建一个吧</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`p-3.5 bg-slate-800 rounded-xl cursor-pointer border-l-[3px] transition-all active:scale-[0.98] flex items-center justify-between ${
                appStore.getState().currentProject?.id === project.id
                  ? 'border-l-cyan-400 bg-slate-800'
                  : 'border-l-transparent'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{project.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">
                  {project.type === 'single' ? '单文件' : '多文件项目'}
                </div>
                <div className="text-slate-600 text-[10px] mt-0.5">
                  {formatDate(project.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteProject(project, e)}
                className="p-2 text-slate-600 active:text-red-400 transition-colors flex-shrink-0"
              >
                🗑
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

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium active:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
                className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-medium active:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
