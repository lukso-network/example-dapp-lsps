<script setup>
import Web3 from 'web3';

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

    // TRY getting the UniversalProfile address
    try {
      const accounts = await web3.eth.getAccounts();

      if (!accounts.length) {
        throw Error('No accounts given: ' + accounts);
      }

      console.log('Authenticated account:\n', accounts);

      // GET the Universal Profile / Meta Mask address(es)
      // set the account globally, to reduce getAccounts calls in components
      window.account = accounts[0];

      // Check if address is EOA, create localStorage to store assets on
      let bytecode = await web3.eth.getCode(accounts[0]);
  
      if (bytecode === '0x') {
        this.setupLocalStorage("receivedAssets", accounts[0]);
        this.setupLocalStorage("issuedAssets", accounts[0])
      }

      // If address is Universal Profile, clear cache used before
      else{
        this.clearLocalStorage("receivedAssets");
        this.clearLocalStorage("issuedAssets");
      }

      // OTHERWISE go to the login page, if no browser extension can be detected, or no accounts are exposed
    } catch (e) {
      console.log('Not authenticated:\n\n', e);
      this.$router.push('/login');
    }
  },
  methods: {
    setupLocalStorage(itemName, account){
      if (localStorage.getItem(itemName) === null) {
        localStorage.setItem(itemName, JSON.stringify({"value":[], "account": account}));
      }
      else{
        const localStorageOwner = JSON.parse(localStorage.getItem(itemName));
          
        if(localStorageOwner.account !== account){
          localStorage.removeItem(itemName);
        }
      }
    },

    clearLocalStorage(itemName){
        if (localStorage.getItem(itemName) !== null) {
          localStorage.removeItem(itemName);
        }
    }
  }
};
</script>

<template>
  <div class="app container">
    <header></header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<style lang="less">
@import './styles.less';
</style>
