export function DetailSummary(props: {
  text: string;
  testID: string;
  sm?: boolean;
  violetcolor?: boolean;
}) {
  const { text, testID, sm, violetcolor } = props;
  return (
    <p
      className={`${sm ? "text-sm" : "text-base"} font-normal 
      ${violetcolor ? "text-gitcoin-violet-400" : "text-black"}`}
      data-testid={testID}
    >
      {" "}
      {text}{" "}
    </p>
  );
}
