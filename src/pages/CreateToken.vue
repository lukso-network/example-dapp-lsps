<script setup>
import { LSPFactory } from "@lukso/lsp-factory.js"
import LSP0ERC725Account from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json"; // TODO change to LSP0ERC725Account

// TODO remove
import ERC725js from "@erc725/erc725.js"
import LSP4DigitalAssetMetaDataSchema from "@erc725/erc725.js/schemas/LSP4DigitalAsset.json"
import LSP3UniversalProfileMetaDataSchema from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetaData.json"
</script>

<script>
export default {

  data() {
    return {
      deploying: false,
      deployEvents: []
    }
  },

  // Executed when the login page is rendered
  async mounted() {

        
    // return

    // const newAsset = '0x64B5F0647227Fe99cC310FA633be5F946A623474'

    // const options = {
    //   ipfsGateway: 'https://ipfs.lukso.network/ipfs/'
    // }

    // const profile = new ERC725js(LSP3UniversalProfileMetaDataSchema, accounts[0], window.web3.currentProvider, options)
    // const asset = new ERC725js(LSP4DigitalAssetMetaDataSchema, newAsset, window.web3.currentProvider, options)

    // // GET the current issued assets
    // const LSP3IssuedAssets = await profile.getData('LSP3IssuedAssets[]')

    // // add new asset
    // LSP3IssuedAssets.push(newAsset)

    // const newData = profile.encodeData({
    //   'LSP3IssuedAssets[]': LSP3IssuedAssets,
    //   LSP3IssuedAssetsMap: {
    //     dynamicKeyParts: newAsset,
    //     value: web3.utils.leftPad(LSP3IssuedAssets.length - 1, 16) + 'e33f65c3' // index position of asset + LSP7 interface ID: 0xe33f65c3
    //   }
    // });

    // await profileContract.methods.setData(newData.keys, newData.values).send()
    
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
      this.deploying = true
      let contractAddress
      
      // DEPLOY the LSP7 token
      factory.LSP7DigitalAsset.deploy({
        name: e.target.querySelector('input#name').value, 
        symbol: e.target.querySelector('input#symbol').value,
        controllerAddress: accounts[0],
        isNFT: false, // Token decimals set to 18
        digitalAssetMetadata: LSP4MetaData
        // creators? string[]: Array of ERC725Account addresses that defines the creators of the digital asset. Used to set the LSP4Creators[] key on the contract.
      },{
        deployReactive: true
      }).subscribe({
        next: (deploymentEvent) => {
          console.log(deploymentEvent)
          deploymentEvent.receipt = deploymentEvent.receipt || {} // TODO remove

          // TODO remove
          if(deploymentEvent.receipt.contractAddress)
            contractAddress = deploymentEvent.receipt.contractAddress

          // if(deploymentEvent.status === "COMPLETE") // TODO reenable
            this.deployEvents.push(deploymentEvent);
        },
        complete: async (contracts) => {
          this.deploying = false
         

          // ADD creations to UP
          const newAsset = contractAddress

          const options = {
            ipfsGateway: 'https://ipfs.lukso.network/ipfs/'
          }

          // TODO fix  with new erc725.js
          const profileContract = new window.web3.eth.Contract(LSP0ERC725Account.abi, accounts[0])
          const profile = new ERC725js(LSP3UniversalProfileMetaDataSchema, accounts[0], window.web3.currentProvider, options)
          const asset = new ERC725js(LSP4DigitalAssetMetaDataSchema, contractAddress, window.web3.currentProvider, options)

          console.log(await asset.fetchData('LSP4Metadata'))

          // get issued assets
          const LSP3IssuedAssets = await profile.getData('LSP3IssuedAssets[]')
          console.log(LSP3IssuedAssets)
          LSP3IssuedAssets['LSP3IssuedAssets[]'].push(newAsset)

          // construct asset map key
          const LSP3IssuedAssetsMapKey = ERC725js.encodeKeyName('LSP3IssuedAssetsMap:' + newAsset.replace('0x', '')); // TODO use instance


          console.log(LSP3IssuedAssets['LSP3IssuedAssets[]'])
          console.log(LSP3IssuedAssetsMapKey)


          const encodedDataManyKeys = profile.encodeData({
            'LSP3IssuedAssets[]': LSP3IssuedAssets['LSP3IssuedAssets[]'],
            // LSP3IssuedAssetsMap: {
            //   dynamicKeyParts: '0xa3e6F38477D45727F6e6f853Cdb479b0D60c0aC9',
            //   value: '0xa3e6F38477D45727F'
            // }
          });

          // add asset map key and value
          encodedDataManyKeys['LSP3IssuedAssets[]'].value.push({
            key: LSP3IssuedAssetsMapKey,
            value: web3.utils.leftPad(LSP3IssuedAssets['LSP3IssuedAssets[]'].length - 1, 16) + 'e33f65c3' // index position of asset + LSP7 interface ID: 0xe33f65c3
          })

          const dataKeys = []
          const dataValues = []

          encodedDataManyKeys['LSP3IssuedAssets[]'].value.forEach(element => {
            dataKeys.push(element.key)
            dataValues.push(element.value)
          });

          console.log(dataKeys, dataValues)

          // send transaction
          await profileContract.methods.setData(dataKeys, dataValues).send({from: accounts[0]})


        },
      });
    }
  }

}
</script>


<template>

  <a class="back" href="/">&lt;</a>

  <div class="center">
    <h2>
      Create your own ERC20-like Token
      based on <a href="https://docs.lukso.tech/standards/nft-2.0/LSP7-Digital-Asset" target="_blank">LSP7</a>
    </h2>

    <br><br>

    <form @submit.prevent="onSubmit" class="left">
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
      Deploying...
    </span>

    <div v-for="(event, index) in deployEvents" :key="index">
      <span v-if="event.type === 'PROXY'">
        Contract deployed: {{ event.contractName }} ({{ event.type }}): <a :href="'https://blockscout.com/lukso/l14/address/' + event.receipt.contractAddress" target="_blank">{{event.receipt.contractAddress}}</a><br>
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