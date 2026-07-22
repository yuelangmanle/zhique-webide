import { describe, it, expect, beforeEach } from '@jest/globals';
import { projectService } from './projectService';

describe('projectService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadProjects 初始为空', async () => {
    // 重新加载缓存，确保从空 localStorage 读取
    const projects = await projectService.loadProjects();
    expect(projects).toEqual([]);
  });

  it('createProject single 类型创建后 loadProjects 返回 1 个', async () => {
    await projectService.loadProjects();
    const project = await projectService.createProject('测试单文件', 'single');
    expect(project).toBeDefined();
    expect(project.type).toBe('single');
    expect(project.name).toBe('测试单文件');

    const projects = await projectService.loadProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe(project.id);
    expect(projects[0].name).toBe('测试单文件');
  });

  it('createProject folder 类型创建后能读取 index.html/style.css/script.js', async () => {
    await projectService.loadProjects();
    const project = await projectService.createProject('测试多文件', 'folder');
    expect(project.type).toBe('folder');

    const indexHtml = await projectService.readFile(project.id, 'index.html');
    const styleCss = await projectService.readFile(project.id, 'style.css');
    const scriptJs = await projectService.readFile(project.id, 'script.js');

    expect(indexHtml).toContain('Hello World');
    expect(indexHtml).toContain('style.css');
    expect(styleCss).toContain('body');
    expect(scriptJs).toContain('console.log');

    const projects = await projectService.loadProjects();
    expect(projects).toHaveLength(1);
  });

  it('readFile 读取已写入内容', async () => {
    await projectService.loadProjects();
    const project = await projectService.createProject('读测试', 'single');
    await projectService.writeFile(project.id, 'index.html', '<h1>测试内容</h1>');
    const content = await projectService.readFile(project.id, 'index.html');
    expect(content).toBe('<h1>测试内容</h1>');
  });

  it('writeFile 写入后读取一致', async () => {
    await projectService.loadProjects();
    const project = await projectService.createProject('写测试', 'single');
    const testContent = 'console.log("hello world");';
    await projectService.writeFile(project.id, 'index.html', testContent);
    const read = await projectService.readFile(project.id, 'index.html');
    expect(read).toBe(testContent);
  });

  it('deleteProject 删除后 loadProjects 返回 0, readFile 返回空', async () => {
    await projectService.loadProjects();
    const project = await projectService.createProject('待删除', 'single');
    expect(await projectService.loadProjects()).toHaveLength(1);

    await projectService.deleteProject(project.id);

    const projects = await projectService.loadProjects();
    expect(projects).toHaveLength(0);

    const content = await projectService.readFile(project.id, 'index.html');
    expect(content).toBe('');
  });

  it('getProjectById 返回对应项目', async () => {
    await projectService.loadProjects();
    const project = await projectService.createProject('查询测试', 'single');

    const found = projectService.getProjectById(project.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(project.id);
    expect(found?.name).toBe('查询测试');

    // 不存在的 id 返回 undefined
    expect(projectService.getProjectById('non-existent-id')).toBeUndefined();
  });

  it('listFiles 返回项目下的所有文件', async () => {
    await projectService.loadProjects();
    const project = await projectService.createProject('列表测试', 'folder');

    const files = await projectService.listFiles(project.id);
    const fileNames = files.map((f) => f.name);

    expect(fileNames).toContain('index.html');
    expect(fileNames).toContain('style.css');
    expect(fileNames).toContain('script.js');
    expect(files.length).toBeGreaterThanOrEqual(3);

    // 每个文件项应有 path 和 type
    files.forEach((f) => {
      expect(f.type).toBe('file');
      expect(f.path).toContain(project.id);
    });
  });

  it('listFiles 对不存在的项目返回空数组', async () => {
    await projectService.loadProjects();
    const files = await projectService.listFiles('non-existent-project');
    expect(files).toEqual([]);
  });
});
