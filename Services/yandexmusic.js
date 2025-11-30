chrome.storage.local.get(['Services/yandexmusic.js', 'isYandexMusicCopyCover', 'isYandexMusicPopup', 'isYandexMusicConvertPNG', 'isYandexMusicSaveImage', 'isYandexMusicHostImgBB', 'isYandexMusicHostFilestack'], function (result) {
  const isYandexMusicCopyCover = result.isYandexMusicCopyCover !== undefined ? result.isYandexMusicCopyCover : true;
  const isYandexMusicPopup = result.isYandexMusicPopup !== undefined ? result.isYandexMusicPopup : true;
  const isYandexMusicConvertPNG = result.isYandexMusicConvertPNG !== undefined ? result.isYandexMusicConvertPNG : false;
  const isYandexMusicSaveImage = result.isYandexMusicSaveImage !== undefined ? result.isYandexMusicSaveImage : false;
  const isYandexMusicHostImgBB = result.isYandexMusicHostImgBB !== undefined ? result.isYandexMusicHostImgBB : true;
  const isYandexMusicHostFilestack = result.isYandexMusicHostFilestack !== undefined ? result.isYandexMusicHostFilestack : false;

  if (result['Services/yandexmusic.js'] === false) {
    return;
  }

  // Copy Cover Button
  function addCopyCoverButton() {
    const actionBar = document.querySelector(".CommonPageHeader_controls__c27E_") ||
      document.querySelector(".PageHeaderPlaylist_mainControls__k_S_i") ||
      document.querySelector(".PageHeaderArtist_controls__U_6g7");

    if (actionBar && !document.getElementById('copy-cover-button')) {
      const copyButton = document.createElement("button");
      copyButton.id = 'copy-cover-button';
      copyButton.innerText = isYandexMusicSaveImage ? "Save Cover" : "Copy Cover";

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

      copyButton.addEventListener('click', async (event) => {
        event.preventDefault();
        sessionStorage.setItem("mouseX", event.clientX);
        sessionStorage.setItem("mouseY", event.clientY);

        //const currentUrl = window.location.href;
        const coverUrl = await getYandexMusicArtwork();

        if (coverUrl) {
          const urlName = `yandexmusic`;
          const fileName = getFileNameFromUrl(coverUrl);
          const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
          const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
          const design = {
            position: "fixed",
            backgroundColor: "var(--ym-controls-color-primary-default-enabled)",
            color: "var(--ym-controls-color-primary-on_default-enabled)",
            borderRadius: "500px",
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: "bold",
            zIndex: "9999",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            top: `${mouseY + 40}px`,
            left: `${mouseX + 50}px`
          };
          await processJpgImage(coverUrl, urlName, fileName, isYandexMusicHostFilestack, isYandexMusicHostImgBB, isYandexMusicSaveImage, isYandexMusicConvertPNG, isYandexMusicPopup, design);
        }
      });

      actionBar.appendChild(copyButton);
    }
  }

  //Yandex Music Artwork Fetcher via page source
  async function getYandexMusicArtwork() {
    try {
      const response = await fetch(window.location.href);
      const text = await response.text();
      const regex = /\"property\\\":\\\"og:image\\\",\\\"content\\\":\\\"(https:\/\/avatars\.yandex\.net\/get-music-(content|user-playlist)[^\"]+)\"/;
      const match = text.match(regex);
      if (match && match[1]) {
        const coverImageUrl = match[1];
        return coverImageUrl;
      }
    } catch (error) {
      console.error("Error fetching cover:", error.message);
    }
  }

  function getFileNameFromUrl(url) {
    const parts = url.split('/');
    const fileNameWithExtension = parts.pop().split('.')[0];
    const fileNameWithoutSuffix = fileNameWithExtension.split('-')[0];
    return fileNameWithoutSuffix;
  }



  window.addEventListener('click', function () {
    if (isYandexMusicCopyCover) addCopyCoverButton();
  });
  
});