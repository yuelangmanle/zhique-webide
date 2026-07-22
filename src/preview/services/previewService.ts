interface ConsoleMessage {
  type: string;
  message: string;
}

interface PreviewService {
  render(html: string, css: string, js: string): void;
  getConsoleOutput(): ConsoleMessage[];
  clearConsole(): void;
  onConsoleMessage(callback: (message: ConsoleMessage) => void): void;
}

class WebViewPreviewService implements PreviewService {
  private iframe: HTMLIFrameElement | null = null;
  private consoleMessages: ConsoleMessage[] = [];
  private consoleCallbacks: Set<(message: ConsoleMessage) => void> = new Set();

  init(container: HTMLElement): void {
    this.iframe = document.createElement('iframe');
    this.iframe.sandbox.add('allow-scripts', 'allow-modals', 'allow-same-origin', 'allow-forms');
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';
    this.iframe.className = 'iframe-preview';
    container.appendChild(this.iframe);

    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent): void {
    if (event.data?.type === 'console') {
      const message: ConsoleMessage = {
        type: event.data.level || 'log',
        message: event.data.message,
      };
      this.consoleMessages.push(message);
      this.consoleCallbacks.forEach((callback) => callback(message));
    }
  }

  render(html: string, css: string, js: string): void {
    if (!this.iframe) return;

    const documentContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          const originalInfo = console.info;

          function formatArgs(args) {
            return args.map(a => {
              if (typeof a === 'object') {
                try { return JSON.stringify(a); } catch { return String(a); }
              }
              return String(a);
            }).join(' ');
          }

          console.log = (...args) => {
            originalLog.apply(console, args);
            window.parent.postMessage({ type: 'console', level: 'log', message: formatArgs(args) }, '*');
          };

          console.error = (...args) => {
            originalError.apply(console, args);
            window.parent.postMessage({ type: 'console', level: 'error', message: formatArgs(args) }, '*');
          };

          console.warn = (...args) => {
            originalWarn.apply(console, args);
            window.parent.postMessage({ type: 'console', level: 'warn', message: formatArgs(args) }, '*');
          };

          console.info = (...args) => {
            originalInfo.apply(console, args);
            window.parent.postMessage({ type: 'console', level: 'info', message: formatArgs(args) }, '*');
          };

          window.addEventListener('error', (e) => {
            window.parent.postMessage({ type: 'console', level: 'error', message: e.message + ' (' + e.filename + ':' + e.lineno + ')' }, '*');
          });
        <\/script>
        <script>
          try {
            ${js}
          } catch(e) {
            console.error(e.message);
          }
        <\/script>
      </body>
      </html>
    `;

    this.iframe.srcdoc = documentContent;
  }

  getConsoleOutput(): ConsoleMessage[] {
    return this.consoleMessages;
  }

  clearConsole(): void {
    this.consoleMessages = [];
  }

  onConsoleMessage(callback: (message: ConsoleMessage) => void): void {
    this.consoleCallbacks.add(callback);
  }

  dispose(): void {
    this.consoleCallbacks.clear();
    window.removeEventListener('message', this.handleMessage.bind(this));
    if (this.iframe && this.iframe.parentElement) {
      this.iframe.parentElement.removeChild(this.iframe);
    }
    this.iframe = null;
  }
}

export const previewService = new WebViewPreviewService();
export type { ConsoleMessage };
