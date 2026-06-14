// ============================================================
//  IMAGE EDITOR + JARVIS VOICE ASSISTANT
//  
//  Usage:
//   1. Open page → click "Start Jarvis" button once (mic permission)
//   2. Say "hey jarvis" → Jarvis greets you out loud
//   3. Say a command  → Jarvis executes it and confirms out loud
//
//  Commands (say after "hey jarvis"):
//   "increase brightness"    "decrease brightness"
//   "increase contrast"      "set contrast to 150"
//   "increase saturation"    "decrease blur"
//   "apply vintage"          "apply cyberpunk"
//   "reset"                  "download"
// ============================================================

// ─── FILTERS ────────────────────────────────────────────────
let filters = {
  brightness:  { value: 100, min: 0,   max: 200, unit: '%'   },
  contrast:    { value: 100, min: 0,   max: 200, unit: '%'   },
  saturation:  { value: 100, min: 0,   max: 200, unit: '%'   },
  hueRotation: { value: 0,   min: 0,   max: 360, unit: 'deg' },
  blur:        { value: 0,   min: 0,   max: 10,  unit: 'px'  },
  grayscale:   { value: 0,   min: 0,   max: 100, unit: '%'   },
  sepia:       { value: 0,   min: 0,   max: 100, unit: '%'   },
  opacity:     { value: 100, min: 0,   max: 100, unit: '%'   },
  invert:      { value: 0,   min: 0,   max: 100, unit: '%'   }
}
const defaultFilters = JSON.parse(JSON.stringify(filters))

// ─── DOM ────────────────────────────────────────────────────
const imageCanvas      = document.querySelector('#image-canvas')
const canvasCtx        = imageCanvas.getContext('2d')
const imageInput       = document.querySelector('#image-input')
const resetButton      = document.querySelector('#reset-btn')
const downloadButton   = document.querySelector('#download-btn')
const presetContainer  = document.querySelector('.presets')
const filtersContainer = document.querySelector('.filters')
let image = null

// ─── BUILD FILTER SLIDERS ───────────────────────────────────
function buildFilterUI() {
  Object.keys(filters).forEach(name => {
    const f   = filters[name]
    const wrap = document.createElement('div')
    wrap.classList.add('filter')
    wrap.dataset.filterName = name

    const row = document.createElement('div')
    row.classList.add('filter-label')

    const lbl = document.createElement('p')
    lbl.textContent = name

    const val = document.createElement('span')
    val.classList.add('filter-value')
    val.textContent = `${f.value}${f.unit}`

    row.appendChild(lbl)
    row.appendChild(val)

    const slider = document.createElement('input')
    slider.type  = 'range'
    slider.id    = name
    slider.min   = f.min
    slider.max   = f.max
    slider.value = f.value

    slider.addEventListener('input', () => {
      f.value = +slider.value
      val.textContent = `${slider.value}${f.unit}`
      applyFilters()
    })

    wrap.appendChild(row)
    wrap.appendChild(slider)
    filtersContainer.appendChild(wrap)
  })
}
buildFilterUI()

function syncSliders() {
  Object.keys(filters).forEach(name => {
    const slider = document.getElementById(name)
    const wrap   = filtersContainer.querySelector(`[data-filter-name="${name}"]`)
    if (slider) slider.value = filters[name].value
    if (wrap) {
      const val = wrap.querySelector('.filter-value')
      if (val) val.textContent = `${filters[name].value}${filters[name].unit}`
    }
  })
}

// ─── IMAGE LOAD ─────────────────────────────────────────────
imageInput.addEventListener('change', e => {
  const file = e.target.files[0]
  if (!file) return
  document.querySelector('.placeholder').style.display = 'none'
  imageCanvas.style.display = 'block'
  const img = new Image()
  img.onload = () => {
    image = img
    imageCanvas.width  = img.width
    imageCanvas.height = img.height
    canvasCtx.drawImage(img, 0, 0)
  }
  img.src = URL.createObjectURL(file)
})

// ─── APPLY FILTERS ──────────────────────────────────────────
function applyFilters() {
  canvasCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height)
  canvasCtx.filter =
    `brightness(${filters.brightness.value}%) ` +
    `saturate(${filters.saturation.value}%) ` +
    `contrast(${filters.contrast.value}%) ` +
    `hue-rotate(${filters.hueRotation.value}deg) ` +
    `blur(${filters.blur.value}px) ` +
    `grayscale(${filters.grayscale.value}%) ` +
    `sepia(${filters.sepia.value}%) ` +
    `opacity(${filters.opacity.value}%) ` +
    `invert(${filters.invert.value}%)`
  if (image) canvasCtx.drawImage(image, 0, 0)
}

// ─── RESET ──────────────────────────────────────────────────
resetButton.addEventListener('click', () => {
  doReset()
})

function doReset() {
  Object.keys(defaultFilters).forEach(k => {
    filters[k].value = defaultFilters[k].value
  })
  syncSliders()
  applyFilters()
}

// ─── DOWNLOAD ───────────────────────────────────────────────
downloadButton.addEventListener('click', doDownload)

function doDownload() {
  const a = document.createElement('a')
  a.download = 'edited-image.png'
  a.href = imageCanvas.toDataURL()
  a.click()
}

// ─── PRESETS ────────────────────────────────────────────────
const presets = {
  normal:    { brightness:100, contrast:100, saturation:100, hueRotation:0,   blur:0, grayscale:0,  sepia:0,  opacity:100, invert:0 },
  vintage:   { brightness:110, contrast:115, saturation:85,  hueRotation:0,   blur:0, grayscale:10, sepia:45, opacity:100, invert:0 },
  oldschool: { brightness:105, contrast:130, saturation:70,  hueRotation:10,  blur:0, grayscale:20, sepia:60, opacity:100, invert:0 },
  drama:     { brightness:90,  contrast:160, saturation:120, hueRotation:0,   blur:0, grayscale:0,  sepia:0,  opacity:100, invert:0 },
  cyberpunk: { brightness:105, contrast:160, saturation:170, hueRotation:270, blur:0, grayscale:0,  sepia:0,  opacity:100, invert:0 }
}

Object.keys(presets).forEach(name => {
  const btn = document.createElement('button')
  btn.classList.add('preset-btn')
  btn.textContent = name
  btn.addEventListener('click', () => applyPreset(name))
  presetContainer.appendChild(btn)
})

function applyPreset(name) {
  const p = presets[name]
  if (!p) return
  Object.keys(p).forEach(k => { filters[k].value = p[k] })
  syncSliders()
  applyFilters()
}

// ============================================================
//  JARVIS VOICE ASSISTANT
// ============================================================

// ─── SPEECH SYNTHESIS (Jarvis speaks) ───────────────────────
// IMPORTANT: We STOP the mic while Jarvis is speaking so it
// doesn't hear its own voice as a command.

function jarvisSpeak(text, onDone) {
  showStatus(text, 'speaking')
  updateLabel('Speaking…')

  // Stop mic so Jarvis doesn't hear itself
  stopMic()

  window.speechSynthesis.cancel()

  const utter   = new SpeechSynthesisUtterance(text)
  utter.rate    = 1.0
  utter.pitch   = 1.0
  utter.volume  = 1.0
  utter.lang    = 'en-US'

  // Pick a clear English voice
  const voices  = window.speechSynthesis.getVoices()
  const pick    = voices.find(v => v.name === 'Google US English')
               || voices.find(v => /en[-_]US/i.test(v.lang) && !v.localService)
               || voices.find(v => /en/i.test(v.lang))
  if (pick) utter.voice = pick

  utter.onend = () => {
    // Resume mic after Jarvis finishes speaking
    if (micActive) {
      setTimeout(() => {
        startMic()
        if (onDone) onDone()
      }, 400)
    } else {
      if (onDone) onDone()
    }
  }

  utter.onerror = () => {
    if (micActive) startMic()
    if (onDone) onDone()
  }

  window.speechSynthesis.speak(utter)
}

// ─── GREETINGS ───────────────────────────────────────────────
const greetings = [
  "Yes! Jarvis here. What do you need?",
  "Hello! I'm listening. Give me a command.",
  "Jarvis online. What shall I adjust?",
  "Hey! At your service. What filter?",
  "I'm here! Tell me what to do.",
  "Jarvis activated! Go ahead."
]

function randomGreeting() {
  return greetings[Math.floor(Math.random() * greetings.length)]
}

// ─── FILTER ALIASES ─────────────────────────────────────────
// Maps spoken words → internal filter key
const aliases = {
  'brightness':      'brightness',
  'bright':          'brightness',
  'contrast':        'contrast',
  'saturation':      'saturation',
  'saturate':        'saturation',
  'color':           'saturation',
  'colour':          'saturation',
  'hue':             'hueRotation',
  'hue rotation':    'hueRotation',
  'rotation':        'hueRotation',
  'blur':            'blur',
  'blurriness':      'blur',
  'grayscale':       'grayscale',
  'gray':            'grayscale',
  'grey':            'grayscale',
  'greyscale':       'grayscale',
  'black and white': 'grayscale',
  'sepia':           'sepia',
  'opacity':         'opacity',
  'transparency':    'opacity',
  'invert':          'invert',
  'inversion':       'invert',
  'negative':        'invert'
}

const steps = {
  brightness: 15, contrast: 15, saturation: 15,
  hueRotation: 30, blur: 1,    grayscale: 15,
  sepia: 15,      opacity: 10, invert: 15
}

function findFilter(text) {
  const t = text.toLowerCase()
  // Try longest alias first to avoid partial matches
  const sorted = Object.keys(aliases).sort((a, b) => b.length - a.length)
  for (const alias of sorted) {
    if (t.includes(alias)) return aliases[alias]
  }
  return null
}

// ─── COMMAND HANDLER ────────────────────────────────────────
function handleCommand(raw) {
  const t = raw.toLowerCase().trim()
  console.log('[Jarvis] Command:', t)

  // RESET
  if (t.includes('reset')) {
    doReset()
    jarvisSpeak('Done! All filters have been reset.')
    return
  }

  // DOWNLOAD / SAVE
  if (t.includes('download') || t.includes('save')) {
    doDownload()
    jarvisSpeak('Image downloaded!')
    return
  }

  // PRESET — check all preset names
  for (const name of Object.keys(presets)) {
    if (t.includes(name)) {
      applyPreset(name)
      jarvisSpeak(`${name} preset applied!`)
      return
    }
  }

  // SET TO VALUE — "set brightness to 150" or "brightness to 80"
  const setMatch = t.match(/(\w[\w\s]*?)\s+to\s+(\d+)/)
  if (setMatch) {
    const filterName = findFilter(setMatch[1])
    const val = parseInt(setMatch[2])
    if (filterName && !isNaN(val)) {
      filters[filterName].value = Math.min(filters[filterName].max, Math.max(filters[filterName].min, val))
      syncSliders()
      applyFilters()
      jarvisSpeak(`${filterName} set to ${filters[filterName].value}.`)
      return
    }
  }

  // INCREASE
  if (t.match(/\b(increase|boost|raise|more|higher|add|maximize|max)\b/)) {
    const filterName = findFilter(t)
    if (filterName) {
      if (t.includes('max')) {
        filters[filterName].value = filters[filterName].max
      } else {
        filters[filterName].value = Math.min(
          filters[filterName].max,
          filters[filterName].value + steps[filterName]
        )
      }
      syncSliders()
      applyFilters()
      jarvisSpeak(`${filterName} increased to ${filters[filterName].value}.`)
      return
    }
  }

  // DECREASE
  if (t.match(/\b(decrease|reduce|lower|less|remove|minimize|min|down)\b/)) {
    const filterName = findFilter(t)
    if (filterName) {
      if (t.includes('min')) {
        filters[filterName].value = filters[filterName].min
      } else {
        filters[filterName].value = Math.max(
          filters[filterName].min,
          filters[filterName].value - steps[filterName]
        )
      }
      syncSliders()
      applyFilters()
      jarvisSpeak(`${filterName} decreased to ${filters[filterName].value}.`)
      return
    }
  }

  // Just a filter name, no action
  const filterName = findFilter(t)
  if (filterName) {
    jarvisSpeak(`You mentioned ${filterName}. Say increase or decrease ${filterName}, or set ${filterName} to a number.`)
    return
  }

  jarvisSpeak("Sorry, I didn't understand. Try: increase brightness, set contrast to 150, or apply vintage.")
}

// ─── SPEECH RECOGNITION ─────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

let recognition  = null
let micActive    = false   // true once user clicked Start
let jarvisAwake  = false   // true after wake word heard
let sleepTimer   = null
let isSpeaking   = false

// Wake word patterns — covers STT mishears
const wakePatterns = [
  /hey\s+jarvis/i,
  /hey\s+jarvi/i,
  /hey\s+jar\b/i,
  /hey\s+jarvie/i,
  /hey\s+jerry/i,
  /hey\s+java/i,
  /okay\s+jarvis/i,
  /hi\s+jarvis/i,
  /yo\s+jarvis/i
]

function isWake(text) {
  return wakePatterns.some(p => p.test(text))
}

function stripWake(text) {
  let t = text
  wakePatterns.forEach(p => { t = t.replace(p, '') })
  return t.replace(/^[,\s]+/, '').trim()
}

function onHeard(transcript) {
  const t = transcript.trim()
  if (!t) return

  console.log('[Jarvis] Heard:', t)
  showStatus(`Heard: "${t}"`, 'heard')

  if (isWake(t)) {
    // Wake word detected
    jarvisAwake = true
    clearTimeout(sleepTimer)
    const rest = stripWake(t)

    if (rest.length > 2) {
      // "Hey Jarvis increase brightness" — wake + command in one breath
      jarvisSpeak(randomGreeting(), () => {
        setTimeout(() => {
          handleCommand(rest)
          // reset sleep timer after command executes
          sleepTimer = setTimeout(goToSleep, 12000)
        }, 300)
      })
    } else {
      // Just the wake word — greet and wait for next command
      jarvisSpeak(randomGreeting(), () => {
        updateLabel('Say a command…')
        sleepTimer = setTimeout(goToSleep, 12000)
      })
    }
    return
  }

  if (jarvisAwake) {
    clearTimeout(sleepTimer)
    handleCommand(t)
    sleepTimer = setTimeout(goToSleep, 12000)
  }
  // If not awake and no wake word, just ignore
}

function goToSleep() {
  jarvisAwake = false
  updateLabel('Say "Hey Jarvis"')
  showStatus('Sleeping — say "Hey Jarvis" to wake me', 'info')
  setRing('idle')
}

// ─── MIC CONTROL ────────────────────────────────────────────
let recognitionRunning = false

function startMic() {
  if (!recognition || recognitionRunning) return
  try {
    recognition.start()
    recognitionRunning = true
  } catch(e) {
    recognitionRunning = false
  }
}

function stopMic() {
  if (!recognition || !recognitionRunning) return
  try {
    recognition.abort()
    recognitionRunning = false
  } catch(e) {
    recognitionRunning = false
  }
}

function setupMic() {
  if (!SpeechRecognition) {
    showStatus('Voice not supported. Use Chrome or Edge.', 'error')
    return
  }

  recognition = new SpeechRecognition()
  recognition.continuous      = true
  recognition.interimResults  = false
  recognition.lang            = 'en-US'
  recognition.maxAlternatives = 3

  recognition.onresult = e => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        // Try all alternatives — pick the one that matches wake word if any
        let best = e.results[i][0].transcript
        for (let j = 0; j < e.results[i].length; j++) {
          const alt = e.results[i][j].transcript
          if (isWake(alt)) { best = alt; break }
        }
        onHeard(best)
      }
    }
  }

  recognition.onstart  = () => { recognitionRunning = true  }
  recognition.onend    = () => {
    recognitionRunning = false
    // Auto-restart mic as long as it's active and Jarvis isn't speaking
    if (micActive) {
      setTimeout(() => {
        if (micActive && !window.speechSynthesis.speaking) startMic()
      }, 300)
    }
  }

  recognition.onerror = e => {
    recognitionRunning = false
    if (e.error === 'not-allowed') {
      showStatus('Mic access denied. Allow mic in browser and refresh.', 'error')
      micActive = false
      updateLabel('Mic blocked')
      setRing('error')
    }
    // Other errors (no-speech, network) auto-recover via onend
  }
}

// Called when user clicks "Start Jarvis" button
function startJarvis() {
  if (micActive) return
  if (!SpeechRecognition) {
    showStatus('Voice not supported. Please use Chrome.', 'error')
    return
  }

  micActive = true
  document.getElementById('jarvis-start-btn').style.display = 'none'
  document.getElementById('jarvis-status-bar').style.display = 'flex'

  setupMic()

  // Load voices first
  const loadAndStart = () => {
    startMic()
    setRing('idle')
    updateLabel('Say "Hey Jarvis"')
    showStatus('Mic on! Say "Hey Jarvis" to wake me.', 'info')
  }

  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    loadAndStart()
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null
      loadAndStart()
    }
    // Fallback if event never fires
    setTimeout(loadAndStart, 1000)
  }
}

// ─── UI HELPERS ─────────────────────────────────────────────
function showStatus(msg, type) {
  const el = document.getElementById('jarvis-bubble')
  if (!el) return
  el.textContent = msg
  el.dataset.type = type || 'info'
  el.classList.add('visible')
  clearTimeout(el._t)
  el._t = setTimeout(() => el.classList.remove('visible'), 6000)
}

function updateLabel(text) {
  const el = document.getElementById('jarvis-label')
  if (el) el.textContent = text
}

function setRing(state) {
  const ring = document.getElementById('jarvis-ring')
  const icon = document.getElementById('jarvis-icon')
  if (!ring) return
  ring.className = 'jarvis-ring ' + state
  if (state === 'idle')  icon.className = 'ri-mic-line'
  if (state === 'awake') icon.className = 'ri-mic-fill'
  if (state === 'error') icon.className = 'ri-mic-off-line'
}

// Sync ring to jarvisAwake state when mic restarts
setInterval(() => {
  if (!micActive) return
  if (jarvisAwake) setRing('awake')
  else setRing('idle')
}, 500)

// ─── BUILD WIDGET ────────────────────────────────────────────
function buildWidget() {
  const widget = document.createElement('div')
  widget.id = 'jarvis-widget'
  widget.innerHTML = `
    <div id="jarvis-avatar">
      <div id="jarvis-ring" class="jarvis-ring idle"></div>
      <div id="jarvis-icon-wrap">
        <i id="jarvis-icon" class="ri-mic-line"></i>
      </div>
    </div>

    <div id="jarvis-info">
      <div id="jarvis-name">JARVIS</div>
      <div id="jarvis-label">Voice Assistant</div>
    </div>

    <button id="jarvis-start-btn" onclick="startJarvis()">
      <i class="ri-mic-line"></i> Start Jarvis
    </button>

    <div id="jarvis-status-bar" style="display:none">
      <div id="jarvis-bubble"></div>
    </div>

    <div id="jarvis-hints">
      <span class="jhint">"Hey Jarvis"</span>
      <span class="jsep">→</span>
      <span class="jhint">"increase brightness"</span>
      <span class="jsep">·</span>
      <span class="jhint">"set contrast to 150"</span>
      <span class="jsep">·</span>
      <span class="jhint">"apply vintage"</span>
      <span class="jsep">·</span>
      <span class="jhint">"reset"</span>
    </div>
  `
  document.querySelector('main').prepend(widget)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildWidget)
} else {
  buildWidget()
}
