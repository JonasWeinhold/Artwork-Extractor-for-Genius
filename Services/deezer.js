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

    function closeDeezerPremiumPopup() {
        const closeButton = document.querySelector('button.chakra-modal__close-btn'); 
        if (closeButton) {
            closeButton.click(); 
        }
    }

    function copyCoverUrlToClipboard(coverUrl) {
        if (coverUrl) {
            const modifiedUrl = coverUrl.replace(/\/\d+x\d+(?:-000000-\d+-\d+-\d+)?\.jpg$/, '/1000x1000.png');

            if (isDeezerSaveImage) {
                fetch(modifiedUrl)
                    .then(response => {
                        if (!response.ok) throw new Error("Error");
                        return response.blob();
                    })
                    .then(blob => {
                        const urlParts = modifiedUrl.split('/'); 
                        const fileName = urlParts[urlParts.length - 2].split('.')[0];

                        const link = document.createElement("a");
                        const url = URL.createObjectURL(blob);
                        link.href = url;
                        link.download = `${fileName}.png`; 
                        link.style.display = "none";
                        document.body.appendChild(link);
                        link.click(); 
                        document.body.removeChild(link); 
                        URL.revokeObjectURL(url); 
                    })
                    .catch(err => {
                        console.error("Error downloading image:", err);
                    });
            } else {
                navigator.clipboard.writeText(modifiedUrl)
                if (isDeezerPopup) showPopupNotification(); 
            }
        }
    }

    function addCopyCoverButton() {
        const existingButton = document.querySelector(".copy-cover-button");
        if (existingButton) return; 

        const menuButton = document.querySelector('.chakra-button__group[data-testid="toolbar"]');

        if (menuButton) {
            const copyDiv = document.createElement("div"); 
            const copyButton = document.createElement("button"); 
            copyButton.innerText = isDeezerSaveImage ? "Save Cover" : "Copy Cover";
            copyButton.className = "copy-cover-button";

            copyButton.style.backgroundColor = "#A238FF"; 
            copyButton.style.color = "white";
            copyButton.style.height = "var(--tempo-sizes-size-xl)";
            copyButton.style.border = "none"; 
            copyButton.style.borderRadius = "10px";
            copyButton.style.padding = "8px 12px"; 
            copyButton.style.cursor = "pointer"; 
            copyButton.style.fontSize = "var(--tempo-fontSizes-body-xl)"; 
            copyButton.style.fontWeight = "bold"; 

            copyDiv.appendChild(copyButton);
            copyDiv.setAttribute("data-testid", "copy-cover");
            copyDiv.setAttribute("bis_skin_checked", "1");

            menuButton.appendChild(copyDiv);

            copyButton.onclick = (event) => {
                event.preventDefault(); 
                sessionStorage.setItem('copyCover', 'true'); 
                sessionStorage.setItem('mouseX', event.clientX); 
                sessionStorage.setItem('mouseY', event.clientY); 

                const currentUrl = window.location.href;

                if (/^https:\/\/www\.deezer\.com\/[a-z]{2}\/track\//.test(currentUrl)) {
                    const metaTags = document.getElementsByTagName('meta');
                    let coverUrl = '';

                    for (let i = 0; i < metaTags.length; i++) {
                        if (metaTags[i].getAttribute('property') === 'og:image') {
                            coverUrl = metaTags[i].getAttribute('content');
                            break;
                        }
                    }

                    if (coverUrl) {
                        copyCoverUrlToClipboard(coverUrl); 
                    } else {
                        console.error('Cover URL not found in meta tags.');
                    }
                } else {
                    fetch(currentUrl)
                        .then(response => response.text())
                        .then(html => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const metaTags = doc.getElementsByTagName('meta');
                            let coverUrl = '';

                            for (let i = 0; i < metaTags.length; i++) {
                                if (metaTags[i].getAttribute('property') === 'og:image') {
                                    coverUrl = metaTags[i].getAttribute('content');
                                    break;
                                }
                            }

                            copyCoverUrlToClipboard(coverUrl);
                        })
                        .catch(error => {
                            console.error('Error fetching the page:', error);
                        });
                }
            };
        }
    }

    function addShowCoverButton() {
        const existingButton = document.querySelector(".show-cover-button");
        if (existingButton) return;

        const menuButton = document.querySelector('.chakra-button__group');

        const images = performance.getEntriesByType("resource")
            .filter(entry => entry.initiatorType === "img" && entry.name.endsWith("120x120-000000-80-0-0.jpg"))
            .map(entry => entry.name);

        if (images.length >= 1) {
            const copyDiv = document.createElement("div"); 
            const showButton = document.createElement("button");
            showButton.innerText = "Show Cover"; 
            showButton.className = "show-cover-button"; 

            showButton.style.backgroundColor = "#A238FF"; 
            showButton.style.color = "white"; 
            showButton.style.height = "var(--tempo-sizes-size-xl)";
            showButton.style.border = "none"; 
            showButton.style.borderRadius = "10px";
            showButton.style.padding = "8px 12px"; 
            showButton.style.cursor = "pointer"; 
            showButton.style.fontSize = "var(--tempo-fontSizes-body-xl)"; 
            showButton.style.fontWeight = "bold"; 

            copyDiv.appendChild(showButton);
            copyDiv.setAttribute("data-testid", "show-cover");
            copyDiv.setAttribute("bis_skin_checked", "1");

            menuButton.appendChild(copyDiv);

            showButton.onclick = () => {
                showImagePopup(images);
            };
        }
    }




    function addTrackButton() {
        const rowGroups = document.querySelectorAll('[role="rowgroup"]');
        if (rowGroups.length >= 2) {
            const draggableElements = document.querySelectorAll(`${rowGroups[1].querySelector('[role="row"]').className.split(' ').map(cn => `.${cn}`).join('')}`);

            draggableElements.forEach((element, index) => {
                if (element.querySelector(".track-button")) return;

                const trackButton = document.createElement("button");
                trackButton.innerText = "Track";
                trackButton.className = "track-button";
                trackButton.style.cssText = `
                background-color: #A238FF;
                color: white;
                height: var(--tempo-sizes-size-l);
                border: none;
                border-radius: 10px;
                padding: 8px 12px;
                cursor: pointer;
                margin-right: 8px;
                font-size: var(--tempo-fontSizes-body-l);
                font-weight: bold;
                `;

                const titleElement = element.querySelector('.A0Vbi');
                if (titleElement) {
                    titleElement.parentNode.insertBefore(trackButton, titleElement);
                }

                trackButton.onclick = () => {
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
                };
            });
        }
    }










    function showImagePopup(images) {
        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.top = "0";
        popup.style.left = "0";
        popup.style.width = "100%";
        popup.style.height = "100%";
        popup.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        popup.style.zIndex = "1000";
        popup.style.display = "flex";
        popup.style.justifyContent = "center";
        popup.style.alignItems = "center";
        popup.style.overflow = "auto";

        const imageContainer = document.createElement("div");
        imageContainer.style.display = "grid";
        imageContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
        imageContainer.style.gap = "10px";
        imageContainer.style.maxWidth = "90%";
        imageContainer.style.margin = "auto";
        imageContainer.style.padding = "20px";

        images.forEach(imageUrl => {
            const newImageUrl = imageUrl.replace(/120x120-000000-80-0-0\.jpg$/, '500x500-000000-80-0-0.jpg');
            const img = document.createElement("img");
            img.src = newImageUrl;
            img.style.width = "100%";
            img.style.maxWidth = "100%";
            img.style.cursor = "pointer";

            img.onclick = () => {
                event.preventDefault(); 
                sessionStorage.setItem('showCover', 'true'); 
                sessionStorage.setItem('mouseX', event.clientX); 
                sessionStorage.setItem('mouseY', event.clientY); 
                const fullImageUrl = imageUrl.replace(/120x120-000000-80-0-0\.jpg$/, '1000x1000.png');
                if (isDeezerSaveImage) {
                    fetch(fullImageUrl)
                        .then(response => {
                            if (!response.ok) throw new Error("Fehler beim Abrufen des Bildes");
                            return response.blob();
                        })
                        .then(blob => {
                            const urlParts = fullImageUrl.split('/'); 
                            const fileName = urlParts[urlParts.length - 2].split('.')[0];
    
                            const link = document.createElement("a");
                            const url = URL.createObjectURL(blob);
                            link.href = url;
                            link.download = `${fileName}.png`; 
                            link.style.display = "none"; 
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link); 
                            URL.revokeObjectURL(url);
                        })
                        .catch(err => {
                            console.error("Fehler beim Herunterladen des Bildes:", err);
                        });
                } else {
                    navigator.clipboard.writeText(fullImageUrl)
                    if (isDeezerPopup) showPopupNotification(); 
                }
            };

            imageContainer.appendChild(img);
        });

        if (images.length < 4) {
            imageContainer.style.gridTemplateColumns = `repeat(4, 1fr)`;
            const imageSize = 100 / Math.min(images.length, 4);
            imageContainer.style.gridTemplateRows = `repeat(1, ${imageSize}%)`; 
            imageContainer.style.height = `${imageSize}vh`;
        }

        popup.appendChild(imageContainer);

        popup.onclick = (event) => {
            if (event.target === popup) {
                document.body.removeChild(popup);
            }
        };

        document.body.appendChild(popup);
    }



    function showPopupNotification() {
        const popup = document.createElement("div");
        popup.className = "popup-notification";

        const content = document.createElement("div");
        content.innerText = "Copied to clipboard";
        content.className = "popup-content";

        popup.style.position = "fixed";
        popup.style.backgroundColor = "#A238FF";
        popup.style.color = "white";
        popup.style.borderRadius = "10px";
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

    const observer = new MutationObserver(() => {
        if (isDeezerPremiumPopup) closeDeezerPremiumPopup();
    });
    observer.observe(document.body, { childList: true, subtree: true }); 


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
        
        sessionStorage.setItem('mouseX', event.clientX);
        sessionStorage.setItem('mouseY', event.clientY);
    });


});