<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Google Drive Image Feed</h1>
    
    <Auth @signed-in="handleSignIn" />
    
    <div v-if="isSignedIn" class="flex flex-col md:flex-row">
      <FolderList :folders="folders" :selected-folder="selectedFolder" @select-folder="handleFolderSelect" />
      <ImageList :images="images" :loading="loading" :error="error" @open-full-screen="openFullScreen" ref="imageList" />
    </div>
    <FullScreenImage :imageSrc="fullScreenImageSrc" ref="fullScreenImage" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Auth from './Auth.vue';
import FolderList from './FolderList.vue';
import ImageList from './ImageList.vue';
import FullScreenImage from './FullScreenImage.vue';

const isSignedIn = ref(false);
const folders = ref([]);
const selectedFolder = ref(null);
const images = ref([]);
const loading = ref(false);
const error = ref(null);
const nextPageToken = ref(null);
const fullScreenImage = ref(null);
const fullScreenImageSrc = ref(null);
const imageList = ref(null);

const route = useRoute();
const router = useRouter();

const ROOT_FOLDER_ID = import.meta.env.VITE_ROOT_FOLDER_ID;
const SHARED_DRIVE_ID = import.meta.env.VITE_SHARED_DRIVE_ID;

const handleSignIn = async (signedIn) => {
  isSignedIn.value = signedIn;
  if (signedIn) {
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
    error.value = 'Error listing subfolders. Please try again later.';
    console.error('Error listing subfolders:', err);
  }
  loading.value = false;
};

const handleFolderSelect = async ({ folderId, folderName }) => {
  selectedFolder.value = folderId;
  error.value = null;
  images.value = [];
  router.push({ ...route, query: { folder: folderName } });
  await listImages(folderId);
};

const listImages = async (folderId, pageToken = null) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/')`,
      fields: 'nextPageToken, files(id, name, webViewLink, thumbnailLink, webContentLink)',
      pageSize: 20,
      pageToken: pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'drive',
      driveId: SHARED_DRIVE_ID
    });
    const files = response.result.files.map(file => ({
      ...file,
      highResLink: file.webContentLink
    }));
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
};

const loadMoreImages = async () => {
  if (nextPageToken.value && !loading.value) {
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
  fullScreenImageSrc.value = imageSrc;
  if (fullScreenImage.value) {
    fullScreenImage.value.open();
  }
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

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});
</script>
