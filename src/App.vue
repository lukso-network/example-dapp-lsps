<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>

<template>

  <div class="container">
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