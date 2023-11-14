interface Window {
  dataLayer: Array<{
    event: string;
    [key: string]: string | string;
  }>;
}
