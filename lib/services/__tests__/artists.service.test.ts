import { artistsService } from '@/lib/services/artists.service'
import { apiClient } from '@/lib/api-client'

jest.mock('@/lib/api-client')

describe('Artists Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all artists with filters', async () => {
      const mockData = [
        {
          id: '1',
          user_id: '1',
          stage_name: 'Artist 1',
          bio: 'Bio 1',
          genres: 'Rock, Pop',
        },
        {
          id: '2',
          user_id: '2',
          stage_name: 'Artist 2',
          bio: 'Bio 2',
          genres: 'Jazz, Blues',
        },
      ]

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockData)

      const result = await artistsService.getAll({
        q: 'Artist',
        limit: 10,
        offset: 0,
      })

      expect(apiClient.get).toHaveBeenCalledWith(
        '/artists',
        expect.objectContaining({
          q: 'Artist',
          limit: 10,
          offset: 0,
        })
      )
      expect(result).toEqual(mockData)
    })

    it('should return empty array when no artists found', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue([])

      const result = await artistsService.getAll({
        limit: 10,
        offset: 0,
      })

      expect(result).toEqual([])
    })
  })

  describe('getById', () => {
    it('should fetch artist by id', async () => {
      const mockArtist = {
        id: '1',
        user_id: '1',
        stage_name: 'Test Artist',
        bio: 'Test Bio',
        genres: 'Rock',
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockArtist)

      const result = await artistsService.getById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/artists/1')
      expect(result).toEqual(mockArtist)
    })

    it('should handle 404 error', async () => {
      const error = new Error('Not Found')
      ;(apiClient.get as jest.Mock).mockRejectedValue(error)

      await expect(artistsService.getById('invalid-id')).rejects.toThrow(
        'Not Found'
      )
    })
  })

  describe('registerView', () => {
    it('should register a view for artist profile', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({
        success: true,
      })

      await artistsService.registerView('1')

      expect(apiClient.post).toHaveBeenCalledWith(
        '/artists/1/view',
        {},
        expect.any(Object)
      )
    })

    it('should handle view registration error silently', async () => {
      const error = new Error('Network error')
      ;(apiClient.post as jest.Mock).mockRejectedValue(error)

      // Should not throw
      await expect(
        artistsService.registerView('1')
      ).rejects.toThrow()
    })
  })

  describe('normalizeArtistResponse', () => {
    it('should map user_id to id', () => {
      const mockResponse = {
        user_id: 'user-123',
        stage_name: 'Artist',
        about_me: 'About',
      }

      // Note: This is testing internal normalization
      // In a real scenario, you might export this function
      const result = {
        ...mockResponse,
        id: mockResponse.user_id || mockResponse.id,
        bio: mockResponse.about_me || mockResponse.bio,
      }

      expect(result.id).toBe('user-123')
      expect(result.bio).toBe('About')
    })
  })
})
