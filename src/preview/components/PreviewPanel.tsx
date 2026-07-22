import { useEffect, useRef, useState } from 'react';
import { previewService, type ConsoleMessage } from '../services/previewService';
import { IconEye, IconChevronUp, IconChevronDown } from '@/common/components/Icons';

interface PreviewPanelProps {
  html: string;
  css: string;
  js: string;
}

type ConsoleHeight = 'sm' | 'md' | 'lg';

const CONSOLE_HEIGHT_CLASS: Record<ConsoleHeight, string> = {
  sm: 'h-24',
  md: 'h-40',
  lg: 'h-64',
};

export const PreviewPanel = ({ html, css, js }: PreviewPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState<ConsoleHeight>('md');

  const isEmpty = !html.trim() && !css.trim() && !js.trim();

  const cycleConsoleHeight = () => {
    setConsoleHeight((prev) => (prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'sm'));
  };

  useEffect(() => {
    if (!containerRef.current) return;

    previewService.init(containerRef.current);

    previewService.onConsoleMessage((message) => {
      setConsoleMessages((prev) => [...prev, message]);
    });

    return () => {
      previewService.dispose();
    };
  }, []);

  useEffect(() => {
    if (renderTimer.current) clearTimeout(renderTimer.current);
    renderTimer.current = setTimeout(() => {
      previewService.render(html, css, js);
      previewService.clearConsole();
      setConsoleMessages([]);
    }, 300);
    return () => {
      if (renderTimer.current) clearTimeout(renderTimer.current);
    };
  }, [html, css, js]);

  const getMessageColor = (type: string): string => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-slate-300';
    }
  };

  const getMessageLabel = (type: string): string => {
    switch (type) {
      case 'error':
        return '错误';
      case 'warn':
        return '警告';
      case 'info':
        return '信息';
      default:
        return '日志';
    }
  };

  const HeightIcon = consoleHeight === 'lg' ? IconChevronDown : IconChevronUp;

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <span className="text-slate-300 font-medium text-sm">预览</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            aria-label="帮助"
            className="w-11 h-11 flex items-center justify-center text-slate-500 active:text-cyan-400 transition-colors rounded-lg"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12" y2="17" />
            </svg>
          </button>
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`min-h-[44px] px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
              showConsole
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            控制台 {consoleMessages.length > 0 && `(${consoleMessages.length})`}
          </button>
        </div>
      </div>

      {/* 帮助说明 */}
      {showHelp && (
        <div className="p-4 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 space-y-2">
          <h3 className="text-white font-bold text-sm mb-2">HTML / CSS / JS 三者关系</h3>
          <p><span className="text-orange-400 font-bold">HTML</span>：网页的骨架结构（按钮、文字、图片等）</p>
          <p><span className="text-blue-400 font-bold">CSS</span>：网页的样式外观（颜色、大小、布局等）</p>
          <p><span className="text-yellow-400 font-bold">JS</span>：网页的交互逻辑（点击事件、动画、数据处理等）</p>
          <div className="mt-2 pt-2 border-t border-slate-700">
            <p className="text-slate-400">预览界面显示的是三者组合后的完整效果：</p>
            <p className="text-slate-500 mt-1">HTML 提供结构 → CSS 美化样式 → JS 添加交互 → 合并渲染</p>
          </div>
        </div>
      )}

      <div className="flex-1 relative bg-white">
        <div ref={containerRef} className="absolute inset-0 bg-white" />
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-slate-950">
            <IconEye size={56} className="mb-4 text-slate-400" />
            <p className="text-white text-base font-medium mb-1">预览区为空</p>
            <p className="text-slate-400 text-sm">请在编辑器中编写代码，或选择已有项目</p>
          </div>
        )}
      </div>

      {showConsole && (
        <div className={`console-output selectable ${CONSOLE_HEIGHT_CLASS[consoleHeight]} overflow-hidden border-t border-slate-800 bg-slate-950 flex-shrink-0 flex flex-col`}>
          <div className="flex items-center justify-between px-3 py-1 border-b border-slate-800/60 flex-shrink-0">
            <span className="text-slate-500 font-semibold text-xs">控制台输出</span>
            <button
              onClick={cycleConsoleHeight}
              aria-label="切换控制台高度"
              className="min-h-[44px] w-11 flex items-center justify-center text-slate-400 active:text-cyan-400 transition-colors rounded-lg"
            >
              <HeightIcon size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
            {consoleMessages.length === 0 ? (
              <div className="text-slate-400">暂无输出...</div>
            ) : (
              consoleMessages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-2 mb-1 ${getMessageColor(msg.type)}`}>
                  <span className="text-slate-400 flex-shrink-0">[{getMessageLabel(msg.type)}]</span>
                  <span className="break-all">{msg.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
