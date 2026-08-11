const taskInput = document.getElementById('taskInput')
const addBtn = document.getElementById('addBtn')
const pendingList = document.getElementById('pendingList')
const completedList = document.getElementById('completedList')
const pendingCount = document.getElementById('pendingCount')
const completedCount = document.getElementById('completedCount')
const pendingEmpty = document.getElementById('pendingEmpty')
const completedEmpty = document.getElementById('completedEmpty')
const themeToggle = document.getElementById('themeToggle')

let tasks = {
  pending: [],
  completed: []
}

let taskIdCounter = 0

function loadFromStorage () {
  const saved = localStorage.getItem('todoTasks')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      tasks = parsed
      const allTask = [...tasks.pending, ...tasks.completed]
      if (allTask.length > 0) {
        taskIdCounter = Math.max(...allTask.map(task => task.id)) + 1
      }
    } catch (e) {
      console.log('Error loading tasks:', e)
    }
  }
}

function saveToStorage () {
  localStorage.setItem('todoTasks', JSON.stringify(tasks))
}

function getCurrentTime () {
  return new Date().toISOString()
}

function formatTimeAgo (timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffMonth / 12)

  if (diffYear > 0) return `${diffYear}y ago`
  if (diffMonth > 0) return `${diffMonth}mo ago`
  if (diffDay > 0) return `${diffDay}d ago`
  if (diffHour > 0) return `${diffHour}h ago`
  if (diffMin > 0) return `${diffMin}m ago`
  return 'Just now'
}

function formatFullTime (timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function render () {
  renderPending()
  renderCompleted()
  updateCounts()
  saveToStorage()
}

function renderPending () {
  const tasksHtml = tasks.pending
    .map(task => createTaskHTML(task, 'pending'))
    .join('')
  pendingList.innerHTML = tasksHtml

  if (tasks.pending.length === 0) {
    pendingEmpty.classList.remove('hidden')
  } else {
    pendingEmpty.classList.add('hidden')
  }
}

function renderCompleted () {
  const tasksHtml = tasks.completed
    .map(task => createTaskHTML(task, 'completed'))
    .join('')
  completedList.innerHTML = tasksHtml

  if (tasks.completed.length === 0) {
    completedEmpty.classList.remove('hidden')
  } else {
    completedEmpty.classList.add('hidden')
  }
}

function createTaskHTML (task, listType) {
  const isCompleted = listType === 'completed'
  const timeLabel = isCompleted ? 'Completed' : 'Added'
  const timeValue = isCompleted ? task.completedAt : task.createdAt

  return `
    <li class="task-item" data-id="${task.id}" data-list="${listType}">
      <span class="task-text ${isCompleted ? 'completed' : ''}">${escapeHTML(
    task.text
  )}</span>
      
      <div class="task-meta">
        <span class="task-time">
          ${timeLabel}: ${formatTimeAgo(timeValue)}
          <span style="opacity:0.5;font-size:0.65rem;">(${formatFullTime(
            timeValue
          )})</span>
        </span>
      </div>
      
      <div class="task-actions">
        ${
          !isCompleted
            ? `
          <button class="btn btn-success btn-sm complete-btn" title="Mark complete">
            <i class="fas fa-check"></i>
          </button>
        `
            : `
          <button class="btn btn-warning btn-sm undo-btn" title="Undo complete">
            <i class="fas fa-undo"></i>
          </button>
        `
        }
        
        <button class="btn btn-warning btn-sm edit-btn" title="Edit task">
          <i class="fas fa-pen"></i>
        </button>
        
        <button class="btn btn-danger btn-sm delete-btn" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </li>
  `
}

function escapeHTML (text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function updateCounts () {
  pendingCount.textContent = `${tasks.pending.length} pending`
  completedCount.textContent = `${tasks.completed.length} completed`
}

function addTask (text) {
  const trimmed = text.trim()
  if (!trimmed) return

  const task = {
    id: taskIdCounter++,
    text: trimmed,
    createdAt: getCurrentTime(),
    completedAt: null
  }
  tasks.pending.push(task)
  render()
  taskInput.value = ''
  taskInput.focus()
}

function deleteTask (id, listType) {
  if (listType === 'pending') {
    tasks.pending = tasks.pending.filter(t => t.id !== id)
  } else {
    tasks.completed = tasks.completed.filter(t => t.id !== id)
  }
  render()
}

function completeTask (id) {
  const index = tasks.pending.findIndex(t => t.id === id)
  if (index === -1) return

  const task = tasks.pending.splice(index, 1)[0]
  task.completedAt = getCurrentTime()
  tasks.completed.push(task)
  render()
}

function undoComplete (id) {
  const index = tasks.completed.findIndex(t => t.id === id)
  if (index === -1) return

  const task = tasks.completed.splice(index, 1)[0]
  task.completedAt = null
  tasks.pending.push(task)
  render()
}

function editTask (id, listType) {
  const list = listType === 'pending' ? tasks.pending : tasks.completed
  const task = list.find(t => t.id === id)
  if (!task) return

  const taskItem = document.querySelector(`.task-item[data-id="${id}"]`)
  if (!taskItem) return

  const taskTextSpan = taskItem.querySelector('.task-text')
  if (!taskTextSpan) return

  const originalText = task.text

  // Create input
  const input = document.createElement('input')
  input.type = 'text'
  input.className = 'edit-input'
  input.value = originalText
  input.maxLength = 100
  input.setAttribute('aria-label', 'Edit task')

  // Replace span with input
  taskTextSpan.replaceWith(input)

  // Focus and select
  input.focus()
  input.select()

  // Save on Enter
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      saveEdit(input, task, taskItem, listType)
    }
    if (e.key === 'Escape') {
      cancelEdit(input, taskItem, originalText)
    }
  })

  // Save on blur (click outside)
  input.addEventListener('blur', () => {
    saveEdit(input, task, taskItem, listType)
  })
}

function saveEdit (input, task, taskItem, listType) {
  const trimmed = input.value.trim()

  if (!trimmed) {
    cancelEdit(input, taskItem, task.text)
    return
  }

  task.text = trimmed
  render()
}

function cancelEdit (input, taskItem, originalText) {
  const span = document.createElement('span')
  span.className = 'task-text'
  span.textContent = originalText
  input.replaceWith(span)
}

// Add task
addBtn.addEventListener('click', () => addTask(taskInput.value))

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addTask(taskInput.value)
  }
})

// Event delegation for task actions
document.addEventListener('click', e => {
  const target = e.target.closest('button')
  if (!target) return

  const li = target.closest('.task-item')
  if (!li) return

  const id = parseInt(li.dataset.id)
  const listType = li.dataset.list

  // Complete button
  if (target.closest('.complete-btn')) {
    completeTask(id)
    return
  }

  // Undo button
  if (target.closest('.undo-btn')) {
    undoComplete(id)
    return
  }

  // Edit button
  if (target.closest('.edit-btn')) {
    editTask(id, listType)
    return
  }

  // Delete button
  if (target.closest('.delete-btn')) {
    if (confirm('Delete this task?')) {
      deleteTask(id, listType)
    }
    return
  }
})

document.addEventListener('dblclick', e => {
  const taskText = e.target.closest('.task-text')
  if (!taskText) return

  const taskItem = taskText.closest('.task-item')
  if (!taskItem) return

  // Prevent if already editing
  if (taskItem.querySelector('.edit-input')) return

  const id = parseInt(taskItem.dataset.id)
  const listType = taskItem.dataset.list

  editTask(id, listType)
})

const savedTheme = localStorage.getItem('todoTheme') || 'light'
document.documentElement.setAttribute('data-theme', savedTheme)
updateThemeIcon(savedTheme)

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('todoTheme', next)
  updateThemeIcon(next)
})

function updateThemeIcon (theme) {
  const icon = themeToggle.querySelector('i')
  if (theme === 'dark') {
    icon.className = 'fas fa-sun'
  } else {
    icon.className = 'fas fa-moon'
  }
}

loadFromStorage()
render()
taskInput.focus()
