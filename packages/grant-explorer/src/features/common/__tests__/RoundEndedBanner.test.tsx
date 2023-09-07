import { render, screen } from "@testing-library/react";
import RoundEndedBanner from "../RoundEndedBanner"; // replace with the correct path to your RoundEndedBanner component

describe("<RoundEndedBanner />", () => {
  test("renders the RoundEndedBanner without errors", () => {
    render(<RoundEndedBanner />);

    const message = screen.getByText(
      /This round has ended. Thank you for your support!/i
    );
    expect(message).toBeInTheDocument();
  });

  test("renders the ExclamationCircleIcon", () => {
    render(<RoundEndedBanner />);

    const icon = screen.getByLabelText(/Exclamation icon/i);
    expect(icon).toBeInTheDocument();
  });
});
