import { ComponentProps } from "react";
import Footer from "common/src/components/Footer";
import Navbar from "./Navbar";

type LayoutProps = { showWalletInteraction?: boolean } & ComponentProps<"main">;

export function DefaultLayout({
  showWalletInteraction = true,
  children,
  className,
}: LayoutProps) {
  return (
    <main className={"font-sans min-h-screen " + className}>
      <Navbar showWalletInteraction={showWalletInteraction} />
      <div className="container mx-auto max-w-screen-xl pt-16 relative z-10 px-2 xl:px-0">
        {children}
      </div>

      <Footer />
    </main>
  );
}

export function GradientLayout({
  showWalletInteraction = true,
  children,
}: LayoutProps) {
  return (
    <main
      className={
        "font-sans min-h-screen bg-gradient-to-b from-[#D3EDFE] to-[#FFD9CD]"
      }
    >
      <Navbar showWalletInteraction={showWalletInteraction} />
      <div className="container mx-auto max-w-screen-xl pt-16 relative z-10 px-2 xl:px-0">
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
