<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Google Drive Image Feed</h1>
    
    <button v-if="!isSignedIn" @click="signIn" class="btn btn-primary">
      Sign In with Google
    </button>
    
    <div v-else>
      <div class="flex mb-4">
        <div class="w-1/3 pr-4">
          <h2 class="text-xl font-semibold mb-2">Folders</h2>
          <ul class="menu bg-base-200 w-full rounded-box">
            <li v-for="folder in folders" :key="folder.id">
              <a @click="selectFolder(folder.id)" :class="{ 'active': selectedFolder === folder.id }">
                {{ folder.name }}
              </a>
            </li>
          </ul>
        </div>
        
        <div class="w-2/3">
          <h2 class="text-xl font-semibold mb-2">Images</h2>
          <div v-if="loading" class="flex justify-center items-center h-64">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
          <div v-else-if="images.length === 0" class="alert alert-info">
            No images found in this folder.
          </div>
          <div v-else class="grid grid-cols-3 gap-4">
            <div v-for="image in images" :key="image.id" class="card bg-base-100 shadow-xl">
              <figure><img :src="image.thumbnailLink" :alt="image.name" class="w-full h-48 object-cover" /></figure>
              <div class="card-body">
                <h2 class="card-title">{{ image.name }}</h2>
                <div class="card-actions justify-end">
                  <a :href="image.webViewLink" target="_blank" class="btn btn-primary btn-sm">View</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { loadGapiInsideDOM } from "gapi-script";

export default {
  name: 'GoogleDriveImageFeed',
  setup() {
    const isSignedIn = ref(false);
    const folders = ref([]);
    const selectedFolder = ref(null);
    const images = ref([]);
    const loading = ref(false);

    // Use environment variables
    const ROOT_FOLDER_ID = import.meta.env.VITE_ROOT_FOLDER_ID;
    const SHARED_DRIVE_ID = import.meta.env.VITE_SHARED_DRIVE_ID;
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
        listSubfolders(ROOT_FOLDER_ID);
      }
    };

    const updateSignInStatus = (signedIn) => {
      isSignedIn.value = signedIn;
      if (signedIn) {
        listSubfolders(ROOT_FOLDER_ID);
      } else {
        folders.value = [];
        images.value = [];
      }
    };

    const signIn = () => {
      gapi.auth2.getAuthInstance().signIn();
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

    const selectFolder = async (folderId) => {
      selectedFolder.value = folderId;
      await listImages(folderId);
    };

    const listImages = async (folderId) => {
      loading.value = true;
      images.value = [];
      try {
        const response = await gapi.client.drive.files.list({
          q: `'${folderId}' in parents and (mimeType contains 'image/')`,
          fields: 'files(id, name, webViewLink, thumbnailLink)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          corpora: 'drive',
          driveId: SHARED_DRIVE_ID
        });
        images.value = response.result.files;
      } catch (error) {
        console.error('Error listing images:', error);
      }
      loading.value = false;
    };

    onMounted(() => {
      initGoogleAuth();
    });

    return {
      isSignedIn,
      folders,
      selectedFolder,
      images,
      loading,
      signIn,
      selectFolder,
    };
  }
};
</script>