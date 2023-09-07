import { render, screen } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router-dom";
import ApplyNowSection from "../ApplyNowSection";
import { makeRoundOverviewData } from "../../../test-utils";

const mockRounds = [
  makeRoundOverviewData(),
  makeRoundOverviewData(),
  makeRoundOverviewData(),
];

describe("<ApplyNowSection />", () => {
  test("renders skeletons when isLoading is true", () => {
    render(
      <Router>
        <ApplyNowSection isLoading={true} />
      </Router>
    );

    const skeletons = screen.getAllByRole("progressbar"); // assuming Skeleton doesn't have any specific roles
    expect(skeletons).toHaveLength(3);
  });

  test("renders RoundCard components when there are rounds and isLoading is false", () => {
    render(
      <Router>
        <ApplyNowSection isLoading={false} roundOverview={mockRounds} />
      </Router>
    );

    const roundCards = screen.getAllByTestId("round-card"); // assuming RoundCard has a data-testid="round-card"
    expect(roundCards).toHaveLength(mockRounds.length);
  });

  test("renders NoRounds component when there are no rounds and isLoading is false", () => {
    render(
      <Router>
        <ApplyNowSection isLoading={false} roundOverview={[]} />
      </Router>
    );

    const noRounds = screen.getByText(/No rounds/); // assuming NoRounds has a data-testid="no-rounds"
    expect(noRounds).toBeInTheDocument();
  });

  test('shows "View All" link only if there are rounds', () => {
    render(
      <Router>
        <ApplyNowSection isLoading={false} roundOverview={mockRounds} />
      </Router>
    );

    const viewAllLink = screen.getByText(/View All/i);
    expect(viewAllLink).toBeInTheDocument();
  });

  test('does not show "View All" link if there are no rounds', () => {
    render(
      <Router>
        <ApplyNowSection isLoading={false} roundOverview={[]} />
      </Router>
    );

    const viewAllLink = screen.queryByText(/View All/i);
    expect(viewAllLink).not.toBeInTheDocument();
  });
});
