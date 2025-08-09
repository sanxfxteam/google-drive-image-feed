<template>
  <div class="infinite-canvas-container h-screen w-full relative overflow-hidden bg-base-200">
    <!-- Filter Bar -->
    <div class="absolute top-0 left-0 right-0 z-10 bg-base-100 shadow-lg p-4">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="form-control">
          <input 
            type="text" 
            placeholder="Search by metadata keywords..." 
            class="input input-bordered w-80" 
            v-model="searchKeyword"
            @input="applyFilters"
          />
        </div>
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text mr-2">Show all folders</span>
            <input type="checkbox" class="checkbox" v-model="showAllFolders" @change="loadImages" />
          </label>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div 
      ref="canvasContainer"
      class="absolute inset-0 cursor-grab active:cursor-grabbing"
      style="top: 80px;"
      @mousedown="startPan"
      @mousemove="pan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @wheel="zoom"
    >
      <div 
        ref="canvas"
        class="relative origin-top-left transition-transform"
        :style="{ transform: `translate(${panX}px, ${panY}px) scale(${scale})` }"
      >
        <!-- Images positioned absolutely -->
        <div
          v-for="image in filteredImages"
          :key="image.id"
          :style="{ 
            position: 'absolute', 
            left: image.x + 'px', 
            top: image.y + 'px',
            width: image.width + 'px',
            height: image.height + 'px'
          }"
          class="image-item cursor-pointer hover:shadow-lg transition-shadow"
          @click="openFullScreen(image.highResLink)"
        >
          <img 
            :src="getAuthenticatedThumbnail(image)" 
            :alt="image.name"
            class="w-full h-full object-cover rounded shadow-md"
            @load="onImageLoad"
          />
          <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b">
            {{ image.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 bg-base-200 bg-opacity-75 flex items-center justify-center z-20">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-4">Loading images...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps({
  isSignedIn: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['open-full-screen']);

// Canvas state
const canvasContainer = ref(null);
const canvas = ref(null);
const panX = ref(0);
const panY = ref(0);
const scale = ref(1);
const isPanning = ref(false);
const lastPanX = ref(0);
const lastPanY = ref(0);

// Image state
const images = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const showAllFolders = ref(true);

const filteredImages = computed(() => {
  let filtered = images.value.slice();

  // Apply keyword filter
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(image => 
      image.name.toLowerCase().includes(keyword) ||
      (image.metadata && Object.values(image.metadata).some(value => 
        String(value).toLowerCase().includes(keyword)
      ))
    );
  }

  return filtered;
});

const startPan = (event) => {
  isPanning.value = true;
  lastPanX.value = event.clientX;
  lastPanY.value = event.clientY;
};

const pan = (event) => {
  if (!isPanning.value) return;
  
  const deltaX = event.clientX - lastPanX.value;
  const deltaY = event.clientY - lastPanY.value;
  
  panX.value += deltaX;
  panY.value += deltaY;
  
  lastPanX.value = event.clientX;
  lastPanY.value = event.clientY;
};

const endPan = () => {
  isPanning.value = false;
};

const zoom = (event) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(0.1, Math.min(3, scale.value * delta));
  
  // Zoom towards mouse position
  const rect = canvasContainer.value.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  const scaleDiff = newScale - scale.value;
  panX.value -= (mouseX - panX.value) * (scaleDiff / scale.value);
  panY.value -= (mouseY - panY.value) * (scaleDiff / scale.value);
  
  scale.value = newScale;
};

const loadImages = async () => {
  if (!props.isSignedIn || !window.gapi) {
    console.warn('Not signed in or gapi not loaded');
    return;
  }
  
  loading.value = true;
  images.value = [];
  
  try {
    let allImages = [];
    
    if (showAllFolders.value) {
      // Load from all folders
      const folders = await getAllFolders();
      for (const folder of folders) {
        const folderImages = await getImagesFromFolder(folder.id);
        allImages = [...allImages, ...folderImages.map(img => ({ ...img, folderName: folder.name }))];
      }
    } else {
      // Load from root folder only
      const rootImages = await getImagesFromFolder(import.meta.env.VITE_ROOT_FOLDER_ID);
      allImages = rootImages;
    }
    
    // Position images in a grid layout
    arrangeImages(allImages);
    
    images.value = allImages;
  } catch (error) {
    console.error('Error loading images:', error);
  }
  
  loading.value = false;
};

const getAllFolders = async () => {
  if (!window.gapi?.client?.drive) {
    throw new Error('Google Drive API not available');
  }
  
  const response = await window.gapi.client.drive.files.list({
    q: `'${import.meta.env.VITE_ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: 'drive',
    driveId: import.meta.env.VITE_SHARED_DRIVE_ID
  });
  return response.result.files || [];
};

const getImagesFromFolder = async (folderId) => {
  if (!window.gapi?.client?.drive) {
    throw new Error('Google Drive API not available');
  }
  
  let allImages = [];
  let pageToken = null;
  
  do {
    const response = await window.gapi.client.drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/')`,
      fields: 'nextPageToken, files(id, name, webViewLink, thumbnailLink, webContentLink, imageMediaMetadata, createdTime)',
      pageSize: 100,
      pageToken: pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'drive',
      driveId: import.meta.env.VITE_SHARED_DRIVE_ID
    });
    
    const files = (response.result.files || []).map(file => ({
      ...file,
      highResLink: file.webContentLink,
      metadata: file.imageMediaMetadata || {}
    }));
    
    allImages = [...allImages, ...files];
    pageToken = response.result.nextPageToken;
  } while (pageToken);
  
  return allImages;
};

const arrangeImages = (imageList) => {
  if (!imageList || imageList.length === 0) return;
  
  const imageSize = 200;
  const gap = 20;
  const cols = Math.ceil(Math.sqrt(imageList.length));
  
  imageList.forEach((image, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    image.x = col * (imageSize + gap);
    image.y = row * (imageSize + gap);
    image.width = imageSize;
    image.height = imageSize;
  });
};


const applyFilters = () => {
  // Filtering is handled by computed property
};

const onImageLoad = () => {
  // Image loaded successfully
};

const getAuthenticatedThumbnail = (image) => {
  if (!image?.thumbnailLink) return null;
  
  // Add access token to thumbnail URL for authentication
  if (window.gapi?.auth2) {
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (authInstance.isSignedIn.get()) {
      const currentUser = authInstance.currentUser.get();
      const authResponse = currentUser.getAuthResponse();
      if (authResponse.access_token) {
        const url = new URL(image.thumbnailLink);
        url.searchParams.set('access_token', authResponse.access_token);
        return url.toString();
      }
    }
  }
  
  return image.thumbnailLink;
};

const openFullScreen = (imageSrc) => {
  emit('open-full-screen', imageSrc);
};

watch(() => props.isSignedIn, (newValue) => {
  if (newValue) {
    loadImages();
  } else {
    images.value = [];
  }
});

onMounted(() => {
  if (props.isSignedIn) {
    loadImages();
  }
});
</script>

<style scoped>
.infinite-canvas-container {
  user-select: none;
}

.image-item {
  transition: transform 0.2s ease;
}

.image-item:hover {
  transform: translateY(-2px);
}
</style>