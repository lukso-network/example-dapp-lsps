export async function addLuksoL16Testnet() {
  try {
    // Open request to add custom network
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0xB0C',
          chainName: 'LUKSO L16',
          nativeCurrency: {
            name: 'LUKSO',
            symbol: 'LYXt',
            decimals: 18,
          },
          rpcUrls: ['https://rpc.l16.lukso.network'],
          blockExplorerUrls: ['https://explorer.execution.l16.lukso.network'],
        },
      ],
    });
  } catch (err) {
    // User denied access
  }
}

export async function addLuksoL14Testnet() {
  try {
    // Open request to add custom network
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x16',
          chainName: 'LUKSO L14',
          nativeCurrency: {
            name: 'LUKSO',
            symbol: 'LYXt',
            decimals: 18,
          },
          rpcUrls: ['https://rpc.l14.lukso.network'],
          blockExplorerUrls: ['https://blockscout.com/lukso/l14'],
        },
      ],
    });
  } catch (err) {
    // User denied access
  }
}
