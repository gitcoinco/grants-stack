import { render, screen } from "@testing-library/react";
import NoRounds from "../NoRounds"; // replace with the correct path to your NoRounds component

describe("<NoRounds />", () => {
  test('renders the apply message when type is "apply"', () => {
    render(<NoRounds type="apply" />);

    const message = screen.getByText(
      /No rounds are currently accepting applications./i
    );
    expect(message).toBeInTheDocument();

    const twitterLink = screen.getByText(/Gitcoin Twitter/);
    expect(twitterLink).toHaveAttribute("href", "https://twitter.com/gitcoin");
    expect(twitterLink).toHaveAttribute("target", "_blank");
  });

  test('renders the active message when type is "active"', () => {
    render(<NoRounds type="active" />);

    const message = screen.getByText(/No rounds are currently ongoing./i);
    expect(message).toBeInTheDocument();

    const twitterLink = screen.getByText(/Gitcoin Twitter/);
    expect(twitterLink).toHaveAttribute("href", "https://twitter.com/gitcoin");
    expect(twitterLink).toHaveAttribute("target", "_blank");
  });
});
