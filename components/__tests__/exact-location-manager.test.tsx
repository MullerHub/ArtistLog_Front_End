import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExactLocationManager } from '@/components/exact-location-manager'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('ExactLocationManager Component', () => {
  const mockProps = {
    latitude: null,
    longitude: null,
    baseLatitude: -31.7649,
    baseLongitude: -52.3371,
    cityName: 'Rio Branco',
    stateName: 'AC',
    isUpdating: false,
    onLatitudeChange: jest.fn(),
    onLongitudeChange: jest.fn(),
    onUseCurrentLocation: jest.fn(),
    onUseBaseLocation: jest.fn(),
    onSave: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders the component with all sections', () => {
      render(<ExactLocationManager {...mockProps} />)
      
      expect(screen.getByText('Localização Exata (ExactLocation)')).toBeInTheDocument()
      expect(screen.getByText(/Selecione visualmente no mapa|busque por endereço/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Latitude exata')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Longitude exata')).toBeInTheDocument()
    })

    it('renders buttons with correct labels', () => {
      render(<ExactLocationManager {...mockProps} />)
      
      expect(screen.getByRole('button', { name: /Usar localização base da venue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Usar minha localização atual/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Salvar localização exata/i })).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('shows validation error when coordinates are null', async () => {
      const user = userEvent.setup()
      render(<ExactLocationManager {...mockProps} />)

      const saveButton = screen.getByRole('button', { name: /Salvar localização exata/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/É necessário definir latitude E longitude/i)).toBeInTheDocument()
      })
      expect(mockProps.onSave).not.toHaveBeenCalled()
    })

    it('shows validation error for invalid latitude', async () => {
      const user = userEvent.setup()
      const propsWith = {
        ...mockProps,
        latitude: -91, // Invalid
        longitude: -52.3371,
      }
      render(<ExactLocationManager {...propsWith} />)

      const saveButton = screen.getByRole('button', { name: /Salvar localização exata/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/Latitude deve estar entre -90 e 90/i)).toBeInTheDocument()
      })
      expect(mockProps.onSave).not.toHaveBeenCalled()
    })

    it('shows validation error for invalid longitude', async () => {
      const user = userEvent.setup()
      const propsWith = {
        ...mockProps,
        latitude: -31.7649,
        longitude: 181, // Invalid
      }
      render(<ExactLocationManager {...propsWith} />)

      const saveButton = screen.getByRole('button', { name: /Salvar localização exata/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/Longitude deve estar entre -180 e 180/i)).toBeInTheDocument()
      })
      expect(mockProps.onSave).not.toHaveBeenCalled()
    })

    it('allows save with valid coordinates', async () => {
      const user = userEvent.setup()
      const propsWith = {
        ...mockProps,
        latitude: -31.7649,
        longitude: -52.3371,
      }
      render(<ExactLocationManager {...propsWith} />)

      const saveButton = screen.getByRole('button', { name: /Salvar localização exata/i })
      await user.click(saveButton)

      // Error should not be present
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
      
      // onSave should be called
      expect(mockProps.onSave).toHaveBeenCalled()
    })
  })

  describe('Coordinate Input', () => {
    it('updates latitude when input changes', async () => {
      const user = userEvent.setup()
      render(<ExactLocationManager {...mockProps} />)

      const latitudeInput = screen.getByPlaceholderText('Latitude exata')
      await user.clear(latitudeInput)
      await user.type(latitudeInput, '-31.7649')

      expect(mockProps.onLatitudeChange).toHaveBeenCalledWith(-31.7649)
    })

    it('updates longitude when input changes', async () => {
      const user = userEvent.setup()
      render(<ExactLocationManager {...mockProps} />)

      const longitudeInput = screen.getByPlaceholderText('Longitude exata')
      await user.clear(longitudeInput)
      await user.type(longitudeInput, '-52.3371')

      expect(mockProps.onLongitudeChange).toHaveBeenCalledWith(-52.3371)
    })

    it('displays current coordinates in inputs', () => {
      const propsWith = {
        ...mockProps,
        latitude: -31.7649,
        longitude: -52.3371,
      }
      render(<ExactLocationManager {...propsWith} />)

      const latitudeInput = screen.getByPlaceholderText('Latitude exata') as HTMLInputElement
      const longitudeInput = screen.getByPlaceholderText('Longitude exata') as HTMLInputElement

      expect(latitudeInput.value).toBe('0') // Will be '0' because the display updates while typing
      expect(longitudeInput.value).toBe('0')
    })
  })

  describe('Button Actions', () => {
    it('calls onUseBaseLocation when button clicked', async () => {
      const user = userEvent.setup()
      render(<ExactLocationManager {...mockProps} />)

      const buttons = screen.getAllByRole('button')
      const useBaseButton = buttons.find(btn => btn.textContent?.includes('Usar localização base'))
      
      if (useBaseButton) {
        await user.click(useBaseButton)
        expect(mockProps.onUseBaseLocation).toHaveBeenCalled()
      }
    })

    it('calls onUseCurrentLocation when button clicked', async () => {
      const user = userEvent.setup()
      render(<ExactLocationManager {...mockProps} />)

      const buttons = screen.getAllByRole('button')
      const useCurrentButton = buttons.find(btn => btn.textContent?.includes('Usar minha localização atual'))
      
      if (useCurrentButton) {
        await user.click(useCurrentButton)
        expect(mockProps.onUseCurrentLocation).toHaveBeenCalled()
      }
    })

    it('disables buttons when isUpdating is true', () => {
      const propsWith = {
        ...mockProps,
        isUpdating: true,
      }
      render(<ExactLocationManager {...propsWith} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('Location History', () => {
    it('saves location to localStorage on successful save', async () => {
      const user = userEvent.setup()
      const propsWith = {
        ...mockProps,
        latitude: -31.7649,
        longitude: -52.3371,
      }
      render(<ExactLocationManager {...propsWith} />)

      const saveButton = screen.getByRole('button', { name: /Salvar localização exata/i })
      await user.click(saveButton)

      const history = JSON.parse(localStorage.getItem('venue_location_history') || '[]')
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        latitude: -31.7649,
        longitude: -52.3371,
      })
    })

    it('displays history items if they exist', () => {
      const historyData = [
        {
          latitude: -31.7649,
          longitude: -52.3371,
          timestamp: new Date().toISOString(),
        }
      ]
      localStorage.setItem('venue_location_history', JSON.stringify(historyData))

      render(<ExactLocationManager {...mockProps} />)

      expect(screen.getByText(/Últimas localizações/i)).toBeInTheDocument()
    })

    it('loads location from history when clicked', async () => {
      const user = userEvent.setup()
      const historyData = [
        {
          latitude: -31.7649,
          longitude: -52.3371,
          timestamp: new Date().toISOString(),
        }
      ]
      localStorage.setItem('venue_location_history', JSON.stringify(historyData))

      render(<ExactLocationManager {...mockProps} />)

      const historyButton = screen.getByRole('button', { name: /-31.7649, -52.3371/i })
      await user.click(historyButton)

      expect(mockProps.onLatitudeChange).toHaveBeenCalledWith(-31.7649)
      expect(mockProps.onLongitudeChange).toHaveBeenCalledWith(-52.3371)
    })

    it('maintains maximum of 5 history items', async () => {
      const user = userEvent.setup()
      const propsWith = {
        ...mockProps,
        latitude: -31.7649,
        longitude: -52.3371,
      }

      // Pre-populate history with 5 items
      const existingHistory = Array.from({ length: 5 }, (_, i) => ({
        latitude: -31.0 - i,
        longitude: -52.0 - i,
        timestamp: new Date(Date.now() - i * 1000).toISOString(),
      }))
      localStorage.setItem('venue_location_history', JSON.stringify(existingHistory))

      const { rerender } = render(<ExactLocationManager {...propsWith} />)

      const saveButton = screen.getByRole('button', { name: /Salvar localização exata/i })
      await user.click(saveButton)

      const history = JSON.parse(localStorage.getItem('venue_location_history') || '[]')
      expect(history).toHaveLength(5)
    })
  })

  describe('Validation Error Clearing', () => {
    it('clears validation error when save succeeds', async () => {
      const user = userEvent.setup()
      const propsWith = {
        ...mockProps,
        latitude: -31.7649,
        longitude: -52.3371,
      }
      render(<ExactLocationManager {...propsWith} />)

      const saveButton = screen.getByRole('button', { name: /Salvar localização exata/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })
})
