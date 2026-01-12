import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Catches React rendering errors and displays a fallback UI.
 * Logs error details to console for debugging.
 * Provides recovery options (refresh or go home).
 */
class ErrorBoundaryClass extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log the error to console for debugging
		console.error('ErrorBoundary caught an error:', error);
		console.error('Error details:', errorInfo);
		
		// Update state with error info
		this.setState({
			error,
			errorInfo,
		});
	}

	handleRefresh = () => {
		window.location.reload();
	};

	handleGoHome = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
		window.location.href = '/';
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
					<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
						{/* Error Icon */}
						<div className="mb-6">
							<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
								<svg
									className="w-10 h-10 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							</div>
						</div>

						{/* Error Title */}
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							Something went wrong
						</h1>

						{/* Error Message */}
						<p className="text-gray-600 mb-6">
							We're sorry, but something unexpected happened. The error has been logged and our team will look into it.
						</p>

						{/* Error Details (Development Only) */}
						{import.meta.env.DEV && this.state.error && (
							<div className="mb-6 p-4 bg-gray-100 rounded text-left overflow-auto max-h-40">
								<p className="text-xs font-mono text-red-600 break-all">
									{this.state.error.toString()}
								</p>
								{this.state.errorInfo && (
									<details className="mt-2">
										<summary className="text-xs font-semibold text-gray-700 cursor-pointer">
											Stack Trace
										</summary>
										<pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
											{this.state.errorInfo.componentStack}
										</pre>
									</details>
								)}
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								onClick={this.handleRefresh}
								className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
							>
								Refresh Page
							</button>
							<button
								onClick={this.handleGoHome}
								className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
							>
								Go Home
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Export the class-based component
export default ErrorBoundaryClass;

