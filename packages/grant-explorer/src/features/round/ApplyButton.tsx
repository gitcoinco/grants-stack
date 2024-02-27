import { Button } from "common/src/styles";

export default function ApplyButton(props: { applicationURL: string }) {
  const { applicationURL } = props;

  return (
    <Button
      type="button"
      onClick={() => window.open(applicationURL, "_blank")}
      className="mt-2 basis-full items-center justify-center shadow-sm text-sm rounded md:h-12"
      data-testid="apply-button"
    >
      Apply to Grant Round
    </Button>
  );
}
