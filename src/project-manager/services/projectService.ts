import { Project, ProjectFile } from '@/common/types';
import { generateId } from '@/common/utils';

const DB_NAME = 'zhique-ide';
const DB_VERSION = 1;
const FILE_STORE = 'files';
const PROJECTS_KEY = 'zhique-projects';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE);
      }
    };
  });
}

async function idbGet(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readonly');
    const req = tx.objectStore(FILE_STORE).get(key);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result ?? null);
  });
}

async function idbSet(key: string, value: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).put(value, key);
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });
}

async function idbClearPrefix(prefix: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readwrite');
    const store = tx.objectStore(FILE_STORE);
    const req = store.getAllKeys();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const keys = req.result as string[];
      keys.forEach((k) => {
        if (k.startsWith(prefix)) store.delete(k);
      });
    };
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });
}

class ProjectService {
  private projects: Project[] = [];

  async loadProjects(): Promise<Project[]> {
    try {
      const raw = localStorage.getItem(PROJECTS_KEY);
      this.projects = raw ? JSON.parse(raw) : [];
    } catch {
      this.projects = [];
    }
    return this.projects;
  }

  async saveProjects(): Promise<void> {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(this.projects));
  }

  async createProject(name: string, type: 'single' | 'folder'): Promise<Project> {
    const id = generateId();

    if (type === 'single') {
      await idbSet(
        `${id}/index.html`,
        '<!DOCTYPE html>\n<html>\n<head>\n  <title>我的应用</title>\n  <style>\n    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0f0f0; }\n    h1 { color: #333; }\n  </style>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script>\n    console.log("欢迎使用织雀IDE");\n  </script>\n</body>\n</html>',
      );
    } else {
      await idbSet(
        `${id}/index.html`,
        '<!DOCTYPE html>\n<html>\n<head>\n  <title>我的应用</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
      );
      await idbSet(
        `${id}/style.css`,
        'body {\n  font-family: sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  margin: 0;\n  background: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}',
      );
      await idbSet(
        `${id}/script.js`,
        'console.log("欢迎使用织雀IDE");',
      );
    }

    const project: Project = {
      id,
      name,
      type,
      path: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects.push(project);
    await this.saveProjects();

    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await idbClearPrefix(`${id}/`);
    this.projects = this.projects.filter((p) => p.id !== id);
    await this.saveProjects();
  }

  async readFile(projectId: string, filePath: string): Promise<string> {
    return (await idbGet(`${projectId}/${filePath}`)) ?? '';
  }

  async writeFile(projectId: string, filePath: string, content: string): Promise<void> {
    await idbSet(`${projectId}/${filePath}`, content);
    const project = this.projects.find((p) => p.id === projectId);
    if (project) {
      project.updatedAt = new Date();
      await this.saveProjects();
    }
  }

  async listFiles(projectId: string): Promise<ProjectFile[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, 'readonly');
      const req = tx.objectStore(FILE_STORE).getAllKeys();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const prefix = `${projectId}/`;
        const files = (req.result as string[])
          .filter((k) => k.startsWith(prefix))
          .map((k) => {
            const name = k.slice(prefix.length);
            return { name, path: k, type: 'file' as const };
          });
        resolve(files);
      };
    });
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }
}

export const projectService = new ProjectService();
