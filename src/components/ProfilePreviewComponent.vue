<script>
import _ from 'underscore';
import ERC725js from '@erc725/erc725.js';
import LSP3UniversalProfileMetaDataSchema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import identicon from 'ethereum-blockies-base64';
import { IPFS_GATEWAY_BASE_URL } from '../constants';
import { isAddress } from 'web3-utils';

export default {
  data() {
    return {
      profileData: {
        profileImage: {
          url: '',
        },
      },
      address: '',
      error: false,
    };
  },
  props: {
    account: String,
  },
  watch: {
    account: async function updateProfile() {
      this.updateProfile(this.account);
    },
  },

  // Executed when the profile component is rendered
  // Here we LOAD the recipient Universal Profile data
  async mounted() {
    this.updateProfile(this.account);
  },

  methods: {
    async updateProfile(account) {
      if (!isAddress(account)) {
        this.profileData.description = '';
        this.address = 'Invalid Address';
        this.profileData.profileImage.url = false;
        this.profileData.identicon = false;
        this.profileData.name = false;

        return;
      }

      this.address = account;

      // generate identicon
      this.profileData.identicon = identicon(account); // generates a "data:image/png;base64,..."
      // INSTANTIATE erc725.js
      // window.web3 was set in App.vue
      const profile = new ERC725js(LSP3UniversalProfileMetaDataSchema, account, window.web3.currentProvider, {
        ipfsGateway: IPFS_GATEWAY_BASE_URL,
      });

      let metaData;
      try {
        metaData = await profile.fetchData('LSP3Profile');
      } catch (e) {
        // IF it fails its likely NO Universal Profile, or a simple EOA (MetaMask)
        this.profileData.name = false;
        this.profileData.profileImage.url = false;
        this.profileData.description = 'Address may not be a Universal Profile';
      }

      this.profileData = {
        ...this.profileData,
        ...metaData.value.LSP3Profile,
      };

      // GET the right image size for the profile image from the profile images array
      this.profileData.profileImage = _.find(this.profileData.profileImage, (image) => {
        if (image.width >= 200 && image.width <= 500) return image;
      });

      // If there is no image of the preferred size, take the default one
      if (!this.profileData.profileImage && metaData.value.LSP3Profile.profileImage) {
        this.profileData.profileImage = metaData.value.LSP3Profile.profileImage[0];
      }
      this.profileData.profileImage.url = this.profileData.profileImage.url.replace('ipfs://', profile.options.ipfsGateway);
    },
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
    <p class="addressField" style="font-family: 'Courier New', Courier, monospace">{{ address }}</p>
    <p class="description" v-if="profileData.description">
      {{ profileData.description }}
    </p>
  </div>
</template>
