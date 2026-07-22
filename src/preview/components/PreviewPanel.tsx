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

      <div ref={containerRef} className="flex-1 bg-white" />

      {showConsole && (
        <div className="h-32 overflow-y-auto border-t border-slate-800 p-3 font-mono text-xs bg-slate-950">
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
