export default function TaskItem({ task, onToggleDone, onDelete }) {
  return (
    <li className={`task-item task-item--${task.category}`} data-testid="task-item">
      <label className="task-item__main">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggleDone(task)}
          aria-label={`Mark "${task.title}" ${task.done ? 'not done' : 'done'}`}
        />
        <span className={task.done ? 'task-item__title task-item__title--done' : 'task-item__title'}>
          {task.title}
        </span>
      </label>
      {task.description && <p className="task-item__description">{task.description}</p>}
      <button
        type="button"
        className="task-item__delete"
        onClick={() => onDelete(task)}
        aria-label={`Delete "${task.title}"`}
      >
        &times;
      </button>
    </li>
  )
}
