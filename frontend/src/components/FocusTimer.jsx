import { useEffect, useState } from 'react'

const PRESET_MINUTES = [15, 25, 50, 90]
const DEFAULT_MINUTES = 25 // classic protected block
const MIN_MINUTES = 1
const MAX_MINUTES = 180
const TIMER_MINUTES_STORAGE_KEY = 'deep-shallow:timer-minutes'

function isValidMinutes(value) {
  return Number.isInteger(value) && value >= MIN_MINUTES && value <= MAX_MINUTES
}

function readStoredMinutes() {
  try {
    const stored = Number(window.localStorage.getItem(TIMER_MINUTES_STORAGE_KEY))
    return isValidMinutes(stored) ? stored : DEFAULT_MINUTES
  } catch {
    // localStorage can throw (e.g. disabled/private mode); fall back to the
    // default block length rather than crashing.
    return DEFAULT_MINUTES
  }
}

function writeStoredMinutes(value) {
  try {
    window.localStorage.setItem(TIMER_MINUTES_STORAGE_KEY, String(value))
  } catch {
    // Non-fatal: the chosen length still applies this session.
  }
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * A countdown timer for the current deep task in Focus Mode. The block
 * length is chosen from presets or a custom value and remembered across
 * reloads. Resets whenever the task it's attached to changes (so switching
 * tasks doesn't carry over a stale countdown).
 */
export default function FocusTimer({ taskKey }) {
  const [durationMinutes, setDurationMinutes] = useState(readStoredMinutes)
  const [secondsLeft, setSecondsLeft] = useState(() => durationMinutes * 60)
  const [running, setRunning] = useState(true)
  const [customOpen, setCustomOpen] = useState(() => !PRESET_MINUTES.includes(durationMinutes))
  const [customValue, setCustomValue] = useState(() =>
    PRESET_MINUTES.includes(durationMinutes) ? '' : String(durationMinutes),
  )

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60)
    setRunning(true)
  }, [taskKey, durationMinutes])

  useEffect(() => {
    if (!running || secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [running, secondsLeft])

  function applyDuration(minutes) {
    writeStoredMinutes(minutes)
    setDurationMinutes(minutes)
    // Same value picked again still restarts the block.
    setSecondsLeft(minutes * 60)
    setRunning(true)
  }

  function choosePreset(minutes) {
    setCustomOpen(false)
    applyDuration(minutes)
  }

  const parsedCustom = Number(customValue)
  const customValid = customValue !== '' && isValidMinutes(parsedCustom)

  function submitCustom(event) {
    event.preventDefault()
    if (customValid) applyDuration(parsedCustom)
  }

  const done = secondsLeft <= 0

  return (
    <div className="focus-timer" data-testid="focus-timer">
      <div className="focus-timer__row">
        <span className="focus-timer__time" data-testid="focus-timer-time">
          {formatTime(secondsLeft)}
        </span>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          disabled={done}
          className="focus-timer__toggle"
        >
          {done ? 'Block complete' : running ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={() => applyDuration(durationMinutes)}
          className="focus-timer__toggle"
        >
          Reset
        </button>
      </div>

      <div className="focus-timer__presets" role="group" aria-label="Timer length">
        {PRESET_MINUTES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className="focus-timer__preset"
            aria-pressed={!customOpen && durationMinutes === minutes}
            onClick={() => choosePreset(minutes)}
          >
            {minutes} min
          </button>
        ))}
        <button
          type="button"
          className="focus-timer__preset"
          aria-pressed={customOpen}
          onClick={() => setCustomOpen(true)}
        >
          Custom
        </button>
      </div>

      {customOpen && (
        <form className="focus-timer__custom" onSubmit={submitCustom}>
          <input
            type="number"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            step={1}
            inputMode="numeric"
            placeholder="Minutes"
            aria-label="Custom minutes"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            autoFocus
          />
          <button type="submit" className="focus-timer__toggle" disabled={!customValid}>
            Set
          </button>
        </form>
      )}
    </div>
  )
}
