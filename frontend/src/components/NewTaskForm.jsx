import { useState } from 'react'

export default function NewTaskForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('deep')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title: title.trim(), description: description.trim() || null, category })
    setTitle('')
    setDescription('')
  }

  return (
    <form className="new-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add a task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="New task title"
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        aria-label="New task description"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="New task category"
      >
        <option value="deep">Deep</option>
        <option value="shallow">Shallow</option>
      </select>
      <button type="submit">Add</button>
    </form>
  )
}
