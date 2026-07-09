import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RITMOFLOW render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-6">
          <div className="card-light p-8 max-w-md text-center">
            <h1 className="font-display text-2xl text-[#FF6B1A] mb-3">Algo salió mal</h1>
            <p className="text-gray-400 text-sm mb-4">
              Revisa que <code className="text-[#E91E8C]">VITE_API_URL</code> apunte al backend en Render y vuelve a desplegar.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="gradient-btn px-6 py-2 text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
