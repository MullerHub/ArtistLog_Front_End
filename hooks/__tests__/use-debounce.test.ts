import { renderHook, act, waitFor } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce Hook', () => {
  jest.useFakeTimers()

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    // Initial value should be set immediately
    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })

    // Debounced value should not change immediately
    expect(result.current).toBe('initial')

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Now value should be updated
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should cancel previous timeout on value change', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 500 },
      }
    )

    rerender({ value: 'second', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(200)
    })

    // Value should still be 'first' after 200ms
    expect(result.current).toBe('first')

    // Rerender with new value before debounce completes
    rerender({ value: 'third', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Should still be 'first'
    expect(result.current).toBe('first')

    // Wait for new debounce to complete
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Now should be 'third'
    await waitFor(() => {
      expect(result.current).toBe('third')
    })
  })

  it('should handle different delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'test', delay: 300 },
      }
    )

    rerender({ value: 'changed', delay: 300 })
    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(result.current).toBe('changed')
    })

    // Test with longer delay
    rerender({ value: 'longer', delay: 1000 })
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('changed')

    act(() => {
      jest.advanceTimersByTime(500)
    })

    await waitFor(() => {
      expect(result.current).toBe('longer')
    })
  })
})
