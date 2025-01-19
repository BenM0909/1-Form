// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.endsWith('.pdf')) {
    // Inject PDF.js if we detect a PDF
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['pdf.js', 'contentScript.js']
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PDF_DETECTED') {
    // Update extension icon or state
    chrome.action.setBadgeText({
      text: 'PDF',
      tabId: sender.tab.id
    });
  }
});

