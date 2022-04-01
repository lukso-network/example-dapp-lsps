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

  // Executed when the profile component is rendered
  // Here we LOAD the Universal Profile data
  async mounted() {
    
  
  },

  methods: {
    async login() {

    }
  }

}
</script>


<template>

  <div class="profile">
    <div class="profileImage">
      <div class="identicon"></div>
      <div class="image" style="background-image(url:)"></div>
    </div>

    <span class="username">
      @username
    </span>

    <p class="description">

    </p>
  </div>

</template>