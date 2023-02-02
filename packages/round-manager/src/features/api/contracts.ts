/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import abi from "./abi";
import { Contract } from "./types";
import { ChainId } from "./utils";

/************************/
/* == External ABI == */
/************************/

/* GrantHub's ProjectRegistry */
export const projectRegistryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0x03506eD3f57892C85DB20C36846e9c808aFe9ef4";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "0x984749e408FF0446d8ADaf20E293F2F299396631";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x832c5391dc7931312CbdBc1046669c9c3A4A28d5";
      break;
    }
  }

  return {
    address: address,
    abi: abi.projectRegistry,
  };
};

/************************/
/* ===== Program ====== */
/************************/

/* ProgramFactory  */
export const programFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0xe0281a20dFaCb0E179E6581c33542bC533DdC4AB";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x8918401DD47f1645fF1111D8E513c0404b84d5bB";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "0xe0281a20dFaCb0E179E6581c33542bC533DdC4AB";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "0xbB8f276FE1D52a38FbED8845bCefb9A23138Af92";
      break;
    }
    case ChainId.POLYGON_MUMBAI_CHAIN_ID: {
      address = "0xbd2a2C4f3841f39e1112622596A1AE325B26Fe54";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x548c775c4Bd61d873a445ee4E769cf1A18d60eA9";
      break;
    }
  }

  return {
    address: address,
    abi: abi.programFactory,
  };
};

/* ProgramImplementation */
export const programImplementationContract: Contract = {
  abi: abi.programImplementation,
};

/************************/
/* ====== Round ======= */
/************************/

/* RoundFactory  */
export const roundFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0xE2Bf906f7d10F059cE65769F53fe50D8E0cC7cBe";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x0f0A4961274A578443089D06AfB9d1fC231A5a4D";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "0x3e7f72DFeDF6ba1BcBFE77A94a752C529Bb4429E";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "0x00F51ba2Cd201F4bFac0090F450de0992a838762";
      break;
    }
    case ChainId.POLYGON_MUMBAI_CHAIN_ID: {
      address = "0x36Ca0662fd2af176B10CEA7f2aBa0BB299B6E6c5";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x5770b7a57BD252FC4bB28c9a70C9572aE6400E48";
      break;
    }
  }

  return {
    address: address,
    abi: abi.roundFactory,
  };
};

/* RoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation,
};

/* PayoutStrategy */
export const payoutStrategyContract: Contract = {
  abi: abi.merklePayoutStrategy,
};

/************************/
/* == VotingStrategy == */
/************************/

/* QuadraticFundingVotingStrategy */
export const qfVotingStrategyFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0xE1F4A28299966686c689223Ee7803258Dbde0942";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "0x6038fd0D126CA1D0b2eA8897a06575100f7b16C2";
      break;
    }
    case ChainId.POLYGON_MUMBAI_CHAIN_ID: {
      address = "0xA86837773d8167C20f648Fcc11dB7eA4B95B4b7A";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0xF741F7B6a4cb3B4869B2e2C01aB70A12575B53Ab";
      break;
    }
  }

  return {
    address: address,
    abi: abi.qfVotingStrategyFactory,
  };
};

//TODO network rolouts
/* QuadraticFundingVotingStrategy */
export const qfRelayStrategyFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.POLYGON_MUMBAI_CHAIN_ID: {
      address = "0x0637876724150495d2B4F73A18EA87bCb78E63DB";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "";
      break;
    }
  }

  return {
    address: address,
    abi: abi.qfRelayStrategyFactory,
  };
};

/************************/
/* == PayoutStrategy == */
/************************/

/* MerklePayoutStrategy */
export const merklePayoutStrategy: Contract = {
  abi: abi.merklePayoutStrategy,
  // source: packages/contracts/typechain/factories/MerklePayoutStrategy__factory.ts
  bytecode:
    "0x608060405234801561001057600080fd5b50610c83806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80630b36106b1461005c5780630b67d925146100785780632eb4a7ab14610096578063767f0652146100b4578063e1c7392a146100d3575b600080fd5b61007660048036038101906100719190610653565b6100dd565b005b610080610287565b60405161008d919061083f565b60405180910390f35b61009e6102ab565b6040516100ab919061085a565b60405180910390f35b6100bc6102b1565b6040516100ca929190610905565b60405180910390f35b6100db61034b565b005b600073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141561016d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610164906108a5565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146101fb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101f2906108c5565b60405180910390fd5b600080838381019061020d91906105ff565b915091508160018190555080600260008201518160000155602082015181600101908051906020019061024192919061041c565b509050507fdc7180ca4affc84269428ed20ef950e745126f11691b010c4a7d49458421008f6001546002604051610279929190610875565b60405180910390a150505050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60015481565b60028060000154908060010180546102c890610a5f565b80601f01602080910402602001604051908101604052809291908181526020018280546102f490610a5f565b80156103415780601f1061031657610100808354040283529160200191610341565b820191906000526020600020905b81548152906001019060200180831161032457829003601f168201915b5050505050905082565b600073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146103da576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103d1906108e5565b60405180910390fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b82805461042890610a5f565b90600052602060002090601f01602090048101928261044a5760008555610491565b82601f1061046357805160ff1916838001178555610491565b82800160010185558215610491579182015b82811115610490578251825591602001919060010190610475565b5b50905061049e91906104a2565b5090565b5b808211156104bb5760008160009055506001016104a3565b5090565b60006104d26104cd8461095a565b610935565b9050828152602081018484840111156104ea57600080fd5b6104f5848285610a1d565b509392505050565b60008135905061050c81610c1f565b92915050565b60008083601f84011261052457600080fd5b8235905067ffffffffffffffff81111561053d57600080fd5b60208301915083600182028301111561055557600080fd5b9250929050565b600082601f83011261056d57600080fd5b813561057d8482602086016104bf565b91505092915050565b60006040828403121561059857600080fd5b6105a26040610935565b905060006105b2848285016105ea565b600083015250602082013567ffffffffffffffff8111156105d257600080fd5b6105de8482850161055c565b60208301525092915050565b6000813590506105f981610c36565b92915050565b6000806040838503121561061257600080fd5b6000610620858286016104fd565b925050602083013567ffffffffffffffff81111561063d57600080fd5b61064985828601610586565b9150509250929050565b6000806020838503121561066657600080fd5b600083013567ffffffffffffffff81111561068057600080fd5b61068c85828601610512565b92509250509250929050565b6106a1816109d7565b82525050565b6106b0816109e9565b82525050565b60006106c1826109a0565b6106cb81856109bc565b93506106db818560208601610a2c565b6106e481610b3a565b840191505092915050565b600081546106fc81610a5f565b61070681866109ab565b94506001821660008114610721576001811461073357610766565b60ff1983168652602086019350610766565b61073c8561098b565b60005b8381101561075e5781548189015260018201915060208101905061073f565b808801955050505b50505092915050565b600061077c602c836109bc565b915061078782610b58565b604082019050919050565b600061079f602c836109bc565b91506107aa82610ba7565b604082019050919050565b60006107c2601e836109bc565b91506107cd82610bf6565b602082019050919050565b60006040830160008084015490506107ef81610a91565b6107fc6000870182610821565b5060018401858303602087015261081383826106ef565b925050819250505092915050565b61082a81610a13565b82525050565b61083981610a13565b82525050565b60006020820190506108546000830184610698565b92915050565b600060208201905061086f60008301846106a7565b92915050565b600060408201905061088a60008301856106a7565b818103602083015261089c81846107d8565b90509392505050565b600060208201905081810360008301526108be8161076f565b9050919050565b600060208201905081810360008301526108de81610792565b9050919050565b600060208201905081810360008301526108fe816107b5565b9050919050565b600060408201905061091a6000830185610830565b818103602083015261092c81846106b6565b90509392505050565b600061093f610950565b905061094b8282610aab565b919050565b6000604051905090565b600067ffffffffffffffff82111561097557610974610b0b565b5b61097e82610b3a565b9050602081019050919050565b60008190508160005260206000209050919050565b600081519050919050565b600082825260208201905092915050565b600082825260208201905092915050565b6000819050919050565b60006109e2826109f3565b9050919050565b6000819050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b83811015610a4a578082015181840152602081019050610a2f565b83811115610a59576000848401525b50505050565b60006002820490506001821680610a7757607f821691505b60208210811415610a8b57610a8a610adc565b5b50919050565b6000610aa4610a9f83610b4b565b6109cd565b9050919050565b610ab482610b3a565b810181811067ffffffffffffffff82111715610ad357610ad2610b0b565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b60008160001c9050919050565b7f6572726f723a207061796f757420636f6e7472616374206e6f74206c696e6b6560008201527f6420746f206120726f756e640000000000000000000000000000000000000000602082015250565b7f6572726f723a2063616e20626520696e766f6b6564206f6e6c7920627920726f60008201527f756e6420636f6e74726163740000000000000000000000000000000000000000602082015250565b7f696e69743a20726f756e644164647265737320616c7265616479207365740000600082015250565b610c28816109e9565b8114610c3357600080fd5b50565b610c3f81610a13565b8114610c4a57600080fd5b5056fea26469706673582212207b4f6bceb736c219487ae827960da08107b71c06f114c6d28050bfd261c59c3a64736f6c63430008040033",
};
