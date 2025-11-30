chrome.storage.local.get(['Services/45.js', 'is45CopyCover', 'is45Popup', 'is45ConvertPNG', 'is45SaveImage', 'is45HostImgBB', 'is45HostFilestack', 'is45RightClick'], function (result) {
    const is45CopyCover = result.is45CopyCover !== undefined ? result.is45CopyCover : true;
    const is45Popup = result.is45Popup !== undefined ? result.is45Popup : true;
    const is45ConvertPNG = result.is45ConvertPNG !== undefined ? result.is45ConvertPNG : true;
    const is45SaveImage = result.is45SaveImage !== undefined ? result.is45SaveImage : false;
    const is45HostImgBB = result.is45HostImgBB !== undefined ? result.is45HostImgBB : true;
    const is45HostFilestack = result.is45HostFilestack !== undefined ? result.is45HostFilestack : false;
    const is45RightClick = result.is45RightClick !== undefined ? result.is45RightClick : true;

    if (result['Services/45.js'] === false) {
        return;
    }

    // Copy Cover Button
    function addCopyCoverButton() {
        const ebayButton = document.querySelector("a.yellowbox");
        if (ebayButton && !document.getElementById('copy-cover-button')) {
            const copyButton = document.createElement('button');
            copyButton.id = 'copy-cover-button';
            copyButton.innerText = is45SaveImage ? "Save Cover" : "Copy Cover";

            Object.assign(copyButton.style, {
                backgroundColor: "#ffffaa",
                color: "blue",
                border: "1px solid #cccccc",
                borderRadius: "3px",
                boxShadow: "0 0 2px #dddddd",
                padding: "3px 8px",
                cursor: "pointer",
                marginLeft: "10px",
                fontSize: "13px",
                fontWeight: "bolder",
                transition: "background-color 0.3s, border-color 0.3s"
            });

            copyButton.addEventListener("mouseover", () => {
                Object.assign(copyButton.style, {
                    backgroundColor: "#ffff00",
                    borderColor: "#777777",
                    textDecoration: "underline"
                });
            });

            copyButton.addEventListener("mouseout", () => {
                Object.assign(copyButton.style, {
                    backgroundColor: "#ffffaa",
                    borderColor: "#cccccc",
                    textDecoration: "none"
                });
            });

            copyButton.addEventListener('click', async (event) => {
                event.preventDefault();
                sessionStorage.setItem("mouseX", event.clientX);
                sessionStorage.setItem("mouseY", event.clientY);

                const coverUrl = await get45Artwork();
                const imageUrl = coverUrl.replace("-s.jpg", ".jpg").replace("/s/", "/f/");

                if (imageUrl) {
                    const urlName = `45music`;
                    const fileName = getFileNameFromUrl(imageUrl);
                    const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                    const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                    const design = {
                        position: "fixed",
                        backgroundColor: "#ffffaa",
                        color: "blue",
                        border: "1px solid #cccccc",
                        borderRadius: "3px",
                        padding: "5px 12px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        fontFamily: 'Inter, sans-serif',
                        zIndex: "9999",
                        boxShadow: "0 0 2px #dddddd",
                        display: "block",
                        top: `${mouseY + 25}px`,
                        left: `${mouseX + 25}px`
                    };
                    await processJpgImage(imageUrl, urlName, fileName, is45HostFilestack, is45HostImgBB, is45SaveImage, is45ConvertPNG, is45Popup, design);
                }
            });

            ebayButton.insertAdjacentElement("afterend", copyButton);
        }
    }

    //45 Music Artwork Fetcher via og:image meta tag
    async function get45Artwork() {
        const metaTags = document.getElementsByTagName("meta");

        for (let i = 0; i < metaTags.length; i++) {
            if (metaTags[i].getAttribute("property") === "og:image") {
                const coverUrl = metaTags[i].getAttribute("content");
                return coverUrl;
            }
        }
    }

    function getFileNameFromUrl(url) {
        const parts = url.split('/');
        const fileNameWithExtension = parts.pop().split('.')[0];
        const fileNameWithoutSuffix = fileNameWithExtension.split('-')[0];
        return fileNameWithoutSuffix;
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





    document.addEventListener('click', (event) => {
        const catUrlPattern = /^https:\/\/www\.45cat\.com/;
        const worldsUrlPattern = /^https:\/\/www\.45worlds\.com/;

        if (catUrlPattern.test(window.location.href)) {
            if (is45CopyCover) addCopyCoverButton();
        }
        if (worldsUrlPattern.test(window.location.href)) {
            if (is45CopyCover) addCopyCoverButton();
        }
    });

});