<div align="center" id="top">
  <img src="https://addons.mozilla.org/user-media/addon_icons/2896/2896871-64.png?modified=27941528" alt="AEG Logo" width="64px" />
  <h2>🔗 Artwork Extractor for Genius 🟨</h2>
  <p><b>One-click cover art extraction for 12 music platforms — built for the Genius community.</b></p>
</div>

<div align="center">
  <a href="#-description">Description</a> &#xa0; | &#xa0;
  <a href="#-installation">Installation</a> &#xa0; | &#xa0;
  <a href="#-usage--general-information">Usage & General Information</a> &#xa0; | &#xa0;
  <a href="#-troubleshooting">Troubleshooting</a> &#xa0; | &#xa0;
  <a href="#-project-roadmap">Project Roadmap</a>
</div>
&#xa0;

<div align="center">
  <a href="#card_file_box-changelog"><img alt="Last version released" src="https://img.shields.io/github/v/release/JonasWeinhold/Artwork-Extractor-for-Genius?logo=semver&color=blue" /></a>
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/commits/main"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/JonasWeinhold/Artwork-Extractor-for-Genius?color=blueviolet&logo=clarifai" /></a>
  <a href="LICENSE">
    <img alt="license: GPL v3" src="https://img.shields.io/badge/license-GPLv3-blue.svg?logo=gnu&logoColor=white" /></a>  
</div>
<div align="center">
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/JonasWeinhold/Artwork-Extractor-for-Genius?color=red&logo=stackedit" /></a>
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/JonasWeinhold/Artwork-Extractor-for-Genius?style=flat&color=%23ffe937&logo=github" /></a>
  <a href="https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/JonasWeinhold/Artwork-Extractor-for-Genius?color=forestgreen&logo=target" /></a>
  <a href="#card_file_box-changelog"><img alt="GitHub repository size" src="https://img.shields.io/github/languages/code-size/JonasWeinhold/Artwork-Extractor-for-Genius?color=blue&logo=frontify" /></a>
</div>
<div align="center">
  <a href="https://chromewebstore.google.com/detail/artwork-extractor-for-gen/oifdmdbfhcamieniopjddpohkbbmoaeb">
    <img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=googlechrome" /></a>
  <a href="https://addons.mozilla.org/en-us/firefox/addon/artwork-extractor-for-genius/">
    <img alt="Mozilla Add-on" src="https://img.shields.io/badge/Firefox%20Add--on-Install-orange?logo=firefoxbrowser" /></a>
</div>
&#xa0;

## 📝 Description

A browser extension that adds “Copy Cover” / “Save Cover” helpers on Genius and popular music platforms.  
It's primarily built to quickly grab cover artwork URLs (and optionally convert/host/download them) while working with [genius.com](https://genius.com).  
**Compatible with Chrome, Firefox, Edge, and all other Chromium web browsers!**

<!-- TODO: Add a demo GIF here showing the Copy Cover button in action (e.g. on a Spotify album page). Tools: LICEcap, ShareX, or ScreenToGif. -->

### 🎵 Features

- Adds UI buttons on supported sites (see below) with four output modes: **Copy URL** · **Download file** · **Convert to PNG** · **Host image** (ImgBB / ImageKit / Genius S3)
  - Genius: `genius.com` (+ `genius-staging.com`)
  - Apple Music: `*.apple.com`
  - Spotify: `*.spotify.com`
  - Deezer: `*.deezer.com`
  - Tidal: `*.tidal.com`
  - YouTube Music: `music.youtube.com`
  - SoundCloud: `*.soundcloud.com`
  - Bandcamp: `*.bandcamp.com`
  - Yandex Music: `*.yandex.ru`
  - 45cat / 45worlds / 45spaces
  - DistroKid: `*.distrokid.com`
- Adds a popup UI to enable/disable each supported site script per-browser.
- Adds a settings page with lots of per-site toggles (copy cover, copy tracklist, popups, conversions, hosting options, etc.).
- On Genius pages, it can also add various editing/utility helpers (song/album/artist tools).

## 🚀 Installation

Either install the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/artwork-extractor-for-gen/oifdmdbfhcamieniopjddpohkbbmoaeb) or the [Mozilla Add-ons site](https://addons.mozilla.org/de/firefox/addon/artwork-extractor-for-genius/).  
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

- Set it in the settings page (stored in browser cache).

#### ImageKit

If you enable ImageKit hosting, provide your ImageKit private key:

- Set `IMAGEKIT_PRIVATE_KEY` in the settings page (stored in browser cache).

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

## 📖 Usage & General Information

> **Note:** Most supported sites are single-page applications (SPAs). If injected buttons don't appear, **reload the tab** after enabling the site in the popup.

1. Navigate to a supported site (e.g. Spotify album page, Genius song page).
2. Click the extension icon to open the popup.
3. Ensure the site you're on is **enabled** (icon should not look “inactive”).
4. Reload the tab (some sites are single-page applications; reload helps scripts attach).
5. Use the injected buttons (e.g. **Copy Cover** / **Save Cover**).

**Dark mode:** Click the extension popup header to toggle dark/light mode. The preference is saved per-browser.

### 📝 Development notes

There is no build pipeline; edits are plain HTML/CSS/JS.
Key files:

- [manifest.json](manifest.json): MV3 manifest + content script registration
- [Popup/popup.html](Popup/popup.html): popup UI
- [Popup/popup.js](Popup/popup.js): per-site enable/disable toggles
- [Popup/settings_guides.html](Popup/settings_guides.html): settings UI
- [Popup/settings_guides.js](Popup/settings_guides.js): settings logic (stored in browser cache)
- [Services/streaming_utils.js](Services/streaming_utils.js): shared image processing (convert/download/upload/copy)
- [Services/secrets.js](Services/secrets.js): API key placeholders + local storage wiring

Typical workflow:

1. Load unpacked extension.
2. Make changes.
3. Go to `chrome://extensions` and click **Reload** on the extension.
4. Reload the target website tab.
5. Add new work, and document your core code to make it easily understandable by all.

## 🐛 Troubleshooting

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

## 🤝 Contributing

Contributions are welcome! To add support for a new streaming service:

1. Create `Services/[new_site].js` following the pattern of an existing service (e.g. `Services/deezer.js`).
2. Register the content script in `manifest.json` under `content_scripts` and `host_permissions`.
3. Add the site to all four maps in `Popup/popup.js`: `files`, `displayNames`, `icons`, `urls`.
4. Drop a matching icon PNG into `Popup/`.
5. Document any site-specific behaviour in the code.

For bugs or feature ideas, [open an issue](https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/issues) first. PRs that add a new site or fix a bug are always appreciated.

## 🗃️ Project Roadmap

Find detailed versioning in the [CHANGELOG.md](https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/blob/main/CHANGELOG.md) file.

### 🔮 Possible future improvements

All of them are listed in the [issues](https://github.com/JonasWeinhold/Artwork-Extractor-for-Genius/issues).  
Those with the 🚀 emoji are new features, those with the ↗️ emoji are improvements!  
Don't hesitate to suggest new ideas by **opening an issue** yourself!

---

Developed with ❤️ by the Genius community to enhance the Genius experience.

<br />

[Back to top](#top)
