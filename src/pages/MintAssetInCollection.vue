<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import ERC725js from '@erc725/erc725.js';
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json';

import { BLOCKCHAIN_EXPLORER_BASE_URL, IPFS_GATEWAY_API_BASE_URL } from '../constants';
import { LSP4DigitalAssetMetadata } from '@lukso/lsp-factory.js';

const route = useRoute();

const LSP4TokenName = ref('');
const LSP4TokenSymbol = ref('');

const description = ref('');
const tokenId = ref(''); // Should be bytes32

const mintEvents = ref([]);
const error = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);

async function onSubmit() {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  isLoading.value = true;
  isSuccess.value = false;
  error.value = '';
  mintEvents.value = [];

  // https://docs.lukso.tech/standards/smart-contracts/lsp8-identifiable-digital-asset
  const lsp8IdentifiableDigitalAssetContract = new window.web3.eth.Contract(LSP8Mintable.abi, route.params.address);

  const to = account;
  const force = true; // When set to TRUE, to may be any address; when set to FALSE to must be a contract that supports LSP1 UniversalReceiver and not revert.
  const data = '0x';

  try {
    const receipt = await lsp8IdentifiableDigitalAssetContract.methods.mint(to, tokenId.value, force, data).send({ from: account });
    mintEvents.value.push({ stepName: '✅ Mint the NFT on the LSP8 smart contract', functionName: 'mint', receipt });
  } catch (err) {
    error.value = err.message;
    isLoading.value = false;
    return;
  }

  // Create and upload JSON metadata:
  // https://docs.lukso.tech/tools/lsp-factoryjs/classes/lsp4-digital-asset-metadata#uploadmetadata
  const metadata = await LSP4DigitalAssetMetadata.uploadMetadata(
    {
      description: description.value,
      // TODO: add icon
    },
    {
      ipfsGateway: IPFS_GATEWAY_API_BASE_URL,
    }
  );

  mintEvents.value.push({ stepName: '✅ Generate and upload the LSP4DigitalAssetMetadata JSON to IPFS' });

  // We minted the NFT, let's add its metadata in the LSP8 smart contract key/value store
  const erc725js = new ERC725js(
    [
      {
        name: 'LSP8MetadataJSON:<bytes32>',
        key: '0x9a26b4060ae7f7d5e3cd0000<bytes32>',
        keyType: 'Mapping',
        valueType: 'bytes',
        valueContent: 'JSONURL',
      },
    ],
    route.params.address,
    window.web3.currentProvider
  );

  const encodedErc725Data = erc725js.encodeData({
    keyName: 'LSP8MetadataJSON:<bytes32>',
    dynamicKeyParts: tokenId.value,
    value: {
      json: metadata.json,
      url: metadata.url,
    },
  });

  // SEND transaction
  try {
    const receipt = await lsp8IdentifiableDigitalAssetContract.methods.setData(encodedErc725Data.keys, encodedErc725Data.values).send({ from: account });
    mintEvents.value.push({ stepName: '✅ Update the ERC725Y key/value (LSP8MetadataJSON:<bytes32>)', functionName: 'setData', receipt });
  } catch (err) {
    isLoading.value = false;
    error.value = err;
    return;
  }

  // Check if account is EOA
  let bytecode = await web3.eth.getCode(account);

  // If account is EOA, add minted item to localStorage
  if (bytecode === '0x') {
    let LSP5ReceivedAssets = JSON.parse(localStorage.getItem("receivedAssets"));
    LSP5ReceivedAssets.value.push(route.params.address);
    localStorage.setItem("receivedAssets", JSON.stringify(LSP5ReceivedAssets));
  }

  isLoading.value = false;
  isSuccess.value = true;

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
    <h2>Mint a NFT in {{ LSP4TokenName }} ({{ LSP4TokenSymbol }}) collection</h2>

    <form v-if="!isLoading && mintEvents.length === 0" @submit.prevent="onSubmit" class="left">
      <fieldset>
        <label for="tokenId">Token ID (bytes32)</label>
        <textarea placeholder="0x" v-model="tokenId" id="tokenId" required></textarea>

        <label for="description">Description</label>
        <textarea placeholder="The Token that will change the world..." v-model="description" id="description" required></textarea>

        <!-- <label for="icon">Token Icon</label>
        <input type="file" id="icon" accept="image/*" required /> -->

        <br />
        <br />

        <input class="button-primary" type="submit" value="Mint NFT" />
      </fieldset>
    </form>
  </div>

  <div v-for="(event, index) in mintEvents" :key="index" style="padding-top: 60px">
    <h4>{{ event.stepName }}</h4>
    <span v-if="event.receipt">
      Function called: {{ event.functionName }}()<br />
      Transaction hash: <a :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${event.receipt.transactionHash}`" target="_blank">{{ event.receipt.transactionHash }}</a>
    </span>
  </div>

  <p v-if="isLoading">Loading...</p>

  <div v-if="isSuccess" style="padding-top: 60px">
    <h4>🎉 Successful mint !</h4>
  </div>
</template>
