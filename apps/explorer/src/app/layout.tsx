import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { AlloKitProviders } from "@/features/app/components/Providers";
import Header from "@/features/app/components/Header";

export const metadata: Metadata = {
  title: "Allo Starter Kit Demo App",
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
        <AlloKitProviders>
          <Header />
          <main className="max-w-screen-lg py-16 mx-auto">{children}</main>
        </AlloKitProviders>
      </body>
    </html>
  );
}
