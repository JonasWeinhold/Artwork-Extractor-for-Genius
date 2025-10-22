chrome.storage.local.get(['Services/spotify.js', 'isSpotifyCopyTracklist', 'isSpotifyCopyCover', 'isSpotifyCopyArtist', 'isSpotifyPopup', 'isSpotifySidebar', 'isSpotifyRightClick', 'isSpotifyConvertPNG', 'isSpotifySaveImage', 'isSpotifyHostImage'], function (result) {
  const isSpotifyCopyTracklist = result.isSpotifyCopyTracklist !== undefined ? result.isSpotifyCopyTracklist : true;
  const isSpotifyCopyCover = result.isSpotifyCopyCover !== undefined ? result.isSpotifyCopyCover : true;
  const isSpotifyCopyArtist = result.isSpotifyCopyArtist !== undefined ? result.isSpotifyCopyArtist : true;
  const isSpotifyPopup = result.isSpotifyPopup !== undefined ? result.isSpotifyPopup : true;
  const isSpotifySidebar = result.isSpotifySidebar !== undefined ? result.isSpotifySidebar : false;
  const isSpotifyRightClick = result.isSpotifyRightClick !== undefined ? result.isSpotifyRightClick : false;
  const isSpotifyConvertPNG = result.isSpotifyConvertPNG !== undefined ? result.isSpotifyConvertPNG : true;
  const isSpotifySaveImage = result.isSpotifySaveImage !== undefined ? result.isSpotifySaveImage : false;
  const isSpotifyHostImage = result.isSpotifyHostImage !== undefined ? result.isSpotifyHostImage : true;

  if (result['Services/spotify.js'] === false) {
    return;
  }


  function hideNowPlayingView() {
    const nowPlayingView = document.querySelector('.OTfMDdomT5S7B5dbYTT8');
    if (nowPlayingView) {
      nowPlayingView.style.display = 'none';
    }
  }


  function extractSpotifyImageUrl(originalUrl) {
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

  async function convertJpgToPng(jpgUrl) {
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = jpgUrl;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const originalWidth = image.width;
      const originalHeight = image.height;

      canvas.width = originalWidth;
      canvas.height = originalHeight;

      ctx.drawImage(image, 0, 0, originalWidth, originalHeight);

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Fehler beim Laden oder Konvertieren:', error);
      return null;
    }
  }

  async function uploadToImgBB(pngDataUrl, fileName) {
    try {
      const base64Response = await fetch(pngDataUrl);
      const blob = await base64Response.blob();

      const formData = new FormData();
      formData.append('image', blob);
      formData.append('name', fileName);

      const apiKey = await window.secrets.IMGBB_API_KEY;
      const apiUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
      console.log('ImgBB API Key:', apiKey);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error uploading: ${response.statusText}`);
      }

      const data = await response.json();

      return data.data.url;
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      return null;
    }
  }







  async function uploadToImagekit(pngDataUrl, fileName) {
    try {
      const apiUrl = "https://upload.imagekit.io/api/v1/files/upload";
      const privateApiKey = window.secrets.IMAGEKIT_PRIVATE_KEY;

      const formData = new FormData();
      formData.append("file", pngDataUrl);
      formData.append("fileName", fileName);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(privateApiKey + ":")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = `Error during upload: ${response.statusText} (status code: ${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      return result.url;
    } catch (error) {
      console.error("Error uploading to ImageKit:", error.message); return null;
    }
  }




  async function processSpotifyImage(extractedUrl, copyButton) {
    const fileName = getFileNameFromUrl(extractedUrl);


    if (isSpotifyConvertPNG) {
      const pngDataUrl = await convertJpgToPng(extractedUrl);

      if (pngDataUrl) {
        if (isSpotifyHostImage) {

          //const uploadedUrl = await uploadToImagekit(pngDataUrl, fileName);
          const uploadedUrl = await uploadToImgBB(pngDataUrl, fileName);
          //const uploadedUrl = await uploadToUploadcare(pngDataUrl, fileName);

          if (uploadedUrl) {
            await navigator.clipboard.writeText(uploadedUrl);
            if (isSpotifyPopup) {
              showPopupNotification();
            }
          } else {
            console.error('Error uploading the image.');
            copyButton.innerText = "Hosting Error";
          }
        } else if (isSpotifySaveImage) {
          const link = document.createElement('a');
          link.href = pngDataUrl;
          link.download = `${fileName}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        console.error('Error converting to PNG.');
        copyButton.innerText = "Converting Error";
      }
    } else {
      if (isSpotifyHostImage) {
        await navigator.clipboard.writeText(extractedUrl);
        if (isSpotifyPopup) {
          showPopupNotification();
        }
      } else if (isSpotifySaveImage) {
        const response = await fetch(extractedUrl);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    }
  }

  function getFileNameFromUrl(url) {
    const parts = url.split('/');
    const fileNameWithExtension = parts.pop().split('.')[0];
    const fileNameWithoutSuffix = fileNameWithExtension.split('-')[0];
    return fileNameWithoutSuffix;
  }



  function addCopyCoverButton() {
    if (window.location.href.startsWith("https://open.spotify.com/search/")) {
      return;
    }

    const actionBar = document.querySelector("div[data-testid='action-bar']");
    const moreButton = actionBar.querySelector("button[data-testid='more-button']");
    const existingButton = actionBar.querySelector(".copy-cover-button");

    if (existingButton) return;

    if (moreButton) {
      const copyButton = document.createElement("button");
      copyButton.innerText = isSpotifySaveImage ? "Save Cover" : "Copy Cover";
      copyButton.className = "copy-cover-button";
      copyButton.style.backgroundColor = "#1db954";
      copyButton.style.color = "white";
      copyButton.style.height = "47.99px";
      copyButton.style.border = "none";
      copyButton.style.borderRadius = "500px";
      copyButton.style.padding = "8px 12px";
      copyButton.style.cursor = "pointer";
      copyButton.style.marginLeft = "5px";
      copyButton.style.fontSize = "var(--tempo-fontSizes-body-xl)";
      copyButton.style.fontWeight = "bold";

      const extractSpotifyId = (url, type) => {
        const regex = new RegExp(`spotify\\.com/(?:[a-z-]+/)?${type}/([a-zA-Z0-9]+)`);
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      const fetchCoverFromSpotify = async (type, id, token) => {
        let endpoint = '';
        let imagePath = 'images';

        switch (type) {
          case 'playlist':
            endpoint = `playlists/${id}/images`;
            break;
          case 'prerelease':
            endpoint = `albums/${id}`;
            break;
          case 'album':
          case 'artist':
          case 'show':
          case 'audiobook':
          case 'chapter':
            endpoint = `${type}s/${id}`;
            break;
          case 'track':
            endpoint = `tracks/${id}`;
            break;
          case 'episode':
            endpoint = `episodes/${id}`;
            break;
          default:
            throw new Error(`Unsupported type: ${type}`);
        }

        const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Fehler beim Abrufen von ${type}-Daten`);

        const data = await response.json();
        if (type === 'track') return data.album?.images?.[0]?.url;
        if (type === 'playlist') return data[0]?.url;
        return data.images?.[0]?.url;
      };

      copyButton.onclick = async (event) => {
        event.preventDefault();
        sessionStorage.setItem('copyCover', 'true');
        sessionStorage.setItem('mouseX', event.clientX);
        sessionStorage.setItem('mouseY', event.clientY);

        const currentUrl = window.location.href;
        const token = await getSpotifyAccessToken();

        if (currentUrl.startsWith("https://open.spotify.com/prerelease")) {
          try {
            const container = document.querySelector('.main-view-container');
            if (container) {
              const img = container.querySelector('img');
              if (img && img.src) {
                const coverUrl = img.src;
                const extractedUrl = extractSpotifyImageUrl(coverUrl);
                await processSpotifyImage(extractedUrl, copyButton);
                return;
              }
            }
          } catch (error) {
            console.error('Error fetching presave cover:', error);
          }
        }

        const types = ['playlist', 'album', 'artist', 'track', 'show', 'episode', 'audiobook', 'chapter'];

        try {
          for (const type of types) {
            if (currentUrl.includes(`/${type}/`)) {
              const id = extractSpotifyId(currentUrl, type);
              if (!id) continue;

              const coverUrl = await fetchCoverFromSpotify(type, id, token);
              const extractedUrl = extractSpotifyImageUrl(coverUrl);

              console.log(extractedUrl);
              if (extractedUrl) {
                await processSpotifyImage(extractedUrl, copyButton);
                return;
              }
            }
          }
        } catch (error) {
          console.error('Spotify API Error:', error);
        }
      };

      moreButton.parentNode.insertBefore(copyButton, moreButton.nextSibling);
    }
  }

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
        throw new Error(`Fehler beim Token-Abruf: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Token-Anfrage fehlgeschlagen:', error);
      return null;
    }
  }

  function showPopupNotification() {
    const popup = document.createElement("div");
    popup.className = "popup-notification";
    const content = document.createElement("div");
    content.innerText = "Copied to clipboard";
    content.className = "popup-content";
    popup.style.position = "fixed";
    popup.style.backgroundColor = "#1DB954";
    popup.style.color = "white";
    popup.style.borderRadius = "500px";
    popup.style.padding = "10px 20px";
    popup.style.fontSize = "12px";
    popup.style.fontWeight = "bold";
    popup.style.zIndex = "9999";
    popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    const mouseX = parseInt(sessionStorage.getItem('mouseX'), 10);
    const mouseY = parseInt(sessionStorage.getItem('mouseY'), 10);
    popup.style.top = `${mouseY + 50}px`;
    popup.style.left = `${mouseX + 75}px`;
    popup.appendChild(content);
    document.body.appendChild(popup);
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 1500);
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
          //const songTitle = cell.parentElement.querySelector('[data-testid="internal-track-link"]').innerText;
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


  document.addEventListener('click', (event) => {
    const artistUrlPattern = /^https:\/\/open\.spotify\.com\/(?:[a-zA-Z0-9-]+\/)?artist\//;

    if (artistUrlPattern.test(window.location.href)) {
      if (isSpotifyCopyArtist) addCopyCoverButton();
    } else {
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

});