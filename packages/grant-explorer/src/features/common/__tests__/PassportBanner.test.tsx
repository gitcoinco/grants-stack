import { render, screen } from "@testing-library/react";
import PassportBanner from "../PassportBanner";
import { faker } from "@faker-js/faker";
import { BigNumber, ethers } from "ethers";
const chainId = 5;
const roundId = faker.finance.ethereumAddress();
const userAddress = faker.finance.ethereumAddress();

const mockAccount = {
    address: userAddress,
};

const mockBalance = {
    data: {
        value: BigNumber.from(ethers.utils.parseUnits("10", 18)),
    },
};

const mockSigner = {
    data: {},
};

const mockNetwork = {
    chain: {
        id: 5,
        name: "Goerli",
    },
    chains: [
        {
            id: 10,
            name: "Optimism",
        },
        {
            id: 5,
            name: "Goerli"
        }
    ],
};

const useParamsFn = () => ({
    chainId,
    roundId,
});

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("wagmi", () => ({
    useAccount: () => mockAccount,
    useBalance: () => mockBalance,
    useSigner: () => mockSigner,
    useNetwork: () => mockNetwork,
}));
jest.mock("@rainbow-me/rainbowkit", () => ({
    ConnectButton: jest.fn(),
    ...jest.requireActual("@rainbow-me/rainbowkit"),
}));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: useParamsFn,
}));

describe("PassportBanner", () => {
    describe("renders the correct banner", () => {
        it("not connected banner", () => {
            render(<PassportBanner/>);
            expect(screen.getByTestId("banner-not-connected-body")).toBeInTheDocument();
            expect(screen.getByTestId("banner-connect-button")).toBeInTheDocument();
        });
    });
    // TODO: tests
});

