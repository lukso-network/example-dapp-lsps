<script setup>
import ProfileComponent from '../components/ProfileComponent.vue';
import LSP12IssuedAssetsComponent from '../components/LSP12IssuedAssetsComponent.vue';
import LSP5ReceivedAssets from '../components/LSP5ReceivedAssets.vue';
</script>

<template>
  <div>
    <ProfileComponent />

    <div class="center">
      <button @click="$router.push('/createToken')" style="width: 235px">Create a Token</button>
      <button @click="$router.push('/createNFTCollection')" style="width: 235px">Create an NFT Collection</button>
      <LSP12IssuedAssetsComponent style="margin-top: 60px" />
      <LSP5ReceivedAssets style="margin-top: 60px" />
    </div>
  </div>
</template>
