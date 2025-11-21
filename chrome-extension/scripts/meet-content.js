// Content Script for Google Meet
console.log('[Munazzam Meet] Content script loaded');

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let socket = null;
let sessionId = null;

// Initialize
async function init() {
  console.log('[Munazzam Meet] Initializing...');
  
  // Get settings
  const settings = await getSettings();
  
  // Inject sidebar
  injectSidebar();
  
  // Wait for meeting to start
  waitForMeeting();
  
  // If auto-record is enabled, start recording when meeting starts
  if (settings.autoRecord) {
    observeMeetingStart();
  }
}

// Get settings from background
async function getSettings() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
      resolve(response.settings);
    });
  });
}

// Wait for meeting to be ready
function waitForMeeting() {
  const checkInterval = setInterval(() => {
    // Check if we're in a meeting (video elements exist)
    const videoElements = document.querySelectorAll('video');
    if (videoElements.length > 0) {
      console.log('[Munazzam Meet] Meeting detected');
      clearInterval(checkInterval);
      onMeetingReady();
    }
  }, 1000);
}

// Meeting is ready
async function onMeetingReady() {
  console.log('[Munazzam Meet] Meeting is ready');
  
  const settings = await getSettings();
  
  // Connect to Socket.io if copilot is enabled
  if (settings.enableCopilot) {
    connectToSocket(settings.serverUrl);
  }
  
  // Show start button in sidebar
  updateSidebarStatus('ready');
}

// Observe meeting start
function observeMeetingStart() {
  // Watch for meeting title change (indicates meeting started)
  const titleObserver = new MutationObserver(() => {
    const title = getMeetingTitle();
    if (title && !isRecording) {
      console.log('[Munazzam Meet] Meeting started:', title);
      startRecording();
    }
  });
  
  titleObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Get meeting title
function getMeetingTitle() {
  // Try different selectors for meeting title
  const selectors = [
    '[data-meeting-title]',
    '[data-call-title]',
    '.u6vdEc', // Google Meet title class (may change)
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent.trim();
    }
  }
  
  // Fallback to page title
  return document.title.replace(' - Google Meet', '').trim() || 'اجتماع Google Meet';
}

// Start recording
async function startRecording() {
  if (isRecording) return;
  
  try {
    console.log('[Munazzam Meet] Starting recording...');
    
    const settings = await getSettings();
    
    // Get display media (screen + audio)
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: settings.recordVideo ? {
        mediaSource: 'tab', // Capture current tab
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      } : false,
      audio: settings.recordAudio ? {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      } : false
    });
    
    // Create media recorder
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    mediaRecorder = new MediaRecorder(stream, options);
    
    recordedChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        
        // Send chunk to background for processing
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          
          chrome.runtime.sendMessage({
            type: 'SAVE_CHUNK',
            data: {
              data: base64data,
              timestamp: Date.now(),
              type: 'video/webm'
            }
          });
          
          // Also send audio to Socket.io for live analysis
          if (socket && socket.connected) {
            sendAudioToSocket(base64data);
          }
        };
        reader.readAsDataURL(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      console.log('[Munazzam Meet] Recording stopped');
      stream.getTracks().forEach(track => track.stop());
      isRecording = false;
      updateSidebarStatus('stopped');
      
      // End socket session
      if (socket && sessionId) {
        socket.emit('end-session', { sessionId });
      }
    };
    
    // Start recording (save chunks every 5 seconds)
    mediaRecorder.start(5000);
    isRecording = true;
    
    // Notify background
    chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      data: {
        meetingTitle: getMeetingTitle(),
        platform: 'google-meet'
      }
    });
    
    // Start socket session if enabled
    if (socket && socket.connected) {
      startSocketSession();
    }
    
    updateSidebarStatus('recording');
    
    console.log('[Munazzam Meet] Recording started successfully');
  } catch (error) {
    console.error('[Munazzam Meet] Error starting recording:', error);
    updateSidebarStatus('error', error.message);
  }
}

// Stop recording
function stopRecording() {
  if (!isRecording || !mediaRecorder) return;
  
  console.log('[Munazzam Meet] Stopping recording...');
  mediaRecorder.stop();
  
  // Notify background
  chrome.runtime.sendMessage({
    type: 'STOP_RECORDING'
  });
}

// Connect to Socket.io
function connectToSocket(serverUrl) {
  console.log('[Munazzam Meet] Connecting to Socket.io:', serverUrl);
  
  // Load Socket.io client
  const script = document.createElement('script');
  script.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
  script.onload = () => {
    socket = io(`${serverUrl}/live-copilot`, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
      console.log('[Munazzam Meet] Socket.io connected');
      updateSidebarStatus('connected');
    });
    
    socket.on('disconnect', () => {
      console.log('[Munazzam Meet] Socket.io disconnected');
    });
    
    socket.on('transcription', (data) => {
      addTranscriptionToSidebar(data);
    });
    
    socket.on('suggestions', (data) => {
      addSuggestionsToSidebar(data.suggestions);
    });
    
    socket.on('red-flags', (data) => {
      addRedFlagsToSidebar(data.redFlags);
    });
  };
  document.head.appendChild(script);
}

// Start socket session
function startSocketSession() {
  if (!socket || !socket.connected) return;
  
  socket.emit('start-session', {
    userId: 1, // TODO: Get from settings
    candidateName: 'مشارك في الاجتماع',
    position: getMeetingTitle()
  });
  
  socket.once('session-started', (data) => {
    sessionId = data.sessionId;
    console.log('[Munazzam Meet] Socket session started:', sessionId);
  });
}

// Send audio to socket
function sendAudioToSocket(base64Audio) {
  if (!socket || !socket.connected || !sessionId) return;
  
  socket.emit('audio-chunk', {
    sessionId,
    audioData: base64Audio,
    speaker: 'candidate' // TODO: Detect speaker
  });
}

// Inject sidebar
function injectSidebar() {
  const sidebar =
 document.createElement('div');
  sidebar.id = 'munazzam-sidebar';
  sidebar.innerHTML = `
    <div class="munazzam-header">
      <img src="${chrome.runtime.getURL('assets/icon-48.png')}" alt="منظم" class="munazzam-logo">
      <h3>منظم - المساعد الذكي</h3>
      <button id="munazzam-close" class="munazzam-close-btn">×</button>
    </div>
    
    <div class="munazzam-status">
      <div class="munazzam-status-indicator" id="munazzam-status-indicator"></div>
      <span id="munazzam-status-text">جاري التحميل...</span>
    </div>
    
    <div class="munazzam-controls">
      <button id="munazzam-start-btn" class="munazzam-btn munazzam-btn-primary" disabled>
        <span class="munazzam-icon">🎙️</span>
        بدء التسجيل
      </button>
      <button id="munazzam-stop-btn" class="munazzam-btn munazzam-btn-danger" style="display:none;">
        <span class="munazzam-icon">⏹️</span>
        إيقاف التسجيل
      </button>
    </div>
    
    <div class="munazzam-tabs">
      <button class="munazzam-tab active" data-tab="transcript">النص المباشر</button>
      <button class="munazzam-tab" data-tab="suggestions">الاقتراحات</button>
      <button class="munazzam-tab" data-tab="flags">العلامات الحمراء</button>
    </div>
    
    <div class="munazzam-content">
      <div id="munazzam-transcript" class="munazzam-tab-content active">
        <div class="munazzam-empty">ابدأ التسجيل لرؤية النص المباشر</div>
      </div>
      <div id="munazzam-suggestions" class="munazzam-tab-content">
        <div class="munazzam-empty">لا توجد اقتراحات بعد</div>
      </div>
      <div id="munazzam-flags" class="munazzam-tab-content">
        <div class="munazzam-empty">لا توجد علامات حمراء</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(sidebar);
  
  // Add event listeners
  document.getElementById('munazzam-close').addEventListener('click', () => {
    sidebar.style.display = 'none';
  });
  
  document.getElementById('munazzam-start-btn').addEventListener('click', startRecording);
  document.getElementById('munazzam-stop-btn').addEventListener('click', stopRecording);
  
  // Tab switching
  document.querySelectorAll('.munazzam-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.munazzam-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.munazzam-tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`munazzam-${tabName}`).classList.add('active');
    });
  });
}

// Update sidebar status
function updateSidebarStatus(status, message = '') {
  const indicator = document.getElementById('munazzam-status-indicator');
  const text = document.getElementById('munazzam-status-text');
  const startBtn = document.getElementById('munazzam-start-btn');
  const stopBtn = document.getElementById('munazzam-stop-btn');
  
  switch (status) {
    case 'ready':
      indicator.className = 'munazzam-status-indicator munazzam-status-ready';
      text.textContent = 'جاهز للتسجيل';
      startBtn.disabled = false;
      break;
    
    case 'recording':
      indicator.className = 'munazzam-status-indicator munazzam-status-recording';
      text.textContent = 'جاري التسجيل...';
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      break;
    
    case 'stopped':
      indicator.className = 'munazzam-status-indicator munazzam-status-ready';
      text.textContent = 'تم إيقاف التسجيل';
      startBtn.style.display = 'block';
      stopBtn.style.display = 'none';
      startBtn.disabled = false;
      break;
    
    case 'connected':
      indicator.className = 'munazzam-status-indicator munazzam-status-connected';
      text.textContent = 'متصل بالمساعد الخفي';
      break;
    
    case 'error':
      indicator.className = 'munazzam-status-indicator munazzam-status-error';
      text.textContent = `خطأ: ${message}`;
      startBtn.disabled = false;
      break;
  }
}

// Add transcription to sidebar
function addTranscriptionToSidebar(data) {
  const container = document.getElementById('munazzam-transcript');
  const empty = container.querySelector('.munazzam-empty');
  if (empty) empty.remove();
  
  const item = document.createElement('div');
  item.className = `munazzam-transcript-item munazzam-speaker-${data.speaker}`;
  item.innerHTML = `
    <div class="munazzam-transcript-header">
      <span class="munazzam-speaker-badge">${data.speaker === 'interviewer' ? 'أنت' : 'المشارك'}</span>
      <span class="munazzam-timestamp">${new Date(data.timestamp).toLocaleTimeString('ar')}</span>
    </div>
    <div class="munazzam-transcript-text">${data.text}</div>
  `;
  
  container.appendChild(item);
  container.scrollTop = container.scrollHeight;
}

// Add suggestions to sidebar
function addSuggestionsToSidebar(suggestions) {
  const container = document.getElementById('munazzam-suggestions');
  const empty = container.querySelector('.munazzam-empty');
  if (empty) empty.remove();
  
  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = `munazzam-suggestion-item munazzam-suggestion-${suggestion.type}`;
    item.innerHTML = `
      <div class="munazzam-suggestion-icon">${getSuggestionIcon(suggestion.type)}</div>
      <div class="munazzam-suggestion-content">
        <div class="munazzam-suggestion-type">${getSuggestionTypeText(suggestion.type)}</div>
        <div class="munazzam-suggestion-text">${suggestion.content}</div>
      </div>
    `;
    
    container.insertBefore(item, container.firstChild);
  });
}

// Add red flags to sidebar
function addRedFlagsToSidebar(flags) {
  const container = document.getElementById('munazzam-flags');
  const empty = container.querySelector('.munazzam-empty');
  if (empty) empty.remove();
  
  flags.forEach(flag => {
    const item = document.createElement('div');
    item.className = `munazzam-flag-item munazzam-flag-${flag.severity}`;
    item.innerHTML = `
      <div class="munazzam-flag-icon">⚠️</div>
      <div class="munazzam-flag-content">
        <div class="munazzam-flag-severity">${getSeverityText(flag.severity)}</div>
        <div class="munazzam-flag-text">${flag.flag}</div>
      </div>
    `;
    
    container.appendChild(item);
  });
}

// Helper functions
function getSuggestionIcon(type) {
  switch (type) {
    case 'question': return '❓';
    case 'concern': return '⚠️';
    case 'insight': return '💡';
    default: return '💬';
  }
}

function getSuggestionTypeText(type) {
  switch (type) {
    case 'question': return 'سؤال مقترح';
    case 'concern': return 'مخاوف';
    case 'insight': return 'رؤية';
    default: return 'ملاحظة';
  }
}

function getSeverityText(severity) {
  switch (severity) {
    case 'high': return 'خطورة عالية';
    case 'medium': return 'خطورة متوسطة';
    case 'low': return 'خطورة منخفضة';
    default: return 'ملاحظة';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
