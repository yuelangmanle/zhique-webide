import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // WebView 下 console.error 会输出到 logcat
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="h-[100dvh] w-screen bg-slate-950 flex items-center justify-center px-6">
          <div className="text-center max-w-sm w-full">
            <div className="text-6xl mb-6">😵</div>
            <h1 className="text-white text-2xl font-bold mb-3">应用遇到问题</h1>
            <p className="text-slate-400 text-sm mb-2">很抱歉，应用发生了未预期的错误。</p>
            {this.state.error && (
              <pre className="text-red-400 text-xs bg-slate-900 rounded-lg p-3 mb-6 overflow-auto max-h-32 text-left whitespace-pre-wrap break-all">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              className="px-6 py-2.5 bg-cyan-500 text-white text-sm font-medium rounded-xl active:bg-cyan-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
