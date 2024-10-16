import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/kit/features/common/Providers";
import Header from "@/kit/features/common/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gitcoin Grants Explorer",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <Header />
          <main className="">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
