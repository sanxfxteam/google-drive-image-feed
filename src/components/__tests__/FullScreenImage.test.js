import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FullScreenImage from '../FullScreenImage.vue'

describe('FullScreenImage', () => {
  it('is hidden by default', () => {
    const wrapper = mount(FullScreenImage, {
      props: {
        imageSrc: 'https://example.com/image.jpg'
      }
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('shows image when opened', async () => {
    const wrapper = mount(FullScreenImage, {
      props: {
        imageSrc: 'https://example.com/image.jpg'
      }
    })

    // Access the exposed open method
    wrapper.vm.open()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.fixed').exists()).toBe(true)
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/image.jpg')
  })

  it('hides image when closed', async () => {
    const wrapper = mount(FullScreenImage, {
      props: {
        imageSrc: 'https://example.com/image.jpg'
      }
    })

    // Open first
    wrapper.vm.open()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.fixed').exists()).toBe(true)

    // Then close
    wrapper.vm.close()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('closes when close button is clicked', async () => {
    const wrapper = mount(FullScreenImage, {
      props: {
        imageSrc: 'https://example.com/image.jpg'
      }
    })

    // Open modal
    wrapper.vm.open()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.fixed').exists()).toBe(true)

    // Click close button
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('renders image with correct styling classes', async () => {
    const wrapper = mount(FullScreenImage, {
      props: {
        imageSrc: 'https://example.com/image.jpg'
      }
    })

    wrapper.vm.open()
    await wrapper.vm.$nextTick()

    const modal = wrapper.find('.fixed')
    expect(modal.classes()).toContain('inset-0')
    expect(modal.classes()).toContain('z-50')
    expect(modal.classes()).toContain('bg-black')
    expect(modal.classes()).toContain('bg-opacity-75')

    const image = wrapper.find('img')
    expect(image.classes()).toContain('max-w-full')
    expect(image.classes()).toContain('max-h-full')
  })

  it('exposes open and close methods', () => {
    const wrapper = mount(FullScreenImage, {
      props: {
        imageSrc: 'https://example.com/image.jpg'
      }
    })

    expect(typeof wrapper.vm.open).toBe('function')
    expect(typeof wrapper.vm.close).toBe('function')
  })

  it('updates image source when prop changes', async () => {
    const wrapper = mount(FullScreenImage, {
      props: {
        imageSrc: 'https://example.com/image1.jpg'
      }
    })

    wrapper.vm.open()
    await wrapper.vm.$nextTick()

    // Change image source
    await wrapper.setProps({ imageSrc: 'https://example.com/image2.jpg' })

    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/image2.jpg')
  })
})