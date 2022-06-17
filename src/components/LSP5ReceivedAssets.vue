<script setup>
import { onMounted, ref } from 'vue';

import ERC725js from '@erc725/erc725.js';
import LSP5ReceivedAssetsSchema from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json';

import OwnedCreationComponent from './OwnedCreationComponent.vue';

const receivedAssets = ref([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  const accounts = await web3.eth.getAccounts();

  // If using the LUKSO browser extension, the Universal Profile smart contract address will be injected here.
  const universalProfileAddress = accounts[0]; // set the first address as the Universal Profile address

  const erc725LSP12IssuedAssets = new ERC725js(LSP5ReceivedAssetsSchema, universalProfileAddress, window.web3.currentProvider);
  // GET the received assets directly from the Universal Profile smart contract
  try {
    // https://docs.lukso.tech/standards/universal-profile/lsp5-received-assets
    const LSP5ReceivedAssets = await erc725LSP12IssuedAssets.getData('LSP5ReceivedAssets[]');
    receivedAssets.value = LSP5ReceivedAssets.value;
  } catch (err) {
    console.warn(err);
  }

  isLoading.value = false;
});
</script>

<template>
  <div>
    <h2>Portfolio</h2>
    <img v-if="receivedAssets.length === 0 && !isLoading" class="emptyLogo" src="../assets/empty-up.png" alt="No creation" />
    <div v-if="receivedAssets.length === 0 && !isLoading">No items</div>
    <div v-else class="grid">
      <OwnedCreationComponent :address="receivedAsset" v-for="receivedAsset in receivedAssets" :key="receivedAsset" />
    </div>
  </div>
</template>
