
import { fireEvent, screen } from "@testing-library/react"
import { renderWrapped } from "../../../test-utils"
import CopyToClipboardButton from "../CopyToClipboardButton"

const textToCopy = "CLICK ME!"

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
    readText: () => textToCopy
  },
});

describe("<CopyToClipboardButton />", () => {
  const textToCopy = "CLICK ME!"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should display the CopyToClipboardButton with default text ", () => {
    renderWrapped(<CopyToClipboardButton textToCopy={textToCopy} />)

    expect(screen.getByText("Copy to clipboard")).toBeInTheDocument()
  })

  it("should display the CopyToClipboardButton with custom text ", () => {
    renderWrapped(<CopyToClipboardButton textToCopy={textToCopy} clipboardText={textToCopy} />)

    expect(screen.getByText(textToCopy)).toBeInTheDocument()
  })

  it("should copy value to clipboard when ", () => {
    renderWrapped(<CopyToClipboardButton textToCopy={textToCopy} />)
    const copyButton = screen.getByRole("button");
    fireEvent.click(copyButton)

    expect(navigator.clipboard.readText()).toEqual(textToCopy);
  })

})