import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";

// Navbar Props interface
export interface NavbarProps {
  logo: ReactNode; // Logo to display
  ConnectWalletItem: React.JSX.Element; // Connect wallet button
  menuItems?: ReactNode[]; // Menu items as ReactNode array
  leftWalletElements?: ReactNode[]; // Left wallet element
  walletInteraction?: boolean; // Show wallet connect or not
  className?: string; // Optional custom background class
  classNames?: string[]; // Custom layout class array
  extraRightElements?: ReactNode[]; // Additional elements on the right
}

// Main Navbar Component
export default function Navbar({
  logo,
  ConnectWalletItem,
  menuItems = [],
  leftWalletElements = [],
  walletInteraction = true,
  className = "",
  classNames = [],
  extraRightElements = [],
}: NavbarProps) {
  const [navbarOpen, setNavbarOpen] = useState(false);

  return (
    <nav className={`${classNames[0]}`}>
      <div className={`${classNames[1]}`}>
        <div className={`flex justify-between h-16 ${classNames[2]}`}>
          <Link to="/" className="flex-shrink-0 flex items-center">
            {logo}
          </Link>
        </div>

        <div className={`flex justify-between  `} id="navbar-content">
          {/* Render menu items */}
          {menuItems.map((item, idx) => (
            <div key={idx} className="mt-2 lg:mt-0 lg:ml-4">
              {item}
            </div>
          ))}

          {/* Left Wallet elements on the right */}
          {leftWalletElements.map((element, idx) => (
            <div key={idx} className="mt-2 lg:mt-0 lg:ml-4">
              {element}
            </div>
          ))}
          {/* Optional Wallet Interaction */}
          {walletInteraction && (
            <div
              data-testid="connect-wallet-button"
              id="connect-wallet-button"
              className="mt-2 lg:mt-0 lg:ml-4"
            >
              {ConnectWalletItem}
            </div>
          )}

          {/* Additional elements on the right */}
          {extraRightElements.map((element, idx) => (
            <div key={idx} className="mt-2 lg:mt-0 lg:ml-4">
              {element}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
