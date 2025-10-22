chrome.storage.local.get(['Services/45.js', 'is45CopyCover', 'is45Popup', 'is45ConvertPNG', 'is45SaveImage', 'is45HostImage', 'is45RightClick'], function (result) {
    const is45CopyCover = result.is45CopyCover !== undefined ? result.is45CopyCover : true;
    const is45Popup = result.is45Popup !== undefined ? result.is45Popup : true;
    const is45ConvertPNG = result.is45ConvertPNG !== undefined ? result.is45ConvertPNG : true;
    const is45SaveImage = result.is45SaveImage !== undefined ? result.is45SaveImage : false; 
    const is45HostImage = result.is45HostImage !== undefined ? result.is45HostImage : true;
    const is45RightClick = result.is45RightClick !== undefined ? result.is45RightClick : true;

    if (result['Services/45.js'] === false) {
        return;
    }


    async function uploadJpgToImgBB(jpgUrl, fileName) {
        try {
            const formData = new FormData();
            formData.append("image", jpgUrl);
            formData.append("name", fileName);

            const apiKey = await window.secrets.IMGBB_API_KEY;
            const apiUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data.url; 
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    }

    async function convertJpgToPng(jpgUrl) {    
        try {
            const image = new Image();
            image.crossOrigin = "use-credentials";
            image.src = jpgUrl;
    
            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
            });
    
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
    
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
    
            return canvas.toDataURL("image/png"); 
        } catch (error) {
            console.error("Error:", error);
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

    async function process45Image(extractedUrl) {
        const fileName = getFileNameFromUrl(extractedUrl);

        if (is45ConvertPNG) {

            const uploadedJpgUrl = await uploadJpgToImgBB(extractedUrl, fileName);
            if (!uploadedJpgUrl) {
                console.error('Error uploading the image.');
                return null;
            }

            const pngDataUrl = await convertJpgToPng(uploadedJpgUrl);

            if (pngDataUrl) {

                if (is45HostImage) {
                    const uploadedUrl = await uploadToImgBB(pngDataUrl, fileName);
                    if (uploadedUrl) {
                        await navigator.clipboard.writeText(uploadedUrl);
                        if (is45Popup) {
                            showPopupNotification(); 
                        }
                    } else {
                        console.error('Error uploading the image.');
                    }
                } else if (is45SaveImage) {
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
            if (is45HostImage) {
              await navigator.clipboard.writeText(extractedUrl);
              if (is45Popup) {
                showPopupNotification(); 
              }
            } else if (is45SaveImage) {
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


    function showPopupNotification() {
        const popup = document.createElement("div");
        popup.className = "popup-notification";
        const content = document.createElement("div");
        content.innerText = "Copied to clipboard";
        content.className = "popup-content";
        popup.style.position = "fixed";
        popup.style.backgroundColor = "#ffffaa";
        popup.style.color = "blue";
        popup.style.border = "1px solid #cccccc";
        popup.style.borderRadius = "3px";
        popup.style.padding = "5px 12px";
        popup.style.fontSize = "13px";
        popup.style.fontWeight = "bold";
        popup.style.zIndex = "99999999999999999999999";
        popup.style.boxShadow = "0 0 2px #dddddd";
        popup.style.display = "block";
        const mouseX = parseInt(sessionStorage.getItem('mouseX'), 10);
        const mouseY = parseInt(sessionStorage.getItem('mouseY'), 10);
        popup.style.top = `${mouseY + 25}px`;
        popup.style.left = `${mouseX + 25}px`;
        popup.appendChild(content);
        document.body.appendChild(popup);
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 1500);
    }



    function addCopyCoverButton() {
        const validSites = ["45cat.com", "45worlds.com"];
        const currentDomain = window.location.hostname;

        if (!validSites.some(site => currentDomain.includes(site))) {
            return;
        }

        const ebayButton = document.querySelector("a.yellowbox");
        if (!ebayButton) return;

        const existingButton = ebayButton.parentNode.querySelector(".copy-cover-button");
        if (existingButton) return;

        const copyButton = document.createElement("button");
        copyButton.innerText = is45SaveImage ? "Save Cover" : "Copy Cover";
        copyButton.className = "copy-cover-button";

        copyButton.style.backgroundColor = "#ffffaa";
        copyButton.style.color = "blue";
        copyButton.style.border = "1px solid #cccccc";
        copyButton.style.borderRadius = "3px";
        copyButton.style.boxShadow = "0 0 2px #dddddd";
        copyButton.style.padding = "3px 8px";
        copyButton.style.cursor = "pointer";
        copyButton.style.marginLeft = "10px";
        copyButton.style.fontSize = "13px";
        copyButton.style.fontWeight = "bolder";
        copyButton.style.transition = "background-color 0.3s, border-color 0.3s";

        copyButton.addEventListener("mouseover", function () {
            copyButton.style.backgroundColor = "#ffff00";
            copyButton.style.borderColor = "#777777";
            copyButton.style.textDecoration = "underline";
        });

        copyButton.addEventListener("mouseout", function () {
            copyButton.style.backgroundColor = "#ffffaa";
            copyButton.style.borderColor = "#cccccc";
            copyButton.style.textDecoration = "none";
        });

        copyButton.addEventListener("click", async function (event) {
            sessionStorage.setItem("mouseX", event.clientX);
            sessionStorage.setItem("mouseY", event.clientY);

            const metaTags = document.getElementsByTagName("meta");
            let coverUrl = "";

            for (let i = 0; i < metaTags.length; i++) {
                if (metaTags[i].getAttribute("property") === "og:image") {
                    coverUrl = metaTags[i].getAttribute("content");
                    break;
                }
            }

            if (coverUrl) {
                let adjustedUrl = coverUrl.replace("-s.jpg", ".jpg").replace("/s/", "/f/");

                await process45Image(adjustedUrl);
            }
        });


        ebayButton.insertAdjacentElement("afterend", copyButton);
    }

    if (is45CopyCover) {
        document.addEventListener("click", addCopyCoverButton);
    }




    if (is45RightClick) {
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