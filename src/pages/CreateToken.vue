<script setup>
import { LSPFactory } from "@lukso/lsp-factory.js"
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json"; // TODO change to LSP0ERC725Account

// TODO remove
import ERC725js from "@erc725/erc725.js"
import LSP4DigitalAssetMetaDataSchema from "@erc725/erc725.js/schemas/LSP4DigitalAsset.json"
import LSP3UniversalProfileMetaDataSchema from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json"
</script>

<script>
export default {

  data() {
    return {
      deploying: false,
      deployEvents: [],
      error: false
    }
  },

  // Executed when the login page is rendered
  async mounted() {


const accounts = await web3.eth.getAccounts()


    const newAsset = '0x64B5F0647227Fe99cC310FA633be5F946A623474'

// ADD creations to UP
          // const options = {
          //   ipfsGateway: 'https://2eff.lukso.dev/ipfs/' // todo the gateway should be without /ipfs/
          // }

          // // TODO fix  with new erc725.js
          // const profile = new ERC725js(LSP3UniversalProfileMetaDataSchema, accounts[0], window.web3.currentProvider, options)
          // // const asset = new ERC725js(LSP4DigitalAssetMetaDataSchema, contractAddress, window.web3.currentProvider, options)
          // // console.log(await asset.fetchData('LSP4Metadata'))

          // // GET the current issued assets
          // const LSP3IssuedAssets = await profile.getData('LSP3IssuedAssets[]')

          // // add new asset
          // LSP3IssuedAssets.push(newAsset)
          // console.log(LSP3IssuedAssets)

          // const newData = profile.encodeData({ // TODO change to ERC725js
          //   'LSP3IssuedAssets[]': LSP3IssuedAssets,
          //   // 'LSP3IssuedAssetsMap:<address>': {
          //     //   dynamicKeyParts: newAsset,
          //   //   value: web3.utils.leftPad(LSP3IssuedAssets.length - 1, 16) + 'e33f65c3' // index position of asset + LSP7 interface ID: 0xe33f65c3
          //   // }
          // });

          // // add asset map key and value
          // // construct asset map key
          // const LSP3IssuedAssetsMapKey = ERC725js.encodeKeyName('LSP3IssuedAssetsMap:' + newAsset.replace('0x', '')); // TODO use instance
          // newData.keys.push(LSP3IssuedAssetsMapKey)
          // newData.values.push(web3.utils.leftPad(LSP3IssuedAssets.length - 1, 16) + 'e33f65c3') // index position of asset + LSP7 interface ID: 0xe33f65c3

          // console.log(newData)
    
  },

  methods: {
    async onSubmit(e) {

      // GET the address from the browser extension
      const accounts = await web3.eth.getAccounts()

      // CONSTRUCT the meta data
      const LSP4MetaData = {
        // "LSP4Metadata": { // TODO uncomment
            "description": e.target.querySelector('textarea#description').value,
            "icon": e.target.querySelector('input#icon').files[0],
            "links": [],
            "images": [],
            "assets": []
        // }
      }

      // INITIATE the LSPFactory
      const factory = new LSPFactory(web3.currentProvider)



      // show the deploying status...
      this.deployEvents = []
      this.deploying = true

      
      // DEPLOY the LSP7 token
      factory.LSP7DigitalAsset.deploy({
        name: e.target.querySelector('input#name').value, 
        symbol: e.target.querySelector('input#symbol').value,
        controllerAddress: accounts[0], // the "issuer" of the asset, that is allowed to change meta data
        creators: [accounts[0]], // Array of ERC725Account addresses that define the creators of the digital asset.
        isNFT: false, // Token decimals set to 18
        digitalAssetMetadata: LSP4MetaData
      },{
        deployReactive: true,
        ipfsGateway: 'https://api.2eff.lukso.dev:443'
      }).subscribe({
        next: (deploymentEvent) => {
          console.log(deploymentEvent)

          if(deploymentEvent.status === "COMPLETE")
            this.deployEvents.push(deploymentEvent);
        },
        error: (error) => {
          this.deploying = false
          this.error = error.message
        },
        complete: async (contracts) => {
          this.deploying = false

          if(!contracts || !contracts.LSP7DigitalAsset) {
            this.error = 'Error deploying LSP7DigitalAsset'
            return
          }
         
          // ADD creations to UP
           const options = {
            ipfsGateway: 'https://2eff.lukso.dev/ipfs/' // todo the gateway should be without /ipfs/
          }

          // TODO fix  with new erc725.js
          const profile = new ERC725js(LSP3UniversalProfileMetaDataSchema, accounts[0], window.web3.currentProvider, options)
          const asset = new ERC725js(LSP4DigitalAssetMetaDataSchema, contracts.LSP7DigitalAsset.address, window.web3.currentProvider, options)
          console.log('ASSET', await asset.fetchData('LSP4Metadata'))

          // GET the current issued assets
          const LSP3IssuedAssets = await profile.getData('LSP3IssuedAssets[]') //TODO change to LSP12IssuedAssets[]

          // add new asset
          LSP3IssuedAssets.push(newAsset)
          console.log(LSP3IssuedAssets)

          const newData = profile.encodeData({ // TODO change to ERC725js
            'LSP3IssuedAssets[]': LSP3IssuedAssets,
            // 'LSP3IssuedAssetsMap:<address>': {
              //   dynamicKeyParts: newAsset,
            //   value: web3.utils.leftPad(LSP3IssuedAssets.length - 1, 16) + 'e33f65c3' // index position of asset + LSP7 interface ID: 0xe33f65c3
            // }
          });

          // add asset map key and value
          // construct asset map key
          const LSP3IssuedAssetsMapKey = ERC725js.encodeKeyName('LSP3IssuedAssetsMap:' + newAsset.replace('0x', '')); // TODO use instance; change to LSP12IssuedAssetsMap
          newData.keys.push(LSP3IssuedAssetsMapKey)
          newData.values.push(web3.utils.leftPad(LSP3IssuedAssets.length - 1, 16) + 'e33f65c3') // index position of asset + LSP7 interface ID: 0xe33f65c3

          console.log(newData)

          // send transaction
          const profileContract = new window.web3.eth.Contract(LSP0ERC725Account.abi, accounts[0])
          await profileContract.methods.setData(newData.keys, newData.values).send({from: accounts[0]})

        },
      });
    }
  }

}
</script>


<template>

  <a class="back" href="/">&lt;</a>

  <p class="warning" v-if="error">
    {{error}}
  </p>

  <div class="center">
    <h2>
      Create your own ERC20-like Token
      based on <a href="https://docs.lukso.tech/standards/nft-2.0/LSP7-Digital-Asset" target="_blank">LSP7</a>
    </h2>

    <br><br>

    <form v-if="!deploying" @submit.prevent="onSubmit" class="left">
      <fieldset>
        <label for="name">Name</label>
        <input type="text" placeholder="MyToken" id="name" required>

        <label for="symbol">Token Symbol</label>
        <input type="text" placeholder="MYTOK" id="symbol" required>

        <label for="description">Description</label>
        <textarea placeholder="The Token that will change the world..." id="description" required></textarea>

        <label for="icon">Token Icon</label>
        <input type="file" id="icon" accept="image/*" required>

        <br><br>
        
        <input class="button-primary" type="submit" value="Create Token">
      </fieldset>
    </form>

  </div>

  <div class="events">
    <span v-if="deploying">
        Deploying Smart Contracts..<br>
        <strong>Please confirm all transactions in your browser extension, and wait until they are added to the Blockchain.</strong>
    </span>

    <br><br>

    <div v-for="(event, index) in deployEvents" :key="index">
      <span v-if="event.type === 'PROXY_DEPLOYMENT'">
        Contract deployed: {{ event.contractName }} ({{ event.type }}): <a :href="'https://blockscout.com/lukso/l14/address/' + event.contractAddress" target="_blank">{{event.contractAddress}}</a><br>
        Transaction hash: <a :href="'https://blockscout.com/lukso/l14/tx/' + event.receipt.transactionHash" target="_blank">{{event.receipt.transactionHash}}</a>
      </span>
      <br>
      <span v-if="event.type === 'TRANSACTION'">
        Function called: {{ event.functionName }}()<br>
        Transaction hash: <a :href="'https://blockscout.com/lukso/l14/tx/' + event.receipt.transactionHash" target="_blank">{{event.receipt.transactionHash}}</a>
      </span>
    </div>
  </div>

</template>