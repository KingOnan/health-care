import { Component } from "react";

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            padding: "16px",
            color: "red",
            fontSize: "14px",
          }}
        >
          {this.state.error.message}
          {"\n\n"}
          {this.state.error.stack}
        </pre>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
