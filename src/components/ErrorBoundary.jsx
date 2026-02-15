import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console in development mode only
    if (import.meta.env.DEV) {
      console.error('🚨 Error caught by ErrorBoundary:', error);
      console.error('📍 Component Stack:', errorInfo.componentStack);
    }
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-6">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">
                Oops! Ada yang Error
              </h1>
              <p className="text-red-100 text-sm font-medium">
                Aplikasi mengalami kesalahan yang tidak terduga
              </p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                  Maaf atas ketidaknyamanan ini. Aplikasi mengalami error saat memproses permintaan Anda.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Silakan coba reload halaman ini. Jika masalah terus berlanjut, hubungi administrator.
                </p>
              </div>

              {/* Error Details (Development Mode Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                    Error Details (Dev Mode)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1">Error Message:</p>
                      <p className="text-sm font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        {this.state.error.toString()}
                      </p>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">Component Stack:</p>
                        <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-h-48 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={this.handleReload}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Halaman
              </button>

              {/* Help Text */}
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Atau tekan <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono text-slate-600 dark:text-slate-300">Ctrl+R</kbd> / <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono text-slate-600 dark:text-slate-300">⌘+R</kbd> untuk reload
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
