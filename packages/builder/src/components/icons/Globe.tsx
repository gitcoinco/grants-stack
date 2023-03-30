function Globe({ color }: { color: string }) {
  // rendered as a component so that colors can be dynamically added
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      viewBox="0 0 38 38"
    >
      <path
        // eslint-disable-next-line max-len
        d="M1.10986 17H5C7.20914 17 9 18.7909 9 21V23C9 25.2091 10.7909 27 13 27C15.2091 27 17 28.7909 17 31V36.8901M11 2.87104V6C11 8.76142 13.2386 11 16 11H17C19.2091 11 21 12.7909 21 15C21 17.2091 22.7909 19 25 19C27.2091 19 29 17.2091 29 15C29 12.7909 30.7909 11 33 11L35.129 11M25 35.9758V31C25 28.7909 26.7909 27 29 27H35.129M37 19C37 28.9411 28.9411 37 19 37C9.05887 37 1 28.9411 1 19C1 9.05887 9.05887 1 19 1C28.9411 1 37 9.05887 37 19Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Globe;
