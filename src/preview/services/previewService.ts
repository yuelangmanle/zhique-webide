import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
    container.appendChild(this.iframe);

    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    if (event.data?.type === 'console') {
      const message: ConsoleMessage = {
        type: event.data.level || 'log',
        message: event.data.message,
      };
      this.consoleMessages.push(message);
      this.consoleCallbacks.forEach((callback) => callback(message));
    }

    if (event.data?.type === 'capacitor-request') {
      try {
        const response = await this.handleCapacitorRequest(event.data);
        this.sendMessageToIframe({
          type: 'capacitor-response',
          id: event.data.id,
          success: true,
          data: response,
        });
      } catch (error) {
        this.sendMessageToIframe({
          type: 'capacitor-response',
          id: event.data.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  private async handleCapacitorRequest(data: { method: string; params?: Record<string, unknown> }): Promise<unknown> {
    switch (data.method) {
      case 'camera.getPhoto':
        const cameraResult = await Camera.getPhoto({
          quality: data.params?.quality as number || 90,
          resultType: CameraResultType.Base64,
        });
        return {
          base64Data: cameraResult.base64String,
          format: cameraResult.format,
          webPath: cameraResult.webPath,
        };

      case 'geolocation.getCurrentPosition':
        const geoResult = await Geolocation.getCurrentPosition({
          enableHighAccuracy: data.params?.enableHighAccuracy as boolean || true,
        });
        return {
          latitude: geoResult.coords.latitude,
          longitude: geoResult.coords.longitude,
          accuracy: geoResult.coords.accuracy,
          altitude: geoResult.coords.altitude,
          speed: geoResult.coords.speed,
        };

      case 'filesystem.readFile':
        const readResult = await Filesystem.readFile({
          path: data.params?.path as string,
          directory: (data.params?.directory as string) as Directory || Directory.Data,
        });
        return { data: readResult.data };

      case 'filesystem.writeFile':
        await Filesystem.writeFile({
          path: data.params?.path as string,
          data: data.params?.data as string,
          directory: (data.params?.directory as string) as Directory || Directory.Data,
        });
        return { success: true };

      case 'filesystem.mkdir':
        await Filesystem.mkdir({
          path: data.params?.path as string,
          directory: (data.params?.directory as string) as Directory || Directory.Data,
          recursive: data.params?.recursive as boolean || true,
        });
        return { success: true };

      default:
        throw new Error(`Unknown method: ${data.method}`);
    }
  }

  private sendMessageToIframe(data: unknown): void {
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(data, '*');
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
          
          console.log = (...args) => {
            originalLog.apply(console, args);
            window.parent.postMessage({ type: 'console', level: 'log', message: JSON.stringify(args) }, '*');
          };
          
          console.error = (...args) => {
            originalError.apply(console, args);
            window.parent.postMessage({ type: 'console', level: 'error', message: JSON.stringify(args) }, '*');
          };
          
          console.warn = (...args) => {
            originalWarn.apply(console, args);
            window.parent.postMessage({ type: 'console', level: 'warn', message: JSON.stringify(args) }, '*');
          };
          
          console.info = (...args) => {
            originalInfo.apply(console, args);
            window.parent.postMessage({ type: 'console', level: 'info', message: JSON.stringify(args) }, '*');
          };

          window.Capacitor = {
            Plugin: {
              create: () => ({
                call: (method, params) => new Promise((resolve, reject) => {
                  const id = Date.now() + Math.random();
                  const handler = (event) => {
                    if (event.data?.type === 'capacitor-response' && event.data?.id === id) {
                      window.removeEventListener('message', handler);
                      if (event.data.success) {
                        resolve(event.data.data);
                      } else {
                        reject(new Error(event.data.error));
                      }
                    }
                  };
                  window.addEventListener('message', handler);
                  window.parent.postMessage({ type: 'capacitor-request', id, method, params }, '*');
                })
              })
            },
            Camera: {
              getPhoto: (options) => {
                const plugin = window.Capacitor.Plugin.create();
                return plugin.call('camera.getPhoto', options);
              }
            },
            Geolocation: {
              getCurrentPosition: (options) => {
                const plugin = window.Capacitor.Plugin.create();
                return plugin.call('geolocation.getCurrentPosition', options);
              }
            },
            Filesystem: {
              readFile: (options) => {
                const plugin = window.Capacitor.Plugin.create();
                return plugin.call('filesystem.readFile', options);
              },
              writeFile: (options) => {
                const plugin = window.Capacitor.Plugin.create();
                return plugin.call('filesystem.writeFile', options);
              },
              mkdir: (options) => {
                const plugin = window.Capacitor.Plugin.create();
                return plugin.call('filesystem.mkdir', options);
              }
            }
          };
        <\/script>
        <script>${js}<\/script>
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
