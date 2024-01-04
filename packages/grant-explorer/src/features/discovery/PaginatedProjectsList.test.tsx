import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { PaginatedProjectsList } from "./PaginatedProjectsList"; // Adjust the import path as needed
import { ApplicationSummary } from "data-layer";
import { zeroAddress } from "viem";

vi.mock("common/src/config", async () => {
  return {
    getConfig: () => ({
      ipfs: { baseUrl: "https://example.com/ipfs" },
    }),
  };
});

const applicationsMock: ApplicationSummary[] = [
  {
    roundName: "Round 1",
    applicationRef: "1",
    websiteUrl: "https://example.com",
    payoutWalletAddress: zeroAddress,
    createdAtBlock: 1,
    projectId: "1",
    roundId: zeroAddress,
    chainId: 1,
    roundApplicationId: "1",
    name: "Project Name 1",
    summaryText: "Project Summary 1",
    bannerImageCid: "bannerCid",
    logoImageCid: "logoCid",
    contributorCount: 0,
    contributionsTotalUsd: 0,
  },
  {
    roundName: "Round 2",
    applicationRef: "2",
    websiteUrl: "https://example.com",
    payoutWalletAddress: zeroAddress,
    createdAtBlock: 1,
    projectId: "2",
    roundId: zeroAddress,
    chainId: 1,
    roundApplicationId: "1",
    name: "Project Name 2",
    summaryText: "Project Summary 2",
    bannerImageCid: "bannerCid",
    logoImageCid: "logoCid",
    contributorCount: 0,
    contributionsTotalUsd: 0,
  },
];

const mockLoadNextPage = vi.fn();
const mockAddApplicationToCart = vi.fn();
const mockRemoveApplicationFromCart = vi.fn();
const mockApplicationExistsInCart = vi.fn();

describe("PaginatedProjectsList", () => {
  it("renders list of applications", () => {
    render(
      <PaginatedProjectsList
        applications={applicationsMock}
        isLoading={false}
        isLoadingMore={false}
        hasMorePages={true}
        loadNextPage={mockLoadNextPage}
        onAddApplicationToCart={mockAddApplicationToCart}
        onRemoveApplicationFromCart={mockRemoveApplicationFromCart}
        applicationExistsInCart={mockApplicationExistsInCart}
      />
    );
    expect(screen.getByText("Load more")).toBeInTheDocument();

    expect(screen.getByText("Project Name 1")).toBeInTheDocument();
    expect(screen.getByText("Project Summary 1")).toBeInTheDocument();
    expect(screen.getByText("Project Name 2")).toBeInTheDocument();
    expect(screen.getByText("Project Summary 2")).toBeInTheDocument();
  });

  it("calls loadNextPage when Load more button is clicked", async () => {
    render(
      <PaginatedProjectsList
        applications={applicationsMock}
        isLoading={false}
        isLoadingMore={false}
        hasMorePages={true}
        loadNextPage={mockLoadNextPage}
        onAddApplicationToCart={mockAddApplicationToCart}
        onRemoveApplicationFromCart={mockRemoveApplicationFromCart}
        applicationExistsInCart={mockApplicationExistsInCart}
      />
    );
    fireEvent.click(screen.getByText("Load more"));
    await waitFor(() => expect(mockLoadNextPage).toHaveBeenCalled());
  });
});
