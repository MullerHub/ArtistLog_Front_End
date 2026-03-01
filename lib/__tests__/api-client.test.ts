import { apiClient } from '@/lib/api-client'

// Mock fetch globalmente
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('GET requests', () => {
    it('should make a GET request with authentication token', async () => {
      const mockData = { id: '1', name: 'Test' }
      localStorage.setItem('auth_token', 'test-token')

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await apiClient.get('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
      expect(result).toEqual(mockData)
    })

    it('should handle query parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await apiClient.get('/test', { limit: 10, offset: 0 })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      )
    })
  })

  describe('POST requests', () => {
    it('should make a POST request with JSON body', async () => {
      const mockData = { success: true }
      localStorage.setItem('auth_token', 'test-token')

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const payload = { name: 'Test' }
      const result = await apiClient.post('/test', payload)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockData)
    })
  })

  describe('Error handling', () => {
    it('should throw error on failed request', async () => {
      localStorage.setItem('auth_token', 'test-token')

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(apiClient.get('/test')).rejects.toThrow()
    })

    it('should handle 401 Unauthorized', async () => {
      const mockRemoveToken = jest.fn()
      localStorage.setItem('auth_token', 'expired-token')

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

      // Should trigger logout/redirect
      await expect(apiClient.get('/test')).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(apiClient.get('/test')).rejects.toThrow('Network error')
    })
  })

  describe('requestPublic', () => {
    it('should make request without authentication token', async () => {
      const mockData = { data: 'public' }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await apiClient.requestPublic(
        'GET',
        '/public-endpoint'
      )

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/public-endpoint'),
        expect.not.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      )
      expect(result).toEqual(mockData)
    })
  })
})
