<template>
  <div class="w-full md:w-1/4 pr-4 mb-4 md:mb-0">
    <h2 class="text-xl font-semibold mb-2">Subfolders</h2>
    <ul class="menu bg-base-200 w-full rounded-box">
      <li v-for="folder in folders" :key="folder.id">
        <a @click="selectFolder(folder.id, folder.name)"
           :class="{ 'active': selectedFolder === folder.id }">
          {{ folder.name }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  folders: {
    type: Array,
    required: true
  },
  selectedFolder: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select-folder']);

const selectFolder = (folderId, folderName) => {
  emit('select-folder', { folderId, folderName });
};
</script>
