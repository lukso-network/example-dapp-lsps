export const IPFS_GATEWAY_BASE_URL = 'https://2eff.lukso.dev/ipfs/'; // TODO: the gateway should be without /ipfs/
export const IPFS_GATEWAY_API_BASE_URL = 'https://api.2eff.lukso.dev:443';

export const BLOCKCHAIN_EXPLORER_BASE_URL = 'https://blockscout.com/lukso/l14';

// https://docs.lukso.tech/standards/smart-contracts/interface-ids
export const INTERFACE_IDS = {
  LSP7DigitalAsset: '0xe33f65c3',
  LSP8IdentifiableDigitalAsset: '0x49399145',
};

export const COMMON_ABIS = {
  supportsInterface: {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
};
