export default function Hamburger({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 3H20V5H0V3ZM0 9H20V11H0V9ZM0 15H20V17H0V15Z" fill={color} />
    </svg>
  );
}
