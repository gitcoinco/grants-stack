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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display Copy to clipboard when not clicked ", () => {
    renderWrapped(<CopyToClipboardButton textToCopy={textToCopy} />);

    expect(screen.getByText("Round Application")).toBeInTheDocument();
  });

  it("should display Copied to clipboard when clicked", () => {
    renderWrapped(<CopyToClipboardButton textToCopy={textToCopy} />);
    const copyButton = screen.getByRole("button");
    fireEvent.click(copyButton);

    expect(screen.getByText("Link Copied")).toBeInTheDocument();
  });

  /*TODO: a better way to do this:
  *    const clipboard = { writeText: vi.fn() }
    Object.assign(navigator, { clipboard })
    renderWithContext(<CopyToClipboardButton textToCopy={'foobar'} />);
    const copyButton = screen.getByRole("button");
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText()).toHaveBeenCalledWith('foobar');
  * */
  it("should copy value to clipboard when clicked", () => {
    renderWrapped(<CopyToClipboardButton textToCopy={textToCopy} />);
    const copyButton = screen.getByRole("button");
    fireEvent.click(copyButton);

    expect(navigator.clipboard.readText()).toEqual(textToCopy);
  });
});
