chrome.storage.local.get(['Services/yandexmusic.js', 'isYandexMusicCopyCover', 'isYandexMusicPopup', 'isYandexMusicConvertPNG', 'isYandexMusicSaveImage','isYandexMusicHostImage'], function (result) {
  const isYandexMusicCopyCover = result.isYandexMusicCopyCover !== undefined ? result.isYandexMusicCopyCover : true;
  const isYandexMusicPopup = result.isYandexMusicPopup !== undefined ? result.isYandexMusicPopup : true;
  const isYandexMusicConvertPNG = result.isYandexMusicConvertPNG !== undefined ? result.isYandexMusicConvertPNG : false;
  const isYandexMusicSaveImage = result.isYandexMusicSaveImage !== undefined ? result.isYandexMusicSaveImage : false;
  const isYandexMusicHostImage = result.isYandexMusicHostImage !== undefined ? result.isYandexMusicHostImage : false;

  if (result['Services/yandexmusic.js'] === false) {
    return; 
  }

  async function extractYandexMusicImageUrl() {
    try {
      const response = await fetch(window.location.href);
      const htmlSource = await response.text();

      const regex = /\"property\\\":\\\"og:image\\\",\\\"content\\\":\\\"(https:\/\/avatars\.yandex\.net\/get-music-(content|user-playlist)[^\"]+)\"/;
      const match = htmlSource.match(regex);

      if (match && match[1]) {
        const coverUrl = match[1];
        await processYandexMusicImage(coverUrl);
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Seite:", error);
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
      console.error('Error:', error);
      return null;
    }
  }

  async function uploadToImgBB(pngDataUrl, fileName) {

    try {
      const base64Response = await fetch(pngDataUrl);
      const blob = await base64Response.blob();

      console.log("Blob:", blob); 

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

  async function processYandexMusicImage(extractedUrl) {
    const fileName = getFileNameFromUrl(extractedUrl);

    if (isYandexMusicConvertPNG) {

      const pngDataUrl = await convertJpgToPng(extractedUrl);

      if (pngDataUrl) {
        if (isYandexMusicHostImage) {
          const uploadedUrl = await uploadToImgBB(pngDataUrl, fileName);
          if (uploadedUrl) {
            await navigator.clipboard.writeText(uploadedUrl);
            if (isYandexMusicPopup) {
              showPopupNotification(); 
            }
          } else {
            console.error('Error uploading the image.');
          }
        } else if (isYandexMusicSaveImage) {
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
      if (isYandexMusicHostImage) {
        await navigator.clipboard.writeText(extractedUrl);
        if (isSpotifyPopup) {
          showPopupNotification(); 
        }
      } else if (isYandexMusicSaveImage) {
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
    const actionBar = document.querySelector(".CommonPageHeader_controls__c27E_") ||
      document.querySelector(".PageHeaderPlaylist_mainControls__k_S_i") ||
      document.querySelector(".PageHeaderArtist_controls__U_6g7");

    if (!actionBar) return;

    actionBar.style.display = "flex";
    actionBar.style.alignItems = "center";

    const existingButton = actionBar.querySelector(".copy-cover-button");
    if (existingButton) return;

    const copyButton = document.createElement("button");
    copyButton.innerText = isYandexMusicSaveImage ? "Save Cover" : "Copy Cover";
    copyButton.className = "copy-cover-button";
    Object.assign(copyButton.style, {
      backgroundColor: "var(--ym-controls-color-primary-default-enabled)",
      color: "var(--ym-controls-color-primary-on_default-enabled)",
      height: "40px",
      border: "none",
      borderRadius: "500px",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "var(--ym-font-size-label-s)",
      fontWeight: "600",
      order: 999
    });

    copyButton.onclick = (event) => {
      sessionStorage.setItem("mouseX", event.clientX);
      sessionStorage.setItem("mouseY", event.clientY);
      event.preventDefault();
      extractYandexMusicImageUrl();
    };

    actionBar.appendChild(copyButton);
  }

  function showPopupNotification() {
    const popup = document.createElement("div");
    popup.className = "popup-notification";
    const content = document.createElement("div");
    content.innerText = "Copied to clipboard";
    content.className = "popup-content";

    Object.assign(popup.style, {
      position: "fixed",
      backgroundColor: "var(--ym-controls-color-primary-default-enabled)",
      color: "var(--ym-controls-color-primary-on_default-enabled)",
      borderRadius: "500px",
      padding: "10px 20px",
      fontSize: "12px",
      fontWeight: "bold",
      zIndex: "9999",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    });

    const mouseX = parseInt(sessionStorage.getItem('mouseX'), 10);
    const mouseY = parseInt(sessionStorage.getItem('mouseY'), 10);
    popup.style.top = `${mouseY + 40}px`;
    popup.style.left = `${mouseX + 50}px`;

    popup.appendChild(content);
    document.body.appendChild(popup);
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 1500);
  }

  if (isYandexMusicCopyCover) {
    window.addEventListener("click", addCopyCoverButton);
  }
});