import { ProjectBanner } from "../ProjectBanner";
import { render, screen } from "@testing-library/react";
import { generateIpfsCid } from "../../../test-utils";

describe("<ProjectBanner>", () => {
  it("should render banner image if provided", function () {
    const bannerImgCid = generateIpfsCid();

    render(<ProjectBanner bannerImgCid={bannerImgCid} />);
    const img = screen.getByRole("img", {
      name: /project banner/i,
    }) as HTMLImageElement;

    expect(img.src).toContain(bannerImgCid);
  });

  it("should render fallback banner if that field is undefined", function () {
    render(<ProjectBanner bannerImgCid={null} />);

    const img = screen.getByRole("img", {
      name: /project banner/i,
    }) as HTMLImageElement;

    expect(img.src).toContain("default_banner.jpg");
  });
});
