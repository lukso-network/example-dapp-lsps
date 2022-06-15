<script setup>
import ERC725js from '@erc725/erc725.js';

import LSP12IssuedAssetsSchema from '@erc725/erc725.js/schemas/LSP12IssuedAssets.json';
import { onMounted, ref } from 'vue';

import { IPFS_GATEWAY_BASE_URL } from '../constants';
import CreationComponentVue from './CreationComponent.vue';

const addresses = ref([]);

onMounted(async () => {
  const accounts = await web3.eth.getAccounts();
  // TODO: make sure accounts is not empty!
  const account = accounts[0]; // set the first address as the Universal Profile address
  const options = {
    ipfsGateway: IPFS_GATEWAY_BASE_URL,
  };
  const erc725LSP12IssuedAssets = new ERC725js(LSP12IssuedAssetsSchema, account, window.web3.currentProvider, options);
  // GET the current issued assets
  const LSP12IssuedAssets = (await erc725LSP12IssuedAssets.getData('LSP12IssuedAssets[]')).value;
  addresses.value = LSP12IssuedAssets;
});
</script>

<template>
  <div class="container">
    <h2>Your Creations</h2>
    <div class="row">
      <div class="column" v-for="address in addresses" :key="address">
        <CreationComponentVue :address="address" />
      </div>
    </div>
  </div>
</template>
