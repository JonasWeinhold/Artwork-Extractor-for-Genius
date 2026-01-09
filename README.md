<div align="center" id="top">
  <img src="https://addons.mozilla.org/user-media/addon_icons/2896/2896871-64.png?modified=27941528" alt="AEG Logo" width="64px" />
  <h2>:link: Artwork Extractor for Genius :yellow_square:</h2>
</div>

<div align="center">
  <a href="#memo-description">Description</a> &#xa0; | &#xa0;
  <a href="#rocket-installation">Installation</a> &#xa0; | &#xa0;
  <a href="#open_book-usage--general-information">Usage & General Information</a> &#xa0; | &#xa0;
  <a href="#bug-troubleshooting">Troubleshooting</a> &#xa0; | &#xa0;
  <a href="#card_file_box-project-roadmap">Project Roadmap</a>
</div>
&#xa0;

<div align="center">
  <a href="#card_file_box-changelog"><img alt="Last version released" src="https://img.shields.io/badge/release-v0.4.8-blue?logo=semver" /></a>
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/commits/main"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/JonasWeinhold/Artwork-Extractor-for-Genius?color=blueviolet&logo=clarifai" /></a>
</div>
<div align="center">
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/JonasWeinhold/Artwork-Extractor-for-Genius?color=red&logo=stackedit" /></a>
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/JonasWeinhold/Artwork-Extractor-for-Genius?style=flat&color=%23ffe937&logo=github" /></a>
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/JonasWeinhold/Artwork-Extractor-for-Genius?color=forestgreen&logo=target" /></a>
  <a href="#card_file_box-changelog"><img alt="GitHub repository size" src="https://img.shields.io/github/languages/code-size/JonasWeinhold/Artwork-Extractor-for-Genius?color=blue&logo=frontify" /></a>
</div>
&#xa0;

## :memo: Description

A browser extension that adds “Copy Cover” / “Save Cover” helpers on Genius and popular music platforms.  
It's primarily built to quickly grab cover artwork URLs (and optionally convert/host/download them) while working with [genius.com](https://genius.com).  
**Compatible with Chrome, Firefox, Edge, and all other Chromium web browsers!**

### :musical_note: Features

- Adds UI buttons on supported sites (see below) to copy an artwork URL to your clipboard, or download the image.
  - Genius: `genius.com` (+ `genius-staging.com`)
  - Apple Music: `*.apple.com`
  - Spotify: `*.spotify.com`
  - Deezer: `*.deezer.com`
  - Tidal: `*.tidal.com`
  - YouTube Music: `music.youtube.com`
  - SoundCloud: `*.soundcloud.com`
  - Bandcamp: `*.bandcamp.com`
  - Yandex Music: `*.yandex.ru`
  - Instagram: `*.instagram.com`
  - 45cat / 45worlds / 45spaces
- Adds a popup UI to enable/disable each supported site script per-browser.
- Adds a settings page with lots of per-site toggles (copy cover, copy tracklist, popups, conversions, hosting options, etc.).
- On Genius pages, it can also add various editing/utility helpers (song/album/artist tools).

## :rocket: Installation

Either install the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/bc-plume-bandcamp-player/ldojecagppaiodalfjnhandfjkiljplm) or the [Mozilla Add-ons site](https://addons.mozilla.org/fr/firefox/addon/bc-plume).  
If you want to install it manually (for local build or development), follow these instructions:

1. Open your browser's extensions page.
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the folder: `Artwork-Extractor-for-Genius/`

### Hosting & API keys

This extension supports multiple “outputs” when you click Copy/Save:

- **Copy image URL** (default)
- **Download/save image** (writes a file via a programmatic download)
- **Convert to PNG** (client-side canvas conversion for JPG sources)
- **Host image** (upload and then copy the hosted URL)

#### ImgBB

If you enable ImgBB hosting, you must provide an ImgBB API key:

- Set it in the settings page (stored in `chrome.storage.local`).

#### Genius / Filestack (Genius S3)

Some hosting modes use Filestack endpoints with Genius credentials (`GENIUS_API`, `GENIUS_POLICY`, `GENIUS_SIGNATURE`).  
If hosting fails with a “Hosting Error”, open a Genius page where the Filestack uploader appears (e.g., an image upload flow) so the extension can capture the credentials.

#### Spotify / Tidal API credentials

Some features fetch artwork via official APIs and require client credentials:

- Spotify: `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`
- Tidal: `TIDAL_CLIENT_ID` / `TIDAL_CLIENT_SECRET`

These are currently defined in [Services/secrets.js](Services/secrets.js) as empty strings.  
For local development, you will need to populate them.

> Keep your credentials private. Don't commit real keys.

## :open_book: Usage & General Information

1. Navigate to a supported site (e.g. Spotify album page, Genius song page).
2. Click the extension icon to open the popup.
3. Ensure the site you're on is **enabled** (icon should not look “inactive”).
4. Reload the tab (some sites are single-page apps; reload helps scripts attach).
5. Use the injected buttons (e.g. **Copy Cover** / **Save Cover**).

### 📝 Development notes

There is no build pipeline; edits are plain HTML/CSS/JS.
Key files:

- [manifest.json](manifest.json): MV3 manifest + content script registration
- [Popup/popup.html](Popup/popup.html): popup UI
- [Popup/popup.js](Popup/popup.js): per-site enable/disable toggles
- [Popup/settings_guides.html](Popup/settings_guides.html): settings UI
- [Popup/settings_guides.js](Popup/settings_guides.js): settings logic (stored in `chrome.storage.local`)
- [Services/streaming_utils.js](Services/streaming_utils.js): shared image processing (convert/download/upload/copy)
- [Services/secrets.js](Services/secrets.js): API key placeholders + local storage wiring

Typical workflow:

1. Load unpacked extension.
2. Make changes.
3. Go to `chrome://extensions` and click **Reload** on the extension.
4. Reload the target website tab.
5. Add new work, and document your core code to make it easily understandable by all.

## :bug: Troubleshooting

### Buttons don't appear

- Ensure the site is enabled in the popup.
- Reload the page (many supported sites are SPAs).
- Try interacting once (some scripts attach on click).

### “Hosting Error” / Filestack hosting doesn't work

- The required Genius/Filestack credentials may not be captured yet. Trigger a Genius flow that opens the Filestack upload dialog so the extension can extract and store them.

### ImgBB upload fails

- Verify you saved an ImgBB API key in settings.

### Spotify/Tidal artwork fetch fails

- Populate API credentials in [Services/secrets.js](Services/secrets.js).
- Confirm your credentials allow the `client_credentials` flow.

### Any other problem

- Check the developer console (F12) for errors
- Try refreshing the page

If the issue persists, [**open an issue**](https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/issues) with details about your web browser and the page URL.

## :card_file_box: Project Roadmap

Find detailed versioning in the [CHANGELOG.md](https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/blob/main/CHANGELOG.md) file.

### 🔮 Possible future improvements

All of them are listed in the [issues](https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/issues).  
Those with the 🚀 emoji are new features, those with the ↗️ emoji are improvements!  
Don't hesitate to suggest new ideas by **opening an issue** yourself!

---

Developed with ❤️ by the Genius community to enhance the Genius experience.

<br />

[Back to top](#top)
