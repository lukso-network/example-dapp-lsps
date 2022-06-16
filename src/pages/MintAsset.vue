<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import ERC725js from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json';

import { BLOCKCHAIN_EXPLORER_BASE_URL } from '../constants';

const route = useRoute();

const LSP4TokenName = ref('');
const LSP4TokenSymbol = ref('');
const mintAmount = ref(0);
const txHash = ref('');
const error = ref('');
const isLoading = ref(false);

async function onSubmit() {
  if (mintAmount.value === 0) {
    return;
  }

  console.log(`Minting ${mintAmount.value} new tokens.`);

  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  // https://docs.lukso.tech/standards/smart-contracts/lsp7-digital-asset
  const lsp7DigitalAssetContract = new window.web3.eth.Contract(LSP7DigitalAsset.abi, route.params.address);

  try {
    isLoading.value = true;

    const to = account;
    const amount = parseInt(mintAmount.value, 10);
    const force = false; // When set to TRUE, to may be any address; when set to FALSE to must be a contract that supports LSP1 UniversalReceiver and not revert.
    const data = '0x';

    const receipt = await lsp7DigitalAssetContract.methods.mint(to, amount, force, data).send({ from: account });
    isLoading.value = false;
    txHash.value = receipt.transactionHash;
  } catch (err) {
    error.value = err.message;
  }
}

onMounted(async () => {
  const erc725Asset = new ERC725js(LSP4DigitalAssetSchema, route.params.address, window.web3.currentProvider);

  const LSP4DigitalAsset = await erc725Asset.fetchData(['LSP4TokenName', 'LSP4TokenSymbol']);
  LSP4TokenName.value = LSP4DigitalAsset[0].value;
  LSP4TokenSymbol.value = LSP4DigitalAsset[1].value;
});
</script>

<template>
  <a class="back" @click="$router.push('/')">&lt;</a>

  <p class="warning" v-if="error">
    {{ error }}
  </p>

  <div class="center">
    <h2>Mint some of {{ LSP4TokenName }} ({{ LSP4TokenSymbol }})</h2>

    <form @submit.prevent="onSubmit" class="left">
      <fieldset>
        <label for="amount">Amount</label>
        <input type="number" v-model="mintAmount" placeholder="1" id="amount" required />

        <br /><br />

        <input class="button-primary" type="submit" :value="`Mint ${mintAmount} ${LSP4TokenSymbol}`" />
      </fieldset>
    </form>

    <p v-if="isLoading">Loading...</p>

    <p v-if="txHash">
      ✅ Success: tx hash: <a :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{ txHash }}</a>
    </p>
  </div>
</template>
