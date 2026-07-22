export interface Project {
  id: string;
  name: string;
  type: 'single' | 'folder';
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  baseURL: string;
  apiKey: string;
  model: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface APKBuildConfig {
  packageName: string;
  versionName: string;
  versionCode: number;
  icon: string;
  permissions: string[];
  webFiles: string;
  appName?: string;
}

export interface BuildResult {
  success: boolean;
  configJson?: string;
  error?: string;
}

export interface Permission {
  name: string;
  androidName: string;
  description: string;
  icon: string;
  default: boolean;
}

export interface PermissionState {
  name: string;
  granted: boolean;
  prompt: boolean;
}

export interface AppState {
  currentProject: Project | null;
  permissionSettings: Record<string, boolean>;
}