<script>
import { onMounted, ref } from 'vue';

import ERC725js from '@erc725/erc725.js';

import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import { IPFS_GATEWAY_BASE_URL } from '../constants';

export default {
  props: {
    address: String,
  },

  setup(props) {
    const LSP4TokenName = ref('');
    const LSP4TokenSymbol = ref('');
    const LSP4Metadata = ref();

    onMounted(async () => {
      console.log(props.address);

      const options = {
        ipfsGateway: IPFS_GATEWAY_BASE_URL,
      };
      const erc725Asset = new ERC725js(LSP4DigitalAssetSchema, props.address, window.web3.currentProvider, options);
      // GET the current issued assets
      const LSP4DigitalAsset = await erc725Asset.fetchData(['LSP4TokenName', 'LSP4TokenSymbol', 'LSP4Metadata']);
      LSP4TokenName.value = LSP4DigitalAsset[0].value;
      LSP4TokenSymbol.value = LSP4DigitalAsset[1].value;
      LSP4Metadata.value = LSP4DigitalAsset[2].value;
    });
    return { LSP4TokenName, LSP4TokenSymbol, LSP4Metadata };
  },
};
</script>

<template>
  <div>
    <h3>{{ LSP4TokenName }} ({{ LSP4TokenSymbol }})</h3>
    <a class="button" :href="'/asset/' + address">Mint</a>
    <!-- <pre>
      {{ JSON.stringify(LSP4Metadata) }}
      </pre
    > -->
  </div>
</template>
