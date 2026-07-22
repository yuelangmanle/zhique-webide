import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Project, ProjectFile } from '@/common/types';
import { generateId } from '@/common/utils';

class ProjectService {
  private projects: Project[] = [];
  private readonly STORAGE_KEY = 'projects.json';
  private readonly PROJECTS_DIR = 'projects';

  async loadProjects(): Promise<Project[]> {
    try {
      const result = await Filesystem.readFile({
        path: this.STORAGE_KEY,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      this.projects = JSON.parse(result.data as string);
    } catch {
      this.projects = [];
    }
    return this.projects;
  }

  async saveProjects(): Promise<void> {
    await Filesystem.writeFile({
      path: this.STORAGE_KEY,
      data: JSON.stringify(this.projects),
      directory: Directory.Data,
    });
  }

  async createProject(name: string, type: 'single' | 'folder'): Promise<Project> {
    const id = generateId();
    const path = `${this.PROJECTS_DIR}/${id}`;

    await Filesystem.mkdir({
      path,
      directory: Directory.Data,
      recursive: true,
    });

    if (type === 'single') {
      await Filesystem.writeFile({
        path: `${path}/index.html`,
        data: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n  <style>\n    body { font-family: sans-serif; }\n  </style>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script>\n    console.log("Welcome to Mobile Web IDE");\n  </script>\n</body>\n</html>',
        directory: Directory.Data,
      });
    } else {
      await Filesystem.writeFile({
        path: `${path}/index.html`,
        data: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
        directory: Directory.Data,
      });
      await Filesystem.writeFile({
        path: `${path}/style.css`,
        data: 'body {\n  font-family: sans-serif;\n  margin: 20px;\n}\n\nh1 {\n  color: #333;\n}',
        directory: Directory.Data,
      });
      await Filesystem.writeFile({
        path: `${path}/script.js`,
        data: 'console.log("Welcome to Mobile Web IDE");\n\nalert("Hello from JavaScript!");',
        directory: Directory.Data,
      });
    }

    const project: Project = {
      id,
      name,
      type,
      path,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects.push(project);
    await this.saveProjects();

    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) throw new Error('Project not found');

    await Filesystem.rmdir({
      path: project.path,
      directory: Directory.Data,
      recursive: true,
    });

    this.projects = this.projects.filter((p) => p.id !== id);
    await this.saveProjects();
  }

  async readFile(projectId: string, filePath: string): Promise<string> {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const result = await Filesystem.readFile({
      path: `${project.path}/${filePath}`,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });

    return result.data as string;
  }

  async writeFile(projectId: string, filePath: string, content: string): Promise<void> {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    await Filesystem.writeFile({
      path: `${project.path}/${filePath}`,
      data: content,
      directory: Directory.Data,
    });

    project.updatedAt = new Date();
    await this.saveProjects();
  }

  async listFiles(projectId: string): Promise<ProjectFile[]> {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    try {
      const result = await Filesystem.readdir({
        path: project.path,
        directory: Directory.Data,
      });

      return result.files.map((file) => ({
        name: file.name,
        path: file.uri,
        type: file.type === 'directory' ? 'folder' : 'file',
      }));
    } catch {
      return [];
    }
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }
}

export const projectService = new ProjectService();