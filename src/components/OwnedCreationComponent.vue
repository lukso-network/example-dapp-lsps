<script setup>
import { onMounted, ref, defineProps } from 'vue';

import ERC725js from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';

import { IPFS_GATEWAY_BASE_URL } from '../constants';

import SendModalComponent from './SendModalComponent.vue';

const props = defineProps({
  address: String,
});

const LSP4TokenName = ref('');
const LSP4TokenSymbol = ref('');
const LSP4Metadata = ref();
const iconUrl = ref('');
const balanceOf = ref();

const showModal = ref(false);

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

  iconUrl.value = LSP4DigitalAsset[2].value.LSP4Metadata.icon[0].url.replace('ipfs://', IPFS_GATEWAY_BASE_URL);

  const accounts = await web3.eth.getAccounts();
  // TODO: make sure accounts is not empty!
  const account = accounts[0]; // set the first address as the Universal Profile address

  // READ supply with web3js
  const lsp4DigitalAssetContract = new window.web3.eth.Contract(LSP7DigitalAsset.abi, props.address);
  balanceOf.value = await lsp4DigitalAssetContract.methods.balanceOf(account).call();
});
</script>

<template>
  <div class="asset-wrapper">
    <div class="preview-card" @click="showModal = !showModal">
      <div class="image" :style="{ backgroundImage: `url(${iconUrl})` }">
        <small class="supply"> Your balance: {{ balanceOf }} </small>
      </div>

      <div class="infos">{{ LSP4TokenName }} ({{ LSP4TokenSymbol }})</div>
    </div>
    <button class="button" style="width: 200px;" @click="showModal = !showModal">Send</button>
    <SendModalComponent v-if="showModal" :asset-address="props.address" :asset-name="LSP4TokenName" @close="showModal = false" />
  </div>
</template>
