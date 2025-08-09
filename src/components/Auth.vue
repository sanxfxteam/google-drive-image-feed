<template>
  <div class="flex items-center gap-2">
    <button v-if="!isSignedIn" @click="signIn" class="btn btn-primary">
      Sign In with Google
    </button>
    <div v-else class="flex items-center gap-2">
      <span class="text-sm">Signed in</span>
      <button @click="signOut" class="btn btn-outline btn-sm">
        Sign Out
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { loadGapiInsideDOM } from "gapi-script";

const isSignedIn = ref(false);
const emit = defineEmits(['signed-in']);

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
    emit('signed-in', true);
  }
};

const updateSignInStatus = async (signedIn) => {
  console.log('Auth: Sign-in status changed to:', signedIn);
  isSignedIn.value = signedIn;
  emit('signed-in', signedIn);
  
  if (signedIn) {
    const authInstance = gapi.auth2.getAuthInstance();
    const currentUser = authInstance.currentUser.get();
    const authResponse = currentUser.getAuthResponse();
    console.log('Auth: Access token available:', !!authResponse.access_token);
  }
};

const signIn = () => {
  gapi.auth2.getAuthInstance().signIn();
};

const signOut = () => {
  gapi.auth2.getAuthInstance().signOut();
};

onMounted(() => {
  initGoogleAuth();
});
</script>
