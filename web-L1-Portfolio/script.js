AOS.init({
  duration: 800,
  offset: 100,
  once: true
})

const toggleTheme = document.getElementById('themeToggle')
const body = document.body

const savedTheme = localStorage.getItem('theme')

if (savedTheme === 'light') {
  body.classList.add('light-mode')
  toggleTheme.innerHTML = '<i class="fas fa-sun"></i>'
} else {
  toggleTheme.innerHTML = '<i class="fas fa-moon"></i>'
}

toggleTheme.addEventListener('click', () => {
  body.classList.toggle('light-mode')

  if (body.classList.contains('light-mode')) {
    toggleTheme.innerHTML = '<i class="fas fa-sun"></i>'
    localStorage.setItem('theme', 'light')
  } else {
    toggleTheme.innerHTML = '<i class="fas fa-moon"></i>'
    localStorage.setItem('theme', 'dark')
  }
})

const header = document.querySelector('.header')
let lastScroll = 0

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset

  if (currentScroll > 50) {
    header.classList.add('scrolled')
  } else {
    header.classList.remove('scrolled')
  }
  lastScroll = currentScroll
})

// ✅ MOBILE MENU TOGGLE (with console logs for debugging)
const menuToggle = document.getElementById('menuToggle')
const navLinks = document.getElementById('navLinks')

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active')
  console.log('navLinks active:', navLinks.classList.contains('active'))

  if (navLinks.classList.contains('active')) {
    menuToggle.innerHTML = '<i class="fas fa-times"></i>'
  } else {
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>'
  }
})

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active')
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>'
  })
})

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm')

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault()

    const name = document.getElementById('name').value.trim()
    const email = document.getElementById('email').value.trim()
    const message = document.getElementById('message').value.trim()

    if (!name || !email || !message) {
      alert('Please fill in all fields.')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      alert('Please enter a valid email address.')
      return
    }

    alert("Thank you for your message! I'll get back to you soon.")
    contactForm.reset()
  })
}

// ===== FOOTER YEAR =====
const yearElement = document.getElementById('year')
if (yearElement) {
  yearElement.textContent = new Date().getFullYear()
}
