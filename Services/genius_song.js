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
    'isGeniusSongExpandSectionsButtons',
    'isGeniusSongCopyCover',
    'isGeniusSongAppleMusicPlayer',
    'isGeniusSongYouTubePlayer',
    'isGeniusSongSoundCloudPlayer',
    'isGeniusSongSpotifyPlayer',
    'isGeniusSongLyricEditor',
    'isGeniusSongRenameButtons'
], async function (result) {
    const isGeniusSongSongPage = result.isGeniusSongSongPage ?? true;
    const isGeniusSongSongPageZwsp = result.isGeniusSongSongPageZwsp ?? true;
    const isGeniusSongSongPageInfo = result.isGeniusSongSongPageInfo ?? true;
    const isGeniusSongCheckIndex = result.isGeniusSongCheckIndex ?? false;
    const isGeniusSongFollowButton = result.isGeniusSongFollowButton ?? true;
    const isGeniusSongCleanupMetadataButton = result.isGeniusSongCleanupMetadataButton ?? true;
    const isGeniusSongLanguageButton = result.isGeniusSongLanguageButton ?? true;
    const isGeniusSongCleanupButton = result.isGeniusSongCleanupButton ?? true;
    const isGeniusSongSectionsButtons = result.isGeniusSongSectionsButtons ?? true;
    const isGeniusSongExpandSectionsButtons = result.isGeniusSongExpandSectionsButtons ?? false;
    const isGeniusSongCopyCover = result.isGeniusSongCopyCover ?? true;
    const isGeniusSongAppleMusicPlayer = result.isGeniusSongAppleMusicPlayer ?? true;
    const isGeniusSongYouTubePlayer = result.isGeniusSongYouTubePlayer ?? true;
    const isGeniusSongSoundCloudPlayer = result.isGeniusSongSoundCloudPlayer ?? true;
    const isGeniusSongSpotifyPlayer = result.isGeniusSongSpotifyPlayer ?? true;
    const isGeniusSongLyricEditor = result.isGeniusSongLyricEditor ?? true;
    const isGeniusSongRenameButtons = result.isGeniusSongRenameButtons ?? true;


    if (result['Services/genius_song.js'] === false) {
        return;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                  MAIN PROGRAM                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    main();

    async function main() {
        const isSong = /-lyrics(?:#primary-album|#about|\?.*)?$|-annotated$|\d+\?$/.test(window.location.href);
        if (!isSong) return


        editYouTubePlayer();
        editAppleMusicPlayer();


        const { songId, userId, songData } = await getSongInfo();

        // jonas
        if (userId == 4670957) showSongIdButton(songId);
        if (isGeniusSongCheckIndex) showIndexButton();

        if (isGeniusSongSongPageInfo) showCoverInfo(songData);
        if (isGeniusSongSongPage) checkSongCover(songData)

        if (isGeniusSongFollowButton) addFollowButton();

        if (isGeniusSongCleanupMetadataButton) cleanupMetadata(userId, songData);

        if (isGeniusSongLanguageButton) selectDropdown(songData, "Language");
        if (isGeniusSongCleanupButton) selectDropdown(songData, "Cleanup");
        if (isGeniusSongSectionsButtons) lyricsSectionsButtons(songData);

        if (songData.primary_tag.name !== "Non-Music") {
            if (isGeniusSongSpotifyPlayer) addSpotifyPlayer(songData);
        }
        if (songData.soundcloud_url) {
            if (isGeniusSongSoundCloudPlayer) addSoundCloudPlayer(songData);
        }
    }

    async function getSongInfo() {
        console.log("Run function getSongInfo()");
        // Song ID 
        const metaContent = document.querySelector('[property="twitter:app:url:iphone"]')?.content ?? "";
        const parts = metaContent.split("/");
        const songId = parts[2] === "songs" ? parts[3] : null;

        // User ID
        const userMatch = document.documentElement.innerHTML.match(/let current_user = JSON.parse\('{\\"id\\":(\d+)/);
        const userId = userMatch?.[1];

        // Song Data
        const response = await fetch(`https://genius.com/api/songs/${songId}`);
        const json = await response.json();

        return { songId, userId, songData: json.response.song };
    }

    document.addEventListener('click', function (event) {
        const link = event.target.closest('a');
        if (link && link.getAttribute('href') === '#primary-album') {
            event.preventDefault();
            document.getElementById('primary-album').scrollIntoView({ behavior: 'instant' });
        }
    });


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                             SONG ID & INDEX BUTTON                             //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function showSongIdButton(songId) {
        const metadataContainer = document.querySelector('div[class^="MetadataStats__Container-"]');

        if (metadataContainer && !document.getElementById("song-id-button")) {
            const songIdElement = document.createElement('span');
            songIdElement.id = "song-id-button";
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

            metadataContainer.appendChild(songIdElement);
        }
    }

    function showIndexButton() {
        const adminButton = document.querySelector('span[class*="AdminMenu__Button"]');
        const metadataContainer = document.querySelector('div[class^="MetadataStats__Container-"]');

        if (adminButton && metadataContainer && !document.getElementById("index-button")) {
            const indexElement = document.createElement('span');
            indexElement.id = "index-button";
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

            indexElement.appendChild(indexLink);
            metadataContainer.appendChild(indexElement);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                   COVER INFO                                   //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function showCoverInfo(songData) {
        console.log("Run function showCoverInfo()");

        const coverArtElement = document.querySelector('img[class^="SizedImage__Image-"]');
        const metadataContainer = document.querySelector('div[class^="SongHeader-desktop__CoverArt-"]');

        if (coverArtElement && metadataContainer) {
            const existing = metadataContainer.querySelector('p[data-type="resolution-info"]');
            if (existing) existing.remove();

            const infoElement = createResolutionInfo(songData, coverArtElement);
            metadataContainer.prepend(infoElement);
        }
    }

    function createResolutionInfo(songData, coverArtElement) {
        const resolutionMatch = songData.header_image_url.match(/(\d+)x(\d+)/);
        const formatMatch = songData.header_image_url.match(/\.(\w+)$/);

        const resolutionText = resolutionMatch?.[1] ? `${resolutionMatch[1]}x${resolutionMatch[2]}` : "No";
        const formatText = formatMatch?.[1] ? formatMatch[1].toUpperCase() : "Cover";
        const textColor = songData.song_art_text_color;

        const resolutionInfo = document.createElement('p');
        resolutionInfo.style.fontWeight = "100";
        resolutionInfo.style.textAlign = "center";
        resolutionInfo.style.position = "relative";
        resolutionInfo.style.color = textColor;

        resolutionInfo.dataset.type = "resolution-info";
        resolutionInfo.innerHTML = `${resolutionText} ${formatText} | ${songData.song_art_primary_color} | ${songData.song_art_secondary_color} | ${textColor}`;

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

    function pxToRem(px) {
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return px / rootFontSize;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                COVER INDICATOR                                 //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function checkSongCover(songData) {
        console.log("Run function checkSongCover()");

        const editButton = document.querySelector('button[class*="EditMetadataButton__SmallButton"]');
        if (editButton) {

            let color, borderColor;

            const customSongArt = songData.custom_song_art_image_url;
            const songArt = songData.song_art_image_url;
            const album = songData.album;

            if (customSongArt) {
                if (customSongArt.startsWith("https://images.genius.com") && customSongArt.endsWith("1000x1000x1.png")) {
                    color = '#99f2a5'; // Green
                    borderColor = '#66bfa3';
                } else if ((customSongArt.startsWith("http://images.genius.com") || customSongArt.startsWith("http://images.rapgenius.com") || customSongArt.startsWith("https://images.rapgenius.com")) && customSongArt.endsWith("1000x1000x1.png")) {
                    color = '#7689e8'; // Blue
                    borderColor = '#4a5e9d';
                } else if (customSongArt.startsWith("https://filepicker-images-rapgenius.s3.amazonaws.com/filepicker-images-rapgenius/") || customSongArt.endsWith("1000x1000bb.png") || customSongArt.endsWith("10000x10000bb.png") || customSongArt.endsWith("1000x1000.png") || customSongArt.endsWith("1000x1000-000000-80-0-0.png")) {
                    color = '#ffff64'; // Yellow
                    borderColor = '#cccc00';
                } else {
                    color = '#fa7878'; // Red
                    borderColor = '#a74d4d';
                }
            } else {
                if (!album) {
                    color = '#dddddd'; // Grey
                    borderColor = '#aaaaaa';
                } else {
                    if (songArt.endsWith("1000x1000x1.png")) {
                        color = '#99f2a5'; // Green
                        borderColor = '#66bfa3';
                    } else if (songArt.includes("default_cover_art.png")) {
                        color = '#dddddd'; // Grey
                        borderColor = '#aaaaaa';
                    } else {
                        color = '#ffa335'; // Orange
                        borderColor = '#c76a2b';
                    }
                }
            }

            addColoredCircle(editButton, color, borderColor);
            if (isGeniusSongSongPageZwsp) checkSongTitleForZeroWidthSpace(songData);
        }
    }

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

    function checkSongTitleForZeroWidthSpace(songData) {
        if (songData.title.includes('\u200B')) {
            const editButton = document.querySelector('button[class*="EditMetadataButton__SmallButton"]');
            const circle = editButton.querySelector('.circle-indicator');
            if (circle) {
                addBlackDot(circle);
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                 FOLLOW BUTTON                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function addFollowButton() {
        console.log("Run function addFollowButton()");
        const existingButton = document.querySelector('div[class^="ShareButtons__Container"]')?.children[3]?.children[0];
        const toolbarDiv = document.querySelector('div[class^="StickyContributorToolbar__Left"]');
        const metadataButton = document.querySelector('button[class*="EditMetadataButton"]');

        if (existingButton && toolbarDiv && metadataButton && !document.getElementById("follow-song-button")) {
            const followButton = document.createElement('button');
            followButton.id = "follow-song-button";
            followButton.className = metadataButton.className.replace("EditMetadataButton", "FollowButton");
            followButton.type = 'button';

            function updateFollowButton() {
                followButton.textContent = existingButton.textContent;
                followButton.disabled = existingButton.disabled;
            }

            updateFollowButton();

            followButton.addEventListener('click', () => {
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
    //////////                                CLEANUP METADATA                                //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function cleanupMetadata(userId, songData) {
        console.log("Run function cleanupMetadata()");
        checkZeroWidthSpaces(songData);
        checkWriterArtists(songData)
        removePrimaryArtistsAndRenameAdditionalRole(songData);
        //checkPrimaryArtists(songData);
        if (userId == 5934018 || userId == 4670957) {
            primaryArtistsToGroupMembers(songData);
        }
    }

    function checkZeroWidthSpaces(songData) {
        let updatedTitle = songData.title;

        updatedTitle = updatedTitle.replace(/\u200B{2,}/g, '\u200B');
        updatedTitle = updatedTitle.replace(/^\u200B|(?<=[\p{L}\p{N}\p{P}])\u200B|(?=[\p{L}\p{N}\p{P}])\u200B/gu, '');

        if (/\u200B/.test(updatedTitle)) {
            console.info(`Remaining ZWSP: "${updatedTitle}"`);
        }
        if (songData.title !== updatedTitle) {
            addCleanupButton(songData, "ZWSP", "Remove ZWSP", { title: updatedTitle });
        }
    }

    function checkWriterArtists(songData) {
        const writerArtists = songData.writer_artists || [];
        const customPerformances = songData.custom_performances || [];

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

            addCleanupButton(songData, "Writers", "Add Writers", { writer_artists: newWriterArtists });
        }
    }

    function removePrimaryArtistsAndRenameAdditionalRole(songData) {
        const primaryArtists = songData.primary_artists || [];
        const customPerformances = songData.custom_performances || [];
        const customPrimaryArtists = customPerformances.find(perf => perf.label === "Primary Artists");

        let updatedCustomPerformances = [...customPerformances];
        let needsPrimaryArtistsRemoval = false;
        let labelsToFix = [];

        const labelCorrections = {
            //"Primary Artists": "Group Members",
        };

        if (customPrimaryArtists) {
            const primaryArtistIds = primaryArtists.map(artist => artist.id);
            const customPrimaryArtistIds = customPrimaryArtists.artists.map(artist => artist.id);

            const sameArtists = JSON.stringify(customPrimaryArtistIds) === JSON.stringify(primaryArtistIds);
            //const sameArtists = primaryArtistIds.length === customPrimaryArtistIds.length && primaryArtistIds.every(id => customPrimaryArtistIds.includes(id));
            if (sameArtists) {
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
            addCleanupButton(songData, cleanupKey, cleanupTitle, { custom_performances: updatedCustomPerformances });
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
                    'User-Agent': 'ArtworkExtractorForGenius/0.4.7 (Artwork Extractor for Genius)'
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

    function getCsrfToken() {
        const match = document.cookie.match(/_csrf_token=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    }




    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                             LYRICS EDITOR BUTTONS                              //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function selectDropdown(songData, dropdownType) {
        console.log(`Run function selectDropdown() for ${dropdownType} dropdown`);

        const toolbarDiv = document.querySelector('div[class^="StickyContributorToolbar__Left"]');
        if (!toolbarDiv) return;

        const dropdownContainer = document.createElement('div');
        dropdownContainer.style.position = 'relative';

        const dropdownButton = document.createElement('button');
        dropdownButton.style.display = "block";
        dropdownButton.type = 'button';

        const dropdownSpan = document.createElement('span');
        Object.assign(dropdownSpan.style, {
            display: "flex",
            alignItems: "center",
            borderRadius: "1.25rem",
            padding: "0.25rem 0.75rem",
            border: "1px solid black",
            fontFamily: "HelveticaNeue, Arial, sans-serif",
            fontSize: "0.75rem",
            color: "black",
            lineHeight: "1rem",
            whiteSpace: "nowrap"
        });

        const dropdownText = document.createElement('span');
        const storedLanguage = localStorage.getItem("selectedLanguageText") || "??";
        dropdownText.textContent = dropdownType === "Language" ? `Language: ${storedLanguage}` : "Cleanup";

        const arrowSpan = document.createElement('span');
        arrowSpan.className = `${dropdownType}__DropdownIcon`;
        Object.assign(arrowSpan.style, { marginLeft: "0.375rem", width: "0.5rem" });

        const arrowSvgClosed = createArrowSvg('M4.488 7 0 0h8.977L4.488 7Z');
        const arrowSvgOpen = createArrowSvg('M4.488.5 0 7.5h8.977L4.488.5Z');

        const dropdownMenu = createDropdownMenu(songData, dropdownText, arrowSpan, dropdownType);

        arrowSpan.appendChild(arrowSvgClosed.cloneNode(true));
        dropdownSpan.append(dropdownText, arrowSpan);
        dropdownButton.appendChild(dropdownSpan);
        dropdownContainer.append(dropdownButton, dropdownMenu);
        toolbarDiv.appendChild(dropdownContainer);

        dropdownButton.addEventListener('click', e => {
            e.stopPropagation();
            const isVisible = dropdownMenu.style.display === 'block';

            document.querySelectorAll('div.Dropdown__ContentContainer').forEach(menu => {
                menu.style.display = 'none';
                const icon = menu.parentElement.querySelector('span[class$="__DropdownIcon"]');
                if (icon) {
                    icon.innerHTML = '';
                    icon.appendChild(arrowSvgClosed.cloneNode(true));
                }
            });

            dropdownMenu.style.display = isVisible ? 'none' : 'block';
            arrowSpan.innerHTML = '';
            arrowSpan.appendChild(isVisible ? arrowSvgClosed.cloneNode(true) : arrowSvgOpen.cloneNode(true));
        });

        document.addEventListener('click', e => {
            if (!dropdownContainer.contains(e.target)) {
                dropdownMenu.style.display = 'none';
                arrowSpan.innerHTML = '';
                arrowSpan.appendChild(arrowSvgClosed.cloneNode(true));
            }
        });

        const toggleDropdownButton = () => {
            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
            dropdownContainer.style.display = textarea ? 'block' : 'none';
        };

        const observer = new MutationObserver(() => requestAnimationFrame(toggleDropdownButton));
        observer.observe(document.body, { childList: true, subtree: true });

        toggleDropdownButton();
    }

    function createDropdownMenu(songData, dropdownText, arrowSpan, dropdownType) {
        const LANGUAGE_OPTIONS = [
            //{ code: 'Auto', value: 'auto', name: 'Auto Language' },
            { code: 'SQ', value: 'sq', name: 'Albanian' },
            { code: 'EU', value: 'eu', name: 'Basque' },
            { code: 'BG', value: 'bg', name: 'Bulgarian' },
            { code: 'CA', value: 'ca', name: 'Catalan' },
            { code: 'CS', value: 'cs', name: 'Czech' },
            { code: 'ZH-T', value: 'zh-Hant', name: 'Chinese Traditional' },
            { code: 'ZH-S', value: 'zh', name: 'Chinese Simplified' },
            { code: 'DA', value: 'da', name: 'Danish' },
            { code: 'NL', value: 'nl', name: 'Dutch' },
            { code: 'EN', value: 'en', name: 'English' },
            { code: 'ET', value: 'et', name: 'Estonian' },
            { code: 'FR', value: 'fr', name: 'French' },
            { code: 'GL', value: 'gl', name: 'Galician' },
            { code: 'DE', value: 'de', name: 'German' },
            { code: 'HU', value: 'hu', name: 'Hungarian' },
            { code: 'IS', value: 'is', name: 'Icelandic' },
            { code: 'IT', value: 'it', name: 'Italian' },
            { code: 'KO', value: 'ko', name: 'Korean' },
            { code: 'LA', value: 'la', name: 'Latin' },
            { code: 'LT', value: 'lt', name: 'Lithuanian' },
            { code: 'MN', value: 'mn', name: 'Mongolian' },
            { code: 'NO', value: 'no', name: 'Norwegian' },
            { code: 'PL', value: 'pl', name: 'Polish' },
            { code: 'RU', value: 'ru', name: 'Russian' },
            { code: 'SC', value: 'sc', name: 'Sardinian' },
            { code: 'SK', value: 'sk', name: 'Slovak' },
            { code: 'ES', value: 'es', name: 'Spanish' },
            { code: 'SV', value: 'sv', name: 'Swedish' },
            { code: 'TR', value: 'tr', name: 'Turkish' },
            { code: 'UK', value: 'uk', name: 'Ukrainian' },
            { code: 'UZ', value: 'uz', name: 'Uzbek' },
            { code: 'VI', value: 'vi', name: 'Vietnamese' },
        ];

        const CLEANUP_OPTIONS = [
            ...(isGeniusSongLanguageButton ? [{ code: 'language', name: 'Language Cleanup' }] : []),
            { code: 'general', name: 'General Cleanup' },
            { code: 'punctuation', name: 'Fix Punctuation' },
            { code: 'capitalization', name: 'Fix Capitalization' }
        ];

        const options = dropdownType === "Language" ? LANGUAGE_OPTIONS : CLEANUP_OPTIONS;

        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = "Dropdown__ContentContainer";
        Object.assign(dropdownMenu.style, {
            display: 'none',
            zIndex: '1000'
        });

        const ul = document.createElement('ul');
        ul.className = `${dropdownType}Menu__Dropdown`;
        Object.assign(ul.style, {
            zIndex: 4,
            backgroundColor: "#fff",
            marginTop: "1rem",
            fontSize: "0.75rem",
            fontWeight: 100,
            position: "absolute",
            right: "0px",
            border: "1px solid #000",
            minWidth: "100%",
            cursor: "pointer",
            whiteSpace: "nowrap",
            overflowY: "auto",
            scrollbarWidth: "none"
        });

        function adjustDropdownHeight() {
            const rect = dropdownMenu.getBoundingClientRect();
            let availableHeight = window.innerHeight - rect.top - 20;
            const step = window.innerWidth > 1526 ? 27 : 24;
            ul.style.maxHeight = `${Math.floor(availableHeight / step) * step}px`;
        }

        window.addEventListener('resize', adjustDropdownHeight);
        window.addEventListener('scroll', adjustDropdownHeight, { passive: true });
        new ResizeObserver(adjustDropdownHeight).observe(dropdownMenu);
        adjustDropdownHeight();

        const fragment = document.createDocumentFragment();
        options.forEach(option => {
            const li = document.createElement('li');
            li.className = `${dropdownType}MenuItem__Container`;

            const menuButton = document.createElement('button');
            menuButton.className = `${dropdownType}MenuItem__TextButton`;
            Object.assign(menuButton.style, {
                width: "100%",
                padding: "0.375rem 0.5rem",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "inherit",
                fontSize: "inherit",
                fontWeight: "inherit",
                color: "inherit",
                lineHeight: "1"
            });
            menuButton.type = 'button';
            menuButton.textContent = option.name;
            menuButton.dataset.code = option.code;
            if (option.value) menuButton.dataset.value = option.value;

            li.appendChild(menuButton);
            fragment.appendChild(li);
        });
        ul.appendChild(fragment);
        dropdownMenu.appendChild(ul);

        ul.addEventListener('click', e => {
            const menuButton = e.target.closest('button');
            if (!menuButton) return;

            const selectedCode = menuButton.dataset.code;
            const selectedValue = menuButton.dataset.value;

            if (dropdownType === "Language") {
                localStorage.setItem("selectedLanguage", selectedValue);
                localStorage.setItem("selectedLanguageText", selectedCode);
                dropdownText.textContent = `Language: ${selectedCode}`;
                document.querySelectorAll('#lyricsSectionsButtonsContainer').forEach(div => div.remove());
                document.querySelectorAll('#lyricsStyleButtonsContainer').forEach(div => div.remove());
                lyricsSectionsButtons(songData);
            } else if (dropdownType === "Cleanup") {
                lyricsCleanupLogic(selectedCode);
            }

            dropdownMenu.style.display = 'none';
            arrowSpan.innerHTML = '';
            arrowSpan.appendChild(createArrowSvg('M4.488 7 0 0h8.977L4.488 7Z'));
        });

        return dropdownMenu;
    }

    function createArrowSvg(pathData) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 9 7');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        svg.appendChild(path);
        return svg;
    }

    function lyricsSectionsButtons(songData) {
        console.log("Run function lyricsSectionsButtons()");

        const explainerElement = document.querySelector('div[class^="LyricsEditExplainer__Container-"]');
        const referenceButton = document.querySelector('button[class*="EditMetadataButton"]');
        if (!explainerElement || !referenceButton) return;

        const isNonMusic = songData.primary_tag.name === "Non-Music";


        const createGridContainer = (id, marginTop = "1.5rem") => {
            const div = document.createElement("div");
            div.id = id;
            div.style.marginTop = marginTop;
            div.style.display = "grid";
            div.style.gridTemplateColumns = "repeat(4, 1fr)";
            div.style.gap = "5px";
            return div;
        };

        const createButton = (label, hoverText, className) => {
            const btn = document.createElement("button");
            btn.style.width = "6rem";
            btn.style.display = "flex";
            btn.style.alignItems = "center";
            btn.style.justifyContent = "center";

            if (!label) {
                btn.style.visibility = "hidden";
                return btn;
            }

            btn.innerHTML = label;
            btn.title = hoverText;
            btn.type = "button";
            btn.className = className;
            return btn;
        };

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

        function insertSeoHeader(songData, headerType, storedLanguage) {
            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
            if (!textarea) return;

            const insertText = (text, position = "begin") => {
                textarea.focus();
                const currentText = textarea.value.trim();

                if (position === "begin" && !currentText.startsWith(text)) {
                    textarea.value = text + "\n\n" + currentText;
                    textarea.setSelectionRange(text.length + 2, text.length + 2);
                }

                if (position === "end" && !currentText.endsWith(text)) {
                    textarea.value = currentText + "\n\n" + text;
                }
            };

            const containsCyrillic = (text) => /[А-Яа-яЁё]/.test(text);
            const containsChinese = (text) => /[\u4e00-\u9fff]/.test(text);

            const cleanName = (name) => {
                name = name.replace(/”/g, '"').replace(/’/g, "'");
                if (containsCyrillic(name) || containsChinese(name)) {
                    name = name.replace(/\s*\([^)]+\)/g, "").replace(/\s*\[[^\]]+\]/g, "");
                }
                return name;
            };

            // Clean song title (Cyrillic/Chinese)
            let songTitle = cleanName(songData.title);

            // Clean song title (Translation)
            const isTranslation = songData.tracking_data?.some(
                (item) => item.key === "Translation" && item.value === true
            );
            if (isTranslation) {
                const dashIndex = songTitle.indexOf("-");
                const lastBracketIndex = Math.max(
                    songTitle.lastIndexOf("("),
                    songTitle.lastIndexOf("["),
                    songTitle.lastIndexOf("{")
                );
                if (dashIndex !== -1 && lastBracketIndex > dashIndex) {
                    songTitle = songTitle.substring(dashIndex + 1, lastBracketIndex).trim();
                }
            }

            // Clean artist names (Disambiguation)
            const primaryArtists = songData.primary_artists.map(a => cleanName(a.name));
            const featuredArtists = songData.featured_artists.map(a => {
                let name = cleanName(a.name);
                return name.replace(/\s*\(([A-Z]{2,3})\)\s*/g, "");
            });

            const primaryArtistsText = primaryArtists.length > 1
                ? primaryArtists.slice(0, -1).join(", ") + " & " + primaryArtists.at(-1)
                : primaryArtists.join("");

            const featuredArtistsText = featuredArtists.length > 1
                ? featuredArtists.slice(0, -1).join(", ") + " & " + featuredArtists.at(-1)
                : featuredArtists.join("");

            const featuringText = featuredArtistsText ? ` ft. ${featuredArtistsText}` : "";
            const formattedFeaturingText = featuredArtistsText ? `ft. ${featuredArtistsText} ` : "";

            const textFormats = {
                Header: {
                    'bg': `[Текст на песента "${songTitle}"${featuringText}]`,
                    'ca': `[Lletra de "${songTitle}"${featuringText}]`,
                    'cs': `[Text skladby „${songTitle}“${featuringText}]`,
                    'da': `[Tekst til „${songTitle}“${featuringText}]`,
                    'de': `[Songtext zu „${songTitle}“${featuringText}]`,
                    'es': `[Letra de "${songTitle}"${featuringText}]`,
                    'et': `[${songTitle} laulusõnad${featuringText}]`,
                    'eu': `["${songTitle}" abestiaren letra${featuringText}]`,
                    'fr': `[Paroles de "${songTitle}"${featuringText}]`,
                    'gl': `[Letra de "${songTitle}"${featuringText}]`,
                    'hu': `[„[${songTitle}]” dalszöveg${featuringText}]`,
                    'is': `[Söngtextar fyrir "${songTitle}"${featuringText}]`,
                    'it': `[Testo di "${songTitle}"${featuringText}]`,
                    'la': `[Lyricis "${songTitle}"${featuringText}]`,
                    'lt': `[Dainos žodžiai „${songTitle}”${featuringText}]`,
                    'mn': `[«${songTitle}» Үгнүүд${featuringText}]`,
                    'nl': `[Songtekst van "${songTitle}"${featuringText}]`,
                    'no': `[Tekst til «${songTitle}»${featuringText}]`,
                    'pl': `[Tekst piosenki "${songTitle}"${featuringText}]`,
                    'ru': `[Текст песни «${songTitle}»${featuringText}]`,
                    'sc': `[Testu de "${songTitle}"${featuringText}]`,
                    'sk': `[Text skladby „${songTitle}“${featuringText}]`,
                    'sq': `[Teksti i "${songTitle}"${featuringText}]`,
                    'tr': `["${songTitle}"${featuringText} için şarkı sözleri]`,
                    'uk': `[Текст пісні «${songTitle}»${featuringText}]`,
                    'uz': `[«${songTitle}» qoʻshigʻi matni${featuringText}]`,
                    'vi': `[Lời bài hát "${songTitle}"${featuringText}]`,
                    'zh': `[${primaryArtists}《${songTitle}》${formattedFeaturingText}歌词]`,
                    'zh-hant': `[${primaryArtists}《${songTitle}》${formattedFeaturingText}歌詞]`,
                },
                Translation: {
                    'de': `[Deutscher Songtext zu „${songTitle}“${featuringText}]`,
                    'nl': `[Songtekst van "${songTitle}"${featuringText} (Vertaling)]`,
                    'no': `[Tekst til ${primaryArtists} – «${songTitle}»${featuringText} (Oversettelse)]`,
                    'sq': `[Teksti i "${songTitle}"${featuringText} në shqip]`,
                    'tr': `["${songTitle}"${featuringText} için Türkçe şarkı sözleri]`,
                    'vi': `[Lời dịch tiếng Việt cho "${songTitle}"${featuringText}]`,
                },
                Snippet: {
                    'cs': `<b>[Lyrics from [Snippet]()]</b>`,
                    'da': `<b>[Tekst fra [snippet]()]</b>`,
                    'de': `<b>[Lyrics von [Snippet](), vollständige Lyrics bei Release]</b>`,
                    'en': `<b>Lyrics from [Snippet]()</b>`,
                    'nl': `<b>[Songtekst van [Fragment]()]</b>`,
                    'pl': `<b>[Tekst piosenki pochodzi z [Snippet]()]</b>`,
                    'sk': `<b>[Lyrics from [Snippet]()]</b>`,
                    'tr': `<b>[[Kesit]() şarkı sözleri, resmî sözler yayımlanınca güncellenecektir]</b>`,
                }
            };

            const textToInsert = textFormats[headerType]?.[storedLanguage];
            if (textToInsert) {
                insertText(textToInsert, headerType === "Snippet" ? "end" : "begin");
            }
        }

        function insertPartHeader(fullText) {
            insertTextAtCursor(`<b>[${fullText}]</b>`);

            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
            if (textarea) {
                const oldCursorPos = textarea.selectionStart;

                let i = 1;
                const oldValue = textarea.value;

                const newValue = oldValue.replace(
                    new RegExp(`<b>\\[${fullText}(?: [IVXLCDM]+)?`, "g"),
                    () => `<b>[${fullText} ${convertToRoman(i++)}`
                );

                textarea.value = newValue;

                const diff = newValue.length - oldValue.length;
                const newCursorPos = oldCursorPos + diff;
                textarea.focus();
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }
        }

        function insertVerseHeader(fullText) {
            insertTextAtCursor(`[${fullText}]`);

            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
            if (textarea) {
                const oldCursorPos = textarea.selectionStart;

                const oldValue = textarea.value;

                const otherTags = ["Part", "Teil", "Część", "Часть", "Pjesa", "Kısım", "Qism"];
                const sectionRegex = new RegExp(
                    `(<b>\\[(?:${otherTags.join('|')})(?: [IVXLCDM]+)?[^<]*<\\/b>)`,
                    "g"
                );
                const ownRegex = new RegExp(`\\[${fullText}(?: \\d+)?\\]`, "g");

                const renumberTags = (text) => {
                    const matches = text.match(ownRegex);
                    if (matches && matches.length > 1) {
                        let i = 1;
                        return text.replace(ownRegex, () => `[${fullText} ${i++}]`);
                    }
                    if (matches && matches.length === 1) {
                        return text.replace(ownRegex, `[${fullText}]`);
                    }
                    return text;
                };

                let lastIndex = 0;
                let updatedText = "";
                let match;

                while ((match = sectionRegex.exec(oldValue)) !== null) {
                    const sectionText = oldValue.substring(lastIndex, match.index);
                    updatedText += renumberTags(sectionText);
                    updatedText += match[1];
                    lastIndex = sectionRegex.lastIndex;
                }

                updatedText += renumberTags(oldValue.substring(lastIndex));
                textarea.value = updatedText;

                const diff = updatedText.length - oldValue.length;
                const newCursorPos = oldCursorPos + diff;

                textarea.focus();
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }
        }

        const insertSectionHeader = (fullText, hoverText, storedLanguage) => {
            const actions = {
                Header: () => insertSeoHeader(songData, hoverText, storedLanguage),
                Translation: () => insertSeoHeader(songData, hoverText, storedLanguage),
                Snippet: () => insertSeoHeader(songData, hoverText, storedLanguage),
                Part: () => insertPartHeader(fullText),
                Verse: () => insertVerseHeader(fullText),
                default: () => insertTextAtCursor(`[${fullText}]`)
            };
            const action = actions[hoverText] || actions.default;
            action();

        };

        const applyTextFormatting = (openTag, closeTag) => {
            const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            if (start === end) {
                textarea.setRangeText(openTag + closeTag, start, end, "end");
                const cursor = start + openTag.length;
                textarea.selectionStart = cursor;
                textarea.selectionEnd = cursor;
            } else {
                let selected = textarea.value.substring(start, end);
                let trailing = "";

                while (/[ \n\r]$/.test(selected)) {
                    trailing = selected.slice(-1) + trailing;
                    selected = selected.slice(0, -1);
                }

                textarea.setRangeText(openTag + selected + closeTag + trailing, start, end, "end");
            }

            textarea.focus();
        };

        const renderButtons = (container, buttons, classNameMapper, storedLanguage) => {
            buttons.forEach(({ label, openTag, closeTag, hoverText, fullText }) => {
                const className = classNameMapper(hoverText || fullText);
                const btn = createButton(label, hoverText, className);

                btn.addEventListener("click", () => {
                    if (openTag !== undefined) {
                        applyTextFormatting(openTag, closeTag);
                    } else {
                        insertSectionHeader(fullText, hoverText, storedLanguage);
                    }
                });

                container.appendChild(btn);
            });
        };


        if (!isNonMusic) {
            // SECTION BUTTONS
            const headerDiv = createGridContainer("lyricsSectionsButtonsContainer", "2rem");

            let storedLanguage = localStorage.getItem("selectedLanguage");
            if (storedLanguage === "auto") storedLanguage = songData.language;
            if (!storedLanguage) return;

            const LABELS = {
                "bg": { // Bulgarian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Въведение", fullText: "Въведение", hoverText: "Intro" },
                        { displayText: "Финал", fullText: "Финал", hoverText: "Outro" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Част", fullText: "Част", hoverText: "Part" },
                        { displayText: "Куплет", fullText: "Куплет", hoverText: "Verse" },
                        { displayText: "Предприпев", fullText: "Предприпев", hoverText: "Pre-Chorus" },
                        { displayText: "Припев", fullText: "Припев", hoverText: "Chorus" },
                        { displayText: "Следприпев", fullText: "Следприпев", hoverText: "Post-Chorus" },
                        { displayText: "Рефрен", fullText: "Рефрен", hoverText: "Refrain" },
                        { displayText: "Мост", fullText: "Мост", hoverText: "Bridge" },
                    ]
                },
                "ca": { // Catalan
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "cs": { // Czech
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Part", fullText: "Part", hoverText: "Part" },
                        { displayText: "Verse", fullText: "Verse", hoverText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus", hoverText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus", hoverText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus", hoverText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain", hoverText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge", hoverText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown", hoverText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude", hoverText: "Interlude" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "da": { // Danish
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skitse", fullText: "Skitse", hoverText: "Skit" },
                        { displayText: "Part", fullText: "Part", hoverText: "Part" },
                        { displayText: "Vers", fullText: "Vers", hoverText: "Verse" },
                        { displayText: "Bro", fullText: "Bro", hoverText: "Pre-Chorus" },
                        { displayText: "Omkvæd", fullText: "Omkvæd", hoverText: "Chorus" },
                        { displayText: "Post-omkvæd", fullText: "Post-omkvæd", hoverText: "Post-Chorus" },
                        { displayText: "Refræn", fullText: "Refræn", hoverText: "Refrain" },
                        { displayText: "Kontraststykke", fullText: "Kontraststykke", hoverText: "Bridge" },
                        { displayText: "Mellemspil", fullText: "Mellemspil", hoverText: "Interlude" },
                        { displayText: "Mellemstykke", fullText: "Mellemstykke", hoverText: "Interlude" },
                        { displayText: "Breakdown", fullText: "Breakdown", hoverText: "Breakdown" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "de": { // German
                    Rap: [
                        { displayText: "Songtext", fullText: "Songtext", hoverText: "Header" },
                        { displayText: "Übersetzung", fullText: "Übersetzung", hoverText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Teil", fullText: "Teil", hoverText: "Part" },
                        { displayText: "Part", fullText: "Part", hoverText: "Verse" },
                        { displayText: "Pre-Hook", fullText: "Pre-Hook", hoverText: "Pre-Chorus" },
                        { displayText: "Hook", fullText: "Hook", hoverText: "Chorus" },
                        { displayText: "Post-Hook", fullText: "Post-Hook", hoverText: "Post-Chorus" },
                        { displayText: "Bridge", fullText: "Bridge", hoverText: "Bridge" },
                        { displayText: "Interlude", fullText: "Interlude", hoverText: "Interlude" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ],
                    Default: [
                        { displayText: "Songtext", fullText: "Songtext", hoverText: "Header" },
                        { displayText: "Übersetzung", fullText: "Übersetzung", hoverText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Teil", fullText: "Teil", hoverText: "Part" },
                        { displayText: "Strophe", fullText: "Strophe", hoverText: "Verse" },
                        { displayText: "Pre-Refrain", fullText: "Pre-Refrain", hoverText: "Pre-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain", hoverText: "Chorus" },
                        { displayText: "Post-Refrain", fullText: "Post-Refrain", hoverText: "Post-Chorus" },
                        { displayText: "Bridge", fullText: "Bridge", hoverText: "Bridge" },
                        { displayText: "Interlude", fullText: "Interlude", hoverText: "Interlude" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "en": { // English
                    Default: [
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Part", fullText: "Part", hoverText: "Part" },
                        { displayText: "Verse", fullText: "Verse", hoverText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus", hoverText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus", hoverText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus", hoverText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain", hoverText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge", hoverText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown", hoverText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude", hoverText: "Interlude" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "es": { // Spanish
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "et": { // Estonian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "eu": { // Basque
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "fr": { // French
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Dialogue", fullText: "Dialogue", hoverText: "Skit" },
                        { displayText: "Part", fullText: "Part", hoverText: "Part" },
                        { displayText: "Couplet", fullText: "Couplet", hoverText: "Verse" },
                        { displayText: "Pré-refrain", fullText: "Pré-refrain", hoverText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain", hoverText: "Chorus" },
                        { displayText: "Post-refrain", fullText: "Post-refrain", hoverText: "Post-Chorus" },
                        { displayText: "Riff", fullText: "Riff", hoverText: "Refrain" },
                        { displayText: "Pont", fullText: "Pont", hoverText: "Bridge" },
                        { displayText: "Intermède", fullText: "Intermède", hoverText: "Interlude" },
                        { displayText: "Interlude", fullText: "Interlude", hoverText: "Interlude" },
                        { displayText: "Pause instr.", fullText: "Pause instrumentale", hoverText: "Instrumental Break" },
                        { displayText: "Vocalises", fullText: "Vocalises", hoverText: "Non-Lyrical Vocals" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "hu": { // Hungarian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "is": { // Icelandic
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "it": { // Italian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "ko": { // Korean
                    Default: [
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Part", fullText: "Part", hoverText: "Part" },
                        { displayText: "Verse", fullText: "Verse", hoverText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus", hoverText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus", hoverText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus", hoverText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain", hoverText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge", hoverText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown", hoverText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude", hoverText: "Interlude" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "la": { // Latin
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "lt": { // Lithuanian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "mn": { // Mongolian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "nl": { // Dutch
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: "Translation", fullText: "Translation", hoverText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Part", fullText: "Part", hoverText: "Part" },
                        { displayText: "Verse", fullText: "Verse", hoverText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus", hoverText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus", hoverText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus", hoverText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain", hoverText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge", hoverText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown", hoverText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude", hoverText: "Interlude" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "no": { // Norwegian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: "Translation", fullText: "Translation", hoverText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Vers", fullText: "Vers", hoverText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus", hoverText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus", hoverText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus", hoverText: "Post-Chorus" },
                        { displayText: "Refreng", fullText: "Refreng", hoverText: "Refrain" },
                        { displayText: "Bro", fullText: "Bro", hoverText: "Bridge" },
                        { displayText: "Mellomspill", fullText: "Mellomspill", hoverText: "Interlude" }
                    ]
                },
                "pl": { // Polish
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Część", fullText: "Część", hoverText: "Part" },
                        { displayText: "Zwrotka", fullText: "Zwrotka", hoverText: "Verse" },
                        { displayText: "Przedrefren", fullText: "Przedrefren", hoverText: "Pre-Chorus" },
                        { displayText: "Refren", fullText: "Refren", hoverText: "Chorus" },
                        { displayText: "Zarefren", fullText: "Zarefren", hoverText: "Post-Chorus" },
                        { displayText: "Przejście", fullText: "Przejście", hoverText: "Bridge" },
                        { displayText: "Interludium", fullText: "Interludium", hoverText: "Interlude" },
                        { displayText: "Przerwa instr.", fullText: "Przerwa instrumentalna", hoverText: "Instrumental Break" },
                        { displayText: "Wokaliza", fullText: "Wokaliza", hoverText: "Non-Lyrical Vocals" },
                    ]
                },
                "ru": { // Russian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Интро", fullText: "Интро", hoverText: "Intro" },
                        { displayText: "Аутро", fullText: "Аутро", hoverText: "Outro" },
                        { displayText: "Скит", fullText: "Скит", hoverText: "Skit" },
                        { displayText: "Часть", fullText: "Часть", hoverText: "Part" },
                        { displayText: "Куплет", fullText: "Куплет", hoverText: "Verse" },
                        { displayText: "Предприпев", fullText: "Предприпев", hoverText: "Pre-Chorus" },
                        { displayText: "Припев", fullText: "Припев", hoverText: "Chorus" },
                        { displayText: "Постприпев", fullText: "Постприпев", hoverText: "Post-Chorus" },
                        { displayText: "Рефрен", fullText: "Рефрен", hoverText: "Refrain" },
                        { displayText: "Бридж", fullText: "Бридж", hoverText: "Bridge" },
                        { displayText: "Брейкдаун", fullText: "Брейкдаун", hoverText: "Breakdown" },
                        { displayText: "Интерлюдия", fullText: "Интерлюдия", hoverText: "Interlude" },
                        { displayText: "Преддроп", fullText: "Преддроп", hoverText: "Build" },
                        { displayText: "Дроп", fullText: "Дроп", hoverText: "Drop" },
                    ]
                },
                "sc": { // Sardinian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "sk": { // Slovak
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Part", fullText: "Part", hoverText: "Part" },
                        { displayText: "Verse", fullText: "Verse", hoverText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus", hoverText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus", hoverText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus", hoverText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain", hoverText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge", hoverText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown", hoverText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude", hoverText: "Interlude" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "sq": { // Albanian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: "Translation", fullText: "Translation", hoverText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Hyrja", fullText: "Hyrja", hoverText: "Intro" },
                        { displayText: "Mbyllja", fullText: "Mbyllja", hoverText: "Outro" },
                        { displayText: "Dialogu", fullText: "Dialogu", hoverText: "Skit" },
                        { displayText: "Pjesa", fullText: "Pjesa", hoverText: "Part" },
                        { displayText: "Strofa", fullText: "Strofa", hoverText: "Verse" },
                        { displayText: "Pararefreni", fullText: "Pararefreni", hoverText: "Pre-Chorus" },
                        { displayText: "Refreni", fullText: "Refreni", hoverText: "Chorus" },
                        { displayText: "Pasrefreni", fullText: "Pasrefreni", hoverText: "Post-Chorus" },
                        { displayText: "Nënrefreni", fullText: "Nënrefreni", hoverText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge", hoverText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown", hoverText: "Breakdown" },
                        { displayText: "Ndërhyrja ", fullText: "Ndërhyrja", hoverText: "Interlude" },
                        { displayText: "Ndë. Instr.", fullText: "Ndërhyrja Instrumentale", hoverText: "Instrumental Break" },
                        { displayText: "Vokale pa Tekst", fullText: "Vokale pa Tekst", hoverText: "Non-Lyrical Vocals" },
                        { displayText: "Yodeling", fullText: "Yodeling", hoverText: "Yodeling" },
                        { displayText: "Scatting", fullText: "Scatting", hoverText: "Scatting" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" },
                    ]
                },
                "sv": { // Swedish
                    Default: [
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Part", fullText: "Part", hoverText: "Part" },
                        { displayText: "Vers", fullText: "Vers", hoverText: "Verse" },
                        { displayText: "Brygga", fullText: "Brygga", hoverText: "Pre-Chorus" },
                        { displayText: "Refräng", fullText: "Refräng", hoverText: "Chorus" },
                        { displayText: "Post-Refräng", fullText: "Post-Refräng", hoverText: "Post-Chorus" },
                        { displayText: "Stick", fullText: "Stick", hoverText: "Bridge" },
                        { displayText: "Mellanspel", fullText: "Mellanspel", hoverText: "Interlude" }
                    ]
                },
                "tr": { // Turkish
                    Rap: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: "Translation", fullText: "Translation", hoverText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Giriş", fullText: "Giriş", hoverText: "Intro" },
                        { displayText: "Çıkış", fullText: "Çıkış", hoverText: "Outro" },
                        { displayText: "Kesit", fullText: "Kesit", hoverText: "Skit" },
                        { displayText: "Kısım", fullText: "Kısım", hoverText: "Part" },
                        { displayText: "Verse", fullText: "Verse", hoverText: "Verse" },
                        { displayText: "Ön Nakarat", fullText: "Ön Nakarat", hoverText: "Pre-Chorus" },
                        { displayText: "Nakarat", fullText: "Nakarat", hoverText: "Chorus" },
                        { displayText: "Arka Nakarat", fullText: "Arka Nakarat", hoverText: "Post-Chorus" },
                        { displayText: "Köprü", fullText: "Köprü", hoverText: "Bridge" },
                        { displayText: "Ara", fullText: "Ara", hoverText: "Interlude" },
                        { displayText: "Enst. Ara", fullText: "Enstrümantal Ara", hoverText: "Instrumental Break" },
                        { displayText: "Enst. Çıkış", fullText: "Enstrümantal Çıkış", hoverText: "Instrumental Outro" }
                    ],
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: "Translation", fullText: "Translation", hoverText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: "Snippet", fullText: "Snippet", hoverText: "Snippet" },
                        { displayText: "Giriş", fullText: "Giriş", hoverText: "Intro" },
                        { displayText: "Çıkış", fullText: "Çıkış", hoverText: "Outro" },
                        { displayText: "Kesit", fullText: "Kesit", hoverText: "Skit" },
                        { displayText: "Kısım", fullText: "Kısım", hoverText: "Part" },
                        { displayText: "Bölüm", fullText: "Bölüm", hoverText: "Verse" },
                        { displayText: "Ön Nakarat", fullText: "Ön Nakarat", hoverText: "Pre-Chorus" },
                        { displayText: "Nakarat", fullText: "Nakarat", hoverText: "Chorus" },
                        { displayText: "Arka Nakarat", fullText: "Arka Nakarat", hoverText: "Post-Chorus" },
                        { displayText: "Köprü", fullText: "Köprü", hoverText: "Bridge" },
                        { displayText: "Ara", fullText: "Ara", hoverText: "Interlude" },
                        { displayText: "Enst. Ara", fullText: "Enstrümantal Ara", hoverText: "Instrumental Break" },
                        { displayText: "Enst. Çıkış", fullText: "Enstrümantal Çıkış", hoverText: "Instrumental Outro" }
                    ]
                },
                "uk": { // Ukrainian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "uz": { // Uzbek
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Kirish", fullText: "Kirish", hoverText: "Intro" },
                        { displayText: "Chiqish", fullText: "Chiqish", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Qism", fullText: "Qism", hoverText: "Part" },
                        { displayText: "Koʻplet", fullText: "Koʻplet", hoverText: "Verse" },
                        { displayText: "Oldinaqarot", fullText: "Oldinaqarot", hoverText: "Pre-Chorus" },
                        { displayText: "Naqarot", fullText: "Naqarot", hoverText: "Chorus" },
                        { displayText: "Keyingi-naqarot", fullText: "Keyingi-naqarot", hoverText: "Post-Chorus" },
                        { displayText: "Refren", fullText: "Refren", hoverText: "Refrain" },
                        { displayText: "Koʻprik", fullText: "Koʻprik", hoverText: "Bridge" },
                        { displayText: "Breykdaun", fullText: "Breykdaun", hoverText: "Breakdown" },
                        { displayText: "Oraliq", fullText: "Oraliq", hoverText: "Interlude" },
                        { displayText: "Cholgʻu qismi", fullText: "Cholgʻu qismi", hoverText: "Instrumental" },
                        { displayText: "Oʻtish", fullText: "Oʻtish", hoverText: "Transition" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "vi": { // Vietnamese
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: "Translation", fullText: "Translation", hoverText: "Translation" },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Intro", fullText: "Intro", hoverText: "Intro" },
                        { displayText: "Outro", fullText: "Outro", hoverText: "Outro" },
                        { displayText: "Skit", fullText: "Skit", hoverText: "Skit" },
                        { displayText: "Part", fullText: "Part", hoverText: "Part" },
                        { displayText: "Verse", fullText: "Verse", hoverText: "Verse" },
                        { displayText: "Pre-Chorus", fullText: "Pre-Chorus", hoverText: "Pre-Chorus" },
                        { displayText: "Chorus", fullText: "Chorus", hoverText: "Chorus" },
                        { displayText: "Post-Chorus", fullText: "Post-Chorus", hoverText: "Post-Chorus" },
                        { displayText: "Refrain", fullText: "Refrain", hoverText: "Refrain" },
                        { displayText: "Bridge", fullText: "Bridge", hoverText: "Bridge" },
                        { displayText: "Breakdown", fullText: "Breakdown", hoverText: "Breakdown" },
                        { displayText: "Interlude", fullText: "Interlude", hoverText: "Interlude" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
                    ]
                },
                "zh-Hant": { // Traditional Chinese
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
                "zh": { // Simplified Chinese
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                    ]
                },
            };

            const langLabels = LABELS[storedLanguage];
            const tagName = songData.primary_tag?.name;
            const buttonLabels = langLabels?.[tagName] || langLabels?.Default || [];

            renderButtons(
                headerDiv,
                buttonLabels.map(b => ({
                    label: b.displayText,
                    fullText: b.fullText,
                    hoverText: b.hoverText
                })),
                (name) => referenceButton.className.replace("EditMetadataButton", `${name}Button`),
                storedLanguage
            );

            explainerElement.parentNode.insertBefore(headerDiv, explainerElement);

            // STYLE BUTTONS
            const styleDiv = createGridContainer("lyricsStyleButtonsContainer");

            const styleButtons = [
                { label: "<i>Italic</i>", openTag: "<i>", closeTag: "</i>", hoverText: "Italic" },
                { label: "<b>Bold</b>", openTag: "<b>", closeTag: "</b>", hoverText: "Bold" },
                { label: "<b><i>Italic + Bold</i></b>", openTag: "<b><i>", closeTag: "</i></b>", hoverText: "Italic+Bold" }
            ];

            renderButtons(
                styleDiv,
                styleButtons,
                (name) => referenceButton.className.replace("EditMetadataButton", `${name}Button`),
                storedLanguage
            );

            explainerElement.parentNode.insertBefore(styleDiv, explainerElement);

        } else {
            // NON-MUSIC STYLE BUTTONS
            const styleDiv = createGridContainer("lyricsStyleButtonsContainer");

            const styleButtons = isGeniusSongExpandSectionsButtons
                ? [
                    { label: "Heading 1", openTag: "<h1>", closeTag: "</h1>", hoverText: "Heading 1" },
                    { label: "Heading 2", openTag: "<h2>", closeTag: "</h2>", hoverText: "Heading 2" },
                    { label: "Heading 3", openTag: "<h3>", closeTag: "</h3>", hoverText: "Heading 3" },
                    { label: "Heading 4", openTag: "<h4>", closeTag: "</h4>", hoverText: "Heading 4" },

                    { label: "Italic", openTag: "<i>", closeTag: "</i>", hoverText: "Italic" },
                    { label: "Bold", openTag: "<b>", closeTag: "</b>", hoverText: "Bold" },
                    { label: "Italic + Bold", openTag: "<b><i>", closeTag: "</i></b>", hoverText: "Italic+Bold" },
                    { label: "Monospace", openTag: "<code>", closeTag: "</code>", hoverText: "Monospace" },

                    { label: "Line-through", openTag: "<del>", closeTag: "</del>", hoverText: "Line-through" },
                    { label: "Underline", openTag: "<ins>", closeTag: "</ins>", hoverText: "Underline" },
                    { label: "Superscript", openTag: "<sup>", closeTag: "</sup>", hoverText: "Superscript" },
                    { label: "Subscript", openTag: "<sub>", closeTag: "</sub>", hoverText: "Subscript" },

                    { label: "Center", openTag: "<center>", closeTag: "</center>", hoverText: "Center" },
                    { label: "Small", openTag: "<small>", closeTag: "</small>", hoverText: "Small" },
                    { label: "Large", openTag: "<big>", closeTag: "</big>", hoverText: "Large" },
                    { label: "Horizontal Rule", openTag: "<hr>", closeTag: "", hoverText: "Horizontal Rule" },

                    { label: "Link", openTag: "[", closeTag: "]()", hoverText: "Link" },
                    { label: "Image", openTag: "<img src=\"", closeTag: "\">", hoverText: "Image" },
                    { label: "Abbreviation", openTag: "<abbr title=\"", closeTag: "\"></abbr>", hoverText: "Abbreviation" },
                    { label: "Preformatted", openTag: "<pre>", closeTag: "</pre>", hoverText: "Preformatted" },

                    { label: "Table", openTag: "<table>", closeTag: "</table>", hoverText: "Table" },
                    { label: "Table Header", openTag: "<th>", closeTag: "</th>", hoverText: "Table Header" },
                    { label: "Table Row", openTag: "<tr>", closeTag: "</tr>", hoverText: "Table Row" },
                    { label: "Table Data", openTag: "<td>", closeTag: "</td>", hoverText: "Table Data" },

                    { label: "Unordered List", openTag: "<ul>", closeTag: "</ul>", hoverText: "Unordered List" },
                    { label: "Ordered List", openTag: "<ol>", closeTag: "</ol>", hoverText: "Ordered List" },
                    { label: "List Item", openTag: "<li>", closeTag: "</li>", hoverText: "List Item" },
                    { label: null, openTag: null, closeTag: null, hoverText: null },

                    { label: "NBSP", openTag: "&nbsp;", closeTag: "", hoverText: "Non-Breaking Space" },
                    { label: "THSP", openTag: "&thinsp;", closeTag: "", hoverText: "Thin Space" },
                    { label: "ZWSP", openTag: "&ZeroWidthSpace;", closeTag: "", hoverText: "Zero-width space" },
                ]
                : [
                    { label: "Heading 1", openTag: "<h1>", closeTag: "</h1>", hoverText: "Heading 1" },
                    { label: "Heading 2", openTag: "<h2>", closeTag: "</h2>", hoverText: "Heading 2" },
                    { label: "Heading 3", openTag: "<h3>", closeTag: "</h3>", hoverText: "Heading 3" },
                    { label: "Heading 4", openTag: "<h4>", closeTag: "</h4>", hoverText: "Heading 4" },

                    { label: "Italic", openTag: "<i>", closeTag: "</i>", hoverText: "Italic" },
                    { label: "Bold", openTag: "<b>", closeTag: "</b>", hoverText: "Bold" },
                    { label: "Italic + Bold", openTag: "<b><i>", closeTag: "</i></b>", hoverText: "Italic+Bold" },
                    { label: "Monospace", openTag: "<code>", closeTag: "</code>", hoverText: "Monospace" },

                    { label: "Line-through", openTag: "<del>", closeTag: "</del>", hoverText: "Line-through" },
                    { label: "Underline", openTag: "<ins>", closeTag: "</ins>", hoverText: "Underline" },
                    { label: "Link", openTag: "[", closeTag: "]()", hoverText: "Link" },
                    { label: "Image", openTag: "<img src=\"", closeTag: "\">", hoverText: "Image" },

                    { label: "Center", openTag: "<center>", closeTag: "</center>", hoverText: "Center" },
                    { label: "Small", openTag: "<small>", closeTag: "</small>", hoverText: "Small" },
                    { label: "Large", openTag: "<big>", closeTag: "</big>", hoverText: "Large" },
                    { label: "Horizontal Rule", openTag: "<hr>", closeTag: "", hoverText: "Horizontal Rule" },

                    { label: "Unordered List", openTag: "<ul>", closeTag: "</ul>", hoverText: "Unordered List" },
                    { label: "Ordered List", openTag: "<ol>", closeTag: "</ol>", hoverText: "Ordered List" },
                    { label: "List Item", openTag: "<li>", closeTag: "</li>", hoverText: "List Item" },
                    { label: "NBSP", openTag: "&nbsp;", closeTag: "", hoverText: "Non-Breaking Space" },
                ];

            renderButtons(
                styleDiv,
                styleButtons,
                (name) => referenceButton.className.replace("EditMetadataButton", `${name}Button`)
            );

            explainerElement.parentNode.insertBefore(styleDiv, explainerElement);
        }
    }

    function lyricsCleanupLogic(cleanupType) {
        const textarea = document.querySelector('textarea[class^="ExpandingTextarea__Textarea"]');
        if (textarea) {
            const originalText = textarea.value;

            let text = textarea.value;

            const storedLanguage = localStorage.getItem("selectedLanguage");

            const replacementsGeneral = {
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
                    if (storedLanguage === 'de') {
                        return i % 2 === 0 ? '„' : '“'; 	// German quotation marks
                    } else if (storedLanguage === 'zh' || storedLanguage === 'zh-Hant') {
                        return i % 2 === 0 ? '《' : '》'; 	// Chinese quotation marks
                    } else if (storedLanguage === 'ru' || storedLanguage === 'uk') {
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

                if (cleanupType === 'general' || cleanupType === 'language') {
                    // Capitalize the first letter at line start and after punctuation (. ! ? ")
                    line = line.replace(/(^|\.\s+|!\s+|\?\s+|\s+"|^\s*")(\w)/g, (match, prefix, char) => {
                        return prefix + char.toUpperCase();
                    });

                    // Capitalize the first letter at line start with HTML tags
                    line = line.replace(/(^|\n|\r)(\s*(?:<[^>]+>\s*)+)([a-zA-Z])/g, (match, prefix, tags, char) => {
                        return prefix + tags + char.toUpperCase();
                    });

                    // Capitalize after opening brackets "("
                    line = line.replace(/(\()\s*(\w)/g, (match, bracket, char) => {
                        return bracket + char.toUpperCase();
                    });

                    // Capitalize after opening brackets "[" at the beginning of the line
                    line = line.replace(/^(\[)\s*(\w)/g, (match, bracket, char) => {
                        return bracket + char.toUpperCase();
                    });

                    // Capitalize after opening brackets "(" with HTML tags in between
                    line = line.replace(/^(\[)\s*((?:<[^>]+>\s*)+)(\w)/g, (match, bracket, tags, char) => {
                        return bracket + tags + char.toUpperCase();
                    });

                    // Capitalize after opening brackets "[" with HTML tags in between at the beginning of the line
                    line = line.replace(/(\()\s*((?:<[^>]+>\s*)+)(\w)/g, (match, bracket, tags, char) => {
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
                        if (storedLanguage === 'en') {
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
    //////////                                 YOUTUBE PLAYER                                 //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function editYouTubePlayer() {
        if (!isGeniusSongYouTubePlayer) {
            const playVideoButton = document.querySelector('[class*="YoutubeButton__PlayVideoButton"]');
            if (playVideoButton) {
                playVideoButton.style.display = 'none';
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                               APPLE MUSIC PLAYER                               //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function editAppleMusicPlayer() {
        console.log("Run editAppleMusicPlayer()");

        function checkAppleMusicPlayer() {
            const iframe = document.querySelector(`iframe[class^="AppleMusicPlayer-desktop__Iframe"]`);
            if (iframe) {
                const playerDocument = iframe.contentDocument;
                const player = playerDocument?.querySelector('apple-music-player');
                if (player) {
                    const titleDiv = player.querySelector('.apple_music_player-player-info-title');
                    const previewTrackAttr = player.getAttribute('preview_track');
                    openAppleMusicUrl(titleDiv, previewTrackAttr);

                    const coverArtImage = player.querySelector('.cover_art-image');
                    const songInfoContainer = player.querySelector('.apple_music_player-player-info');
                    const playButtonContainer = player.querySelector('.apple_music_player-play_button');
                    const appleMusicPlayerLogo = player.querySelector('.apple_music_player-player-logo');
                    return addCopyCoverButton(coverArtImage, songInfoContainer, playButtonContainer, appleMusicPlayerLogo);
                }
            }
            return false;
        }

        function openAppleMusicUrl(titleDiv, previewTrackAttr) {
            if (titleDiv && previewTrackAttr) {
                const previewTrack = JSON.parse(previewTrackAttr.replace(/&quot;/g, '"'));
                const appleId = previewTrack.apple_id;
                const countryCode = previewTrack.country_codes?.[0]?.toLowerCase();

                if (appleId && countryCode) {
                    const appleMusicUrl = `https://music.apple.com/${countryCode}/song/${appleId}`;
                    titleDiv.style.cursor = 'pointer';
                    titleDiv.style.textDecoration = 'none';

                    if (!titleDiv.dataset.listenerAdded) {
                        titleDiv.addEventListener('mouseenter', () => titleDiv.style.textDecoration = 'underline');
                        titleDiv.addEventListener('mouseleave', () => titleDiv.style.textDecoration = 'none');
                        titleDiv.addEventListener('click', (e) => {
                            window.open(appleMusicUrl, '_blank');
                            e.stopPropagation();
                        });
                        titleDiv.dataset.listenerAdded = "true";
                    }
                }
            }
        }

        function addCopyCoverButton(coverArtImage, songInfoContainer, playButtonContainer, appleMusicPlayerLogo) {
            if (isGeniusSongCopyCover) {
                if (coverArtImage && songInfoContainer && playButtonContainer && appleMusicPlayerLogo) {
                    const copyCoverButton = document.createElement('button');
                    copyCoverButton.textContent = 'Copy Cover';
                    copyCoverButton.style.cssText = `
                    background:#fff;color:#222;border:1px solid #222;
                    padding:2px 4px;font-size:12px;cursor:pointer;
                    line-height:2em;margin-right:8px;border-radius:1.25rem;
                `;
                    appleMusicPlayerLogo.parentNode.insertBefore(copyCoverButton, appleMusicPlayerLogo);
                    appleMusicPlayerLogo.remove();

                    copyCoverButton.addEventListener('click', () => {
                        const link = coverArtImage.src;
                        const newLink = link.replace('72x72bb.jpg', '1000x1000bb.png');
                        navigator.clipboard.writeText(newLink).then(() => {
                            const originalText = copyCoverButton.textContent;
                            copyCoverButton.textContent = 'Copied to clipboard';
                            setTimeout(() => copyCoverButton.textContent = originalText, 1500);
                        });
                    });
                    copyCoverButton.addEventListener('mouseover', () => {
                        copyCoverButton.style.backgroundColor = '#111212';
                        copyCoverButton.style.color = '#fff';
                    });
                    copyCoverButton.addEventListener('mouseout', () => {
                        copyCoverButton.style.backgroundColor = '#fff';
                        copyCoverButton.style.color = '#222';
                    });
                }
            }
        }

        if (isGeniusSongAppleMusicPlayer) {
            const observer = new MutationObserver(() => {
                if (checkAppleMusicPlayer()) {
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });

            checkAppleMusicPlayer();
        } else {
            const appleContainer = document.querySelector('div[class*="AppleMusicPlayer-desktop__IframeWrapper-"]');
            if (appleContainer) {
                appleContainer.remove();
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                          SPOTIFY & SOUNDCLOUD PLAYER                           //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    async function addSpotifyPlayer(songData) {
        async function getSpotifySongId(songData) {
            console.log("Run function getSpotifySongId()");

            if (songData.spotify_uuid) {
                loadSpotifyPlayer(songData.spotify_uuid);
            } else {
                const containsCyrillic = text => /[А-Яа-яЁё]/.test(text);
                const containsChinese = text => /[\u4e00-\u9fff]/.test(text);

                let title = songData.title;
                if (containsCyrillic(title) || containsChinese(title)) {
                    title = title.replace(/\s*\([^)]+\)/g, '').replace(/\s*\[[^\]]+\]/g, '');
                }
                const primaryArtists = songData.primary_artists.map(artist => artist.name.replace(/ *\([^)]*\) */g, "").replace(/\u200B/g, "").trim());
                const featuredArtists = songData.featured_artists.map(artist => artist.name.replace(/ *\([^)]*\) */g, "").replace(/\u200B/g, "").trim());
                const searchSets = {
                    title: new Set([title]),
                    primaryArtists: new Set(primaryArtists),
                    featuredArtists: new Set(featuredArtists),
                    allArtists: new Set([...primaryArtists, ...featuredArtists])
                };

                const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + btoa(`${window.secrets.SPOTIFY_CLIENT_ID}:${window.secrets.SPOTIFY_CLIENT_SECRET}`),
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: "grant_type=client_credentials"
                });

                const tokenData = await tokenResponse.json();
                const token = `${tokenData.token_type} ${tokenData.access_token}`;



                let queries = [];

                const allArtistsArr = [...searchSets.allArtists];
                const primaryArtistsArr = [...searchSets.primaryArtists];

                if (featuredArtists.length > 1) {
                    queries.push(`${title} ${allArtistsArr.join(" ")}`);
                }

                if (primaryArtists.length > 1) {
                    queries.push(`${title} ${primaryArtistsArr.join(" ")}`);
                }

                for (const artist of searchSets.allArtists) {
                    queries.push(`${title} ${artist}`);
                }

                const responses = await Promise.all(
                    queries.map(async query => {
                        const params = new URLSearchParams({ query, type: "track", limit: 10 });

                        const result = await fetch(`https://api.spotify.com/v1/search?${params}`, {
                            method: "GET",
                            headers: { "Authorization": token }
                        });
                        return result.json();
                    })
                );

                const allTracks = [
                    ...new Map(
                        responses
                            .flatMap(data => (data.tracks && data.tracks.items ? data.tracks.items : []))
                            .map(track => [track.id, track])
                    ).values()
                ];

                const candidates = findCandidateMatches(allTracks, title, allArtistsArr.join(" "));
                const bestCandidate = selectBestMatch(candidates, title, allArtistsArr);

                if (bestCandidate) {
                    loadSpotifyPlayer(bestCandidate.id);
                }
            }
        }

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

        function normalize(str) {
            return str
                .toLowerCase()                 // convert everything to lowercase
                .replace(/['´‘’]/g, "")        // remove all apostrophe variants
                .replace(/[\-&]/g, " ")        // replace "-" and "&" with spaces
                .replace(/[()]/g, "")          // remove parentheses but keep their content
                .replace(/\u200B/g, "")        // remove zero-width spaces
                .replace(/\s+/g, " ")          // collapse multiple spaces into a single space
                .trim();                       // remove leading and trailing spaces
        }

        function findCandidateMatches(tracks, title, artist) {
            const diff = (a, b) => {
                const aSet = new Set(normalize(a).split(" "));
                const bSet = new Set(normalize(b).split(" "));
                const intersection = new Set([...aSet].filter(x => bSet.has(x)));
                return aSet.size + bSet.size - 2 * intersection.size;
            };

            const target = `${title} ${artist}`;

            const diffs = tracks.map(track => {
                const trackArtists = track.artists.map(a => a.name).join(" ");
                const trackString = `${track.name} ${trackArtists}`;
                const trackDiff = diff(trackString, target);
                return { track, trackDiff };
            });

            const minDiff = Math.min(...diffs.map(d => d.trackDiff));

            return diffs.filter(d => d.trackDiff === minDiff).map(d => d.track);
        }


        function selectBestMatch(tracks, title, artist) {
            let bestTrack = null;
            let bestScore = -Infinity;

            const normalizedTitle = normalize(title);
            const normalizedArtists = artist.map(artist => normalize(artist));

            for (const track of tracks) {
                let score = 0;

                const normalizedTrackTitle = normalize(track.name);
                const normalizedTrackArtists = track.artists.map(a => normalize(a.name));

                const geniusWords = normalizedTitle.split(" ");
                const spotifyWords = normalizedTrackTitle.split(" ");
                const matchCount = geniusWords.filter(word => spotifyWords.includes(word)).length;

                score += matchCount / spotifyWords.length;

                const matches = normalizedArtists.filter(na =>
                    normalizedTrackArtists.some(ta => ta.includes(na))
                ).length;

                score += matches / normalizedTrackArtists.length;

                if (score > bestScore) {
                    bestScore = score;
                    bestTrack = track;
                }
            }
            return bestScore >= 0.75 ? bestTrack : null;
        }

        await getSpotifySongId(songData);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                               SOUNDCLOUD PLAYER                                //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function addSoundCloudPlayer(songData) {

        let isSoundCloudPlaying = false;

        function addSoundCloudButton(songData) {
            console.log("Run function addSoundCloudButton()");

            const soundCloudUrl = songData.soundcloud_url;
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

        addSoundCloudButton(songData);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                     HELPER FOR SPOTIFY & SOUNDCLOUD PLAYER                     //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

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



    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                PLAYER SETTINGS                                 //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

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
        const youtubeButton = document.querySelector('button[class*="YoutubeButton__PlayVideoButton-"]');
        if (youtubeButton) {
            const svgElement = youtubeButton.querySelector('svg');
            svgElement.remove();
            youtubeButton.textContent = 'YouTube';
        }
    }

});
