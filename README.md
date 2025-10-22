# YouTube Bookmarker (MV3)

A lightweight Chrome extension that lets you **bookmark timestamps on YouTube videos** right from the player controls, and **play / delete** them from a clean popup UI. Inspired by this tutorial: https://www.youtube.com/watch?v=0n809nd4Zu4

## ✨ Features

- **“+” bookmark button** injected into the YouTube player controls  
  (adds a bookmark at the current timestamp).
- **Popup UI** to list, play, and delete bookmarks for the current video.
- **Persistent storage** per-video using `chrome.storage.sync`.
- **SPA-safe initialization** for YouTube’s in-page navigation (re-inits on URL change).
- **MV3 service worker** background script that detects new video navigations and notifies the content script.

## 🚀 Install (Developer Mode)

1. **Clone / download** this repo.
2. Open **Chrome** → `chrome://extensions`
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. Open any **YouTube video** and look for the **bookmark (“+”) icon** in the left player controls.

> Note: The popup lists bookmarks **only when the active tab is a `youtube.com/watch` page**.

## 🧠 How It Works

1. **Detect video changes**  
   The background service worker listens for tab updates; when a YouTube watch URL finishes loading, it extracts the `v` parameter and sends a `NEW_VIDEO` message to the tab’s content script.

2. **Inject UI & save bookmarks**  
   The content script waits for the player (`.video-stream`) and controls (`.ytp-left-controls`), injects an **image button** (from web-accessible resources), and on click, **saves `currentTime`** with a human label (HH:MM:SS) to `chrome.storage.sync` under the **current video ID**.

3. **View / play / delete in popup**  
   The popup reads the stored list for the current video, renders rows with **Play** and **Delete** actions; **Play** sends a message to the content script to seek the player to that timestamp; **Delete** removes the entry and re-renders.

## 🔒 Permissions

- `"storage"` — save bookmarks per video.
- `"tabs"` — detect current tab and send messages.
- `host_permissions: "https://*.youtube.com/*"` — run on YouTube pages and load assets.

## 🛠️ Development Notes

- **Web-accessible assets:** images are referenced using `chrome.runtime.getURL("assets/...")` from the content script and popup.
- **SPA handling:** a `MutationObserver` re-initializes when YouTube navigates to a new `/watch?v=...` without a full page reload.
- **Popup → player communication:** popup `PLAY` sends a message to the content script, which seeks the player.
- **Tab helper:** `utils.getCurrentTab()` is used by the popup to locate the active tab.

## 🧪 Common Gotchas & Fixes

- **`getURL` vs `getUrl`:** The correct API is `chrome.runtime.getURL(...)` (uppercase `URL`). Using `getUrl` will throw in content scripts.
- **Timestamp format:** Use `toISOString().substring(11, 19)` or a custom formatter for **HH:MM:SS**.
- **Extension context invalidated:** On YouTube SPA navigation or reload, pending async calls can fire after teardown. Re-init via the built-in navigation handling and avoid long async chains during unload.

## 🧹 Roadmap / Ideas

- Edit bookmark labels from the popup.
- Export/import bookmarks per video.
- Keyboard shortcuts for quick bookmarking.
- Sync fallback to local storage if desired.

## 🙌 Credits

- **Inspired by:** https://www.youtube.com/watch?v=0n809nd4Zu4
- Thanks to the Chrome Extensions API and YouTube’s player UI elements.

## 📄 License

See **LICENSE** in the repository.
