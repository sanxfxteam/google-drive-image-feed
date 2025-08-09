<template>
  <div class="min-h-screen bg-base-100">
    <!-- Navigation -->
    <div class="navbar bg-base-200 shadow-lg">
      <div class="navbar-start">
        <router-link to="/" class="btn btn-ghost normal-case text-xl">
          Google Drive Images
        </router-link>
      </div>
      <div class="navbar-center">
        <div class="tabs tabs-boxed" v-if="isSignedIn">
          <router-link 
            to="/" 
            class="tab"
            :class="{ 'tab-active': $route.name === 'Home' }"
          >
            Folder View
          </router-link>
          <router-link 
            to="/canvas" 
            class="tab"
            :class="{ 'tab-active': $route.name === 'Canvas' }"
          >
            Canvas View
          </router-link>
        </div>
      </div>
      <div class="navbar-end">
        <Auth @signed-in="handleSignIn" />
      </div>
    </div>

    <!-- Main content -->
    <div class="container-fluid">
      <div v-if="!isSignedIn" class="hero min-h-screen bg-base-200">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Google Drive Image Feed</h1>
            <p class="py-6">
              Sign in with your Google account to view images from your Google Drive folders in either traditional folder view or an infinite canvas.
            </p>
          </div>
        </div>
      </div>
      <div v-else>
        <router-view 
          :is-signed-in="isSignedIn" 
          @open-full-screen="openFullScreen"
        />
      </div>
    </div>

    <!-- Full screen image modal -->
    <FullScreenImage :imageSrc="fullScreenImageSrc" ref="fullScreenImage" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Auth from './Auth.vue';
import FullScreenImage from './FullScreenImage.vue';

const isSignedIn = ref(false);
const fullScreenImage = ref(null);
const fullScreenImageSrc = ref(null);

const handleSignIn = (signedIn) => {
  console.log('AppLayout: Authentication state changed:', signedIn);
  isSignedIn.value = signedIn;
  
  // Ensure gapi is properly authenticated
  if (signedIn && window.gapi?.auth2) {
    const authInstance = window.gapi.auth2.getAuthInstance();
    console.log('Auth instance signed in:', authInstance.isSignedIn.get());
  }
};

const openFullScreen = (imageSrc) => {
  fullScreenImageSrc.value = imageSrc;
  if (fullScreenImage.value) {
    fullScreenImage.value.open();
  }
};
</script>