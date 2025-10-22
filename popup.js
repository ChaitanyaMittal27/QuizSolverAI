// Modern Popup Script
import { getCurrentTab } from "./utils.js";

let currentVideoId = null;

console.log("🚀 Popup script loaded");

// Format time for display (seconds to HH:MM:SS)
function formatTime(seconds) {
  const date = new Date(0);
  date.setSeconds(Math.floor(seconds));
  return date.toISOString().substring(11, 19);
}

// Play video from bookmarked timestamp
async function playBookmark(time) {
  console.log("▶️ Playing bookmark at:", time);

  const tab = await getCurrentTab();

  chrome.tabs.sendMessage(
    tab.id,
    {
      type: "PLAY",
      value: time,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error sending play message:", chrome.runtime.lastError);
      } else {
        console.log("✅ Play message sent");
      }
    }
  );

  // Close popup after clicking play (optional - remove if you want popup to stay open)
  window.close();
}

// Delete a bookmark
async function deleteBookmark(time) {
  if (!currentVideoId) return;

  console.log("🗑️ Deleting bookmark at:", time);

  // Get current bookmarks
  chrome.storage.sync.get([currentVideoId], (result) => {
    const bookmarks = result[currentVideoId] ? JSON.parse(result[currentVideoId]) : [];

    // Filter out deleted bookmark
    const updatedBookmarks = bookmarks.filter((b) => b.time !== time);

    console.log(`📝 Updated bookmarks: ${updatedBookmarks.length} (removed 1)`);

    // Save updated list
    chrome.storage.sync.set(
      {
        [currentVideoId]: JSON.stringify(updatedBookmarks),
      },
      () => {
        console.log("✅ Bookmark deleted from storage");
        // Refresh display
        displayBookmarks();
      }
    );
  });
}

// Display all bookmarks in the popup
function displayBookmarks() {
  const container = document.getElementById("bookmarks");

  if (!currentVideoId) {
    container.innerHTML = '<i class="row">Not on a YouTube video</i>';
    console.log("⚠️ No video ID - cannot display bookmarks");
    return;
  }

  console.log("📖 Loading bookmarks for video:", currentVideoId);

  chrome.storage.sync.get([currentVideoId], (result) => {
    const bookmarks = result[currentVideoId] ? JSON.parse(result[currentVideoId]) : [];

    console.log(`📚 Found ${bookmarks.length} bookmarks:`, bookmarks);

    if (bookmarks.length === 0) {
      container.innerHTML = '<i class="row">No bookmarks yet. Click the + button on the video player to add one!</i>';
      return;
    }

    // Clear container
    container.innerHTML = "";

    // Create bookmark elements
    bookmarks.forEach((bookmark, index) => {
      const bookmarkDiv = document.createElement("div");
      bookmarkDiv.className = "bookmark";
      bookmarkDiv.id = `bookmark-${bookmark.time}`;

      // Create title
      const titleDiv = document.createElement("div");
      titleDiv.className = "bookmark-title";
      titleDiv.textContent = bookmark.desc;

      // Create controls container
      const controlsDiv = document.createElement("div");
      controlsDiv.className = "bookmark-controls";

      // Play button
      const playBtn = document.createElement("img");
      playBtn.src = "assets/play.png";
      playBtn.title = "Play from this timestamp";
      playBtn.className = "play-btn";
      playBtn.dataset.time = bookmark.time;
      playBtn.onclick = () => playBookmark(bookmark.time);

      // Delete button
      const deleteBtn = document.createElement("img");
      deleteBtn.src = "assets/delete.png";
      deleteBtn.title = "Delete this bookmark";
      deleteBtn.className = "delete-btn";
      deleteBtn.dataset.time = bookmark.time;
      deleteBtn.onclick = () => deleteBookmark(bookmark.time);

      // Assemble the bookmark element
      controlsDiv.appendChild(playBtn);
      controlsDiv.appendChild(deleteBtn);
      bookmarkDiv.appendChild(titleDiv);
      bookmarkDiv.appendChild(controlsDiv);
      container.appendChild(bookmarkDiv);

      console.log(`  ${index + 1}. ${bookmark.desc} (${bookmark.time}s)`);
    });
  });
}

// Initialize popup when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📱 Popup DOM loaded");

  const tab = await getCurrentTab();
  console.log("📍 Current tab URL:", tab?.url);

  // Check if we're on a YouTube video page
  if (!tab?.url?.includes("youtube.com/watch")) {
    document.querySelector(".container").innerHTML = '<div class="title">Open a YouTube video to see bookmarks</div>';
    console.log("⚠️ Not on a YouTube video page");
    return;
  }

  // Extract video ID from URL
  const queryString = tab.url.split("?")[1];
  if (!queryString) {
    document.querySelector(".container").innerHTML = '<div class="title">Invalid YouTube video URL</div>';
    console.log("⚠️ No query string in URL");
    return;
  }

  const urlParams = new URLSearchParams(queryString);
  currentVideoId = urlParams.get("v");
  console.log("🎬 Current video ID:", currentVideoId);

  // Display bookmarks for this video
  displayBookmarks();
});
