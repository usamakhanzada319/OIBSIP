// Theme
const themeToggle = document.getElementById('themeToggle')
const html = document.documentElement
const themeIcon = themeToggle?.querySelector('i')

// Toast
const toast = document.getElementById('toast')
const toastMessage = document.getElementById('toastMessage')
const toastIcon = document.getElementById('toastIcon')

// Load saved theme
const savedTheme = localStorage.getItem('authTheme') || 'light'
html.setAttribute('data-theme', savedTheme)
updateThemeIcon(savedTheme)

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    html.setAttribute('data-theme', next)
    localStorage.setItem('authTheme', next)
    updateThemeIcon(next)
  })
}

function updateThemeIcon (theme) {
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'
  }
}

function showToast (message, type = 'success') {
  if (!toast) return

  toast.className = 'toast'
  toast.classList.add(type)
  toastMessage.textContent = message
  toastIcon.className =
    type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'

  // Show toast
  requestAnimationFrame(() => {
    toast.classList.add('show')
  })

  // Hide after 3 seconds
  clearTimeout(toast._timeout)
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      toast.classList.add('hidden')
    }, 400)
  }, 3000)
}

function togglePassword (inputId) {
  const input = document.getElementById(inputId)
  if (!input) return

  const type = input.getAttribute('type') === 'password' ? 'text' : 'password'
  input.setAttribute('type', type)

  // Toggle icon
  const wrapper = input.closest('.input-wrapper')
  if (wrapper) {
    const btn = wrapper.querySelector('.toggle-password i')
    if (btn) {
      btn.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash'
    }
  }
}

async function hashPassword (password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// USER MANAGEMENT (localStorage)

function getUsers () {
  try {
    return JSON.parse(localStorage.getItem('authUsers')) || []
  } catch {
    return []
  }
}

function saveUsers (users) {
  localStorage.setItem('authUsers', JSON.stringify(users))
}

function getUserByUsername (username) {
  const users = getUsers()
  return users.find(u => u.username.toLowerCase() === username.toLowerCase())
}

function getUserByEmail (email) {
  const users = getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

function getUserByIdentifier (identifier) {
  const users = getUsers()
  return users.find(
    u =>
      u.username.toLowerCase() === identifier.toLowerCase() ||
      u.email.toLowerCase() === identifier.toLowerCase()
  )
}

// SESSION MANAGEMENT

function getSession () {
  try {
    return JSON.parse(localStorage.getItem('authSession'))
  } catch {
    return null
  }
}

function setSession (user) {
  localStorage.setItem(
    'authSession',
    JSON.stringify({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        joined: user.joined
      },
      loginTime: new Date().toISOString()
    })
  )
}

function clearSession () {
  localStorage.removeItem('authSession')
}

function isAuthenticated () {
  return getSession() !== null
}

// REGISTER FORM

const registerForm = document.getElementById('registerForm')

if (registerForm) {
  // Real-time password validation
  const regPassword = document.getElementById('regPassword')
  const regConfirm = document.getElementById('regConfirmPassword')

  if (regPassword) {
    regPassword.addEventListener('input', validatePasswordStrength)
  }

  if (regConfirm) {
    regConfirm.addEventListener('input', validateConfirmPassword)
  }

  registerForm.addEventListener('submit', async e => {
    e.preventDefault()

    const username = document.getElementById('regUsername').value.trim()
    const email = document.getElementById('regEmail').value.trim()
    const password = document.getElementById('regPassword').value
    const confirmPassword = document.getElementById('regConfirmPassword').value
    const termsChecked = document.getElementById('termsCheck').checked

    // Clear previous errors
    clearErrors('register')

    // Validate fields
    let isValid = true

    if (!username) {
      showFieldError('regUsernameError', 'Username is required')
      isValid = false
    } else if (username.length < 3) {
      showFieldError(
        'regUsernameError',
        'Username must be at least 3 characters'
      )
      isValid = false
    } else if (getUserByUsername(username)) {
      showFieldError('regUsernameError', 'Username already taken')
      isValid = false
    }

    if (!email) {
      showFieldError('regEmailError', 'Email is required')
      isValid = false
    } else if (!isValidEmail(email)) {
      showFieldError('regEmailError', 'Please enter a valid email')
      isValid = false
    } else if (getUserByEmail(email)) {
      showFieldError('regEmailError', 'Email already registered')
      isValid = false
    }

    if (!password) {
      showFieldError('regPasswordError', 'Password is required')
      isValid = false
    } else if (!isValidPassword(password)) {
      showFieldError(
        'regPasswordError',
        'Password must be at least 8 characters and contain 1 number'
      )
      isValid = false
    }

    if (!confirmPassword) {
      showFieldError('regConfirmError', 'Please confirm your password')
      isValid = false
    } else if (password !== confirmPassword) {
      showFieldError('regConfirmError', 'Passwords do not match')
      isValid = false
    }

    if (!termsChecked) {
      showFieldError('regTermsError', 'You must agree to the Terms of Service')
      isValid = false
    }

    if (!isValid) return

    // Show loading
    setLoading('register', true)

    try {
      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create user
      const newUser = {
        id: Date.now(),
        username,
        email,
        password: hashedPassword,
        joined: new Date().toISOString()
      }

      const users = getUsers()
      users.push(newUser)
      saveUsers(users)

      showToast('Account created successfully! Please login.', 'success')

      // Redirect to login
      setTimeout(() => {
        window.location.href = 'index.html'
      }, 1500)
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error')
      console.error('Registration error:', error)
    } finally {
      setLoading('register', false)
    }
  })
}

// LOGIN FORM

const loginForm = document.getElementById('loginForm')

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault()

    const identifier = document.getElementById('loginIdentifier').value.trim()
    const password = document.getElementById('loginPassword').value
    const rememberMe = document.getElementById('rememberMe')?.checked || false

    // Clear previous errors
    clearErrors('login')
    document.getElementById('loginError').classList.add('hidden')

    // Validate fields
    let isValid = true

    if (!identifier) {
      showFieldError('loginIdentifierError', 'Username or email is required')
      isValid = false
    }

    if (!password) {
      showFieldError('loginPasswordError', 'Password is required')
      isValid = false
    }

    if (!isValid) return

    // Show loading
    setLoading('login', true)

    try {
      // Find user
      const user = getUserByIdentifier(identifier)

      if (!user) {
        showLoginError('Invalid credentials')
        setLoading('login', false)
        return
      }

      // Verify password
      const hashedInput = await hashPassword(password)

      if (user.password !== hashedInput) {
        showLoginError('Invalid credentials')
        setLoading('login', false)
        return
      }

      // Login success
      setSession(user)

      if (rememberMe) {
        localStorage.setItem('authRemember', 'true')
      } else {
        localStorage.removeItem('authRemember')
      }

      showToast('Welcome back, ' + user.username + '!', 'success')

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html'
      }, 500)
    } catch (error) {
      showLoginError('Login failed. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading('login', false)
    }
  })
}

// DASHBOARD

if (window.location.pathname.includes('dashboard.html')) {
  // Check authentication
  if (!isAuthenticated()) {
    window.location.href = 'index.html'
  }

  const session = getSession()
  const user = session?.user

  if (user) {
    // Update welcome message
    document.getElementById('usernameDisplay').textContent = user.username
    document.getElementById('infoUsername').textContent = user.username
    document.getElementById('infoEmail').textContent = user.email

    if (user.joined) {
      const date = new Date(user.joined)
      document.getElementById('infoJoined').textContent =
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
    }

    // Update stats
    const users = getUsers()
    document.getElementById('statUsers').textContent = users.length
    document.getElementById('statActive').textContent =
      users.filter(u => u.status !== 'inactive').length || users.length
    document.getElementById('statToday').textContent = users.filter(u => {
      const joined = new Date(u.joined)
      const today = new Date()
      return joined.toDateString() === today.toDateString()
    }).length

    // Login time
    if (session.loginTime) {
      const time = new Date(session.loginTime)
      document.getElementById('loginTime').textContent = time.toLocaleString(
        'en-US',
        {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }
      )
    }
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession()
    localStorage.removeItem('authRemember')
    showToast('Logged out successfully!', 'success')
    setTimeout(() => {
      window.location.href = 'index.html'
    }, 500)
  })
}
// VALIDATION HELPERS

function isValidEmail (email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPassword (password) {
  return password.length >= 8 && /\d/.test(password)
}

function validatePasswordStrength () {
  const password = document.getElementById('regPassword').value
  const lengthHint = document.getElementById('hintLength')
  const numberHint = document.getElementById('hintNumber')

  if (lengthHint) {
    lengthHint.textContent =
      password.length >= 8 ? '✓ Min 8 characters' : '✗ Min 8 characters'
    lengthHint.className =
      'hint-item ' + (password.length >= 8 ? 'valid' : 'invalid')
  }

  if (numberHint) {
    const hasNumber = /\d/.test(password)
    numberHint.textContent = hasNumber
      ? '✓ At least 1 number'
      : '✗ At least 1 number'
    numberHint.className = 'hint-item ' + (hasNumber ? 'valid' : 'invalid')
  }
}

function validateConfirmPassword () {
  const password = document.getElementById('regPassword').value
  const confirm = document.getElementById('regConfirmPassword').value
  const errorEl = document.getElementById('regConfirmError')

  if (confirm && password !== confirm) {
    errorEl.textContent = 'Passwords do not match'
  } else {
    errorEl.textContent = ''
  }
}

function showFieldError (id, message) {
  const el = document.getElementById(id)
  if (el) el.textContent = message
}

function clearErrors (type) {
  const prefix = type === 'register' ? 'reg' : 'login'
  document
    .querySelectorAll(
      `#${prefix}UsernameError, #${prefix}EmailError, #${prefix}PasswordError, #${prefix}ConfirmError, #${prefix}IdentifierError`
    )
    .forEach(el => {
      if (el) el.textContent = ''
    })
}

function showLoginError (message) {
  const errorDiv = document.getElementById('loginError')
  const errorMsg = document.getElementById('loginErrorMessage')
  if (errorDiv) errorDiv.classList.remove('hidden')
  if (errorMsg) errorMsg.textContent = message
}

function setLoading (type, loading) {
  const btn = document.getElementById(
    type === 'register' ? 'registerBtn' : 'loginBtn'
  )
  const text = document.getElementById(
    type === 'register' ? 'registerBtnText' : 'loginBtnText'
  )
  const loader = document.getElementById(
    type === 'register' ? 'registerBtnLoader' : 'loginBtnLoader'
  )

  if (btn) btn.disabled = loading
  if (text) text.style.display = loading ? 'none' : 'inline'
  if (loader) loader.className = loading ? 'loader' : 'loader hidden'
}
// REDIRECT LOGIN (if already authenticated)

if (
  window.location.pathname.includes('index.html') ||
  window.location.pathname === '/' ||
  window.location.pathname === ''
) {
  if (isAuthenticated()) {
    window.location.href = 'dashboard.html'
  }
}

if (window.location.pathname.includes('register.html')) {
  if (isAuthenticated()) {
    window.location.href = 'dashboard.html'
  }
}
