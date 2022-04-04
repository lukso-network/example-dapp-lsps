<script setup>
import ProfileComponent from '../components/ProfileComponent.vue'
</script>

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
    
    
  },

  methods: {
    async login() {


    }
  }

}
</script>


<template>

  <div class="center">
    <ProfileComponent />
  </div>

</template>