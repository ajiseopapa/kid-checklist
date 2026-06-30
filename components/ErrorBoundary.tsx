"use client";

import React from "react";

type State = { error: Error | null };

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("렌더링 중 오류:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-50 bg-app flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="text-5xl">😵</div>
          <p className="font-display text-lg">화면을 그리는 중 문제가 생겼어요</p>
          <pre className="text-xs whitespace-pre-wrap max-w-md p-3 rounded-xl bg-white text-left overflow-auto max-h-60">
            {this.state.error.message}
            {"\n"}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="press-pop rounded-full px-4 py-2 text-sm font-display"
            style={{ background: "white" }}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
