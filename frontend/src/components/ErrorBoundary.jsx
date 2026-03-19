import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#08060D] p-6">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-2xl shadow-rose-500/10">
              <ExclamationTriangleIcon className="w-10 h-10 text-rose-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-black text-white mb-3 tracking-tight">
              Something Went Wrong
            </h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              An unexpected error occurred. Our team has been notified. Please reload the page to continue.
            </p>

            {/* Error Detail */}
            {this.state.error && (
              <div className="mb-6 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-left">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Error Details</p>
                <p className="text-xs text-rose-300 font-mono break-all">
                  {this.state.error.message || 'Unknown error'}
                </p>
              </div>
            )}

            {/* Actions */}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm hover:from-indigo-400 hover:to-blue-500 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reload Application
            </button>

            <p className="text-gray-600 text-[10px] mt-6 font-mono uppercase tracking-widest">
              FinLedger Pro • Error Recovery Module
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
