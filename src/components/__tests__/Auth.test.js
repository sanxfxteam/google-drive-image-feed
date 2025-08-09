import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Auth from '../Auth.vue'

// Create the signIn spy first so we can reference it
const signInSpy = vi.fn()

// Mock gapi
global.gapi = {
  load: vi.fn((modules, callback) => callback()),
  client: { init: vi.fn() },
  auth2: {
    getAuthInstance: vi.fn(() => ({
      isSignedIn: { get: vi.fn(() => false), listen: vi.fn() },
      signIn: signInSpy
    }))
  }
}

vi.mock('gapi-script', () => ({ loadGapiInsideDOM: vi.fn() }))

describe('Auth', () => {
  it('renders sign in button', () => {
    const wrapper = mount(Auth)
    expect(wrapper.find('button').text()).toBe('Sign In with Google')
  })

  it('calls signIn when clicked', async () => {
    const wrapper = mount(Auth)
    
    await wrapper.find('button').trigger('click')
    expect(signInSpy).toHaveBeenCalled()
  })

  it('emits signed-in event when user is already signed in', async () => {
    // Mock user as already signed in
    global.gapi.auth2.getAuthInstance = vi.fn(() => ({
      isSignedIn: { get: vi.fn(() => true), listen: vi.fn() },
      signIn: signInSpy
    }))
    
    const wrapper = mount(Auth)
    // Wait for the component to initialize
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(wrapper.emitted('signed-in')).toBeTruthy()
    expect(wrapper.emitted('signed-in')[0]).toEqual([true])
  })
})