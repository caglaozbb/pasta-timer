function init() {
  window.addEventListener('DOMContentLoaded', () => {
    setupWindowControls()
    setupNavigation()
    setupTimerControls()
  })
}

function setupWindowControls() {
  const minimizeBtn = document.getElementById('btn-min')
  const closeBtn = document.getElementById('btn-close')

  minimizeBtn?.addEventListener('click', () => {
    window.electron.ipcRenderer.send('minimize-window')
  })

  closeBtn?.addEventListener('click', () => {
    window.electron.ipcRenderer.send('close-window')
  })
}

function setupNavigation() {
  const routeButtons = document.querySelectorAll('[data-route]')
  
  routeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetPage = button.getAttribute('data-route')
      navigateToPage(targetPage)
      
      if (targetPage === 'timer') {
        const pastaType = button.getAttribute('data-pasta')
        startTimer(pastaType)
      }
    })
  })
}

function navigateToPage(pageName) {
  const allPages = document.querySelectorAll('.page, .page-active')
  allPages.forEach(page => {
    page.classList.remove('active', 'page-active')
    page.classList.add('page')
  })
  
  const targetPage = document.getElementById(`page-${pageName}`)
  if (targetPage) {
    targetPage.classList.remove('page')
    targetPage.classList.add('page-active')
  }
}

let timerInterval = null
let timeLeft = 0
let isPaused = false

function startTimer(pastaType) {
  const pastaTimes = {
    'fettucine': 0.1 * 60, 
    'spaghetti': 10 * 60, 
    'bowties': 12 * 60,  
    'penne': 15 * 60     
  }
  
  timeLeft = pastaTimes[pastaType] || 5 * 60 
  isPaused = false
  
  updateTimerDisplay()
  startTimerCountdown()
}

function startTimerCountdown() {
  if (timerInterval) clearInterval(timerInterval)
  
    startTicking() 
  
  timerInterval = setInterval(() => {
    if (!isPaused && timeLeft > 0) {
      timeLeft--
      updateTimerDisplay()
      
      if (timeLeft === 0) {
        clearInterval(timerInterval)
        timerComplete()
      }
    }
  }, 1000)
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerDisplay = document.getElementById('timer')
  
  if (timerDisplay) {
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}

function timerComplete() {
  const timerPage = document.getElementById('page-timer')
  const doneState = document.getElementById('done-state')
  
  if (timerPage && doneState) {
    const timerControls = timerPage.querySelector('.timer-controls')
    const cookingTitle = timerPage.querySelector('.cooking-title')
    const potIcon = timerPage.querySelector('.pot-icon')
    const timerDisplay = timerPage.querySelector('.timer-display')
    
    if (timerControls) timerControls.style.display = 'none'
    if (cookingTitle) cookingTitle.style.display = 'none'
    if (potIcon) potIcon.style.display = 'none'
    if (timerDisplay) timerDisplay.style.display = 'none'
    
    doneState.style.display = 'flex'
  }
  stopTicking()  
  playAlarm()
}

function playAlarm() {
  try {
    const audio = new Audio('./assets/done-cooking.mp3')
    audio.volume = 0.7
    audio.play()
      setTimeout(() => {
        audio.pause()
      }, 3000)
  } catch (error) {
    console.log('Couldnt play alarm sound:', error)
  }
}


let tickAudio = null
let tickInterval = null

function startTicking() {
  stopTicking() 

  tickAudio = new Audio('./assets/kitchen-timer.mp3')
  tickAudio.volume = 0.6

  // Her 1 saniyede bir çal
  tickInterval = setInterval(() => {
    tickAudio.currentTime = 0
    tickAudio.play()
  }, 1000)
}

function stopTicking() {
  if (tickInterval) {
    clearInterval(tickInterval)
    tickInterval = null
  }
  if (tickAudio) {
    tickAudio.pause()
    tickAudio.currentTime = 0
  }
}

function setupTimerControls() {
  const pauseBtn = document.getElementById('pause-btn')
  const resetBtn = document.getElementById('reset-btn')
  const doneBtn = document.getElementById('done-btn')
  
  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused
  pauseBtn.textContent = isPaused ? 'RESUME' : 'PAUSE'

  if (isPaused) {
    stopTicking()
  } else {
    startTicking() 
  }
  })
  
  resetBtn?.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval)
      stopTicking()
    timeLeft = 0
    isPaused = false
      stopTicking()
    updateTimerDisplay()
    pauseBtn.textContent = 'PAUSE'
  })
  
  doneBtn?.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval)
      stopTicking()
    timeLeft = 0
    isPaused = false
    
    const timerPage = document.getElementById('page-timer')
    const doneState = document.getElementById('done-state')
    
    if (timerPage && doneState) {
      const timerControls = timerPage.querySelector('.timer-controls')
      const cookingTitle = timerPage.querySelector('.cooking-title')
      const potIcon = timerPage.querySelector('.pot-icon')
      const timerDisplay = timerPage.querySelector('.timer-display')
      
      if (timerControls) timerControls.style.display = 'flex'
      if (cookingTitle) cookingTitle.style.display = 'block'
      if (potIcon) potIcon.style.display = 'block'
      if (timerDisplay) timerDisplay.style.display = 'block'
      
      doneState.style.display = 'none'
    }
    
    navigateToPage('select')
  })
}



init()
