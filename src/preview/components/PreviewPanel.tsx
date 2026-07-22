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
  const [showConsole, setShowConsole] = useState(true);

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
        return 'text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-800">
      <div className="flex items-center justify-between px-3 py-2 bg-dark-700 border-b border-dark-600">
        <span className="text-white font-semibold text-sm">Preview</span>
        <button
          onClick={() => setShowConsole(!showConsole)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            showConsole
              ? 'bg-primary-500 text-white'
              : 'bg-dark-600 text-gray-400 hover:bg-dark-500'
          }`}
        >
          Console {showConsole ? '▼' : '▲'}
        </button>
      </div>

      <div ref={containerRef} className="flex-1 bg-white" />

      {showConsole && (
        <div className="h-40 sm:h-48 overflow-y-auto border-t border-dark-600 p-3 font-mono text-xs">
          <div className="text-gray-400 font-semibold mb-2">Console Output</div>
          {consoleMessages.length === 0 ? (
            <div className="text-gray-500">No console output yet...</div>
          ) : (
            consoleMessages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2 mb-1 ${getMessageColor(msg.type)}`}>
                <span className="text-gray-500 flex-shrink-0">[{msg.type}]</span>
                <span className="break-all">{msg.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
