// Breadcrumb.tsx
import React from "react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex flex-wrap items-center text-sm text-gray-400 font-bold">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Link
            to={item.path}
            className={`hover:text-violet-400 transition duration-150 ease-in-out ${
              index === items.length - 1 ? "text-gray-400" : ""
            }`}
          >
            {item.name}
          </Link>
          {index < items.length - 1 && (
            <span className="mx-2 text-gray-400">
              <svg
                className="flex-shrink-0 mx-2 h-3 w-3 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.293 1.293a1 1 0 011.414 0l8 8a1 1 0 010 1.414l-8 8a1 1 0 01-1.414-1.414L11.586 10 5.293 3.707a1 1 0 010-1.414z" />
              </svg>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
