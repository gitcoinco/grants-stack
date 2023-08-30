import { fireEvent, screen } from "@testing-library/react";
import { renderWithContext } from "../../../test-utils";
import CopyToClipboardButton from "../CopyToClipboardButton";
import { vi } from "vitest";

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display Copy to clipboard when not clicked ", () => {
    renderWithContext(<CopyToClipboardButton textToCopy={textToCopy} />);

    expect(screen.getByText("Share Profile")).toBeInTheDocument();
  });

  it("should display Copied to clipboard when clicked", () => {
    renderWithContext(<CopyToClipboardButton textToCopy={textToCopy} />);
    const copyButton = screen.getByRole("button");
    fireEvent.click(copyButton);

    expect(screen.getByText("Link Copied")).toBeInTheDocument();
  });

  it("should copy value to clipboard when clicked", () => {
    renderWithContext(<CopyToClipboardButton textToCopy={textToCopy} />);
    const copyButton = screen.getByRole("button");
    fireEvent.click(copyButton);

    expect(navigator.clipboard.readText()).toEqual(textToCopy);
  });
});
