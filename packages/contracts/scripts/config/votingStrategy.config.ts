// Update this file any time a new QF voting contract has been deployed
type QFVotingParams = {
  factory: string;
  implementation: string;
  contract: string
};

type DeployParams = Record<string, QFVotingParams>;

export const QFVotingParams: DeployParams = {
  "goerli": {
    factory: '0x0b27641d4dE8fb70542aA10b567238F5a3324CE0',
    implementation: '0xAD8869Fd0481a2dbfd3dCD34F64838EeaEe74e03',
    contract: '0x443b5AC8e5bcc7d69e194C0F78C2125708e7d464'
  },
  "optimism-mainnet": {
    factory: '',
    implementation: '',
    contract: ''
  }
};