const tempInput = document.getElementById('tempInput')
const convertBtn = document.getElementById('convertBtn')
const errorMsg = document.getElementById('errorMsg')
const celsiusResult = document.getElementById('celsiusResult')
const fahrenheitResult = document.getElementById('fahrenheitResult')
const kelvinResult = document.getElementById('kelvinResult')

// dark mode toggle

const themeToggle = document.createElement('button')
themeToggle.className = 'theme-toggle'
themeToggle.innerHTML = '🌙'
document.body.appendChild(themeToggle)

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark')
  themeToggle.innerHTML = document.body.classList.contains('dark') ? '☀️' : '🌙'
})

function convertTemperature () {
  // clear previous error

  errorMsg.textContent = ''

  //get input value

  const rawValue = tempInput.value.trim()
  if (rawValue === ' ') {
    errorMsg.textContent = 'Please enter a temperature value.'
    clearResults()
    return
  }

  const value = parseFloat(rawValue)
  if (isNaN(value)) {
    errorMsg.textContent = 'Please enter a valid number.'
    clearResults()
    return
  }

  // get selected unit
  const unit = document.querySelector('input[name="unit"]:checked').value

  let celsius, fahrenheit, kelvin

  // convert temperature

  if (unit === 'celsius') {
    celsius = value
    fahrenheit = (value * 9) / 5 + 32
    kelvin = value + 273.15
  } else if (unit === 'fahrenheit') {
    celsius = ((value - 32) * 5) / 9
    fahrenheit = value
    kelvin = celsius + 273.15
  } else if (unit === 'kelvin') {
    if (value < 0) {
      errorMsg.textContent =
        'Kelvin cannot be negative. Please enter a value ≥ 0.'
      clearResults()
      return
    }
    kelvin = value
    celsius = value - 273.15
    fahrenheit = (celsius * 9) / 5 + 32
  }

  //check absolute zero violation
  if (celsius < -273.15) {
    errorMsg.textContent =
      'Temperature below absolute zero (-273.15°C) is not physically possible.'
    clearResults()
    return
  }

  // display results with proper formatting
  celsiusResult.textContent = celsius.toFixed(2) + ' °C'
  fahrenheitResult.textContent = fahrenheit.toFixed(2) + ' °F'
  kelvinResult.textContent = kelvin.toFixed(2) + ' K'
}

// clear result

function clearResults () {
  celsiusResult.textContent = '--'
  fahrenheitResult.textContent = '--'
  kelvinResult.textContent = '--'
}

convertBtn.addEventListener('click', convertTemperature)

tempInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    convertTemperature()
  }
})

clearResults()
