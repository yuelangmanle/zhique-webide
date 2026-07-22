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

export const ProjectList = ({ projects, onSelectProject, onClose }: ProjectListProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'single' | 'folder'>('single');

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
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      await projectService.deleteProject(project.id);
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-900">
      <div className="p-4 flex items-center justify-between border-b border-dark-700">
        <h2 className="text-lg font-bold text-white hidden sm:block">Projects</h2>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex-1 sm:flex-none px-4 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 active:scale-95 transition-all duration-200"
        >
          + New
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="sm:hidden p-2 text-gray-400 hover:text-white ml-2"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {projects.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg">No projects yet</p>
            <p className="text-sm mt-2">Create one to get started!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`p-3 bg-dark-800 rounded-lg cursor-pointer border-l-4 transition-all duration-200 hover:bg-dark-700 active:scale-[0.98] flex items-center justify-between ${
                appStore.getState().currentProject?.id === project.id
                  ? 'border-l-primary-500'
                  : 'border-l-transparent'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate">{project.name}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {project.type === 'single' ? 'Single File' : 'Folder Project'}
                </div>
                <div className="text-gray-600 text-xs mt-1">
                  Updated: {formatDate(project.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteProject(project, e)}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                title="Delete project"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 p-6 rounded-xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create New Project</h3>
            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              autoFocus
            />
            <div className="mt-4 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={projectType === 'single'}
                  onChange={() => setProjectType('single')}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-white">Single File</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={projectType === 'folder'}
                  onChange={() => setProjectType('folder')}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-white">Folder</span>
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 px-4 py-3 bg-dark-600 text-white rounded-lg hover:bg-dark-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
                className="flex-1 px-4 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:bg-dark-600 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
