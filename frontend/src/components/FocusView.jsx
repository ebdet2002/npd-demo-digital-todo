import FocusTimer from './FocusTimer'
import TaskItem from './TaskItem'

/**
 * Focus Mode ON: shallow tasks are hidden entirely. Shows the current
 * (first open) deep task with a timer, a badge for how many shallow tasks
 * are hidden (not lost — deferred), and the rest of the deep queue below.
 */
export default function FocusView({ deepTasks, shallowHiddenCount, onToggleDone, onDelete }) {
  const openDeepTasks = deepTasks.filter((t) => !t.done)
  const [current, ...queued] = openDeepTasks

  return (
    <div className="focus-view" data-testid="focus-view">
      <div className="focus-view__badge" data-testid="hidden-shallow-badge">
        {shallowHiddenCount > 0
          ? `${shallowHiddenCount} shallow task${shallowHiddenCount === 1 ? '' : 's'} hidden while you focus`
          : 'No shallow tasks waiting'}
      </div>

      {current ? (
        <div className="focus-view__current" data-testid="current-deep-task">
          <h2>{current.title}</h2>
          {current.description && <p>{current.description}</p>}
          <FocusTimer taskKey={current.id} />
          <button type="button" onClick={() => onToggleDone(current)}>
            Mark done
          </button>
        </div>
      ) : (
        <div className="focus-view__empty" data-testid="focus-empty-state">
          <h2>No deep work queued</h2>
          <p>Add a deep task, or turn Focus Mode off to see everything.</p>
        </div>
      )}

      {queued.length > 0 && (
        <div className="focus-view__queue">
          <h3>Up next</h3>
          <ul>
            {queued.map((task) => (
              <TaskItem key={task.id} task={task} onToggleDone={onToggleDone} onDelete={onDelete} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
