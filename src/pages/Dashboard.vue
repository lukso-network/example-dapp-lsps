<script setup>
import ProfileComponent from '../components/ProfileComponent.vue'
</script>

<script>
export default {

  data() {
    return {
      createdAssets: [],
      ownedAssets: []
    }
  },

  // Executed when the login page is rendered
  async mounted() {

      // READ LSP12 and LSP5

  },

  methods: {
    async createToken() {


    }
  }

}
</script>


<template>

  <div class="center">

    <ProfileComponent />

    <button @click="$router.push('/createToken')">Create a Token</button>
    <!--TODO: add onclick after router is working-->
    <button>Create an NFT Collection</button>


  </div>

</template>