import { TransakConfig, Transak } from "@transak/transak-sdk";
import Pusher from "pusher-js";
import abi from "../../common/src/allo/abis/allo-v2/Allo";
import { parseUnits } from "ethers/lib/utils.js";
import {
  Allo,
  DonationVotingMerkleDistributionStrategy,
} from "@allo-team/allo-v2-sdk";
import { arbitrum } from "wagmi/chains";

// ARBITRUM TRANSAK CONTRACT ADDRESSES
const ARB_SEPOLIA_TRASAK_ADDRESS = "0x489F56e3144FF03A887305839bBCD20FF767d3d1";
const ARB_TRANSAK_ADDRESS = "0x4A598B7eC77b1562AD0dF7dc64a162695cE4c78A";

// SOURCE TOKEN ADDRESSES
const ARB_SEPOLIA_USDC_ADDRESS = "0X";
const ARB_USDC_ADDRESS = "0X";

const ALLO_ADDRESS = "0x";

const allo = new Allo({
  chain: arbitrum.id,
  address: ALLO_ADDRESS,
});

const strategy = new DonationVotingMerkleDistributionStrategy({
  chain: arbitrum.id,
  poolId: BigInt(0),
});

// Public channel for all transak order events
const pusher = new Pusher("1d9ffac87de599c61283", { cluster: "ap2" });

export const settings = (callData: string): TransakConfig => {
  return {
    apiKey: process.env.TRANSAK_API_KEY as string,
    environment: Transak.ENVIRONMENTS.STAGING,
    themeColor: "000000",
    defaultPaymentMethod: "credit_debit_card",
    /**
     * Wallet address of the user
     * The blockchain address of the user's wallet that the receipt token will be sent to.
     *
     */
    walletAddress: "0x", // User's wallet address
    exchangeScreenTitle: "Deposit Funds",
    disableWalletAddressForm: true,
    smartContractAddress: "0x", // Smart contract address of the token you want to deposit
    estimatedGasLimit: 70_000,
    calldata: callData, // Calldata for the transaction
    /**
     * Details of the token smart contract that is going to be used
     * in the transaction we are supplying WBTC to Aave protocol
     * So we are sending WBTC as sourceTokenData along with the amount
     * we want to deposit on users behalf
     */
    sourceTokenData: [
      {
        sourceTokenCode: "USDC",
        sourceTokenAmount: 0, // Amount user wants to deposit
      },
    ],
    /**
     * Details of the crypto user is going to receive after they do the transaction.
     */
    cryptoCurrencyData: [],
    network: "arbitrum",
    isTransakOne: true,
  };
};

export const getDonationCallData = (
  poolId: bigint,
  token: any,
  allocation: Allocation
) => {
  strategy.setPoolId(poolId);

  // construct the calldata
  const encodedAllocation = strategy.getEncodedAllocation(allocation);
  const transak = new Transak(settings(encodedAllocation));
  transak.init();
  const subscribeToWebsockets = (orderId: string) => {
    const channel = pusher.subscribe(orderId);

    //receive updates of all the events
    pusher.bind_global((eventId: any, orderData: any) => {
      console.log(`websocket Event: ${eventId} with order data:`, orderData);
    });

    //receive updates of a specific event
    channel.bind("ORDER_COMPLETED", (orderData: any) => {
      console.log("ORDER COMPLETED websocket event", orderData);
    });

    channel.bind("ORDER_FAILED", async (orderData: any) => {
      console.log("ORDER FAILED websocket event", orderData);
    });
  };

  Transak.on(Transak.EVENTS.TRANSAK_ORDER_CREATED, (orderData: any) => {
    console.log("callback transak order created", orderData);
    const eventData = orderData;

    const orderId = eventData.status?.id;

    if (!orderId) {
      return;
    }

    subscribeToWebsockets(orderId);
  });
};

// note: this is from sdk types
export type Allocation = {
  recipientId: `0x${string}`;
  permitType: PermitType;
  permit2Data: Permit2Data;
};

export type TokenPermissions = {
  token: `0x${string}`;
  amount: bigint;
};

export type PermitTransferFrom = {
  permitted: TokenPermissions;
  nonce: bigint;
  deadline: bigint;
};

export type Permit2Data = {
  permit: PermitTransferFrom;
  signature: `0x${string}`;
};

export enum PermitType {
  Permit,
  PermitDAI,
  Permit2,
}
