import Footer from "common/src/components/Footer";
import ManagerNavbar from "./ManagerNavbar";
import React, { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <div className="flex flex-col min-h-screen relative">
      <ManagerNavbar />
      <main className="container mx-auto dark:bg-primary-background grow relative">
        {children}
      </main>

      <div className="mr-20 mb-6">
        <div className="w-full max-w-screen-2xl mx-auto px-8 flex justify-end mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Layout;
