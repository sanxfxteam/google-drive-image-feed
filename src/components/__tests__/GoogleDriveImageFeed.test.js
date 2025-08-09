import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import GoogleDriveImageFeed from '../GoogleDriveImageFeed.vue'

// Mock child components
vi.mock('../Auth.vue', () => ({ default: { template: '<div>Auth</div>' } }))
vi.mock('../FolderList.vue', () => ({ default: { template: '<div>FolderList</div>' } }))
vi.mock('../ImageList.vue', () => ({ default: { template: '<div>ImageList</div>' } }))
vi.mock('../FullScreenImage.vue', () => ({ default: { template: '<div>FullScreenImage</div>' } }))

// Mock gapi
global.gapi = {
  client: {
    drive: {
      files: {
        list: vi.fn(() => Promise.resolve({ 
          result: { files: [], nextPageToken: null }
        }))
      }
    }
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div></div>' } }]
})

describe('GoogleDriveImageFeed', () => {
  it('renders main components', () => {
    const wrapper = mount(GoogleDriveImageFeed, {
      global: { plugins: [router] }
    })
    
    expect(wrapper.find('h1').text()).toBe('Google Drive Image Feed')
    expect(wrapper.text()).toContain('Auth')
  })

  it('shows folder list and image list when signed in', async () => {
    const wrapper = mount(GoogleDriveImageFeed, {
      global: { plugins: [router] }
    })
    
    // Simulate sign in
    await wrapper.vm.handleSignIn(true)
    
    expect(wrapper.text()).toContain('FolderList')
    expect(wrapper.text()).toContain('ImageList')
  })

  it('handles folder selection', async () => {
    const wrapper = mount(GoogleDriveImageFeed, {
      global: { plugins: [router] }
    })
    
    await wrapper.vm.handleFolderSelect({ folderId: '123', folderName: 'Test Folder' })
    
    expect(wrapper.vm.selectedFolder).toBe('123')
    expect(gapi.client.drive.files.list).toHaveBeenCalled()
  })
})