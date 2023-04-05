import "@testing-library/jest-dom";
import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { createHashHistory } from "history";
import { act } from "react-dom/test-utils";
import setupStore from "../../../store";
import VerificationForm from "../VerificationForm";

const renderWrapped = (ui: React.ReactElement, store = setupStore()): any => {
  const wrapped = (
    <ChakraProvider>
      <Provider store={store}>
        <ReduxRouter store={store} history={createHashHistory()}>
          {ui}
        </ReduxRouter>
      </Provider>
    </ChakraProvider>
  );

  return { store, ...render(wrapped) };
};

describe("<VerificationForm />", () => {
  const setVerifyingMock = jest.fn();

  beforeEach(() => {
    setVerifyingMock.mockClear();
  });

  it("should display Twitter and GitHub inputs with their logos", () => {
    renderWrapped(<VerificationForm setVerifying={setVerifyingMock} />);

    const twitterIcon = screen.getByAltText("Twitter Logo");
    const gitHubIcon = screen.getByAltText("GitHub Logo");

    expect(twitterIcon).toBeInTheDocument();
    expect(gitHubIcon).toBeInTheDocument();

    expect(
      screen.getByLabelText("Project Twitter Account")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Your GitHub Username")).toBeInTheDocument();
    expect(screen.getByLabelText("GitHub Organization")).toBeInTheDocument();
  });

  it("should display validation error messages when the form is invalid", async () => {
    const store = setupStore();
    store.dispatch({
      type: "METADATA_SAVED",
      metadata: {
        title: "title 1",
        description: "description",
        website: "http://example.com",
        bannerImg: "banner-1",
        logoImg: "logo-1",
        projectTwitter: "@twitter-user-1",
        userGithub: "www.github.com/user-github-1",
        projectGithub: "https://github.com/project-github-1",
      },
    });

    renderWrapped(<VerificationForm setVerifying={setVerifyingMock} />, store);

    await act(async () => {
      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);
    });

    await waitFor(() => {
      const errorCountMessage = screen.getByText(
        "There were 3 errors with your form submission"
      );
      const twitterUserErrors = screen.getAllByText(
        "Project Twitter should not include an @ symbol"
      );
      const githubUserErrors = screen.getAllByText(
        "Your GitHub Username should not be a URL"
      );
      const githubProjectErrors = screen.getAllByText(
        "GitHub Organization should not be a URL"
      );

      expect(errorCountMessage).toBeInTheDocument();
      expect(twitterUserErrors).toHaveLength(2);
      expect(githubUserErrors).toHaveLength(2);
      expect(githubProjectErrors).toHaveLength(2);
    });
  });
});
