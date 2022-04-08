<script setup>
// import { LSPFactory } from "@lukso/lsp-factory.js"
</script>

<script>
export default {

  data() {
    return {

    }
  },

  // Executed when the login page is rendered
  async mounted() {
    
    
  },

  methods: {
    async onSubmit(e) {

      const LSP4MetaData = {
        "LSP4Metadata": {
            "description": "",
            "links": [],
            "icon": [  // multiple sizes of the same icon
                {
                    "width": Number,
                    "height": Number,
                    "hashFunction": 'keccak256(bytes)',
                    "hash": 'string', // bytes32 hex string of the image hash
                    "url": 'string'
                },
            ],
            "images": [],
            "assets": []  
        }
      }


      // const factory = new LSPFactory('https://rpc.l14.lukso.network', {
      //   name: 'name', 
      //   symbol: 'NAM',
      //   controllerAddress: '',
      //   isNFT: false, // Token decimals set to 18
        // isNFT - boolean: Specify if the contract represent a fungible or a non-fungible token.
        // digitalAssetMetadata?: LSP4MetadataBeforeUpload | string: LSP4 Digital Asset Metadata to be attached to the smart contract. Can be an encoded hex string, ipfs url or metadata object as defined in LSP4DigitalAssetMetadata.uploadMetadata.
        // creators? string[]: Array of ERC725Account addresses that defines the creators of the digital asset. Used to set the LSP4Creators[] key on the contract.
      // })

      // console.log(e.srcElement.input#)

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
        <input type="text" placeholder="My Token" id="name" required>

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

</template>