chrome.storage.local.get(['Services/apple.js', 'isAppleMusicCopyTracklist', 'isAppleMusicCopyCover', 'isAppleMusicCopyAnimatedCover', 'isAppleMusicCopyArtist', 'isAppleMusicCopyCredits', 'isAppleMusicPopup', 'isAppleMusicHighlighting', 'isAppleMusicSaveImage'], function (result) {
    const isAppleMusicCopyTracklist = result.isAppleMusicCopyTracklist !== undefined ? result.isAppleMusicCopyTracklist : true;
    const isAppleMusicCopyCover = result.isAppleMusicCopyCover !== undefined ? result.isAppleMusicCopyCover : true;
    const isAppleMusicCopyAnimatedCover = result.isAppleMusicCopyAnimatedCover !== undefined ? result.isAppleMusicCopyAnimatedCover : true; 
    const isAppleMusicCopyArtist = result.isAppleMusicCopyArtist !== undefined ? result.isAppleMusicCopyArtist : true; 
    const isAppleMusicCopyCredits = result.isAppleMusicCopyCredits !== undefined ? result.isAppleMusicCopyCredits : true; 
    const isAppleMusicPopup = result.isAppleMusicPopup !== undefined ? result.isAppleMusicPopup : true; 
    const isAppleMusicHighlighting = result.isAppleMusicHighlighting !== undefined ? result.isAppleMusicHighlighting : true;
    const isAppleMusicSaveImage = result.isAppleMusicSaveImage !== undefined ? result.isAppleMusicSaveImage : false; 

    if (result['Services/apple.js'] === false) {
        return;
    }

    const replacements = {
        "Synth Bass": "Bass Synthesizer",
        "String Arranger": "Strings Arranger",
        "Editing Engineer": "Audio Editor",
    };

    function styleInlineButton(button, display, title) {
        button.classList.add("tracklist-helper-btn");
        button.title = title;
        button.innerText = display;
        button.style.flex = "0 0 auto";
        button.style.borderRadius = "5px";
        button.style.border = "none";
        if (title === "Copy Primary Artists") {
            button.style.backgroundColor = "#d60017";
            button.style.fontWeight = "600";
        } else {
            button.style.backgroundColor = "#1db954";
            button.style.fontWeight = "500";
        }
        button.style.color = "white";
        button.style.padding = "5px";
        button.style.cursor = "pointer";
        if (display === "CT") {
            button.style.width = "1.75rem";
        } else {
            button.style.width = "2.25rem";
        }
    }

    function createButtonHolder() {
        const buttonHolder = document.createElement("div");
        buttonHolder.style.display = "flex";
        buttonHolder.style.flexDirection = "row";
        buttonHolder.style.justifyContent = "flex-end";
        buttonHolder.style.gap = "10px";
        return buttonHolder;
    }

    function createButton(innerText, buttonClass, outerClasses = []) {
        const outerDiv = document.createElement("div");
        const innerButton = document.createElement("button");
        outerDiv.classList.add(...outerClasses);
        innerButton.classList.add(buttonClass, ...outerClasses);
        innerButton.innerText = innerText;
        outerDiv.appendChild(innerButton);
        return outerDiv;
    }

    function createPrimaryActionButtons() {
        const selectorPlay = ".primary-actions__button--play";
        const existingPlayButton = document.querySelector(selectorPlay);
        const playOuterChildClasses = existingPlayButton?.children?.[0]?.classList || [];

        const copyCoverButton = createButton(isAppleMusicSaveImage ? "Save Cover" : "Copy Cover", "tracklist-helper-btn", [...existingPlayButton?.classList || [], ...playOuterChildClasses]);
        copyCoverButton.classList.remove(selectorPlay.substring(1));

        const animatedButton = createButton("Copy Animated Cover", "tracklist-helper-btn", [...existingPlayButton?.classList || [], ...playOuterChildClasses]);
        animatedButton.classList.remove(selectorPlay.substring(1));

        return [copyCoverButton, animatedButton];
    }




    // Function to copy cover URL to clipboard
    function copyCoverUrlToClipboard(event) {
        const pictureElement = document.querySelector('picture');
        if (pictureElement) {
            const sourceElement = pictureElement.querySelector('source');
            if (sourceElement) {
                const srcset = sourceElement.getAttribute('srcset');
                if (srcset) {
                    const coverImageUrl = srcset.split(',')[0].trim().split(' ')[0];
                    let modifiedUrl = coverImageUrl;

                    // Modify the URL based on specific conditions
                    if (coverImageUrl.endsWith('200x200cc.webp')) {
                        modifiedUrl = coverImageUrl.replace(/200x200cc\.webp$/, '1000x1000cc.png');
                    } else if (coverImageUrl.endsWith('200x200bb.webp')) {
                        modifiedUrl = coverImageUrl.replace(/200x200bb\.webp$/, '1000x1000bb.png');
                    } else if (coverImageUrl.endsWith('296x296bb.webp')) {
                        modifiedUrl = coverImageUrl.replace(/296x296bb\.webp$/, '1000x1000bb.png');
                    } else if (coverImageUrl.endsWith('296x296bb.webp')) {
                        modifiedUrl = coverImageUrl.replace(/296x296bb\.webp$/, '1000x1000bb.png');
                    } else if (coverImageUrl.match(/200x200SC\.(.+?)\.webp(\?l=[a-zA-Z-]*)?$/)) {
                        const identifier = coverImageUrl.match(/200x200SC\.(.+?)\.webp(\?l=[a-zA-Z-]*)?$/)[1];
                        modifiedUrl = coverImageUrl.replace(/200x200SC\..+?\.webp(\?l=[a-zA-Z-]*)?$/, `1000x1000SC.${identifier}.png`);
                    }

                    if (isAppleMusicSaveImage) {
                        fetch(modifiedUrl)
                            .then(response => response.blob())
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
                            .catch(error => {
                                console.error("Fehler beim Herunterladen des Bildes:", error);
                            });
                    } else {
                        navigator.clipboard.writeText(modifiedUrl).then(() => {
                            if (isAppleMusicPopup) showPopupNotification(event);
                        });
                    }
                }
            }
        }
    }


    // Function to copy the URL of an XHR element to the clipboard
    function copyAnimationUrlToClipboard(event) {
        function checkXhrEntries() {
            fetch(location.href)
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

                    if (coverUrl) {
                        copyCoverUrlToClipboard(coverUrl);
                    }

                    const xhrEntries = performance.getEntriesByType("resource").filter(entry =>
                        entry.initiatorType === "xmlhttprequest"
                    );

                    let foundUrl = "";

                    // Iterate through XHR entries in reverse order
                    for (let i = xhrEntries.length - 1; i >= 0; i--) {
                        const entry = xhrEntries[i];
                        if (entry.name.includes("sdr_") && (entry.name.endsWith("2160x2160-.mp4") || entry.name.endsWith("2160x2160_-.mp4"))) {
                            foundUrl = entry.name; 
                            break; 
                        }
                    }

                    // If a URL is found, copy it to the clipboard
                    if (foundUrl) {
                        navigator.clipboard.writeText(foundUrl).then(() => {
                            if (isAppleMusicPopup) showPopupNotification(event);
                            setTimeout(() => {
                                window.open("https://ezgif.com/video-to-gif", "_blank");
                            }, 500);
                        }).catch(err => console.error("Error copying to clipboard:", err));
                    } else {
                        // Get the current URL of the page
                        const currentUrl = window.location.href;

                        // Copy the current URL to the clipboard
                        navigator.clipboard.writeText(currentUrl).then(() => {
                            setTimeout(() => {
                                window.open("https://ezgif.com/video-to-gif", "_blank");
                                window.open("https://bendodson.com/projects/apple-music-artwork-finder/", "_blank");
                            }, 500);
                        }).catch(err => console.error("Error copying to clipboard:", err));
                    }
                })
                .catch(error => {
                });
        }
        setTimeout(checkXhrEntries, 1500);
    }


    // Function to copy the URL from the meta tag on click
    function copyArtistUrlToClipboard() {
        const artistHeader = document.querySelector('h1.artist-header__name');
        if (artistHeader) {
            artistHeader.style.cursor = 'pointer';
            artistHeader.style.transition = 'text-decoration 0.3s';

            artistHeader.addEventListener('mouseenter', () => { artistHeader.style.textDecoration = 'underline'; });
            artistHeader.addEventListener('mouseleave', () => { artistHeader.style.textDecoration = 'none'; });

            artistHeader.addEventListener('click', async (event) => {
                try {
                    await new Promise(resolve => {
                        if (document.readyState === 'complete') {
                            resolve();
                        } else {
                            window.addEventListener('load', resolve);
                        }
                    });

                    const currentUrl = window.location.href;

                    const response = await fetch(currentUrl);
                    const text = await response.text();

                    const ogImageUrlMatch = text.match(/<meta property="og:image" content="([^"]+)"/);
                    if (ogImageUrlMatch) {
                        let ogImageUrl = ogImageUrlMatch[1];

                        if (ogImageUrl) {
                            ogImageUrl = ogImageUrl.replace(/\/[^\/]*$/, '/1000x1000bb.png');

                            if (isAppleMusicSaveImage) {
                                fetch(ogImageUrl)
                                    .then(response => response.blob())
                                    .then(blob => {
                                        const urlParts = ogImageUrl.split('/'); 
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
                                    .catch(error => {
                                        console.error("Fehler beim Herunterladen des Bildes:", error);
                                    });
                            } else {
                                navigator.clipboard.writeText(ogImageUrl).then(() => {
                                    if (isAppleMusicPopup) showPopupNotification(event);
                                });
                            }
                        }
                    }
                } catch (error) {
                }
            });
        }
    }

    // Function to show the "copied to clipboard" popup notification
    function showPopupNotification(mouseEvent) {
        const popup = document.createElement("div");
        popup.className = "popup-notification";

        const content = document.createElement("div");
        content.innerText = "Copied to clipboard";
        content.className = "popup-content";

        popup.style.position = "fixed";
        popup.style.backgroundColor = "#d60017";
        popup.style.color = "white";
        popup.style.border = "none";
        popup.style.borderRadius = "5px";
        popup.style.padding = "10px 20px";
        popup.style.fontSize = "12px";
        popup.style.fontWeight = "bold";
        popup.style.zIndex = "9999";
        popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

        // Position the popup 30px to the right and 40px below the mouse position
        popup.style.top = `${mouseEvent.clientY + 30}px`;
        popup.style.left = `${mouseEvent.clientX + 40}px`;

        popup.appendChild(content);
        document.body.appendChild(popup);

        setTimeout(() => {
            document.body.removeChild(popup);
        }, 1500);
    }

    // Function to add the copy buttons
    function addButtons() {
        const primaryActions = document.querySelector(".primary-actions");
        if (!primaryActions) return;

        const [copyCoverButton, animatedButton] = createPrimaryActionButtons();

        if (isAppleMusicCopyCover) {
            primaryActions.appendChild(copyCoverButton);
        }
        if (isAppleMusicCopyAnimatedCover) {
            const videoArtworkContainer = document.querySelector('.video-artwork__container');
            if (videoArtworkContainer) primaryActions.appendChild(animatedButton);
        }


        const secondaryActions = document.querySelector(".secondary-actions");
        const primaryArtistsContainer = document.querySelector(".headings__subtitles");
        const artistLinks = primaryArtistsContainer?.querySelectorAll("a") || [];
        const buttonHolder = createButtonHolder();

        if (isAppleMusicCopyTracklist) {
            artistLinks.forEach((linkElement, index, arr) => {
                const artistName = linkElement.innerText;
                const button = document.createElement("button");
                const buttonLabel = arr.length === 1 ? "CA" : `CA${index + 1}`;

                styleInlineButton(button, buttonLabel, 'Copy Primary Artists');

                button.addEventListener("click", (event) => {
                    navigator.clipboard.writeText(artistName).then(() => { });
                    // if (isAppleMusicPopup) showPopupNotification(event);
                });
                buttonHolder.appendChild(button);
            });

            buttonHolder.style.marginRight = "33px";
            secondaryActions.prepend(buttonHolder);
        }

        copyCoverButton.onclick = (event) => {
            sessionStorage.setItem('copyCover', 'true');
            sessionStorage.setItem('mouseX', event.clientX);
            sessionStorage.setItem('mouseY', event.clientY);
        };

        animatedButton.onclick = (event) => {
            sessionStorage.setItem('Animation', 'true');
            sessionStorage.setItem('mouseX', event.clientX);
            sessionStorage.setItem('mouseY', event.clientY);
        };
    }

    // Check if the page was reloaded to copy the link
    window.addEventListener('click', () => {
        if (sessionStorage.getItem('copyCover') === 'true') {
            sessionStorage.removeItem('copyCover');
            const mouseX = parseInt(sessionStorage.getItem('mouseX'), 10);
            const mouseY = parseInt(sessionStorage.getItem('mouseY'), 10);
            const event = { clientX: mouseX, clientY: mouseY };
            copyCoverUrlToClipboard(event);
        } else if (sessionStorage.getItem('Animation') === 'true') {
            sessionStorage.removeItem('Animation');
            const mouseX = parseInt(sessionStorage.getItem('mouseX'), 10);
            const mouseY = parseInt(sessionStorage.getItem('mouseY'), 10);
            const event = { clientX: mouseX, clientY: mouseY };
            copyAnimationUrlToClipboard(event);
        } else {
            run();
        }
        if (isAppleMusicCopyArtist) copyArtistUrlToClipboard(event);
    });


    function copyToClipboard(text, element) {
        const originalColor = window.getComputedStyle(element).color;
        const textToCopy = replaceWords(text);
        navigator.clipboard.writeText(textToCopy).then(() => {
            if (isAppleMusicHighlighting) {
                element.style.color = '#d60017';
                setTimeout(() => {
                    element.style.color = originalColor;
                }, 250);
            }
        }).catch(err => {
        });
    }

    function replaceWords(text) {
        for (const [key, value] of Object.entries(replacements)) {
            text = text.replace(new RegExp(key, 'g'), value);
        }
        return text;
    }


    document.addEventListener('click', () => {
        if (isAppleMusicCopyCredits) {
            if (/^https:\/\/music\.apple\.com\/[a-z]{2}\/song\//.test(window.location.href)) {
                const artistNames = document.querySelectorAll('.artist-name');
                const artistRoles = document.querySelectorAll('.artist-roles');

                artistNames.forEach(name => {
                    name.style.cursor = 'pointer';
                    name.addEventListener('mouseover', () => { name.style.textDecoration = 'underline'; });
                    name.addEventListener('mouseout', () => { name.style.textDecoration = 'none'; });
                    name.addEventListener('click', () => {
                        const textToCopy = name.innerText;
                        copyToClipboard(textToCopy, name);
                    });
                });

                artistRoles.forEach(role => {
                    if (!role.classList.contains('roles-processed')) {
                        const roles = role.innerText.split(',');
                        role.innerHTML = '';

                        roles.forEach((roleText, index) => {
                            const roleSpan = document.createElement('span'); 
                            roleSpan.innerText = roleText.trim(); 
                            roleSpan.style.cursor = 'pointer'; 

                            roleSpan.addEventListener('mouseover', () => { roleSpan.style.textDecoration = 'underline'; });
                            roleSpan.addEventListener('mouseout', () => { roleSpan.style.textDecoration = 'none'; });

                            roleSpan.addEventListener('click', () => {
                                copyToClipboard(roleText.trim(), roleSpan); 
                            });

                            role.appendChild(roleSpan); 

                            if (index < roles.length - 1) {
                                role.appendChild(document.createTextNode(', '));
                            }
                        });

                        role.classList.add('roles-processed');
                    }
                });
            }
        }
    });

    // Main function to run the script
    function run() {
        if (document.querySelector(".tracklist-helper-btn")) {
            return;
        }
        if (isAppleMusicCopyTracklist) {
            const songs = document.querySelectorAll("[data-testid='track-title']");

            // Iterate through each song element
            for (const song of songs) {
                const titleButton = document.createElement("button");
                styleInlineButton(titleButton, "CT", "Copy Track Name");

                const featureMatch = song.innerText.match(/[\(\[]\s*(feat\.)\s+(.*?)\s*[\)\]]/i);
                let featureText = featureMatch ? featureMatch[2].trim() : null;


                // Event listener for copying track name
                titleButton.addEventListener("click", () => {
                    let rawTitle = song.innerText
                        .replace(/</g, '˂')
                        .replace(/>/g, '˃');

                    let sanitizedTitle = rawTitle.replace(/\s*[\(\[]\s*(feat\.|with)\s+.*?[\)\]]/i, '');

                    const matchFeat = rawTitle.match(/\(\s*(feat\.|with)\s+.*?\)/i);
                    if (matchFeat) {
                        const featIndex = rawTitle.indexOf(matchFeat[0]);

                        const remainder = rawTitle.slice(featIndex + matchFeat[0].length);
                        const bracketMatch = remainder.match(/\[([^\]]+)\]/);

                        if (bracketMatch) {
                            sanitizedTitle = sanitizedTitle.replace(bracketMatch[0], `(${bracketMatch[1]})`);
                        }
                    }

                    navigator.clipboard.writeText(sanitizedTitle.trim());
                });


                const buttonHolder = createButtonHolder();
                let attachTo = song.parentElement.parentElement;

                if (song.parentElement.parentElement.className.includes("songs-list-row__explicit-wrapper")) {
                    attachTo = attachTo.parentElement;
                }

                attachTo.appendChild(buttonHolder);

                const artists = attachTo.querySelectorAll(".songs-list-row__by-line a");

                if (artists.length > 0) {
                    artists.forEach((artist, index) => {
                        const artistName = artist.innerText;
                        const artistButton = document.createElement("button");
                        const label = `CA${index + 1}`;
                        styleInlineButton(artistButton, label, "Copy Artist Name");

                        artistButton.addEventListener("click", () => {
                            navigator.clipboard.writeText(artistName);
                        });
                        buttonHolder.appendChild(artistButton);
                    });
                }

                if (featureText) {
                    const featureButton = document.createElement("button");
                    styleInlineButton(featureButton, "FA", featureText);

                    featureButton.addEventListener("click", () => {
                        navigator.clipboard.writeText(featureText);
                    });

                    buttonHolder.appendChild(featureButton);
                }

                buttonHolder.appendChild(titleButton);

            }
        }

        performance.clearResourceTimings();
        addButtons();
    }

    // Run the script when the DOM is fully loaded
    document.addEventListener("DOMContentLoaded", run);
});