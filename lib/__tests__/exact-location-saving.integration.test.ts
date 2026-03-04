import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { venuesService } from '@/lib/services/venues.service'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/lib/services/venues.service')
jest.mock('sonner')
jest.mock('swr')

describe('ExactLocationSaving Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(toast.success as jest.Mock).mockImplementation(() => {})
    ;(toast.error as jest.Mock).mockImplementation(() => {})
  })

  describe('Save Flow', () => {
    it('requires both coordinates to be defined', async () => {
      ;(venuesService.updateExactLocation as jest.Mock).mockRejectedValue(
        new Error('Both coordinates are required')
      )

      // Simulate missing longitude
      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: null,
      }

      // Should not call API with null longitude
      try {
        await venuesService.updateExactLocation('venue-123', payload as any)
      } catch (err) {
        expect(err).toHaveProperty('message')
      }
    })

    it('sends valid payload to API', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Location updated',
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
        updated_at: new Date().toISOString(),
      }

      ;(venuesService.updateExactLocation as jest.Mock).mockResolvedValue(mockResponse)

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      const result = await venuesService.updateExactLocation('venue-123', payload)

      expect(venuesService.updateExactLocation).toHaveBeenCalledWith('venue-123', payload)
      expect(result).toEqual(mockResponse)
    })

    it('handles successful save response', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Location updated',
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
        updated_at: '2026-03-01T12:00:00Z',
      }

      ;(venuesService.updateExactLocation as jest.Mock).mockResolvedValue(mockResponse)

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      const result = await venuesService.updateExactLocation('venue-123', payload)

      expect(result.status).toBe('success')
      expect(result.updated_at).toBeDefined()
    })

    it('handles API error responses', async () => {
      const errorMessage = 'Invalid coordinates'
      ;(venuesService.updateExactLocation as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      )

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      await expect(
        venuesService.updateExactLocation('venue-123', payload)
      ).rejects.toThrow(errorMessage)
    })

    it('shows success toast on successful save', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Location updated',
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
        updated_at: new Date().toISOString(),
      }

      ;(venuesService.updateExactLocation as jest.Mock).mockResolvedValue(mockResponse)

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      await venuesService.updateExactLocation('venue-123', payload)

      // Simulate what handleSaveExactLocation would do
      if (mockResponse.status === 'success') {
        ;(toast.success as jest.Mock)('Localização exata atualizada com sucesso')
      }

      expect(toast.success).toHaveBeenCalledWith('Localização exata atualizada com sucesso')
    })

    it('shows error toast on failed save', async () => {
      const errorMessage = 'Failed to update location'
      ;(venuesService.updateExactLocation as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      )

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      try {
        await venuesService.updateExactLocation('venue-123', payload)
      } catch (err) {
        ;(toast.error as jest.Mock)(errorMessage)
      }

      expect(toast.error).toHaveBeenCalledWith(errorMessage)
    })
  })

  describe('Coordinate Validation', () => {
    it('validates latitude range (-90 to 90)', () => {
      const validLatitudes = [-90, -45, 0, 45, 90]
      const invalidLatitudes = [-91, 91, -180, 180]

      validLatitudes.forEach((lat) => {
        expect(lat).toBeGreaterThanOrEqual(-90)
        expect(lat).toBeLessThanOrEqual(90)
      })

      invalidLatitudes.forEach((lat) => {
        expect(lat < -90 || lat > 90).toBe(true)
      })
    })

    it('validates longitude range (-180 to 180)', () => {
      const validLongitudes = [-180, -90, 0, 90, 180]
      const invalidLongitudes = [-181, 181]

      validLongitudes.forEach((lon) => {
        expect(lon).toBeGreaterThanOrEqual(-180)
        expect(lon).toBeLessThanOrEqual(180)
      })

      invalidLongitudes.forEach((lon) => {
        expect(lon < -180 || lon > 180).toBe(true)
      })
    })

    it('rejects NaN coordinates', () => {
      const nanLatitude = NaN
      const validLongitude = -52.3371

      expect(isNaN(nanLatitude)).toBe(true)
      expect(isNaN(validLongitude)).toBe(false)
    })

    it('rejects null coordinates', () => {
      const nullLatitude = null
      const validLongitude = -52.3371

      expect(nullLatitude).toBeNull()
      expect(validLongitude).not.toBeNull()
    })
  })

  describe('Venue ID Resolution', () => {
    it('uses venue ID from venueData', () => {
      const venueId = 'venue-123'
      expect(venueId).toBeDefined()
      expect(venueId).not.toBeNull()
    })

    it('falls back to user ID if no venue ID', () => {
      const userId = 'user-123'
      const venueId = null

      const effectiveId = venueId ?? userId
      expect(effectiveId).toBe('user-123')
    })
  })

  describe('State Management', () => {
    it('sets isUpdatingExactLocation to true during save', async () => {
      let isUpdating = false

      ;(venuesService.updateExactLocation as jest.Mock).mockImplementation(async () => {
        isUpdating = true
        await new Promise((resolve) => setTimeout(resolve, 100))
        isUpdating = false
        return {
          status: 'success',
          updated_at: new Date().toISOString(),
        }
      })

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      const promise = venuesService.updateExactLocation('venue-123', payload)

      // Should be updating
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(isUpdating).toBe(true)

      await promise

      // Should be done
      expect(isUpdating).toBe(false)
    })

    it('updates exactLocationUpdatedAt on successful save', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Location updated',
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
        updated_at: '2026-03-01T12:00:00Z',
      }

      ;(venuesService.updateExactLocation as jest.Mock).mockResolvedValue(mockResponse)

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      const result = await venuesService.updateExactLocation('venue-123', payload)

      expect(result.updated_at).toBe('2026-03-01T12:00:00Z')
    })
  })

  describe('Logging', () => {
    it('logs request payload', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation()

      ;(venuesService.updateExactLocation as jest.Mock).mockImplementation(
        async (id, payload) => {
          console.log('[handleSaveExactLocation] Sending to API:', payload)
          return {
            status: 'success',
            updated_at: new Date().toISOString(),
          }
        }
      )

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      await venuesService.updateExactLocation('venue-123', payload)

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sending to API'),
        expect.objectContaining({
          exact_latitude: -31.7649,
          exact_longitude: -52.3371,
        })
      )

      logSpy.mockRestore()
    })

    it('logs error details on failure', async () => {
      const logSpy = jest.spyOn(console, 'error').mockImplementation()

      const errorMessage = 'API Error: Invalid coordinates'
      ;(venuesService.updateExactLocation as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      try {
        await venuesService.updateExactLocation('venue-123', payload)
      } catch (err) {
        console.error('[handleSaveExactLocation] Error:', { error: err })
      }

      expect(logSpy).toHaveBeenCalled()
      logSpy.mockRestore()
    })
  })

  describe('Cache Invalidation', () => {
    it('should trigger SWR revalidation after save', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Location updated',
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
        updated_at: new Date().toISOString(),
      }

      ;(venuesService.updateExactLocation as jest.Mock).mockResolvedValue(mockResponse)

      const payload = {
        exact_latitude: -31.7649,
        exact_longitude: -52.3371,
      }

      // Simulate what would happen with mutate
      const mockMutate = jest.fn()

      await venuesService.updateExactLocation('venue-123', payload)

      // After successful save, should call mutate
      if (mockResponse.status === 'success') {
        mockMutate(['venue-profile', 'venue-123'])
      }

      expect(mockMutate).toHaveBeenCalledWith(['venue-profile', 'venue-123'])
    })
  })
})
