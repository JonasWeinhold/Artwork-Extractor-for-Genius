chrome.storage.local.get([
    'Services/genius_song.js',
    'isGeniusSongSongPage',
    'isGeniusSongSongPageZwsp',
    'isGeniusSongSongPageInfo',
    'isGeniusSongCheckIndex',
    'isGeniusSongFollowButton',
    'isGeniusSongCleanupMetadataButton',
    'isGeniusSongLanguageButton',
    'isGeniusSongCleanupButton',
    'isGeniusSongSectionsButtons',
    'isGeniusSongCopyCover',
    'isGeniusSongAppleMusicPlayer',
    'isGeniusSongYouTubePlayer',
    'isGeniusSongSoundCloudPlayer',
    'isGeniusSongSpotifyPlayer',
    'isGeniusSongLyricEditor',
    'isGeniusSongRenameButtons'
], function (result) {
    const isGeniusSongSongPage = result.isGeniusSongSongPage !== undefined ? result.isGeniusSongSongPage : true;
    const isGeniusSongSongPageZwsp = result.isGeniusSongSongPageZwsp !== undefined ? result.isGeniusSongSongPageZwsp : true;
    const isGeniusSongSongPageInfo = result.isGeniusSongSongPageInfo !== undefined ? result.isGeniusSongSongPageInfo : true;
    const isGeniusSongCheckIndex = result.isGeniusSongCheckIndex !== undefined ? result.isGeniusSongCheckIndex : false;
    const isGeniusSongFollowButton = result.isGeniusSongFollowButton !== undefined ? result.isGeniusSongFollowButton : true;
    const isGeniusSongCleanupMetadataButton = result.isGeniusSongCleanupMetadataButton !== undefined ? result.isGeniusSongCleanupMetadataButton : true;
    const isGeniusSongLanguageButton = result.isGeniusSongLanguageButton !== undefined ? result.isGeniusSongLanguageButton : true;
    const isGeniusSongCleanupButton = result.isGeniusSongCleanupButton !== undefined ? result.isGeniusSongCleanupButton : true;
    const isGeniusSongSectionsButtons = result.isGeniusSongSectionsButtons !== undefined ? result.isGeniusSongSectionsButtons : true;
    const isGeniusSongCopyCover = result.isGeniusSongCopyCover !== undefined ? result.isGeniusSongCopyCover : true;
    const isGeniusSongAppleMusicPlayer = result.isGeniusSongAppleMusicPlayer !== undefined ? result.isGeniusSongAppleMusicPlayer : true;
    const isGeniusSongYouTubePlayer = result.isGeniusSongYouTubePlayer !== undefined ? result.isGeniusSongYouTubePlayer : true;
    const isGeniusSongSoundCloudPlayer = result.isGeniusSongSoundCloudPlayer !== undefined ? result.isGeniusSongSoundCloudPlayer : true;
    const isGeniusSongSpotifyPlayer = result.isGeniusSongSpotifyPlayer !== undefined ? result.isGeniusSongSpotifyPlayer : true;
    const isGeniusSongLyricEditor = result.isGeniusSongLyricEditor !== undefined ? result.isGeniusSongLyricEditor : true;
    const isGeniusSongRenameButtons = result.isGeniusSongRenameButtons !== undefined ? result.isGeniusSongRenameButtons : true;


    if (result['Services/genius_song.js'] === false) {
        return;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                  MAIN PROGRAM                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    checkPage();

    function checkPage() {
        const isSong = /-lyrics(?:#primary-album)?$|-\d+$|\/\d+(?:\?.*)?$|-annotated$/.test(window.location.href) &&
            !(window.location.href.startsWith("https://genius.com/albums") || window.location.href.startsWith("https://genius.com/artists") || window.location.href.startsWith("https://genius.com/api/") || window.location.href.startsWith("https://genius.com/album_cover_arts/"));
        if (isSong) {
            getSongInfo();
            if (isGeniusSongSongPage) checkSongPage(document);
            if (isGeniusSongFollowButton) FollowButtonSongPage();
        }
    }

    async function getSongInfo() {
        console.log("Run function getSongInfo()");
        const songId = document.querySelector("[property=\"twitter:app:url:iphone\"]").content.split("/")[3];
        const userId = document.documentElement.innerHTML.match(/let current_user = JSON.parse\('{\\"id\\":(\d+)/)?.[1];

        const response = await fetch(`https://genius.com/api/songs/${songId}`);
        const json = await response.json();

        if (userId == 4670957) {
            const songIdElement = document.createElement('span');
            songIdElement.className = document.querySelector('span[class^="LabelWithIcon__Label-"]').className;
            const songIdLink = document.createElement('a');
            songIdLink.href = `https://genius.com/api/songs/${songId}`;
            songIdLink.target = "_blank";
            songIdLink.textContent = songId;
            songIdLink.style.textDecoration = "none";
            songIdLink.style.color = "inherit";
            songIdLink.onmouseover = () => songIdLink.style.textDecoration = "underline";
            songIdLink.onmouseout = () => songIdLink.style.textDecoration = "none";
            songIdElement.textContent = "Song ID: ";
            songIdElement.appendChild(songIdLink);
            const metadataContainer = document.querySelector('div[class^="MetadataStats__Container-"]');
            metadataContainer.appendChild(songIdElement);
        }

        if (isGeniusSongCheckIndex) showIndexButton();
        if (isGeniusSongSongPageInfo) showCoverInfo(json.response.song);
        if (isGeniusSongCleanupMetadataButton) cleanupMetadata(userId, json.response.song);

        if (isGeniusSongLanguageButton) selectDropdown(json, "Language");
        if (isGeniusSongCleanupButton) selectDropdown(json, "Cleanup");
        if (isGeniusSongSectionsButtons) lyricsSectionsButtons(json);

        if (/-lyrics(?:#primary-album)?$|-\d+$|\/\d+(?:\?.*)?$/.test(window.location.href)) {
            if (isGeniusSongSoundCloudPlayer) addSoundCloudButton(json);
            if (isGeniusSongSpotifyPlayer) await getSpotifySongId(json);
        }
    }

    document.addEventListener('click', function (event) {
        const link = event.target.closest('a');
        if (link && link.getAttribute('href') === '#primary-album') {
            event.preventDefault();
            document.getElementById('primary-album').scrollIntoView({ behavior: 'instant' });
        }
    });


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                  INDEX BUTTON                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function showIndexButton() {
        const adminButton = document.querySelector('span[class*="AdminMenu__Button"]');
        if (adminButton) {
            const indexElement = document.createElement('span');
            indexElement.className = document.querySelector('span[class^="LabelWithIcon__Label-"]').className;
            const siteQuery = `site:${window.location.href}`;
            const indexLink = document.createElement('a');
            indexLink.href = `https://www.google.com/search?q=${encodeURIComponent(siteQuery)}`;
            indexLink.target = "_blank";
            indexLink.textContent = "Index ⤤";
            indexLink.style.textDecoration = "none";
            indexLink.style.color = "inherit";
            indexLink.style.marginLeft = "4px";
            indexLink.onmouseover = () => indexLink.style.textDecoration = "underline";
            indexLink.onmouseout = () => indexLink.style.textDecoration = "none";
            indexElement.textContent = "";
            indexElement.appendChild(indexLink);
            const metadataContainer = document.querySelector('div[class^="MetadataStats__Container-"]');
            metadataContainer.appendChild(indexElement);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                   INDICATORS                                   //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function addBlackCross(circle) {
        const existingCross = circle.querySelector('.black-cross');
        if (!existingCross) {
            const cross = document.createElement('span');
            cross.className = 'black-cross';
            cross.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

            const line1 = document.createElement('div');
            line1.style.cssText = `
            position: absolute;
            width: 128%;
            height: 3px;
            border-radius: 2px;
            background-color: black;
            transform: rotate(25deg);
        `;

            const line2 = document.createElement('div');
            line2.style.cssText = `
            position: absolute;
            width: 128%;
            height: 3px;
            border-radius: 2px;
            background-color: black;
            transform: rotate(-25deg);
        `;

            cross.appendChild(line1);
            cross.appendChild(line2);
            circle.appendChild(cross);
        }
    }

    function addBlackDot(circle) {
        const existingDot = circle.querySelector('.black-dot');
        if (!existingDot) {
            const dot = document.createElement('span');
            dot.className = 'black-dot';
            dot.style.cssText = `
            height: 8px; 
            width: 8px; 
            background-color: #2C2C2C; 
            border-radius: 50%; 
            display: inline-block; 
            position: absolute; 
            top: 50%; 
            transform: translate(-50%, -50%); 
        `;
            circle.appendChild(dot);
        }
    }

    function addColoredCircle(button, color, borderColor) {
        const existingCircle = button.querySelector('.circle-indicator');
        if (existingCircle) {
            existingCircle.style.backgroundColor = color;
            existingCircle.style.borderColor = borderColor;
        } else {
            const circle = document.createElement('span');
            circle.className = 'circle-indicator';
            circle.style.cssText = `
                font-variant: JIS04;
                height: 16px;
                width: 28px;
                display: inline-block;
                margin-right: 0.375rem;
                margin-left: calc(-0.375rem);
                padding: 0px 0.25rem;
                background-color: ${color};
                border: 1px solid ${borderColor};
                border-radius: 1.25rem;
            `;
            button.prepend(circle);
        }
    }

    function checkSongTitleForZeroWidthSpace() {
        const titleElement = document.querySelector('h1[class^="SongHeader-desktop__Title"]');
        if (titleElement) {
            const titleText = titleElement.textContent;
            if (titleText.includes('\u200B')) {
                const editButton = document.querySelector('button[class*="EditMetadataButton__SmallButton"]');
                const circle = editButton.querySelector('.circle-indicator');
                if (circle) {
                    addBlackDot(circle);
                }
            }
        }
    }

    function pxToRem(px) {
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return px / rootFontSize;
    }

    function createResolutionInfo(song, coverArtElement) {
        const resolutionMatch = song.header_image_url.match(/(\d+)x(\d+)/);
        const formatMatch = song.header_image_url.match(/\.(\w+)$/);
        if (!resolutionMatch || !formatMatch) return null;

        const resolutionText = `${resolutionMatch[1]}x${resolutionMatch[2]}`;
        const formatText = `${formatMatch[1].toUpperCase()}`;
        const textColor = song.song_art_text_color;

        const resolutionInfo = document.createElement('p');
        resolutionInfo.style.fontWeight = "100";
        resolutionInfo.style.textAlign = "center";
        resolutionInfo.style.position = "relative";
        resolutionInfo.style.color = textColor;

        resolutionInfo.dataset.type = "resolution-info";
        resolutionInfo.innerHTML = `${resolutionText} ${formatText} | ${song.song_art_primary_color} | ${song.song_art_secondary_color} | ${textColor}`;

        const updateStyles = () => {
            const imgWidth = coverArtElement.clientWidth || 1000;
            const dynamicFontPx = imgWidth * 0.05;
            const fontSizeRem = Math.min(pxToRem(dynamicFontPx), 0.75);
            resolutionInfo.style.fontSize = `${fontSizeRem}rem`;
            const topRem = -fontSizeRem / 2;
            resolutionInfo.style.top = `${topRem - 0.075}rem`;
        };

        updateStyles();

        const observer = new ResizeObserver(updateStyles);
        observer.observe(coverArtElement);

        return resolutionInfo;
    }

    function showCoverInfo(song) {
        console.log("Run function showCoverInfo()");

        const coverArtElement = document.querySelector('img[class^="SizedImage__Image-"]');
        const metadataContainer = document.querySelector('div[class^="SongHeader-desktop__CoverArt-"]');

        if (coverArtElement && metadataContainer) {
            const existing = metadataContainer.querySelector('p[data-type="resolution-info"]');
            if (existing) existing.remove();

            const infoElement = createResolutionInfo(song, coverArtElement);
            if (infoElement) {
                metadataContainer.prepend(infoElement);
            }
        }
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                COVER SONG PAGES                                //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function checkSongPage(document) {
        console.log("Run function checkSongPage()");

        const isSong = /-lyrics(?:#primary-album)?$|-\d+$|\/\d+(?!\?)$|-annotated$/.test(window.location.href);
        if (!isSong) return;

        const metaTag = document.querySelector('meta[property="og:image"]');
        if (metaTag) {
            const coverImageUrl = metaTag.getAttribute('content');
            const editButton = document.querySelector('button[class*="EditMetadataButton__SmallButton"]');
            if (editButton) {
                let color, borderColor;
                if (document.body.innerHTML.match(/\\"customSongArtImageUrl\\":null/) || document.body.innerHTML.match(/\\"customSongArtImageUrl\\":\\"\\"/)) {
                    if (document.body.innerHTML.match(/\\"album\\":null/)) {
                        color = '#dddddd'; // Grey
                        borderColor = '#aaaaaa';
                    } else {
                        if (coverImageUrl.endsWith("1000x1000x1.png")) {
                            color = '#99f2a5'; // Green
                            borderColor = '#66bfa3';
                        } else if (document.body.innerHTML.match(/\\"coverArtUrl\\":\\"https:\/\/assets.genius.com\/images\/default_cover_art.png\?/)) {
                            color = '#dddddd'; // Grey
                            borderColor = '#aaaaaa';
                        } else {
                            color = '#ffa335'; // Orange
                            borderColor = '#c76a2b';
                        }
                    }
                } else if (document.body.innerHTML.match(/\\"customSongArtImageUrl\\":\\"http:\/\/images.genius.com\/[0-9a-f]{32}.1000x1000x1.png\\"/) ||
                    document.body.innerHTML.match(/\\"customSongArtImageUrl\\":\\"http:\/\/images.rapgenius.com\/[0-9a-f]{32}.1000x1000x1.png\\"/) ||
                    document.body.innerHTML.match(/\\"customSongArtImageUrl\\":\\"https:\/\/images.rapgenius.com\/[0-9a-f]{32}.1000x1000x1.png\\"/)) {
                    color = '#7689e8'; // Blue
                    borderColor = '#4a5e9d';
                } else if (document.body.innerHTML.match(/\\"customSongArtImageUrl\\":\\"https:\/\/images.genius.com\/[0-9a-f]{32}.1000x1000x1.png\\"/)) {
                    if (coverImageUrl.endsWith("1000x1000x1.png")) {
                        color = '#99f2a5'; // Green
                        borderColor = '#66bfa3';
                    } else {
                        console.log("Error1");
                        color = '#986540'; // Brown
                        borderColor = '#704B35';
                    }
                } else if (coverImageUrl.startsWith("http://assets.genius.com/images/sharing_fallback.png") &&
                    (document.body.innerHTML.match(/\\"customSongArtImageUrl\\":\\".*1000x1000bb.png\\"/) ||
                        document.body.innerHTML.match(/\\"customSongArtImageUrl\\":\\".*10000x10000.png\\"/) ||
                        document.body.innerHTML.match(/\\"customSongArtImageUrl\\":\\".*1000x1000.png\\"/) ||
                        document.body.innerHTML.match(/\\"customSongArtImageUrl\\":\\".*1000x1000-000000-80-0-0.png\\"/))) {
                    color = '#ffff64'; // Yellow 
                    borderColor = '#cccc00';
                } else {
                    if (coverImageUrl.endsWith("1000x1000x1.png")) {
                        console.log("Error2");
                        color = '#986540'; // Brown 
                        borderColor = '#704B35';
                    } else {
                        color = '#fa7878'; // Red
                        borderColor = '#a74d4d';
                    }
                }
                addColoredCircle(editButton, color, borderColor);
                if (isGeniusSongSongPageZwsp) checkSongTitleForZeroWidthSpace();
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                 FOLLOW BUTTON                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function FollowButtonSongPage() {
        console.log("Run function FollowButtonSongPage()");
        const existingButton = document.querySelector('div[class^="ShareButtons__Container"]')?.children[3]?.children[0];
        const toolbarDiv = document.querySelector('div[class^="StickyContributorToolbar__Left"]');
        const metadataButton = document.querySelector('button[class*="EditMetadataButton"]');

        if (existingButton && toolbarDiv && metadataButton) {
            const followButton = document.createElement('button');
            followButton.className = metadataButton.className.replace("EditMetadataButton", "FollowButton");
            followButton.type = 'button';

            function updateFollowButton() {
                followButton.textContent = existingButton.textContent;
                followButton.disabled = existingButton.disabled;
            }

            updateFollowButton();

            followButton.addEventListener('click', () => {
                console.log(existingButton);
                existingButton.click();
                updateFollowButton();
            });

            const observer = new MutationObserver(updateFollowButton);
            observer.observe(existingButton, { attributes: true, childList: true, subtree: true });

            toolbarDiv.appendChild(followButton);
            followButton.style.float = 'right';
            followButton.style.maxWidth = 'fit-content';
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                             LYRICS EDITOR BUTTONS                              //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function createArrowSvg(pathData) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 9 7');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        svg.appendChild(path);
        return svg;
    }

    function createDropdownMenu(json, dropdownText, arrowSpan, dropdownType) {
        let options = [];
        if (dropdownType === "Language") {
            options = [
                { code: 'SQ', name: 'Albanian' },
                { code: 'EU', name: 'Basque' },
                { code: 'BG', name: 'Bulgarian' },
                { code: 'CA', name: 'Catalan' },
                { code: 'CS', name: 'Czech' },
                { code: 'ZH-T', name: 'Chinese Traditional' },
                { code: 'ZH-S', name: 'Chinese Simplified' },
                { code: 'DA', name: 'Danish' },
                { code: 'NL', name: 'Dutch' },
                { code: 'EN', name: 'English' },
                { code: 'ET', name: 'Estonian' },
                { code: 'FR', name: 'French' },
                { code: 'GL', name: 'Galician' },
                { code: 'DE', name: 'German' },
                { code: 'HU', name: 'Hungarian' },
                { code: 'IS', name: 'Icelandic' },
                { code: 'IT', name: 'Italian' },
                { code: 'LA', name: 'Latin' },
                { code: 'LT', name: 'Lithuanian' },
                { code: 'MN', name: 'Mongolian' },
                { code: 'NO', name: 'Norwegian' },
                { code: 'PL', name: 'Polish' },
                { code: 'RU', name: 'Russian' },
                { code: 'SC', name: 'Sardinian' },
                { code: 'SK', name: 'Slovak' },
                { code: 'ES', name: 'Spanish' },
                { code: 'SV', name: 'Swedish' },
                { code: 'TR', name: 'Turkish' },
                { code: 'UK', name: 'Ukrainian' },
                { code: 'VI', name: 'Vietnamese' },
            ];
        } else if (dropdownType === "Cleanup") {
            options = [
                ...(isGeniusSongLanguageButton ? [{ code: 'language', name: 'Language Cleanup' }] : []),
                { code: 'general', name: 'General Cleanup' },
                { code: 'punctuation', name: 'Fix Punctuation' },
                { code: 'capitalization', name: 'Fix Capitalization' }
            ];
        }

        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = "Dropdown__ContentContainer";
        //dropdownMenu.className = document.querySelector('div[class^="Dropdown__ContentContainer-"]').className;
        dropdownMenu.innerHTML = `<ul class="${dropdownType}Menu__Dropdown" style="
            z-index: 4;
            background-color: rgb(255, 255, 255);
            margin-top: 1rem;
            font-size: 0.75rem;
            font-weight: 100;
            position: absolute;
            right: 0px;
            border: 1px solid rgb(0, 0, 0);
            min-width: 100%;
            cursor: pointer;
            white-space: nowrap;"></ul>`;
        //dropdownMenu.innerHTML = `<ul class="${document.querySelector('ul[class^="AdminMenu__Dropdown-"]').className.replace('AdminMenu', `${dropdownType}Menu`)}"></ul>`;
        const ul = dropdownMenu.querySelector('ul');

        options.forEach(option => {
            const li = document.createElement('li');
            li.className = `${dropdownType}MenuItem__Container`;
            //li.className = document.querySelector('li[class^="AdminMenuItem__Container-"]').className.replace('AdminMenuItem', `${dropdownType}MenuItem`);
            const button = document.createElement('button');
            button.className = `${dropdownType}MenuItem__TextButton`;
            button.style.width = "100%";
            button.style.padding = "0.375rem 0.5rem";
            button.style.textAlign = "left";
            button.style.display = "flex";
            button.style.justifyContent = "space-between";
            button.style.fontFamily = "inherit";
            button.style.fontSize = "inherit";
            button.style.fontWeight = "inherit";
            button.style.color = "inherit";
            button.style.lineHeight = "1";
            //button.className = document.querySelector('button[class*="AdminMenuItem__TextButton-"]').className.replace('AdminMenuItem', `${dropdownType}MenuItem`);
            button.type = 'button';
            button.dataset.type = option.code;
            button.textContent = option.name;

            button.addEventListener('click', () => {
                if (dropdownType === "Language") {
                    selectedLanguage = option.code;
                    localStorage.setItem("selectedLanguage", selectedLanguage);
                    dropdownText.textContent = `Language: ${selectedLanguage}`;

                    const headerDivs = document.querySelectorAll('#lyricsSectionsButtonsContainer');
                    headerDivs.forEach(div => div.remove());

                    lyricsSectionsButtons(json);
                } else if (dropdownType === "Cleanup") {
                    lyricsCleanupLogic(option.code);
                }

                dropdownMenu.style.display = 'none';
                arrowSpan.innerHTML = '';
                arrowSpan.appendChild(createArrowSvg('M4.488 7 0 0h8.977L4.488 7Z'));
            });

            li.appendChild(button);
            ul.appendChild(li);
        });

        dropdownMenu.appendChild(ul);
        dropdownMenu.style.display = 'none';
        dropdownMenu.style.zIndex = '1000';

        document.addEventListener('click', (event) => {
            if (!dropdownMenu.contains(event.target) && !arrowSpan.contains(event.target)) {
                dropdownMenu.style.display = 'none';
                arrowSpan.innerHTML = '';
                arrowSpan.appendChild(createArrowSvg('M4.488 7 0 0h8.977L4.488 7Z'));
            }
        });

        return dropdownMenu;
    }

    function selectDropdown(json, dropdownType) {
        console.log(`Run function selectDropdown() for ${dropdownType} dropdown`);

        const toolbarDiv = document.querySelector('div[class^="StickyContributorToolbar__Left"]');
        if (!toolbarDiv) return;

        const dropdownContainer = document.createElement('div');
        dropdownContainer.style.position = 'relative';
        //dropdownContainer.className = document.querySelector('div[class^="Dropdown__Container-"]').className;

        const dropdownButton = document.createElement('button');
        dropdownButton.style.display = "block";
        // dropdownButton.className = document.querySelector('button[class^="Dropdown__Toggle-"]').className;
        dropdownButton.type = 'button';

        const dropdownSpan = document.createElement('span');
        dropdownSpan.style.display = "flex";
        dropdownSpan.style.alignItems = "center";
        dropdownSpan.style.borderRadius = "1.25rem";
        dropdownSpan.style.padding = "0.25rem 0.75rem";
        dropdownSpan.style.border = "1px solid black";
        dropdownSpan.style.fontFamily = "HelveticaNeue, Arial, sans-serif";
        dropdownSpan.style.fontSize = "0.75rem";
        dropdownSpan.style.color = "black";
        dropdownSpan.style.lineHeight = "1rem";
        dropdownSpan.style.whiteSpace = "nowrap";
        //const lyricsButton = document.querySelector('span[class*="StickyContributorToolbar__SmallButton-"]');
        //dropdownSpan.className = lyricsButton.className;

        const storedLanguage = localStorage.getItem("selectedLanguage") || "??";
        const dropdownText = document.createElement('span');
        dropdownText.textContent = dropdownType === "Language" ? `Language: ${storedLanguage}` : "Cleanup";

        const arrowSpan = document.createElement('span');
        arrowSpan.className = `${dropdownType}__DropdownIcon`;
        arrowSpan.style.marginLeft = "0.375rem";
        arrowSpan.style.width = "0.5rem";
        arrowSpan.innerHTML = '';
        //const lyricsSpan = document.querySelector('span[class*="StickyContributorToolbar__SmallButtonIcon-"]');
        //arrowSpan.className = lyricsSpan.className;

        const arrowSvgClosed = createArrowSvg('M4.488 7 0 0h8.977L4.488 7Z');
        const arrowSvgOpen = createArrowSvg('M4.488.5 0 7.5h8.977L4.488.5Z');

        console.log(`Creating ${dropdownType} dropdown with text: ${dropdownText.textContent}`);
        const dropdownMenu = createDropdownMenu(json, dropdownText, arrowSpan, dropdownType);

        arrowSpan.appendChild(arrowSvgClosed);
        dropdownSpan.appendChild(dropdownText);
        dropdownSpan.appendChild(arrowSpan);
        dropdownButton.appendChild(dropdownSpan);
        dropdownContainer.appendChild(dropdownButton);
        dropdownContainer.appendChild(dropdownMenu);
        toolbarDiv.appendChild(dropdownContainer);

        dropdownMenu.style.display = 'none';
        dropdownButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isDropdownVisible = dropdownMenu.style.display === 'block';

            document.querySelectorAll('span[class^="Language__DropdownIcon"], span[class^="Cleanup__DropdownIcon"]').forEach(icon => {
                const grandparent = icon.parentElement?.parentElement?.parentElement;
                if (grandparent) {
                    const menu = grandparent.querySelector('div[class^="Dropdown__ContentContainer"]');
                    if (menu) {
                        menu.style.display = 'none';
                        icon.innerHTML = '';
                        icon.appendChild(createArrowSvg('M4.488 7 0 0h8.977L4.488 7Z'));
                    }
                }
            });

            dropdownMenu.style.display = isDropdownVisible ? 'none' : 'block';
            arrowSpan.innerHTML = '';
            arrowSpan.appendChild(dropdownMenu.style.display === 'block' ? arrowSvgOpen : arrowSvgClosed);
        });

        document.addEventListener('click', (event) => {
            if (!dropdownContainer.contains(event.target)) {
                dropdownMenu.style.display = 'none';
                arrowSpan.innerHTML = '';
                arrowSpan.appendChild(arrowSvgClosed);
            }
        });

        const observer = new MutationObserver(() => {
            toggleDropdownButton();
        });
        observer.observe(document.body, { childList: true, attributes: true, subtree: true });
        const toggleDropdownButton = () => {
            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
            dropdownContainer.style.display = textarea ? 'block' : 'none';
        };

        toggleDropdownButton();
    }






    function lyricsSectionsButtons(json) {
        console.log("Run function lyricsSectionsButtons()");

        const explainerElement = document.querySelector('div[class^="LyricsEditExplainer__Container-"]');
        const referenceButton = document.querySelector('button[class*="EditMetadataButton"]');

        if (explainerElement && referenceButton) {
            const headerDiv = document.createElement("div");
            headerDiv.id = "lyricsSectionsButtonsContainer";
            headerDiv.style.marginTop = "2.0rem";
            headerDiv.style.display = "grid";
            headerDiv.style.gridTemplateColumns = "repeat(4, 1fr)";
            headerDiv.style.gap = "5px";

            const storedLanguage = localStorage.getItem("selectedLanguage");
            if (!storedLanguage) return;

            let buttonLabels;

            if (storedLanguage === "DE") {
                if (json.response.song.primary_tag.name === "Rap") {
                    buttonLabels = [
                        { displayText: "Songtext", fullText: "Songtext" },
                        { displayText: "Übersetzung", fullText: "Übersetzung" },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Skit", fullText: "Skit" },
                        { displayText: "Teil", fullText: "Teil" },
                        { displayText: "Part", fullText: "Part" },
                        { displayText: "Pre-Hook", fullText: "Pre-Hook" },
                        { displayText: "Hook", fullText: "Hook" },
                        { displayText: "Post-Hook", fullText: "Post-Hook" },
                        { displayText: "Bridge", fullText: "Bridge" },
                        { displayText: "Interlude", fullText: "Interlude" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" }
                    ];
                } else {
                    buttonLabels = [
                        { displayText: "Songtext", fullText: "Songtext" },
                        { displayText: "Übersetzung", fullText: "Übersetzung" },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Skit", fullText: "Skit" },
                        { displayText: "Teil", fullText: "Teil" },
                        { displayText: "Strophe", fullText: "Strophe" },
                        { displayText: "Pre-Refrain", fullText: "Pre-Refrain" },
                        { displayText: "Refrain", fullText: "Refrain" },
                        { displayText: "Post-Refrain", fullText: "Post-Refrain" },
                        { displayText: "Bridge", fullText: "Bridge" },
                        { displayText: "Interlude", fullText: "Interlude" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" }
                    ];
                }
            } else if (storedLanguage === "TR") {
                if (json.response.song.primary_tag.name === "Rap") {
                    buttonLabels = [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: "Translation", fullText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Giriş", fullText: "Giriş" },
                        { displayText: "Çıkış", fullText: "Çıkış" },
                        { displayText: "Kesit", fullText: "Kesit" },
                        { displayText: "Kısım", fullText: "Kısım" },
                        { displayText: "Verse", fullText: "Verse" },
                        { displayText: "Ön Nakarat", fullText: "Ön Nakarat" },
                        { displayText: "Nakarat", fullText: "Nakarat" },
                        { displayText: "Arka Nakarat", fullText: "Arka Nakarat" },
                        { displayText: "Köprü", fullText: "Köprü" },
                        { displayText: "Ara", fullText: "Ara" },
                        { displayText: "Enst. Ara", fullText: "Enstrümantal Ara" },
                        { displayText: "Enst. Çıkış", fullText: "Enstrümantal Çıkış" }
                    ];
                } else {
                    buttonLabels = [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: "Translation", fullText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Giriş", fullText: "Giriş" },
                        { displayText: "Çıkış", fullText: "Çıkış" },
                        { displayText: "Kesit", fullText: "Kesit" },
                        { displayText: "Kısım", fullText: "Kısım" },
                        { displayText: "Bölüm", fullText: "Bölüm" },
                        { displayText: "Ön Nakarat", fullText: "Ön Nakarat" },
                        { displayText: "Nakarat", fullText: "Nakarat" },
                        { displayText: "Arka Nakarat", fullText: "Arka Nakarat" },
                        { displayText: "Köprü", fullText: "Köprü" },
                        { displayText: "Ara", fullText: "Ara" },
                        { displayText: "Enst. Ara", fullText: "Enstrümantal Ara" },
                        { displayText: "Enst. Çıkış", fullText: "Enstrümantal Çıkış" }
                    ];
                }
            } else {
                const fallbackLabels = [
                    { displayText: "Header", fullText: "Header" },
                    { displayText: null, fullText: null },
                    { displayText: "Instrumental", fullText: "Instrumental" }
                ];

                const buttonTranslations = {
                    "CS": [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: null, fullText: null },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Skit", fullText: "Skit" },
                        { displayText: "Part", fullText: "Part" },
                        { displayText: "Verse", fullText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" }
                    ],
                    "DA": [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: null, fullText: null },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Skitse", fullText: "Skitse" },
                        { displayText: "Part", fullText: "Part" },
                        { displayText: "Vers", fullText: "Vers" },
                        { displayText: "Bro", fullText: "Bro" },
                        { displayText: "Omkvæd", fullText: "Omkvæd" },
                        { displayText: "Post-omkvæd", fullText: "Post-omkvæd" },
                        { displayText: "Refræn", fullText: "Refræn" },
                        { displayText: "Kontraststykke", fullText: "Kontraststykke" },
                        { displayText: "Mellemspil", fullText: "Mellemspil" },
                        { displayText: "Mellemstykke", fullText: "Mellemstykke" },
                        { displayText: "Breakdown", fullText: "Breakdown" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" }
                    ],
                    "EN": [
                        { displayText: null, fullText: null },
                        { displayText: null, fullText: null },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Skit", fullText: "Skit" },
                        { displayText: "Part", fullText: "Part" },
                        { displayText: "Verse", fullText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" }
                    ],
                    "FR": [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: null, fullText: null },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: null, fullText: null },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Dialogue", fullText: "Dialogue" },
                        { displayText: "Part", fullText: "Part" },
                        { displayText: "Couplet", fullText: "Couplet" },
                        { displayText: "Pré-refrain", fullText: "Pré-refrain" },
                        { displayText: "Refrain", fullText: "Refrain" },
                        { displayText: "Post-refrain", fullText: "Post-refrain" },
                        { displayText: "Riff", fullText: "Riff" },
                        { displayText: "Pont", fullText: "Pont" },
                        { displayText: "Intermède", fullText: "Intermède" },
                        { displayText: "Interlude", fullText: "Interlude" },
                        { displayText: "Pause instr.", fullText: "Pause instrumentale" },
                        { displayText: "Vocalises", fullText: "Vocalises" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" }
                    ],
                    "NL": [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: "Translation", fullText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Skit", fullText: "Skit" },
                        { displayText: "Part", fullText: "Part" },
                        { displayText: "Verse", fullText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" }
                    ],
                    "NO": [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: "Translation", fullText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: null, fullText: null },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: null, fullText: null },
                        { displayText: null, fullText: null },
                        { displayText: "Vers", fullText: "Vers" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus" },
                        { displayText: "Refreng", fullText: "Refreng" },
                        { displayText: "Bro", fullText: "Bro" },
                        { displayText: "Mellomspill", fullText: "Mellomspill" },
                    ],
                    "PL": [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: null, fullText: null },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Skit", fullText: "Skit" },
                        { displayText: "Część", fullText: "Część" },
                        { displayText: "Zwrotka", fullText: "Zwrotka" },
                        { displayText: "Przedrefren", fullText: "Przedrefren" },
                        { displayText: "Refren", fullText: "Refren" },
                        { displayText: "Zarefren", fullText: "Zarefren" },
                        { displayText: "Przejście", fullText: "Przejście" },
                        { displayText: "Interludium", fullText: "Interludium" },
                        { displayText: "Przerwa instr.", fullText: "Przerwa instrumentalna" },
                        { displayText: "Wokaliza", fullText: "Wokaliza" },
                    ],
                    "SK": [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: null, fullText: null },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Skit", fullText: "Skit" },
                        { displayText: "Part", fullText: "Part" },
                        { displayText: "Verse", fullText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" }
                    ],
                    "SQ": [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: "Translation", fullText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: null, fullText: null },
                        { displayText: "Hyrja", fullText: "Hyrja" },
                        { displayText: "Mbyllja", fullText: "Mbyllja" },
                        { displayText: "Dialogu", fullText: "Dialogu" },
                        { displayText: "Pjesa", fullText: "Pjesa" },
                        { displayText: "Strofa", fullText: "Strofa" },
                        { displayText: "Pararefreni", fullText: "Pararefreni" },
                        { displayText: "Refreni", fullText: "Refreni" },
                        { displayText: "Pasrefreni", fullText: "Pasrefreni" },
                        { displayText: "Nënrefreni", fullText: "Nënrefreni" },
                        { displayText: "Bridge", fullText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown" },
                        { displayText: "Ndërhyrja ", fullText: "Ndërhyrja" },
                        { displayText: "Ndë. Instr.", fullText: "Ndërhyrja Instrumentale" },
                        { displayText: "Vokale pa Tekst", fullText: "Vokale pa Tekst" },
                        { displayText: "Yodeling", fullText: "Yodeling" },
                        { displayText: "Scatting", fullText: "Scatting" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" },
                    ],
                    "SV": [
                        { displayText: null, fullText: null },
                        { displayText: null, fullText: null },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: null, fullText: null },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: null, fullText: null },
                        { displayText: "Part", fullText: "Part" },
                        { displayText: "Vers", fullText: "Vers" },
                        { displayText: "Brygga", fullText: "Brygga" },
                        { displayText: "Refräng", fullText: "Refräng" },
                        { displayText: "Post-Refräng", fullText: "Post-Refräng" },
                        { displayText: "Stick", fullText: "Stick" },
                        { displayText: "Mellanspel", fullText: "Mellanspel" }
                    ],
                    "VI": [
                        { displayText: "Header", fullText: "Header" },
                        { displayText: "Translation", fullText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental" },
                        { displayText: null, fullText: null },
                        { displayText: "Intro", fullText: "Intro" },
                        { displayText: "Outro", fullText: "Outro" },
                        { displayText: "Skit", fullText: "Skit" },
                        { displayText: "Part", fullText: "Part" },
                        { displayText: "Verse", fullText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude" },
                        { displayText: "Build", fullText: "Build" },
                        { displayText: "Drop", fullText: "Drop" }
                    ]
                };

                buttonLabels = buttonTranslations.hasOwnProperty(storedLanguage)
                    ? buttonTranslations[storedLanguage]
                    : fallbackLabels;
            }




            buttonLabels.forEach((label, index) => {
                const { displayText, fullText } = label;
                const button = document.createElement("button");
                button.style.width = "95px";
                button.style.display = "flex";
                button.style.alignItems = "center";
                button.style.justifyContent = "center";

                const insertTextAtCursor = (text) => {
                    const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
                    if (textarea) {
                        const startPos = textarea.selectionStart;
                        const endPos = textarea.selectionEnd;

                        let beforeText = textarea.value.substring(0, startPos).trimEnd();
                        const afterText = textarea.value.substring(endPos);

                        while (!beforeText.endsWith('\n\n')) {
                            beforeText += '\n';
                        }

                        textarea.value = beforeText + text + '\n' + afterText;

                        const newCursorPos = beforeText.length + text.length + 1;
                        textarea.setSelectionRange(newCursorPos, newCursorPos);
                        textarea.focus();

                        textarea.value = textarea.value.replace(/^\s+/, '');
                    }
                };

                if (!displayText) {
                    button.style.visibility = "hidden";
                } else {
                    button.textContent = displayText;
                    button.className = referenceButton.className.replace("EditMetadataButton", `${fullText}Button`);
                    button.type = "button";

                    if (index === 0) {
                        button.addEventListener("click", () => {
                            seoHeader(json, "Header");
                        });
                    } else if (index === 1) {
                        button.addEventListener("click", () => {
                            seoHeader(json, "Translation");
                        });
                    } else if (index === 3) {
                        button.addEventListener("click", () => {
                            seoHeader(json, "Snippet");
                        });
                    } else if (index === 7) {
                        const convertToRoman = (num) => {
                            const romanNumerals = [
                                ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400], ["C", 100],
                                ["XC", 90], ["L", 50], ["XL", 40], ["X", 10], ["IX", 9],
                                ["V", 5], ["IV", 4], ["I", 1]
                            ];

                            let result = "";
                            for (const [symbol, value] of romanNumerals) {
                                while (num >= value) {
                                    result += symbol;
                                    num -= value;
                                }
                            }
                            return result;
                        };

                        button.addEventListener("click", () => {
                            const insertValue = `<b>[${fullText}]</b>`;
                            insertTextAtCursor(insertValue);
                            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
                            const currentText = textarea.value;
                            const regex = new RegExp(`<b>\\[${fullText}(?: [IVXLCDM]+)?`, "g");
                            const matches = currentText.match(regex);

                            let i = 1;
                            const updatedText = currentText.replace(regex, () => {
                                return `<b>[${fullText} ${convertToRoman(i++)}`;
                            });
                            textarea.value = updatedText;
                        });
                    } else if (index === 8) {
                        button.addEventListener("click", () => {
                            const insertValue = `[${fullText}]`;
                            insertTextAtCursor(insertValue);
                            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
                            const currentText = textarea.value;

                            const otherTags = ["Part", "Teil", "Kısım", "Część", "Pjesa"];
                            const sectionRegex = new RegExp(
                                `(<b>\\[(?:${otherTags.join('|')})(?: [IVXLCDM]+)?[^<]*<\\/b>)`,
                                "g"
                            );

                            let lastIndex = 0;
                            let updatedText = '';
                            let match;

                            while ((match = sectionRegex.exec(currentText)) !== null) {
                                const sectionText = currentText.substring(lastIndex, match.index);

                                const ownRegex = new RegExp(`\\[${fullText}(?: \\d+)?`, "g");
                                const ownMatches = sectionText.match(ownRegex);
                                const ownCount = ownMatches ? ownMatches.length : 0;

                                if (ownCount > 1) {
                                    let i = 1;
                                    updatedText += sectionText.replace(
                                        ownRegex,
                                        () => `[${fullText} ${i++}`
                                    );
                                } else {
                                    updatedText += sectionText;
                                }

                                updatedText += match[1];
                                lastIndex = sectionRegex.lastIndex;
                            }

                            const finalSection = currentText.substring(lastIndex);
                            const ownRegex = new RegExp(`\\[${fullText}(?: \\d+)?`, "g");
                            const ownMatches = finalSection.match(ownRegex);
                            const ownCount = ownMatches ? ownMatches.length : 0;

                            if (ownCount > 1) {
                                let i = 1;
                                updatedText += finalSection.replace(
                                    ownRegex,
                                    () => `[${fullText} ${i++}`
                                );
                            } else {
                                updatedText += finalSection;
                            }

                            textarea.value = updatedText;


                            /*
                            const matches = currentText.match(new RegExp(`\\[${fullText}`, "g"));
                            const count = matches ? matches.length : 0;
                            if (count > 1) {
                                let i = 1;
                                const updatedText = currentText.replace(
                                    new RegExp(`\\[${fullText}(?: \\d+)?`, "g"),
                                    () => `[${fullText} ${i++}`
                                );
                                textarea.value = updatedText;
                            }*/
                        });
                    } else {
                        button.addEventListener("click", () => {
                            insertTextAtCursor(`[${fullText}]`);
                        });
                    }
                }
                headerDiv.appendChild(button);
            });
            explainerElement.parentNode.insertBefore(headerDiv, explainerElement);
        }

        if (explainerElement && referenceButton) {
            const headerDiv = document.createElement("div");
            headerDiv.id = "lyricsSectionsButtonsContainer";
            headerDiv.style.marginTop = "1.5rem";
            headerDiv.style.display = "grid";
            headerDiv.style.gridTemplateColumns = "repeat(4, 1fr)";
            headerDiv.style.gap = "5px";

            const styleButtons = [
                { label: "<i>Italic</i>", openTag: "<i>", closeTag: "</i>" },
                { label: "<b>Bold</b>", openTag: "<b>", closeTag: "</b>" },
                { label: "<b><i>Italic + Bold</i></b>", openTag: "<b><i>", closeTag: "</i></b>" }
            ];

            styleButtons.forEach(({ label, openTag, closeTag }) => {
                const button = document.createElement("button");
                button.innerHTML = label;
                button.style.width = "95px";
                button.style.display = "flex";
                button.style.alignItems = "center";
                button.style.justifyContent = "center";
                button.className = referenceButton.className.replace("EditMetadataButton", `${label.replace(/\s+/g, '')}Button`);
                button.type = "button";

                button.addEventListener("click", () => {
                    const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
                    if (!textarea) return;

                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    let selectedText = textarea.value.substring(start, end);

                    let trailingSpace = "";

                    if (selectedText.endsWith(" ")) {
                        selectedText = selectedText.slice(0, -1);
                        trailingSpace = " ";
                    }

                    const formatted = `${openTag}${selectedText}${closeTag}${trailingSpace}`;
                    textarea.setRangeText(formatted, start, end, 'end');
                    textarea.focus();
                });
                headerDiv.appendChild(button);
            });
            explainerElement.parentNode.insertBefore(headerDiv, explainerElement);
        }
    }

    function seoHeader(json, headerType) {
        const insertTextAtBeginning = (text) => {
            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
            if (textarea) {
                if (!textarea.value.startsWith(text)) {
                    textarea.focus();
                    textarea.value = text + '\n\n' + textarea.value.trim();
                    textarea.setSelectionRange(text.length + 2, text.length + 2);
                }
            }
        };

        const insertTextAtEnd = (text) => {
            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
            if (textarea) {
                textarea.focus();

                let currentText = textarea.value.trim();

                if (!currentText.endsWith(text)) {
                    textarea.value = currentText + '\n\n' + text;
                }
            }
        };

        const storedLanguage = localStorage.getItem("selectedLanguage");

        const containsCyrillic = text => /[А-Яа-яЁё]/.test(text);
        const containsChinese = text => /[\u4e00-\u9fff]/.test(text);


        let songTitle = json.response.song.title;
        songTitle = songTitle.replace(/”/g, '"').replace(/’/g, "'");

        if (containsCyrillic(songTitle) || containsChinese(songTitle)) {
            songTitle = songTitle.replace(/\s*\([^)]+\)/g, '').replace(/\s*\[[^\]]+\]/g, '');
        }

        const isTranslation = json.response.song.tracking_data?.some(
            item => item.key === "Translation" && item.value === true
        );
        if (isTranslation) {
            const dashIndex = songTitle.indexOf('-');

            const bracketChars = ['(', '[', '{'];
            let lastBracketIndex = -1;

            for (const char of bracketChars) {
                const index = songTitle.lastIndexOf(char);
                if (index > lastBracketIndex) {
                    lastBracketIndex = index;
                }
            }

            if (dashIndex !== -1 && lastBracketIndex !== -1 && lastBracketIndex > dashIndex) {
                songTitle = songTitle.substring(dashIndex + 1, lastBracketIndex).trim();
            }
        }



        const primaryArtistsArray = json.response.song.primary_artists.map(artist => {
            let name = artist.name;

            if (containsCyrillic(name) || containsChinese(name)) {
                name = name.replace(/\s*\([^)]+\)/g, '').replace(/\s*\[[^\]]+\]/g, '');
            }

            return name;
        });

        const primaryArtists = primaryArtistsArray.length > 1
            ? primaryArtistsArray.slice(0, -1).join(', ') + ' & ' + primaryArtistsArray[primaryArtistsArray.length - 1]
            : primaryArtistsArray.join('');


        const featuredArtistsArray = json.response.song.featured_artists.map(artist => {
            let name = artist.name;

            name = name.replace(/\s*\(([A-Z]{2,3})\)\s*/g, '');
            name = name.replace(/”/g, '"').replace(/’/g, "'");


            if (containsCyrillic(name) || containsChinese(name)) {
                name = name.replace(/\s*\([^)]+\)/g, '').replace(/\s*\[[^\]]+\]/g, '');
            }

            return name;
        });

        const featuredArtists = featuredArtistsArray.length > 1
            ? featuredArtistsArray.slice(0, -1).join(', ') + ' & ' + featuredArtistsArray[featuredArtistsArray.length - 1]
            : featuredArtistsArray.join('');



        console.log(`Song Title: ${songTitle}`);
        console.log(`Primary Artists: ${primaryArtists}`);
        console.log(`Featured Artists: ${featuredArtists}`);


        const featuringText = featuredArtists ? ` ft. ${featuredArtists}` : '';
        const formattedFeaturingText = featuredArtists ? `ft. ${featuredArtists} ` : '';


        const textFormatsHeader = {
            'BG': `[Текст на песента "${songTitle}"${featuringText}]`,
            'CA': `[Lletra de "${songTitle}"${featuringText}]`,
            'CS': `[Text skladby „${songTitle}“${featuringText}]`,
            'DA': `[Tekst til „${songTitle}“${featuringText}]`,
            'DE': `[Songtext zu „${songTitle}“${featuringText}]`,
            'EN': ``,
            'ES': `[Letra de "${songTitle}"${featuringText}]`,
            'ET': `[${songTitle} laulusõnad${featuringText}]`,
            'EU': `["${songTitle}" abestiaren letra${featuringText}]`,
            'FR': `[Paroles de "${songTitle}"${featuringText}]`,
            'GL': `[Letra de "${songTitle}"${featuringText}]`,
            'HU': `[„[${songTitle}]” dalszöveg${featuringText}]`,
            'IS': `[Söngtextar fyrir "${songTitle}"${featuringText}]`,
            'IT': `[Testo di "${songTitle}"${featuringText}]`,
            'LA': `[Lyricis "${songTitle}"${featuringText}]`,
            'LT': `[Dainos žodžiai „${songTitle}”${featuringText}]`,
            'MN': `[«${songTitle}» Үгнүүд${featuringText}]`,
            'NL': `[Songtekst van "${songTitle}"${featuringText}]`,
            'NO': `[Tekst til «${songTitle}»${featuringText}]`,
            'PL': `[Tekst piosenki "${songTitle}"${featuringText}]`,
            'RU': `[Текст песни «${songTitle}»${featuringText}]`,
            'SC': `[Testu de "${songTitle}"${featuringText}]`,
            'SK': `[Text skladby „${songTitle}“${featuringText}]`,
            'SQ': `[Teksti i "${songTitle}"${featuringText}]`,
            'SV': ``,
            'TR': `["${songTitle}"${featuringText} için şarkı sözleri]`,
            'UK': `[Текст пісні «${songTitle}»${featuringText}]`,
            'VI': `[Lời bài hát "${songTitle}"${featuringText}]`,
            'ZH-S': `[${primaryArtists}《${songTitle}》${formattedFeaturingText}歌词]`,
            'ZH-T': `[${primaryArtists}《${songTitle}》${formattedFeaturingText}歌詞]`,
        };

        const textFormatsHeaderTranslation = {
            //'BG': `[Текст на песента "${songTitle}"${featuringText}]`,
            //'CA': `[Lletra de "${songTitle}"${featuringText}]`,
            //'DA': `[Tekst til „${songTitle}“${featuringText}]`,
            'DE': `[Deutscher Songtext zu „${songTitle}“${featuringText}]`,
            'EN': ``,
            //'ES': `[Letra de "${songTitle}"${featuringText}]`,
            //'ET': `[${songTitle} laulusõnad${featuringText}]`,
            //'EU': `["${songTitle}" abestiaren letra${featuringText}]`,
            //'FR': `[Paroles de "${songTitle}"${featuringText}]`,
            //'GL': `[Letra de "${songTitle}"${featuringText}]`,
            //'HU': `[„[${songTitle}]” dalszöveg${featuringText}]`,
            //'IS': `[Söngtextar fyrir "${songTitle}"${featuringText}]`,
            //'IT': `[Testo di "${songTitle}"${featuringText}]`,
            //'LA': `[Lyricis "${songTitle}"${featuringText}]`,
            //'LT': `[Dainos žodžiai „${songTitle}”${featuringText}]`,
            //'MN': `[«${songTitle}» Үгнүүд${featuringText}]`,
            'NL': `[Songtekst van "${songTitle}"${featuringText} (Vertaling)]`,
            'NO': `[Tekst til ${primaryArtists} – «${songTitle}»${featuringText} (Oversettelse)]`,
            //'RU': `[Текст песни «${songTitle}»${featuringText}]`,
            //'SC': `[Testu de "${songTitle}"${featuringText}]`,
            'SQ': `[Teksti i "${songTitle}"${featuringText} në shqip]`,
            'SV': ``,
            'TR': `["${songTitle}"${featuringText} için Türkçe şarkı sözleri]`,
            'VI': `[Lời dịch tiếng Việt cho "${songTitle}"${featuringText}]`,
            //'UK': `[Текст пісні "${songTitle}"${featuringText}]`,
            //'ZH-S': `[${primaryArtists} "${songTitle}" ${formattedFeaturingText}歌词]`,
            //'ZH-T': `[${primaryArtists}「${songTitle}」${formattedFeaturingText}歌詞]`,
        };

        const textFormatsHeaderSnippet = {
            //'BG': `[Текст на песента "${songTitle}"${featuringText}]`,
            //'CA': `[Lletra de "${songTitle}"${featuringText}]`,
            'CS': `<b>[Lyrics from [Snippet]()]</b>`,
            'DA': `<b>[Tekst fra [snippet]()]</b>`,
            'DE': `<b>[Lyrics von [Snippet](), vollständige Lyrics bei Release]</b>`,
            'EN': `<b>Lyrics from [Snippet]()</b>`,
            //'ES': `[Letra de "${songTitle}"${featuringText}]`,
            //'ET': `[${songTitle} laulusõnad${featuringText}]`,
            //'EU': `["${songTitle}" abestiaren letra${featuringText}]`,
            //'FR': `[Paroles de "${songTitle}"${featuringText}]`,
            //'GL': `[Letra de "${songTitle}"${featuringText}]`,
            //'HU': `[„[${songTitle}]” dalszöveg${featuringText}]`,
            //'IS': `[Söngtextar fyrir "${songTitle}"${featuringText}]`,
            //'IT': `[Testo di "${songTitle}"${featuringText}]`,
            //'LA': `[Lyricis "${songTitle}"${featuringText}]`,
            //'LT': `[Dainos žodžiai „${songTitle}”${featuringText}]`,
            //'MN': `[«${songTitle}» Үгнүүд${featuringText}]`,
            'NL': `<b>[Songtekst van [Fragment]()]</b>`,
            //'NO': `[Tekst til «${songTitle}»${featuringText}]`,
            'PL': `<b>[Tekst piosenki pochodzi z [Snippet]()]</b>`,
            //'RU': `[Текст песни «${songTitle}»${featuringText}]`,
            //'SC': `[Testu de "${songTitle}"${featuringText}]`,
            //'SQ': `[Teksti i "${songTitle}"${featuringText}]`,
            'SK': `<b>[Lyrics from [Snippet]()]</b>`,
            'SV': ``,
            'TR': `<b>[[Kesit]() şarkı sözleri, resmî sözler yayımlanınca güncellenecektir]</b>`,
            //'UK': `[Текст пісні "${songTitle}"${featuringText}]`,
            //'ZH-S': `[${primaryArtists} "${songTitle}" ${formattedFeaturingText}歌词]`,
            //'ZH-T': `[${primaryArtists}「${songTitle}」${formattedFeaturingText}歌詞]`,
        };

        let textFormats;
        if (headerType === "Translation") {
            textFormats = textFormatsHeaderTranslation;
        } else if (headerType === "Snippet") {
            textFormats = textFormatsHeaderSnippet;
        } else {
            textFormats = textFormatsHeader;
        }

        if (headerType !== "Snippet") {
            const textToInsert = textFormats[storedLanguage];
            if (textToInsert) {
                insertTextAtBeginning(textToInsert);
            }
        }

        if (headerType === "Snippet") {
            const snippetToInsert = textFormatsHeaderSnippet[storedLanguage];
            if (snippetToInsert) {
                insertTextAtEnd(snippetToInsert);
            }
        }
    }







    function lyricsCleanupLogic(cleanupType) {
        const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
        if (textarea) {
            const originalText = textarea.value;

            let text = textarea.value;

            const storedLanguage = localStorage.getItem("selectedLanguage");

            const replacementsGeneral = {
                //'!': '',	// Exclamation Mark
                '`': "'", 	// Grave Accent
                '´': "'", 	// Acute Accent
                '＇': "'", 	// Fullwidth Apostrophe
                'ʹ': "'", 	// Modifier Letter Prime
                'ʻ': "'", 	// Modifier Letter Turned Comma
                'ʼ': "'", 	// Modifier Letter Apostrophe
                'ʽ': "'", 	// Modifier Letter Reversed Comma
                'ʾ': "'", 	// Modifier Letter Right Half Ring
                'ʿ': "'", 	// Modifier Letter Left Half Ring
                'ˊ': "'", 	// Modifier Letter Acute Accent
                'ˋ': "'", 	// Modifier Letter Grave Accent
                '′': "'", 	// Prime
                '‵': "'", 	 // Reversed Prime
                '‘': "'", 	// Left Single Quotation Mark
                '’': "'",	// Right Single Quotation Mark
                '‚': "'", 	// Single Low-9 Quotation Mark
                '‛': "'",	// Single High-Reversed-9 Quotation Mark
                '”': '"', 	// Right Double Quotation Mark
                '″': '"', 	// Double Prime
                '‶': '"', 	// Reversed Double Prime
                'ʺ': '"', 	// Modifier Letter Double Prime
                'ˮ': '"', 	// Modifier Letter Double Apostrophe
                '‟': '"', 	// Double High-Reversed-9 Quotation Mark
                '〝': '"', 	// Reversed Double Prime
                '〞': '"', 	// Double Prime Quotation Mark
                '⟪': '"', 	// Mathematical Left Double Angle Bracket
                '⟫': '"',	// Mathematical Right Double Angle Bracket
                '⪡': '"',	// Double Nested Less-Than
                '⪢': '"', 	// Double Nested Greater-Than
                '⪻': '"',	// Double Precedes
                '⪼': '"', 	// Double Succeeds
            };

            const replacementsLanguage = {
                '„': '"', 	// Double Low-9 Quotation Mark (German)
                '“': '"', 	// Left Double Quotation Mark (German)
                '«': '"',	// Left Pointing Double Angle Quotation Mark (Ukraine/Russia)
                '»': '"',	// Right Pointing Double Angle Quotation Mark (Ukraine/Russia)
                '《': '"',	// Left Pointing Double Angle Quotation Mark (Chinese)
                '》': '"',	// Right Pointing Double Angle Quotation Mark (Chinese)
                '"': (i => {
                    if (storedLanguage === 'DE') {
                        return i % 2 === 0 ? '„' : '“'; 	// German quotation marks
                    } else if (storedLanguage === 'ZH') {
                        return i % 2 === 0 ? '《' : '》'; 	// Chinese quotation marks
                    } else if (storedLanguage === 'RU' || storedLanguage === 'UK') {
                        return i % 2 === 0 ? '«' : '»'; 	// Russian/Ukrainian quotation marks
                    } else {
                        return '"'; // Default quotation mark
                    }
                })
            };

            const lines = text.split('\n');
            let index = 0;

            const processedLines = lines.map(line => {
                if (line.startsWith('[') && line.endsWith(']')) return line;
                if (line.startsWith('<b>[') && line.endsWith(']</b>')) return line;


                line = line.trim().replace(/ +/g, ' ');

                if (cleanupType === 'capitalization') {
                    line = line.toLowerCase();
                }

                if (cleanupType === 'punctuation') {
                    line = line.replace(/[.!]/g, '').replace(/\/\/|\\\\/g, '');
                }

                if (line.length > 0) {
                    line = line.charAt(0).toUpperCase() + line.slice(1);
                }

                /*
                line = line.replace(/(^|\.\s+|!\s+|\?\s+)("?\s*)(\w)/g, (match, prefix, quote, char) => {
                    return prefix + quote + char.toUpperCase();
                });
                */

                if (cleanupType === 'general' || cleanupType === 'language') {
                    // Capitalize the first letter at line start and after punctuation (. ! ? ")
                    line = line.replace(/(^|\.\s+|!\s+|\?\s+|\s+"|^\s*")(\w)/g, (match, prefix, char) => {
                        return prefix + char.toUpperCase();
                    });
                    
                    // Capitalize the first letter at line start with HTML tags
                    line = line.replace(/(^|\n|\r)(\s*(?:<[^>]+>\s*)+)([a-zA-Z])/g, (match, prefix, tags, char) => {
                        return prefix + tags + char.toUpperCase();
                    });

                    // Capitalize after opening brackets "(" or "["
                    line = line.replace(/([\(\[])\s*(\w)/g, (match, bracket, char) => {
                        return bracket + char.toUpperCase();
                    });

                    // Capitalize after opening brackets "(" or "[" with HTML tags in between
                    line = line.replace(/([\(\[])\s*((?:<[^>]+>\s*)+)(\w)/g, (match, bracket, tags, char) => {
                        return bracket + tags + char.toUpperCase();
                    });

                    for (const [key, value] of Object.entries(replacementsGeneral)) {
                        const regex = new RegExp(key, 'g');
                        line = line.replace(regex, value);
                    }

                    if (cleanupType === 'language') {
                        for (const [key, value] of Object.entries(replacementsLanguage)) {
                            const regex = new RegExp(key, 'g');
                            line = line.replace(regex, (match) => {
                                if (key === '"') {
                                    return typeof value === 'function' ? value(index++) : value;
                                }
                                return value;
                            });
                        }
                    }

                    if (cleanupType === 'language') {
                        if (storedLanguage === 'EN') {
                            line = line.replace(/^(['"]?\s*<[^>]*>\s*|\s*['"])?(['"]?\w|'\w)/, (match, prefix, word) => {
                                if (word.startsWith("'")) {
                                    return (prefix || '') + "'" + word.charAt(1).toUpperCase() + word.slice(2);
                                } else {
                                    return (prefix || '') + word.charAt(0).toUpperCase() + word.slice(1);
                                }
                            });

                            line = line.replace(/\bi\b(?!>)/g, 'I');

                            line = line.replace(/\s(ai|are|ca|could|did|do|does|had|have|is|must|should|was|were|wo|would)nt\b/gi, (match, verb) => {
                                const map = {
                                    ai: "ain't",
                                    are: "aren't",
                                    ca: "can't",
                                    could: "couldn't",
                                    did: "didn't",
                                    do: "don't",
                                    does: "doesn't",
                                    had: "hadn't",
                                    have: "haven't",
                                    is: "isn't",
                                    must: "mustn't",
                                    should: "shouldn't",
                                    was: "wasn't",
                                    were: "weren't",
                                    wo: "won't",
                                    would: "wouldn't"
                                };
                                return ' ' + map[verb.toLowerCase()];
                            });

                            line = line.replace(/\b(i|they|we|you)ve\b/gi, (match, subject) => {
                                return `${subject.toLowerCase()}'ve`;
                            });

                            line = line.replace(/\b(he|they|why|you)d\b/gi, (match, subject) => {
                                return `${subject.toLowerCase()}'d`;
                            });

                            line = line.replace(/\b(that|there|they|where|who)ll\b/gi, (match, subject) => {
                                return `${subject.toLowerCase()}'ll`;
                            });

                            line = line.replace(/\b(everybody|everyone|he|she|somebody|someone|that|there|they|where|who)s\b/gi, (match, subject) => {
                                return `${subject.toLowerCase()}'s`;
                            });

                            line = line.replace(/\b(mon|tues|wednes|thurs|fri|satur|sun)day\b|\b(janu|febru)ary\b|\b(septem|octo|novem|decem)ber\b|\b(dr|mr|mrs|ms)(\b|\.)|\b(april|june|july|august|advent|christmas|easter|halloween|hanukkah|kwanzaa|michaelmas|passover|purim|ramadan|thanksgiving|jupiter|mars|neptune|pluto|saturn|uranus|glock|prozac|perc'|percocet)\b/gi, (match) => {
                                return match.charAt(0).toUpperCase() + match.slice(1);
                            });

                            line = line.replace(/\b(AM\b|A\.M\.)/g, 'a.m.');
                            line = line.replace(/\b(PM\b|P\.M\.)/gi, 'p.m.');

                            line = line.replace(/'\bCuz\b/g, "'Cause");
                            line = line.replace(/'\bcuz\b/g, "'cause");

                            const slangMap = {
                                'ay': 'ayy',
                                'aye': 'ayy',
                                'boujee': 'bougie',
                                'boujie': 'bougie',
                                "ya'll": "y'all",
                                'yall': "y'all",
                                'ima': "i'ma",
                                'imma': "i'ma",
                                "i'mma": "i'ma",
                                "im'ma": "i'ma",
                                'ok': 'okay',
                                'o.k.': 'okay',
                                'sux': 'sucks',
                                'tec': 'TEC',
                                'alot': 'a lot',
                                'tv': 'TV',
                                'trynna': 'tryna',
                                'skrt': 'skrrt',
                                'whoa': 'woah',
                                // 'dawg': 'dog', // optional – uncomment if desired
                                'choppa': 'chopper',
                                'oughtta': 'oughta',
                                'naïve': 'naive',
                                'cliche': 'cliché'
                            };

                            for (const [key, value] of Object.entries(slangMap)) {
                                const pattern = new RegExp(`\\b${key}\\b`, 'gi');
                                line = line.replace(pattern, value);
                            }

                        }
                    }

                }
                return line;
            });

            textarea.value = processedLines.join('\n');

            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
                    textarea.value = originalText;
                }
            });
        }
    }









    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                CLEANUP METADATA                                //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function getCsrfToken() {
        const match = document.cookie.match(/_csrf_token=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    }

    function cleanupMetadata(userId, song) {
        console.log("Run function cleanupMetadata()");
        checkZeroWidthSpaces(song);
        removePrimaryArtistsAndRenameAdditionalRole(song);
        //checkPrimaryArtists(song);
        checkWriterArtists(song)
        if (userId == 5934018 || userId == 4670957) {
            primaryArtistsToGroupMembers(song);
        }
    }

    function checkZeroWidthSpaces(song) {
        let updatedTitle = song.title;

        updatedTitle = updatedTitle.replace(/\u200B{2,}/g, '\u200B');
        updatedTitle = updatedTitle.replace(/^\u200B|(?<=[\p{L}\p{N}\p{P}])\u200B|(?=[\p{L}\p{N}\p{P}])\u200B/gu, '');

        if (/\u200B/.test(updatedTitle)) {
            console.info(`Remaining ZWSP: "${updatedTitle}"`);
        }
        if (song.title !== updatedTitle) {
            addCleanupButton(song, "ZWSP", "Remove ZWSP", { title: updatedTitle });
        }
    }

    function removePrimaryArtistsAndRenameAdditionalRole(song) {
        const primaryArtists = song.primary_artists || [];
        const customPerformances = song.custom_performances || [];
        const customPrimaryArtists = customPerformances.find(perf => perf.label === "Primary Artists");

        let updatedCustomPerformances = [...customPerformances];
        let needsPrimaryArtistsRemoval = false;
        let labelsToFix = [];

        const labelCorrections = {
            //"Primary Artists": "Group Members",
        };

        // Primary Artists prüfen
        if (customPrimaryArtists) {
            const primaryArtistIds = primaryArtists.map(artist => artist.id);
            const customPrimaryArtistIds = customPrimaryArtists.artists.map(artist => artist.id);

            if (JSON.stringify(customPrimaryArtistIds) === JSON.stringify(primaryArtistIds)) {
                updatedCustomPerformances = updatedCustomPerformances.filter(perf => perf.label !== "Primary Artists");
                needsPrimaryArtistsRemoval = true;
            } else {
                console.info(`Remaining Primary Artists: ${customPrimaryArtists.artists.map(artist => artist.name)}`);
                const editButton = document.querySelector('button[class*="EditMetadataButton__SmallButton"]');
                const circle = editButton.querySelector('.circle-indicator');
                addBlackCross(circle);
            }
        }

        // Alle Label-Korrekturen anwenden
        updatedCustomPerformances = updatedCustomPerformances.map(perf => {
            if (labelCorrections[perf.label]) {
                labelsToFix.push(perf.label);
                return { ...perf, label: labelCorrections[perf.label] };
            }
            return perf;
        });

        // Cleanup-Button setzen
        const cleanupLabel = [
            needsPrimaryArtistsRemoval ? "Primary Artists" : null,
            ...labelsToFix
        ].filter(Boolean).join(", ");

        const cleanupKey = [
            needsPrimaryArtistsRemoval ? "PrimaryArtists" : null,
            ...labelsToFix.map(label => label.replace(/\s+/g, ""))
        ].filter(Boolean).join("And");

        const cleanupTitle = [
            needsPrimaryArtistsRemoval ? "Remove Primary Artists" : null,
            labelsToFix.length ? `Fix ${labelsToFix.join(", ")}` : null
        ].filter(Boolean).join(" & ");

        if (needsPrimaryArtistsRemoval || labelsToFix.length) {
            addCleanupButton(song, cleanupKey, cleanupTitle, { custom_performances: updatedCustomPerformances });
        }
    }

    function primaryArtistsToGroupMembers(song) {
        const primaryArtists = song.primary_artists || [];
        const customPerformances = song.custom_performances || [];
        const customPrimaryArtists = customPerformances.find(perf => perf.label === "Primary Artists");

        let updatedCustomPerformances = [...customPerformances];
        let needsPrimaryArtistsRemoval = false;
        let labelsToFix = [];

        const labelCorrections = {
            "Primary Artists": "Group Members",
        };

        // Alle Label-Korrekturen anwenden
        updatedCustomPerformances = updatedCustomPerformances.map(perf => {
            if (labelCorrections[perf.label]) {
                labelsToFix.push(perf.label);
                return { ...perf, label: labelCorrections[perf.label] };
            }
            return perf;
        });

        // Cleanup-Button setzen
        const cleanupLabel = [
            ...labelsToFix
        ].filter(Boolean).join(", ");

        const cleanupKey = [
            ...labelsToFix.map(label => label.replace(/\s+/g, ""))
        ].filter(Boolean).join("And");

        const cleanupTitle = [
            labelsToFix.length ? "Primary Artists → Group Members" : null
        ].filter(Boolean).join(" & ");

        if (needsPrimaryArtistsRemoval || labelsToFix.length) {
            addCleanupButton(song, cleanupKey, cleanupTitle, { custom_performances: updatedCustomPerformances });
        }
    }

    function checkPrimaryArtists(song) {
        const primaryArtists = song.primary_artists || [];
        const customPrimaryArtists = (song.custom_performances || []).find(perf => perf.label === "Primary Artists");

        if (customPrimaryArtists) {
            const primaryArtistIds = primaryArtists.map(artist => artist.id);
            const customPrimaryArtistIds = customPrimaryArtists.artists.map(artist => artist.id);

            if (JSON.stringify(customPrimaryArtistIds) === JSON.stringify(primaryArtistIds)) {
                const updatedCustomPerformances = (song.custom_performances || []).filter(perf => perf.label !== "Primary Artists");
                addCleanupButton(song, "PrimaryArtists", "Remove Primary Artists", { custom_performances: updatedCustomPerformances });
            } else {
                console.info(`Remaining Primary Artists: ${customPrimaryArtists.artists.map(artist => artist.name)}`);
                const editButton = document.querySelector('button[class*="EditMetadataButton__SmallButton"]');
                const circle = editButton.querySelector('.circle-indicator');
                addBlackCross(circle);
            }
        }
    }

    function checkWriterArtists(song) {
        const writerArtists = song.writer_artists || [];
        const customPerformances = song.custom_performances || [];

        const getUniqueArtists = (performances, label) => {
            return performances
                .filter(p => p.label.toLowerCase() === label)
                .flatMap(p => p.artists || [])
                .filter((artist, index, self) =>
                    index === self.findIndex(a => a.id === artist.id)
                );
        };

        const lyricists = getUniqueArtists(customPerformances, "lyricist");
        const composers = getUniqueArtists(customPerformances, "composer");
        const lyricistsAndComposers = [...lyricists, ...composers].filter((artist, index, self) =>
            index === self.findIndex(a => a.id === artist.id)
        );

        const onlyWriters = writerArtists.filter(writer =>
            !lyricistsAndComposers.some(ac => ac.id === writer.id)
        );

        const lyricistsAndComposersAndWriters = [...lyricists, ...composers, ...onlyWriters].filter((artist, index, self) =>
            index === self.findIndex(a => a.id === artist.id)
        );

        if (lyricistsAndComposersAndWriters.length > writerArtists.length) {
            const newWriterArtists = lyricistsAndComposersAndWriters.filter(
                (artist, index, self) =>
                    index === self.findIndex(a => a.id === artist.id)
            );

            addCleanupButton(song, "Writers", "Add Writers", { writer_artists: newWriterArtists });
        }
    }

    function addCleanupButton(song, actionType, label, metadataUpdate) {
        const toolbarDiv = document.querySelector('div[class^="StickyContributorToolbar__Left"]');
        const metadataButton = document.querySelector('button[class*="EditMetadataButton"]');

        if (!toolbarDiv || !metadataButton) return;

        const actionButton = document.createElement('button');
        actionButton.className = metadataButton.className.replace("EditMetadataButton", `${actionType}Button`);
        actionButton.type = 'button';
        actionButton.textContent = label;

        actionButton.addEventListener('click', () => {
            updateSongMetadata(song, metadataUpdate);
            actionButton.style.display = 'none';
        });

        toolbarDiv.appendChild(actionButton);
    }

    async function updateSongMetadata(song, updates) {
        if (Object.keys(updates).length === 0) return;
        try {
            const updateResponse = await fetch(`https://genius.com/api/songs/${song.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': document.cookie,
                    'X-CSRF-Token': getCsrfToken(),
                    'User-Agent': 'ArtworkExtractorForGenius/0.4.5 (Artwork Extractor for Genius)'
                },
                body: JSON.stringify({ song: updates })
            });

            if (!updateResponse.ok) {
                console.error(`Error updating song metadata: ${updateResponse.statusText}`);
            }
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }








    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                               APPLE MUSIC PLAYER                               //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function checkAppleMusicPlayer() {
        const iframe = document.querySelectorAll(`iframe[class^="AppleMusicPlayer-desktop__Iframe"]`)[0];
        if (iframe) {
            const playerDocument = iframe.contentDocument;
            const player = playerDocument.querySelector('apple-music-player');
            if (player) {
                const titleDiv = player.querySelector('.apple_music_player-player-info-title');
                const previewTrackAttr = player.getAttribute('preview_track');
                if (titleDiv && previewTrackAttr) {
                    const previewTrack = JSON.parse(previewTrackAttr.replace(/&quot;/g, '"'));
                    const appleId = previewTrack.apple_id;
                    const countryCode = previewTrack.country_codes?.[0]?.toLowerCase();

                    if (appleId && countryCode) {
                        const appleMusicUrl = `https://music.apple.com/${countryCode}/song/${appleId}`;
                        titleDiv.style.cursor = 'pointer';
                        titleDiv.style.textDecoration = 'none';
                        titleDiv.addEventListener('mouseenter', () => {
                            titleDiv.style.textDecoration = 'underline';
                        });
                        titleDiv.addEventListener('mouseleave', () => {
                            titleDiv.style.textDecoration = 'none';
                        });
                        titleDiv.addEventListener('click', (e) => {
                            window.open(appleMusicUrl, '_blank');
                            e.stopPropagation();
                        });
                    }
                }

                const coverArtImage = player.querySelector('.cover_art-image');
                const songInfoContainer = player.querySelector('.apple_music_player-player-info');
                const playButtonContainer = player.querySelector('.apple_music_player-play_button');
                const appleMusicPlayerLogo = player.querySelector('.apple_music_player-player-logo');
                if (isGeniusSongCopyCover) {
                    if (coverArtImage && songInfoContainer && playButtonContainer && appleMusicPlayerLogo) {
                        const copyCoverButton = document.createElement('button');
                        copyCoverButton.textContent = 'Copy Cover';
                        copyCoverButton.style.background = '#FFFFFF';
                        copyCoverButton.style.color = '#222';
                        copyCoverButton.style.border = '1px solid #222';
                        copyCoverButton.style.padding = '2px 4px';
                        copyCoverButton.style.fontSize = '12px';
                        copyCoverButton.style.cursor = 'pointer';
                        copyCoverButton.style.lineHeight = '2em';
                        copyCoverButton.style.marginRight = '8px';
                        copyCoverButton.style.borderRadius = '1.25rem';
                        appleMusicPlayerLogo.parentNode.insertBefore(copyCoverButton, appleMusicPlayerLogo);
                        appleMusicPlayerLogo.remove();
                        copyCoverButton.addEventListener('click', function () {
                            const link = coverArtImage.src;
                            const newLink = link.replace('72x72bb.jpg', '1000x1000bb.png');
                            navigator.clipboard.writeText(newLink).then(() => {
                                const originalText = copyCoverButton.textContent;
                                copyCoverButton.textContent = 'Copied to clipboard';
                                setTimeout(() => {
                                    copyCoverButton.textContent = originalText;
                                }, 1500);

                            });
                        });
                        copyCoverButton.addEventListener('mouseover', function () {
                            copyCoverButton.style.backgroundColor = '#111212';
                            copyCoverButton.style.color = '#FFFFFF';
                        });
                        copyCoverButton.addEventListener('mouseout', function () {
                            copyCoverButton.style.backgroundColor = '#FFFFFF';
                            copyCoverButton.style.color = '#222';
                        });
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function observeDOMChanges() {
        const targetNode = document.body;
        const observerOptions = { childList: true, subtree: true };
        const observerCallback = function (mutationsList, observer) {
            if (checkAppleMusicPlayer()) {
                observer.disconnect();
            }
        };
        const observer = new MutationObserver(observerCallback);
        observer.observe(targetNode, observerOptions);
    }

    observeDOMChanges();



    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                          SPOTIFY & SOUNDCLOUD PLAYER                           //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function genAuthBasicToken(clientId, clientSecret) {
        return btoa(`${clientId}:${clientSecret}`);
    }
    function getEpochTimeSeconds() {
        return Math.floor(Date.now() / 1000);
    }
    function formatGetParams(params) {
        return Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
    }

    async function getSpotifySongId(json) {
        console.log("Run function getSpotifySongId()");

        const title = json.response.song.title;
        //const artists = json.response.song.primary_artist.name;
        const artists = json.response.song.primary_artists.map(artist => artist.name.replace(/ *\([^)]*\) */g, "").trim());
        let titleSet = new Set();
        let artistSet = new Set();
        titleSet.add(title);
        artists.forEach(artist => { artistSet.add(artist); });
        const searchSets = { "title": titleSet, "artists": artistSet };

        let token;
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${genAuthBasicToken(window.secrets.SPOTIFY_CLIENT_ID, window.secrets.SPOTIFY_CLIENT_SECRET)}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });
        const tokenData = await tokenResponse.json();
        token = `${tokenData.token_type} ${tokenData.access_token}`;

        for (const artist of searchSets.artists) {
            for (const title of searchSets.title) {
                const params = { q: `${title} ${artist}`, type: "track" };
                try {
                    const searchResponse = await fetch(`https://api.spotify.com/v1/search?${formatGetParams(params)}`, {
                        method: "GET",
                        headers: { "Authorization": token }
                    });
                    const searchData = await searchResponse.json();
                    if (searchData.tracks.items.length > 0) {
                        const bestMatch = findBestMatch(searchData.tracks.items, title, artist);
                        if (bestMatch) {
                            const matchQuality = evaluateMatch(bestMatch, title, artist);
                            if (matchQuality > 1) {
                                loadSpotifyPlayer(bestMatch.id);
                                return;
                            } else {
                                console.info("Bad match found:\n" + `${bestMatch.artists.map(a => a.name).join(", ")} – ${bestMatch.name}`);
                            }
                        }
                    } else {
                        console.info("No tracks found for:", params);
                    }
                } catch (error) {
                    console.error("Error during Spotify search:", error);
                }
            }
        }
    }

    function findBestMatch(tracks, title, artist) {
        const diff = (a, b) => {
            const aSet = new Set(a.split(" "));
            const bSet = new Set(b.split(" "));
            const intersection = new Set([...aSet].filter(x => bSet.has(x)));
            return aSet.size + bSet.size - 2 * intersection.size;
        };
        return tracks.reduce((prev, curr) => {
            const currDiff = diff(curr.name, title) + diff(curr.artists[0].name, artist);
            const prevDiff = diff(prev.name, title) + diff(prev.artists[0].name, artist);
            return currDiff < prevDiff ? curr : prev;
        }, tracks[0]);
    }

    function normalize(str) {
        return str.toLowerCase().replace(/['´‘’]/g, '');
    }

    function evaluateMatch(track, title, artist) {
        let score = 0;

        const normalizedTrackName = normalize(track.name);
        const normalizedTitle = normalize(title);

        if (normalizedTrackName.includes(normalizedTitle) || normalizedTitle.includes(normalizedTrackName)) {
            score += 1;
        }

        const artistNames = track.artists.map(a => normalize(a.name));
        const normalizedArtist = normalize(artist);

        if (artistNames.some(a => a.includes(normalizedArtist))) {
            score += 1;
        }

        const titleMatch = normalizedTrackName === normalizedTitle;
        const artistMatch = artistNames.some(a => a === normalizedArtist);

        if (titleMatch && artistMatch) {
            score += 2;
        }

        return score;
    }

    let savedClasses = {
        spotifyContainer: localStorage.getItem("spotifyContainer") || "SpotifyPlayer-desktop__PositioningContainer-sc-51e58cc2-0 gLqYRU",
        spotifyIframeWrapper: localStorage.getItem("spotifyIframeWrapper") || "PageGrid-desktop-sc-3faf0c7e-0 ifuhQp SpotifyPlayer-desktop__IframeWrapper-sc-51e58cc2-1 gICLPX",
        spotifyIframe: localStorage.getItem("spotifyIframe") || "SpotifyPlayer-desktop__Iframe-sc-51e58cc2-3 eaeTtZ",
        soundCloudContainer: localStorage.getItem("soundCloudContainer") || "SoundCloudPlayer-desktop__PositioningContainer-sc-51e58cc2-0 gLqYRU",
        soundCloudIframeWrapper: localStorage.getItem("soundCloudIframeWrapper") || "PageGrid-desktop-sc-3faf0c7e-0 ifuhQp SoundCloudPlayer-desktop__IframeWrapper-sc-51e58cc2-1 gICLPX",
        soundCloudIframe: localStorage.getItem("soundCloudIframe") || "SoundCloudPlayer-desktop__Iframe-sc-51e58cc2-3 eaeTtZ",
        soundCloudButton: localStorage.getItem("soundCloudButton") || "SmallButton__Container-sc-e8eb65fd-0 gGXecB SoundcloudButton__PlayVideoButton-sc-63f2ae25-0 cckSnM"
    };

    function updateClasses() {
        const youtubeButton = document.querySelector('button[class*="YoutubeButton__PlayVideoButton-"]');
        if (youtubeButton) {
            savedClasses.soundCloudButton = youtubeButton.className.replace("YoutubeButton", "SoundcloudButton");
            localStorage.setItem("soundCloudButton", savedClasses.soundCloudButton);
        }
        const appleContainer = document.querySelector('div[class^="AppleMusicPlayer-desktop__PositioningContainer"]');
        const appleIframeWrapper = document.querySelector('div[class*="AppleMusicPlayer-desktop__IframeWrapper"]');
        const appleIframe = document.querySelector('iframe[class^="AppleMusicPlayer-desktop__Iframe"]');
        if (appleContainer && appleIframeWrapper && appleIframe) {
            savedClasses.soundCloudContainer = appleContainer.className.replace("AppleMusicPlayer", "SoundCloudPlayer");
            savedClasses.soundCloudIframeWrapper = appleIframeWrapper.className.replace("AppleMusicPlayer", "SoundCloudPlayer");
            savedClasses.soundCloudIframe = appleIframe.className.replace("AppleMusicPlayer", "SoundCloudPlayer");
            savedClasses.spotifyContainer = appleContainer.className.replace("AppleMusicPlayer", "SpotifyPlayer");
            savedClasses.spotifyIframeWrapper = appleIframeWrapper.className.replace("AppleMusicPlayer", "SpotifyPlayer");
            savedClasses.spotifyIframe = appleIframe.className.replace("AppleMusicPlayer", "SpotifyPlayer");
            localStorage.setItem("soundCloudContainer", savedClasses.soundCloudContainer);
            localStorage.setItem("soundCloudIframeWrapper", savedClasses.soundCloudIframeWrapper);
            localStorage.setItem("soundCloudIframe", savedClasses.soundCloudIframe);
            localStorage.setItem("spotifyContainer", savedClasses.spotifyContainer);
            localStorage.setItem("spotifyIframeWrapper", savedClasses.spotifyIframeWrapper);
            localStorage.setItem("spotifyIframe", savedClasses.spotifyIframe);
        }
    }

    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.addedNodes.length > 0) {
                updateClasses();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function loadSpotifyPlayer(spotifyId) {
        if (document.getElementById("ge-spotify-player")) {
            return;
        }

        let spotifyContainer = document.createElement("div");
        spotifyContainer.className = savedClasses.spotifyContainer;
        let spotifyIframeWrapper = document.createElement("div");
        spotifyIframeWrapper.className = savedClasses.spotifyIframeWrapper;

        const styleContainer = savedClasses.spotifyContainer.split(' ').pop();
        const styleIframeWrapper = savedClasses.spotifyIframeWrapper.split(' ').pop();
        const styleIframe = savedClasses.spotifyIframe.split(' ').pop();

        const style = document.createElement('style');
        style.innerHTML = `
        .${styleContainer} {
            padding-bottom: 1rem;
        }
        .${styleIframe} {
            margin-bottom: -10px;
        }`;
        document.body.appendChild(style);

        const appleContainer = document.querySelector('div[class^="AppleMusicPlayer-desktop__PositioningContainer"]');
        if (appleContainer) appleContainer.style.padding = "0";

        let spotifyIframe = document.createElement("iframe");
        spotifyIframe.style.width = "100%";
        spotifyIframe.style.height = "80px";
        spotifyIframe.style.gridColumn = "left-start / right-end";
        spotifyIframe.style.pointerEvents = "auto";
        spotifyIframe.className = savedClasses.spotifyIframe;
        spotifyIframe.id = "ge-spotify-player";
        spotifyIframe.src = `https://open.spotify.com/embed/track/${spotifyId}`;
        spotifyIframe.setAttribute("allow", "encrypted-media");
        spotifyIframe.setAttribute("allowtransparency", "true");
        spotifyIframeWrapper.appendChild(spotifyIframe);
        spotifyContainer.appendChild(spotifyIframeWrapper);

        const mediaPlayersContainer = document.querySelector('[class^="MediaPlayersContainer"]');
        if (mediaPlayersContainer) {
            //mediaPlayersContainer.insertBefore(spotifyContainer, mediaPlayersContainer.firstChild);
            mediaPlayersContainer.append(spotifyContainer);
        }
        if (isGeniusSongLyricEditor) {
            function adjustSpotifyPlayerGridColumn() {
                const expandingTextarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea-"]');
                const stickyToolbar = document.querySelector('div[class*="StickyContributorToolbar__Container-"]');
                const stickyNavbar = document.querySelector('nav[class^="StickyNav-desktop__Container-"]');

                if (expandingTextarea) {
                    spotifyIframe.style.gridColumn = "right-start / page-end";
                    spotifyIframe.style.marginRight = "1rem";
                    if (appleContainer) {
                        spotifyIframe.style.paddingLeft = "2.25rem";
                    } else {
                        spotifyIframe.style.paddingLeft = "1.25rem"; spotifyIframe.style.paddingRight = "1rem";
                    }
                    expandingTextarea.style.marginRight = "0rem";
                    expandingTextarea.style.position = "relative";
                    expandingTextarea.style.zIndex = "5";
                    stickyToolbar.style.zIndex = "7";
                    stickyNavbar.style.zIndex = "8";
                } else {
                    spotifyIframe.style.gridColumn = "left-start / right-end";
                    spotifyIframe.style.marginRight = "0rem";
                    spotifyIframe.style.paddingLeft = "0rem";
                    stickyToolbar.style.zIndex = "3";
                    stickyNavbar.style.zIndex = "6";
                }
            }

            adjustSpotifyPlayerGridColumn();

            const observer = new MutationObserver(adjustSpotifyPlayerGridColumn);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }


    let isSoundCloudPlaying = false;

    function addSoundCloudButton(json) {
        console.log("Run function addSoundCloudButton()");

        const soundCloudUrl = json.response.song.soundcloud_url;
        if (!soundCloudUrl) return;
        const toolbar = document.querySelector('div[class^="StickyContributorToolbar__Right-"]');
        const soundCloudButtonClass = savedClasses.soundCloudButton;

        if (toolbar) {
            let existingButton = toolbar.querySelector('button[class*="SoundcloudButton"]');
            if (existingButton) return;

            const soundCloudButton = document.createElement('button');
            soundCloudButton.className = soundCloudButtonClass;
            soundCloudButton.textContent = 'SoundCloud';
            soundCloudButton.style.whiteSpace = 'nowrap';

            soundCloudButton.addEventListener('click', () => {
                if (isSoundCloudPlaying) {
                    stopSoundCloudPlayer();
                } else {
                    loadSoundCloudPlayer(soundCloudUrl);
                }
                isSoundCloudPlaying = !isSoundCloudPlaying;
            });

            toolbar.insertBefore(soundCloudButton, toolbar.firstChild);
        }
    }

    function loadSoundCloudPlayer(soundCloudUrl) {
        soundCloudContainer = document.createElement("div");
        soundCloudContainer.className = savedClasses.soundCloudContainer;
        let soundCloudIframeWrapper = document.createElement("div");
        soundCloudIframeWrapper.className = savedClasses.soundCloudIframeWrapper;

        let soundCloudIframe = document.createElement("iframe");
        soundCloudIframe.style.width = "100%";
        soundCloudIframe.style.height = "166px";
        soundCloudIframe.style.visibility = "visible";
        soundCloudIframe.style.marginRight = "1rem";
        soundCloudIframe.style.paddingLeft = "2.25rem";
        soundCloudIframe.style.display = "block";
        //soundCloudIframe.style.gridColumn = "span 4 / page-end";
        soundCloudIframe.style.gridColumn = "span 6 / page-end";
        soundCloudIframe.style.justifySelf = "end";
        soundCloudIframe.style.pointerEvents = "auto";
        soundCloudIframe.className = savedClasses.soundCloudIframe;
        soundCloudIframe.id = "ge-soundcloud-player";
        soundCloudIframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundCloudUrl)}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;
        soundCloudIframe.setAttribute("allow", "autoplay");
        soundCloudIframeWrapper.appendChild(soundCloudIframe);
        soundCloudContainer.appendChild(soundCloudIframeWrapper);
        soundCloudContainer.classList.add('soundcloud-player');

        const mediaPlayersContainer = document.querySelector('[class^="MediaPlayersContainer"]');
        if (mediaPlayersContainer) {
            mediaPlayersContainer.insertBefore(soundCloudContainer, mediaPlayersContainer.firstChild);
            //mediaPlayersContainer.append(soundCloudContainer);
        }

        function adjustSoundCloudPlayerGridColumn() {
            const expandingTextarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea-"]');

            if (expandingTextarea) {
                soundCloudIframe.style.gridColumn = "span 6 / page-end";
            } else {
                soundCloudIframe.style.gridColumn = "span 4 / page-end";
            }
        }

        adjustSoundCloudPlayerGridColumn();

        const observer = new MutationObserver(adjustSoundCloudPlayerGridColumn);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function stopSoundCloudPlayer() {
        if (soundCloudContainer) {
            const mediaPlayersContainer = document.querySelector('[class^="MediaPlayersContainer"]');
            if (mediaPlayersContainer && soundCloudContainer.parentNode) {
                mediaPlayersContainer.removeChild(soundCloudContainer);
            }
            soundCloudContainer = null;
        }
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                PLAYER SETTINGS                                 //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    if (!isGeniusSongYouTubePlayer) {
        const playVideoButton = document.querySelector('[class*="YoutubeButton__PlayVideoButton"]');
        if (playVideoButton) {
            playVideoButton.style.display = 'none';
        }
    }

    if (!isGeniusSongAppleMusicPlayer) {
        const appleContainer = document.querySelector('div[class*="AppleMusicPlayer-desktop__IframeWrapper-"]');
        appleContainer.remove();
    }

    if (isGeniusSongLyricEditor) {
        function adjustAppleMusicPlayerGridColumn() {
            const appleIframe = document.querySelector('iframe[class^="AppleMusicPlayer-desktop__Iframe"]');
            const expandingTextarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea-"]');
            const stickyToolbar = document.querySelector('div[class*="StickyContributorToolbar__Container-"]');
            const stickyNavbar = document.querySelector('nav[class^="StickyNav-desktop__Container-"]');

            if (appleIframe) {
                if (expandingTextarea) {
                    appleIframe.style.gridColumn = "right-start / page-end";
                    appleIframe.style.marginRight = "0rem";
                    appleIframe.style.paddingLeft = "2.25rem";
                    expandingTextarea.style.position = "relative";
                    expandingTextarea.style.zIndex = "5";
                    stickyToolbar.style.zIndex = "7";
                    stickyNavbar.style.zIndex = "8";
                } else {
                    appleIframe.style.gridColumn = "left-start / right-end";
                    appleIframe.style.marginRight = "-1rem";
                    appleIframe.style.paddingLeft = "0rem";
                    stickyToolbar.style.zIndex = "3";
                    stickyNavbar.style.zIndex = "6";
                }
            }
        }

        adjustAppleMusicPlayerGridColumn();

        const observer = new MutationObserver(adjustAppleMusicPlayerGridColumn);
        observer.observe(document.body, { childList: true, subtree: true });
    }


    if (isGeniusSongLyricEditor) {
        function adjustYouTubeMargin() {
            const transcriptionPlayer = document.querySelector('div[class^="TranscriptionPlayer__Container-"]');

            if (transcriptionPlayer) {
                transcriptionPlayer.style.margin = "0rem";
                transcriptionPlayer.style.marginRight = "1rem";
            }
        }

        adjustYouTubeMargin();

        const observer = new MutationObserver(adjustYouTubeMargin);
        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('click', (event) => {
            const button = event.target.closest('button[class*="YoutubeButton__PlayVideoButton-"], button[class*="SoundcloudButton__PlayVideoButton-"]');

            if (button) {
                const checkPlayerInterval = setInterval(() => {
                    const mediaPlayersContainer = document.querySelector('[class^="MediaPlayersContainer"]');
                    const transcriptionPlayer = document.querySelector('div[class^="TranscriptionPlayer__Container-"]');

                    if (mediaPlayersContainer && transcriptionPlayer) {
                        mediaPlayersContainer.insertBefore(transcriptionPlayer, mediaPlayersContainer.firstChild);
                        clearInterval(checkPlayerInterval);
                    }
                }, 1);
            }
        });
    }

    if (isGeniusSongRenameButtons) {
        const oldPageButton = document.querySelector('a[class*="OptOutButton__Container-"]');
        if (oldPageButton) oldPageButton.style.display = 'none';

        const youtubeButton = document.querySelector('button[class*="YoutubeButton__PlayVideoButton-"]');
        if (youtubeButton) {
            const svgElement = youtubeButton.querySelector('svg');
            svgElement.remove();
            youtubeButton.textContent = 'YouTube';
        }
    }


});
