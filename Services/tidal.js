chrome.storage.local.get(['Services/tidal.js', 'isTidalCopyCover', 'isTidalCopyArtist', 'isTidalCopyCredits', 'isTidalPopup', 'isTidalHighlighting', 'isTidalPremiumPopup', 'isTidalConvertPNG', 'isTidalSaveImage', 'isTidalHostImgBB', 'isTidalHostFilestack'], function (result) {
  const isTidalCopyCover = result.isTidalCopyCover !== undefined ? result.isTidalCopyCover : true;
  const isTidalCopyArtist = result.isTidalCopyArtist !== undefined ? result.isTidalCopyArtist : true;
  const isTidalCopyCredits = result.isTidalCopyCredits !== undefined ? result.isTidalCopyCredits : true;
  const isTidalPopup = result.isTidalPopup !== undefined ? result.isTidalPopup : true;
  const isTidalHighlighting = result.isTidalHighlighting !== undefined ? result.isTidalHighlighting : true;
  const isTidalPremiumPopup = result.isTidalPremiumPopup !== undefined ? result.isTidalPremiumPopup : false;
  const isTidalConvertPNG = result.isTidalConvertPNG !== undefined ? result.isTidalConvertPNG : true;
  const isTidalSaveImage = result.isTidalSaveImage !== undefined ? result.isTidalSaveImage : false;
  const isTidalHostImgBB = result.isTidalHostImgBB !== undefined ? result.isTidalHostImgBB : false;
  const isTidalHostFilestack = result.isTidalHostFilestack !== undefined ? result.isTidalHostFilestack : true;

  if (result['Services/tidal.js'] === false) {
    return;
  }

  // Copy Cover Button
  function addCopyCoverButton() {
    const buttonContainer = document.querySelector('button[data-test="shuffle-all"]');

    if (buttonContainer && !document.getElementById('copy-cover-button')) {
      const copyButton = document.createElement('button');
      copyButton.id = 'copy-cover-button';
      copyButton.innerText = isTidalSaveImage ? "Save Cover" : "Copy Cover";

      Object.assign(copyButton.style, {
        backgroundColor: '#fff',
        color: 'var(--wave-color-solid-base-fill)',
        borderRadius: '1000px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '24px',
        width: '160px'
      });

      copyButton.addEventListener('click', async (event) => {
        event.preventDefault();
        sessionStorage.setItem('copyCover', 'true');
        sessionStorage.setItem('mouseX', event.clientX);
        sessionStorage.setItem('mouseY', event.clientY);

        const currentUrl = window.location.href;
        const accessToken = await getTidalAccessToken();

        const { coverUrl, type, id } = await getTidalArtwork(currentUrl, accessToken);
        const imageUrl = coverUrl.replace(/\d{2,4}x\d{2,4}\.(jpg|jpeg)$/, 'origin.jpg');

        if (imageUrl) {
          const urlName = `tidal-${type}-${id}`;
          const fileName = getFileNameFromUrl(imageUrl);
          const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
          const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
          const design = {
            position: "fixed",
            backgroundColor: "#fff",
            color: "var(--wave-color-solid-base-fill)",
            borderRadius: "16px",
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: "bold",
            zIndex: "9999",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            top: `${mouseY + 50}px`,
            left: `${mouseX + 75}px`
          };
          await processJpgImage(imageUrl, urlName, fileName, isTidalHostFilestack, isTidalHostImgBB, isTidalSaveImage, isTidalConvertPNG, isTidalPopup, design);
        }
      });

      buttonContainer.insertAdjacentElement('afterend', copyButton);
    }
  }

  // Copy Cover Button for Browse Albums (Does this page still exist?)
  function addBrowseCopyButton() {
    console.log('createBrowseCopyButton called');
    const mainButton = document.querySelector('.main-button');

    if (mainButton && !document.getElementById('copy-cover-button')) {
      const copyButton = document.createElement('button');
      copyButton.id = 'copy-cover-button';
      copyButton.innerText = isTidalSaveImage ? "Save Cover" : "Copy Cover";

      Object.assign(copyButton.style, {
        backgroundColor: '#fff',
        color: 'var(--ts-color-text-inverted)',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '24px',
        width: '160px'
      });

      copyButton.addEventListener('click', async (event) => {
        event.preventDefault();
        sessionStorage.setItem('copyCover', 'true');
        sessionStorage.setItem('mouseX', event.clientX);
        sessionStorage.setItem('mouseY', event.clientY);

        const currentUrl = window.location.href;
        const accessToken = await getTidalAccessToken();

        const { coverUrl, type, id } = await getTidalArtwork(currentUrl, accessToken);
        const imageUrl = coverUrl.replace(/\d{2,4}x\d{2,4}\.(jpg|jpeg)$/, 'origin.jpg');

        if (imageUrl) {
          const urlName = `tidal-${type}-${id}`;
          const fileName = getFileNameFromUrl(imageUrl);
          const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
          const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
          const design = {
            position: "fixed",
            backgroundColor: "#fff",
            color: "var(--wave-color-solid-base-fill)",
            borderRadius: "16px",
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: "bold",
            zIndex: "9999",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            top: `${mouseY + 50}px`,
            left: `${mouseX + 75}px`
          };
          await processJpgImage(imageUrl, urlName, fileName, isTidalHostFilestack, isTidalHostImgBB, isTidalSaveImage, isTidalConvertPNG, isTidalPopup, design);
        }
      });

      mainButton.insertAdjacentElement('afterend', copyButton);
    }
  }

  // Tidal Access Token for API Calls
  async function getTidalAccessToken() {
    const clientId = window.secrets.TIDAL_CLIENT_ID;
    const clientSecret = window.secrets.TIDAL_CLIENT_SECRET;

    const credentials = btoa(`${clientId}:${clientSecret}`);

    try {
      const response = await fetch('https://auth.tidal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials'
        })
      });

      if (!response.ok) {
        throw new Error(`Token error: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error.message);
      return null;
    }
  }

  // Tidal Artwork Fetcher via API
  async function getTidalArtwork(url, accessToken) {
    const parsedUrl = new URL(url);
    const [type, id] = parsedUrl.pathname.split('/').filter(Boolean);

    const supportedTypes = {
      album: `albums/${id}/relationships/coverArt?include=coverArt`,
      playlist: `playlists/${id}/relationships/coverArt?include=coverArt`,
      artist: `artists/${id}/relationships/profileArt?include=profileArt`
    };

    if (!supportedTypes[type]) {
      return null;
    }

    const countryCode = await new Promise((resolve) => {
      chrome.storage.local.get(['tidalCountryCode'], (result) => {
        resolve(result.tidalCountryCode || 'US');
      });
    });
    console.log('Using Country Code:', countryCode);
    try {
      const response = await fetch(`https://openapi.tidal.com/v2/${supportedTypes[type]}&countryCode=${countryCode}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const artwork = data.included?.find(item => item.type === 'artworks' && item.id === data.data[0]?.id);
      const coverUrl = artwork?.attributes?.files?.[0]?.href;
      return { coverUrl, type, id };

    } catch (error) {
      console.error('Error fetching cover:', error.message);
      return null;
    }
  }

  function getFileNameFromUrl(url) {
    const parts = url.split('/images/');
    const fileNameWithExtension = parts.length > 1 ? parts[1] : '';
    const fileNameWithoutSuffix = fileNameWithExtension.split('.')[0];
    return fileNameWithoutSuffix;
  }





  const replacements = {
    "BACKGROUND VOCALIST": "Background Vocals",
    "PRODUCER": "Producer",
    "CO-PRODUCER": "Co-Producer",
    "AUTHOR": "Lyricist",
    "ARRANGER": "Arranger",
    "BACKING VOCALS": "Background Vocals",
    "BASS": "Bass",
    "DRUMS": "Drums",
    "GUITAR": "Guitar",
    "KEYBOARD": "Keyboards",
    "TRUMPET": "Trumpet",
    "TUBA": "Tuba",
    "LYRICIST": "Lyricist",
    "COMPOSER": "Composer",
    "REMIXER": "Remixer",
    "MIXER": "Mixing Engineer",
    "MASTERER": "Mastering Engineer",
    "RECORDER": "Recording Engineer",
    "MIXING ENGINEER": "Mixing Engineer",
    "MASTERING ENGINEER": "Mastering Engineer",
    "RECORDING ENGINEER": "Recording Engineer",
    "ADDITIONAL ENGINEER": "Additional Engineering",
    "PROGRAMMING": "Programmer",
    "MUSIC PUBLISHER": "Publisher",
  };

  function replaceWords(text) {
    for (const [key, value] of Object.entries(replacements)) {
      text = text.replace(new RegExp(key, 'g'), value);
    }
    return text;
  }

  function enableTextHoverAndCopy() {
    const addHoverAndCopy = (elements) => {
      elements.forEach(element => {
        element.style.userSelect = 'none';
        element.style.cursor = 'pointer';
        element.addEventListener('mouseenter', () => {
          element.style.textDecoration = 'underline';
        });
        element.addEventListener('mouseleave', () => {
          element.style.textDecoration = 'none';
        });
        element.addEventListener('click', async (event) => {
          event.stopPropagation();
          let textToCopy = element.innerText;
          textToCopy = replaceWords(textToCopy);
          await navigator.clipboard.writeText(textToCopy);
          if (isTidalHighlighting) {
            element.style.color = 'var(--wave-color-solid-accent-fill)';
            setTimeout(() => {
              element.style.color = 'inherit';
            }, 250);
          }
        });
      });
    };

    addHoverAndCopy(document.querySelectorAll('.wave-text-capital-demi'));

    const creditCells = document.querySelectorAll('.wave-text-description-medium');
    creditCells.forEach(cell => {
      const linkElements = Array.from(cell.querySelectorAll('a')).filter(el => el.href);

      linkElements.forEach((link, index) => {
        const span = document.createElement('span');
        span.innerText = link.innerText;
        span.style.pointerEvents = 'auto';
        span.style.color = 'inherit';
        addHoverAndCopy([span]);
        link.parentNode.replaceChild(span, link);
        if (index < linkElements.length - 1) {
          span.parentNode.insertBefore(document.createTextNode(', '), span.nextSibling);
        }
      });
    });

    const itemElements = document.querySelectorAll('.wave-text-description-medium'); itemElements.forEach(item => {
      const names = item.innerText.split(',').map(name => name.trim());
      item.innerHTML = '';
      names.forEach((name, index) => {
        const nameSpan = document.createElement('span');
        nameSpan.innerText = name;
        addHoverAndCopy([nameSpan]);
        item.appendChild(nameSpan);
        if (index < names.length - 1) {
          item.appendChild(document.createTextNode(', '));
        }
      });
    });
  }





  function clickTidalPremiumPopup() {
    const closeButton = document.querySelector('._modalHeader_e62bee9 [data-test="modal-close-button"]');

    if (closeButton) {
      closeButton.click();
    }
  }





  window.addEventListener('click', () => {
    const tidalArtistUrlPattern = /^https:\/\/(?:listen\.)?tidal\.com\/artist\//;
    const tidalAlbumUrlPattern = /^https:\/\/(?:listen\.)?tidal\.com\/album\//;
    const tidalBrowseAlbumUrlPattern = /^https:\/\/(?:listen\.)?tidal\.com\/browse\/album\//;
    const tidalPlaylistUrlPattern = /^https:\/\/(?:listen\.)?tidal\.com\/playlist\//;

    if (tidalArtistUrlPattern.test(window.location.href)) {
      if (isTidalCopyArtist) addCopyCoverButton();
    }
    if (tidalAlbumUrlPattern.test(window.location.href) || tidalPlaylistUrlPattern.test(window.location.href)) {
      if (isTidalCopyCover) addCopyCoverButton();
    }
    if (tidalBrowseAlbumUrlPattern.test(window.location.href)) {
      if (isTidalCopyCover) addBrowseCopyButton();
    }
    if (isTidalCopyCredits) enableTextHoverAndCopy();
  });

  const observer = new MutationObserver(() => {
    if (isTidalPremiumPopup) clickTidalPremiumPopup();
  });
  observer.observe(document.body, { childList: true, subtree: true });

});