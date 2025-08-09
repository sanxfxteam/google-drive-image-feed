import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FolderList from '../FolderList.vue'

describe('FolderList', () => {
  const mockFolders = [
    { id: '1', name: 'Folder 1' },
    { id: '2', name: 'Folder 2' },
    { id: '3', name: 'Folder 3' }
  ]

  it('renders folder list correctly', () => {
    const wrapper = mount(FolderList, {
      props: {
        folders: mockFolders,
        selectedFolder: null
      }
    })

    expect(wrapper.find('h2').text()).toBe('Subfolders')
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.text()).toContain('Folder 1')
    expect(wrapper.text()).toContain('Folder 2')
    expect(wrapper.text()).toContain('Folder 3')
  })

  it('highlights selected folder', () => {
    const wrapper = mount(FolderList, {
      props: {
        folders: mockFolders,
        selectedFolder: '2'
      }
    })

    const links = wrapper.findAll('a')
    expect(links[0].classes()).not.toContain('active')
    expect(links[1].classes()).toContain('active')
    expect(links[2].classes()).not.toContain('active')
  })

  it('emits select-folder event when folder is clicked', async () => {
    const wrapper = mount(FolderList, {
      props: {
        folders: mockFolders,
        selectedFolder: null
      }
    })

    await wrapper.findAll('a')[1].trigger('click')

    expect(wrapper.emitted('select-folder')).toBeTruthy()
    expect(wrapper.emitted('select-folder')[0]).toEqual([{
      folderId: '2',
      folderName: 'Folder 2'
    }])
  })

  it('renders empty list when no folders provided', () => {
    const wrapper = mount(FolderList, {
      props: {
        folders: [],
        selectedFolder: null
      }
    })

    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.find('h2').text()).toBe('Subfolders')
  })
})