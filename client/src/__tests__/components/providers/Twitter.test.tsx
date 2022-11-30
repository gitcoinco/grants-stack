import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import Twitter from "../../../components/providers/Twitter";
import setupStore from "../../../store";
import { renderWrapped, buildVerifiableCredential } from "../../../utils/test_utils";

describe("<Twitter />", () => {
  describe("with account already verified", () => {
    test("should show the verification badge after verifying the vc", async () => {
      const store = setupStore();
      const handle = "my-twitter-handle";
      const vc = buildVerifiableCredential("Twitter", handle);

      renderWrapped(
        <Twitter
          handle={handle}
          verificationComplete={(e) => {}}
          verificationError={(e) => {}}
          canVerify={true}
          vc={vc}
        />,
        store
      );

      expect(screen.getByText("Verified")).toBeInTheDocument();
    });

    test("should not show the badge if the verified account is different from the current one in the form", async () => {
      const store = setupStore();
      const handle = "my-twitter-handle";
      const vc = buildVerifiableCredential("Twitter", handle);

      renderWrapped(
        <Twitter
          handle={"another-twitter-account"}
          verificationComplete={(e) => {}}
          verificationError={(e) => {}}
          canVerify={true}
          vc={vc}
        />,
        store
      );

      expect(screen.queryByText("Verified")).toBeNull();
    });
  });
});
