<div align="center" id="top">
  <img src="https://addons.mozilla.org/user-media/addon_icons/2896/2896871-64.png?modified=27941528" alt="AEG Logo" width="64px" />
  <h2>:link: Artwork Extractor for Genius :yellow_square:</h2>
</div>

<div align="center">
  <a href="#memo-description">Description</a> &#xa0; | &#xa0;
  <a href="#rocket-installation">Installation</a> &#xa0; | &#xa0;
  <a href="#gear-configuration">Configuration</a> &#xa0; | &#xa0;
  <a href="#open_book-usage">Usage</a> &#xa0; | &#xa0;
  <a href="#bug-troubleshooting">Troubleshooting</a> &#xa0; | &#xa0;
  <a href="#card_file_box-project-roadmap">Roadmap</a>
</div>
&#xa0;

<div align="center">
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/commits/main"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/JonasWeinhold/Artwork-Extractor-for-Genius?color=blueviolet&logo=clarifai" /></a>
</div>
<div align="center">
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/JonasWeinhold/Artwork-Extractor-for-Genius?color=red&logo=stackedit" /></a>
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/JonasWeinhold/Artwork-Extractor-for-Genius?style=flat&color=%23ffe937&logo=github" /></a>
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/JonasWeinhold/Artwork-Extractor-for-Genius?color=forestgreen&logo=target" /></a>
</div>
&#xa0;

## :memo: Description

**Artwork Extractor for Genius** is a powerful browser extension designed for music contributors, editors, and transcribers. It facilitates rapid metadata transfer, artwork extraction, and provides powerful on-site editing scripts between streaming services and [Genius.com](https://genius.com).

**Compatible with Chrome, Firefox, Edge, and all other Chromium web browsers!**

### :musical_note: Key Features

#### 🌐 Supported Platforms
Adds "Copy Cover" / "Save Cover" buttons and scripts to the following domains:
- **Genius:** `genius.com` (+ `genius-staging.com`)
- **Apple Music:** `*.apple.com`
- **Spotify:** `*.spotify.com`
- **Deezer:** `*.deezer.com`
- **Tidal:** `*.tidal.com`
- **YouTube Music:** `music.youtube.com`
- **SoundCloud:** `*.soundcloud.com`
- **Bandcamp:** `*.bandcamp.com`
- **Yandex Music:** `*.yandex.ru`
- **Instagram:** `*.instagram.com`
- **Databases:** `45cat.com`, `45worlds.com`, `45spaces.com`

#### 🎨 Artwork & Image Tools
- **Extraction Modes:**
  - **Copy image URL** (default)
  - **Download/save image** (programmatic file download)
  - **Convert to PNG** (client-side canvas conversion for JPG sources)
  - **Host image** (upload to ImgBB or Genius and copy the new URL)
- **High-Res Retrieval:** Fetches maximum resolution artwork (up to 1000x1000 or higher) using internal APIs for Spotify and Tidal.

#### 🧠 Genius Editing Suite
- **Metadata Editor:** A custom overlay on Album pages to bulk edit Song Relationships, Languages, Tags, Release Dates, and Credits for all tracks at once.
- **Quality of Life:**
  - **ZWSP Detection:** Visual indicators (colored dots) for "Zero Width Spaces" in titles.
  - **Lyrics Status:** Visual indicators in tracklists showing if lyrics are complete/verified.
  - **Cover Art Status:** Visual indicators in tracklists showing if the uploaded song (cover) art is of good quality.
  - **Mass Actions:** "Follow All Songs" / "Unfollow All Songs" on Artist pages.
- **Tracklist Management:** Tools to expand tracklists, fix numbering, and mark tracks as unreleased.
- **Formatting Tools:** Toolbar in the Lyrics Editor for quick formatting (Headers, Bold, Italic) and cleanup.

#### 🎧 Streaming Service Enhancements
- **Copy Tracklist (CT):** Copies formatted song titles from Spotify/Apple Music playlists for easy pasting into Genius.
- **Copy Credits (CC):** Extracts credit information from Tidal and Apple Music.
- **Ad Blocking:** Auto-closes premium popups on Deezer/Tidal and banners on SoundCloud.

## :rocket: Installation

### Official Stores
- [Chrome Extension](https://chromewebstore.google.com/detail/artwork-extractor-for-gen/oifdmdbfhcamieniopjddpohkbbmoaeb)
- [Mozilla / Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/artwork-extractor-for-genius/)

### Manual Installation (Development)
1.  **Download:** Clone this repository or download the ZIP.
2.  **Unzip:** Extract the `Artwork-Extractor-for-Genius/` folder.
3.  **Load in Browser:**
    *   **Chrome/Edge/Brave:** Go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the extracted folder.
    *   **Firefox:** Go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select the `manifest.json` file.

## :gear: Configuration

Access the dashboard by clicking the extension icon and selecting **"Settings & Guides"**.

### Hosting & API Keys
To unlock full functionality, you may need to provide API keys. These are stored locally (`chrome.storage.local`) or in `Services/secrets.js` (for dev):

1.  **ImgBB:**
    *   Required if you enable "Host Image" functionality via ImgBB.
    *   Set the key in the Settings page.

2.  **Genius / Filestack (Genius S3):**
    *   Required for uploading covers directly to Genius.
    *   **Setup:** The extension needs to capture `GENIUS_API`, `GENIUS_POLICY`, and `GENIUS_SIGNATURE`. Go to any Genius page with an image uploader (e.g., "Edit Cover Art"), open the upload dialog, and the extension will automatically scrape/save these keys.

3.  **Spotify & Tidal Credentials:**
    *   Required for fetching high-res artwork via official APIs.
    *   **Variables:** `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` and `TIDAL_CLIENT_ID` / `TIDAL_CLIENT_SECRET`.
    *   *Note:* Ensure your credentials allow the `client_credentials` flow.

## :open_book: Usage

### On Streaming Services
1.  Navigate to a supported site (e.g., Spotify Album Page).
2.  **Check Status:** Click the extension icon and ensure the site is enabled (icon should not look "inactive").
3.  **Refresh:** Reload the tab (Important for SPAs like Spotify).
4.  **Action:** Use the injected **"Copy Cover"**, **"Save Cover"**, or **"CT" (Copy Tracklist)** buttons.

### On Genius.com
1.  **Song Page:** Use the added toolbar buttons to format lyrics or check metadata.
2.  **Album Page:**
    *   Click **"Song Credits"** to open the Bulk Metadata Editor overlay.
    *   Use the **"Tracklist"** tools to fix numbering or expand all credits.
3.  **Artist Page:** Use the **"Follow All"** button to track an artist's entire discography.

## :bug: Troubleshooting

### "Hosting Error" / Filestack Issues
If uploading to Genius (Filestack) fails, the extension likely needs a fresh session key.
1.  Go to any Genius page with an image uploader.
2.  Open the upload dialog window.
3.  Wait for the extension to capture the new credentials.
4.  Try your action again.

### Buttons Not Appearing?
*   **Enable the Site:** Check the extension popup icon.
*   **Refresh:** Reload the tab. Scripts sometimes fail to attach on the first load of Single Page Applications (SPAs).
*   **Interact:** Sometimes buttons appear only after clicking the page once.

### Spotify/Tidal Fetch Fails
*   Populate API credentials in [Services/secrets.js](Services/secrets.js) or the settings page.
*   Confirm your credentials allow the `client_credentials` flow.

## :card_file_box: Project Structure

There is no build pipeline; edits are made directly in plain HTML/CSS/JS.

```
├── .github/             # Issue templates
├── Popup/               # UI for the browser action and settings page
│   ├── popup.html       # The small toggle menu
│   ├── popup.js         # Per-site enable/disable toggles
│   ├── settings.html    # The main configuration dashboard
│   └── settings_guides.js # Settings logic (stored in chrome.storage.local)
├── Services/            # Core logic scripts per website
│   ├── apple.js         # Apple Music integration
│   ├── spotify.js       # Spotify integration
│   ├── genius_*.js      # Genius specific tools (Album/Artist/Song)
│   ├── streaming_utils.js # Shared image processing (PNG conversion, upload)
│   └── secrets.js       # API Key placeholders + local storage wiring
└── manifest.json        # Extension configuration (MV3) + content script registration
```

### Development Workflow
1.  Load unpacked extension.
2.  Make changes to the code.
3.  Go to `chrome://extensions` and click **Reload** on the extension card.
4.  Reload the target website tab to test changes.

## :card_file_box: Project Roadmap

Find releases/versions in the [/releases](https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/releases)

### 🔮 Future Improvements
All planned features are listed in the [Issues tab](https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/issues).
*   🚀 = New Features
*   ↗️ = Improvements

Don't hesitate to suggest new ideas by **opening an issue**!

You can also join our Discord server [here](https://discord.com/channels/768245765629018133/1366120229368758402)

---

Developed with ❤️ by the Genius community to enhance the Genius experience.

<br />

[Back to top](#top)
