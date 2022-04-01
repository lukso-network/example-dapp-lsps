<script setup>
import Login from './pages/Login.vue'
import TheWelcome from './pages/TheWelcome.vue'
import Web3 from 'web3'

// CONNECT web3.js to the "ethereum" provider
// be aware that adding web3 gloablly is not the proper way to pass the web3 object around in your app,
// we use this only for simplicity reasons
window.web3 = new Web3(Web3.givenProvider);

</script>
<script>
export default {

  // CHECK if the browser has a an extension, AND is authenticated (extension provided an address)
  // when the app is loaded
  async mounted() {
    console.log(this.web4)

    // TRY getting the UniversalProfile address
    try {
      console.log(
       "Authenticated account:\n", 
        await web3.eth.getAccounts()
      )
    
    // OTHERWISE go to the login page, if no browser extension can be detected, or no accounts are exposed
    } catch(e) {
      console.log(
        "Not authenticated:\n\n",
        e
      )
      this.$router.push('/login')
    }

  }
}
</script>

<template>

  <div class="app container">
    <header>


    </header>
    
    <main>
      <router-view />
    </main>
  </div>


</template>

<style lang="less">
  @import "./styles.less";
</style>