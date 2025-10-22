chrome.storage.local.get(['Services/soundcloud.js', 'isSoundCloudCopyCover', 'isSoundCloudPopup', 'isSoundCloudArtistBanner', 'isSoundCloudConvertPNG', 'isSoundCloudSaveImage', 'isSoundCloudHostImage'], function (result) {
    const isSoundCloudCopyCover = result.isSoundCloudCopyCover !== undefined ? result.isSoundCloudCopyCover : true;
    const isSoundCloudPopup = result.isSoundCloudPopup !== undefined ? result.isSoundCloudPopup : true; 
    const isSoundCloudArtistBanner = result.isSoundCloudArtistBanner !== undefined ? result.isSoundCloudArtistBanner : false;
    const isSoundCloudConvertPNG = result.isSoundCloudConvertPNG !== undefined ? result.isSoundCloudConvertPNG : true; 
    const isSoundCloudSaveImage = result.isSoundCloudSaveImage !== undefined ? result.isSoundCloudSaveImage : false; 
    const isSoundCloudHostImage = result.isSoundCloudHostImage !== undefined ? result.isSoundCloudHostImage : true; 

    if (result['Services/soundcloud.js'] === false) {
        return;
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

    function addCopyCoverButton() {
        const actionBar = document.querySelector('.soundActions.sc-button-toolbar.listenEngagement__actions.soundActions__medium');
        if (actionBar) {
            if (!document.getElementById('copyCoverButton')) {
                const copyButton = document.createElement('button');
                copyButton.id = 'copyCoverButton';
                copyButton.innerText = isSoundCloudSaveImage ? "Save Cover" : "Copy Cover";
                copyButton.style.display = 'inline-block';
                copyButton.style.position = 'relative';
                copyButton.style.height = '32px';
                copyButton.style.padding = '2px 11px 2px 10px';
                copyButton.style.border = '1px solid #f50';
                copyButton.style.borderRadius = '3px';
                copyButton.style.backgroundColor = '#f50';
                copyButton.style.cursor = 'pointer';
                copyButton.style.color = '#fff';
                copyButton.style.fontSize = '14px';
                copyButton.style.lineHeight = '20px';
                copyButton.style.whiteSpace = 'nowrap';
                copyButton.style.fontFamily = 'Inter, sans-serif';
                copyButton.style.fontWeight = '100';
                copyButton.style.textAlign = 'center';
                copyButton.style.verticalAlign = 'initial';
                copyButton.style.userSelect = 'none';
                copyButton.style.boxSizing = 'border-box';
                actionBar.appendChild(copyButton);

                const soundStats = document.querySelector('.soundStats.sc-ministats-group.listenEngagement__stats.sc-ministats-group-right');
                if (soundStats) {
                    soundStats.style.display = 'none';
                }

                copyButton.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    sessionStorage.setItem('mouseX', event.clientX);
                    sessionStorage.setItem('mouseY', event.clientY);
                    fetchPageAndCopyLink();
                });
            }
        }
    }

    async function fetchPageAndCopyLink() {
        try {
            const response = await fetch(window.location.href);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const metaTag = doc.querySelector('meta[property="og:image"]');
            if (metaTag) {
                let coverImageUrl = metaTag.getAttribute('content');
                console.log('Extracted Cover Image URL:', coverImageUrl);
                coverImageUrl = coverImageUrl.replace(/-t\d+x\d+\.(jpg|png)$/, '-original.$1');
                if (coverImageUrl.endsWith('.jpg')) {
                    await processSoundCloudImage(coverImageUrl);
                } else if (coverImageUrl.endsWith('.png')) {
                    if (isSoundCloudHostImage) {
                        await navigator.clipboard.writeText(coverImageUrl);
                        if (isSoundCloudPopup) {
                          showPopupNotification(); 
                        }
                      } else if (isSoundCloudSaveImage) {
                        const response = await fetch(coverImageUrl); 
                        const blob = await response.blob();
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob); 
                        link.download = `${fileName}.png`; 
                        document.body.appendChild(link);
                        link.click(); 
                        document.body.removeChild(link);
                        URL.revokeObjectURL(link.href); 
                      }
                }
            }
        } catch (err) {
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

    async function processSoundCloudImage(extractedUrl) {
        const fileName = getFileNameFromUrl(extractedUrl);

        if (isSoundCloudConvertPNG) {
            const pngDataUrl = await convertJpgToPng(extractedUrl);

            if (pngDataUrl) {
                if (isSoundCloudHostImage) {
                    const uploadedUrl = await uploadToImgBB(pngDataUrl, fileName);
                    if (uploadedUrl) {
                        await navigator.clipboard.writeText(uploadedUrl);
                        if (isSoundCloudPopup) {
                            showPopupNotification(); 
                        }
                    } else {
                        console.error('Error uploading the image.');
                    }
                } else if (isSoundCloudSaveImage) {
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
            if (isSoundCloudHostImage) {
                await navigator.clipboard.writeText(extractedUrl);
                if (isSoundCloudPopup) {
                    showPopupNotification(); 
                }
            } else if (isSoundCloudSaveImage) {
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
        return fileNameWithExtension; 
    }

    function showPopupNotification() {
        const popup = document.createElement("div");
        popup.className = "popup-notification";
        const content = document.createElement("div");
        content.innerText = "Copied to clipboard";
        content.className = "popup-content";
        popup.style.position = "fixed";
        popup.style.backgroundColor = "#f50";
        popup.style.color = "white";
        popup.style.border = "none";
        popup.style.borderRadius = "3px";
        popup.style.padding = "10px 20px";
        popup.style.fontSize = "12px";
        popup.style.fontWeight = "bold";
        popup.style.fontFamily = 'Inter, sans-serif';
        popup.style.zIndex = "9999";
        popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
        const mouseX = parseInt(sessionStorage.getItem('mouseX'), 10);
        const mouseY = parseInt(sessionStorage.getItem('mouseY'), 10);
        popup.style.top = `${mouseY + 30}px`;
        popup.style.left = `${mouseX + 40}px`;
        popup.appendChild(content);
        document.body.appendChild(popup);
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 1500);
    }

    window.addEventListener('click', function () {
        if (isSoundCloudCopyCover) addCopyCoverButton();
    });

    const observer = new MutationObserver(() => {
        if (isSoundCloudArtistBanner) closeSoundCloudArtistBanner(); 
    });
    observer.observe(document.body, { childList: true, subtree: true }); 

});
