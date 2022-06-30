<script setup>
import { ref } from 'vue';

// LUKSO libs
import LSP0ERC725Account from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json'; // TODO change to LSP0ERC725Account

// https://docs.lukso.tech/tools/lsp-factoryjs/getting-started
import { LSPFactory } from '@lukso/lsp-factory.js';

// https://docs.lukso.tech/tools/erc725js/getting-started
import ERC725js from '@erc725/erc725.js';
import LSP12IssuedAssetsSchema from '@erc725/erc725.js/schemas/LSP12IssuedAssets.json'; // https://docs.lukso.tech/tools/erc725js/schemas

import LSP8Mintable_0_5_0 from '../contracts/LSP8Mintable_0_5_0.json';

import { IPFS_GATEWAY_API_BASE_URL, IPFS_GATEWAY_BASE_URL, BLOCKCHAIN_EXPLORER_BASE_URL } from '../constants';
import { addLuksoL14Testnet, addLuksoL16Testnet } from '../../swap-network';

const deploying = ref(false);
const error = ref(false);
const isEOA = ref(false);
const deployEvents = ref([]);
const isSuccess = ref(false);
const wrongNetwork = ref(false);

// Form fields
const tokenName = ref('');
const tokenSymbol = ref('');
const description = ref('');

async function onSubmit(e) {
  // Check network
  let chainID = await web3.eth.getChainId();
  if (chainID !== 22 && chainID !== 2828) {
    wrongNetwork.value = true;
    return;
  }

  // show the deploying status...
  deployEvents.value = [];
  deploying.value = true;

  // GET the address from the browser extension
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  // CONSTRUCT the meta data
  const LSP4MetaData = {
    description: description.value,
    icon: e.target.querySelector('input#icon').files[0],
    links: [],
    images: [],
    assets: [],
  };

  const chainId = await web3.eth.getChainId();

  // l14 relayer uses smart contracts v0.5.0
  const version = chainId === 22 ? LSP8Mintable_0_5_0.bytecode : null;

  // INITIATE the LSPFactory
  const factory = new LSPFactory(web3.currentProvider, { chainId });

  // DEPLOY the LSP8 contract
  // https://docs.lukso.tech/tools/lsp-factoryjs/classes/lsp8-identifiable-digital-asset
  const contracts = await factory.LSP8IdentifiableDigitalAsset.deploy(
    {
      name: tokenName.value,
      symbol: tokenSymbol.value,
      controllerAddress: account, // the "issuer" of the asset, that is allowed to change meta data
      creators: [account], // Array of ERC725Account addresses that define the creators of the digital asset.
      digitalAssetMetadata: LSP4MetaData,
    },
    {
      ipfsGateway: IPFS_GATEWAY_API_BASE_URL,
      LSP8IdentifiableDigitalAsset: {
        version,
      },
      onDeployEvents: {
        next: (deploymentEvent) => {
          console.log(deploymentEvent);

          if (deploymentEvent.status === 'COMPLETE') {
            deployEvents.value.push(deploymentEvent);
          }
        },
        error: (error) => {
          console.error(error);
        },
        complete: (contracts) => {
          console.log('Deployment Complete');
          console.log(contracts.LSP8IdentifiableDigitalAsset);
        },
      },
    }
  );

  if (!contracts && !contracts.LSP8IdentifiableDigitalAsset) {
    error.value = 'Error deploying LSP8IdentifiableDigitalAsset';
    return;
  }

  const deployedLSP8IdentifiableDigitalAssetContract = contracts.LSP8IdentifiableDigitalAsset;

  // ADD creations to UP
  const options = {
    ipfsGateway: IPFS_GATEWAY_BASE_URL,
  };

  const erc725LSP12IssuedAssets = new ERC725js(LSP12IssuedAssetsSchema, accounts[0], window.web3.currentProvider, options);

  // GET the current issued assets
  let LSP12IssuedAssets;
  try {
    LSP12IssuedAssets = await erc725LSP12IssuedAssets.getData('LSP12IssuedAssets[]');
  } catch (err) {
    // Is EOA
    // Load all assets that were stored in local storage
    LSP12IssuedAssets = JSON.parse(localStorage.getItem('issuedAssets'));
  }

  // add new asset
  LSP12IssuedAssets.value.push(deployedLSP8IdentifiableDigitalAssetContract.address);

  // if EOA, also add new asset list to localStorage
  let bytecode = await web3.eth.getCode(accounts[0]);

  if (bytecode === '0x') {
    localStorage.setItem('issuedAssets', JSON.stringify(LSP12IssuedAssets));
  }

  // https://docs.lukso.tech/standards/smart-contracts/interface-ids
  const LSP8InterfaceId = '0x49399145';

  const encodedErc725Data = erc725LSP12IssuedAssets.encodeData([
    {
      keyName: 'LSP12IssuedAssets[]',
      value: LSP12IssuedAssets.value,
    },
    {
      keyName: 'LSP12IssuedAssetsMap:<address>',
      dynamicKeyParts: deployedLSP8IdentifiableDigitalAssetContract.address,
      value: [LSP8InterfaceId, LSP12IssuedAssets.length - 1], // LSP8 interface ID + index position of asset
    },
  ]);

  // SEND transaction
  try {
    const profileContract = new window.web3.eth.Contract(LSP0ERC725Account.abi, accounts[0]);
    const receipt = await profileContract.methods['setData(bytes32[],bytes[])'](encodedErc725Data.keys, encodedErc725Data.values).send({ from: accounts[0] });

    deployEvents.value.push({ receipt, type: 'TRANSACTION', functionName: 'setData' });
  } catch (err) {
    console.warn(err);
    error.value = err.message;
    return;
  }

  // Show EOA local storage warning
  if (bytecode === '0x') {
    isEOA.value = true;
  }

  isSuccess.value = true;
}
</script>

<template>
  <a class="back" @click="$router.push('/')">&lt;</a>

  <p class="warning" v-if="error">
    {{ error }}
  </p>

  <div class="center">
    <h2>Create your own <a href="https://docs.lukso.tech/standards/nft-2.0/LSP8-Identifiable-Digital-Asset" target="_blank">LSP8 Identifiable Digital Asset</a> collection</h2>

    <br />
    <br />

    <div v-if="isEOA" class="warning">The NFT Collection has been deployed and configured correctly, but because of MetaMask, the asset can only be stored in the browser's local storage.</div>
    <p v-if="wrongNetwork" class="warning">
      Please switch your network to LUKSO <a style="cursor: pointer" @click="addLuksoL14Testnet()">L14</a> or <a style="cursor: pointer" @click="addLuksoL16Testnet()">L16 </a>to create this NFT
      collection.
    </p>
    <br />
    <br />

    <form v-if="!deploying" @submit.prevent="onSubmit" class="left">
      <fieldset>
        <label for="name">Name</label>
        <input type="text" placeholder="MyToken" v-model="tokenName" id="name" required />

        <label for="symbol">Token Symbol</label>
        <input type="text" placeholder="MYTOK" id="symbol" v-model="tokenSymbol" required />

        <label for="description">Description</label>
        <textarea placeholder="The Token that will change the world..." id="description" required></textarea>

        <label for="icon">Token Icon</label>
        <input type="file" id="icon" accept="image/*" required />

        <!-- <label for="icon">Token Icon</label>
        <input type="file" id="icon" accept="image/*" required /> -->

        <br /><br />

        <input class="button-primary" type="submit" value="Deploy NFT Collection" />
      </fieldset>
    </form>
  </div>

  <div class="events">
    <span v-if="deploying">
      Deploying Smart Contracts...<br />
      <strong>Please confirm all transactions in your browser extension, and wait until they are added to the Blockchain.</strong>
    </span>

    <br /><br />

    <div v-for="(event, index) in deployEvents" :key="index">
      <span v-if="event.type === 'PROXY_DEPLOYMENT'">
        Contract deployed: {{ event.contractName }} ({{ event.type }}): <a :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/address/${event.contractAddress}`" target="_blank">{{ event.contractAddress }}</a
        ><br />
        Transaction hash: <a :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${event.receipt.transactionHash}`" target="_blank">{{ event.receipt.transactionHash }}</a>
      </span>
      <br />
      <span v-if="event.type === 'TRANSACTION'">
        Function called: {{ event.functionName }}()<br />
        Transaction hash: <a :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${event.receipt.transactionHash}`" target="_blank">{{ event.receipt.transactionHash }}</a>
      </span>
    </div>

    <div v-if="isSuccess" style="padding-top: 60px">
      <h4>🎉 Success !</h4>
    </div>
  </div>
</template>
