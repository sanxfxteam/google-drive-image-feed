# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `npm run dev` (starts Vite dev server on http://localhost:5173)
- **Build**: `npm run build` (builds for production in `dist/` directory)
- **Preview build**: `npm run preview` (preview production build locally)
- **Serve production**: `npm run serve` (serves `dist/` on port 8080 using http-server)
- **Deploy**: `npm run deploy` (deploys to Firebase hosting target `shiva-image-feed`)

## Environment Setup

The application requires a `.env` file with Google API credentials:
```
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_ROOT_FOLDER_ID=your_root_folder_id_here
VITE_SHARED_DRIVE_ID=your_shared_drive_id_here
```

## Architecture

This is a Vue 3 application that displays images from Google Drive folders. The key architectural components:

### Core Structure
- **Single Page Application**: Uses Vue Router with one main route (`/`) that loads `GoogleDriveImageFeed` component
- **Component-based**: Main app logic is in `GoogleDriveImageFeed.vue` with child components for specific features
- **Google Drive Integration**: Uses `gapi-script` to interact with Google Drive API v3

### Component Architecture
- `App.vue`: Root component that renders `GoogleDriveImageFeed`
- `GoogleDriveImageFeed.vue`: Main orchestrator component that handles:
  - Authentication state management
  - Google Drive API calls (folders and images)
  - URL state synchronization with selected folder
  - Infinite scroll loading for images
  - Full-screen image modal triggering
- `Auth.vue`: Handles Google OAuth2 authentication flow
- `FolderList.vue`: Displays available subfolders from root Google Drive folder
- `ImageList.vue`: Displays images in a grid with lazy loading and infinite scroll
- `FullScreenImage.vue`: Modal component for full-screen image viewing

### Key Technical Patterns
- **Composition API**: Uses Vue 3's `<script setup>` syntax throughout
- **Environment Variables**: All Google API configuration via Vite env vars (`import.meta.env`)
- **Shared Drive Support**: Configured to work with Google Shared Drives using `supportsAllDrives` and `driveId`
- **URL State Management**: Folder selection persisted in query parameters for bookmarking/sharing
- **Infinite Scroll**: Pagination implemented with Google Drive API `nextPageToken`

### Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **DaisyUI**: Component library built on Tailwind (supports light/dark themes)
- **Responsive Design**: Uses Tailwind's responsive classes (`md:flex-row`, etc.)

### Deployment
- **Firebase Hosting**: Configured for deployment to `shiva-image-feed` target
- **SPA Routing**: Firebase rewrites all routes to `/index.html` for client-side routing
- **Vite Build**: Uses Vite's optimized production build process

## Google Drive API Usage

The app makes specific API calls:
- **List Subfolders**: Queries for folders in the root directory with `mimeType='application/vnd.google-apps.folder'`
- **List Images**: Queries for files with `mimeType contains 'image/'` in selected folder
- **Pagination**: Uses `pageToken` and `pageSize` (20) for efficient loading
- **Shared Drives**: All queries include `supportsAllDrives: true` and `driveId` parameter