// src/components/ErrorBoundary.jsx
import React from "react";
import { logError } from "../lib/log.js";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(error) {
    return { err: error };
  }
  componentDidCatch(error, errorInfo) {
    logError("React render error", { message: error?.message, stack: error?.stack, errorInfo });
  }
  render() {
    if (this.state.err) {
      return (
        <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="mb-2 text-lg font-semibold">Something went wrong rendering this page.</div>
          <div className="text-sm">
            <div className="mb-2">Error: {this.state.err?.message || String(this.state.err)}</div>
            <button
              onClick={() => location.reload()}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Reload
            </button>
            <span className="ml-3 text-xs text-red-900/80">Open the Debug Log (button in header) to see details.</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
