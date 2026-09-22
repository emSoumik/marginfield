import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="auth-screen">
        <section className="auth-card">
          <h1>Your workspace couldn’t open.</h1>
          <p>
            Check the backend connection and try again. Your cloud library has
            not been deleted.
          </p>
          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </section>
      </main>
    ) : (
      this.props.children
    );
  }
}
