import { Project } from "data-layer";
import tw from "tailwind-styled-components";

export default function NavbarCart(props: { cart: Project[] }) {
  const projectCount = props.cart.length;

  return (
    <div
      data-testid="navbar-cart"
      className="relative flex-row"
      onClick={() => {
        const url = "#/cart";
        window.open(url, "_blank");
      }}
    >
      <QuickViewIcon count={projectCount} />
    </div>
  );
}

function QuickViewIcon(props: { count: number }) {
  const Badge = tw.div`
      inline-flex
      absolute
      justify-center
      items-center
      h-4
      text-xs
      text-black
      bg-blue-100
      rounded-full
      -top-1.5
      ${() => (props.count >= 100 ? "-right-2.5" : "-right-1.5")}
      ${() => (props.count >= 100 ? "w-6" : "w-4")}
    `;

  return (
    <div className="cursor-pointer">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1H3L3.4 3M5 11H15L19 3H3.4M5 11L3.4 3M5 11L2.70711 13.2929C2.07714 13.9229 2.52331 15 3.41421 15H15M15 15C13.8954 15 13 15.8954 13 17C13 18.1046 13.8954 19 15 19C16.1046 19 17 18.1046 17 17C17 15.8954 16.1046 15 15 15ZM7 17C7 18.1046 6.10457 19 5 19C3.89543 19 3 18.1046 3 17C3 15.8954 3.89543 15 5 15C6.10457 15 7 15.8954 7 17Z"
          stroke="#0E0333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {props.count > 0 && (
        <Badge
          style={{
            fontSize: "0.5rem",
            paddingBottom: 1,
          }}
        >
          {props.count}
        </Badge>
      )}
    </div>
  );
}
