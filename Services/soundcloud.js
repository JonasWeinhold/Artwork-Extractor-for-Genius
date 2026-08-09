chrome.storage.local.get(['Services/soundcloud.js', 'isSoundCloudCopyCover', 'isSoundCloudPopup', 'isSoundCloudArtistBanner', 'isSoundCloudConvertPNG', 'isSoundCloudSaveImage', 'isSoundCloudHostImgBB', 'isSoundCloudHostFilestack'], function (result) {
  const isSoundCloudCopyCover = result.isSoundCloudCopyCover !== undefined ? result.isSoundCloudCopyCover : true;
  const isSoundCloudPopup = result.isSoundCloudPopup !== undefined ? result.isSoundCloudPopup : true;
  const isSoundCloudArtistBanner = result.isSoundCloudArtistBanner !== undefined ? result.isSoundCloudArtistBanner : false;
  const isSoundCloudConvertPNG = result.isSoundCloudConvertPNG !== undefined ? result.isSoundCloudConvertPNG : true;
  const isSoundCloudSaveImage = result.isSoundCloudSaveImage !== undefined ? result.isSoundCloudSaveImage : false;
  const isSoundCloudHostImgBB = result.isSoundCloudHostImgBB !== undefined ? result.isSoundCloudHostImgBB : false;
  const isSoundCloudHostFilestack = result.isSoundCloudHostFilestack !== undefined ? result.isSoundCloudHostFilestack : true;

  if (result['Services/soundcloud.js'] === false) {
    return;
  }


  // Copy Cover Button
  function addCopyCoverButtonOldPage() {
    const actionBar = document.querySelector('.soundActions.sc-button-toolbar.listenEngagement__actions.soundActions__medium');
    if (actionBar && !document.getElementById('copy-cover-button')) {
      const copyButton = document.createElement('button');
      copyButton.id = 'copy-cover-button';
      copyButton.innerText = isSoundCloudSaveImage ? "Save Cover" : "Copy Cover";

      Object.assign(copyButton.style, {
        display: 'inline-block',
        position: 'relative',
        height: '32px',
        padding: '2px 11px 2px 10px',
        border: '1px solid #f50',
        borderRadius: '4px',
        backgroundColor: '#f50',
        cursor: 'pointer',
        color: '#fff',
        fontSize: '14px',
        lineHeight: '20px',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '100',
        textAlign: 'center',
        verticalAlign: 'initial',
        userSelect: 'none',
        boxSizing: 'border-box'
      });

      copyButton.addEventListener('click', async (event) => {
        event.preventDefault();
        sessionStorage.setItem('mouseX', event.clientX);
        sessionStorage.setItem('mouseY', event.clientY);

        //const currentUrl = window.location.href;
        const coverUrl = await getSoundCloudArtworkOldPage();
        const imageUrl = coverUrl.replace(/-t\d+x\d+\.(jpg|png)$/, '-original.$1');

        if (imageUrl.endsWith('.jpg')) {
          const urlName = `soundcloud`;
          const fileName = getFileNameFromUrl(imageUrl);
          const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
          const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
          const design = {
            position: "fixed",
            backgroundColor: "#f50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: "bold",
            fontFamily: 'Inter, sans-serif',
            zIndex: "9999",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            top: `${mouseY + 30}px`,
            left: `${mouseX + 40}px`
          };
          await processJpgImage(imageUrl, urlName, fileName, isSoundCloudHostFilestack, isSoundCloudHostImgBB, isSoundCloudSaveImage, isSoundCloudConvertPNG, isSoundCloudPopup, design);
        } else if (imageUrl.endsWith('.png')) {
          const fileName = getFileNameFromUrl(imageUrl);
          const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
          const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
          const design = {
            position: "fixed",
            backgroundColor: "#f50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: "bold",
            fontFamily: 'Inter, sans-serif',
            zIndex: "9999",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            top: `${mouseY + 30}px`,
            left: `${mouseX + 40}px`
          };
          await processPngImage(imageUrl, fileName, isSoundCloudSaveImage, isSoundCloudPopup, design);
        }
      });

      actionBar.appendChild(copyButton);
    }
  }

  function addCopyCoverButton() {
    const actionBar = document.querySelector('.MuiStack-root.mui-16ytee5');
    if (actionBar && !document.getElementById('copy-cover-button')) {
      const copyButton = document.createElement('button');
      copyButton.id = 'copy-cover-button';
      copyButton.innerText = isSoundCloudSaveImage ? "Save Cover" : "Copy Cover";

      Object.assign(copyButton.style, {
        display: 'inline-block',
        position: 'relative',
        height: '40px',
        padding: '2px 11px 2px 10px',
        border: '1px solid #b0b0b0',
        borderRadius: '40px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        color: '#fafafa',
        fontSize: '14px',
        lineHeight: '20px',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '100',
        textAlign: 'center',
        verticalAlign: 'initial',
        userSelect: 'none',
        boxSizing: 'border-box'
      });

      copyButton.addEventListener('click', async (event) => {
        event.preventDefault();
        sessionStorage.setItem('mouseX', event.clientX);
        sessionStorage.setItem('mouseY', event.clientY);

        const coverUrl = await getSoundCloudArtwork();
        const imageUrl = coverUrl.replace(/-t\d+x\d+\.(jpg|png)$/, '-original.$1');
        console.log(imageUrl);

        if (imageUrl.endsWith('.jpg')) {
          const urlName = `soundcloud`;
          const fileName = getFileNameFromUrl(imageUrl);
          const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
          const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
          const design = {
            position: "fixed",
            backgroundColor: "#636363",
            color: "white",
            border: "none",
            borderRadius: "40px",
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: "bold",
            fontFamily: 'Inter, sans-serif',
            zIndex: "9999",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            top: `${mouseY + 30}px`,
            left: `${mouseX + 40}px`
          };
          await processJpgImage(imageUrl, urlName, fileName, isSoundCloudHostFilestack, isSoundCloudHostImgBB, isSoundCloudSaveImage, isSoundCloudConvertPNG, isSoundCloudPopup, design);
        } else if (imageUrl.endsWith('.png')) {
          const fileName = getFileNameFromUrl(imageUrl);
          const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
          const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
          const design = {
            position: "fixed",
            backgroundColor: "#636363",
            color: "white",
            border: "none",
            borderRadius: "40px",
            padding: "10px 20px",
            fontSize: "12px",
            fontWeight: "bold",
            fontFamily: 'Inter, sans-serif',
            zIndex: "9999",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            top: `${mouseY + 30}px`,
            left: `${mouseX + 40}px`
          };
          await processPngImage(imageUrl, fileName, isSoundCloudSaveImage, isSoundCloudPopup, design);
        }
      });

      copyButton.addEventListener('mouseenter', () => {
        copyButton.style.backgroundColor = '#636363';
      });

      copyButton.addEventListener('mouseleave', () => {
        copyButton.style.backgroundColor = 'transparent';
      });

      actionBar.appendChild(copyButton);
    }
  }

  //SoundCloud Artwork Fetcher via og:image meta tag
  async function getSoundCloudArtworkOldPage() {
    try {
      const response = await fetch(window.location.href);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const metaTag = doc.querySelector('meta[property="og:image"]');
      if (metaTag) {
        const coverImageUrl = metaTag.getAttribute('content');
        return coverImageUrl;
      }
    } catch (error) {
      console.error('Error fetching cover:', error.message);
      return null;
    }
  }

  async function getSoundCloudArtwork() {
    try {
      const headers = document.querySelectorAll('[aria-label="Track-Header"]');

      for (const header of headers) {
        const imgs = header.querySelectorAll('img');

        for (const img of imgs) {
          if (img.closest('span') || img.closest('ol') || img.closest('form')) {
            continue;
          }

          const src = img.currentSrc || img.src;
          if (src) {
            return src;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching cover:', error.message);
      return null;
    }
  }

  function getFileNameFromUrl(url) {
    const parts = url.split('/');
    const fileNameWithExtension = parts.pop().split('.')[0];
    return fileNameWithExtension;
  }





  function closeSoundCloudArtistBanner() {
    const banner = document.querySelector('.l-product-banners.l-inner-fullwidth');
    if (banner) {
      const closeButton = banner.querySelector('button.banner__close');
      if (closeButton) {
        closeButton.click();
      }
    }
  }



  document.addEventListener('click', function () {
    if (isSoundCloudCopyCover) addCopyCoverButtonOldPage();
    if (isSoundCloudCopyCover) addCopyCoverButton();
  });

  const observer = new MutationObserver(() => {
    if (isSoundCloudArtistBanner) closeSoundCloudArtistBanner();
  });
  observer.observe(document.body, { childList: true, subtree: true });

});
