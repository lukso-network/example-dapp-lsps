<script>
import _ from 'underscore';
import ERC725js from '@erc725/erc725.js';
import LSP3UniversalProfileMetaDataSchema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import identicon from 'ethereum-blockies-base64';
import { IPFS_GATEWAY_BASE_URL } from '../constants';

export default {
  data() {
    return {
      profileData: {
        profileImage: {
          url: '',
        },
      },
      error: false,
    };
  },

  // Executed when the profile component is rendered
  // Here we LOAD the Universal Profile data
  async mounted() {
    // GET the UNIVERSAL PROFILE DATA
    const accounts = await web3.eth.getAccounts();

    // TODO: make sure accounts is not empty!
    const account = accounts[0]; // set the first address as the Universal Profile address

    // set the address, wether Universal Profile or EOA (MetaMask)
    this.profileData.address = account;

    // generate identicon
    this.profileData.identicon = identicon(account); // generates a "data:image/png;base64,..."

    // INSTANTIATE erc725.js
    // window.web3 was set in App.vue
    const profile = new ERC725js(LSP3UniversalProfileMetaDataSchema, account, window.web3.currentProvider, {
      ipfsGateway: IPFS_GATEWAY_BASE_URL, // todo the gateway should be without /ipfs/
    });

    let metaData;
    try {
      metaData = await profile.fetchData('LSP3Profile');
    } catch (e) {
      // IF it fails its likely NO Universal Profile, or a simple EOA (MetaMask)

      console.log(e);
      console.warn('You are not logged in with a Universal Profile, your users user experience just degraded by 256%');
      this.profileData.name = false;
      return;
    }

    console.log('metaData', metaData);

    this.profileData = {
      // merge profileData with fetched profile data
      ...this.profileData,
      ...metaData.value.LSP3Profile,
    };

    console.log(this.profileData);

    // GET the right image size for the profile image from the profile images array
    this.profileData.profileImage = _.find(this.profileData.profileImage, (image) => {
      if (image.width >= 200 && image.width <= 500) return image;
    });

    // If there is no image of the preferred size, take the default one
    if (!this.profileData.profileImage && metaData.value.LSP3Profile.profileImage) {
      this.profileData.profileImage = metaData.value.LSP3Profile.profileImage[0];
      // change the IPFS path to a provider of our choice
      this.profileData.profileImage.url = this.profileData.profileImage.url.replace('ipfs://', profile.options.ipfsGateway);
    }

    console.log('profileData:', this.profileData);
  },
};
</script>

<template>
  <div class="center profile">
    <div class="profileImage">
      <div class="identicon" v-bind:style="{ backgroundImage: 'url(' + profileData.identicon + ')' }"></div>
      <div class="image" v-bind:style="{ backgroundImage: 'url(' + profileData.profileImage?.url + ')' }"></div>
    </div>

    <span class="username" v-if="profileData.name"> @{{ profileData.name }} </span>
    <p v-else-if="profileData.name === false" class="warning" id="extension">
      You can use MetaMask with this dApp, but <br />
      we recommend trying it with the <br /><a href="https://docs.lukso.tech/guides/universal-profile/browser-extension/install-browser-extension">Universal Profile Browser Extension</a>.
    </p>
    <p class="description">
      {{ profileData.description }}
    </p>
  </div>
</template>
