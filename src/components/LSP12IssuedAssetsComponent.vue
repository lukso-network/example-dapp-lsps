<script setup>
import ERC725js from '@erc725/erc725.js';

import LSP12IssuedAssetsSchema from '@erc725/erc725.js/schemas/LSP12IssuedAssets.json';
import { onMounted, ref } from 'vue';

import { IPFS_GATEWAY_BASE_URL } from '../constants';
import CreationComponentVue from './CreationComponent.vue';

const addresses = ref([]);
const isLoading = ref(false);

onMounted(async () => { 
  isLoading.value = true;
  const accounts = await web3.eth.getAccounts();
  // TODO: make sure accounts is not empty!
  const account = accounts[0]; // set the first address as the Universal Profile address

  const options = {
    ipfsGateway: IPFS_GATEWAY_BASE_URL,
  };
  const erc725LSP12IssuedAssets = new ERC725js(LSP12IssuedAssetsSchema, account, window.web3.currentProvider, options);

  try {
    // GET the current issued assets
    const LSP12IssuedAssets = await erc725LSP12IssuedAssets.getData('LSP12IssuedAssets[]');
    addresses.value = LSP12IssuedAssets.value;
  } catch (err) {
    // is EOA, get assets from localStorage
    const LSP12IssuedAssets = JSON.parse(localStorage.getItem('issuedAssets'));
    addresses.value = LSP12IssuedAssets.value;
  }

  isLoading.value = false;
});
</script>

<template>
  <div>
    <h2>Your Creations</h2>
    <img v-if="addresses.length === 0 && !isLoading" class="emptyLogo" src="../assets/empty-up.png" alt="No creation" />
    <div v-if="addresses.length === 0 && !isLoading">No items</div>
    <div v-else class="grid">
      <CreationComponentVue :address="address" v-for="address in addresses" :key="address" />
    </div>
  </div>
</template>
