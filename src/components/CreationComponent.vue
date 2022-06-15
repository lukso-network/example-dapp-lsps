<script>
import { onMounted, ref } from 'vue';

import ERC725js from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';

import { IPFS_GATEWAY_BASE_URL } from '../constants';

export default {
  props: {
    address: String,
  },

  setup(props) {
    const LSP4TokenName = ref('');
    const LSP4TokenSymbol = ref('');
    const iconUrl = ref('');
    const LSP4Metadata = ref();
    const totalSupply = ref();

    onMounted(async () => {
      const options = {
        ipfsGateway: IPFS_GATEWAY_BASE_URL,
      };

      // FETCH Metadata with erc725js
      const erc725Asset = new ERC725js(LSP4DigitalAssetSchema, props.address, window.web3.currentProvider, options);

      const LSP4DigitalAsset = await erc725Asset.fetchData(['LSP4TokenName', 'LSP4TokenSymbol', 'LSP4Metadata']);
      LSP4TokenName.value = LSP4DigitalAsset[0].value;
      LSP4TokenSymbol.value = LSP4DigitalAsset[1].value;
      LSP4Metadata.value = LSP4DigitalAsset[2].value;

      console.log('LSP4Metadata', LSP4DigitalAsset[2].value);
      iconUrl.value = LSP4DigitalAsset[2].value.LSP4Metadata.icon[0].url.replace('ipfs://', IPFS_GATEWAY_BASE_URL);

      // READ supply with web3js
      const lsp4DigitalAssetContract = new window.web3.eth.Contract(LSP7DigitalAsset.abi, props.address);
      totalSupply.value = await lsp4DigitalAssetContract.methods.totalSupply().call();
    });
    return { LSP4TokenName, LSP4TokenSymbol, LSP4Metadata, totalSupply, iconUrl };
  },
};
</script>

<template>
  <div>
    <div class="preview-card" @click="$router.push(`/asset/${address}`)">
      <div class="image" :style="{ backgroundImage: `url(${iconUrl})` }">
        <small class="supply">
          {{ totalSupply }}
        </small>
      </div>

      <div class="infos">{{ LSP4TokenName }} ({{ LSP4TokenSymbol }})</div>
    </div>
    <button class="button" @click="$router.push(`/asset/${address}`)">Mint</button>
  </div>
</template>
