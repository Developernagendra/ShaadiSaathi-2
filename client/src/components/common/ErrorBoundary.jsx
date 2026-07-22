import React from 'react'
import { Link } from 'react-router-dom'
import { FiRefreshCw, FiHome, FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚀 [Dashboard Error Boundary Caught Exception]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 sm:p-12 bg-transparent text-center animate-fade-in relative">
          <div className="absolute inset-0 floral-pattern opacity-[0.03] pointer-events-none" />
          
          <div className="bg-white rounded-[3rem] p-10 md:p-16 max-w-2xl w-full shadow-premium border border-pink-50 relative overflow-hidden z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="w-24 h-24 bg-[#FFF8F0] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-pink-100 rotate-12 relative z-10">
              <FiAlertTriangle className="w-10 h-10 text-[#C2185B]" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#FFF8F0] px-4 py-1.5 rounded-full border border-pink-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#C2185B] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C2185B]">System Notice</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-none">
                Dashboard <span className="text-[#D4AF37] italic">Unavailable</span>
              </h2>
              
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10 max-w-md mx-auto">
                We are currently reloading your latest data. Please refresh the dashboard or return to the homepage to continue.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#C2185B] to-[#8E244D] text-white font-black text-[11px] uppercase tracking-[0.2em] py-4 px-10 rounded-2xl shadow-xl hover:shadow-[0_8px_25px_rgba(194,24,91,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  <FiRefreshCw size={18} /> Refresh Dashboard
                </button>
                <Link 
                  to="/"
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full sm:w-auto bg-[#FFF8F0] text-[#C2185B] font-black text-[11px] uppercase tracking-[0.2em] py-4 px-10 rounded-2xl shadow-sm hover:bg-[#FCE4EC] transition-all flex items-center justify-center gap-3 border border-pink-100"
                >
                  <FiHome size={18} /> Go To Homepage
                </Link>
              </div>
            </div>

            {import.meta.env.DEV && (
              <div className="mt-12 text-left relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Developer Error Trace:</p>
                <pre className="p-6 bg-gray-950 text-rose-300 rounded-2xl text-[11px] overflow-x-auto max-w-full font-mono border border-gray-800 shadow-inner">
                  {this.state.error?.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
