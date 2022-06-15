<script setup>
import { onMounted, ref } from 'vue';

import ERC725js from '@erc725/erc725.js';
import LSP5ReceivedAssetsSchema from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json';

import OwnedCreationComponent from './OwnedCreationComponent.vue';

const receivedAssets = ref([]);

onMounted(async () => {
  const accounts = await web3.eth.getAccounts();

  // If using the LUKSO browser extension, the Universal Profile smart contract address will be injected here.
  const universalProfileAddress = accounts[0]; // set the first address as the Universal Profile address

  const erc725LSP12IssuedAssets = new ERC725js(LSP5ReceivedAssetsSchema, universalProfileAddress, window.web3.currentProvider);
  // GET the received assets directly from the Universal Profile smart contract
  try {
    // https://docs.lukso.tech/standards/universal-profile/lsp5-received-assets
    const LSP5ReceivedAssets = (await erc725LSP12IssuedAssets.getData('LSP5ReceivedAssets[]')).value;
    receivedAssets.value = LSP5ReceivedAssets;
  } catch (err) {
    // address is an EOA?
    // Using MetaMask?
  }
});
</script>

<template>
  <div class="container">
    <h2>Portfolio</h2>
    <div class="row">
      <div class="column" v-for="receivedAsset in receivedAssets" :key="receivedAsset">
        <OwnedCreationComponent :address="receivedAsset" />
      </div>
    </div>
  </div>
</template>
