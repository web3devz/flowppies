const clickContractAddress = '0x0F55A5F0C04C97221A8e8949021c5B4BCd074146';

const clickContractAbi = [
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "send",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool"
      }
    ],
    stateMutability: "payable",
    type: "function"
  }
] as const;


export const calls = [
  {
    address: clickContractAddress,
    abi: clickContractAbi,
    functionName: 'send',
    args: [
      '0x072Ecc90fA0Ac2292e760a57304A87Ad6c32bc89',  
      BigInt(100000000000000)     
    ],
    value: BigInt(100000000000000) // Must match _amount
  }
];
