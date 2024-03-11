declare const erc20ABI: readonly [
  {
    readonly type: "event";
    readonly name: "Approval";
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly name: "owner";
        readonly type: "address";
      },
      {
        readonly indexed: true;
        readonly name: "spender";
        readonly type: "address";
      },
      {
        readonly indexed: false;
        readonly name: "value";
        readonly type: "uint256";
      },
    ];
  },
  {
    readonly type: "event";
    readonly name: "Transfer";
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly name: "from";
        readonly type: "address";
      },
      {
        readonly indexed: true;
        readonly name: "to";
        readonly type: "address";
      },
      {
        readonly indexed: false;
        readonly name: "value";
        readonly type: "uint256";
      },
    ];
  },
  {
    readonly type: "function";
    readonly name: "allowance";
    readonly stateMutability: "view";
    readonly inputs: readonly [
      {
        readonly name: "owner";
        readonly type: "address";
      },
      {
        readonly name: "spender";
        readonly type: "address";
      },
    ];
    readonly outputs: readonly [
      {
        readonly name: "";
        readonly type: "uint256";
      },
    ];
  },
  {
    readonly type: "function";
    readonly name: "approve";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [
      {
        readonly name: "spender";
        readonly type: "address";
      },
      {
        readonly name: "amount";
        readonly type: "uint256";
      },
    ];
    readonly outputs: readonly [
      {
        readonly name: "";
        readonly type: "bool";
      },
    ];
  },
  {
    readonly type: "function";
    readonly name: "balanceOf";
    readonly stateMutability: "view";
    readonly inputs: readonly [
      {
        readonly name: "account";
        readonly type: "address";
      },
    ];
    readonly outputs: readonly [
      {
        readonly name: "";
        readonly type: "uint256";
      },
    ];
  },
  {
    readonly type: "function";
    readonly name: "decimals";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [
      {
        readonly name: "";
        readonly type: "uint8";
      },
    ];
  },
  {
    readonly type: "function";
    readonly name: "name";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [
      {
        readonly name: "";
        readonly type: "string";
      },
    ];
  },
  {
    readonly type: "function";
    readonly name: "symbol";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [
      {
        readonly name: "";
        readonly type: "string";
      },
    ];
  },
  {
    readonly type: "function";
    readonly name: "totalSupply";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [
      {
        readonly name: "";
        readonly type: "uint256";
      },
    ];
  },
  {
    readonly type: "function";
    readonly name: "transfer";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [
      {
        readonly name: "recipient";
        readonly type: "address";
      },
      {
        readonly name: "amount";
        readonly type: "uint256";
      },
    ];
    readonly outputs: readonly [
      {
        readonly name: "";
        readonly type: "bool";
      },
    ];
  },
  {
    readonly type: "function";
    readonly name: "transferFrom";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [
      {
        readonly name: "sender";
        readonly type: "address";
      },
      {
        readonly name: "recipient";
        readonly type: "address";
      },
      {
        readonly name: "amount";
        readonly type: "uint256";
      },
    ];
    readonly outputs: readonly [
      {
        readonly name: "";
        readonly type: "bool";
      },
    ];
  },
];

export default erc20ABI;
