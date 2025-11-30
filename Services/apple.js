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

    // Copy Cover Button
    function addCopyCoverButton() {
        const primaryActions = document.querySelector(".primary-actions");
        const playButton = document.querySelector(".primary-actions__button--play");

        if (primaryActions && playButton && !document.getElementById('copy-cover-button')) {
            const copyWrapper = playButton.cloneNode(true);

            const copyButton = copyWrapper.querySelector("button");
            copyButton.id = "copy-cover-button";
            copyButton.innerText = isAppleMusicSaveImage ? "Save Cover" : "Copy Cover";

            copyButton.replaceWith(copyButton.cloneNode(true));
            const freshButton = copyWrapper.querySelector("button");
            freshButton.addEventListener("click", async (event) => {
                event.preventDefault();
                sessionStorage.setItem("mouseX", event.clientX);
                sessionStorage.setItem("mouseY", event.clientY);

                const imageUrl = await getAppleMusicArtwork("cover");
                const fileName = getFileNameFromUrl(imageUrl);
                const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                const design = {
                    position: "fixed",
                    backgroundColor: "#d60017",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "10px 20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    zIndex: "9999",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    top: `${mouseY + 30}px`,
                    left: `${mouseX + 40}px`
                };
                await processPngImage(imageUrl, fileName, isAppleMusicSaveImage, isAppleMusicPopup, design);
            });

            primaryActions.appendChild(copyWrapper);
        }
    }

    // Copy Animated Cover Button
    function addAnimatedCoverButton() {
        const primaryActions = document.querySelector(".primary-actions");
        const playButton = document.querySelector(".primary-actions__button--play");
        const videoArtworkContainer = document.querySelector('.video-artwork__container');

        if (primaryActions && playButton && videoArtworkContainer && !document.getElementById('copy-animated-cover-button')) {
            const copyWrapper = playButton.cloneNode(true);

            const copyButton = copyWrapper.querySelector("button");
            copyButton.id = "copy-animated-cover-button";
            copyButton.innerText = isAppleMusicSaveImage ? "Save Animated Cover" : "Copy Animated Cover";

            copyButton.replaceWith(copyButton.cloneNode(true));
            const freshButton = copyWrapper.querySelector("button");
            freshButton.addEventListener("click", async (event) => {
                event.preventDefault();
                sessionStorage.setItem("mouseX", event.clientX);
                sessionStorage.setItem("mouseY", event.clientY);

                copyAnimationUrlToClipboard(event);
            });

            primaryActions.appendChild(copyWrapper);
        }
    }

    // Copy Primary Artist Button
    function addCopyArtistButton() {
        const secondaryActions = document.querySelector(".secondary-actions");
        const playButton = document.querySelector(".primary-actions__button--play");
        const primaryArtists = document.querySelector(".headings__subtitles")?.querySelectorAll("a") || [];

        if (secondaryActions && playButton && primaryArtists.length > 0 && !document.querySelector('[id^="copy-artist-button-"]')) {
            Array.from(primaryArtists).reverse().forEach((linkElement, index) => {
                const artistName = linkElement.innerText;

                const copyWrapper = playButton.cloneNode(true);
                const freshButton = copyWrapper.querySelector("button");

                freshButton.id = `copy-artist-button-${index}`;
                freshButton.innerText = primaryArtists.length === 1 ? "CA" : `CA${primaryArtists.length - index}`;
                Object.assign(freshButton.style, {
                    minWidth: "2.25rem",
                    width: "2.5rem",
                });

                freshButton.addEventListener("click", async (event) => {
                    event.preventDefault();
                    await navigator.clipboard.writeText(artistName);
                });

                secondaryActions.prepend(copyWrapper);
            });
        }
    }

    // Copy Tracklist Button

    function addCopyTracklistButton() {
        const songs = document.querySelectorAll("[data-testid='track-title']");
        const playButton = document.querySelector(".primary-actions__button--play");

        if (playButton && songs.length > 0 && !document.querySelector('[id^="copy-title-button-"]')) {
            songs.forEach((song, index) => {
                const songTitle = song.innerText;
                const featuredArtists = (song.innerText.match(/[\(\[]\s*feat\.\s+(.*?)\s*[\)\]]/i) || [])[1]?.trim() || null;

                const attachTo = song.closest(".songs-list-row__song-wrapper");
                const primaryArtists = attachTo.querySelectorAll(".songs-list-row__by-line a");

                const buttonContainer = document.createElement("div");
                Object.assign(buttonContainer.style, {
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                });

                // CA Button
                primaryArtists.forEach((artistElement, artistIndex, arr) => {
                    const artistName = artistElement.innerText;

                    const copyWrapperCA = playButton.cloneNode(true);
                    const freshButtonCA = copyWrapperCA.querySelector("button");

                    freshButtonCA.id = `copy-artist-button-${index}-${artistIndex}`;
                    freshButtonCA.innerText = arr.length === 1 ? "CA" : `CA${artistIndex + 1}`;

                    Object.assign(freshButtonCA.style, {
                        minWidth: "2.25rem",
                        width: "2.25rem",
                        backgroundColor: "#1db954"
                    });

                    freshButtonCA.addEventListener("click", async (event) => {
                        event.preventDefault();
                        await navigator.clipboard.writeText(artistName);
                    });

                    buttonContainer.appendChild(copyWrapperCA);
                });


                // FA Button
                if (featuredArtists) {
                    const copyWrapperFA = playButton.cloneNode(true);
                    const freshButtonFA = copyWrapperFA.querySelector("button");

                    freshButtonFA.id = `copy-featured-button-${index}`;
                    freshButtonFA.innerText = "FA";

                    Object.assign(freshButtonFA.style, {
                        minWidth: "2.25rem",
                        width: "2.25rem",
                        backgroundColor: "#1db954"
                    });

                    freshButtonFA.addEventListener("click", async (event) => {
                        event.preventDefault();
                        await navigator.clipboard.writeText(featuredArtists);
                    });

                    buttonContainer.appendChild(copyWrapperFA);
                }

                // CT Button
                const copyWrapperCT = playButton.cloneNode(true);
                const freshButtonCT = copyWrapperCT.querySelector("button");

                freshButtonCT.id = `copy-title-button-${index}`;
                freshButtonCT.innerText = "CT";
                Object.assign(freshButtonCT.style, {
                    minWidth: "2rem",
                    width: "2rem",
                    backgroundColor: "#1db954"
                });

                freshButtonCT.addEventListener("click", async (event) => {
                    event.preventDefault();

                    // Replace angle brackets with safe characters for Genius
                    const modifiedTitle = song.innerText
                        .replace(/</g, '˂')
                        .replace(/>/g, '˃');

                    // Remove any "(feat. ...)" or "[with ...]" sections from title
                    let cleanedTitle = modifiedTitle.replace(/\s*[\(\[]\s*(feat\.|with)\s+.*?[\)\]]/i, '');

                    const parenthesisMatch = modifiedTitle.match(/\(\s*(feat\.|with)\s+.*?\)/i);
                    if (parenthesisMatch) {
                        const parenthesisIndex = modifiedTitle.indexOf(parenthesisMatch[0]);
                        const remainder = modifiedTitle.slice(parenthesisIndex + parenthesisMatch[0].length);
                        const bracketMatch = remainder.match(/\[([^\]]+)\]/);

                        if (bracketMatch) {
                            cleanedTitle = cleanedTitle.replace(bracketMatch[0], `(${bracketMatch[1]})`);
                        }
                    }

                    await navigator.clipboard.writeText(cleanedTitle.trim());
                });

                buttonContainer.appendChild(copyWrapperCT);


                attachTo.appendChild(buttonContainer);
            });
        }
    }

    function addCopyArtistArtwork() {
        const artistHeader = document.querySelector('h1.artist-header__name');
        if (artistHeader) {
            artistHeader.style.cursor = 'pointer';
            artistHeader.style.transition = 'text-decoration 0.3s';

            artistHeader.addEventListener('mouseenter', () => { artistHeader.style.textDecoration = 'underline'; });
            artistHeader.addEventListener('mouseleave', () => { artistHeader.style.textDecoration = 'none'; });

            artistHeader.addEventListener('click', async (event) => {
                event.preventDefault();
                sessionStorage.setItem('mouseX', event.clientX);
                sessionStorage.setItem('mouseY', event.clientY);

                const imageUrl = await getAppleMusicArtwork("artist")
                console.log(imageUrl);
                const fileName = getFileNameFromUrl(imageUrl);
                const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                const design = {
                    position: "fixed",
                    backgroundColor: "#d60017",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "10px 20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    zIndex: "9999",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    top: `${mouseY + 30}px`,
                    left: `${mouseX + 40}px`
                };
                await processPngImage(imageUrl, fileName, isAppleMusicSaveImage, isAppleMusicPopup, design);
            });
        }
    }


    async function getAppleMusicArtwork(type) {
        let coverUrl, imageUrl;

        if (type === "cover") {
            coverUrl = document.querySelector("picture")?.querySelector("source")?.getAttribute("srcset")
                ?.split(",")[0].trim().split(" ")[0];

            const resolutionRegex = /(\d{2,3}x\d{2,3})(cc|bb|SC\.[^\.]+)\.webp(\?l=[a-zA-Z-]*)?$/;
            const match = coverUrl?.match(resolutionRegex);

            if (match) {
                imageUrl = coverUrl.replace(resolutionRegex, `1000x1000${match[2]}.png`);
            }
        } else if (type === "artist") {
            coverUrl = document.querySelectorAll('meta[property="og:image"]')[1]?.getAttribute("content");
            console.log(coverUrl);
            imageUrl = coverUrl.replace(/\/[^\/]*$/, "/1000x1000bb.png");
        }

        return imageUrl;
    }

    async function getAppleMusicArtworkOld() {
        const coverUrl = document.querySelector('picture')?.querySelector('source')?.getAttribute('srcset')?.split(',')[0].trim().split(' ')[0];
        if (coverUrl) {
            let imageUrl = coverUrl;

            if (coverUrl.endsWith('200x200cc.webp')) {
                imageUrl = coverUrl.replace(/200x200cc\.webp$/, '1000x1000cc.png');
            } else if (coverUrl.endsWith('200x200bb.webp')) {
                imageUrl = coverUrl.replace(/200x200bb\.webp$/, '1000x1000bb.png');
            } else if (coverUrl.endsWith('296x296bb.webp')) {
                imageUrl = coverUrl.replace(/296x296bb\.webp$/, '1000x1000bb.png');
            } else if (coverUrl.endsWith('296x296bb.webp')) {
                imageUrl = coverUrl.replace(/296x296bb\.webp$/, '1000x1000bb.png');
            } else if (coverUrl.match(/200x200SC\.(.+?)\.webp(\?l=[a-zA-Z-]*)?$/)) {
                const identifier = coverUrl.match(/200x200SC\.(.+?)\.webp(\?l=[a-zA-Z-]*)?$/)[1];
                imageUrl = coverUrl.replace(/200x200SC\..+?\.webp(\?l=[a-zA-Z-]*)?$/, `1000x1000SC.${identifier}.png`);
            }
            return imageUrl;
        }
    }


    function getFileNameFromUrl(url) {
        const parts = url.split('/');
        const fileNameWithExtension = parts[parts.length - 2].split('.')[0];
        return fileNameWithExtension;
    }


    async function copyAnimationUrlToClipboard(event) {
        function findAnimationUrl() {
            const xhrEntries = performance.getEntriesByType("resource")
                .filter(entry => entry.initiatorType === "xmlhttprequest");

            for (let i = xhrEntries.length - 1; i >= 0; i--) {
                const entry = xhrEntries[i];
                if (entry.name.includes("sdr_") && /2160x2160[-_]\.mp4$/.test(entry.name)) {
                    return entry.name;
                }
            }
            return null;
        }

        async function checkXhrEntries() {
            try {
                const foundUrl = findAnimationUrl();

                if (foundUrl) {
                    const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                    const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                    const design = {
                        position: "fixed",
                        backgroundColor: "#d60017",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "10px 20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        zIndex: "9999",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        top: `${mouseY + 30}px`,
                        left: `${mouseX + 40}px`
                    };
                    if (isAppleMusicPopup) showPopupNotification(design);
                    await navigator.clipboard.writeText(foundUrl);
                    setTimeout(() => window.open("https://ezgif.com/video-to-gif", "_blank"), 500);
                } else {
                    const currentUrl = window.location.href;
                    await navigator.clipboard.writeText(currentUrl);
                    setTimeout(() => {
                        window.open("https://ezgif.com/video-to-gif", "_blank");
                        window.open("https://bendodson.com/projects/apple-music-artwork-finder/", "_blank");
                    }, 500);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        setTimeout(checkXhrEntries, 1500);
    }



    function addCopyCredits() {
        const artistNames = document.querySelectorAll('.artist-name');
        const artistRoles = document.querySelectorAll('.artist-roles');

        artistNames.forEach(name => {
            name.style.cursor = 'pointer';
            name.addEventListener('mouseover', () => { name.style.textDecoration = 'underline'; });
            name.addEventListener('mouseout', () => { name.style.textDecoration = 'none'; });
            name.addEventListener('click', () => {
                const textToCopy = name.innerText;
                copyCreditToClipboard(textToCopy, name);
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
                        copyCreditToClipboard(roleText.trim(), roleSpan);
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


    function copyCreditToClipboard(text, element) {
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

    const replacements = {
        "Synth Bass": "Bass Synthesizer",
        "String Arranger": "Strings Arranger",
        "Editing Engineer": "Audio Editor",
    };





    document.addEventListener('click', (event) => {
        if (isAppleMusicCopyCover) addCopyCoverButton();
        if (isAppleMusicCopyAnimatedCover) addAnimatedCoverButton();
        if (isAppleMusicCopyTracklist) addCopyArtistButton();
        if (isAppleMusicCopyTracklist) addCopyTracklistButton();
        if (isAppleMusicCopyArtist) addCopyArtistArtwork();
        if (isAppleMusicCopyCredits) addCopyCredits();
    });

});