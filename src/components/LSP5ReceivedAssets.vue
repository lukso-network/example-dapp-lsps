<script setup>
import { onMounted, ref } from 'vue';

import ERC725js from '@erc725/erc725.js';
import LSP5ReceivedAssetsSchema from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json';
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json';

import OwnedNFTComponent from './OwnedNFTComponent.vue';
import OwnedCreationComponent from './OwnedCreationComponent.vue';

const receivedAssets = ref([]);
const isLoading = ref(false);
const receivedTokens = ref([]);

onMounted(async () => {
  isLoading.value = true;
  const accounts = await window.web3.eth.getAccounts();

  // If using the LUKSO browser extension, the Universal Profile smart contract address will be injected here.
  const universalProfileAddress = accounts[0]; // set the first address as the Universal Profile address

  const erc725LSP12IssuedAssets = new ERC725js(LSP5ReceivedAssetsSchema, universalProfileAddress, window.web3.currentProvider);
  // GET the received assets directly from the Universal Profile smart contract
  try {
    // https://docs.lukso.tech/standards/universal-profile/lsp5-received-assets
    const LSP5ReceivedAssets = await erc725LSP12IssuedAssets.getData('LSP5ReceivedAssets[]');
    receivedAssets.value = LSP5ReceivedAssets.value;
  }
  // is EOA, get assets from localStorage
  catch (err) {
    const LSP5ReceivedAssets = JSON.parse(localStorage.getItem("receivedAssets"));
    receivedAssets.value = LSP5ReceivedAssets.value;
  }

  receivedAssets.value.forEach(async (receivedAsset) => {
    const lsp8IdentifiableDigitalAssetContract = new window.web3.eth.Contract(LSP8IdentifiableDigitalAsset.abi, receivedAsset);
    const [isLSP7, isLSP8] = await Promise.all([
      lsp8IdentifiableDigitalAssetContract.methods.supportsInterface('0xe33f65c3').call(),
      lsp8IdentifiableDigitalAssetContract.methods.supportsInterface('0x49399145').call(),
    ]);

    if (isLSP8) {
      const tokenIds = await lsp8IdentifiableDigitalAssetContract.methods.tokenIdsOf(universalProfileAddress).call();

      tokenIds.forEach((tokenId) => {
        receivedTokens.value.push({
          assetAddress: receivedAsset,
          isLSP7,
          isLSP8,
          tokenId,
        });
      });
    } else {
      receivedTokens.value.push({
        assetAddress: receivedAsset,
        isLSP7,
        isLSP8,
        tokenId: null,
      });
    }
  });

  console.log('receivedTokens', receivedTokens.value);

  isLoading.value = false;
});
</script>

<template>
  <div>
    <h2>Portfolio</h2>
    <img v-if="receivedAssets.length === 0 && !isLoading" class="emptyLogo" src="../assets/empty-up.png" alt="No creation" />
    <div v-if="receivedAssets.length === 0 && !isLoading">No items</div>
    <div v-else class="grid">
      <div v-for="receivedToken in receivedTokens" :key="receivedToken.tokenId">
        <OwnedCreationComponent v-if="receivedToken.isLSP7" :address="receivedToken.assetAddress" />
        <OwnedNFTComponent v-if="receivedToken.isLSP8" :address="receivedToken.assetAddress" :token-id="receivedToken.tokenId" />
      </div>
    </div>
  </div>
</template>
