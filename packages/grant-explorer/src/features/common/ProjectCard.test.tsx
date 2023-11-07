import { vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { ProjectCard, ProjectCardSkeleton } from "./ProjectCard";
import { ApplicationSummary } from "grants-stack-data-client/dist/openapi-search-client/models";
import { zeroAddress } from "viem";
import { ChakraProvider } from "@chakra-ui/react";

describe("ProjectCard", () => {
  const mockApplication: ApplicationSummary = {
    applicationRef: "1",
    websiteUrl: "https://example.com",
    payoutWalletAddress: zeroAddress,
    createdAtBlock: 1,
    projectId: "1",
    roundId: zeroAddress,
    chainId: 1,
    roundApplicationId: "1",
    name: "Project Name",
    summaryText: "Project Summary",
    bannerImageCid: "bannerCid",
    logoImageCid: "logoCid",
  };

  vi.stubEnv("REACT_APP_GRANTS_STACK_DATA_CLIENT_BASE_URL", "https:/ipfs.io");

  it("renders correctly with required props", () => {
    const addToCart = vi.fn();
    const removeFromCart = vi.fn();

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
    const addToCart = vi.fn();
    const removeFromCart = vi.fn();

    render(
      <ProjectCard
        application={mockApplication}
        inCart={false}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(addToCart).toHaveBeenCalledWith(mockApplication);
  });

  it("calls removeFromCart when remove button is clicked", () => {
    const addToCart = vi.fn();
    const removeFromCart = vi.fn();

    render(
      <ProjectCard
        application={mockApplication}
        inCart={true}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove from cart" }));
    expect(removeFromCart).toHaveBeenCalledWith(mockApplication);
  });

  it("renders ProjectCardSkeleton correctly", () => {
    render(
      <ChakraProvider>
        <ProjectCardSkeleton />
      </ChakraProvider>
    );
  });
});
