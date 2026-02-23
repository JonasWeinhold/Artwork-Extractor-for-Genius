chrome.storage.local.get(['Services/distrokid.js', 'isDistroKidCopyCover', 'isDistroKidPopup', 'isDistroKidConvertPNG', 'isDistroKidSaveImage', 'isDistroKidHostImgBB', 'isDistroKidHostFilestack'], function (result) {
    const isDistroKidCopyCover = result.isDistroKidCopyCover !== undefined ? result.isDistroKidCopyCover : true;
    const isDistroKidPopup = result.isDistroKidPopup !== undefined ? result.isDistroKidPopup : true;
    const isDistroKidConvertPNG = result.isDistroKidConvertPNG !== undefined ? result.isDistroKidConvertPNG : true;
    const isDistroKidSaveImage = result.isDistroKidSaveImage !== undefined ? result.isDistroKidSaveImage : false;
    const isDistroKidHostImgBB = result.isDistroKidHostImgBB !== undefined ? result.isDistroKidHostImgBB : false;
    const isDistroKidHostFilestack = result.isDistroKidHostFilestack !== undefined ? result.isDistroKidHostFilestack : true;

    if (result['Services/distrokid.js'] === false) {
        return;
    }

    // Copy Cover Button
    function addCopyCoverButton() {
        const slideOut = document.querySelector('.slideOut');

        if (slideOut && !document.getElementById('copy-cover-button')) {
            const copyButton = document.createElement('button');
            copyButton.id = 'copy-cover-button';
            copyButton.innerText = isDistroKidSaveImage ? "Save Cover" : "Copy Cover";

            Object.assign(copyButton.style, {
                backgroundColor: "#333333",
                color: "white",
                height: "60px",
                width: "660px",
                border: "none",
                borderRadius: "10px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                display: "block",
                margin: "0 auto",
                transition: "all 0.2s ease"
            });

            const hoverStyle = document.createElement("style");
            hoverStyle.textContent = `
            #copy-cover-button:hover {
                text-decoration: underline;
            }
        `;
            document.head.appendChild(hoverStyle);

            copyButton.addEventListener('click', async (event) => {
                event.preventDefault();
                sessionStorage.setItem('mouseX', event.clientX);
                sessionStorage.setItem('mouseY', event.clientY);

                const currentUrl = window.location.href;
                const coverUrl = await getDistrokidArtwork(currentUrl);

                if (coverUrl.endsWith('.jpg')) {
                    const imageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(coverUrl)}&q=100`;
                    const urlName = `distrokid`;
                    const fileName = getFileNameFromUrl(imageUrl);
                    console.log("Cover URL:", fileName);
                    const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                    const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                    const design = {
                        position: "fixed",
                        backgroundColor: "#888888",
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
                    await processJpgImage(imageUrl, urlName, fileName, isDistroKidHostFilestack, isDistroKidHostImgBB, isDistroKidSaveImage, isDistroKidConvertPNG, isDistroKidPopup, design);
                } else if (coverUrl.endsWith('.png')) {
                    const imageUrl = coverUrl;
                    const fileName = getFileNameFromUrl(imageUrl);
                    const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                    const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                    const design = {
                        position: "fixed",
                        backgroundColor: "#888888",
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
                    await processPngImage(imageUrl, fileName, isDistroKidSaveImage, isDistroKidPopup, design);
                }
            });

            const outer2 = slideOut.querySelector('.outer2');
            slideOut.insertBefore(copyButton, outer2);
        }
    }

    //Distrokid Artwork Fetcher via og:image meta tag
    async function getDistrokidArtwork(currentUrl) {
        try {
            const response = await fetch(currentUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const img = doc.querySelector("img.artCover");

            if (img) {
                const rawUrl = img.getAttribute("src");
                const encodedPart = rawUrl.split("imgix.net/")[1].split("?")[0];
                let decodedUrl = decodeURIComponent(encodedPart);

                decodedUrl = decodedUrl.startsWith("http://") ? "https://" + decodedUrl.slice(7) : decodedUrl;

                if (decodedUrl.endsWith(".jpeg")) {
                    decodedUrl = decodedUrl.slice(0, -5) + ".jpg";
                }

                return decodedUrl;
            }
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    }

    function getFileNameFromUrl(url) {
        if (url.startsWith("https://images.weserv.nl/")) {
            const originalUrl = decodeURIComponent(url.split("url=")[1].split("&")[0]);
            const parts = originalUrl.split('/');
            const fileNameWithExtension = parts[parts.length - 1].split('.')[0];
            return fileNameWithExtension;
        } else {
            const parts = url.split('/');
            const fileNameWithExtension = parts[parts.length - 1].split('.')[0];
            return fileNameWithExtension;
        }
    }

    document.addEventListener('click', (event) => {
        if (isDistroKidCopyCover) addCopyCoverButton();
    });
});