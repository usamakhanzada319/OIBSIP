const toggleBtn = document.getElementById('darkModeToggle')
const html = document.documentElement
const icon = toggleBtn.querySelector('i')

const savedTheme = localStorage.getItem('theme')
if (savedTheme) {
  html.setAttribute('data-theme', savedTheme)
  updateIcon(savedTheme)
}

toggleBtn.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  html.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  updateIcon(newTheme)
})

function updateIcon (theme) {
  if (theme === 'dark') {
    icon.className = 'fas fa-sun'
  } else {
    icon.className = 'fas fa-moon'
  }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute('href'))
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
})

document.querySelectorAll('.gallery-card').forEach(card => {
  card.addEventListener('mouseenter', function () {
    this.style.transition = 'transform 0.3s ease'
  })
})
