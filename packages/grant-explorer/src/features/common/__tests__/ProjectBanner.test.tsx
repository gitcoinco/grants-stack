import { ProjectBanner } from "../ProjectBanner"
import { render, screen } from "@testing-library/react"
import { makeApprovedProjectData } from "../../../test-utils"

describe("<ProjectBanner>", () => {
  it("should render banner image if provided", function () {
    const project = makeApprovedProjectData();

    render(<ProjectBanner projectMetadata={project.projectMetadata} />);
    const img = screen.getByRole("img", {
      name: /project banner/i,
    }) as HTMLImageElement;

    expect(img.src).toContain(project.projectMetadata.bannerImg);
  });

  it("should render fallback banner if that field is undefined", function () {
    const projectWithoutBannerImage = makeApprovedProjectData();
    projectWithoutBannerImage.projectMetadata.bannerImg = undefined;

    render(<ProjectBanner projectMetadata={projectWithoutBannerImage.projectMetadata} />);
    const img = screen.getByRole("img", {
      name: /project banner/i,
    }) as HTMLImageElement;

    expect(img.src).toContain("default_banner.png");
  });
})