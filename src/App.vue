<template>
  <div id="app">
    <llama-decoder />
  </div>
</template>

<script>
import LlamaDecoder from './components/LlamaDecoder.vue';

export default {
  name: 'app',
  components: {
    LlamaDecoder,
  },
};
</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
}
#app {
  display: flex;
  background: #333;
  color: #fff;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
  font-size: 16px;
}
</style>
