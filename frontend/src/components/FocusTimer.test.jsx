import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import FocusTimer from './FocusTimer'

const TIMER_MINUTES_STORAGE_KEY = 'deep-shallow:timer-minutes'

const time = () => screen.getByTestId('focus-timer-time').textContent

beforeEach(() => {
  window.localStorage.clear()
})

describe('FocusTimer', () => {
  it('defaults to a 25-minute block when nothing is stored', () => {
    render(<FocusTimer taskKey={1} />)
    expect(time()).toBe('25:00')
    expect(screen.getByRole('button', { name: '25 min' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches to a preset and remembers it', async () => {
    const user = userEvent.setup()
    render(<FocusTimer taskKey={1} />)

    await user.click(screen.getByRole('button', { name: '50 min' }))

    expect(time()).toBe('50:00')
    expect(window.localStorage.getItem(TIMER_MINUTES_STORAGE_KEY)).toBe('50')
  })

  it('hides the custom input until Custom is chosen, then applies a typed value', async () => {
    const user = userEvent.setup()
    render(<FocusTimer taskKey={1} />)

    expect(screen.queryByLabelText('Custom minutes')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Custom' }))
    await user.type(screen.getByLabelText('Custom minutes'), '40')
    await user.click(screen.getByRole('button', { name: 'Set' }))

    expect(time()).toBe('40:00')
    expect(window.localStorage.getItem(TIMER_MINUTES_STORAGE_KEY)).toBe('40')
  })

  it('restores a stored custom value with Custom selected', () => {
    window.localStorage.setItem(TIMER_MINUTES_STORAGE_KEY, '40')
    render(<FocusTimer taskKey={1} />)

    expect(time()).toBe('40:00')
    expect(screen.getByRole('button', { name: 'Custom' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Custom minutes')).toHaveValue(40)
  })

  it('restores a stored preset on remount (simulating a reload)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<FocusTimer taskKey={1} />)
    await user.click(screen.getByRole('button', { name: '90 min' }))
    unmount()

    render(<FocusTimer taskKey={1} />)
    expect(time()).toBe('90:00')
  })

  it('resets to the chosen length, not 25, when the task changes', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<FocusTimer taskKey={1} />)
    await user.click(screen.getByRole('button', { name: '15 min' }))

    rerender(<FocusTimer taskKey={2} />)
    expect(time()).toBe('15:00')
  })

  it('keeps Set disabled for out-of-range custom values', async () => {
    const user = userEvent.setup()
    render(<FocusTimer taskKey={1} />)
    await user.click(screen.getByRole('button', { name: 'Custom' }))
    const input = screen.getByLabelText('Custom minutes')
    const set = screen.getByRole('button', { name: 'Set' })

    expect(set).toBeDisabled()
    await user.type(input, '0')
    expect(set).toBeDisabled()
    await user.clear(input)
    await user.type(input, '500')
    expect(set).toBeDisabled()
    expect(time()).toBe('25:00')
  })

  it('ignores a corrupt stored value', () => {
    window.localStorage.setItem(TIMER_MINUTES_STORAGE_KEY, 'banana')
    render(<FocusTimer taskKey={1} />)
    expect(time()).toBe('25:00')
  })
})
