<template>
  <div v-if="visible && imageSrc" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
    <button @click="close" class="absolute top-4 right-4 text-white text-2xl">&times;</button>
    <img :src="imageSrc" class="max-w-full max-h-full" />
  </div>
</template>

<script setup>
import { ref, defineProps, defineExpose } from 'vue';

const props = defineProps({
  imageSrc: {
    type: String,
    default: null
  }
});

const visible = ref(false);

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

defineExpose({
  open,
  close
});
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
