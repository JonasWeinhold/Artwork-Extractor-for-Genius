chrome.storage.local.get(['Services/deezer.js', 'isDeezerCopyCover', 'isDeezerCopyArtist', 'isDeezerTrack', 'isDeezerShowCover', 'isDeezerPopup', 'isDeezerPremiumPopup', 'isDeezerSaveImage'], function (result) {
    const isDeezerCopyCover = result.isDeezerCopyCover !== undefined ? result.isDeezerCopyCover : true;
    const isDeezerCopyArtist = result.isDeezerCopyArtist !== undefined ? result.isDeezerCopyArtist : true;
    const isDeezerTrack = result.isDeezerTrack !== undefined ? result.isDeezerTrack : true;
    const isDeezerShowCover = result.isDeezerShowCover !== undefined ? result.isDeezerShowCover : true;
    const isDeezerPopup = result.isDeezerPopup !== undefined ? result.isDeezerPopup : true;
    const isDeezerPremiumPopup = result.isDeezerPremiumPopup !== undefined ? result.isDeezerPremiumPopup : false;
    const isDeezerSaveImage = result.isDeezerSaveImage !== undefined ? result.isDeezerSaveImage : false;

    if (result['Services/deezer.js'] === false) {
        return;
    }

    // Copy Cover Button
    function addCopyCoverButton() {
        const menuButton = document.querySelector('.chakra-button__group[data-testid="toolbar"]');

        if (menuButton && !document.getElementById('copy-cover-button')) {
            const copyButton = document.createElement('button');
            copyButton.id = 'copy-cover-button';
            copyButton.innerText = isDeezerSaveImage ? "Save Cover" : "Copy Cover";

            Object.assign(copyButton.style, {
                backgroundColor: "#A238FF",
                color: "white",
                height: "var(--tempo-sizes-size-xl)",
                border: "none",
                borderRadius: "10px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "var(--tempo-fontSizes-body-xl)",
                fontWeight: "bold"
            });

            copyButton.addEventListener('click', async (event) => {
                event.preventDefault();
                sessionStorage.setItem('mouseX', event.clientX);
                sessionStorage.setItem('mouseY', event.clientY);

                const currentUrl = window.location.href;
                const coverUrl = await getDeezerArtwork(currentUrl);
                const imageUrl = coverUrl.replace(/\/\d+x\d+(?:-000000-\d+-\d+-\d+)?\.jpg$/, '/1000x1000.png');
                const fileName = getFileNameFromUrl(imageUrl);
                const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                const design = {
                    position: "fixed",
                    backgroundColor: "#A238FF",
                    color: "white",
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    zIndex: "9999",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    top: `${mouseY + 50}px`,
                    left: `${mouseX + 75}px`
                };
                await processPngImage(imageUrl, fileName, isDeezerSaveImage, isDeezerPopup, design);
            });

            menuButton.appendChild(copyButton);
        }
    }

    //Deezer Artwork Fetcher via og:image meta tag
    async function getDeezerArtwork(currentUrl) {
        /*  if (/^https:\/\/www\.deezer\.com\/[a-z]{2}\/track\//.test(currentUrl)) {
              const metaTags = document.getElementsByTagName('meta');
              for (let i = 0; i < metaTags.length; i++) {
                  if (metaTags[i].getAttribute('property') === 'og:image') {
                      const coverUrl = metaTags[i].getAttribute('content');
                      return coverUrl;
                  }
              }
          } else {*/
        try {
            const response = await fetch(currentUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const metaTags = doc.getElementsByTagName('meta');

            for (let i = 0; i < metaTags.length; i++) {
                if (metaTags[i].getAttribute('property') === 'og:image') {
                    const coverUrl = metaTags[i].getAttribute('content');
                    return coverUrl;
                }
            }
        } catch (error) {
            console.error('Error fetching cover:', error.message);
        }
        //  }
    }

    function getFileNameFromUrl(url) {
        const parts = url.split('/');
        const fileNameWithExtension = parts[parts.length - 2].split('.')[0];
        return fileNameWithExtension;
    }




    
    // Show Cover Button
    function addShowCoverButton() {
        const images = performance.getEntriesByType("resource")
            .filter(entry => entry.initiatorType === "img" && entry.name.endsWith("120x120-000000-80-0-0.jpg"))
            .map(entry => entry.name);

        if (images.length >= 1) {

            const menuButton = document.querySelector('.chakra-button__group');
            if (menuButton && !document.getElementById('show-cover-button')) {
                const showButton = document.createElement('button');
                showButton.id = 'show-cover-button';
                showButton.innerText = "Show Cover";

                Object.assign(showButton.style, {
                    backgroundColor: "#A238FF",
                    color: "white",
                    height: "var(--tempo-sizes-size-xl)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "var(--tempo-fontSizes-body-xl)",
                    fontWeight: "bold"
                });

                showButton.addEventListener('click', async (event) => {
                    showImagePopup(images);
                });

                menuButton.appendChild(showButton);
            }
        }
    }

    function showImagePopup(images) {
        const popup = document.createElement("div");
        Object.assign(popup.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: "1000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto"
        });

        const imageContainer = document.createElement("div");
        Object.assign(imageContainer.style, {
            display: "grid",
            gap: "10px",
            maxWidth: "90%",
            margin: "auto",
            padding: "20px"
        });

        if (images.length < 4) {
            imageContainer.style.gridTemplateColumns = `repeat(${images.length}, 1fr)`;
        } else {
            imageContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
        }


        images.forEach(coverUrl => {
            const thumbnailUrl = coverUrl.replace(/120x120-000000-80-0-0\.jpg$/, '500x500-000000-80-0-0.jpg');
            const img = document.createElement("img");
            img.src = thumbnailUrl;
            Object.assign(img.style, {
                width: "100%",
                maxWidth: "100%",
                cursor: "pointer"
            });

            img.addEventListener('click', async (event) => {
                event.preventDefault();
                sessionStorage.setItem('mouseX', event.clientX);
                sessionStorage.setItem('mouseY', event.clientY);

                const imageUrl = coverUrl.replace(/120x120-000000-80-0-0\.jpg$/, '1000x1000.png');
                const fileName = getFileNameFromUrl(imageUrl);
                const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                const design = {
                    position: "fixed",
                    backgroundColor: "#A238FF",
                    color: "white",
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    zIndex: "9999",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    top: `${mouseY + 50}px`,
                    left: `${mouseX + 75}px`
                };
                await processPngImage(imageUrl, fileName, isDeezerSaveImage, isDeezerPopup, design);
            });

            imageContainer.appendChild(img);
        });

        popup.appendChild(imageContainer);

        popup.addEventListener('click', async (event) => {
            if (event.target === popup) {
                document.body.removeChild(popup);
            }
        });
        document.body.appendChild(popup);
    }





    // Track Button
    function addTrackButton() {
        const rowGroups = document.querySelectorAll('[role="rowgroup"]');
        if (rowGroups.length >= 2 && !document.getElementById('track-button')) {
            const draggableElements = document.querySelectorAll(`${rowGroups[1].querySelector('[role="row"]').className.split(' ').map(cn => `.${cn}`).join('')}`);
            draggableElements.forEach((element, index) => {
                const trackButton = document.createElement("button");
                trackButton.id = 'track-button';
                trackButton.innerText = "Track";

                Object.assign(trackButton.style, {
                    backgroundColor: "#A238FF",
                    color: "white",
                    height: "var(--tempo-sizes-size-l)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    marginRight: "8px",
                    fontSize: "var(--tempo-fontSizes-body-l)",
                    fontWeight: "bold"
                });

                const titleElement = element.querySelector('.A0Vbi');
                if (titleElement) {
                    titleElement.parentNode.insertBefore(trackButton, titleElement);
                }

                trackButton.addEventListener('click', (event) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', window.location.href, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            const pageSource = xhr.responseText;
                            const idMatches = [...pageSource.matchAll(/"SNG_ID":"(\d+)"/g)];

                            if (idMatches.length > index) {
                                const trackId = idMatches[index][1];
                                const currentUrl = window.location.href;
                                const countryCodeMatch = currentUrl.match(/https:\/\/www\.deezer\.com\/([a-z]{2})\//);
                                const countryCode = countryCodeMatch ? countryCodeMatch[1] : 'us';

                                const deezerLink = `https://www.deezer.com/${countryCode}/track/${trackId}`;
                                window.location.href = deezerLink;
                                //window.open(deezerLink, '_blank');
                            }
                        }
                    };
                    xhr.send();
                });
            });
        }
    }





    function closeDeezerPremiumPopup() {
        const closeButton = document.querySelector('button.chakra-modal__close-btn');
        if (closeButton) {
            closeButton.click();
        }
    }





    document.addEventListener('click', (event) => {
        const trackUrlPattern = /^https:\/\/www\.deezer\.com\/[a-zA-Z]{2}\/track\//;
        const artistUrlPattern = /^https:\/\/www\.deezer\.com\/[a-zA-Z]{2}\/artist\//;
        const albumUrlPattern = /^https:\/\/www\.deezer\.com\/[a-zA-Z]{2}\/album\//;
        if (trackUrlPattern.test(window.location.href)) {
            if (isDeezerShowCover) addShowCoverButton();
        }
        if (artistUrlPattern.test(window.location.href)) {
            if (isDeezerCopyArtist) addCopyCoverButton();
        }
        if (albumUrlPattern.test(window.location.href)) {
            if (isDeezerCopyCover) addCopyCoverButton();
        }
        if (isDeezerTrack) addTrackButton();
    });

    const observer = new MutationObserver(() => {
        if (isDeezerPremiumPopup) closeDeezerPremiumPopup();
    });
    observer.observe(document.body, { childList: true, subtree: true });

});