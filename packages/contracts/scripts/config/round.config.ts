// Update this file any time a new contract has been deployed
type RoundParams = {
  roundImplementationContract: string;
  roundFactoryContract: string;
  bulkVotingStrategyContract: string;
  roundContract ?: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  "goerli": {
    roundFactoryContract: '0xFed628443dEbcE553EB6053566dFabE0537348f2',
    roundImplementationContract: '0x0E5df3f2Ff30cc2daDc8d5990488F4e3400C3A37',
    bulkVotingStrategyContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1',
    roundContract: '0xD96222ec011Cded90Be74969d0CFfDf4247FAe1b'
  },
  "optimism-mainnet": {
    roundFactoryContract: '',
    roundImplementationContract: '',
    bulkVotingStrategyContract: '',
    roundContract: ''
  },
  "optimism-kovan": {
    roundFactoryContract: '0x5632fdD467B657AEc800296F1695cf8847A50048',
    roundImplementationContract: '0x24bF2015ad3B99b3fCDe5f752bc4cF9fa5Ea922A',
    bulkVotingStrategyContract: '0x2D39988C462C63b0035c3824fDEE80938cB27d0b',
    roundContract: '0xdd6726a26889929B4129D4889a00834caa3832Fd'
  },
};