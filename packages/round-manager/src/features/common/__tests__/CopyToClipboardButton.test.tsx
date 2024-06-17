import { fireEvent, screen } from "@testing-library/react";
import { renderWrapped } from "../../../test-utils";
import CopyToClipboardButton from "../CopyToClipboardButton";

const textToCopy = "CLICK ME!";

Object.assign(navigator, {
  clipboard: {
    writeText: () => {
      /* do nothing.*/
    },
    readText: () => textToCopy,
  },
});

describe("<CopyToClipboardButton />", () => {
  const textToCopy = "foobar"; // Define the text to be copied

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the clipboard API
    const clipboard = { writeText: jest.fn() };
    Object.assign(navigator, { clipboard });
  });

  it("should display 'Round application' when not clicked", () => {
    renderWrapped(<CopyToClipboardButton textToCopy={textToCopy} />);

    expect(screen.getByText("Round application")).toBeInTheDocument();
  });

  it("should display 'Link Copied' when clicked", () => {
    renderWrapped(<CopyToClipboardButton textToCopy={textToCopy} />);
    const copyButton = screen.getByRole("button");
    fireEvent.click(copyButton);

    expect(screen.getByText("Link Copied")).toBeInTheDocument();
  });

  it("should copy value to clipboard when clicked", () => {
    renderWrapped(<CopyToClipboardButton textToCopy={textToCopy} />);
    const copyButton = screen.getByRole("button");
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(textToCopy);
  });
});
