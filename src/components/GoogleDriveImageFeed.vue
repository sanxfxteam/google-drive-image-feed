<template>
  <div class="container mx-auto p-4">
    <!-- Error display for folder access issues -->
    <div v-if="error && folders.length === 0 && !loading" class="alert alert-error mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h3 class="font-bold">Unable to Access Google Drive</h3>
        <div class="text-sm">{{ error }}</div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row">
      <FolderList :folders="folders" :selected-folder="selectedFolder" @select-folder="handleFolderSelect" />
      <ImageList :images="images" :loading="loading" :loading-more="loadingMore" :error="error" @open-full-screen="openFullScreen" ref="imageList" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FolderList from './FolderList.vue';
import ImageList from './ImageList.vue';

const props = defineProps({
  isSignedIn: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['open-full-screen']);
const folders = ref([]);
const selectedFolder = ref(null);
const images = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref(null);
const nextPageToken = ref(null);
const imageList = ref(null);

const route = useRoute();
const router = useRouter();

const ROOT_FOLDER_ID = import.meta.env.VITE_ROOT_FOLDER_ID;
const SHARED_DRIVE_ID = import.meta.env.VITE_SHARED_DRIVE_ID;

const initializeData = async () => {
  if (props.isSignedIn) {
    await listSubfolders(ROOT_FOLDER_ID);
  } else {
    folders.value = [];
    images.value = [];
    selectedFolder.value = null;
    router.push({ ...route, query: {} });
  }
};

const listSubfolders = async (folderId) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'drive',
      driveId: SHARED_DRIVE_ID
    });
    folders.value = response.result.files;
  } catch (err) {
    console.error('Error listing subfolders:', err);
    
    // Check for specific error types
    if (err.status === 404) {
      error.value = 'Root folder not found. Please check the VITE_ROOT_FOLDER_ID in your environment configuration.';
    } else if (err.status === 403) {
      error.value = 'Access denied to the root folder. Please ensure your Google account has permission to access the specified folder and shared drive.';
    } else if (err.status === 401) {
      error.value = 'Authentication failed. Please sign out and sign back in to refresh your credentials.';
    } else {
      error.value = `Error accessing Google Drive: ${err.message || 'Unknown error'}. Please check your configuration and permissions.`;
    }
  }
  loading.value = false;
};

const handleFolderSelect = async ({ folderId, folderName }) => {
  selectedFolder.value = folderId;
  error.value = null;
  images.value = [];
  nextPageToken.value = null;
  router.push({ ...route, query: { folder: folderName } });
  await listImages(folderId);
};

const listImages = async (folderId, pageToken = null) => {
  if (pageToken) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  error.value = null;
  try {
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/')`,
      fields: 'nextPageToken, files(id, name, webViewLink, thumbnailLink, webContentLink, mimeType, size)',
      pageSize: 20,
      pageToken: pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'drive',
      driveId: SHARED_DRIVE_ID
    });
    const files = response.result.files.map(file => {
      console.log('File data:', file);
      return {
        ...file,
        highResLink: file.webContentLink
      };
    });
    if (pageToken) {
      images.value = [...images.value, ...files];
    } else {
      images.value = files;
    }
    nextPageToken.value = response.result.nextPageToken;
  } catch (err) {
    error.value = 'Error listing images. Please try again later.';
    console.error('Error listing images:', err);
  }
  loading.value = false;
  loadingMore.value = false;
};

const loadMoreImages = async () => {
  if (nextPageToken.value && !loading.value && !loadingMore.value) {
    await listImages(selectedFolder.value, nextPageToken.value);
  }
};

const handleScroll = () => {
  if (imageList.value) {
    const grid = imageList.value.$refs.imageGrid;
    if (grid) {
      const bottomOfGrid = grid.getBoundingClientRect().bottom;
      const bottomOfWindow = window.innerHeight;
      if (bottomOfGrid <= bottomOfWindow + 100) {
        loadMoreImages();
      }
    }
  }
};

const openFullScreen = (imageSrc) => {
  emit('open-full-screen', imageSrc);
};

watch(() => route.query.folder, async (newFolder) => {
  if (newFolder && folders.value.length > 0) {
    const folder = folders.value.find(f => f.name === newFolder);
    if (folder && folder.id !== selectedFolder.value) {
      await handleFolderSelect({ folderId: folder.id, folderName: folder.name });
    }
  }
});

watch(folders, (newFolders) => {
  if (route.query.folder && newFolders.length > 0) {
    const folder = newFolders.find(f => f.name === route.query.folder);
    if (folder) {
      handleFolderSelect({ folderId: folder.id, folderName: folder.name });
    }
  }
});

watch(() => props.isSignedIn, () => {
  initializeData();
});

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  initializeData();
});
</script>
