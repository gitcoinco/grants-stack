import { ApplicationBanner, ApplicationLogo } from "../BulkApplicationCommon";
import { render, screen } from "@testing-library/react";
import { makeGrantApplicationData } from "../../../test-utils";

describe("BulkApplicationCommon", function () {
  it("should render fallback logo if logo field is undefined on project metadata", function () {
    const applicationWithoutLogoImage = makeGrantApplicationData();
    // @ts-expect-error Test case
    applicationWithoutLogoImage.project.logoImg = undefined;

    render(<ApplicationLogo application={applicationWithoutLogoImage} />);
    const img = screen.getByRole("img", {
      name: /application logo/i,
    }) as HTMLImageElement;

    expect(img.src).toContain("default_logo.png");
  });

  it("should render fallback banner if that field is undefined", function () {
    const applicationWithoutBannerImage = makeGrantApplicationData();
    // @ts-expect-error Test case
    applicationWithoutBannerImage.project.bannerImg = undefined;

    render(<ApplicationBanner application={applicationWithoutBannerImage} />);
    const img = screen.getByRole("img", {
      name: /application banner/i,
    }) as HTMLImageElement;

    expect(img.src).toContain("default_banner.png");
  });
});
