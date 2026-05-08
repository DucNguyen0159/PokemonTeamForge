"use client";

import React from "react";
import { ErrorMessage } from "./error-message";

type ErrorBoundaryProps = {
  title?: string;
  message?: string;
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[Section Error Boundary]", error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage
          title={this.props.title ?? "Section unavailable"}
          message={
            this.props.message ??
            "Something in this section failed. You can keep using the rest of the page."
          }
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
