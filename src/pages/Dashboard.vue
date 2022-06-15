<script setup>
import ProfileComponent from '../components/ProfileComponent.vue';
import CreationsComponent from '../components/CreationsComponent.vue';
import PortfolioComponent from '../components/PortfolioComponent.vue';
</script>

<script>
export default {
  data() {
    return {
      createdAssets: [],
      ownedAssets: [],
    };
  },

  // Executed when the login page is rendered
  async mounted() {
    // READ LSP12 and LSP5
  },

  methods: {
    async createToken() {},
  },
};
</script>

<template>
  <div class="center">
    <ProfileComponent />

    <button @click="$router.push('/createToken')">Create a Token</button>
    <!--TODO: add onclick after router is working-->
    <button>Create an NFT Collection</button>

    <CreationsComponent style="margin-top: 60px" />
    <PortfolioComponent style="margin-top: 60px" />
  </div>
</template>
