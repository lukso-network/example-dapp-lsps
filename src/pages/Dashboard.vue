<script setup>
import ProfileComponent from '../components/ProfileComponent.vue'
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
    async createToken() {


    }
  }

}
</script>


<template>

  <div class="center">
    <ProfileComponent />

    <button @click="$router.push('/createToken')">Create a Token</button>
    <button @click="$router.push('/createNFTCollection')">Create an NFT Collection</button>
  </div>

</template>