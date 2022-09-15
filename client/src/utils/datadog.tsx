import Datadog from "react-datadog";

interface Props {
  children: JSX.Element;
}

export default function DatadogComponent({ children }: Props) {
  if (process.env.NODE_ENV === "development") {
    return children;
  }

  return (
    <Datadog
      applicationId="5c45f4d1-3258-4206-bbdb-b73c9af5f340"
      clientToken="pubf505ad0eca99217895614fb3000dea1f"
      site="datadoghq.eu"
      service="grant-hub"
      // Specify a version number to identify the deployed version of your application in Datadog
      // version="1.0.0"
      sampleRate={100}
      premiumSampleRate={100}
      // trackInteractions
      sessionReplayRecording={false}
      // Uncomment if session replay is enabled
      // defaultPrivacyLevel="mask-user-input"
    >
      {children}
    </Datadog>
  );
}
