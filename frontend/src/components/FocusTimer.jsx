import { useEffect, useState } from 'react'

const DEFAULT_SECONDS = 25 * 60 // 25-minute protected block

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * A simple countdown timer for the current deep task in Focus Mode.
 * Resets whenever the task it's attached to changes (so switching tasks
 * doesn't carry over a stale countdown).
 */
export default function FocusTimer({ taskKey }) {
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    setSecondsLeft(DEFAULT_SECONDS)
    setRunning(true)
  }, [taskKey])

  useEffect(() => {
    if (!running || secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [running, secondsLeft])

  const done = secondsLeft <= 0

  return (
    <div className="focus-timer" data-testid="focus-timer">
      <span className="focus-timer__time">{formatTime(secondsLeft)}</span>
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        disabled={done}
        className="focus-timer__toggle"
      >
        {done ? 'Block complete' : running ? 'Pause' : 'Resume'}
      </button>
    </div>
  )
}
