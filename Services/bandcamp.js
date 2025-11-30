chrome.storage.local.get(['Services/bandcamp.js', 'isBandcampCopyCover', 'isBandcampPopup', 'isBandcampSaveImage'], function (result) {
    const isBandcampCopyCover = result.isBandcampCopyCover !== undefined ? result.isBandcampCopyCover : true;
    const isBandcampPopup = result.isBandcampPopup !== undefined ? result.isBandcampPopup : true;
    const isBandcampSaveImage = result.isBandcampSaveImage !== undefined ? result.isBandcampSaveImage : false;

    if (result['Services/bandcamp.js'] === false) {
        return;
    }

    // Copy Cover Button
    function addCopyCoverButton() {
        const navbar = document.querySelector('#band-navbar');
        const primaryText = document.querySelector('.primaryText.active');

        if (navbar && primaryText && !document.getElementById('copy-cover-button')) {
            const copyButton = document.createElement("button");
            copyButton.id = 'copy-cover-button';
            copyButton.innerText = isBandcampSaveImage ? "Save Cover" : "Copy Cover";

            const primaryTextColor = window.getComputedStyle(primaryText).color;
            const navbarColor = window.getComputedStyle(navbar).backgroundColor;
            Object.assign(copyButton.style, {
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '120px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: 'Helvetica Neue, Arial, sans-serif',
                padding: '6px 12px',
                backgroundColor: navbarColor,
                color: primaryTextColor,
                border: `2px solid ${primaryTextColor}`
            });
            navbar.style.position = 'relative';

            copyButton.addEventListener('click', async (event) => {
                event.preventDefault();
                sessionStorage.setItem('mouseX', event.clientX);
                sessionStorage.setItem('mouseY', event.clientY);

                const coverUrl = getBandcampArtwork();
                const imageUrl = coverUrl.replace(/_\d+\.jpg$/, '_1.png');

                if (imageUrl) {
                    const fileName = getFileNameFromUrl(imageUrl);
                    const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                    const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                    const design = {
                        position: "fixed",
                        backgroundColor: navbarColor,
                        color: primaryTextColor,
                        border: `2px solid ${primaryTextColor}`,
                        borderRadius: "5px",
                        padding: "10px 20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        fontFamily: 'Helvetica Neue, Arial, sans-serif',
                        zIndex: "9999",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        top: `${mouseY + 30}px`,
                        left: `${mouseX + 40}px`
                    };
                    await processPngImage(imageUrl, fileName, isBandcampSaveImage, isBandcampPopup, design);
                }
            });

            navbar.appendChild(copyButton);
        }
    }

    // Bandcamp Artwork Fetcher via og:image meta tag
    function getBandcampArtwork(event) {
        const metaTag = document.querySelector('meta[property="og:image"]');
        if (metaTag) {
            const coverImageUrl = metaTag.getAttribute('content');
            return coverImageUrl;
        }
    }

    function getFileNameFromUrl(url) {
        const parts = url.split('/');
        const fileNameWithExtension = parts.pop().split('.')[0];
        return fileNameWithExtension;
    }





    window.addEventListener('click', function () {
        if (isBandcampCopyCover) addCopyCoverButton();
    });

});