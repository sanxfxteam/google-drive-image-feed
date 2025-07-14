<template>
  <button v-if="!isSignedIn" @click="signIn" class="btn btn-primary">
    Sign In with Google
  </button>
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
  isSignedIn.value = signedIn;
  emit('signed-in', signedIn);
};

const signIn = () => {
  gapi.auth2.getAuthInstance().signIn();
};

onMounted(() => {
  initGoogleAuth();
});
</script>
