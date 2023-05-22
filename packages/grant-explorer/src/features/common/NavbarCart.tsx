import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listenForOutsideClicks } from "../api/utils";
import { Project } from "../api/types";
import { Button } from "common/src/styles";
import { CheckIcon, EyeIcon } from "@heroicons/react/24/outline";
import DefaultLogoImage from "../../assets/default_logo.png";
import { renderToPlainText } from "common";
import tw from "tailwind-styled-components";

export default function NavbarCart(props: {
  cart: Project[];
  roundUrlPath: string;
}) {
  const menuRef = useRef(null);
  const [open, setOpen] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);

  const projectCount = props.cart.length;

  const toggleMenu = () => setOpen(!open);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    listenForOutsideClicks({ listening, setListening, menuRef, setOpen })
  );

  return (
    <div
      data-testid="navbar-cart"
      className="relative flex-row"
      onClick={toggleMenu}
      ref={menuRef}
    >
      <QuickViewIcon count={projectCount} />

      {open && Boolean(projectCount) && (
        <QuickViewSummary roundUrlPath={props.roundUrlPath} cart={props.cart} />
      )}
    </div>
  );
}

function QuickViewIcon(props: { count: number }) {
  return (
    <>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 7H3L3.4 9M5 17H15L19 9H3.4M5 17L3.4 9M5 17L2.70711 19.2929C2.07714 19.9229 2.52331 21 3.41421 21H15M15 21C13.8954 21 13 21.8954 13 23C13 24.1046 13.8954 25 15 25C16.1046 25 17 24.1046 17 23C17 21.8954 16.1046 21 15 21ZM7 23C7 24.1046 6.10457 25 5 25C3.89543 25 3 24.1046 3 23C3 21.8954 3.89543 21 5 21C6.10457 21 7 21.8954 7 23Z"
          stroke="#0E0333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {props.count ? <circle cx="18" cy="8" r="8" fill="#6F3FF5" /> : null}
      </svg>

      {Boolean(props.count) && (
        <div
          className="inline-flex absolute top-0.5 pt-0.5 pl-1 left-2 justify-center items-center w-4 h-3 text-white"
          style={{
            fontSize: 7.5,
          }}
        >
          {props.count}
        </div>
      )}
    </>
  );
}

function QuickViewSummary(props: { roundUrlPath: string; cart: Project[] }) {
  const navigate = useNavigate();

  const QuickViewSummary = tw.div`
    mt-5
    w-[400px]
    flex
    flex-col
    absolute
    right-0
    rounded
    bg-white
    shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]
    p-4
    z-20
  `;

  return (
    <QuickViewSummary
      data-testid="quick-view-summary"
      className="quick-view-summary"
    >
      <p className="flex border-b mb-4 pb-2 gap-2 text-sm">
        <CheckIcon className="w-4" />
        Projects added to your cart
      </p>

      <div className="max-h-[200px] overflow-y-scroll">
        {props.cart &&
          props.cart.map((project) => (
            <ProjectQuickView
              roundUrlPath={props.roundUrlPath}
              project={project}
            />
          ))}
      </div>

      <Button
        type="button"
        $variant="solid"
        className="px-3 bg-violet-400 text-white border-0 text-xs mb-2"
        onClick={() => navigate(`${props.roundUrlPath}/cart`)}
      >
        View my cart ({props.cart.length})
      </Button>
    </QuickViewSummary>
  );
}

function ProjectQuickView(props: { roundUrlPath: string; project: Project }) {
  return (
    <div className="flex mb-4" data-testid="project-quick-view">
      <div className="relative overflow-hidden bg-no-repeat bg-cover  min-w-[64px] w-16 max-h-[64px] mt-auto mb-auto">
        <img
          className="inline-block"
          src={
            props.project.projectMetadata.logoImg
              ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.project.projectMetadata.logoImg}`
              : DefaultLogoImage
          }
          alt={"Project Logo"}
        />
        <div className="min-w-[64px] w-16 max-h-[64px] absolute top-0 right-0 bottom-0 left-0 overflow-hidden bg-fixed opacity-0 hover:opacity-70 transition duration-300 ease-in-out bg-gray-500 justify-center flex items-center">
          <Link
            to={`${props.roundUrlPath}/${props.project.grantApplicationId}`}
          >
            <EyeIcon
              className="fill-gray-200 w-6 h-6 cursor-pointer"
              data-testid={`${props.project.projectRegistryId}-project-link`}
            />
          </Link>
        </div>
      </div>

      <div className="pl-4 mt-1">
        <Link to={`${props.roundUrlPath}/${props.project.grantApplicationId}`}>
          <p className="font-semibold mb-2 text-sm text-ellipsis line-clamp-1">
            {props.project.projectMetadata.title}
          </p>
        </Link>
        <p className="text-xs text-ellipsis line-clamp-3">
          {renderToPlainText(
            props.project.projectMetadata.description
          ).substring(0, 20)}
        </p>
      </div>
    </div>
  );
}
