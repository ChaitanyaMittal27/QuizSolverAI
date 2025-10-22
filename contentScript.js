// Modern Content Script - Injected into YouTube pages
// Self-contained, doesn't rely on background script staying alive

(() => {
  let currentVideoId = "";
  let player = null;
  let initialized = false;

  console.log("🚀 YouTube Bookmarker content script loaded");

  // Extract video ID from current page URL
  function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("v");
  }

  // Wait for YouTube player elements to be ready
  function waitForPlayer() {
    return new Promise((resolve) => {
      const checkPlayer = () => {
        const videoElement = document.querySelector(".video-stream");
        const controls = document.querySelector(".ytp-left-controls");

        if (videoElement && controls) {
          console.log("✅ YouTube player found");
          resolve({ videoElement, controls });
        } else {
          setTimeout(checkPlayer, 100);
        }
      };
      checkPlayer();
    });
  }

  // Format seconds to HH:MM:SS
  function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(Math.floor(seconds));
    return date.toISOString().substring(11, 19);
  }

  // Get bookmarks for current video from storage
  async function getBookmarks() {
    if (!currentVideoId) return [];

    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideoId], (result) => {
        const bookmarks = result[currentVideoId] ? JSON.parse(result[currentVideoId]) : [];
        console.log(`📚 Loaded ${bookmarks.length} bookmarks for video ${currentVideoId}`);
        resolve(bookmarks);
      });
    });
  }

  // Save a new bookmark
  async function saveBookmark(time) {
    if (!currentVideoId) {
      console.error("❌ No video ID - cannot save bookmark");
      return false;
    }

    const bookmarks = await getBookmarks();
    const newBookmark = {
      time: time,
      desc: `Bookmark at ${formatTime(time)}`,
    };

    const updatedBookmarks = [...bookmarks, newBookmark].sort((a, b) => a.time - b.time);

    return new Promise((resolve) => {
      chrome.storage.sync.set(
        {
          [currentVideoId]: JSON.stringify(updatedBookmarks),
        },
        () => {
          console.log("✅ Bookmark saved:", newBookmark);
          resolve(true);
        }
      );
    });
  }

  // Create and add the bookmark button to YouTube player
  async function addBookmarkButton() {
    const { videoElement, controls } = await waitForPlayer();
    player = videoElement;

    // Check if button already exists (prevent duplicates)
    if (document.querySelector(".yt-bookmark-btn")) {
      console.log("⚠️ Bookmark button already exists");
      return;
    }

    // Create bookmark button
    const button = document.createElement("img");
    button.src = chrome.runtime.getURL("assets/bookmark.png");
    button.className = "yt-bookmark-btn ytp-button";
    button.title = "Add Bookmark";
    button.style.cssText = "width: 36px; height: 36px; cursor: pointer;";

    // Handle button click
    button.onclick = async () => {
      const currentTime = player.currentTime;
      console.log("➕ Bookmark button clicked at time:", currentTime);

      const success = await saveBookmark(currentTime);

      if (success) {
        showNotification(`✓ Bookmarked at ${formatTime(currentTime)}`);
      } else {
        showNotification("❌ Failed to save bookmark", true);
      }
    };

    controls.appendChild(button);
    console.log("✅ Bookmark button added to player controls");
  }

  // Show temporary notification on the page
  function showNotification(message, isError = false) {
    // Add animation styles if not already present
    if (!document.getElementById("yt-bookmark-styles")) {
      const style = document.createElement("style");
      style.id = "yt-bookmark-styles";
      style.textContent = `
        @keyframes ytBookmarkSlideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes ytBookmarkSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${isError ? "#f44336" : "#4caf50"};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-family: 'Roboto', 'Arial', sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: ytBookmarkSlideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 2 seconds with slide-out animation
    setTimeout(() => {
      notification.style.animation = "ytBookmarkSlideOut 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Initialize for current video
  async function initialize() {
    currentVideoId = getVideoId();

    if (!currentVideoId) {
      console.log("⚠️ Not on a video page");
      return;
    }

    console.log("🎬 Initializing for video:", currentVideoId);
    await addBookmarkButton();
    initialized = true;
  }

  // Listen for messages from background script or popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("📨 Message received:", message);

    if (message.type === "NEW_VIDEO") {
      currentVideoId = message.videoId;
      console.log("🆕 New video from background script:", currentVideoId);
      if (!initialized) {
        initialize();
      }
    } else if (message.type === "PLAY") {
      if (player && message.value) {
        player.currentTime = parseFloat(message.value);
        console.log("▶️ Playing from timestamp:", message.value);
      } else {
        console.error("❌ Cannot play - player not ready or no timestamp");
      }
    } else if (message.type === "GET_VIDEO_ID") {
      sendResponse({ videoId: currentVideoId });
    }
  });

  // Initialize on page load
  initialize();

  // Handle YouTube's Single Page App (SPA) navigation
  // YouTube doesn't reload the page when navigating between videos
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      if (url.includes("/watch?v=")) {
        console.log("🔄 YouTube navigation detected, reinitializing...");
        initialized = false;
        initialize();
      }
    }
  }).observe(document.body, { subtree: true, childList: true });

  console.log("✅ Content script initialization complete");
})();
