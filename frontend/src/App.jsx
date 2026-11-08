import { useEffect, useState, useCallback } from 'react'
import { api } from './api'
import NewTaskForm from './components/NewTaskForm'
import FocusView from './components/FocusView'
import FullListView from './components/FullListView'
import logoUrl from './assets/logo.svg'
import './App.css'

const FOCUS_MODE_STORAGE_KEY = 'deep-shallow:focus-mode'

function readStoredFocusMode() {
  try {
    return window.localStorage.getItem(FOCUS_MODE_STORAGE_KEY) === 'true'
  } catch {
    // localStorage can throw (e.g. disabled/private mode); fall back to OFF
    // rather than crashing the app.
    return false
  }
}

function writeStoredFocusMode(value) {
  try {
    window.localStorage.setItem(FOCUS_MODE_STORAGE_KEY, String(value))
  } catch {
    // Non-fatal: the toggle still works for this session, it just won't
    // survive a reload.
  }
}

export default function App() {
  const [tasks, setTasks] = useState([])
  // Focus Mode is restored from localStorage on load. Without this, reloading
  // the page mid deep-work-block silently dumps you back into the full list
  // with every shallow task visible again — exactly the interruption the
  // product exists to prevent.
  const [focusMode, setFocusMode] = useState(readStoredFocusMode)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const data = await api.listTasks()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleCreate(payload) {
    try {
      await api.createTask(payload)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleToggleDone(task) {
    try {
      await api.updateTask(task.id, { done: !task.done })
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(task) {
    try {
      await api.deleteTask(task.id)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  const deepTasks = tasks.filter((t) => t.category === 'deep')
  const shallowHiddenCount = tasks.filter((t) => t.category === 'shallow' && !t.done).length

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <img src={logoUrl} alt="Deep/Shallow" className="app__logo" />
          <h1>Deep/Shallow</h1>
        </div>
        <label className="focus-toggle">
          <span>Focus Mode</span>
          <input
            type="checkbox"
            checked={focusMode}
            onChange={() =>
              setFocusMode((v) => {
                const next = !v
                writeStoredFocusMode(next)
                return next
              })
            }
            aria-label="Toggle Focus Mode"
          />
        </label>
      </header>

      {error && (
        <div className="app__error" role="alert" data-testid="error-banner">
          <span>Couldn&apos;t reach the server: {error}</span>
          <button type="button" onClick={refresh}>
            Retry
          </button>
        </div>
      )}

      <main className="app__main">
        {loading ? (
          <p data-testid="loading-state">Loading…</p>
        ) : focusMode ? (
          <FocusView
            deepTasks={deepTasks}
            shallowHiddenCount={shallowHiddenCount}
            onToggleDone={handleToggleDone}
            onDelete={handleDelete}
          />
        ) : (
          <FullListView tasks={tasks} onToggleDone={handleToggleDone} onDelete={handleDelete} />
        )}
      </main>

      {!focusMode && (
        <footer className="app__footer">
          <NewTaskForm onCreate={handleCreate} />
        </footer>
      )}
    </div>
  )
}
