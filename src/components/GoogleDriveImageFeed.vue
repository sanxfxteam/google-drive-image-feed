<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Google Drive Image Feed</h1>
    
    <button v-if="!isSignedIn" @click="signIn" class="btn btn-primary">
      Sign In with Google
    </button>
    
    <div v-else class="flex flex-col md:flex-row">
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
      
      <div class="w-full md:w-3/4">
        <h2 class="text-xl font-semibold mb-2">Images</h2>
        <div v-if="loading" class="flex justify-center items-center h-64">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else-if="images.length === 0" class="alert alert-info">
          No images found in this folder.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" ref="imageGrid">
          <div v-for="image in images" :key="image.id" class="card bg-base-100 shadow-xl">
            <figure class="aspect-square overflow-hidden">
              <img :src="image.thumbnailLink" :alt="image.name" class="w-full h-full object-cover" @click="openFullScreen(image.highResLink)" />
            </figure>
            <div class="card-body p-4">
              <h2 class="card-title text-sm">{{ image.name }}</h2>
              <div class="card-actions justify-end">
                <a :href="image.webViewLink" target="_blank" class="btn btn-primary btn-sm">View</a>
              </div>
            </div>
          </div>
        </div>
        <div v-if="loading && images.length > 0" class="flex justify-center items-center mt-4">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    </div>
    <FullScreenImage :imageSrc="fullScreenImageSrc" ref="fullScreenImage" />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { loadGapiInsideDOM } from "gapi-script";
import { useRoute, useRouter } from 'vue-router';
import FullScreenImage from './FullScreenImage.vue';

export default {
  name: 'GoogleDriveImageFeed',
  components: {
    FullScreenImage
  },
  setup() {
    const isSignedIn = ref(false);
    const folders = ref([]);
    const selectedFolder = ref(null);
    const images = ref([]);
    const loading = ref(false);
    const loadingSubFolder = ref(false);
    const nextPageToken = ref(null);
    const imageGrid = ref(null);
    const fullScreenImageSrc = ref(null);

    const route = useRoute();
    const router = useRouter();

    const ROOT_FOLDER_ID = import.meta.env.VITE_ROOT_FOLDER_ID;
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const SHARED_DRIVE_ID = import.meta.env.VITE_SHARED_DRIVE_ID;

    const initGoogleAuth = async () => {
      await loadGapiInsideDOM();
      await new Promise((resolve) => gapi.load('client:auth2', resolve));
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly'
      });

      const authInstance = gapi.auth2.getAuthInstance();
      isSignedIn.value = authInstance.isSignedIn.get();
      authInstance.isSignedIn.listen(updateSignInStatus);

      if (isSignedIn.value) {
        await listSubfolders(ROOT_FOLDER_ID);
        if (route.query.folder) {
          const folder = folders.value.find(f => f.name === route.query.folder);
          if (folder) {
            selectFolder(folder.id, folder.name);
          }
        }
      }
    };

    const updateSignInStatus = async (signedIn) => {
      isSignedIn.value = signedIn;
      if (signedIn) {
        await listSubfolders(ROOT_FOLDER_ID);
      } else {
        folders.value = [];
        images.value = [];
      }
    };

    const signIn = () => {
      gapi.auth.getAuthInstance().signIn();
    };

    const listSubfolders = async (folderId) => {
      loading.value = true;
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
      } catch (error) {
        console.error('Error listing subfolders:', error);
      }
      loading.value = false;
    };

    const selectFolder = async (folderId, folderName) => {
      selectedFolder.value = folderId;
      router.push({... route, query: { folder: folderName } });
      await listImages(folderId);
    };

    const listImages = async (folderId, pageToken = null) => {
      images.value = [];
      loading.value = true;
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
      } catch (error) {
        console.error('Error listing images:', error);
      }
      loading.value = false;
    };

    const loadMoreImages = async () => {
      if (nextPageToken.value && !loading.value) {
        await listImages(selectedFolder.value, nextPageToken.value);
      }
    };

    const handleScroll = () => {
      const grid = imageGrid.value;
      if (grid) {
        const bottomOfGrid = grid.getBoundingClientRect().bottom;
        const bottomOfWindow = window.innerHeight;
        if (bottomOfGrid <= bottomOfWindow + 100) {
          loadMoreImages();
        }
      }
    };

    const openFullScreen = (imageSrc) => {
      fullScreenImageSrc.value = imageSrc;
      const fullScreenImageComponent = imageGrid.value.$refs.fullScreenImage;
      if (fullScreenImageComponent) {
        fullScreenImageComponent.open();
      }
    };

    watch(() => route.query.folder, async (newFolder) => {
      if (newFolder && folders.value.length > 0) {
        const folder = folders.value.find(f => f.name === newFolder);
        if (folder && folder.id !== selectedFolder.value) {
          await selectFolder(folder.id, folder.name);
        }
      }
    });

    onMounted(() => {
      initGoogleAuth();
      window.addEventListener('scroll', handleScroll);
    });

    return {
      isSignedIn,
      folders,
      selectedFolder,
      images,
      loading,
      signIn,
      selectFolder,
      imageGrid,
      openFullScreen,
      fullScreenImageSrc
    };
  }
};
</script>
