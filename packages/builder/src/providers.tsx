import { Web3Provider } from "@allo-team/kit"; // Changed to import statement

export function AlloKitProviders({
  children,
}: Readonly<{
  children: any;
}>) {
  return <Web3Provider>{children}</Web3Provider>;
}
