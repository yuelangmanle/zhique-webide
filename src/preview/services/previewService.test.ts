import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { previewService } from './previewService';

describe('previewService', () => {
  let container: HTMLElement;
  // 跟踪 window 'message' 事件监听器
  // 注意：源码 dispose 使用 this.handleMessage.bind(this) 移除监听，
  // 每次调用 bind 创建新引用，导致 removeEventListener 实际无效。
  // 为保证测试隔离，mock addEventListener/removeEventListener，
  // removeEventListener('message', ...) 时清空所有 message listeners。
  const messageListeners: Array<(event: { data: unknown }) => void> = [];

  function emitMessage(data: unknown): void {
    const event = { data } as MessageEvent;
    messageListeners.forEach((l) => l(event as never));
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    messageListeners.length = 0;
    // previewService 是单例，consoleMessages 会跨测试累积；每个测试前清空
    previewService.clearConsole();

    // jsdom 26 未实现 HTMLIFrameElement.sandbox，polyfill 一个最小 DOMTokenList
    // 让源码 this.iframe.sandbox.add(...) 可正常调用
    Object.defineProperty(HTMLIFrameElement.prototype, 'sandbox', {
      configurable: true,
      value: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => false,
        item: () => null,
        length: 0,
        toString: () => '',
        supports: () => true,
      },
    });

    jest.spyOn(window, 'addEventListener').mockImplementation(((type: string, listener: unknown) => {
      if (type === 'message' && typeof listener === 'function') {
        messageListeners.push(listener as (event: { data: unknown }) => void);
      }
    }) as typeof window.addEventListener);

    jest.spyOn(window, 'removeEventListener').mockImplementation(((type: string) => {
      if (type === 'message') {
        // 弥补源码 .bind() 导致的无法精确移除问题，清空所有 message listeners
        messageListeners.length = 0;
      }
    }) as typeof window.removeEventListener);
  });

  afterEach(() => {
    previewService.dispose();
    messageListeners.length = 0;
    jest.restoreAllMocks();
    // 还原 sandbox polyfill
    delete (HTMLIFrameElement.prototype as unknown as { sandbox?: unknown }).sandbox;
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
  });

  it('init 创建 iframe 并挂载到容器', () => {
    previewService.init(container);
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.className).toContain('iframe-preview');
    expect(iframe?.style.width).toBe('100%');
    expect(iframe?.style.height).toBe('100%');
  });

  it('render 设置 iframe srcdoc，包含 html/css/js', () => {
    previewService.init(container);
    previewService.render('<h1>hello</h1>', 'h1 { color: red; }', 'console.log("hi");');
    const iframe = container.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain('<h1>hello</h1>');
    expect(iframe.srcdoc).toContain('h1 { color: red; }');
    expect(iframe.srcdoc).toContain('console.log("hi");');
  });

  it('onConsoleMessage 回调在收到 message 时被调用', () => {
    previewService.init(container);
    const callback = jest.fn();
    previewService.onConsoleMessage(callback);

    // 模拟 iframe 内通过 postMessage 发出的控制台消息
    emitMessage({ type: 'console', level: 'log', message: 'hello from iframe' });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      type: 'log',
      message: 'hello from iframe',
    });
    expect(previewService.getConsoleOutput()).toHaveLength(1);
    expect(previewService.getConsoleOutput()[0].message).toBe('hello from iframe');
  });

  it('clearConsole 清空已收集的控制台消息', () => {
    previewService.init(container);
    emitMessage({ type: 'console', level: 'log', message: 'msg1' });
    expect(previewService.getConsoleOutput()).toHaveLength(1);
    previewService.clearConsole();
    expect(previewService.getConsoleOutput()).toHaveLength(0);
  });

  it('dispose 清理：iframe 移除、回调不再触发', () => {
    previewService.init(container);
    const callback = jest.fn();
    previewService.onConsoleMessage(callback);

    previewService.dispose();

    // iframe 应已从 DOM 移除
    expect(container.querySelector('iframe')).toBeNull();

    // dispose 后再触发 message 不应调用回调
    emitMessage({ type: 'console', level: 'log', message: 'after dispose' });
    expect(callback).not.toHaveBeenCalled();
  });
});
