import { useEffect, useRef, useState } from 'react';
import { previewService, type ConsoleMessage } from '../services/previewService';

interface PreviewPanelProps {
  html: string;
  css: string;
  js: string;
}

export const PreviewPanel = ({ html, css, js }: PreviewPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
    previewService.render(html, css, js);
    previewService.clearConsole();
    setConsoleMessages([]);
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

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <span className="text-slate-300 font-medium text-sm">预览</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-7 h-7 flex items-center justify-center text-slate-500 active:text-cyan-400 transition-colors rounded-lg"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12" y2="17" />
            </svg>
          </button>
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
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

      <div ref={containerRef} className="flex-1 bg-white" />

      {showConsole && (
        <div className="h-32 overflow-y-auto border-t border-slate-800 p-3 font-mono text-xs bg-slate-950 flex-shrink-0">
          <div className="text-slate-500 font-semibold mb-2">控制台输出</div>
          {consoleMessages.length === 0 ? (
            <div className="text-slate-600">暂无输出...</div>
          ) : (
            consoleMessages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2 mb-1 ${getMessageColor(msg.type)}`}>
                <span className="text-slate-600 flex-shrink-0">[{getMessageLabel(msg.type)}]</span>
                <span className="break-all">{msg.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
