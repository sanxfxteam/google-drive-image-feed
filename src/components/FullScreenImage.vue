<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
    <button @click="close" class="absolute top-4 right-4 text-white text-2xl">&times;</button>
    <img :src="imageSrc" class="max-w-full max-h-full" />
  </div>
</template>

<script>
export default {
  name: 'FullScreenImage',
  props: {
    imageSrc: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      visible: false
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    }
  }
};
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
