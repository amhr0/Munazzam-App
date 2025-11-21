// Popup Script for Munazzam Extension

document.addEventListener('DOMContentLoaded', async () => {
  // Get settings
  const settings = await getSettings();
  
  // Check connection status
  checkConnectionStatus(settings.serverUrl);
  
  // Setup event listeners
  setupEventListeners(settings);
});

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

// Check connection status
async function checkConnectionStatus(serverUrl) {
  const indicator = document.getElementById('status-indicator');
  const text = document.getElementById('status-text');
  const details = document.getElementById('status-details');
  
  try {
    const response = await fetch(`${serverUrl}/api/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      indicator.classList.add('connected');
      text.textContent = 'متصل بالخادم';
      details.textContent = `الخادم: ${serverUrl}`;
    } else {
      indicator.classList.add('disconnected');
      text.textContent = 'فشل الاتصال';
      details.textContent = 'تحقق من عنوان الخادم في الإعدادات';
    }
  } catch (error) {
    indicator.classList.add('disconnected');
    text.textContent = 'غير متصل';
    details.textContent = 'تأكد من تشغيل الخادم وإعداد العنوان الصحيح';
  }
}

// Setup event listeners
function setupEventListeners(settings) {
  // Open dashboard
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({
      url: settings.serverUrl
    });
  });
  
  // Toggle sidebar
  document.getElementById('toggle-sidebar').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on Meet or Zoom
    if (tab.url.includes('meet.google.com') || 
        tab.url.includes('zoom.us') || 
        tab.url.includes('zoom.com')) {
      
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_SIDEBAR'
      });
      
      window.close();
    } else {
      alert('يرجى فتح صفحة Google Meet أو Zoom أولاً');
    }
  });
  
  // Open settings
  document.getElementById('open-settings').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
    window.close();
  });
}
