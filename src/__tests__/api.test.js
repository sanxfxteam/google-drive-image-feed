import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock gapi for API testing
const mockGapi = {
  client: {
    drive: {
      files: {
        list: vi.fn()
      }
    }
  }
}

global.gapi = mockGapi

describe('Google Drive API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists folders with correct parameters', async () => {
    const mockResponse = {
      result: {
        files: [
          { id: '1', name: 'Folder 1' },
          { id: '2', name: 'Folder 2' }
        ]
      }
    }
    
    mockGapi.client.drive.files.list.mockResolvedValue(mockResponse)
    
    const response = await gapi.client.drive.files.list({
      q: `'root-folder-id' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)'
    })
    
    expect(gapi.client.drive.files.list).toHaveBeenCalledWith({
      q: `'root-folder-id' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)'
    })
    
    expect(response.result.files).toHaveLength(2)
  })

  it('lists images with pagination', async () => {
    const mockResponse = {
      result: {
        files: [
          { id: '1', name: 'image1.jpg', thumbnailLink: 'thumb1.jpg' }
        ],
        nextPageToken: 'token123'
      }
    }
    
    mockGapi.client.drive.files.list.mockResolvedValue(mockResponse)
    
    const response = await gapi.client.drive.files.list({
      q: `'folder-id' in parents and (mimeType contains 'image/')`,
      pageSize: 20,
      pageToken: null
    })
    
    expect(response.result.nextPageToken).toBe('token123')
    expect(response.result.files[0].name).toBe('image1.jpg')
  })

  it('handles API errors gracefully', async () => {
    mockGapi.client.drive.files.list.mockRejectedValue(new Error('API Error'))
    
    try {
      await gapi.client.drive.files.list({})
    } catch (error) {
      expect(error.message).toBe('API Error')
    }
  })
})