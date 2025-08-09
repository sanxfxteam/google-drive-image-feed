<template>
  <div class="w-full md:w-3/4">
    <h2 class="text-xl font-semibold mb-2">Images</h2>
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else-if="images.length === 0 && !error" class="alert alert-info">
      No images found in this folder.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" ref="imageGrid">
      <div v-for="image in images" :key="image.id" class="card bg-base-100 shadow-xl">
        <figure class="aspect-square overflow-hidden">
          <img 
            :src="getAuthenticatedThumbnail(image)" 
            :alt="image.name" 
            class="w-full h-full object-cover" 
            loading="lazy"
            @click="openFullScreen(image.highResLink)"
            @error="handleImageError(image, $event)"
            @load="handleImageLoad(image)"
          />
        </figure>
        <div class="card-body p-4">
          <h2 class="card-title text-sm">{{ image.name }}</h2>
          <div class="card-actions justify-end">
            <a :href="image.webViewLink" target="_blank" class="btn btn-primary btn-sm">View</a>
          </div>
        </div>
      </div>
    </div>
    <div v-if="loadingMore" class="flex justify-center items-center mt-4">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    required: true
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['open-full-screen']);

const openFullScreen = (imageSrc) => {
  emit('open-full-screen', imageSrc);
};

const handleImageError = (image, event) => {
  console.error('Failed to load thumbnail for:', image.name, 'URL:', image.thumbnailLink);
  // Try to use a different image source or show placeholder
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
};

const getAuthenticatedThumbnail = (image) => {
  // Use webContentLink (full image) instead of thumbnailLink to avoid auth issues
  return image.webContentLink || image.highResLink || null;
};

const handleImageLoad = (image) => {
  console.log('Successfully loaded thumbnail for:', image.name);
};
</script>
