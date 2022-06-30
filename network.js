import { BLOCK_EXPLORER_URLS, CHAIN_IDS, RPC_URLS } from './src/constants';

export async function addLuksoL16Testnet() {
  try {
    // Open request to add custom network
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: CHAIN_IDS.L16_HEX,
          chainName: 'LUKSO L16',
          nativeCurrency: {
            name: 'LUKSO',
            symbol: 'LYXt',
            decimals: 18,
          },
          rpcUrls: [RPC_URLS.L16],
          blockExplorerUrls: [BLOCK_EXPLORER_URLS.L16],
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
}

export async function addLuksoL14Testnet() {
  try {
    // Open request to add custom network
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: CHAIN_IDS.L14_HEX,
          chainName: 'LUKSO L14',
          nativeCurrency: {
            name: 'LUKSO',
            symbol: 'LYXt',
            decimals: 18,
          },
          rpcUrls: [RPC_URLS.L14],
          blockExplorerUrls: [BLOCK_EXPLORER_URLS.L14],
        },
      ],
    });
  } catch (err) {
    // User denied access
    console.error(err);
  }
}

export async function isLuksoNetwork() {
  try {
    let chainId = await web3.eth.getChainId();
    if (chainId !== CHAIN_IDS.L14 && chainId !== CHAIN_IDS.L16) {
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
  }
}
