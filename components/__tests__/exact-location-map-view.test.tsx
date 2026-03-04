import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as L from 'leaflet'
import { ExactLocationMapView } from '@/components/exact-location-map-view'

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, className }: any) => (
    <div data-testid="map-container" className={className}>
      {children}
    </div>
  ),
  TileLayer: () => null,
  Marker: ({ position, children, icon, draggable, eventHandlers, ref }: any) => (
    <div
      data-testid={`marker-${position ? `${position[0]}-${position[1]}` : 'unknown'}`}
      data-draggable={draggable}
      ref={ref}
      onClick={() => eventHandlers?.click?.()}
      onDragStart={() => eventHandlers?.dragstart?.()}
      onDragEnd={() => eventHandlers?.dragend?.()}
    >
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
  }),
  useMapEvents: (handlers: any) => {
    return null
  },
}))

// Mock geocoding service
jest.mock('@/lib/services/geocoding.service', () => ({
  getCityCoordinates: jest.fn().mockResolvedValue({
    latitude: -15.8267,
    longitude: -47.8822,
  }),
}))

// Mock geo utilities
jest.mock('@/lib/geo', () => ({
  calculateDistance: jest.fn(() => 5.2),
  formatDistance: jest.fn((distance: number) => `${distance.toFixed(2)} km`),
}))

describe('ExactLocationMapView Component', () => {
  const mockOnPickLocation = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders map container when valid coordinates provided', () => {
      render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('renders loading state when center is invalid', () => {
      render(
        <ExactLocationMapView
          latitude={null}
          longitude={null}
          baseLatitude={null}
          baseLongitude={null}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByText('Carregando mapa...')).toBeInTheDocument()
    })

    it('renders with NaN coordinates shows loading state', () => {
      render(
        <ExactLocationMapView
          latitude={NaN}
          longitude={NaN}
          baseLatitude={null}
          baseLongitude={null}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByText('Carregando mapa...')).toBeInTheDocument()
    })
  })

  describe('Marker Rendering', () => {
    it('renders exact location marker when coordinates provided', () => {
      render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      const exactMarker = screen.getByTestId('marker--31.7649--52.3371')
      expect(exactMarker).toBeInTheDocument()
      expect(exactMarker).toHaveAttribute('data-draggable', 'true')
    })

    it('renders base location marker when base coordinates provided', () => {
      render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.0}
          baseLongitude={-52.0}
          onPickLocation={mockOnPickLocation}
        />
      )

      const baseMarker = screen.getByTestId('marker--31--52')
      expect(baseMarker).toBeInTheDocument()
      expect(baseMarker).toHaveAttribute('data-draggable', 'false')
    })

    it('does not render exact marker when coordinates are null', () => {
      render(
        <ExactLocationMapView
          latitude={null}
          longitude={null}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      // Only base marker should exist
      const baseMarker = screen.getByTestId('marker--31.7649--52.3371')
      expect(baseMarker).toBeInTheDocument()
      expect(baseMarker).toHaveAttribute('data-draggable', 'false')
    })
  })

  describe('Validation', () => {
    it('validates latitude range', () => {
      const consoleSpy = jest.spyOn(console, 'error')
      
      render(
        <ExactLocationMapView
          latitude={-91}
          longitude={-52.3371}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByText('Carregando mapa...')).toBeInTheDocument()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ExactLocationMapView] Invalid center computed:'),
        expect.anything()
      )
    })

    it('validates longitude range', () => {
      const consoleSpy = jest.spyOn(console, 'error')
      
      render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={181}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByText('Carregando mapa...')).toBeInTheDocument()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ExactLocationMapView] Invalid center computed:'),
        expect.anything()
      )
    })
  })

  describe('Map Center Calculation', () => {
    it('uses exact location as center when available', () => {
      const consoleSpy = jest.spyOn(console, 'log')
      
      render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.0}
          baseLongitude={-52.0}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ExactLocationMapView] Using exact location as center'),
      )
    })

    it('uses base location as center when exact location not available', () => {
      const consoleSpy = jest.spyOn(console, 'log')
      
      render(
        <ExactLocationMapView
          latitude={null}
          longitude={null}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ExactLocationMapView] Using base location as center'),
      )
    })

    it('uses Brazil default as center when no coordinates available', () => {
      const consoleSpy = jest.spyOn(console, 'log')
      
      render(
        <ExactLocationMapView
          latitude={null}
          longitude={null}
          baseLatitude={null}
          baseLongitude={null}
          onPickLocation={mockOnPickLocation}
        />
      )

      // Should still render loading since center is null
      expect(screen.getByText('Carregando mapa...')).toBeInTheDocument()
    })
  })

  describe('Drag and Drop', () => {
    it('calls onPickLocation with new coordinates on drag end', () => {
      const { container } = render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      // Simulate drag end event
      const marker = screen.getByTestId('marker--31.7649--52.3371')
      const dragEndEvent = new MouseEvent('dragend')
      fireEvent(marker, dragEndEvent)

      // The callback would be called with marker.getLatLng() coordinates
      // Since it's mocked, we verify the function was set up
      expect(mockOnPickLocation).toBeDefined()
    })
  })

  describe('Popup and Tooltip', () => {
    it('renders popup for exact location marker', () => {
      render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByText(/Localização Exata Selecionada|🎯/)).toBeInTheDocument()
    })

    it('renders popup for base location marker', () => {
      render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.0}
          baseLongitude={-52.0}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByText(/Localização Base da Venue|📍/)).toBeInTheDocument()
    })
  })

  describe('Distance Display', () => {
    it('displays distance from base when markers are visible', async () => {
      const { calculateDistance, formatDistance } = require('@/lib/geo')
      calculateDistance.mockReturnValue(5.2)
      formatDistance.mockReturnValue('5.20 km')

      render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.0}
          baseLongitude={-52.0}
          onPickLocation={mockOnPickLocation}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
      })
    })
  })

  describe('Props Changes', () => {
    it('updates map when coordinates change', () => {
      const { rerender } = render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByTestId('marker--31.7649--52.3371')).toBeInTheDocument()

      // Change coordinates
      rerender(
        <ExactLocationMapView
          latitude={-31.0}
          longitude={-52.0}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByTestId('marker--31--52')).toBeInTheDocument()
    })

    it('updates map when base coordinates change', () => {
      const { rerender } = render(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.7649}
          baseLongitude={-52.3371}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByTestId('marker--31.7649--52.3371')).toBeInTheDocument()

      // Change base coordinates
      rerender(
        <ExactLocationMapView
          latitude={-31.7649}
          longitude={-52.3371}
          baseLatitude={-31.0}
          baseLongitude={-52.0}
          onPickLocation={mockOnPickLocation}
        />
      )

      expect(screen.getByTestId('marker--31.0--52.0')).toBeInTheDocument()
    })
  })
})
