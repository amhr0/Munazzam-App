// Background Service Worker for Munazzam Chrome Extension

console.log('[Munazzam] Background service worker initialized');

// Store active recording sessions
const activeSessions = new Map();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Munazzam] Received message:', message.type);

  switch (message.type) {
    case 'START_RECORDING':
      handleStartRecording(message.data, sender.tab.id);
      sendResponse({ success: true });
      break;

    case 'STOP_RECORDING':
      handleStopRecording(sender.tab.id);
      sendResponse({ success: true });
      break;

    case 'SAVE_CHUNK':
      handleSaveChunk(message.data, sender.tab.id);
      sendResponse({ success: true });
      break;

    case 'GET_SETTINGS':
      getSettings().then(settings => {
        sendResponse({ success: true, settings });
      });
      return true; // Keep channel open for async response

    case 'SAVE_SETTINGS':
      saveSettings(message.data).then(() => {
        sendResponse({ success: true });
      });
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Handle start recording
function handleStartRecording(data, tabId) {
  console.log('[Munazzam] Starting recording for tab:', tabId);
  
  activeSessions.set(tabId, {
    meetingTitle: data.meetingTitle,
    platform: data.platform,
    startTime: Date.now(),
    chunks: []
  });

  // Notify popup
  chrome.runtime.sendMessage({
    type: 'RECORDING_STARTED',
    tabId
  }).catch(() => {
    // Popup might not be open, ignore error
  });
}

// Handle stop recording
function handleStopRecording(tabId) {
  console.log('[Munazzam] Stopping recording for tab:', tabId);
  
  const session = activeSessions.get(tabId);
  if (session) {
    // Upload to server
    uploadSession(session, tabId);
    activeSessions.delete(tabId);
  }

  // Notify popup
  chrome.runtime.sendMessage({
    type: 'RECORDING_STOPPED',
    tabId
  }).catch(() => {
    // Popup might not be open, ignore error
  });
}

// Handle save chunk
function handleSaveChunk(data, tabId) {
  const session = activeSessions.get(tabId);
  if (session) {
    session.chunks.push(data);
    console.log('[Munazzam] Saved chunk for tab:', tabId, 'Total chunks:', session.chunks.length);
  }
}

// Upload session to server
async function uploadSession(session, tabId) {
  try {
    const settings = await getSettings();
    const serverUrl = settings.serverUrl || 'https://3000-i4g58s1xnstugxt9oxcca-b42da8e4.manus-asia.computer';
    
    console.log('[Munazzam] Uploading session to server:', serverUrl);

    // Combine all chunks
    const combinedData = {
      meetingTitle: session.meetingTitle,
      platform: session.platform,
      startTime: session.startTime,
      endTime: Date.now(),
      duration: Date.now() - session.startTime,
      chunks: session.chunks
    };

    // Send to server
    const response = await fetch(`${serverUrl}/api/meetings/upload-from-extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiToken || ''}`
      },
      body: JSON.stringify(combinedData)
    });

    if (response.ok) {
      console.log('[Munazzam] Session uploaded successfully');
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/icon-128.png',
        title: 'منظم',
        message: 'تم حفظ الاجتماع بنجاح في منظم'
      });
    } else {
      console.error('[Munazzam] Failed to upload session:', response.statusText);
    }
  } catch (error) {
    console.error('[Munazzam] Error uploading session:', error);
  }
}

// Get settings from storage
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      serverUrl: 'https://3000-i4g58s1xnstugxt9oxcca-b42da8e4.manus-asia.computer',
      apiToken: '',
      autoRecord: true,
      recordVideo: true,
      recordAudio: true,
      enableCopilot: true
    }, (settings) => {
      resolve(settings);
    });
  });
}

// Save settings to storage
async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, () => {
      resolve();
    });
  });
}

// Handle tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeSessions.has(tabId)) {
    console.log('[Munazzam] Tab closed, stopping recording:', tabId);
    handleStopRecording(tabId);
  }
});

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Munazzam] Extension installed');
    // Open welcome page
    chrome.tabs.create({
      url: 'popup/welcome.html'
    });
  } else if (details.reason === 'update') {
    console.log('[Munazzam] Extension updated to version:', chrome.runtime.getManifest().version);
  }
});
