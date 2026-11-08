import { useEffect, useState, useCallback } from 'react'
import { api } from './api'
import NewTaskForm from './components/NewTaskForm'
import FocusView from './components/FocusView'
import FullListView from './components/FullListView'
import logoUrl from './assets/logo.svg'
import './App.css'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [focusMode, setFocusMode] = useState(false)
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
            onChange={() => setFocusMode((v) => !v)}
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
