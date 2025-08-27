function init() {
  window.addEventListener('DOMContentLoaded', () => {
    doAThing()
    setupWindowControls()
    setupNavigation()
    setupTimerControls()
    initializePages()
  })
}

function doAThing() {
  const versions = window.electron.process.versions
  replaceText('.electron-version', `Electron v${versions.electron}`)
  replaceText('.chrome-version', `Chromium v${versions.chrome}`)
  replaceText('.node-version', `Node v${versions.node}`)

  const ipcHandlerBtn = document.getElementById('ipcHandler')
  ipcHandlerBtn?.addEventListener('click', () => {
    window.electron.ipcRenderer.send('ping')
  })
}

function setupWindowControls() {
  // Minimize butonu
  const minimizeBtn = document.getElementById('btn-min')
  minimizeBtn?.addEventListener('click', () => {
    window.electron.ipcRenderer.send('minimize-window')
  })

  // Close butonu
  const closeBtn = document.getElementById('btn-close')
  closeBtn?.addEventListener('click', () => {
    window.electron.ipcRenderer.send('close-window')
  })
}

function setupNavigation() {
  // Tüm route butonlarını bul
  const routeButtons = document.querySelectorAll('[data-route]')
  
  routeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetPage = button.getAttribute('data-route')
      navigateToPage(targetPage)
      
      // Eğer timer sayfasına geçiyorsak timer'ı başlat
      if (targetPage === 'timer') {
        const pastaType = button.getAttribute('data-pasta')
        startTimer(pastaType)
      }
    })
  })
}

// Timer değişkenleri
let timerInterval = null
let timeLeft = 0
let isPaused = false

function startTimer(pastaType) {
  // Pasta türüne göre süre belirle
  const pastaTimes = {
    'fettucine': 0.1 * 60, // 4 dakika
    'spaghetti': 9 * 60, // 9 dakika
    'bowties': 11 * 60,  // 11 dakika
    'penne': 13 * 60     // 13 dakika
  }
  
  timeLeft = pastaTimes[pastaType] || 5 * 60 // Varsayılan 5 dakika
  isPaused = false
  
  updateTimerDisplay()
  startTimerCountdown()
}

function startTimerCountdown() {
  if (timerInterval) clearInterval(timerInterval)
  
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
  // Timer sayfasını gizle
  const timerPage = document.getElementById('page-timer')
  const doneState = document.getElementById('done-state')
  
  if (timerPage && doneState) {
    // Timer kontrollerini gizle
    const timerControls = timerPage.querySelector('.timer-controls')
    const cookingTitle = timerPage.querySelector('.cooking-title')
    const potIcon = timerPage.querySelector('.pot-icon')
    const timerDisplay = timerPage.querySelector('.timer-display')
    
    if (timerControls) timerControls.style.display = 'none'
    if (cookingTitle) cookingTitle.style.display = 'none'
    if (potIcon) potIcon.style.display = 'none'
    if (timerDisplay) timerDisplay.style.display = 'none'
    
    // Done state'i göster
    doneState.style.display = 'flex'
  }
  
  // Alarm sesi çal
  playAlarm()
}

function playAlarm() {
  // Web Audio API ile alarm sesi oluştur
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3)
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.log('Alarm sesi çalınamadı:', error)
  }
}

function setupTimerControls() {
  const pauseBtn = document.getElementById('pause-btn')
  const resetBtn = document.getElementById('reset-btn')
  const doneBtn = document.getElementById('done-btn')
  
  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused
    pauseBtn.textContent = isPaused ? 'RESUME' : 'PAUSE'
  })
  
  resetBtn?.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval)
    timeLeft = 0
    isPaused = false
    updateTimerDisplay()
    pauseBtn.textContent = 'PAUSE'
  })
  
  doneBtn?.addEventListener('click', () => {
    // Timer'ı sıfırla
    if (timerInterval) clearInterval(timerInterval)
    timeLeft = 0
    isPaused = false
    
    // Timer sayfasını normal haline getir
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
    
    // Seçim sayfasına git
    navigateToPage('select')
  })
}

function navigateToPage(pageName) {
  // Tüm sayfaları gizle
  const allPages = document.querySelectorAll('.page, .page-active')
  allPages.forEach(page => {
    page.classList.remove('active', 'page-active')
    page.classList.add('page')
  })
  
  // Hedef sayfayı göster
  const targetPage = document.getElementById(`page-${pageName}`)
  if (targetPage) {
    targetPage.classList.remove('page')
    targetPage.classList.add('page-active')
  }
}

function initializePages() {
  // İlk sayfa olarak start sayfasını göster
  const startPage = document.getElementById('page-start')
  const selectPage = document.getElementById('page-select')
  
  if (startPage) {
    startPage.classList.remove('page')
    startPage.classList.add('page-active')
  }
  
  if (selectPage) {
    selectPage.classList.remove('page-active')
    selectPage.classList.add('page')
  }
}

function replaceText(selector, text) {
  const element = document.querySelector(selector)
  if (element) {
    element.innerText = text
  }
}

init()
