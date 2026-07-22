import { Project, ProjectFile } from '@/common/types';
import { generateId } from '@/common/utils';

const DB_NAME = 'zhique-ide';
const DB_VERSION = 1;
const FILE_STORE = 'files';
const PROJECTS_KEY = 'zhique-projects';
const FILE_PREFIX = 'zhique-file:';

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => resolve(null);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(FILE_STORE)) {
          db.createObjectStore(FILE_STORE);
        }
      };
    } catch {
      resolve(null);
    }
  });
}

async function idbGet(key: string): Promise<string | null> {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(FILE_STORE, 'readonly');
      const req = tx.objectStore(FILE_STORE).get(key);
      req.onerror = () => resolve(null);
      req.onsuccess = () => resolve(req.result ?? null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(key: string, value: string): Promise<void> {
  // 同时写入 IndexedDB 和 localStorage 作为双保险
  try {
    localStorage.setItem(FILE_PREFIX + key, value);
  } catch {}

  const db = await openDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(FILE_STORE, 'readwrite');
      tx.objectStore(FILE_STORE).put(value, key);
      tx.onerror = () => resolve();
      tx.oncomplete = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function idbClearPrefix(prefix: string): Promise<void> {
  // 清除 localStorage 中的文件
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(FILE_PREFIX + prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}

  const db = await openDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(FILE_STORE, 'readwrite');
      const store = tx.objectStore(FILE_STORE);
      const req = store.getAllKeys();
      req.onerror = () => resolve();
      req.onsuccess = () => {
        const keys = req.result as string[];
        keys.forEach((k) => {
          if (k.startsWith(prefix)) store.delete(k);
        });
      };
      tx.onerror = () => resolve();
      tx.oncomplete = () => resolve();
    } catch {
      resolve();
    }
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
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(this.projects));
    } catch (e) {
      console.error('保存项目列表失败', e);
    }
  }

  async createProject(name: string, type: 'single' | 'folder'): Promise<Project> {
    const id = generateId();

    if (type === 'single') {
      await idbSet(
        `${id}/index.html`,
        `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    body { font-family: -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
    h1 { font-size: 2rem; }
    p { opacity: 0.8; }
  </style>
</head>
<body>
  <h1>Hello World</h1>
  <p>欢迎使用织雀IDE，开始你的编程之旅</p>
  <script>
    console.log("项目创建成功");
  </script>
</body>
</html>`,
      );
    } else {
      await idbSet(
        `${id}/index.html`,
        `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>欢迎使用织雀IDE</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      );
      await idbSet(
        `${id}/style.css`,
        `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}
.container { text-align: center; }
h1 { font-size: 2rem; margin-bottom: 0.5rem; }
p { opacity: 0.8; }`,
      );
      await idbSet(
        `${id}/script.js`,
        `console.log("项目创建成功");`,
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
    // 优先从 IndexedDB 读取，失败则从 localStorage 读取
    const idbResult = await idbGet(`${projectId}/${filePath}`);
    if (idbResult !== null) return idbResult;

    try {
      return localStorage.getItem(FILE_PREFIX + `${projectId}/${filePath}`) ?? '';
    } catch {
      return '';
    }
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
    const files: ProjectFile[] = [];
    const prefix = `${projectId}/`;

    // 从 localStorage 收集
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(FILE_PREFIX + prefix)) {
          const name = k.slice((FILE_PREFIX + prefix).length);
          files.push({ name, path: k.slice(FILE_PREFIX.length), type: 'file' });
        }
      }
    } catch {}

    // 从 IndexedDB 补充
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(FILE_STORE, 'readonly');
          const req = tx.objectStore(FILE_STORE).getAllKeys();
          req.onerror = () => resolve();
          req.onsuccess = () => {
            (req.result as string[]).forEach((k) => {
              if (k.startsWith(prefix)) {
                const name = k.slice(prefix.length);
                if (!files.find((f) => f.name === name)) {
                  files.push({ name, path: k, type: 'file' });
                }
              }
            });
            resolve();
          };
        } catch {
          resolve();
        }
      });
    }

    return files;
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }
}

export const projectService = new ProjectService();
