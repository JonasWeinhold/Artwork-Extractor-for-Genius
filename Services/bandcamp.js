chrome.storage.local.get(['Services/bandcamp.js', 'isBandcampCopyCover', 'isBandcampPopup', 'isBandcampSaveImage'], function (result) {
    const isBandcampCopyCover = result.isBandcampCopyCover !== undefined ? result.isBandcampCopyCover : true;
    const isBandcampPopup = result.isBandcampPopup !== undefined ? result.isBandcampPopup : true;
    const isBandcampSaveImage = result.isBandcampSaveImage !== undefined ? result.isBandcampSaveImage : false;


    if (result['Services/bandcamp.js'] === false) {
        return;
    }


    // Function to copy and modify the cover link
    function copyCoverLink(event) {
        const metaTag = document.querySelector('meta[property="og:image"]');

        // Check if the meta tag exists
        if (metaTag) {
            let coverLink = metaTag.getAttribute('content');
            coverLink = coverLink.replace(/_\d+\.jpg$/, '_1.png');

            if (isBandcampSaveImage) {
                const link = document.createElement("a");
                link.href = coverLink;
                link.download = `${coverLink}.png`;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                navigator.clipboard.writeText(coverLink)
                if (isBandcampPopup) showPopupNotification(event);

            }
        }
    }



    function addCopyCoverButton() {
        const navbar = document.querySelector('#band-navbar');

        if (navbar && !navbar.querySelector('.copy-cover-btn')) {
            const button = document.createElement('button');
            button.className = 'copy-cover-btn';
            button.innerText = isBandcampSaveImage ? "Save Cover" : "Copy Cover";

            button.style.width = '120px'
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.style.fontSize = '14px';
            button.style.fontWeight = 'bold';
            button.style.fontFamily = 'Helvetica Neue, Arial, sans-serif';
            button.style.padding = '6px 12px';

            const primaryText = document.querySelector('.primaryText.active');
            if (primaryText) {
                const primaryTextColor = window.getComputedStyle(primaryText).color;
                button.style.color = primaryTextColor;
                button.style.border = '2px solid ' + primaryTextColor;
            }

            const navbarColor = window.getComputedStyle(navbar).backgroundColor;
            button.style.background = navbarColor;

            button.addEventListener('click', copyCoverLink);

            navbar.style.position = 'relative';
            button.style.position = 'absolute';
            button.style.right = '24px';
            button.style.top = '50%';
            button.style.transform = 'translateY(-50%)';

            navbar.appendChild(button);
        }
    }


    function showPopupNotification(event) {
        const popup = document.createElement("div");
        popup.className = "popup-notification";

        const content = document.createElement("div");
        content.innerText = "Copied to clipboard";
        content.className = "popup-content";

        popup.style.position = 'fixed';
        popup.style.padding = "10px 20px";
        popup.style.zIndex = "9999";
        popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
        popup.style.borderRadius = '5px';
        popup.style.fontSize = '12px';
        popup.style.fontWeight = 'bold';
        popup.style.fontFamily = 'Helvetica Neue, Arial, sans-serif';

        const primaryText = document.querySelector('.primaryText.active');
        if (primaryText) {
            const primaryTextColor = window.getComputedStyle(primaryText).color;
            popup.style.color = primaryTextColor;
            popup.style.border = '2px solid ' + primaryTextColor;
        }

        const navbar = document.querySelector('#band-navbar');
        if (navbar) {
            const navbarColor = window.getComputedStyle(navbar).backgroundColor;
            popup.style.background = navbarColor;
        }

        popup.style.top = `${event.clientY + 30}px`;
        popup.style.left = `${event.clientX + 40}px`;

        popup.appendChild(content);
        document.body.appendChild(popup);

        setTimeout(() => {
            document.body.removeChild(popup);
        }, 1500);
    }

    window.addEventListener('click', function () {
        if (isBandcampCopyCover) addCopyCoverButton();
    });


});
