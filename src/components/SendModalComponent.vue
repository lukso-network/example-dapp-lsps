<script setup>
import { onMounted, defineProps, defineEmits, ref } from 'vue';
import { isAddress } from 'web3-utils';

import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';
import ProfilePreviewComponent from './ProfilePreviewComponent.vue';
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json';

const props = defineProps({
  assetAddress: String,
  assetName: String,
  isLsp7: Boolean,
  isLsp8: Boolean,
  tokenId: String,
});

defineEmits(['close']);

const assetRecipient = ref('');
const amountToSend = ref(1);
const isLoading = ref(false);
const txHash = ref('');
const forceParameter = ref(false);
const isRecepientEOA = ref(false);

onMounted(async () => {
  console.log('assetAddress', props.assetAddress);
  console.log(props.tokenId);
});

async function sendAsset() {
  let recipientBytecode = await web3.eth.getCode(assetRecipient.value);

  if (!isAddress(assetRecipient.value)) {
    console.warn(`The address: ${assetRecipient.value} is not valid.`);
    return;
  }
  // If recipient is EOA, force is mandatory
  else if (recipientBytecode === '0x' && forceParameter.value === false) {
    isRecepientEOA.value = true;
    return;
  }

  isRecepientEOA.value = false;
  txHash.value = '';
  console.log('Sending asset to:', assetRecipient.value);

  const accounts = await window.web3.eth.getAccounts();
  const account = accounts[0];

  try {
    if (props.isLsp7) {
      await sendLSP7Token(account, props.assetAddress);
    } else if (props.isLsp8) {
      await sendLSP8Token(account, props.assetAddress);
    }
  } catch (err) {
    // It can fail if the recipient is not a UP (cf. force option)
    isLoading.value = false;

    console.warn(err);
  }
}

// https://docs.lukso.tech/standards/smart-contracts/lsp7-digital-asset#transfer
async function sendLSP7Token(accountAddress, assetAddress) {
  const from = accountAddress;
  const to = assetRecipient.value;
  const amount = parseInt(amountToSend.value, 10);
  const force = forceParameter.value; // When set to TRUE, to may be any address; when set to FALSE to must be a contract that supports LSP1 UniversalReceiver and not revert.
  const data = '0x';

  isLoading.value = true;

  const lsp7DigitalAssetContract = new window.web3.eth.Contract(LSP7DigitalAsset.abi, assetAddress);
  const receipt = await lsp7DigitalAssetContract.methods.transfer(from, to, amount, force, data).send({ from: accountAddress });
  isLoading.value = false;

  console.info('Transaction receipt:', receipt);

  txHash.value = receipt.transactionHash;
}

async function sendLSP8Token(accountAddress, assetAddress) {
  const lsp8IdentifiableDigitalAssetContract = new window.web3.eth.Contract(LSP8IdentifiableDigitalAsset.abi, assetAddress);
  const tokenIds = await lsp8IdentifiableDigitalAssetContract.methods.tokenIdsOf(accountAddress).call();

  const from = accountAddress;
  const to = assetRecipient.value;
  const force = true; // When set to TRUE, to may be any address; when set to FALSE to must be a contract that supports LSP1 UniversalReceiver and not revert.
  const data = '0x';

  isLoading.value = true;

  const receipt = await lsp8IdentifiableDigitalAssetContract.methods.transfer(from, to, props.tokenId, force, data).send({ from: accountAddress });

  isLoading.value = false;

  console.info('Transaction receipt:', receipt);

  txHash.value = receipt.transactionHash;
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

            <div v-if="isLsp7">
              <label for="amount">Amount:</label>
              <input type="number" placeholder="0x..." v-model="amountToSend" id="amount" required />
              <div>
                <span
                  title="Tokens and NFTs can only be sent to Universal Profiles or smart contracts that implement a Universal Receiver by default. To sent it to an EOA, you need to use the force parameter."
                >
                  <p class="warning" v-if="isRecepientEOA">Your recipient is an EOA, please allow transfer to EOA.</p>
                  <input style="position: absolute; margin: 5px 0px 0px -100px" type="checkbox" v-model="forceParameter" id="force" value="false" />
                  <label style="margin-left: 20px" for="force">Allow transfer to EOA</label>
                </span>
              </div>
            </div>

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
  margin: 5% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 90%;
  max-width: 600px;
  border-radius: 10px;
}
</style>
