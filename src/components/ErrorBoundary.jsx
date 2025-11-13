import React from "react";

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
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 Error Boundary Caught:", error);
    console.error("🔥 Error Info:", errorInfo);
    console.error("🔥 Component Stack:", errorInfo.componentStack);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-red-900/20 border-2 border-red-500 rounded-xl p-8">
            <h1 className="text-3xl font-bold text-red-400 mb-4">
              ⚠️ Something went wrong
            </h1>
            
            <div className="bg-black/50 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Error:</h2>
              <pre className="text-red-300 text-sm overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>

            {this.state.errorInfo && (
              <div className="bg-black/50 rounded-lg p-4 mb-4">
                <h2 className="text-xl font-semibold text-white mb-2">Component Stack:</h2>
                <pre className="text-gray-300 text-xs overflow-auto max-h-60">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              Reload Page
            </button>

            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <p className="text-yellow-200 text-sm">
                💡 <strong>This is the REAL error that needs to be fixed.</strong>
                <br />
                Please copy the error message above and share it to get help fixing the issue.
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
