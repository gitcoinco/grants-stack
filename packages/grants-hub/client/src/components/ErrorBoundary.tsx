import { datadogRum } from "@datadog/browser-rum";
import React from "react";

interface Props {
  children: JSX.Element;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    datadogRum.addError(error);
    console.error(error);
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      return (
        <div>
          <p>Something went wrong.</p>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
