import { AppState, Project, ProjectFile, APKBuildConfig } from '../types';

class AppStore {
  private state: AppState = {
    currentProject: null,
    openedFiles: [],
    selectedFile: null,
    editorContent: {},
    previewMode: 'split',
    aiProvider: 'openai',
    aiProviders: [],
    buildConfig: {
      packageName: 'com.example.app',
      versionName: '1.0.0',
      versionCode: 1,
      icon: '',
      permissions: [],
      webFiles: '',
    },
    permissionSettings: {},
  };

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  getState(): AppState {
    return this.state;
  }

  setCurrentProject(project: Project | null): void {
    this.state.currentProject = project;
    this.notify();
  }

  addOpenedFile(file: ProjectFile): void {
    if (!this.state.openedFiles.find((f) => f.path === file.path)) {
      this.state.openedFiles.push(file);
    }
    this.setSelectedFile(file);
    this.notify();
  }

  removeOpenedFile(filePath: string): void {
    this.state.openedFiles = this.state.openedFiles.filter((f) => f.path !== filePath);
    if (this.state.selectedFile?.path === filePath) {
      this.state.selectedFile = this.state.openedFiles[0] || null;
    }
    this.notify();
  }

  setSelectedFile(file: ProjectFile | null): void {
    this.state.selectedFile = file;
    this.notify();
  }

  setEditorContent(filePath: string, content: string): void {
    this.state.editorContent[filePath] = content;
    this.notify();
  }

  getEditorContent(filePath: string): string {
    return this.state.editorContent[filePath] || '';
  }

  setPreviewMode(mode: AppState['previewMode']): void {
    this.state.previewMode = mode;
    this.notify();
  }

  setAIProvider(providerId: string): void {
    this.state.aiProvider = providerId;
    this.notify();
  }

  addAIProvider(provider: AppState['aiProviders'][0]): void {
    this.state.aiProviders.push(provider);
    this.notify();
  }

  updateAIProvider(providerId: string, updates: Partial<AppState['aiProviders'][0]>): void {
    const index = this.state.aiProviders.findIndex((p) => p.id === providerId);
    if (index !== -1) {
      this.state.aiProviders[index] = { ...this.state.aiProviders[index], ...updates };
      this.notify();
    }
  }

  removeAIProvider(providerId: string): void {
    this.state.aiProviders = this.state.aiProviders.filter((p) => p.id !== providerId);
    if (this.state.aiProvider === providerId) {
      this.state.aiProvider = this.state.aiProviders[0]?.id || '';
    }
    this.notify();
  }

  setBuildConfig(config: Partial<APKBuildConfig>): void {
    this.state.buildConfig = { ...this.state.buildConfig, ...config };
    this.notify();
  }

  setPermissionSetting(permissionName: string, enabled: boolean): void {
    this.state.permissionSettings[permissionName] = enabled;
    this.notify();
  }

  getPermissionSettings(): Record<string, boolean> {
    return this.state.permissionSettings;
  }

  togglePermissionSetting(permissionName: string): void {
    this.state.permissionSettings[permissionName] = !this.state.permissionSettings[permissionName];
    this.notify();
  }
}

export const appStore = new AppStore();