<script>
export default {

  data() {
    return {
      isUnsupportedBrowser: true,
      requiresBrowserExtension: false,
      requiresLogin: false,
      error: false
    }
  },

  // Executed when the login page is rendered
  async mounted() {
    
    // CHECK if BROWSER is Chrome or Firefox
    if(navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") != -1 ) {
      this.isUnsupportedBrowser = false
    }


    // CHECK if BROWSER EXTENSION is INSTALLED
    // AND/OR Universal Profile is LOGGED IN (address is available)
    try {
      
      const accounts = await web3.eth.getAccounts()

      // IF accounts are empty, require login
      if(!accounts.length)
        this.requiresLogin = true

      // OTHERWISE user is logged in, go to the dashboard
      else
        this.$router.push('/')


    // IF web3.js couldn't connect it will throw Error: "Provider not set or invalid"
    // then and we ask the user to install the browser extension
    } catch(e) {

      if(e.code == 4100) // TODO remove when empty array is returned
        this.requiresLogin = true
      else
        this.requiresBrowserExtension = true
    }
  },

  methods: {
    // IF the user clicks the LOGIN BUTTON
    async login() {

      // Request an account
      const accounts = await web3.eth.requestAccounts()

      // check if any number of accounts was returned
      // IF go to the dashboard
      if(accounts.length)
        this.$router.push('/')
      else
        this.error = 'No account was selected!'
    }
  }

}
</script>


<template>

  <div class="center">
    <h2>
      LUKSO Example dApp
    </h2>
    <h3>
      Universal Profiles, Tokens (LSP7) and NFTs (LSP8)
    </h3>
    <br>
  </div>


  <p class="warning" v-if="error">
    {{error}}
  </p>


  <p class="note" v-if="isUnsupportedBrowser">
    This app can only be used with <a href="https://www.google.com/chrome/" target="_blank">Chrome</a> or <a href="https://www.mozilla.org/firefox/new/" target="_blank">Firefox</a> at this point
  </p>
  <div class="login center" v-else>

    <!-- Ask the user to DOWNLOAD the BROWSER EXTENSION -->
    <div v-if="requiresBrowserExtension">
      <h2>
        Please install the Universal Profile Browser extension to login
      </h2>
      <p>
        Download the browser extension and follow 
        <a href="https://docs.lukso.tech/guides/universal-profile/browser-extension/install-browser-extension" target="_blank">this tutorial</a>
        to install it.
      </p>

      <br>

      <a class="button" href="https://storage.googleapis.com/up-browser-extension/universalprofile-extension-v1.0.0-develop.143.zip">
        Download Universal Profile Browser extension
      </a>
    </div>


    <!-- Ask the user to LOGIN, using the bowser extension -->
    <div v-else-if="requiresLogin">

      <button @click="login">Login with your Universal Profile</button>
    </div>

  </div>

</template>