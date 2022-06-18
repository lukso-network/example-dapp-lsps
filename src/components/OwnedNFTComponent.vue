<script setup>
import { onMounted, ref, defineProps } from 'vue';

import ERC725js from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import { IPFS_GATEWAY_BASE_URL } from '../constants';

import SendModalComponent from './SendModalComponent.vue';

const props = defineProps({
  address: String,
  tokenId: String,
});

const LSP4TokenName = ref('');
const LSP4TokenSymbol = ref('');
const LSP4Metadata = ref();
const iconUrl = ref('');

const showModal = ref(false);

const LSP8MetadataJSONSchema = {
  name: 'LSP8MetadataJSON:<bytes32>',
  key: '0x9a26b4060ae7f7d5e3cd0000<bytes32>',
  keyType: 'Mapping',
  valueType: 'bytes',
  valueContent: 'JSONURL',
};

onMounted(async () => {
  const options = {
    ipfsGateway: IPFS_GATEWAY_BASE_URL,
  };

  // FETCH Metadata with erc725js
  const erc725Asset = new ERC725js([...LSP4DigitalAssetSchema, LSP8MetadataJSONSchema], props.address, window.web3.currentProvider, options);

  // console.log(props.tokenId);
  const LSP4DigitalAsset = await erc725Asset.fetchData([
    'LSP4TokenName',
    'LSP4TokenSymbol',
    {
      keyName: 'LSP8MetadataJSON:<bytes32>',
      dynamicKeyParts: props.tokenId,
    },
    'LSP4Metadata',
  ]);

  LSP4TokenName.value = LSP4DigitalAsset[0].value;
  LSP4TokenSymbol.value = LSP4DigitalAsset[1].value;
  LSP4Metadata.value = LSP4DigitalAsset[2].value;
  try {
    iconUrl.value = LSP4DigitalAsset[2].value.LSP4Metadata.icon[0].url.replace('ipfs://', IPFS_GATEWAY_BASE_URL);
  } catch (error) {
    iconUrl.value = LSP4DigitalAsset[3].value.LSP4Metadata.icon[0].url.replace('ipfs://', IPFS_GATEWAY_BASE_URL);
  }
});
</script>

<template>
  <div class="asset-wrapper">
    <div class="preview-card" @click="showModal = !showModal">
      <div class="image" :style="{ backgroundImage: `url(${iconUrl})` }"></div>

      <div class="infos">{{ LSP4TokenName }} ({{ LSP4TokenSymbol }})</div>
    </div>
    <button class="button" @click="showModal = !showModal">Send</button>
    <SendModalComponent :token-id="tokenId" :is-lsp7="false" :is-lsp8="true" v-if="showModal" :asset-address="props.address" :asset-name="LSP4TokenName" @close="showModal = false" />
  </div>
</template>
