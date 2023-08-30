import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import CartNotification, { ProjectView } from "../CartNotification";
import { makeApprovedProjectData } from "../../../test-utils";
import { beforeEach, vi } from "vitest"; // Adjust the path accordingly
import DefaultLogoImage from "../../../assets/default_logo.png";

describe("<CartNotification />", () => {
  const mockProject = makeApprovedProjectData();
  let mockOpen = vi.fn();
  beforeEach(() => {
    mockOpen = vi.fn();
    global.open = mockOpen;
  });
  it("renders when showCartNotification is true", () => {
    render(
      <CartNotification
        showCartNotification={true}
        setShowCartNotification={() => {}}
        currentProjectAddedToCart={mockProject}
      />
    );
    expect(screen.getByText("Project added to your cart")).toBeInTheDocument();
  });

  it("does not render when showCartNotification is false", () => {
    render(
      <CartNotification
        showCartNotification={false}
        setShowCartNotification={() => {}}
        currentProjectAddedToCart={mockProject}
      />
    );
    expect(screen.queryByTestId("project-quick-view")).not.toBeInTheDocument();
  });

  it("calls setShowCartNotification when close button is clicked", () => {
    const mockSetShow = vi.fn();
    render(
      <CartNotification
        showCartNotification={true}
        setShowCartNotification={mockSetShow}
        currentProjectAddedToCart={mockProject}
      />
    );

    fireEvent.click(screen.getByText("Close"));
    expect(mockSetShow).toHaveBeenCalledWith(false);
  });

  it('opens cart in a new tab when "View my cart" button is clicked', () => {
    render(
      <CartNotification
        showCartNotification={true}
        setShowCartNotification={() => {}}
        currentProjectAddedToCart={mockProject}
      />
    );

    fireEvent.click(screen.getByText("View my cart"));
    expect(mockOpen).toHaveBeenCalledWith("#/cart", "_blank");
  });
});

describe("<ProjectView />", () => {
  const mockProject = makeApprovedProjectData();

  it("renders the correct project title", () => {
    render(<ProjectView project={mockProject} />);
    expect(
      screen.getByText(mockProject.projectMetadata.title)
    ).toBeInTheDocument();
  });

  it("renders the default logo image when logoImg is not provided", () => {
    const modifiedMock = { ...mockProject };
    modifiedMock.projectMetadata.logoImg = undefined;

    render(<ProjectView project={modifiedMock} />);
    expect(screen.getByAltText("Project Logo")).toHaveAttribute(
      "src",
      DefaultLogoImage
    );
  });

  it("correctly computes the logo image URL when logoImg is provided", () => {
    const expectedUrl = `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/sampleLogoPath`;
    const modifiedMock = { ...mockProject };
    modifiedMock.projectMetadata.logoImg = "sampleLogoPath";

    const { getByAltText } = render(<ProjectView project={mockProject} />);
    expect(getByAltText("Project Logo")).toHaveAttribute("src", expectedUrl);
  });
});
