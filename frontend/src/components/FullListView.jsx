import TaskItem from './TaskItem'

/**
 * Focus Mode OFF: the full list, grouped by Deep / Shallow, shallow tasks
 * surfaced for quick wins.
 */
export default function FullListView({ tasks, onToggleDone, onDelete }) {
  const deep = tasks.filter((t) => t.category === 'deep')
  const shallow = tasks.filter((t) => t.category === 'shallow')

  if (tasks.length === 0) {
    return (
      <div className="full-list-view__empty" data-testid="empty-state">
        <p>No tasks yet. Add your first one below.</p>
      </div>
    )
  }

  return (
    <div className="full-list-view" data-testid="full-list-view">
      <section>
        <h2>Deep</h2>
        <ul>
          {deep.map((task) => (
            <TaskItem key={task.id} task={task} onToggleDone={onToggleDone} onDelete={onDelete} />
          ))}
          {deep.length === 0 && <li className="full-list-view__empty-group">No deep tasks</li>}
        </ul>
      </section>
      <section>
        <h2>Shallow</h2>
        <ul>
          {shallow.map((task) => (
            <TaskItem key={task.id} task={task} onToggleDone={onToggleDone} onDelete={onDelete} />
          ))}
          {shallow.length === 0 && <li className="full-list-view__empty-group">No shallow tasks</li>}
        </ul>
      </section>
    </div>
  )
}
