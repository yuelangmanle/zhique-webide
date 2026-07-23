import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { appStore } from './appStore';
import type { Project } from '../types';

describe('appStore', () => {
  beforeEach(() => {
    // 重置单例 state，确保测试隔离
    appStore.reset();
  });

  it('setCurrentProject 后 getState() 返回新引用（!== 旧引用）', () => {
    const before = appStore.getState();
    const project: Project = {
      id: 'test-1',
      name: '测试项目',
      type: 'single',
      path: 'test-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    appStore.setCurrentProject(project);
    const after = appStore.getState();
    expect(after).not.toBe(before);
    expect(after.currentProject).toEqual(project);
  });

  it('togglePermissionSetting 后 permissionSettings 是新对象', () => {
    const before = appStore.getState();
    const beforeSettings = before.permissionSettings;
    appStore.togglePermissionSetting('camera');
    const after = appStore.getState();
    expect(after.permissionSettings).not.toBe(beforeSettings);
    // 初始为 undefined -> !undefined === true
    expect(after.permissionSettings.camera).toBe(true);
  });

  it('subscribe 收到通知', () => {
    const listener = jest.fn();
    const unsubscribe = appStore.subscribe(listener);
    appStore.setCurrentProject(null);
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});
