/* eslint-disable react/jsx-props-no-spreading */
import { ChakraProvider } from "@chakra-ui/react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { TextInputAddress } from "../inputs";
import * as utils from "../../../utils/utils";

describe("<TextInputAddress />", () => {
  describe("New Valid address", () => {
    test("should return address type", async () => {
      const returnValue = {
        resolved: true,
        isSafe: false,
        isContract: false,
      };

      jest.spyOn(utils, "getAddressType").mockResolvedValue(returnValue);

      const onAddressType = jest.fn();

      const oldProps = {
        label: "Payout Wallet",
        info: "Random Info",
        name: "TextInputAddress",
        onAddressType,
        required: true,
      };

      function Wrapped() {
        const [value, setValue] = useState<string>("");

        return (
          <ChakraProvider>
            <TextInputAddress
              {...oldProps}
              value={value}
              changeHandler={(e) => setValue(e.target.value)}
              feedback={{ type: "none", message: "" }}
            />
          </ChakraProvider>
        );
      }

      render(<Wrapped />);

      const addressInputContainer = screen.getByTestId("address-input-wrapper");
      const addressInputEl = addressInputContainer.querySelector(
        "input"
      ) as Element;

      fireEvent.change(addressInputEl, {
        target: { value: "0xa4ca1b15fe81f57cb2d3f686c7b13309906cd37b" },
      });

      // expect(onAddressType).toBeCalledTimes(1);
      await waitFor(() => expect(onAddressType).toBeCalledWith(returnValue), {
        timeout: 3000,
      });
    });
  });
});
