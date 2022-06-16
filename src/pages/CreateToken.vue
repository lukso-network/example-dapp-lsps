<script setup>
import LSP0ERC725Account from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json'; // TODO change to LSP0ERC725Account

// https://docs.lukso.tech/tools/lsp-factoryjs/getting-started
import { LSPFactory } from '@lukso/lsp-factory.js';

// https://docs.lukso.tech/tools/erc725js/getting-started
import ERC725js from '@erc725/erc725.js';
import LSP12IssuedAssetsSchema from '@erc725/erc725.js/schemas/LSP12IssuedAssets.json'; // https://docs.lukso.tech/tools/erc725js/schemas

import { IPFS_GATEWAY_BASE_URL, IPFS_GATEWAY_API_BASE_URL, BLOCKCHAIN_EXPLORER_BASE_URL } from '../constants';
</script>

<script>
export default {
  data() {
    return {
      deploying: false,
      deployEvents: [],
      error: false,
    };
  },

  methods: {
    async onSubmit(e) {
      // GET the address from the browser extension
      const accounts = await web3.eth.getAccounts();

      // CONSTRUCT the meta data
      const LSP4MetaData = {
        description: e.target.querySelector('textarea#description').value,
        icon: e.target.querySelector('input#icon').files[0],
        links: [],
        images: [],
        assets: [],
      };

      // INITIATE the LSPFactory
      const factory = new LSPFactory(web3.currentProvider);

      // show the deploying status...
      this.deployEvents = [];
      this.deploying = true;

      // DEPLOY the LSP7 token
      // https://docs.lukso.tech/tools/lsp-factoryjs/classes/lsp7-digital-asset
      const contracts = await factory.LSP7DigitalAsset.deploy(
        {
          name: e.target.querySelector('input#name').value,
          symbol: e.target.querySelector('input#symbol').value,
          controllerAddress: accounts[0], // the "issuer" of the asset, that is allowed to change meta data
          creators: [accounts[0]], // Array of ERC725Account addresses that define the creators of the digital asset.
          isNFT: false, // Token decimals set to 18
          digitalAssetMetadata: LSP4MetaData,
        },
        {
          ipfsGateway: IPFS_GATEWAY_API_BASE_URL,
          onDeployEvents: {
            next: (deploymentEvent) => {
              console.log(deploymentEvent);

              if (deploymentEvent.status === 'COMPLETE') this.deployEvents.push(deploymentEvent);
            },
            error: (error) => {
              this.deploying = false;
              this.error = error.message;
            },
            complete: async (contracts) => {
              this.deploying = false;
            },
          },
        }
      );

      if (!contracts && !contracts.LSP7DigitalAsset) {
        this.error = 'Error deploying LSP7DigitalAsset';
        return;
      }

      const deployedLSP7DigitalAssetContract = contracts.LSP7DigitalAsset;

      // ADD creations to UP
      const options = {
        ipfsGateway: IPFS_GATEWAY_BASE_URL,
      };

      const erc725LSP12IssuedAssets = new ERC725js(LSP12IssuedAssetsSchema, accounts[0], window.web3.currentProvider, options);

      // GET the current issued assets
      const LSP12IssuedAssets = (await erc725LSP12IssuedAssets.getData('LSP12IssuedAssets[]')).value;

      console.log('LSP12IssuedAssets', LSP12IssuedAssets);

      // add new asset
      LSP12IssuedAssets.push(deployedLSP7DigitalAssetContract.address);

      // https://docs.lukso.tech/standards/smart-contracts/interface-ids
      const LSP7InterfaceId = '0xe33f65c3';

      const encodedErc725Data = erc725LSP12IssuedAssets.encodeData([
        {
          keyName: 'LSP12IssuedAssets[]',
          value: LSP12IssuedAssets,
        },
        {
          keyName: 'LSP12IssuedAssetsMap:<address>',
          dynamicKeyParts: deployedLSP7DigitalAssetContract.address,
          value: [LSP7InterfaceId, LSP12IssuedAssets.length - 1], // LSP7 interface ID + index position of asset
        },
      ]);

      // SEND transaction
      const profileContract = new window.web3.eth.Contract(LSP0ERC725Account.abi, accounts[0]);
      await profileContract.methods.setData(encodedErc725Data.keys, encodedErc725Data.values).send({ from: accounts[0] });

      console.log('All set ✅🤙');
    },
  },
};
</script>

<template>
  <a class="back" @click="$router.push('/')">&lt;</a>

  <p class="warning" v-if="error">
    {{ error }}
  </p>

  <div class="center">
    <h2>Create your own ERC20-like Token based on <a href="https://docs.lukso.tech/standards/nft-2.0/LSP7-Digital-Asset" target="_blank">LSP7</a></h2>

    <br />
    <br />

    <form v-if="!deploying" @submit.prevent="onSubmit" class="left">
      <fieldset>
        <label for="name">Name</label>
        <input type="text" placeholder="MyToken" id="name" required />

        <label for="symbol">Token Symbol</label>
        <input type="text" placeholder="MYTOK" id="symbol" required />

        <label for="description">Description</label>
        <textarea placeholder="The Token that will change the world..." id="description" required></textarea>

        <label for="icon">Token Icon</label>
        <input type="file" id="icon" accept="image/*" required />

        <br /><br />

        <input class="button-primary" type="submit" value="Deploy Token" />
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
  </div>
</template>
