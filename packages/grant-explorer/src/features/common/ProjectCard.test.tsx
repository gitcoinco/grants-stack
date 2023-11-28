import { vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { ProjectCard, ProjectCardSkeleton } from "./ProjectCard";
import { ApplicationSummary } from "data-layer";
import { zeroAddress } from "viem";
import { ChakraProvider } from "@chakra-ui/react";

vi.mock("common/src/config", async () => {
  return {
    getConfig: () => ({
      ipfs: { baseUrl: "https://example.com/ipfs" },
    }),
  };
});

describe("ProjectCard", () => {
  const mockApplication: ApplicationSummary = {
    roundName: "This is a round name!",
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
    contributorCount: 0,
    contributionsTotalUsd: 0,
  };

  it("renders correctly with required props", () => {
    const addToCart = vi.fn();
    const removeFromCart = vi.fn();

    render(
      <ProjectCard
        application={mockApplication}
        inCart={false}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
      />
    );

    expect(screen.getByText("Project Name")).toBeInTheDocument();
    expect(screen.getByText("Project Summary")).toBeInTheDocument();
    expect(screen.getByText("This is a round name!")).toBeInTheDocument();
  });

  it("calls addToCart when add button is clicked", () => {
    const addToCart = vi.fn();
    const removeFromCart = vi.fn();

    render(
      <ProjectCard
        application={mockApplication}
        inCart={false}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
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
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
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
