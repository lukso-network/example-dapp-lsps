<script setup>
import { onMounted, defineProps, defineEmits, ref } from 'vue';
import { isAddress } from 'web3-utils';

import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json';
import ProfilePreviewComponent from './ProfilePreviewComponent.vue';
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json';
import { addLuksoL14Testnet, addLuksoL16Testnet, isLuksoNetwork } from '../../network';
import { CHAIN_IDS } from '@/constants';

const props = defineProps({
  assetAddress: String,
  assetName: String,
  isLsp7: Boolean,
  isLsp8: Boolean,
  tokenId: String,
});

const emit = defineEmits(['close', 'tokens-sent']);

const assetRecipient = ref('');
const amountToSend = ref(1);
const isLoading = ref(false);
const txHash = ref('');
const forceParameter = ref(false);
const isRecepientEOA = ref(false);
const isL16 = ref(false);
const isL14 = ref(false);
const wasAssetSent = ref(false);
const isWrongNetwork = ref(false);
const error = ref(false);

const handleModalClose = () => {
  emit('close', wasAssetSent.value);
};

onMounted(async () => {
  console.log('assetAddress', props.assetAddress);
  try {
    // Default links that show up
    let chainId = await web3.eth.getChainId();
    if (chainId === CHAIN_IDS.L14) {
      isL14.value = true;
    } else if (chainId === CHAIN_IDS.L16) {
      isL16.value = true;
    }
  } catch (err) {
    console.warn(err);
  }
});

async function sendAsset() {
  // Check network and update previous values

  try {
    let chainId = await web3.eth.getChainId();
    switch (chainId) {
      case CHAIN_IDS.L14:
        isL14.value = true;
        isL16.value = false;
        break;
      case CHAIN_IDS.L16:
        isL16.value = true;
        isL14.value = false;
        break;
      default:
        isWrongNetwork.value = true;
        isL14.value = false;
        isL16.value = false;
        return;
    }
  } catch (err) {
    console.warn(err);
    error.value = err.message;
    return;
  }

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

      if (localStorage.getItem('receivedAssets')) {
        const LSP5ReceivedAssets = JSON.parse(localStorage.getItem('receivedAssets'));

        LSP5ReceivedAssets.value = LSP5ReceivedAssets.value.filter(function (assetAddress) {
          return assetAddress !== props.assetAddress;
        });

        localStorage.setItem('receivedAssets', JSON.stringify(LSP5ReceivedAssets));
      }
    }

    wasAssetSent.value = true;
    emit('tokens-sent');
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
  const amount = web3.utils.toWei(amountToSend.value.toString());
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
  <div class="modal" @click="handleModalClose">
    <div class="modal-content" @click.stop="">
      <div class="container">
        <h2 style="margin-bottom: 0px">Send {{ props.assetName }}</h2>
        <small v-if="isL14"
          ><a :href="`https://blockscout.com/lukso/l14/address/${props.assetAddress}`" target="_blank">{{ props.assetAddress }}</a></small
        >
        <small v-else-if="isL16"
          ><a :href="`https://explorer.execution.l16.lukso.network/address/${props.assetAddress}`" target="_blank">{{ props.assetAddress }}</a></small
        >
        <small v-else>{{ props.assetAddress }}</small>

        <h2></h2>

        <form @submit.prevent="sendAsset">
          <fieldset>
            <label for="assetRecipient">Recipient:</label>
            <input type="text" placeholder="0x..." v-model="assetRecipient" id="assetRecipient" required />

            <div v-if="isLsp7">
              <label for="amount">Amount:</label>
              <input type="number" placeholder="0x..." v-model="amountToSend" id="amount" required />
            </div>

            <div>
              <span
                title="Tokens and NFTs can only be sent to Universal Profiles or smart contracts that implement a Universal Receiver by default. To sent it to an EOA, you need to use the force parameter."
              >
                <p class="warning" v-if="isRecepientEOA">Your recipient is an EOA, please allow transfer to EOA.</p>
              </span>
              <p v-if="isWrongNetwork" class="warning">
                Please switch your network to LUKSO <a style="cursor: pointer" @click="addLuksoL14Testnet()">L14</a> or <a style="cursor: pointer" @click="addLuksoL16Testnet()">L16</a> to send this
                token.
              </p>
              <p class="warning" v-if="error">
                {{ error }}
              </p>
            </div>

            <input style="position: absolute; margin: 5px 0px 0px -100px" type="checkbox" v-model="forceParameter" id="force" value="false" />
            <label style="margin-left: 20px" for="force">Allow transfer to EOA</label>

            <br /><br />

            <input class="button-primary" type="submit" value="Send" />
          </fieldset>
        </form>

        <ProfilePreviewComponent v-if="assetRecipient" :account="assetRecipient" />

        <p v-if="isLoading">Sending asset...</p>
        <p v-if="txHash">
          ✅ Success: Transaction Hash:
          <small v-if="isL14"
            ><a :href="`https://blockscout.com/lukso/l14/tx/${txHash}`" target="_blank">{{ txHash }}</a></small
          >
          <small v-else-if="isL16"
            ><a :href="`https://explorer.execution.l16.lukso.network/tx/${txHash}`" target="_blank">{{ txHash }}</a></small
          >
          <small v-else>{{ txHash }}</small>
          <br /><br />
          <input class="button-primary" type="button" value="Close" @click="handleModalClose" />
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
  margin: -2% auto; /* 0% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 90%;
  max-width: 600px;
  border-radius: 10px;
}
</style>
