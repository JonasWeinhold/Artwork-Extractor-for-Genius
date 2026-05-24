# GitHub Page Improvement Plan — Artwork Extractor for Genius

## 1. About Section

### Description (current)
>
> "Copy the artwork URL to the clipboard for genius.com by clicking the copy button on Apple Music, Deezer, Spotify, and more."

This undersells the extension badly. It implies clipboard-only, Genius-only, and lists only two of twelve supported platforms.

### Description (proposed, 194 chars)
>
> One-click album artwork extractor for Genius editors. Adds Copy / Download / Host buttons on Spotify, Apple Music, Deezer, Tidal, YouTube Music, SoundCloud, Bandcamp & more. Chrome, Firefox, Edge.

Key changes: leads with the use-case audience ("Genius editors"), surfaces the three output modes up-front, and names the top platforms.

### Website

Set the About website to the Chrome Web Store listing URL. It's the natural landing page for non-developer visitors.

### Topics (add all of these — currently none are set)

```
browser-extension  chrome-extension  firefox-addon  manifest-v3
genius  music  album-art  cover-art  artwork  image-downloader
spotify  apple-music  deezer  tidal  soundcloud  bandcamp
youtube-music  javascript  content-script  music-tools
```

GitHub uses topics for search/discovery. Right now the repo is invisible to anyone searching "album art browser extension" or "cover art downloader."

---

## 2. README Improvements

### 2a. Add a screenshot or demo GIF (highest impact)

The README has no visuals beyond a 64px icon. A single GIF (or two side-by-side screenshots) showing:

1. The injected "Copy Cover" button on a Spotify album page
2. The popup with per-site toggles

...would do more for conversion than any text change. Tools like LICEcap or ShareX can record a GIF in under a minute.

Place it immediately after the Description section, before Features.

---

### 2b. Strengthen the hero / value proposition

The current H2 title is `:link: Artwork Extractor for Genius :yellow_square:` — that reads as an internal codename. Add a one-line tagline directly under the title (and before the nav links), e.g.:

> **One-click cover art extraction for 12 music platforms — built for the Genius community.**

---

### ~~2c. Add store-link badges near the top~~ done

The install links (Chrome Web Store, Mozilla Add-ons) are buried in prose under Installation. Surface them as badges in the header block, alongside the existing version/commit badges. Visitors should be able to install in one click from the hero.

---

### 2d. Add ImageKit to the Hosting section

`Services/streaming_utils.js` fully implements `uploadToImagekit()` but it is not mentioned anywhere in the README. Users who want that output option have no documentation. Add:

```
#### ImageKit
If you enable ImageKit hosting, provide your ImageKit private key (`IMAGEKIT_PRIVATE_KEY`).
- Set it in the settings page (stored in `chrome.storage.local`).
```

---

### 2e. Add output modes to the Features list

The four output modes (copy URL, download, convert to PNG, host) are the core differentiator of this extension vs. "just right-click > save image." They're currently buried three sections deep under Installation. Move a summary into the Features bullet list:

```
- Four output modes per site: Copy URL · Download file · Convert to PNG · Host image (ImgBB / ImageKit / Genius S3)
```

---

### 2f. Document dark mode

The popup has a dark mode triggered by clicking the popup header. It's not mentioned anywhere in the README. Add a one-liner under Usage:

> **Dark mode:** Click the extension popup header to toggle dark/light mode. The preference is saved per-browser.

---

### 2g. Add a "Reload required" callout

The single most common support issue is buttons not appearing on SPA pages. This is currently item 4 in a numbered list under Usage. Promote it to a visible callout box (blockquote) at the top of the Usage section:

```
> **Note:** Most supported sites (Spotify, Tidal, YouTube Music, etc.) are single-page apps.
> If the injected buttons don't appear, **reload the tab** after enabling the site in the popup.
```

---

### ~~2h. Add a License badge~~ done

The project is GPL-3.0 but there's no license badge. Add to the badge row:

```
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
```

---

### 2i. Add a Contributing section (or CONTRIBUTING.md)

There's no guide for contributors. The "Development notes" section covers the workflow but not "how to add a new streaming service." A short `## Contributing` section (or a separate `CONTRIBUTING.md`) should cover:

1. The pattern for adding a new service (create `Services/newsite.js`, add to `manifest.json` content_scripts, add to `popup.js` maps, add icon to `Popup/`)
2. Coding conventions (vanilla JS, no build pipeline, document core logic)
3. Where to open issues vs. PRs

---

## 3. Bugs / Gaps to Fix Before or Alongside

### 3a. Missing `Services/tidal.js`

`manifest.json` and `popup.js` both reference `Services/tidal.js`, but no such file exists in the repository. The README lists Tidal as a supported platform. This will cause a silent failure for Tidal users. Either add the file or remove Tidal from the supported platforms list until it's implemented.

### 3b. Orphaned Instagram assets

`Popup/instagram-icon.png` and `Services/instagram.js` exist but are registered in neither `manifest.json` nor `popup.js`. They're dead code. Either wire them up or remove them to keep the repo clean.

### 3c. Manifest description out of date

`manifest.json` line 5 reads: *"Copy the artwork URL to the clipboard for genius.com by clicking the copy button on Apple Music, Deezer, Spotify, and more."*
This is what appears in the browser's extensions page and in store listings. It should be updated to reflect the full feature set (download, host, PNG convert, 12 platforms, Firefox).

### 3d. CHANGELOG.md is remote-only

The README links to `CHANGELOG.md` multiple times but the file doesn't exist in the local repo (only as a remote GitHub URL). Someone who clones the repo and opens `README.md` offline gets broken links. Move the changelog into the repo root.

### 3e. `Popup/settings_guides.html` referenced in README dev notes but not in Glob results

The README's Development notes section lists `Popup/settings_guides.html` and `Popup/settings_guides.js` as key files, but neither appears in the repository file tree. Verify these exist and weren't accidentally omitted from the repo, or remove the references.

---

## 4. Priority Order

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| 1 | Add screenshot / demo GIF | Medium | Very High |
| 2 | Fix missing `Services/tidal.js` | Low | High (broken feature) |
| 3 | Update manifest description | Low | High (store listings) |
| 4 | Set GitHub topics | Low | High (discoverability) |
| 5 | Update About description | Low | Medium |
| 6 | Add store-link badges to README header | Low | Medium |
| 7 | Add "Reload required" callout | Low | Medium |
| 8 | Add ImageKit docs | Low | Medium |
| 9 | Add output modes to Features list | Low | Medium |
| 10 | Add dark mode note | Low | Low |
| 11 | Add Contributing section | Medium | Medium |
| 12 | Add license badge | Low | Low |
| 13 | Move CHANGELOG into repo | Medium | Low |
| 14 | Remove orphaned Instagram assets | Low | Low |
