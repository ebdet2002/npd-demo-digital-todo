import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import { api } from './api'

vi.mock('./api', () => ({
  api: {
    listTasks: vi.fn(),
    getCounts: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}))

const sampleTasks = [
  { id: 1, title: 'Write chapter 4', description: null, category: 'deep', done: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, title: 'Reply to email', description: null, category: 'shallow', done: false, created_at: '2026-01-01T00:00:01Z' },
  { id: 3, title: 'Submit form', description: null, category: 'shallow', done: false, created_at: '2026-01-01T00:00:02Z' },
]

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
  api.listTasks.mockResolvedValue(sampleTasks)
})

describe('App', () => {
  it('renders the full list grouped by Deep/Shallow when Focus Mode is off', async () => {
    render(<App />)

    await waitFor(() => expect(screen.getByTestId('full-list-view')).toBeInTheDocument())

    expect(screen.getByText('Write chapter 4')).toBeInTheDocument()
    expect(screen.getByText('Reply to email')).toBeInTheDocument()
    expect(screen.getByText('Submit form')).toBeInTheDocument()
  })

  it('hides shallow tasks and shows only the current deep task when Focus Mode is turned on', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(screen.getByTestId('full-list-view')).toBeInTheDocument())

    await user.click(screen.getByLabelText('Toggle Focus Mode'))

    expect(screen.getByTestId('focus-view')).toBeInTheDocument()
    expect(screen.queryByText('Reply to email')).not.toBeInTheDocument()
    expect(screen.queryByText('Submit form')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-deep-task')).toHaveTextContent('Write chapter 4')
  })

  it('shows a count of hidden shallow tasks while Focus Mode is on', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(screen.getByTestId('full-list-view')).toBeInTheDocument())
    await user.click(screen.getByLabelText('Toggle Focus Mode'))

    expect(screen.getByTestId('hidden-shallow-badge')).toHaveTextContent('2 shallow tasks hidden')
  })

  it('shows the empty state in Focus Mode when there are no open deep tasks', async () => {
    api.listTasks.mockResolvedValue([
      { id: 2, title: 'Reply to email', description: null, category: 'shallow', done: false, created_at: '2026-01-01T00:00:01Z' },
    ])
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(screen.getByTestId('full-list-view')).toBeInTheDocument())
    await user.click(screen.getByLabelText('Toggle Focus Mode'))

    expect(screen.getByTestId('focus-empty-state')).toBeInTheDocument()
    expect(screen.getByTestId('hidden-shallow-badge')).toHaveTextContent('1 shallow task hidden')
  })

  it('toggling Focus Mode back off restores the full grouped list', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(screen.getByTestId('full-list-view')).toBeInTheDocument())
    const toggle = screen.getByLabelText('Toggle Focus Mode')

    await user.click(toggle)
    expect(screen.getByTestId('focus-view')).toBeInTheDocument()

    await user.click(toggle)
    expect(screen.getByTestId('full-list-view')).toBeInTheDocument()
    expect(screen.getByText('Reply to email')).toBeInTheDocument()
  })

  it('persists Focus Mode to localStorage and restores it on the next load (v1.1.0)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await waitFor(() => expect(screen.getByTestId('full-list-view')).toBeInTheDocument())
    await user.click(screen.getByLabelText('Toggle Focus Mode'))
    expect(screen.getByTestId('focus-view')).toBeInTheDocument()
    expect(window.localStorage.getItem('deep-shallow:focus-mode')).toBe('true')

    // Simulate a page reload: unmount and remount a fresh App instance.
    unmount()
    render(<App />)

    // Even before the task list has finished loading again, Focus Mode
    // should already be restored from localStorage rather than defaulting
    // back to the full list.
    await waitFor(() => expect(screen.getByTestId('focus-view')).toBeInTheDocument())
    expect(screen.queryByTestId('full-list-view')).not.toBeInTheDocument()
  })

  it('does not restore Focus Mode when it was never turned on', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('full-list-view')).toBeInTheDocument())
  })

  it('shows an error banner with retry when the API call fails', async () => {
    api.listTasks.mockRejectedValueOnce(new Error('network down'))
    render(<App />)

    await waitFor(() => expect(screen.getByTestId('error-banner')).toBeInTheDocument())
    expect(screen.getByTestId('error-banner')).toHaveTextContent('network down')
  })
})
