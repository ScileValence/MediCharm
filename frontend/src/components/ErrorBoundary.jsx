// src/components/ErrorBoundary.jsx
import React from "react";
import { AlertTriangleIcon } from "./ui/icons";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("🔥 React Render Error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="state-block state-block--error mx-auto" style={{ maxWidth: "32rem" }}>
            <AlertTriangleIcon className="state-block__icon" aria-hidden="true" />
            <div className="state-block__title">Something went wrong</div>
            <div className="state-block__body">
              This page hit an unexpected error. You can try going back to
              the homepage — if it keeps happening, please let us know.
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={this.handleReload}>
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
