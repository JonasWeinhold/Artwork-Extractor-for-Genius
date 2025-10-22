chrome.storage.local.get(['Services/tidal.js', 'isTidalCopyCover', 'isTidalCopyArtist', 'isTidalCopyCredits', 'isTidalPopup', 'isTidalHighlighting', 'isTidalPremiumPopup', 'isTidalConvertPNG', 'isTidalSaveImage', 'isTidalHostImage'], function (result) {
  const isTidalCopyCover = result.isTidalCopyCover !== undefined ? result.isTidalCopyCover : true;
  const isTidalCopyArtist = result.isTidalCopyArtist !== undefined ? result.isTidalCopyArtist : true; 
  const isTidalCopyCredits = result.isTidalCopyCredits !== undefined ? result.isTidalCopyCredits : true; 
  const isTidalPopup = result.isTidalPopup !== undefined ? result.isTidalPopup : true;
  const isTidalHighlighting = result.isTidalHighlighting !== undefined ? result.isTidalHighlighting : true; 
  const isTidalPremiumPopup = result.isTidalPremiumPopup !== undefined ? result.isTidalPremiumPopup : false; 
  const isTidalConvertPNG = result.isTidalConvertPNG !== undefined ? result.isTidalConvertPNG : true; 
  const isTidalSaveImage = result.isTidalSaveImage !== undefined ? result.isTidalSaveImage : false; 
  const isTidalHostImage = result.isTidalHostImage !== undefined ? result.isTidalHostImage : true; 

  if (result['Services/tidal.js'] === false) {
    return;
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

  function clickTidalPremiumPopup() {
    const closeButton = document.querySelector('._modalHeader_e62bee9 [data-test="modal-close-button"]');

    if (closeButton) {
      closeButton.click();
    }
  }

  function createBrowseCopyButton() {
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
        const imageUrl = await getLatestImageUrl();
        if (imageUrl) {
          if (imageUrl) {
            await processTidalImage(imageUrl);
          }
        }
      });

      mainButton.insertAdjacentElement('afterend', copyButton);
    }
  }

  function createCopyButton() {
    const buttonContainer = document.querySelector('button[data-test="shuffle-all"]');

    if (buttonContainer && !document.getElementById('copy-cover-button')) {
      const copyButton = document.createElement('button');
      copyButton.id = 'copy-cover-button';
      copyButton.innerText = isTidalSaveImage ? "Save Cover" : "Copy Cover";
      Object.assign(copyButton.style, {
        backgroundColor: '#fff',
        color: 'var(--wave-color-solid-base-fill)',
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
        const imageUrl = await getLatestImageUrl();
        if (imageUrl) {
          if (imageUrl) {
            await processTidalImage(imageUrl);
          }
        }
      });

      buttonContainer.insertAdjacentElement('afterend', copyButton);
    }
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

  async function processTidalImage(extractedUrl) {
    const fileName = getFileNameFromUrl(extractedUrl);

    if (isTidalConvertPNG) {
      const pngDataUrl = await convertJpgToPng(extractedUrl);

      if (pngDataUrl) {
        if (isTidalHostImage) {
          const uploadedUrl = await uploadToImgBB(pngDataUrl, fileName);
          if (uploadedUrl) {
            await navigator.clipboard.writeText(uploadedUrl);
            if (isTidalPopup) {
              showPopupNotification();
            }
          } else {
            console.error('Error uploading the image.');
          }
        } else if (isTidalSaveImage) {
          const link = document.createElement('a');
          link.href = pngDataUrl;
          link.download = `${fileName}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        console.error('Error converting to PNG.');
      }
    } else {
      if (isTidalHostImage) {
        await navigator.clipboard.writeText(extractedUrl);
        if (isTidalPopup) {
          showPopupNotification();
        }
      } else if (isTidalSaveImage) {
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
    const parts = url.split('/images/'); 
    const fileNameWithExtension = parts.length > 1 ? parts[1] : ''; 
    const fileNameWithoutSuffix = fileNameWithExtension.split('.')[0]; 
    return fileNameWithoutSuffix; 
  }

  function showPopupNotification() {
    const popup = document.createElement("div");
    popup.className = "popup-notification";
    popup.innerText = "Copied to clipboard";
    Object.assign(popup.style, {
      position: "fixed",
      backgroundColor: "#fff",
      color: "var(--wave-color-solid-base-fill)",
      borderRadius: "16px",
      padding: "10px 20px",
      fontSize: "12px",
      fontWeight: "bold",
      zIndex: "9999",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    });
    const mouseX = parseInt(sessionStorage.getItem('mouseX'), 10);
    const mouseY = parseInt(sessionStorage.getItem('mouseY'), 10);
    popup.style.top = `${mouseY + 50}px`;
    popup.style.left = `${mouseX + 75}px`;
    document.body.appendChild(popup);
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 1500);
  }

  async function getLatestImageUrl() {
    const images = Array.from(document.querySelectorAll('img'));
    const currentUrl = window.location.href;

    if (images.length > 0) {
      return images[0].src.replace(/\d{2,4}x\d{2,4}\.(jpg|png|jpeg)$/, 'origin.jpg');
    }

    return null;
  }

  async function getLatestImageUrlold() {
    const images = Array.from(document.querySelectorAll('img'));
    const currentUrl = window.location.href;
    console.log('getLatestImageUrl called', currentUrl, images);
    const dimensions = {
      'https://tidal.com/album/': { width: 1280, height: 1280 },
      'https://tidal.com/artist/': { width: 750, height: 750 },
      'https://tidal.com/playlist/': { width: 1080, height: 1080 },
      'https://tidal.com/browse/album/': { width: 320, height: 320 },
      'https://listen.tidal.com/album/': { width: 1280, height: 1280 },
      'https://listen.tidal.com/artist/': { width: 750, height: 750 },
      'https://listen.tidal.com/playlist/': { width: 1080, height: 1080 },
      'https://listen.tidal.com/browse/album/': { width: 320, height: 320 }
    };

    for (const [url, { width, height }] of Object.entries(dimensions)) {
      if (currentUrl.startsWith(url)) {
        const filteredImages = images.filter(img => img.naturalWidth === width && img.naturalHeight === height);
        console.log('Filtered Images:', filteredImages);
        if (filteredImages.length > 0) {
          return filteredImages[filteredImages.length - 1].src.replace(/(1280x1280|750x750|1080x1080|320x320)\.jpg$/, 'origin.jpg');
        }
        break;
      }
    }
    return null;
  }

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

  window.addEventListener('click', () => {
    const tidalArtistUrlPattern = /^https:\/\/(?:listen\.)?tidal\.com\/artist\//;
    const tidalAlbumUrlPattern = /^https:\/\/(?:listen\.)?tidal\.com\/album\//;
    const tidalBrowseAlbumUrlPattern = /^https:\/\/(?:listen\.)?tidal\.com\/browse\/album\//;
    const tidalPlaylistUrlPattern = /^https:\/\/(?:listen\.)?tidal\.com\/playlist\//;

    //const tidalArtistUrlPattern = /^https:\/\/listen\.tidal\.com\/artist\//;
    //const tidalAlbumUrlPattern = /^https:\/\/listen\.tidal\.com\/album\//;
    //const tidalPlaylistUrlPattern = /^https:\/\/listen\.tidal\.com\/playlist\//;

    if (tidalArtistUrlPattern.test(window.location.href)) {
      if (isTidalCopyArtist) createCopyButton();
    }
    if (tidalAlbumUrlPattern.test(window.location.href) || tidalPlaylistUrlPattern.test(window.location.href)) {
      if (isTidalCopyCover) createCopyButton();
    }
    if (tidalBrowseAlbumUrlPattern.test(window.location.href)) {
      if (isTidalCopyCover) createBrowseCopyButton();
    }
    if (isTidalCopyCredits) enableTextHoverAndCopy();
  });

  document.addEventListener('DOMContentLoaded', enableTextHoverAndCopy);

  const observer = new MutationObserver(() => {
    if (isTidalPremiumPopup) clickTidalPremiumPopup(); 
  });
  observer.observe(document.body, { childList: true, subtree: true }); 

});