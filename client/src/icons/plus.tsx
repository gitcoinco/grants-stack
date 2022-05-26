function Plus({ color }: { color: string }) {
  const hex2rgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // return {r, g, b} // return an object
    return [r, g, b];
  };
  const rgbValues = hex2rgb(color);
  const rgb = `rgb(${rgbValues})`;
  console.log({ rgb });

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 6V12M12 12V18M12 12H18M12 12L6 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Plus;
