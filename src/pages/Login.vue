<script>
export default {

  data() {
    return {
      isUnsupportedBrowser: true,
      requiresBrowserExtension: false,
      requiresLogin: false,
      useOnlyOneExtension: true,
      error: false
    }
  },

  // Executed when the login page is rendered
  async mounted() {

    // CHECK if BROWSER is Chrome or Firefox
    if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") != -1) {
      this.isUnsupportedBrowser = false;
    }


    // CHECK if BROWSER EXTENSION is INSTALLED
    // AND/OR Universal Profile is LOGGED IN (address is available)

    // Get account
    if (window.ethereum) {

      // Request account
      const accounts = await ethereum.request({ method: "eth_accounts" });

      // If no account was found
      if (!accounts.length) {
        this.requiresLogin = true;
      }

      // OTHERWISE user is logged in, go to the dashboard
      else {
        this.$router.push('/')
      }
    }

    // No ethereum extension connected
    // We ask the user to install the browser extension
    else {
      this.requiresBrowserExtension = true;
      this.useOnlyOneExtension = false;
    }
  },

  methods: {
    // IF the user clicks the LOGIN BUTTON
    async login() {

      // Request an account
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      // check if any number of accounts was returned
      // IF go to the dashboard
      if (accounts.length)
        this.$router.push('/');
      else
        this.error = 'No account was selected!';
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

  <p class="note" v-if="useOnlyOneExtension">If you have MetaMask AND Universal Profile Browser Extension
    installed, please disable one of them! See these guides for
    <a href="https://support.google.com/chrome_webstore/answer/2664769?hl=en" target="_blank">Chrome</a>
    and
    <a href="https://support.mozilla.org/en-US/kb/disable-or-remove-add-ons#w_disabling-and-removing-extensions" target="_blank">Firefox</a>.
  </p>

  <p class="warning" v-if="error">
    {{ error }}
  </p>


  <p class="note" v-if="isUnsupportedBrowser">
    Please switch to a <a href="https://www.google.com/chrome/" target="_blank">Chrome</a>
    or
    <a href="https://www.mozilla.org/firefox/new/" target="_blank">Firefox</a> browser to use this dApp.
  </p>
  <div class="login center" v-else>

    <!-- Ask the user to DOWNLOAD the BROWSER EXTENSION -->
    <div v-if="requiresBrowserExtension">
      <p class="warning">
        Please install the
        <a href="https://docs.lukso.tech/guides/universal-profile/browser-extension/install-browser-extension" target="_blank">Universal Profile Browser Extension</a>
        or
        <a href="https://metamask.io/" target="_blank">MetaMask</a> to use this dApp.
      </p>
    </div>


    <!-- Ask the user to LOGIN, using the bowser extension -->
    <div v-else-if="requiresLogin">

      <button @click="login">Log in to your browser extension</button>
    </div>

  </div>

</template>