<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import ERC725js from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json';

import { BLOCKCHAIN_EXPLORER_BASE_URL } from '../constants';
import { addLuksoL14Testnet, addLuksoL16Testnet, isLuksoNetwork } from '../../network';

const route = useRoute();

const LSP4TokenName = ref('');
const LSP4TokenSymbol = ref('');
const mintAmount = ref(0);
const txHash = ref('');
const error = ref('');
const isLoading = ref(false);
const forceParameter = ref(false);
const isMinterEOA = ref(false);
const isWrongNetwork = ref(false);

async function onSubmit() {
  // Check network
  try {
    isWrongNetwork.value = await isLuksoNetwork();
    if (isWrongNetwork.value) {
      return;
    }
  } catch (err) {
    console.warn(err);
    error.value = err.message;
    return;
  }

  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  let minterBytecode = await web3.eth.getCode(account);

  if (mintAmount.value === 0) {
    return;
  }
  // If recipient is EOA, force is mandatory
  else if (minterBytecode === '0x' && forceParameter.value === false) {
    isMinterEOA.value = true;
    return;
  }

  isMinterEOA.value = false;
  console.log(`Minting ${mintAmount.value} new tokens.`);

  // https://docs.lukso.tech/standards/smart-contracts/lsp7-digital-asset
  const lsp7DigitalAssetContract = new window.web3.eth.Contract(LSP7DigitalAsset.abi, route.params.address);

  try {
    isLoading.value = true;

    const to = account;
    const amount = web3.utils.toWei(mintAmount.value.toString());
    const force = forceParameter.value; // When set to TRUE, to may be any address; when set to FALSE to must be a contract that supports LSP1 UniversalReceiver and not revert.
    const data = '0x';

    const receipt = await lsp7DigitalAssetContract.methods.mint(to, amount, force, data).send({ from: account });
    isLoading.value = false;
    txHash.value = receipt.transactionHash;

    // Check if account is EOA
    let bytecode = await web3.eth.getCode(account);
    // If account is EOA, add minted item to localStorage
    if (bytecode === '0x') {
      let LSP5ReceivedAssets = JSON.parse(localStorage.getItem('receivedAssets'));

      // Is not featured in localStorage already
      if (LSP5ReceivedAssets.value.indexOf(route.params.address) === -1) {
        // add new asset and write them back to localStorage
        LSP5ReceivedAssets.value.push(route.params.address);
        localStorage.setItem('receivedAssets', JSON.stringify(LSP5ReceivedAssets));
      }
    }
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
        <p class="warning" v-if="isMinterEOA">Your address is an EOA, please allow transfer to EOA.</p>
        <p v-if="isWrongNetwork" class="warning">
          Please switch your network to LUKSO <a style="cursor: pointer" @click="addLuksoL14Testnet()">L14</a> or <a style="cursor: pointer" @click="addLuksoL16Testnet()">L16 </a>to mint this asset.
        </p>
        <label for="amount">Amount</label>
        <input type="number" v-model="mintAmount" placeholder="1" id="amount" required />
        <div>
          <span
            title="Tokens and NFTs can only be sent to Universal Profiles or smart contracts that implement a Universal Receiver by default. To sent it to an EOA, you need to use the force parameter."
          >
            <input style="position: absolute; margin: 5px 0px 0px 0px" type="checkbox" v-model="forceParameter" id="force" value="false" />
            <label style="margin-left: 20px" for="force">Allow transfer to EOA</label>
          </span>
        </div>
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
