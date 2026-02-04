chrome.storage.local.get([
    'Services/genius_song.js',
    'isGeniusSongSongPage',
    'isGeniusSongSongPageZwsp',
    'isGeniusSongSongPageInfo',
    'isGeniusSongSongId',
    'isGeniusSongCheckIndex',
    'isGeniusSongFollowButton',
    'isGeniusSongShellyButton',
    'isGeniusSongCleanupMetadataButton',
    'isGeniusSongLanguageButton',
    'isGeniusSongCleanupButton',
    'isGeniusSongSectionsButtons',
    'isGeniusSongExpandSectionsButtons',
    'isGeniusSongAnnotationsButtons',
    'isGeniusSongFilterActivity',
    'isGeniusSongSaveFilters',
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
    const isGeniusSongSongId = result.isGeniusSongSongId ?? false;
    const isGeniusSongCheckIndex = result.isGeniusSongCheckIndex ?? false;
    const isGeniusSongFollowButton = result.isGeniusSongFollowButton ?? true;
    const isGeniusSongShellyButton = result.isGeniusSongShellyButton ?? true;
    const isGeniusSongCleanupMetadataButton = result.isGeniusSongCleanupMetadataButton ?? true;
    const isGeniusSongLanguageButton = result.isGeniusSongLanguageButton ?? true;
    const isGeniusSongCleanupButton = result.isGeniusSongCleanupButton ?? true;
    const isGeniusSongSectionsButtons = result.isGeniusSongSectionsButtons ?? true;
    const isGeniusSongExpandSectionsButtons = result.isGeniusSongExpandSectionsButtons ?? false;
    const isGeniusSongAnnotationsButtons = result.isGeniusSongAnnotationsButtons ?? true;
    const isGeniusSongFilterActivity = result.isGeniusSongFilterActivity ?? true;
    const isGeniusSongSaveFilters = result.isGeniusSongSaveFilters ?? false;
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

        getDomElements();

        editYouTubePlayer();
        editAppleMusicPlayer();


        const { songId, userId, profilePath, songData } = await getSongInfo();

        if (isGeniusSongSongId) showSongIdButton(songId);
        if (isGeniusSongCheckIndex) showIndexButton();

        if (isGeniusSongSongPageInfo) showCoverInfo(songData);
        if (isGeniusSongSongPage) checkSongCover(songData)

        if (isGeniusSongFollowButton) addFollowButton();
        if (isGeniusSongShellyButton) addShellyButton(songData);

        if (isGeniusSongCleanupMetadataButton) cleanupMetadata(userId, songData);

        if (isGeniusSongLanguageButton) selectDropdown(songData, "Language");
        if (isGeniusSongCleanupButton) selectDropdown(songData, "Cleanup");
        if (isGeniusSongSectionsButtons) lyricsSectionsButtons(songData);
        if (isGeniusSongAnnotationsButtons) lyricsAnnotationsButtons();

        if (isGeniusSongFilterActivity) filterRecentActivity();

        if (songData.primary_tag.name !== "Non-Music") {
            if (isGeniusSongSpotifyPlayer) addSpotifyPlayer(songData);
        }
        if (songData.soundcloud_url) {
            if (isGeniusSongSoundCloudPlayer) addSoundCloudPlayer(songData);
        }
    }


    function getDomElements() {
        const metadatastatsContainer = document.querySelector('div[class^="MetadataStats__Container-"]');

        return {
            metadatastatsContainer,
            labelwithiconLabel: metadatastatsContainer?.querySelector('span[class^="LabelWithIcon__Label-"]'),
            adminSpan: [...document.querySelectorAll('span')].find(el => el.textContent.trim() === "Admin"),
            sizedimageImage: document.querySelector('img[class^="SizedImage__Image-"]'),
            songheaderCoverart: document.querySelector('div[class^="SongHeader-desktop__CoverArt-"]'),
            editmetadatabutonSmallbutton: document.querySelector('button[class*="EditMetadataButton__SmallButton-"]'),
            sharebuttonsContainer: document.querySelector('div[class^="ShareButtons__Container-"]'),
            stickytoolbarContainer: document.querySelector('div[class*="StickyToolbar__Container-"]'),
            stickytoolbarLeft: document.querySelector('div[class^="StickyToolbar__Left-"]'),
            stickytoolbarRight: document.querySelector('div[class^="StickyToolbar__Right-"]'),
            stickyNavContainer: document.querySelector('nav[class^="StickyNav-desktop__Container-"]'),
            texteditorTextarea: document.querySelector('textarea[class*="TextEditor__TextArea"]'),
            lyricseditexplainerContainer: document.querySelector('div[class^="LyricsEditExplainer__Container-"]'),
            expandingtextareaTextarea: document.querySelector('textarea[class^="ExpandingTextarea__Textarea-"]'),
            mediaplayerscontainerContainer: document.querySelector('[class^="MediaPlayersContainer__Container-"]'),
            transcriptionplayerContainer: document.querySelector('div[class^="TranscriptionPlayer__Container-"]'),
            youtubebuttonPlayvideobutton: document.querySelector('[class*="YoutubeButton__PlayVideoButton-"]'),
            applemusicplayerPositioningcontainer: document.querySelector('div[class^="AppleMusicPlayer-desktop__PositioningContainer-"]'),
            applemusicplayerIframewrapper: document.querySelector('div[class*="AppleMusicPlayer-desktop__IframeWrapper-"]'),
            applemusicplayerIframe: document.querySelector('iframe[class^="AppleMusicPlayer-desktop__Iframe-"]'),
        };
    }

    async function getSongInfo() {
        console.log("Run function getSongInfo()");
        // Song ID 
        const metaContent = document.querySelector('[property="twitter:app:url:iphone"]')?.content ?? "";
        const parts = metaContent.split("/");
        const songId = parts[2] === "songs" ? parts[3] : null;

        // User ID
        const userMatch = document.documentElement.innerHTML.match(/let current_user = JSON.parse\('{\\"id\\":(\d+)/);
        const userId = userMatch?.[1] ?? null;
        if (userId) chrome.storage.local.set({ userId });

        // Profile Path
        const profileMatch = document.documentElement.innerHTML.match(/\\"profile_path\\":\\"([^"]+)\\"/);
        const profilePath = profileMatch?.[1] ?? null;
        if (profilePath) chrome.storage.local.set({ profilePath });

        // Song Data
        const response = await fetch(`https://genius.com/api/songs/${songId}`);
        const json = await response.json();

        return { songId, userId, profilePath, songData: json.response.song };
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
        const { metadatastatsContainer, labelwithiconLabel } = getDomElements();

        if (metadatastatsContainer && !document.getElementById("song-id-button")) {
            const songIdElement = document.createElement('span');
            songIdElement.id = "song-id-button";
            songIdElement.className = labelwithiconLabel?.className;

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

            metadatastatsContainer.appendChild(songIdElement);
        }
    }

    function showIndexButton() {
        const { adminSpan, metadatastatsContainer, labelwithiconLabel } = getDomElements();

        if (adminSpan && metadatastatsContainer && !document.getElementById("index-button")) {
            const indexElement = document.createElement('span');
            indexElement.id = "index-button";
            indexElement.className = labelwithiconLabel?.className;

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
            metadatastatsContainer.appendChild(indexElement);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                   COVER INFO                                   //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function showCoverInfo(songData) {
        console.log("Run function showCoverInfo()");

        const { sizedimageImage, songheaderCoverart } = getDomElements();

        if (sizedimageImage && songheaderCoverart) {
            const existing = songheaderCoverart.querySelector('p[data-type="resolution-info"]');
            if (existing) existing.remove();

            const infoElement = createResolutionInfo(songData, sizedimageImage);
            songheaderCoverart.prepend(infoElement);
        }
    }

    function createResolutionInfo(songData, sizedimageImage) {
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
            const imgWidth = sizedimageImage.clientWidth || 1000;
            const dynamicFontPx = imgWidth * 0.05;
            const fontSizeRem = Math.min(pxToRem(dynamicFontPx), 0.75);
            resolutionInfo.style.fontSize = `${fontSizeRem}rem`;
            const topRem = -fontSizeRem / 2;
            resolutionInfo.style.top = `${topRem - 0.075}rem`;
        };

        updateStyles();

        const observer = new ResizeObserver(updateStyles);
        observer.observe(sizedimageImage);

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

        const { editmetadatabutonSmallbutton } = getDomElements();

        if (!editmetadatabutonSmallbutton) return;

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

        addColoredCircle(editmetadatabutonSmallbutton, color, borderColor);
        if (isGeniusSongSongPageZwsp) checkSongTitleForZeroWidthSpace(songData);
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
            const { editmetadatabutonSmallbutton } = getDomElements();
            const circle = editmetadatabutonSmallbutton.querySelector('.circle-indicator');
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

        const { sharebuttonsContainer, stickytoolbarLeft, editmetadatabutonSmallbutton } = getDomElements();
        const existingButton = sharebuttonsContainer?.children[3];

        if (existingButton && stickytoolbarLeft && editmetadatabutonSmallbutton && !document.getElementById("follow-song-button")) {
            const followButton = document.createElement('button');
            followButton.id = "follow-song-button";
            followButton.className = editmetadatabutonSmallbutton.className.replace("EditMetadataButton", "FollowButton");
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

            stickytoolbarLeft.appendChild(followButton);
            followButton.style.float = 'right';
            followButton.style.maxWidth = 'fit-content';
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                 SHELLY BUTTON                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    function addShellyButton(songData) {
        console.log("Run function addShellyButton()");

        const { adminSpan } = getDomElements();
        if (!adminSpan) return;

        const dropdownContainer = adminSpan.closest('[class^="Dropdown__Container-"]');
        if (!dropdownContainer) return;

        const list = dropdownContainer.querySelector('[class^="StickyToolbarDropdown__DropdownItems-"]');
        if (!list) return;

        if (document.getElementById("shelly-cleanup-btn")) return;

        const lyricsAreValidated = songData.lyrics_marked_complete_by || songData.lyrics_marked_staff_approved_by || songData.lyrics_verified === true;
        if (lyricsAreValidated) return;

        const existingButton = list.querySelector("button");
        const existingLi = list.querySelector("li");
        if (!existingButton || !existingLi) return;

        const li = document.createElement("li");
        li.className = existingLi.className;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "shelly-cleanup-btn";
        btn.textContent = "Shelly (Cleanup Bot)";
        btn.className = existingButton.className;

        btn.addEventListener("click", async () => {
            const message = "⚠️ Are you absolutely sure you want to run 'Shelly The Cleanup Bot'?";
            if (!confirm(message)) return;

            const payload = {
                text_format: "html,markdown",
                react: true,
                client_timestamps: {
                    updated_by_human_at: songData.updated_by_human_at,
                    lyrics_updated_at: songData.lyrics_updated_at
                },
                lyrics: {
                    body: {
                        html: "Page needs help... Paging ShellPageBot"
                    }
                }
            };

            await updateSongLyrics(songData, payload);

            const toggle = dropdownContainer.querySelector('[class^="Dropdown__Toggle-"]');
            toggle?.click();
            main()
        });

        li.appendChild(btn);
        list.appendChild(li);
    }

    


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                CLEANUP METADATA                                //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function cleanupMetadata(userId, songData) {
        console.log("Run function cleanupMetadata()");
        checkZeroWidthSpaces(songData);
        checkWriterArtists(songData)
        renameAdditionalRoleLabels(songData);
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

    function renameAdditionalRoleLabels(songData) {
        const customPerformances = songData.custom_performances || [];
        let labelsToFix = [];

        const labelCorrections = {
            //"Primary Artists": "Group Members",
            "Trompeta": "Trumpet",
        };

        const updatedCustomPerformances = customPerformances.map(perf => {
            if (labelCorrections[perf.label]) {
                labelsToFix.push(perf.label);
                return { ...perf, label: labelCorrections[perf.label] };
            }
            return perf;
        });

        if (!labelsToFix.length) return;

        const cleanupKey = labelsToFix.map(label => label.replace(/\s+/g, "")).join("And");
        const cleanupTitle = `Fix ${labelsToFix.join(", ")}`;

        addCleanupButton(songData, cleanupKey, cleanupTitle, { custom_performances: updatedCustomPerformances });
    }

    function addCleanupButton(song, actionType, label, metadataUpdate) {

        const { stickytoolbarLeft, editmetadatabutonSmallbutton } = getDomElements();

        if (!stickytoolbarLeft || !editmetadatabutonSmallbutton) return;

        const actionButton = document.createElement('button');
        actionButton.className = editmetadatabutonSmallbutton.className.replace("EditMetadataButton", `${actionType}Button`);
        actionButton.type = 'button';
        actionButton.textContent = label;

        actionButton.addEventListener('click', () => {
            updateSongMetadata(song, metadataUpdate);
            actionButton.style.display = 'none';
            main();
        });

        stickytoolbarLeft.appendChild(actionButton);
    }

      



    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                             LYRICS EDITOR BUTTONS                              //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function selectDropdown(songData, dropdownType) {
        console.log(`Run function selectDropdown() for ${dropdownType} dropdown`);

        const { stickytoolbarLeft } = getDomElements();
        if (!stickytoolbarLeft) return;

        if (document.getElementById(`${dropdownType}-dropdown-container`)) return;

        const dropdownContainer = document.createElement('div');
        dropdownContainer.id = `${dropdownType}-dropdown-container`;
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
        stickytoolbarLeft.appendChild(dropdownContainer);

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
            const { expandingtextareaTextarea } = getDomElements();
            dropdownContainer.style.display = expandingtextareaTextarea ? 'block' : 'none';
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
            //{ code: 'MK', value: 'mk', name: 'Macedonian' },
            { code: 'MN', value: 'mn', name: 'Mongolian' },
            { code: 'NO', value: 'no', name: 'Norwegian' },
            { code: 'PL', value: 'pl', name: 'Polish' },
            { code: 'RU', value: 'ru', name: 'Russian' },
            { code: 'SC', value: 'sc', name: 'Sardinian' },
            //{ code: 'SH-E', value: 'sr', name: 'Serbo-Croatian (ekavica)' },
            //{ code: 'SH-I', value: 'bs', name: 'Serbo-Croatian (ijekavica)' },
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

    function lyricsAnnotationsButtons() {
        const createGridContainer = (id, marginTop = "1.5rem") => {
            const div = document.createElement("div");
            div.id = id;
            div.style.marginTop = marginTop;
            div.style.display = "grid";
            div.style.gridTemplateColumns = "repeat(3, 1fr)";
            div.style.gap = "5px";
            return div;
        };

        const createButton = (label, hoverText, className) => {
            const btn = document.createElement("button");
            btn.style.minWidth = "0";
            btn.style.width = "100%";
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

        const applyTextFormatting = (openTag, closeTag) => {
            const { texteditorTextarea } = getDomElements();
            if (!texteditorTextarea) return;

            const start = texteditorTextarea.selectionStart;
            const end = texteditorTextarea.selectionEnd;

            if (start === end) {
                texteditorTextarea.setRangeText(openTag + closeTag, start, end, "end");
                const cursor = start + openTag.length;
                texteditorTextarea.selectionStart = cursor;
                texteditorTextarea.selectionEnd = cursor;
            } else {
                let selected = texteditorTextarea.value.substring(start, end);
                let trailing = "";

                while (/[ \n\r]$/.test(selected)) {
                    trailing = selected.slice(-1) + trailing;
                    selected = selected.slice(0, -1);
                }

                texteditorTextarea.setRangeText(openTag + selected + closeTag + trailing, start, end, "end");
            }

            texteditorTextarea.focus();
        };

        const renderButtons = (container, buttons, classNameMapper, storedLanguage) => {
            buttons.forEach(({ label, openTag, closeTag, hoverText, fullText }) => {
                const className = classNameMapper(hoverText || fullText);
                const btn = createButton(label, hoverText, className);

                btn.addEventListener("click", () => {
                    if (openTag !== undefined) {
                        applyTextFormatting(openTag, closeTag);
                    } else {
                        insertTextAtCursor(`[${fullText}]`);
                    }
                });

                container.appendChild(btn);
            });
        };

        let observer = new MutationObserver(() => {
            const annotationContainer = [...document.querySelectorAll("div")]
                .find(div => [...div.classList].some(c => c.startsWith("BaseAnnotation-desktop__Container")));

            if (!annotationContainer) return;

            const form = annotationContainer.querySelector("form.AnnotationEditForm-desktop__Form-sc-a3bdbf7b-0");
            if (!form) return;

            if (!form.querySelector("#lyricsStyleButtonsContainer")) {
                injectButtons(form);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        function injectButtons(form) {
            const styleDiv = createGridContainer("lyricsStyleButtonsContainer");

            const styleButtons = [
                { label: "Heading 1", openTag: "#", closeTag: "", hoverText: "Heading 1" },
                { label: "Heading 2", openTag: "##", closeTag: "", hoverText: "Heading 2" },
                { label: "Heading 3", openTag: "###", closeTag: "", hoverText: "Heading 3" },

                { label: "Italic", openTag: "*", closeTag: "*", hoverText: "Italic" },
                { label: "Bold", openTag: "**", closeTag: "**", hoverText: "Bold" },
                { label: "Italic + Bold", openTag: "***", closeTag: "***", hoverText: "Italic+Bold" },

                { label: "Plain Text", openTag: "`", closeTag: "`", hoverText: "Plain Text" },
                { label: "Strike-through", openTag: "<del>", closeTag: "</del>", hoverText: "Strike-through" },
                { label: "Underline", openTag: "<ins>", closeTag: "</ins>", hoverText: "Underline" },

                { label: "Link", openTag: "[", closeTag: "]()", hoverText: "Link" },
                { label: "Center", openTag: "<center>", closeTag: "</center>", hoverText: "Center" },
                { label: "Small", openTag: "<small>", closeTag: "</small>", hoverText: "Small" },

                { label: "Horizontal Rule", openTag: "---", closeTag: "", hoverText: "Horizontal Rule" },
                { label: "Em dash", openTag: "—", closeTag: "", hoverText: "Em dash" },
                //{ label: "NBSP", openTag: "&nbsp;", closeTag: "", hoverText: "Non-Breaking Space" },
            ];

            const { editmetadatabutonSmallbutton } = getDomElements();

            renderButtons(
                styleDiv,
                styleButtons,
                (name) => editmetadatabutonSmallbutton.className.replace("EditMetadataButton", `${name}Button`)
            );

            form.prepend(styleDiv);
        }
    }

    function lyricsSectionsButtons(songData) {
        console.log("Run function lyricsSectionsButtons()");

        const { lyricseditexplainerContainer, editmetadatabutonSmallbutton } = getDomElements();
        if (!lyricseditexplainerContainer || !editmetadatabutonSmallbutton) return;

        if (document.getElementById("lyricsSectionsButtonsContainer") && document.getElementById("lyricsStyleButtonsContainer")) return;

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
            btn.style.minWidth = "0";
            btn.style.width = "100%";
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
            const { expandingtextareaTextarea } = getDomElements();
            if (expandingtextareaTextarea) {
                const startPos = expandingtextareaTextarea.selectionStart;
                const endPos = expandingtextareaTextarea.selectionEnd;

                let beforeText = expandingtextareaTextarea.value.substring(0, startPos).trimEnd();
                const afterText = expandingtextareaTextarea.value.substring(endPos);

                while (!beforeText.endsWith('\n\n')) {
                    beforeText += '\n';
                }

                expandingtextareaTextarea.value = beforeText + text + '\n' + afterText;

                const newCursorPos = beforeText.length + text.length + 1;
                expandingtextareaTextarea.setSelectionRange(newCursorPos, newCursorPos);
                expandingtextareaTextarea.focus();

                expandingtextareaTextarea.value = expandingtextareaTextarea.value.replace(/^\s+/, '');
            }
        };

        function insertSeoHeader(songData, headerType, storedLanguage) {
            const { expandingtextareaTextarea } = getDomElements();
            if (!expandingtextareaTextarea) return;

            const insertText = (text, position = "begin") => {
                expandingtextareaTextarea.focus();
                const currentText = expandingtextareaTextarea.value.trim();

                if (position === "begin" && !currentText.startsWith(text)) {
                    expandingtextareaTextarea.value = text + "\n\n" + currentText;
                    expandingtextareaTextarea.setSelectionRange(text.length + 2, text.length + 2);
                }

                if (position === "end" && !currentText.endsWith(text)) {
                    expandingtextareaTextarea.value = currentText + "\n\n" + text;
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

            // Round brackets
            const hasOpening = songTitle.includes("(");
            const hasClosing = songTitle.includes(")");

            if (hasOpening && !hasClosing) {
                songTitle = songTitle.replace(/\(/g, "&#40;");
            } else if (!hasOpening && hasClosing) {
                songTitle = songTitle.replace(/\)/g, "&#41;");
            }

            // Angle brackets
            const hasLt = songTitle.includes("<") || songTitle.includes("˂");
            const hasGt = songTitle.includes(">") || songTitle.includes("˃");

            if (hasLt && !hasGt) {
                songTitle = songTitle.replace(/[<˂]/g, "&lt;");
            } else if (!hasLt && hasGt) {
                songTitle = songTitle.replace(/[>˃]/g, "&gt;");
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
                    'bs': `[Tekst pjesme „${songTitle}”${featuringText}]`,
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
                    'mk': `[Текст за песната „${songTitle}”${featuringText}]`,
                    'mn': `[«${songTitle}» Үгнүүд${featuringText}]`,
                    'nl': `[Songtekst van "${songTitle}"${featuringText}]`,
                    'no': `[Tekst til «${songTitle}»${featuringText}]`,
                    'pl': `[Tekst piosenki "${songTitle}"${featuringText}]`,
                    'ru': `[Текст песни «${songTitle}»${featuringText}]`,
                    'sc': `[Testu de "${songTitle}"${featuringText}]`,
                    'sk': `[Text skladby „${songTitle}“${featuringText}]`,
                    'sq': `[Teksti i "${songTitle}"${featuringText}]`,
                    'sr': `[Tekst pesme „${songTitle}”${featuringText}]`,
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

            const { expandingtextareaTextarea } = getDomElements();
            if (expandingtextareaTextarea) {
                const oldCursorPos = expandingtextareaTextarea.selectionStart;

                let i = 1;
                const oldValue = expandingtextareaTextarea.value;

                const newValue = oldValue.replace(
                    new RegExp(`<b>\\[${fullText}(?: [IVXLCDM]+)?`, "g"),
                    () => `<b>[${fullText} ${convertToRoman(i++)}`
                );

                expandingtextareaTextarea.value = newValue;

                const diff = newValue.length - oldValue.length;
                const newCursorPos = oldCursorPos + diff;
                expandingtextareaTextarea.focus();
                expandingtextareaTextarea.setSelectionRange(newCursorPos, newCursorPos);
            }
        }

        function insertVerseHeader(fullText) {
            insertTextAtCursor(`[${fullText}]`);

            const { expandingtextareaTextarea } = getDomElements();
            if (expandingtextareaTextarea) {
                const oldCursorPos = expandingtextareaTextarea.selectionStart;

                const oldValue = expandingtextareaTextarea.value;

                const otherTags = ["Part", "Teil", "Część", "Часть", "Pjesa", "Kısım", "Qism"];
                const sectionRegex = new RegExp(
                    `(<b>\\[(?:${otherTags.join('|')})(?: [IVXLCDM]+)?[^<]*<\\/b>)`,
                    "g"
                );
                const ownRegex = new RegExp(`\\[${fullText}(?: \\d+)?(?:: ([^\\]]+))?\\]`, "g");

                const renumberTags = (text) => {
                    const matches = text.match(ownRegex);

                    if (matches && matches.length > 1) {
                        let i = 1;
                        return text.replace(ownRegex, (_, sub) => {
                            return sub
                                ? `[${fullText} ${i++}: ${sub}]`
                                : `[${fullText} ${i++}]`;
                        });
                    }

                    if (matches && matches.length === 1) {
                        return text.replace(ownRegex, (_, sub) => {
                            return sub
                                ? `[${fullText}: ${sub}]`
                                : `[${fullText}]`;
                        });
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
                expandingtextareaTextarea.value = updatedText;

                const diff = updatedText.length - oldValue.length;
                const newCursorPos = oldCursorPos + diff;

                expandingtextareaTextarea.focus();
                expandingtextareaTextarea.setSelectionRange(newCursorPos, newCursorPos);
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
            const { expandingtextareaTextarea } = getDomElements();
            if (!expandingtextareaTextarea) return;

            const start = expandingtextareaTextarea.selectionStart;
            const end = expandingtextareaTextarea.selectionEnd;

            if (start === end) {
                expandingtextareaTextarea.setRangeText(openTag + closeTag, start, end, "end");
                const cursor = start + openTag.length;
                expandingtextareaTextarea.selectionStart = cursor;
                expandingtextareaTextarea.selectionEnd = cursor;
            } else {
                let selected = expandingtextareaTextarea.value.substring(start, end);
                let trailing = "";

                while (/[ \n\r]$/.test(selected)) {
                    trailing = selected.slice(-1) + trailing;
                    selected = selected.slice(0, -1);
                }

                expandingtextareaTextarea.setRangeText(openTag + selected + closeTag + trailing, start, end, "end");
            }

            expandingtextareaTextarea.focus();
        };

        const renderButtons = (container, buttons, classNameMapper, storedLanguage) => {
            buttons.forEach(item => {
                const { label, openTag, closeTag, hoverText, fullText, isDropdown, items } = item;
                const className = classNameMapper(hoverText || fullText);

                const btn = isDropdown
                    ? createDropdownButton(label, hoverText, className, items, storedLanguage)
                    : createButton(label, hoverText, className);

                if (!isDropdown) {
                    btn.addEventListener("click", () => {
                        if (openTag !== undefined) {
                            applyTextFormatting(openTag, closeTag);
                        } else {
                            insertSectionHeader(fullText, hoverText, storedLanguage);
                        }
                    });
                }

                container.appendChild(btn);
            });
        };

        function createDropdownButton(label, hoverText, className, items, storedLanguage) {
            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";

            const btn = document.createElement("button");
            btn.title = hoverText;
            btn.type = "button";
            btn.className = className;

            btn.style.display = "grid";
            btn.style.gridTemplateColumns = "1fr auto";
            btn.style.alignItems = "center";
            btn.style.width = "100%";

            const svgDown = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 7" width="8" height="6.21">
                    <path d="M4.488 7 0 0h8.977L4.488 7Z"></path>
                </svg>`;
            const svgUp = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 8" width="8" height="6.21">
                    <path d="M4.488.5 0 7.5h8.977L4.488.5Z"></path>
                </svg>`;

            const textSpan = document.createElement("span");
            textSpan.textContent = label;
            textSpan.style.justifySelf = "center";

            const iconSpan = document.createElement("span");
            iconSpan.innerHTML = svgDown;
            iconSpan.style.justifySelf = "end";

            btn.appendChild(textSpan);
            btn.appendChild(iconSpan);

            const menu = document.createElement("div");
            menu.style.position = "absolute";
            menu.style.top = "107.5%";
            menu.style.background = "white";
            menu.style.border = "1px solid #000000";
            menu.style.padding = "0.25rem";
            menu.style.display = "none";
            menu.style.zIndex = "9999";
            menu.style.borderRadius = "0.5rem";
            menu.style.width = "100%";
            menu.style.gridTemplateColumns = "repeat(auto-fit, minmax(1rem, 1fr))";
            menu.style.gap = "0.125rem";

            items.forEach(entry => {
                const isObject = typeof entry === "object";

                const label = isObject ? entry.label : entry;
                const openTag = isObject ? entry.openTag : entry;
                const closeTag = isObject ? entry.closeTag ?? "" : "";

                const item = document.createElement("button");
                item.textContent = label;

                item.style.paddingTop = "0.25rem";
                item.style.paddingBottom = "0.25rem";
                item.style.cursor = "pointer";
                item.style.borderRadius = "0.125rem";
                item.style.fontSize = "0.75rem";

                const isSymbolsDropdown = hoverText === "Symbols";
                const wideSymbolsDefault = ["ZWSP", "NBSP", "„...“"];
                const wideSymbolsDE = ["ZWSP", "THSP", "NBSP", "„...“", "–", "—"];

                const wideList = storedLanguage === "de" ? wideSymbolsDE : wideSymbolsDefault;

                if (isSymbolsDropdown && wideList.includes(label)) {
                    item.style.gridColumn = "span 2";
                }

                item.addEventListener("click", () => {
                    applyTextFormatting(openTag, closeTag);
                });

                menu.appendChild(item);
            });

            btn.addEventListener("click", () => {
                const isClosed = menu.style.display === "none";
                menu.style.display = isClosed ? "grid" : "none";
                iconSpan.innerHTML = isClosed ? svgUp : svgDown;
            });

            wrapper.appendChild(btn);
            wrapper.appendChild(menu);
            return wrapper;
        }


        if (!isNonMusic) {
            // SECTION BUTTONS
            const headerDiv = createGridContainer("lyricsSectionsButtonsContainer", "2rem");

            let storedLanguage = localStorage.getItem("selectedLanguage");
            if (storedLanguage === "auto") storedLanguage = songData.language;
            if (!storedLanguage) return;

            const HEADERS = {
                "bg": { // Bulgarian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Въведение", fullText: "Въведение", hoverText: "Intro" },
                        { displayText: "Финал", fullText: "Финал", hoverText: "Outro" },
                        { displayText: null, fullText: null, hoverText: null }, //Skit
                        { displayText: "Част", fullText: "Част", hoverText: "Part" },
                        { displayText: "Куплет", fullText: "Куплет", hoverText: "Verse" },
                        { displayText: "Предприпев", fullText: "Предприпев", hoverText: "Pre-Chorus" },
                        { displayText: "Припев", fullText: "Припев", hoverText: "Chorus" },
                        { displayText: "Следприпев", fullText: "Следприпев", hoverText: "Post-Chorus" },
                        { displayText: "Рефрен", fullText: "Рефрен", hoverText: "Refrain" },
                        { displayText: "Мост", fullText: "Мост", hoverText: "Bridge" },
                    ]
                },
                "bs": { // Serbian (Serbo-Croatian (ijekavica))
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Uvod", fullText: "Uvod", hoverText: "Intro" },
                        { displayText: "Završetak", fullText: "Završetak", hoverText: "Outro" },
                        { displayText: "Skeč", fullText: "Skeč", hoverText: "Skit" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Strofa", fullText: "Strofa", hoverText: "Verse" },
                        { displayText: "Predrefren", fullText: "Predrefren", hoverText: "Pre-Chorus" },
                        { displayText: "Refren", fullText: "Refren", hoverText: "Chorus" },
                        { displayText: "Postrefren", fullText: "Postrefren", hoverText: "Post-Chorus" },
                        { displayText: "Pripev", fullText: "Pripev", hoverText: "Refrain" },
                        { displayText: "Most", fullText: "Most", hoverText: "Bridge" },
                        { displayText: "Interludijum", fullText: "Interludijum", hoverText: "Interlude" },
                        { displayText: "Pauza", fullText: "Pauza", hoverText: "Break" },
                        { displayText: "Uzdizanje", fullText: "Uzdizanje", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
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
                "mk": { // Macedonian
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Увод", fullText: "Увод", hoverText: "Intro" },
                        { displayText: "Завршеток", fullText: "Завршеток", hoverText: "Outro" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Строфа", fullText: "Строфа", hoverText: "Verse" },
                        { displayText: "Предрефрен", fullText: "Предрефрен", hoverText: "Pre-Chorus" },
                        { displayText: "Рефрен", fullText: "Рефрен", hoverText: "Chorus" },
                        { displayText: "Пострефрен", fullText: "Пострефрен", hoverText: "Post-Chorus" },
                        { displayText: "Рефрен", fullText: "Рефрен", hoverText: "Refrain" },
                        { displayText: "Мост", fullText: "Мост", hoverText: "Bridge" },
                        { displayText: "Пауза", fullText: "Пауза", hoverText: "Breakdown" },
                        { displayText: "Инстр. пауза", fullText: "Инструментална пауза", hoverText: "Instrumental" },
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
                        { displayText: "Vok. pa Tekst", fullText: "Vokale pa Tekst", hoverText: "Non-Lyrical Vocals" },
                        { displayText: "Yodeling", fullText: "Yodeling", hoverText: "Yodeling" },
                        { displayText: "Scatting", fullText: "Scatting", hoverText: "Scatting" },
                        { displayText: "Build", fullText: "Build", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" },
                    ]
                },
                "sr": { // Serbian (Serbo-Croatian (ekavica))
                    Default: [
                        { displayText: "Header", fullText: "Header", hoverText: "Header" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Instrumental", fullText: "Instrumental", hoverText: "Instrumental" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Uvod", fullText: "Uvod", hoverText: "Intro" },
                        { displayText: "Završetak", fullText: "Završetak", hoverText: "Outro" },
                        { displayText: "Skeč", fullText: "Skeč", hoverText: "Skit" },
                        { displayText: null, fullText: null, hoverText: null },
                        { displayText: "Strofa", fullText: "Strofa", hoverText: "Verse" },
                        { displayText: "Predrefren", fullText: "Predrefren", hoverText: "Pre-Chorus" },
                        { displayText: "Refren", fullText: "Refren", hoverText: "Chorus" },
                        { displayText: "Postrefren", fullText: "Postrefren", hoverText: "Post-Chorus" },
                        { displayText: "Pripev", fullText: "Pripev", hoverText: "Refrain" },
                        { displayText: "Most", fullText: "Most", hoverText: "Bridge" },
                        { displayText: "Interludijum", fullText: "Interludijum", hoverText: "Interlude" },
                        { displayText: "Pauza", fullText: "Pauza", hoverText: "Break" },
                        { displayText: "Uzdizanje", fullText: "Uzdizanje", hoverText: "Build" },
                        { displayText: "Drop", fullText: "Drop", hoverText: "Drop" }
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
                        { displayText: "Keyingi-naq.", fullText: "Keyingi-naqarot", hoverText: "Post-Chorus" },
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

            const langLabels = HEADERS[storedLanguage];
            const tagName = songData.primary_tag?.name;
            const buttonLabels = langLabels?.[tagName] || langLabels?.Default || [];

            renderButtons(
                headerDiv,
                buttonLabels.map(b => ({
                    label: b.displayText,
                    fullText: b.fullText,
                    hoverText: b.hoverText
                })),
                (name) => editmetadatabutonSmallbutton.className.replace("EditMetadataButton", `${name}Button`),
                storedLanguage
            );

            lyricseditexplainerContainer.parentNode.insertBefore(headerDiv, lyricseditexplainerContainer);

            // STYLE BUTTONS
            const styleDiv = createGridContainer("lyricsStyleButtonsContainer");

            const STYLES = {
                default: [
                    { label: "<i>Italic</i>", openTag: "<i>", closeTag: "</i>", hoverText: "Italic" },
                    { label: "<b>Bold</b>", openTag: "<b>", closeTag: "</b>", hoverText: "Bold" },
                    { label: "<b><i>Italic + Bold</i></b>", openTag: "<b><i>", closeTag: "</i></b>", hoverText: "Italic+Bold" },
                    { label: null, openTag: null, closeTag: null, hoverText: null },
                    {
                        label: "Diacritics",
                        isDropdown: true,
                        hoverText: "Diacritics (uppercase)",
                        items: [
                            "Á", "À", "Â", "Ä",
                            "É", "È", "Ê", "Ë",
                            "Í", "Ì", "Î", "Ï",
                            "Ó", "Ò", "Ô", "Ö",
                            "Ú", "Ù", "Û", "Ü",
                            "Ć", "Ń", "Ś", "Ź",
                            "Č", "Ğ", "Š", "Ž",
                            "Ç", "Ş", "I", "Ñ",
                            "Đ", "Æ", "Œ", "ẞ",
                        ]
                    },
                    {
                        label: "Diacritics",
                        isDropdown: true,
                        hoverText: "Diacritics (lowercase)",
                        items: [
                            "á", "à", "â", "ä",
                            "é", "è", "ê", "ë",
                            "í", "ì", "î", "ï",
                            "ó", "ò", "ô", "ö",
                            "ú", "ù", "û", "ü",
                            "ć", "ń", "ś", "ź",
                            "č", "ğ", "š", "ž",
                            "ç", "ş", "ı", "ñ",
                            "đ", "æ", "œ", "ß",
                        ]
                    },
                    {
                        label: "Symbols",
                        isDropdown: true,
                        hoverText: "Symbols",
                        items: [
                            { label: "(", openTag: "&#40;", closeTag: "" },
                            { label: ")", openTag: "&#41;", closeTag: "" },
                            { label: "<", openTag: "&lt;", closeTag: "" },
                            { label: ">", openTag: "&gt;", closeTag: "" },
                            { label: "–", openTag: "–", closeTag: "" },
                            { label: "—", openTag: "—", closeTag: "" },
                            { label: "„...“", openTag: "„", closeTag: "“" },
                            { label: "ZWSP", openTag: "&ZeroWidthSpace;", closeTag: "" },
                            { label: "NBSP", openTag: "&nbsp;", closeTag: "" },
                        ]
                    }
                ],

                de: {
                    Default: [
                        { label: "<i>Italic</i>", openTag: "<i>", closeTag: "</i>", hoverText: "Italic" },
                        { label: "<b>Bold</b>", openTag: "<b>", closeTag: "</b>", hoverText: "Bold" },
                        { label: "<b><i>Italic + Bold</i></b>", openTag: "<b><i>", closeTag: "</i></b>", hoverText: "Italic+Bold" },
                        { label: null, openTag: null, closeTag: null, hoverText: null },

                        { label: "(<i>Italic</i>)", openTag: "(<i>", closeTag: "</i>)", hoverText: "(<i></i>)" },
                        { label: "(<b>Bold</b>)", openTag: "(<b>", closeTag: "</b>)", hoverText: "(<b></b>)" },
                        { label: "(<b><i>Italic + Bold</i></b>)", openTag: "(<b><i>", closeTag: "</i></b>)", hoverText: "(<b><i></i></b>)" },
                        { label: null, openTag: null, closeTag: null, hoverText: null },

                        {
                            label: "Diacritics",
                            isDropdown: true,
                            hoverText: "Diacritics (uppercase)",
                            items: [
                                "Á", "À", "Â", "Ä",
                                "É", "È", "Ê", "Ë",
                                "Í", "Ì", "Î", "Ï",
                                "Ó", "Ò", "Ô", "Ö",
                                "Ú", "Ù", "Û", "Ü",
                                "Ć", "Ń", "Ś", "Ź",
                                "Č", "Ğ", "Š", "Ž",
                                "Ç", "Ş", "I", "Ñ",
                                "Đ", "Æ", "Œ", "ẞ",
                            ]
                        },
                        {
                            label: "Diacritics",
                            isDropdown: true,
                            hoverText: "Diacritics (lowercase)",
                            items: [
                                "á", "à", "â", "ä",
                                "é", "è", "ê", "ë",
                                "í", "ì", "î", "ï",
                                "ó", "ò", "ô", "ö",
                                "ú", "ù", "û", "ü",
                                "ć", "ń", "ś", "ź",
                                "č", "ğ", "š", "ž",
                                "ç", "ş", "ı", "ñ",
                                "đ", "æ", "œ", "ß",
                            ]
                        },
                        {
                            label: "Symbols",
                            isDropdown: true,
                            hoverText: "Symbols",
                            items: [
                                { label: "(", openTag: "&#40;", closeTag: "" },
                                { label: ")", openTag: "&#41;", closeTag: "" },
                                { label: "<", openTag: "&lt;", closeTag: "" },
                                { label: ">", openTag: "&gt;", closeTag: "" },
                                { label: "ZWSP", openTag: "&ZeroWidthSpace;", closeTag: "" },
                                { label: "–", openTag: "–", closeTag: "" },
                                { label: "THSP", openTag: "&thinsp;", closeTag: "" },
                                { label: "—", openTag: "—", closeTag: "" },
                                { label: "NBSP", openTag: "&nbsp;", closeTag: "" },
                                { label: "„...“", openTag: "„", closeTag: "“" },
                            ]
                        }
                    ]
                },
            };

            const langStyleButtons = STYLES[storedLanguage];
            const styleButtons = langStyleButtons?.Default || STYLES.default;

            renderButtons(
                styleDiv,
                styleButtons,
                (name) => editmetadatabutonSmallbutton.className.replace("EditMetadataButton", `${name}Button`),
                storedLanguage
            );

            lyricseditexplainerContainer.parentNode.insertBefore(styleDiv, lyricseditexplainerContainer);

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

                    { label: "Strike-through", openTag: "<del>", closeTag: "</del>", hoverText: "Strike-through" },
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

                    { label: "Strike-through", openTag: "<del>", closeTag: "</del>", hoverText: "Strike-through" },
                    { label: "Underline", openTag: "<ins>", closeTag: "</ins>", hoverText: "Underline" },
                    { label: "Link", openTag: "[", closeTag: "]()", hoverText: "Link" },
                    { label: "Image", openTag: "<img src=\"", closeTag: "\">", hoverText: "Image" },

                    { label: "Center", openTag: "<center>", closeTag: "</center>", hoverText: "Center" },
                    { label: "Small", openTag: "<small>", closeTag: "</small>", hoverText: "Small" },
                    { label: "Horizontal Rule", openTag: "<hr>", closeTag: "", hoverText: "Horizontal Rule" },
                    { label: "ZWSP", openTag: "&ZeroWidthSpace;", closeTag: "", hoverText: "Zero-width space" },

                    { label: "Unordered List", openTag: "<ul>", closeTag: "</ul>", hoverText: "Unordered List" },
                    { label: "Ordered List", openTag: "<ol>", closeTag: "</ol>", hoverText: "Ordered List" },
                    { label: "List Item", openTag: "<li>", closeTag: "</li>", hoverText: "List Item" },
                    { label: "NBSP", openTag: "&nbsp;", closeTag: "", hoverText: "Non-Breaking Space" },
                ];

            renderButtons(
                styleDiv,
                styleButtons,
                (name) => editmetadatabutonSmallbutton.className.replace("EditMetadataButton", `${name}Button`)
            );

            lyricseditexplainerContainer.parentNode.insertBefore(styleDiv, lyricseditexplainerContainer);
        }
    }

    function lyricsCleanupLogic(cleanupType) {
        const { expandingtextareaTextarea } = getDomElements();

        if (expandingtextareaTextarea) {
            const originalText = expandingtextareaTextarea.value;

            let text = expandingtextareaTextarea.value;

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
                    line = line.replace(
                        /(^|[.!?]\s+|\s+"|^\s*")(\p{L})/gu,
                        (match, prefix, char) => prefix + char.toUpperCase()
                    );
                    //ASCII
                    /*line = line.replace(/(^|\.\s+|!\s+|\?\s+|\s+"|^\s*")(\w)/g, (match, prefix, char) => {
                        return prefix + char.toUpperCase();
                    });*/

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

            expandingtextareaTextarea.value = processedLines.join('\n');

            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
                    expandingtextareaTextarea.value = originalText;
                }
            });
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                RECENT ACTIVITY                                 //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const arrowSvgClosed = createArrowSvg('M4.488 7 0 0h8.977L4.488 7Z');
    const arrowSvgOpen = createArrowSvg('M4.488.5 0 7.5h8.977L4.488.5Z');

    function createArrowSvg(pathData) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 9 7');
        svg.setAttribute('width', '8');
        svg.setAttribute('height', '6.21');
        svg.style.display = "block";

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        svg.appendChild(path);

        return svg;
    }

    const ICONS = {
        svgUpvoted: `
            <svg data-icon-upvoted width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.62 21.36">
                <path d="M16.52 21.29H6V8.5l.84-.13a3.45 3.45 0 0 0 1.82-1.09 13.16 13.16 0 0 0 .82-1.85c1.06-2.69 2-4.78 3.52-5.31a2.06 2.06 0 0 1 1.74.17c2.5 1.42 1 5 .16 6.95-.11.27-.25.6-.31.77a.78.78 0 0 0 .6.36h4.1a2.29 2.29 0 0 1 2.37 2.37c0 .82-1.59 5.4-2.92 9.09a2.39 2.39 0 0 1-2.22 1.46zm-8.52-2h8.56a.48.48 0 0 0 .31-.17c1.31-3.65 2.73-7.82 2.79-8.44 0-.22-.1-.32-.37-.32h-4.1A2.61 2.61 0 0 1 12.54 8 4.29 4.29 0 0 1 13 6.46c.45-1.06 1.64-3.89.7-4.43-.52 0-1.3 1.4-2.38 4.14a10 10 0 0 1-1.13 2.38A5.28 5.28 0 0 1 8 10.11zM0 8.4h4.86v12.96H0z"></path>
            </svg>`,
        svgDownvoted: `
            <svg data-icon-downvoted width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.62 21.36">
                <path d="M8 21.36a2.12 2.12 0 0 1-1.06-.29c-2.5-1.42-1-5-.16-6.95.11-.27.25-.6.31-.77a.78.78 0 0 0-.6-.36H2.37A2.29 2.29 0 0 1 0 10.64c0-.82 1.59-5.4 2.92-9.09A2.39 2.39 0 0 1 5.1.07h10.56v12.79l-.84.13A3.45 3.45 0 0 0 13 14.08a13.16 13.16 0 0 0-.82 1.85c-1.06 2.69-2 4.79-3.49 5.31a2.06 2.06 0 0 1-.69.12zM5.1 2.07a.48.48 0 0 0-.31.17C3.48 5.89 2.07 10.06 2 10.68c0 .22.1.32.37.32h4.1a2.61 2.61 0 0 1 2.61 2.4 4.29 4.29 0 0 1-.48 1.51c-.46 1.09-1.65 3.89-.7 4.42.52 0 1.3-1.4 2.38-4.14a10 10 0 0 1 1.13-2.38 5.27 5.27 0 0 1 2.25-1.56V2.07zM16.76 0h4.86v12.96h-4.86z"></path>
            </svg>`,
        svgPinned: `
            <svg data-icon-pinned width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.82 22">
                <path d="M21.82 20.62L17 15.83l3.59-3.59-3.04-3.07-3.36.12-4.1-4.1v-3L7.91 0 0 7.91l2.16 2.16 2.84.18 4.1 4.12-.1 3.36 3.08 3.08 3.59-3.59L20.43 22zM11 16.94l.12-3.36-5.27-5.24L3 8.16l-.25-.25 5.16-5.14.22.23v3l5.27 5.27 3.36-.12 1.09 1.09L12.06 18z"></path>
            </svg>`,
        svgUnpinned: `
            <svg data-icon-unpinned width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.82 22">
                <path d="M21.82 20.62L17 15.83l3.59-3.59-3.04-3.07-3.36.12-4.1-4.1v-3L7.91 0 0 7.91l2.16 2.16 2.84.18 4.1 4.12-.1 3.36 3.08 3.08 3.59-3.59L20.43 22zM11 16.94l.12-3.36-5.27-5.24L3 8.16l-.25-.25 5.16-5.14.22.23v3l5.27 5.27 3.36-.12 1.09 1.09L12.06 18z"></path>
            </svg>`,
        svgLocked: `
            <svg data-icon-locked width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.08 22">
                <path d="M15.08 10.86V20H2v-9.14h13.08M8.54 0a6.31 6.31 0 0 0-6.31 6.31v2.55H0V22h17.08V8.86h-2.23V6.31A6.31 6.31 0 0 0 8.54 0zM4.63 8.86V6.31a3.91 3.91 0 0 1 7.81 0v2.55z"></path>
            </svg>`,
        svgUnlocked: `
            <svg data-icon-unlocked width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.56 22">
                <path d="M14.56 11.26V20H2v-8.74h12.56M8.28 0a6.12 6.12 0 0 0-6.12 6.12v3.14H0V22h16.56V9.26H4.49V6.12a3.79 3.79 0 0 1 7.58 0h2.33A6.12 6.12 0 0 0 8.28 0z"></path>
            </svg>`,
        svgAccepted: `
            <svg data-icon-accepted width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 16.2">
                <path d="M8.83 16.2L0 7.97l2.06-2.21 6.62 6.17L19.79 0 22 2.06 8.83 16.2"></path>
            </svg>`,
        svgRejected: `
            <svg data-icon-deleted width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                <path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path>
            </svg>`,
        svgRecognized: `
            <svg data-icon-recognized width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.4 22">
                <path d="M15.47 1.92v18.16H1.92V1.92h13.55M17.4 0H0v22h17.4V0z"></path>
                <path d="M5.11 6.45h7.82v1.44H5.11zm0 8.1h7.82v1.44H5.11zm0-4.05h7.82v1.44H5.11z"></path>
            </svg>`,
        svgMerged: `
            <svg data-icon-merged width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.59 22">
                <path d="M16.76 5.87v14.3H6.22V5.87h10.54M18.59 4H4.39v18h14.2V4z"></path>
                <path d="M7.73 8.45h7.44V9.9H7.73zm0 7.7h7.44v1.45H7.73zm0-3.85h7.44v1.45H7.73z"></path>
                <path d="M3.45 19.89H0V0h16.13v3.12H14.2V1.93H1.93v16.03h1.52v1.93"></path>
            </svg>`,
        svgCreated: `
            <svg data-icon-created width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                <path d="M15 10.47h1.7v4.3h-4.4v-3.75c0-2.78.63-5.3 4.39-5.52v2.22c-1.26 0-1.69.88-1.69 2.75zm-7 0h1.7v4.3H5.3v-3.75c0-2.78.63-5.3 4.39-5.52v2.22C8.43 7.72 8 8.6 8 10.47z"></path>
                <path d="M20.09 1.91v18.18H1.91V1.91h18.18M22 0H0v22h22V0z"></path>
            </svg>`,
        svgEdited: `
            <svg data-icon-edited width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 19">
                <path d="M17.51 5.827c.654-.654.654-1.636 0-2.29L14.563.59c-.655-.655-1.637-.655-2.291 0L0 12.864V18.1h5.236L17.51 5.827Zm-4.092-4.09 2.946 2.945-2.455 2.454-2.945-2.945 2.454-2.455ZM1.636 16.463v-2.946l8.182-8.182 2.946 2.946-8.182 8.182H1.636Z"></path>
            </svg>`,
        svgSuggested: `
            <svg data-icon-added_a_suggestion_to width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.2 22">
                <path d="M19.29 1.91v11.46H7.69l-.57.7L5 16.64v-3.27H1.91V1.91h17.38M21.2 0H0v15.28h3.12V22l5.48-6.72h12.6V0z"></path>
                <path d="M4.14 4.29h12.93V6.2H4.14zm0 4.09h12.93v1.91H4.14z"></path>
            </svg>`,
        svgFollowed: `
            <svg data-icon-followed width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 15.45">
                <path d="M11 2c4 0 7.26 3.85 8.6 5.72-1.34 1.87-4.6 5.73-8.6 5.73S3.74 9.61 2.4 7.73C3.74 5.86 7 2 11 2m0-2C4.45 0 0 7.73 0 7.73s4.45 7.73 11 7.73 11-7.73 11-7.73S17.55 0 11 0z"></path>
                <path d="M11 5a2.73 2.73 0 1 1-2.73 2.73A2.73 2.73 0 0 1 11 5m0-2a4.73 4.73 0 1 0 4.73 4.73A4.73 4.73 0 0 0 11 3z"></path>
            </svg>`,
        svgHid: `
            <svg data-icon-followed width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 15.45">
                <path d="M11 2c4 0 7.26 3.85 8.6 5.72-1.34 1.87-4.6 5.73-8.6 5.73S3.74 9.61 2.4 7.73C3.74 5.86 7 2 11 2m0-2C4.45 0 0 7.73 0 7.73s4.45 7.73 11 7.73 11-7.73 11-7.73S17.55 0 11 0z"></path>
                <path d="M11 5a2.73 2.73 0 1 1-2.73 2.73A2.73 2.73 0 0 1 11 5m0-2a4.73 4.73 0 1 0 4.73 4.73A4.73 4.73 0 0 0 11 3z"></path>
                <path d="M0 14.45 L1.8 15.45 L22 1 L20.2 0 Z"></path>
            </svg>`,
        svgPyonged: `
            <svg data-icon-pyonged width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11.37 22">
                <path d="M0 7l6.16-7 3.3 7H6.89S5.5 12.1 5.5 12.17h5.87L6.09 22l.66-7H.88l2.89-8z"></path>
            </svg>`,
        svgPageviews: `
            <svg data-icon-pageviews width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18">
                <path d="M3.33494 0C3.33494 0 4.09484 1.88505 3.82154 4.2567C3.54779 6.62835 0.236392 9.669 0.250042 12.6792C0.263692 15.6894 5.14004 18 5.14004 18C5.14004 18 4.03634 16.0332 5.97389 12.7953C5.97389 12.7953 8.21519 14.3668 7.98599 15.7594C7.74464 17.2239 6.60914 18 6.60914 18C6.60914 18 13.4295 17.1792 13.4899 11.676C13.551 6.1722 9.49469 2.73315 9.49469 2.73315C9.49469 2.73315 9.94184 4.95165 8.72384 6.97485C8.72384 6.97485 5.67599 0.7605 3.33494 0ZM5.38739 4.30215C6.08369 5.3508 6.77669 6.5532 7.32239 7.66335L8.58509 10.2348L10.0626 7.78005C10.285 7.4103 10.4641 7.0371 10.6069 6.66915C11.3284 7.9623 11.9508 9.6618 11.9287 11.6584C11.9079 13.524 10.786 14.681 9.55904 15.3902C9.44159 13.4235 7.33139 11.8395 6.87059 11.5164L5.49629 10.5534L4.63394 11.9932C3.95714 13.1242 3.58724 14.1443 3.40754 15.03C2.53679 14.3027 1.81514 13.4493 1.81199 12.672C1.80614 11.4366 2.69579 9.9708 3.55619 8.5536C4.40819 7.1514 5.21219 5.8263 5.37299 4.4358C5.37824 4.39095 5.38274 4.34625 5.38739 4.30215Z"></path>
            </svg>`,




        svgMarked: `
            <svg data-icon-marked width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="64 0 20 20">
                <circle cx="74" cy="10" r="9"></circle>
            </svg>`,
        svgVerified: `
            <svg data-icon-user width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
                <path d="M0 0h11v11H0z"></path>
                <path fill="#FFF" d="M4.764 5.9l-2-2L1.35 5.314l3.414 3.414 4.914-4.914L8.264 2.4"></path>
            </svg>`,
        svgGenius: `
            <svg data-icon-user width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g transform="scale(0.95) translate(0.63,0.63)">
                    <path d="M12.897 1.235c-.36.001-.722.013-1.08.017-.218-.028-.371.225-.352.416-.035 1.012.023 2.025-.016 3.036-.037.841-.555 1.596-1.224 2.08-.5.345-1.118.435-1.671.663.121.78.434 1.556 1.057 2.07 1.189 1.053 3.224.86 4.17-.426.945-1.071.453-2.573.603-3.854.286-.48.937-.132 1.317-.49-.34-1.249-.81-2.529-1.725-3.472a11.125 11.125 0 00-1.08-.04zm-10.42.006C.53 2.992-.386 5.797.154 8.361c.384 2.052 1.682 3.893 3.45 4.997.134-.23.23-.476.09-.73-.95-2.814-.138-6.119 1.986-8.19.014-.986.043-1.976-.003-2.961l-.188-.214c-1.003-.051-2.008 0-3.01-.022zm17.88.055l-.205.356c.265.938.6 1.862.72 2.834.58 3.546-.402 7.313-2.614 10.14-1.816 2.353-4.441 4.074-7.334 4.773-2.66.66-5.514.45-8.064-.543-.068.079-.207.237-.275.318 2.664 2.629 6.543 3.969 10.259 3.498 3.075-.327 5.995-1.865 8.023-4.195 1.935-2.187 3.083-5.07 3.125-7.992.122-3.384-1.207-6.819-3.636-9.19z"></path>
                </g>
            </svg>`,
    }

    function filterRecentActivity() {
        console.log("Run function filterRecentActivity()");

        const { svgUpvoted, svgDownvoted, svgPinned, svgUnpinned, svgLocked, svgUnlocked, svgAccepted, svgRejected, svgRecognized, svgMerged, svgCreated, svgEdited, svgSuggested, svgFollowed, svgHid, svgPyonged, svgPageviews, svgMarked, svgVerified, svgGenius } = ICONS;

        const FILTERS = [
            { key: "metadata", label: "METADATA", color: "#000000", svg: svgGenius },
            { key: "annotations", label: "ANNOTATIONS", color: "#000000", svg: svgGenius },
            { key: "votes", label: "VOTES", color: "#000000", svg: svgGenius },
            { key: "lyrics", label: "LYRICS", color: "#000000", svg: svgGenius },
            { key: "q_and_a", label: "Q&A", color: "#000000", svg: svgGenius },
            { key: "other", label: "OTHER", color: "#000000", svg: svgGenius },
        ];

        const SUBFILTERS = {
            votes: [
                { key: "votes__upvoted", label: "Upvotes", regex: /.*? upvoted/i, color: "#0ecb27", svg: svgUpvoted },
                { key: "votes__downvoted", label: "Downvotes", regex: /.*? downvoted/i, color: "#ff1414", svg: svgDownvoted },
            ],

            other: [
                { key: "other__locked", label: "Locked / Unlocked", regex: /.*? (locked|unlocked)/i, color: "#9a9a9a", svg: svgLocked },
                { key: "other__hid", label: "Hid / Unhid", regex: /.*? (hid|unhid)/i, color: "#9a9a9a", svg: svgHid },
                { key: "other__followed", label: "Followed", regex: /.*? followed/i, color: "#9a9a9a", svg: svgFollowed },
                { key: "other__pyonged", label: "Pyonged", regex: /.*? pyonged($| an annotation on)/i, color: "#9a9a9a", svg: svgPyonged },
                { key: "other__pageviews", label: "Pageviews", regex: /.*pageviews\)\s*$/i, color: "#9a9a9a", svg: svgPageviews },
            ],

            q_and_a: [
                { key: "q_and_a__edited", label: "Q&A Edits", regex: /.*? edited .*?(question|answer) on/i, color: "#9a9a9a", svg: svgEdited },
                { key: "q_and_a__asked_answered", label: "Asked / Answered", regex: /.*?(asked a question|answered a question) on/i, color: "#9a9a9a", svg: svgCreated },
                { key: "q_and_a__pinned_unpinned", label: "Pinned / Unpinned", regex: /.*? (pinned|unpinned) .*? question on/i, color: "#0ecb27", svg: svgPinned },
                { key: "q_and_a__archived_cleared", label: "Archived / Cleared", regex: /.*?(archived .*? question|cleared .*? answer) on/i, color: "#ff1414", svg: svgRejected }
            ],

            annotations: [
                { key: "annotations__annotation", label: "Annotations", regex: /.*?\s(?:created an annotation on|edited an annotation on|proposed an edit to an annotation on|accepted an annotation on|merged\s.*?'?s?\sannotation edit on|deleted an annotation on|rejected an annotation on|rejected\s.*?'?s?\sannotation edit on|marked an annotation on|replied to an annotation on)/i, color: "#9a9a9a", svg: svgCreated },
                { key: "annotations__bio", label: "Song bios", regex: /.*?\s(?:created a song bio on|edited the song bio on|proposed an edit to the song bio on|accepted the song bio on|rejected the song bio on|marked the song bio on)/i, color: "#9a9a9a", svg: svgCreated },
                { key: "annotations__suggestion", label: "Suggestions", regex: /.*?\s(?:added a suggestion to an annotation on|added a suggestion to the song bio on|added a suggestion to$|integrated\s.*?'?s?\ssuggestion|archived\s.*?'?s?\ssuggestion|rejected a suggestion)/i, color: "#9a9a9a", svg: svgSuggested },
            ],

            lyrics: [
                { key: "lyrics__edited_lyrics", label: "Lyric edits", regex: /.*? edited the lyrics of/i, color: "#9a9a9a", svg: svgEdited },
                { key: "lyrics__lep", label: "Lyric edit proposals", regex: /.*? (rejected .*?|created a|accepted .*?|automatically archived .*?) lyrics edit proposal on/i, color: "#9a9a9a", svg: svgEdited },
                { key: "lyrics__marked", label: "Marked real", regex: /.*?(marked as a real song|thanks! we've been looking for the lyrics to)/i, color: "#38ef51", svg: svgRecognized },
                { key: "lyrics__verified", label: "(Un)verified lyrics", regex: /.*? (verified|unverified) the lyrics of/i, color: "#38ef51", svg: svgVerified },
                { key: "lyrics__complete", label: "(Un)completed lyrics", regex: /.*? (marked|un-?marked) the lyrics complete on/i, color: "#0ecb27", svg: svgAccepted }
            ],

            metadata: [
                { key: "metadata__edited_metadata", label: "Metadata edits", regex: /.*? edited the metadata of/i, color: "#9a9a9a", svg: svgEdited },
                { key: "metadata__created", label: "Song creation", regex: /.*? created$/i, color: "#9a9a9a", svg: svgCreated }
            ]
        };

        const ALL_SUBFILTERS = Object.values(SUBFILTERS).flat();

        const STORAGE_KEY = "geniusRecentActivityFilters";

        let savedStates = {
            filters: {},
            userText: ""
        };

        let currentUIState = {
            checkboxes: null,
            userInput: null
        };

        let filterInitialized = false;
        let iframeObserverInitialized = false;


        function saveStateToStorage() {
            if (!isGeniusSongSaveFilters) return;

            chrome.storage.local.set({
                [STORAGE_KEY]: {
                    filters: savedStates.filters,
                    userText: savedStates.userText
                }
            });
        }

        function loadStateFromStorage(callback) {
            if (!isGeniusSongSaveFilters) {
                callback();
                return;
            }

            chrome.storage.local.get(STORAGE_KEY, data => {
                if (data && data[STORAGE_KEY]) {
                    const stored = data[STORAGE_KEY];
                    savedStates.filters = stored.filters || {};
                    savedStates.userText = stored.userText || "";
                }
                callback();
            });
        }


        function filterItems(items, filters, userText) {
            const username = userText?.trim().toLowerCase();
            const usernameRegex = username
                ? new RegExp(`\\b${username}\\b`, "i")
                : null;

            items.forEach(item => {
                let visible = true;

                const span = item.querySelector('.inbox_line_item-content span');
                if (!span) return;

                const clone = span.cloneNode(true);
                clone.querySelectorAll(
                    "em, .inbox_line_item-content-note, [ng-bind-html]"
                ).forEach(el => el.remove());

                const text = clone.innerText
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, " ");

                const match = ALL_SUBFILTERS.find(sf => sf.regex.test(text));

                if (match) {
                    const enabled = filters[match.key] ?? true;
                    if (!enabled) visible = false;
                }

                if (visible && filters.user && usernameRegex) {
                    if (!usernameRegex.test(text)) visible = false;
                }

                const inboxItem = item.closest("inbox-line-item");
                if (inboxItem) {
                    inboxItem.style.display = visible ? "" : "none";
                }
            });
        }

        function getActivityItems() {
            const iframe = document.querySelector('iframe[class^="PlaceholderSpinnerIframe__Iframe"]');
            if (!iframe) return null;

            const doc = iframe.contentDocument || iframe.contentWindow.document;
            if (!doc) return null;

            return doc.querySelectorAll('div[class^="feed_dropdown-item"]');
        }

        function applyActivityFilter(checkboxes, userInput) {
            const states = {};
            checkboxes.forEach(cb => {
                states[cb.dataset.filter] = cb.checked;
            });

            savedStates.filters = { ...savedStates.filters, ...states };
            savedStates.userText = userInput.value;
            saveStateToStorage();

            const items = getActivityItems();
            if (!items) return;

            filterItems(items, savedStates.filters, savedStates.userText);
        }

        function applyActivityFilterFromState() {
            if (!currentUIState.checkboxes || !currentUIState.userInput) return;
            applyActivityFilter(
                currentUIState.checkboxes,
                currentUIState.userInput
            );
        }

        function applyActivityFilterFromSavedState() {
            const items = getActivityItems();
            if (!items) return;

            filterItems(items, savedStates.filters, savedStates.userText);
        }


        function flexRow(el) {
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.gap = "6px";
            el.style.cursor = "pointer";
        }

        function createIconSpan(key, svg) {
            const span = document.createElement("span");
            span.dataset.icon = key;
            span.style.display = "inline-flex";
            span.innerHTML = svg;
            return span;
        }

        function updateIconColors(dropdown, FILTERS) {
            FILTERS.forEach(f => {
                const cb = dropdown.querySelector(`input[data-filter="${f.key}"]`);
                const icon = dropdown.querySelector(`[data-icon="${f.key}"] svg`);
                if (cb && icon) icon.setAttribute("fill", cb.checked ? f.color : "#ddd");
            });

            ALL_SUBFILTERS.forEach(sf => {
                const cb = dropdown.querySelector(`input[data-filter="${sf.key}"]`);
                const icon = dropdown.querySelector(`[data-icon="${sf.key}"] svg`);
                if (cb && icon) icon.setAttribute("fill", cb.checked ? sf.color : "#ddd");
            });

            const userCb = dropdown.querySelector('input[data-filter="user"]');
            const userIcon = dropdown.querySelector('[data-icon="user"] svg');
            if (userIcon && userCb) userIcon.setAttribute("fill", userCb.checked ? "#000" : "#ddd");
        }


        function createFilterGrid(FILTERS, svgGenius) {
            const grid = document.createElement("div");
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = "repeat(3, 1fr)";
            grid.style.gap = "6px 12px";
            grid.style.marginBottom = "10px";

            FILTERS.forEach(f => {
                const wrapper = document.createElement("div");
                wrapper.className = "filter-category";

                const masterLabel = document.createElement("label");
                flexRow(masterLabel);
                masterLabel.style.fontWeight = "600";

                const masterCb = document.createElement("input");
                masterCb.type = "checkbox";
                masterCb.dataset.filter = f.key;
                masterCb.classList.add("master-filter");
                masterCb.style.display = "none";

                const masterIcon = createIconSpan(f.key, f.svg);

                masterLabel.appendChild(masterCb);
                masterLabel.appendChild(masterIcon);
                masterLabel.append(f.label);

                wrapper.appendChild(masterLabel);

                const sub = document.createElement("div");
                sub.className = "subfilters";


                SUBFILTERS[f.key].forEach(sf => {
                    const subLabel = document.createElement("label");
                    flexRow(subLabel);
                    subLabel.style.fontSize = "0.9em"
                        ;
                    const subCb = document.createElement("input");
                    subCb.type = "checkbox";
                    subCb.dataset.filter = sf.key;
                    subCb.classList.add("subfilter");
                    subCb.style.display = "none";

                    const subIcon = createIconSpan(sf.key, sf.svg);

                    subLabel.appendChild(subCb);
                    subLabel.appendChild(subIcon);
                    subLabel.append(sf.label);

                    sub.appendChild(subLabel);
                });

                wrapper.appendChild(sub);
                grid.appendChild(wrapper);
            });


            const userWrapper = document.createElement("div");
            userWrapper.className = "filter-category";
            userWrapper.style.gridColumn = "1 / span 3";

            const userLabel = document.createElement("label");
            userLabel.style.display = "flex";
            userLabel.style.alignItems = "center";
            userLabel.style.gap = "6px";
            userLabel.style.cursor = "pointer";

            const userCb = document.createElement("input");
            userCb.type = "checkbox";
            userCb.dataset.filter = "user";
            userCb.classList.add("master-filter");
            userCb.style.display = "none";

            const userIcon = createIconSpan("user", svgGenius);

            const userText = document.createElement("span");
            userText.textContent = "USER";
            userText.style.fontWeight = "600";

            const userInput = document.createElement("input");
            userInput.id = "activity-filter-text";
            userInput.placeholder = "User name";
            userInput.style.flex = "1";
            userInput.style.padding = "6px";
            userInput.style.border = "1px solid #ccc";
            userInput.style.borderRadius = "4px";

            userLabel.appendChild(userCb);
            userLabel.appendChild(userIcon);
            userLabel.appendChild(userText);
            userLabel.appendChild(userInput);

            userWrapper.appendChild(userLabel);
            grid.appendChild(userWrapper);
            return grid;
        }

        function addActivityFilterButton() {
            const title = document.querySelector('[class^="RecentActivity__Title"]');
            if (!title) return;

            if (document.getElementById("filter-activity-button")) return;

            const referenceButton = document.querySelector('button[class^="SmallButton__Container"]');
            if (!referenceButton) return;

            const parent = title.parentNode;

            let wrapper = parent.querySelector('.activity-filter-wrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = "activity-filter-wrapper";
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.justifyContent = 'center';
                wrapper.style.position = 'relative';
                parent.insertBefore(wrapper, title);
                wrapper.appendChild(title);
            }

            const controlContainer = document.createElement("div");
            controlContainer.style.position = "absolute";
            controlContainer.style.right = "0";
            controlContainer.style.top = "25%";
            controlContainer.style.transform = "translateY(-50%)";
            controlContainer.style.display = "flex";
            controlContainer.style.alignItems = "center";
            wrapper.appendChild(controlContainer);

            const counterSpan = document.createElement("span");
            counterSpan.id = "activity-item-count";
            counterSpan.style.marginRight = "0.75rem";
            counterSpan.textContent = "Pages: ...";
            controlContainer.appendChild(counterSpan);

            const filterButton = document.createElement('button');
            filterButton.id = "filter-activity-button";
            filterButton.type = "button";
            filterButton.className = referenceButton.className;

            const arrowSpan = document.createElement("span");
            arrowSpan.style.display = "inline-flex";
            arrowSpan.style.alignItems = "center";
            arrowSpan.style.justifyContent = "center";
            arrowSpan.style.marginLeft = "0.375rem";
            arrowSpan.appendChild(arrowSvgClosed.cloneNode(true));

            filterButton.append("Filter ", arrowSpan);
            controlContainer.appendChild(filterButton);

            const toggleAllButton = document.createElement("button");
            toggleAllButton.id = "activity-filter-toggle-all";
            toggleAllButton.className = referenceButton.className;
            toggleAllButton.textContent = "All / None";
            toggleAllButton.style.position = "absolute";
            toggleAllButton.style.left = "0";
            toggleAllButton.style.top = "25%";
            toggleAllButton.style.transform = "translateY(-50%)";
            toggleAllButton.style.display = "none";
            wrapper.appendChild(toggleAllButton);

            filterButton.addEventListener("click", () => {
                let dropdown = document.getElementById("activity-filter-dropdown");

                if (dropdown) {
                    const isClosed = dropdown.style.display === "none";
                    dropdown.style.display = isClosed ? "block" : "none";

                    arrowSpan.replaceChildren(
                        isClosed ? arrowSvgOpen.cloneNode(true) : arrowSvgClosed.cloneNode(true)
                    );

                    toggleAllButton.style.display = isClosed ? "block" : "none";
                    return;
                }

                dropdown = document.createElement("div");
                dropdown.id = "activity-filter-dropdown";
                dropdown.style.padding = "10px";
                dropdown.style.marginBottom = "10px";
                dropdown.style.background = "#fafafa";

                const grid = createFilterGrid(FILTERS, svgGenius);
                dropdown.appendChild(grid);

                wrapper.insertAdjacentElement("afterend", dropdown);

                arrowSpan.replaceChildren(arrowSvgOpen.cloneNode(true));
                toggleAllButton.style.display = "block";

                const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
                const normalCheckboxes = [...checkboxes].filter(cb => cb.dataset.filter !== "user");
                const userInput = dropdown.querySelector('#activity-filter-text');

                loadStateFromStorage(() => {
                    FILTERS.forEach(f => {
                        const cb = dropdown.querySelector(`input[data-filter="${f.key}"]`);
                        if (cb) cb.checked = savedStates.filters[f.key] ?? true;
                    });

                    ALL_SUBFILTERS.forEach(sf => {
                        const cb = dropdown.querySelector(`input[data-filter="${sf.key}"]`);
                        if (cb) cb.checked = savedStates.filters[sf.key] ?? true;
                    });

                    const userCb = dropdown.querySelector('input[data-filter="user"]');
                    if (userCb) userCb.checked = savedStates.filters.user ?? false;

                    if (userInput) userInput.value = savedStates.userText ?? "";

                    updateIconColors(dropdown, FILTERS);
                    applyActivityFilterFromState();
                });


                updateIconColors(dropdown, FILTERS);

                currentUIState.checkboxes = checkboxes;
                currentUIState.userInput = userInput;


                grid.addEventListener("change", e => {
                    const target = e.target;

                    // Master toggles all subfilters
                    if (target.classList.contains("master-filter")) {
                        const key = target.dataset.filter;
                        const subfilters = grid.querySelectorAll(`input[data-filter^="${key}__"]`);
                        subfilters.forEach(cb => cb.checked = target.checked);
                    }

                    // Subfilters update master state
                    if (target.classList.contains("subfilter")) {
                        const [key] = target.dataset.filter.split("__");
                        const subfilters = grid.querySelectorAll(`input[data-filter^="${key}__"]`);
                        const master = grid.querySelector(`input[data-filter="${key}"]`);

                        master.checked = [...subfilters].every(cb => cb.checked);
                    }

                    updateIconColors(dropdown, FILTERS);

                    applyActivityFilterFromState();
                });

                grid.addEventListener("input", e => {
                    if (e.target.id === "activity-filter-text") {
                        savedStates.userText = e.target.value;
                        applyActivityFilterFromState();
                    }
                });

                toggleAllButton.addEventListener("click", () => {
                    const newState = !normalCheckboxes.every(cb => cb.checked);
                    normalCheckboxes.forEach(cb => cb.checked = newState);
                    updateIconColors(dropdown, FILTERS);
                    applyActivityFilterFromState();
                });
            });
        }

        function updateActivityItemCount() {
            const iframe = document.querySelector('iframe[class^="PlaceholderSpinnerIframe__Iframe"]');
            if (!iframe) return;

            const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!innerDoc) return;

            const items = innerDoc.querySelectorAll('div[class^="feed_dropdown-item"]');

            const counter = document.getElementById("activity-item-count");
            if (counter) counter.textContent = `Pages: ${Math.ceil((items.length - 1) / 30)}`;
        }

        function startIframeObserverFor(iframe) {
            function observeIframeActivityStream() {
                const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!innerDoc) return;

                const container = innerDoc.querySelector('.act-activity_stream_bagon');
                if (!container) return;

                loadStateFromStorage(() => {
                    applyActivityFilterFromSavedState();
                });

                const observer = new MutationObserver(() => {
                    updateActivityItemCount();
                    applyActivityFilterFromSavedState();
                });


                observer.observe(container, {
                    childList: true,
                    subtree: true
                });
            }

            iframe.addEventListener("load", observeIframeActivityStream);

            if (iframe.contentDocument?.readyState === "complete") {
                observeIframeActivityStream();
            }
        }

        const modalObserver = new MutationObserver(() => {
            const modal = document.querySelector('[class^="Modal-desktop__Contents"]');
            const title = document.querySelector('[class^="RecentActivity__Title"]');

            if (modal && title && !filterInitialized) {
                addActivityFilterButton();
                filterInitialized = true;
            }

            if (!modal && filterInitialized) {
                filterInitialized = false;
                iframeObserverInitialized = false;
            }

            if (modal && !iframeObserverInitialized) {
                const iframe = modal.querySelector('iframe[class^="PlaceholderSpinnerIframe__Iframe"]');
                if (iframe) {
                    iframeObserverInitialized = true;
                    startIframeObserverFor(iframe);
                }
            }
        });

        modalObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                 YOUTUBE PLAYER                                 //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function editYouTubePlayer() {
        if (!isGeniusSongYouTubePlayer) {
            const { youtubebuttonPlayvideobutton } = getDomElements();

            if (youtubebuttonPlayvideobutton) {
                youtubebuttonPlayvideobutton.style.display = 'none';
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                               APPLE MUSIC PLAYER                               //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function editAppleMusicPlayer() {
        console.log("Run function editAppleMusicPlayer()");

        function checkAppleMusicPlayer() {
            const { applemusicplayerIframe } = getDomElements();

            if (applemusicplayerIframe) {
                const playerDocument = applemusicplayerIframe.contentDocument;
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
            const { applemusicplayerIframewrapper } = getDomElements();
            if (applemusicplayerIframewrapper) {
                applemusicplayerIframewrapper.remove();
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

            const { applemusicplayerPositioningcontainer } = getDomElements();
            if (applemusicplayerPositioningcontainer) applemusicplayerPositioningcontainer.style.padding = "0";

            let spotifyIframe = document.createElement("iframe");
            spotifyIframe.style.width = "100%";
            spotifyIframe.style.height = "80px";
            spotifyIframe.style.marginRight = "0rem";
            spotifyIframe.style.gridColumn = "left-start / right-end";
            spotifyIframe.style.pointerEvents = "auto";
            spotifyIframe.className = savedClasses.spotifyIframe;
            spotifyIframe.id = "ge-spotify-player";
            spotifyIframe.src = `https://open.spotify.com/embed/track/${spotifyId}`;
            spotifyIframe.setAttribute("allow", "encrypted-media");
            spotifyIframe.setAttribute("allowtransparency", "true");
            spotifyIframeWrapper.appendChild(spotifyIframe);
            spotifyContainer.appendChild(spotifyIframeWrapper);

            const { mediaplayerscontainerContainer } = getDomElements();
            if (mediaplayerscontainerContainer) {
                mediaplayerscontainerContainer.append(spotifyContainer);
            }
            if (isGeniusSongLyricEditor) {
                function adjustSpotifyPlayerGridColumn() {
                    const { stickytoolbarContainer, stickyNavContainer, expandingtextareaTextarea } = getDomElements();

                    if (expandingtextareaTextarea) {
                        spotifyIframe.style.gridColumn = "right-start / page-end";
                        spotifyIframe.style.marginRight = "1rem";
                        if (applemusicplayerPositioningcontainer) {
                            spotifyIframe.style.paddingLeft = "2.25rem";
                        } else {
                            spotifyIframe.style.paddingLeft = "1.25rem"; spotifyIframe.style.paddingRight = "1rem";
                        }
                        expandingtextareaTextarea.style.marginRight = "0rem";
                        expandingtextareaTextarea.style.position = "relative";
                        expandingtextareaTextarea.style.zIndex = "5";
                        stickytoolbarContainer.style.zIndex = "7";
                        stickyNavContainer.style.zIndex = "8";
                    } else {
                        spotifyIframe.style.gridColumn = "left-start / right-end";
                        spotifyIframe.style.marginRight = "0rem";
                        spotifyIframe.style.paddingLeft = "0rem";
                        stickytoolbarContainer.style.zIndex = "3";
                        stickyNavContainer.style.zIndex = "6";
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

            const { stickytoolbarRight } = getDomElements();
            const soundCloudButtonClass = savedClasses.soundCloudButton;

            if (stickytoolbarRight) {
                let existingButton = stickytoolbarRight.querySelector('button[class*="SoundcloudButton"]');
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

                stickytoolbarRight.insertBefore(soundCloudButton, stickytoolbarRight.firstChild);
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

            const { mediaplayerscontainerContainer } = getDomElements();
            if (mediaplayerscontainerContainer) {
                mediaplayerscontainerContainer.insertBefore(soundCloudContainer, mediaplayerscontainerContainer.firstChild);
            }

            function adjustSoundCloudPlayerGridColumn() {
                const { expandingtextareaTextarea } = getDomElements();

                if (expandingtextareaTextarea) {
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
                const { mediaplayerscontainerContainer } = getDomElements();
                if (mediaplayerscontainerContainer && soundCloudContainer.parentNode) {
                    mediaplayerscontainerContainer.removeChild(soundCloudContainer);
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
        const { youtubebuttonPlayvideobutton } = getDomElements();

        if (youtubebuttonPlayvideobutton) {
            savedClasses.soundCloudButton = youtubebuttonPlayvideobutton.className.replace("YoutubeButton", "SoundcloudButton");
            localStorage.setItem("soundCloudButton", savedClasses.soundCloudButton);
        }
        const { applemusicplayerPositioningcontainer, applemusicplayerIframewrapper, applemusicplayerIframe } = getDomElements();
        if (applemusicplayerPositioningcontainer && applemusicplayerIframewrapper && applemusicplayerIframe) {
            savedClasses.soundCloudContainer = applemusicplayerPositioningcontainer.className.replace("AppleMusicPlayer", "SoundCloudPlayer");
            savedClasses.soundCloudIframeWrapper = applemusicplayerIframewrapper.className.replace("AppleMusicPlayer", "SoundCloudPlayer");
            savedClasses.soundCloudIframe = applemusicplayerIframe.className.replace("AppleMusicPlayer", "SoundCloudPlayer");
            savedClasses.spotifyContainer = applemusicplayerPositioningcontainer.className.replace("AppleMusicPlayer", "SpotifyPlayer");
            savedClasses.spotifyIframeWrapper = applemusicplayerIframewrapper.className.replace("AppleMusicPlayer", "SpotifyPlayer");
            savedClasses.spotifyIframe = applemusicplayerIframe.className.replace("AppleMusicPlayer", "SpotifyPlayer");
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
            const { stickytoolbarContainer, stickyNavContainer, expandingtextareaTextarea, applemusicplayerIframe } = getDomElements();

            if (applemusicplayerIframe) {
                if (expandingtextareaTextarea) {
                    applemusicplayerIframe.style.gridColumn = "right-start / page-end";
                    applemusicplayerIframe.style.marginRight = "0rem";
                    applemusicplayerIframe.style.paddingLeft = "2.25rem";
                    expandingtextareaTextarea.style.position = "relative";
                    expandingtextareaTextarea.style.zIndex = "5";
                    stickytoolbarContainer.style.zIndex = "7";
                    stickyNavContainer.style.zIndex = "8";
                } else {
                    applemusicplayerIframe.style.gridColumn = "left-start / right-end";
                    applemusicplayerIframe.style.marginRight = "-1rem";
                    applemusicplayerIframe.style.paddingLeft = "0rem";
                    stickytoolbarContainer.style.zIndex = "3";
                    stickyNavContainer.style.zIndex = "6";
                }
            }
        }

        adjustAppleMusicPlayerGridColumn();

        const observer = new MutationObserver(adjustAppleMusicPlayerGridColumn);
        observer.observe(document.body, { childList: true, subtree: true });
    }


    if (isGeniusSongLyricEditor) {
        function adjustYouTubeMargin() {

            const { transcriptionplayerContainer } = getDomElements();
            if (transcriptionplayerContainer) {
                transcriptionplayerContainer.style.margin = "0rem";
                transcriptionplayerContainer.style.marginRight = "1rem";
            }
        }

        adjustYouTubeMargin();

        const observer = new MutationObserver(adjustYouTubeMargin);
        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('click', (event) => {
            const button = event.target.closest('button[class*="YoutubeButton__PlayVideoButton-"], button[class*="SoundcloudButton__PlayVideoButton-"]');

            if (button) {
                const checkPlayerInterval = setInterval(() => {
                    const { mediaplayerscontainerContainer, transcriptionplayerContainer } = getDomElements();

                    if (mediaplayerscontainerContainer && transcriptionplayerContainer) {
                        mediaplayerscontainerContainer.insertBefore(transcriptionplayerContainer, mediaplayerscontainerContainer.firstChild);
                        clearInterval(checkPlayerInterval);
                    }
                }, 1);
            }
        });
    }

    if (isGeniusSongRenameButtons) {
        const { youtubebuttonPlayvideobutton } = getDomElements();
        if (youtubebuttonPlayvideobutton) {
            const svgElement = youtubebuttonPlayvideobutton.querySelector('svg');
            svgElement.remove();
            youtubebuttonPlayvideobutton.textContent = 'YouTube';
        }
    }

});
