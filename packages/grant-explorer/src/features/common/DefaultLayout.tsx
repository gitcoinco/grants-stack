import { ComponentProps } from "react";
import Footer from "common/src/components/Footer";
import Navbar from "./Navbar";
import { classNames } from "common";

type LayoutProps = {
  showAlloVersionBanner?: boolean;
  showWalletInteraction?: boolean;
} & ComponentProps<"main">;

export function DefaultLayout({
  showWalletInteraction = true,
  children,
}: LayoutProps) {
  return (
    <main className={"font-sans min-h-screen text-grey-500"}>
      <Navbar showWalletInteraction={showWalletInteraction} />
      <div className="container pt-16 relative z-10 mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-2xl">
        {children}
      </div>

      <Footer />
    </main>
  );
}

export function GradientLayout({
  showWalletInteraction = true,
  showAlloVersionBanner = false,
  children,
}: LayoutProps) {
  return (
    <main
      className={
        "font-sans min-h-screen bg-gradient-to-b from-[#D3EDFE] to-[#FFD9CD]"
      }
    >
      <Navbar
        showWalletInteraction={showWalletInteraction}
        showAlloVersionBanner={showAlloVersionBanner}
      />
      <div
        className={classNames(
          "mx-auto w-full relative z-10 px-4 sm:px-6 lg:px-20",
          showAlloVersionBanner ? "pt-[120px]" : "pt-16"
        )}
        style={{
          background:
            "linear-gradient(180deg, #ADEDE5 -13.57%, rgba(21, 184, 220, 0.47) 45.05%, rgba(0,0,0,0) 92.61%)",
        }}
      >
        {children}
      </div>

      <Footer />
    </main>
  );
}
