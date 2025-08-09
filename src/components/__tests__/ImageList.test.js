import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageList from '../ImageList.vue'

describe('ImageList', () => {
  const mockImages = [
    {
      id: '1',
      name: 'Image1.jpg',
      thumbnailLink: 'https://example.com/thumb1.jpg',
      webViewLink: 'https://drive.google.com/file/d/1/view',
      highResLink: 'https://example.com/image1.jpg'
    },
    {
      id: '2',
      name: 'Image2.png',
      thumbnailLink: 'https://example.com/thumb2.jpg',
      webViewLink: 'https://drive.google.com/file/d/2/view',
      highResLink: 'https://example.com/image2.png'
    }
  ]

  it('renders images correctly', () => {
    const wrapper = mount(ImageList, {
      props: {
        images: mockImages,
        loading: false,
        error: null
      }
    })

    expect(wrapper.find('h2').text()).toBe('Images')
    expect(wrapper.findAll('.card')).toHaveLength(2)
    expect(wrapper.text()).toContain('Image1.jpg')
    expect(wrapper.text()).toContain('Image2.png')
  })

  it('displays loading spinner when loading', () => {
    const wrapper = mount(ImageList, {
      props: {
        images: [],
        loading: true,
        error: null
      }
    })

    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.findAll('.card')).toHaveLength(0)
  })

  it('displays error message when error occurs', () => {
    const wrapper = mount(ImageList, {
      props: {
        images: [],
        loading: false,
        error: 'Failed to load images'
      }
    })

    expect(wrapper.find('.alert-error').text()).toBe('Failed to load images')
    expect(wrapper.findAll('.card')).toHaveLength(0)
  })

  it('displays no images message when list is empty', () => {
    const wrapper = mount(ImageList, {
      props: {
        images: [],
        loading: false,
        error: null
      }
    })

    expect(wrapper.find('.alert-info').text()).toBe('No images found in this folder.')
  })

  it('emits open-full-screen event when image is clicked', async () => {
    const wrapper = mount(ImageList, {
      props: {
        images: mockImages,
        loading: false,
        error: null
      }
    })

    await wrapper.find('img').trigger('click')

    expect(wrapper.emitted('open-full-screen')).toBeTruthy()
    expect(wrapper.emitted('open-full-screen')[0]).toEqual(['https://example.com/image1.jpg'])
  })

  it('renders image thumbnails with correct src and alt', () => {
    const wrapper = mount(ImageList, {
      props: {
        images: mockImages,
        loading: false,
        error: null
      }
    })

    const images = wrapper.findAll('img')
    expect(images[0].attributes('src')).toBe('https://example.com/thumb1.jpg')
    expect(images[0].attributes('alt')).toBe('Image1.jpg')
    expect(images[1].attributes('src')).toBe('https://example.com/thumb2.jpg')
    expect(images[1].attributes('alt')).toBe('Image2.png')
  })

  it('renders view links correctly', () => {
    const wrapper = mount(ImageList, {
      props: {
        images: mockImages,
        loading: false,
        error: null
      }
    })

    const links = wrapper.findAll('a[target="_blank"]')
    expect(links[0].attributes('href')).toBe('https://drive.google.com/file/d/1/view')
    expect(links[1].attributes('href')).toBe('https://drive.google.com/file/d/2/view')
  })

  it('shows loading spinner during pagination', () => {
    const wrapper = mount(ImageList, {
      props: {
        images: mockImages,
        loading: true,
        error: null
      }
    })

    const spinners = wrapper.findAll('.loading-spinner')
    expect(spinners).toHaveLength(2) // One for pagination loading
  })
})