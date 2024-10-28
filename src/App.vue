<template>
  <div>
    <Player />
    <div class="space"></div>
    <Player lectorName="Second"/>
  </div>
</template>

<script setup>
import Player from './component/Player.vue';
</script>

<style lang="scss" scoped>
  .space{
    width: 10px;
    height: 5px;
  }
</style>
