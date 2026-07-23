import { AppState, Project } from '../types';

class AppStore {
  private state: AppState = {
    currentProject: null,
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
    this.state = { ...this.state, currentProject: project };
    this.notify();
  }

  setPermissionSetting(permissionName: string, enabled: boolean): void {
    this.state = {
      ...this.state,
      permissionSettings: { ...this.state.permissionSettings, [permissionName]: enabled },
    };
    this.notify();
  }

  getPermissionSettings(): Record<string, boolean> {
    return this.state.permissionSettings;
  }

  togglePermissionSetting(permissionName: string): void {
    this.state = {
      ...this.state,
      permissionSettings: {
        ...this.state.permissionSettings,
        [permissionName]: !this.state.permissionSettings[permissionName],
      },
    };
    this.notify();
  }

  /** 重置到初始状态（仅用于测试隔离） */
  reset(): void {
    this.state = {
      currentProject: null,
      permissionSettings: {},
    };
    this.notify();
  }
}

export const appStore = new AppStore();
