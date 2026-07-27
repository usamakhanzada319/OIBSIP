const resultDisplay = document.getElementById('result')
const expressionDisplay = document.getElementById('expression')
const themeToggle = document.getElementById('themeToggle')
const buttons = document.querySelectorAll('.btn')

// state
let currentInput = ''
let previousInput = ''
let operator = null
let shouldResetDisplay = false
let lastResult = null

let darkMode = localStorage.getItem('calculator-theme') === 'dark'

function setTheme (isDark) {
  darkMode = isDark
  document.documentElement.classList.toggle('dark', isDark)
  const icon = themeToggle.querySelector('.icon')
  icon.textContent = isDark ? '☀️' : '🌙'
  localStorage.setItem('calculator-theme', isDark ? 'dark' : 'light')
}

setTheme(darkMode)

themeToggle.addEventListener('click', () => {
  setTheme(!darkMode)
})

function updateDisplay () {
  if (currentInput === '') {
    resultDisplay.textContent = '0'
    return
  }

  // Limit display length
  let displayValue = currentInput
  if (displayValue.length > 14) {
    displayValue = parseFloat(displayValue).toExponential(6)
  }
  resultDisplay.textContent = displayValue
}

// operator chain
function updateExpression () {
  if (operator && previousInput) {
    expressionDisplay.textContent = `${previousInput} ${operator} ${
      currentInput || ''
    }`
  } else if (operator && !previousInput) {
    expressionDisplay.textContent = `${currentInput} ${operator}`
  } else {
    expressionDisplay.textContent = currentInput || ''
  }
}

function inputDigit (digit) {
  if (shouldResetDisplay) {
    currentInput = ''
    shouldResetDisplay = false
  }

  if (digit === '.' && currentInput.includes('.')) return
  if (digit === '.' && currentInput === '') {
    currentInput = '0.'
  } else {
    currentInput += digit
  }
  updateDisplay()
  updateExpression()
}

function inputOperator (op) {
  if (currentInput === '' && operator) {
    operator = op
    updateExpression()
    return
  }
  if (currentInput === '' && !operator) return

  if (previousInput && operator && !shouldResetDisplay) {
    calculate()
  }

  previousInput = currentInput
  operator = op
  currentInput = ''
  shouldResetDisplay = false
  updateExpression()
  updateDisplay()
}

function calculate () {
  if (!operator || currentInput === '') {
    if (currentInput === '') return
    lastResult = parseFloat(currentInput)
    return
  }

  const prev = parseFloat(previousInput)
  const curr = parseFloat(currentInput)
  let result

  switch (operator) {
    case '+':
      result = prev + curr
      break
    case '-':
      result = prev - curr
      break
    case '*':
      result = prev * curr
      break
    case '/':
      if (curr === 0) {
        resultDisplay.textContent = 'Error'
        expressionDisplay.textContent = 'Cannot divide by zero'
        currentInput = ''
        previousInput = ''
        operator = null
        return
      }
      result = prev / curr
      break
    case '%':
      result = prev % curr
      break
    default:
      return
  }
  // Handle floating point precision
  result = parseFloat(result.toPrecision(12))

  currentInput = String(result)
  previousInput = ''
  operator = null
  shouldResetDisplay = true
  lastResult = result
  updateDisplay()
  expressionDisplay.textContent = ''
}

function clearAll () {
  currentInput = ''
  previousInput = ''
  operator = null
  shouldResetDisplay = false
  lastResult = null
  resultDisplay.textContent = '0'
  expressionDisplay.textContent = ''
}

function backspace () {
  if (shouldResetDisplay) return
  currentInput = currentInput.slice(0, -1)
  if (currentInput === '') {
    resultDisplay.textContent = '0'
  } else {
    updateDisplay()
  }
  updateExpression()
}

function handleEquals () {
  if (operator && currentInput !== '') {
    calculate()
  } else if (currentInput !== '') {
    lastResult = parseFloat(currentInput)
    shouldResetDisplay = true
  }
}

//  KEYBOARD SUPPORT

document.addEventListener('keydown', e => {
  const key = e.key

  if (key >= '0' && key <= '9') {
    e.preventDefault()
    inputDigit(key)
    return
  }

  if (key === '.') {
    e.preventDefault()
    inputDigit('.')
    return
  }

  if (key === '+') {
    e.preventDefault()
    inputOperator('+')
    return
  }
  if (key === '-') {
    e.preventDefault()
    inputOperator('-')
    return
  }
  if (key === '*') {
    e.preventDefault()
    inputOperator('*')
    return
  }
  if (key === '/') {
    e.preventDefault()
    inputOperator('/')
    return
  }
  if (key === '%') {
    e.preventDefault()
    inputOperator('%')
    return
  }

  if (key === 'Enter' || key === '=') {
    e.preventDefault()
    handleEquals()
    return
  }

  if (key === 'Escape' || key === 'c' || key === 'C') {
    e.preventDefault()
    clearAll()
    return
  }

  if (key === 'Backspace') {
    e.preventDefault()
    backspace()
    return
  }
})

// BUTTON EVENTLISTENERS

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.value

    if (value === 'clear') {
      clearAll()
      return
    }

    if (value === 'backspace') {
      backspace()
      return
    }

    if (value === '=') {
      handleEquals()
      return
    }

    if (
      value === '+' ||
      value === '-' ||
      value === '*' ||
      value === '/' ||
      value === '%'
    ) {
      inputOperator(value)
      return
    }

    // Number or decimal
    inputDigit(value)
  })
})
// INITIALIZE

clearAll()
