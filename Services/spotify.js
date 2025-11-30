chrome.storage.local.get(['Services/spotify.js', 'isSpotifyCopyTracklist', 'isSpotifyCopyCover', 'isSpotifyCopyArtist', 'isSpotifyPopup', 'isSpotifySidebar', 'isSpotifyRightClick', 'isSpotifyConvertPNG', 'isSpotifySaveImage', 'isSpotifyHostImgBB', 'isSpotifyHostFilestack'], function (result) {
  const isSpotifyCopyTracklist = result.isSpotifyCopyTracklist !== undefined ? result.isSpotifyCopyTracklist : true;
  const isSpotifyCopyCover = result.isSpotifyCopyCover !== undefined ? result.isSpotifyCopyCover : true;
  const isSpotifyCopyArtist = result.isSpotifyCopyArtist !== undefined ? result.isSpotifyCopyArtist : true;
  const isSpotifyPopup = result.isSpotifyPopup !== undefined ? result.isSpotifyPopup : true;
  const isSpotifySidebar = result.isSpotifySidebar !== undefined ? result.isSpotifySidebar : false;
  const isSpotifyRightClick = result.isSpotifyRightClick !== undefined ? result.isSpotifyRightClick : false;
  const isSpotifyConvertPNG = result.isSpotifyConvertPNG !== undefined ? result.isSpotifyConvertPNG : true;
  const isSpotifySaveImage = result.isSpotifySaveImage !== undefined ? result.isSpotifySaveImage : false;
  const isSpotifyHostImgBB = result.isSpotifyHostImgBB !== undefined ? result.isSpotifyHostImgBB : false;
  const isSpotifyHostFilestack = result.isSpotifyHostFilestack !== undefined ? result.isSpotifyHostFilestack : true;

  if (result['Services/spotify.js'] === false) {
    return;
  }

  // Copy Cover Button
  function addCopyCoverButton() {
    const actionBar = document.querySelector("div[data-testid='action-bar']");
    if (!actionBar) return;
    const moreButton = actionBar.querySelector("button[data-testid='more-button']");

    if (moreButton && !document.getElementById('copy-cover-button')) {
      const copyButton = document.createElement("button");
      copyButton.id = "copy-cover-button";
      copyButton.innerText = isSpotifySaveImage ? "Save Cover" : "Copy Cover";

      Object.assign(copyButton.style, {
        backgroundColor: "#1db954",
        color: "white",
        height: "47.99px",
        border: "none",
        borderRadius: "500px",
        padding: "8px 12px",
        cursor: "pointer",
        marginLeft: "5px",
        fontSize: "var(--tempo-fontSizes-body-xl)",
        fontWeight: "bold"
      });

      copyButton.addEventListener('click', async (event) => {
        event.preventDefault();
        sessionStorage.setItem('copyCover', 'true');
        sessionStorage.setItem('mouseX', event.clientX);
        sessionStorage.setItem('mouseY', event.clientY);

        const currentUrl = window.location.href;
        const accessToken = await getSpotifyAccessToken();

        let coverUrl;

        if (currentUrl.startsWith("https://open.spotify.com/prerelease")) {
          try {
            const container = document.querySelector('.main-view-container');
            if (container) {
              const img = container.querySelector('img');
              if (img && img.src) {
                coverUrl = img.src;
              }
            }
          } catch (error) {
            console.error('Error fetching presave cover:', error);
          }
        } else {
          const types = ['playlist', 'album', 'artist', 'track', 'show', 'episode', 'audiobook', 'chapter'];

          try {
            const type = types.find(type => currentUrl.includes(`/${type}/`));
            if (type) {
              coverUrl = await getSpotifyArtwork(currentUrl, type, accessToken);
            }
          } catch (error) {
            console.error("Spotify API Error:", error);
          }
        }

        if (coverUrl) {
          const imageUrl = modifySpotifyImageUrl(coverUrl);
          if (imageUrl) {
            const urlName = `spotify`;
            const fileName = getFileNameFromUrl(imageUrl);
            const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
            const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
            const design = {
              position: "fixed",
              backgroundColor: "#1DB954",
              color: "white",
              borderRadius: "500px",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: "bold",
              zIndex: "9999",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              top: `${mouseY + 50}px`,
              left: `${mouseX + 75}px`
            };
            await processJpgImage(imageUrl, urlName, fileName, isSpotifyHostFilestack, isSpotifyHostImgBB, isSpotifySaveImage, isSpotifyConvertPNG, isSpotifyPopup, design);
          }
        }
      });

      moreButton.parentNode.insertBefore(copyButton, moreButton.nextSibling);
    }
  }

  // Spotify Access Token for API Calls
  async function getSpotifyAccessToken() {
    const clientId = window.secrets.SPOTIFY_CLIENT_ID;
    const clientSecret = window.secrets.SPOTIFY_CLIENT_SECRET;

    const credentials = btoa(`${clientId}:${clientSecret}`);

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Token error: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  }

  // Spotify Artwork Fetcher via API
  async function getSpotifyArtwork(url, type, token) {
    const regex = new RegExp(`spotify\\.com/(?:[a-z-]+/)?${type}/([a-zA-Z0-9]+)`);
    const match = url.match(regex);
    const id = match ? match[1] : null;

    if (!id) {
      throw new Error(`Invalid Spotify ${type} URL: ${url}`);
    }

    let endpoint = "";

    switch (type) {
      case "playlist":
        endpoint = `playlists/${id}/images`;
        break;
      case "prerelease":
        endpoint = `albums/${id}`;
        break;
      case "album":
      case "artist":
      case "show":
      case "audiobook":
      case "chapter":
        endpoint = `${type}s/${id}`;
        break;
      case "track":
        endpoint = `tracks/${id}`;
        break;
      case "episode":
        endpoint = `episodes/${id}`;
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Error fetching ${type} data`);
    }

    const data = await response.json();

    if (type === "track") return data.album?.images?.[0]?.url;
    if (type === "playlist") return data[0]?.url;
    return data.images?.[0]?.url;
  }

  // Modify Spotify Image URL for Higher Resolution
  function modifySpotifyImageUrl(originalUrl) {
    const prefixes = {
      album: "https://i.scdn.co/image/ab67616d0000",
      playlist: "https://i.scdn.co/image/ab67706f0000",
      podcast: "https://i.scdn.co/image/ab6765630000",
      audiobook: "https://i.scdn.co/image/ab6766630000",
      artist: "https://i.scdn.co/image/ab6761610000",
      pickasso: "https://pickasso.spotifycdn.com/image/ab67c0de0000",
      newjams: "https://newjams-images.scdn.co/image/ab6764780000"
    };

    const modifications = {
      album: "82c1",
      playlist: "0004",
      podcast: "c3d5",
      audiobook: "fd4a",
      artist: "e5eb",
      pickasso: "bada",
      newjams: "bc90"
    };

    function getSuffixModification(key) {
      return modifications[key] || "";
    }

    for (const [key, prefix] of Object.entries(prefixes)) {
      if (originalUrl.startsWith(prefix)) {
        const suffix = originalUrl.slice(prefix.length);
        const newUrl = `${prefix}${getSuffixModification(key)}${suffix.slice(4)}`;
        return newUrl;
      }
    }

    let modifiedUrl = originalUrl;

    if (originalUrl.includes("seed-mix-image.spotifycdn.com") && originalUrl.includes("/de/default")) {
      modifiedUrl = originalUrl.replace("/de/default", "/de/xlarge");
    }

    if (originalUrl.includes("thisis-images.spotifycdn.com") && originalUrl.includes("-default.jpg")) {
      modifiedUrl = originalUrl.replace("-default.jpg", "-large.jpg");
    }

    return modifiedUrl;
  }

  function getFileNameFromUrl(url) {
    const parts = url.split('/');
    const fileNameWithExtension = parts.pop().split('.')[0];
    const fileNameWithoutSuffix = fileNameWithExtension.split('-')[0];
    return fileNameWithoutSuffix;
  }





  function addCopyTracklistButton() {
    const albumArtists = Array.from(document.querySelectorAll('[data-testid="creator-link"]')).map(artist => artist.innerText);
    const isPlaylist = window.location.href.startsWith("https://open.spotify.com/playlist/") || window.location.href.startsWith("https://open.spotify.com/collection/");
    const colIndex = isPlaylist ? "5" : "3";

    function processCells() {
      document.querySelectorAll(`[aria-colindex="${colIndex}"]`).forEach((cell, index) => {
        const songArtists = Array.from(cell.parentElement.querySelectorAll('span a')).map(artist => artist.innerText);
        const uniqueSongArtists = songArtists.filter(name => !albumArtists.includes(name));

        if (index === 0) {
          const reversedArtists = [...albumArtists].reverse();
          reversedArtists.forEach((name, i, arr) => {
            const label = arr.length === 1 ? "CA" : `CA${arr.length - i}`;
            addButton(cell, name, label);
          });
        }

        if (index > 0 && !cell.querySelector(".copy-song-button")) {
          const songTitle = cell.parentElement.querySelector('[data-testid="internal-track-link"]')?.innerText || null;
          if (!songTitle) return;
          addButton(cell, songTitle, "CT", "copy-song-button");
        }

        if (uniqueSongArtists.length > 0) {
          songArtists.reverse().forEach((name, i, arr) => addButton(cell, name, `CA${arr.length - i}`));
        }

        cell.querySelectorAll('[data-encore-id="buttonTertiary"]').forEach(button => {
          if (!button.hasAttribute("data-testid") || button.getAttribute("data-testid") !== "more-button") {
            button.style.marginLeft = "15px";
          }
        });

        cell.querySelectorAll('[data-testid="column-header-context-menu"]').forEach(button => {
          button.style.marginLeft = "12px";
        });
      });
      if (colIndex == "3") {
        document.querySelectorAll(`[aria-colindex="${colIndex}"]`).forEach(link => {
          link.style.gridColumn = "none";
        });
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          processCells();
        }
      });
    }, { root: null, threshold: 0.1 });

    document.querySelectorAll(`[aria-colindex="${colIndex}"]`).forEach(cell => {
      observer.observe(cell);
    });

    processCells();
  }

  function addButton(parent, text, label, className = `copy-artist-button-${label}`) {
    if (!parent.querySelector(`.${className}`)) {
      let button = document.createElement("button");
      button.innerText = label;
      button.classList.add(className);
      button.style.marginRight = "10px";
      if (label === "CT") {
        button.style.width = "2.25rem";
      } else {
        button.style.width = "2.75rem";
      }
      button.style.padding = "5px";
      button.style.fontWeight = "600";
      button.style.color = "#000000";
      button.style.backgroundColor = "#c7c7c7";
      button.style.borderRadius = "50px";
      button.addEventListener("click", () => {
        navigator.clipboard.writeText(text);
        button.style.backgroundColor = "#1DB954";
        button.style.color = "#ffffff";
        setTimeout(() => {
          button.style.backgroundColor = "#c7c7c7";
          button.style.color = "#000000";
        }, 250);
      });
      parent.insertBefore(button, parent.firstChild);
    }
  }





  if (isSpotifyRightClick) {
    document.addEventListener('contextmenu', function (event) {
      event.stopPropagation();
    }, true);

    document.addEventListener('mousedown', function (event) {
      if (event.button === 2) {
        event.stopPropagation();
      }
    }, true);

    document.addEventListener('mouseup', function (event) {
      if (event.button === 2) {
        event.stopPropagation();
      }
    }, true);

    document.oncontextmenu = null;
    document.onmousedown = null;
    document.onmouseup = null;
  }





  function hideNowPlayingView() {
    const nowPlayingView = document.querySelector('.OTfMDdomT5S7B5dbYTT8');
    if (nowPlayingView) {
      nowPlayingView.style.display = 'none';
    }
  }





  document.addEventListener('click', (event) => {
    const artistUrlPattern = /^https:\/\/open\.spotify\.com\/(?:[a-zA-Z0-9-]+\/)?artist\//;

    if (artistUrlPattern.test(window.location.href)) {
      if (isSpotifyCopyArtist) addCopyCoverButton();
    } else if (!window.location.href.startsWith("https://open.spotify.com/search/")) {
      if (isSpotifyCopyCover) addCopyCoverButton();
      if (isSpotifyCopyTracklist) addCopyTracklistButton();
    }

    sessionStorage.setItem('mouseX', event.clientX);
    sessionStorage.setItem('mouseY', event.clientY);
  });





  const observer = new MutationObserver(() => {
    if (isSpotifySidebar) hideNowPlayingView();
  });
  observer.observe(document.body, { childList: true, subtree: true });

});