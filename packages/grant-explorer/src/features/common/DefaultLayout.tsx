import { PropsWithChildren } from "react";
import Footer from "common/src/components/Footer";
import Navbar from "./Navbar";

export function DefaultLayout({
  showWalletInteraction = true,
  children,
}: PropsWithChildren<{ showWalletInteraction: boolean }>) {
  return (
    <main className="font-sans bg-gradient-to-b from-[#D3EDFE] to-[#FFD9CD] min-h-screen">
      <Navbar showWalletInteraction={showWalletInteraction} />
      <div className="container mx-auto max-w-screen-xl pt-16 relative z-10 p-4">
        {children}
      </div>

      <Footer />
      <div
        className="min-h-screen absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #ADEDE5 -13.57%, rgba(21, 184, 220, 0.47) 45.05%, rgba(0,0,0,0) 92.61%)",
        }}
      />
    </main>
  );
}
