<script setup>
import { onMounted, defineProps, defineEmits, ref } from 'vue';
import { isAddress } from 'web3-utils';

import { BLOCKCHAIN_EXPLORER_BASE_URL } from '../constants';

import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';
import ProfilePreviewComponent from './ProfilePreviewComponent.vue';

const props = defineProps({
  assetAddress: String,
  assetName: String,
});

defineEmits(['close']);

const assetRecipient = ref('');
const amountToSend = ref(1);
const isLoading = ref(false);
const txHash = ref('');

onMounted(async () => {
  console.log('assetAddress', props.assetAddress);
});

async function sendAsset() {
  if (!isAddress(assetRecipient.value)) {
    console.warn(`The address: ${assetRecipient.value} is not valid.`);
    return;
  }

  txHash.value = '';
  console.log('Sending asset to:', assetRecipient.value);

  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  // https://docs.lukso.tech/standards/smart-contracts/lsp7-digital-asset
  const lsp7DigitalAssetContract = new window.web3.eth.Contract(LSP7DigitalAsset.abi, props.assetAddress);

  try {
    // https://docs.lukso.tech/standards/smart-contracts/lsp7-digital-asset#transfer
    const from = account;
    const to = assetRecipient.value;
    const amount = parseInt(amountToSend.value, 10);
    const force = false; // When set to TRUE, to may be any address; when set to FALSE to must be a contract that supports LSP1 UniversalReceiver and not revert.
    const data = '0x';

    isLoading.value = true;
    const receipt = await lsp7DigitalAssetContract.methods.transfer(from, to, amount, force, data).send({ from: account });
    isLoading.value = false;

    console.info('Transaction receipt:', receipt);

    txHash.value = receipt.transactionHash;
  } catch (err) {
    // It can fail if the recipient is not a UP (cf. force option)
    isLoading.value = false;

    console.warn(err);
  }
}
</script>

<template>
  <div class="modal" @click="$emit('close')">
    <div class="modal-content" @click.stop="">
      <div class="container">
        <h2>Send {{ props.assetName }}</h2>
        <form @submit.prevent="sendAsset">
          <fieldset>
            <label for="assetRecipient">Recipient:</label>
            <input type="text" placeholder="0x..." v-model="assetRecipient" id="assetRecipient" required />

            <label for="amount">Amount:</label>
            <input type="number" placeholder="0x..." v-model="amountToSend" id="amount" required />

            <br /><br />

            <input class="button-primary" type="submit" value="Send" />
          </fieldset>
        </form>

        <ProfilePreviewComponent v-if="assetRecipient" :account="assetRecipient" />

        <p v-if="isLoading">Sending asset...</p>
        <p v-if="txHash">
          ✅ Success: tx hash: <a :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{ txHash }}</a
          ><br />
          <input class="button-primary" type="button" value="Close" @click="$emit('close')" />
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  padding-top: 100px; /* Location of the box */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
  border-radius: 10px;
}
</style>
