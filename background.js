// Modern Service Worker for Manifest V3
// Handles tab updates and sends messages to content script

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only act when page has fully loaded
  if (changeInfo.status === "complete" && tab.url?.includes("youtube.com/watch")) {
    const queryParams = tab.url.split("?")[1];
    const urlParams = new URLSearchParams(queryParams);
    const videoId = urlParams.get("v");

    if (videoId) {
      console.log("📺 New YouTube video detected:", videoId);

      // Send message to content script
      chrome.tabs
        .sendMessage(tabId, {
          type: "NEW_VIDEO",
          videoId: videoId,
        })
        .catch((err) => {
          // Content script might not be ready yet - that's normal
          console.log("Content script not ready (will initialize itself):", err.message);
        });
    }
  }
});

console.log("🚀 Background service worker started");
