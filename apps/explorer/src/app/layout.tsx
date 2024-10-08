import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AlloKitProviders } from "@/components/app/Providers";
import Header from "@/components/app/Header";

const inter = Inter({ subsets: ["latin"] });

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
          <main className="max-w-screen-lg">{children}</main>
        </AlloKitProviders>
      </body>
    </html>
  );
}
