<script>
import _ from "underscore"
import ERC725js from "@erc725/erc725.js"
import LSP3UniversalProfileMetaDataSchema from "@erc725/erc725.js/build/main/schemas/LSP3UniversalProfile.json"
import identicon from "ethereum-blockies-base64"


export default {

  data() {
    return {
      profileData: {
        profileImage: {
          url: ''
        }
      },
      error: false
    }
  },

  // Executed when the profile component is rendered
  // Here we LOAD the Universal Profile data
  async mounted() {

    const accounts = await web3.eth.getAccounts() // get the Universal Profile / Meta Mask address(es)
    const account = accounts[0] // set the first address as the Universal Profile address
    
    // set the address, wether Universal Profile or EOA (MetaMask)
    this.profileData.address = account

    // generate identicon
    this.profileData.identicon = identicon(account) // generates a "data:image/png;base64,..."


    // INSTANTIATE erc725.js
    const profile = new ERC725js(LSP3UniversalProfileMetaDataSchema, account, web3.currentProvider)
    
    // GET the UNIVERSAL PROFILE DATA
    try {
      const metaData = await profile.fetchData('LSP3Profile')
      this.profileData = { // merge profileData with fetched profile data
        ...this.profileData,
        ...metaData.LSP3Profile.LSP3Profile // The first "LSP3Profile" is the ERC725 Key, the second "LSP3Profile" the property within the retrieved JSON file
      }
      // TODO remove ^

      // GET the right image size for the profile image from the profile images array
      this.profileData.profileImage = _.find(this.profileData.profileImage, (image) => {
        if(image.width >= 200 && image.width <= 500)
          return image
      })

      // change the IPFS path to a provider of our choice
      if(this.profileData.profileImage.url.substr('ipfs://' != -1))
        this.profileData.profileImage.url = this.profileData.profileImage.url.replace('ipfs://', 'https://ipfs.lukso.network/ipfs/')

    // IF it fails its likely NO Universal Profile, or a simple EOA (MetaMask)
    } catch(e) {
      console.warn('You are not logged in with a Universal Profile, your users user experience just degraded by 256%')
      this.profileData.name = false;
    }

    console.log('profileData:', this.profileData)
  }

}
</script>


<template>

  <div class="profile">
    <div class="profileImage">
      <div class="identicon" v-bind:style="{ backgroundImage: 'url(' + profileData.identicon + ')' }"></div>
      <div class="image" v-bind:style="{ backgroundImage: 'url(' + profileData.profileImage.url + ')' }"></div>
    </div>

    <span class="username" v-if="profileData.name">
      @{{profileData.name}}
    </span>
    <p  v-else-if="profileData.name === false">
      Sorry you only have a simple EOA (MetaMask?)<br>
      Your user experience just degraded by 256%
    </p>

    <p class="description">
      {{profileData.description}}
    </p>
  </div>

</template>