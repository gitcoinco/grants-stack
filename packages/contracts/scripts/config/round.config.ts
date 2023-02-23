// Update this file any time a new contract has been deployed
type RoundParams = {
  roundImplementationContract: string;
  roundFactoryContract: string;
  roundContract ?: string;
  newProtocolFeePercentage?: number;
  newProtocolTreasury?: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  "mainnet": {
    roundFactoryContract: '0xE2Bf906f7d10F059cE65769F53fe50D8E0cC7cBe',
    roundImplementationContract: '0x3e7f72DFeDF6ba1BcBFE77A94a752C529Bb4429E',
    roundContract: '0x3172a6cCE26529e7DD2B533e7c3622a0b544f349',
  },
  "goerli": {
    roundFactoryContract: '0x5770b7a57BD252FC4bB28c9a70C9572aE6400E48',
    roundImplementationContract: '0x0bbB660E151F4A404AA5692445465291A95400C4',
    roundContract: '0x9aCcdbf1805088145a168f2D496e9F775222a82C',
    newProtocolFeePercentage : 1,
    newProtocolTreasury: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  },
  "optimism-mainnet": {
    roundFactoryContract: '0x0f0A4961274A578443089D06AfB9d1fC231A5a4D',
    roundImplementationContract: '0xCd5AbD09ee34BA604795F7f69413caf20ee0Ab60',
    roundContract: '0xe0883e6F3113FC4C2d9539b9eE1659E59531e312'
  },
  "fantom-mainnet": {
    roundFactoryContract: '0x3e7f72DFeDF6ba1BcBFE77A94a752C529Bb4429E',
    roundImplementationContract: '0xC2B0d8dAdB88100d8509534BB8B5778d1901037d',
    roundContract: '0x866485759ABC95c36FA77B216A5AdbA4275a14aB'
  },
  "fantom-testnet": {
    roundFactoryContract: '0x00F51ba2Cd201F4bFac0090F450de0992a838762',
    roundImplementationContract: '0x635E69237C0428861EC8c5D8083e9616022c89Ea',
    roundContract: '0xd3E45c78050a6472e28b9E02AA8596F7868e63d6'
  }
};