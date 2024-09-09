import { ReactNode } from "react";
import { Link } from "react-router-dom";
import React from "react";

// Navbar Props interface
export interface NavbarProps {
  logo: ReactNode; // Logo to display
  ConnectWalletItem: React.JSX.Element; // Connect wallet button
  menuItems?: ReactNode[]; // Menu items as ReactNode array
  walletInteraction?: boolean; // Show wallet connect or not
  className?: string; // Optional custom background class
  extraRightElements?: ReactNode[]; // Additional elements on the right
}

// Main Navbar Component
export default function Navbar({
  logo,
  ConnectWalletItem,
  menuItems = [],
  walletInteraction = true,
  className = "",
  extraRightElements = [],
}: NavbarProps) {
  return (
    <nav className={`${className}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-2xl">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {logo}
            </Link>
          </div>
          <div className="flex items-center gap-6 font-mono font-medium">
            {/* Render menu items */}
            {menuItems.map((item, idx) => (
              <div key={idx}>{item}</div>
            ))}

            {/* Optional Wallet Interaction */}
            {walletInteraction && (
              <div
                data-testid="connect-wallet-button"
                id="connect-wallet-button"
              >
                {ConnectWalletItem}
              </div>
            )}

            {/* Additional elements on the right */}
            {extraRightElements.map((element, idx) => (
              <div
                className="flex items-center gap-6 font-mono font-medium"
                key={idx}
              >
                {element}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
