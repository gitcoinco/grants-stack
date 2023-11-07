// ProjectCard.test.tsx
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ProjectCard, ProjectCardSkeleton } from "./ProjectCard";
import { ApplicationSummary } from "grants-stack-data-client/dist/openapi-search-client/models";

describe("ProjectCard", () => {
  // Mock data for the ApplicationSummary
  const mockApplication: ApplicationSummary = {
    applicationRef: "1",
    websiteUrl: "https://example.com",
    payoutWalletAddress: "0x1234",
    createdAtBlock: 1,
    projectId: "1",
    roundId: "1",
    chainId: 1,
    roundApplicationId: "1",
    name: "Project Name",
    summaryText: "Project Summary",
    bannerImageCid: "bannerCid",
    logoImageCid: "logoCid",
    // ... other necessary properties
  };

  it("renders correctly with required props", () => {
    const addToCart = jest.fn();
    const removeFromCart = jest.fn();

    render(
      <ProjectCard
        application={mockApplication}
        inCart={false}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
      />
    );

    // Assertions for static elements
    expect(screen.getByText("Project Name")).toBeInTheDocument();
    expect(screen.getByText("Project Summary")).toBeInTheDocument();
    expect(screen.getByText("Round name goes here")).toBeInTheDocument();
    // Add more assertions as needed
  });

  it("calls addToCart when add button is clicked", () => {
    const addToCart = jest.fn();
    const removeFromCart = jest.fn();

    render(
      <ProjectCard
        application={mockApplication}
        inCart={false}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
    expect(addToCart).toHaveBeenCalledWith(mockApplication);
  });

  it("calls removeFromCart when remove button is clicked", () => {
    const addToCart = jest.fn();
    const removeFromCart = jest.fn();

    render(
      <ProjectCard
        application={mockApplication}
        inCart={true}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove from Cart" }));
    expect(removeFromCart).toHaveBeenCalledWith(mockApplication);
  });

  it("renders ProjectCardSkeleton correctly", () => {
    render(<ProjectCardSkeleton />);

    // Just check that something renders for the skeleton
    expect(screen.getByTestId("project-card-skeleton")).toBeInTheDocument();
  });
});
