chrome.storage.local.get([
    'Services/genius_artist.js',
    'isGeniusArtistArtistPage',
    'isGeniusArtistArtistPageZwsp',
    'isGeniusArtistArtistPageInfo',
    'isGeniusArtistArtistId',
    'isGeniusArtistAllSongsAlbumsPage',
    'isGeniusArtistAllSongsAlbumsPageMetadata',
    'isGeniusArtistAllSongsAlbumsPageZwsp',
    'isGeniusArtistFollowButton',
    'isGeniusArtistSpreadsheetButton'
], async function (result) {
    const isGeniusArtistArtistPage = result.isGeniusArtistArtistPage ?? true;
    const isGeniusArtistArtistPageZwsp = result.isGeniusArtistArtistPageZwsp ?? true;
    const isGeniusArtistArtistPageInfo = result.isGeniusArtistArtistPageInfo ?? true;
    const isGeniusArtistArtistId = result.isGeniusArtistArtistId ?? false;
    const isGeniusArtistAllSongsAlbumsPage = result.isGeniusArtistAllSongsAlbumsPage ?? true;
    const isGeniusArtistAllSongsAlbumsPageMetadata = result.isGeniusArtistAllSongsAlbumsPageMetadata ?? true;
    const isGeniusArtistAllSongsAlbumsPageZwsp = result.isGeniusArtistAllSongsAlbumsPageZwsp ?? true;
    const isGeniusArtistFollowButton = result.isGeniusArtistFollowButton ?? false;
    const isGeniusArtistSpreadsheetButton = result.isGeniusArtistSpreadsheetButton ?? false;


    if (result['Services/genius_artist.js'] === false) {
        return;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                  MAIN PROGRAM                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    main();

    async function main() {
        const profilePathPromise = new Promise(resolve => {
            chrome.storage.local.get("profilePath", ({ profilePath }) => {
                resolve(profilePath ?? null);
            });
        });

        const userIdPromise = new Promise(resolve => {
            chrome.storage.local.get("userId", ({ userId }) => {
                resolve(userId ?? null);
            });
        });

        const profilePath = await profilePathPromise;
        const userId = await userIdPromise;

        const isAllAlbums = /https:\/\/(genius\.com|genius-staging.com)\/artists\/[^/]+\/albums$/.test(window.location.href);
        const isAllSongs = /https:\/\/(genius\.com|genius-staging.com)\/artists\/[^/]+\/songs$/.test(window.location.href);
        const isArtist = /https:\/\/(genius\.com|genius-staging.com)\/artists\/[^/]+$/.test(window.location.href);
        const isUser = profilePath ? new RegExp(`https:\\/\\/(genius\\.com|genius-staging\\.com)${profilePath}$`).test(window.location.href) : false;

        if (isAllSongs || isAllAlbums) {
            const { artistId, userId, artistData } = await getArtistInfo2();

            if (isGeniusArtistAllSongsAlbumsPage || isGeniusArtistAllSongsAlbumsPageMetadata) checkAllSongsAlbumsPage(artistId, isAllSongs, isAllAlbums);
        } else if (isArtist) {
            const { artistId, userId, artistData } = await getArtistInfo();
            if (!artistId || !userId || !artistData) return;

            if (isGeniusArtistArtistId) showArtistIdButton(artistId);
            if (isGeniusArtistArtistPageInfo) showCoverInfo(artistData);

            if (isGeniusArtistArtistPage) checkArtistCover(artistData);
            if (isGeniusArtistFollowButton) FollowButtonArtistPage(artistId);

            if (isGeniusArtistSpreadsheetButton) getSpreadsheet(artistId, "artist");
        } else if (isUser) {
            if (isGeniusArtistSpreadsheetButton) getSpreadsheet(userId, "user");
        }
    }

    async function getArtistInfo() {
        console.log("Run function getArtistInfo()");
        // Artist ID
        const artistId = document.querySelector("link[rel='alternate']")?.href?.split("/")?.pop();

        // User ID
        const userMatch = document.documentElement.innerHTML.match(/var CURRENT_USER = JSON.parse\('{\\"id\\":(\d+)/);
        const userId = userMatch?.[1];

        if (!artistId || !userId) return { artistId: null, userId, artistData: null };

        // Artist Data
        const response = await fetch(`https://genius.com/api/artists/${artistId}`);
        const json = await response.json();

        return { artistId, userId, artistData: json.response.artist };
    }

    async function getArtistInfo2() {
        console.log("Run function getArtistInfo2()");
        // Artist ID
        const artistIdMatch = document.documentElement.innerHTML.match(/\\?"artist\\?":(\d+)/);
        const artistId = artistIdMatch ? artistIdMatch[1] : null;

        // User ID
        const userMatch = document.documentElement.innerHTML.match(/\\?"currentUser\\?":(\d+)/);
        const userId = userMatch ? userMatch[1] : null;

        // Artist Data
        const response = await fetch(`https://genius.com/api/artists/${artistId}`);
        const json = await response.json();

        return { artistId, userId, artistData: json.response.artist };
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                   Artist ID                                    //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    function showArtistIdButton(artistId) {
        const identityTextContainer = document.querySelector(".profile_identity-text");
        const artistIdContainer = document.createElement("div");
        artistIdContainer.className = "profile_identity-alternate_names";
        artistIdContainer.setAttribute("ng-if", "$ctrl.artist.alternate_names.length");
        artistIdContainer.style.marginBottom = "0.25rem";

        const artistIdElement = document.createElement("span");
        artistIdElement.className = "profile_identity-alternate_names";
        artistIdElement.style.fontSize = "0.75rem";

        const artistIdLink = document.createElement("a");
        artistIdLink.href = `https://genius.com/api/artists/${artistId}`;
        artistIdLink.target = "_blank";
        artistIdLink.textContent = artistId;
        artistIdLink.style.textDecoration = "none";
        artistIdLink.style.color = "inherit";
        artistIdLink.onmouseover = () => artistIdLink.style.textDecoration = "underline";
        artistIdLink.onmouseout = () => artistIdLink.style.textDecoration = "none";

        artistIdElement.textContent = "Artist ID: ";
        artistIdElement.appendChild(artistIdLink);
        artistIdContainer.appendChild(artistIdElement);
        identityTextContainer.appendChild(artistIdContainer);

    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                   COVER INFO                                   //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function showCoverInfo(artistData) {
        console.log("Run function showCoverInfo()");

        const avatar = document.querySelector('.user_avatar.profile_header-avatar');

        if (avatar) {
            avatar.style.position = "relative";

            const existing = avatar.querySelector('p[data-type="resolution-info"]');
            if (existing) existing.remove();

            const infoElement = createResolutionInfo(artistData);

            avatar.append(infoElement);
        }
    }

    function createResolutionInfo(artistData) {
        const resolutionMatch = artistData.image_url.match(/(\d+)x(\d+)/);
        const formatMatch = artistData.image_url.match(/\.(\w+)$/);

        const resolutionText = resolutionMatch?.[1] ? `${resolutionMatch[1]}x${resolutionMatch[2]}` : "No";
        const formatText = formatMatch?.[1] ? formatMatch[1].toUpperCase() : "Cover";

        const resolutionInfo = document.createElement('p');

        resolutionInfo.style.position = "absolute";
        resolutionInfo.style.top = "-1.5rem";
        resolutionInfo.style.left = "50%";
        resolutionInfo.style.transform = "translateX(-50%)";

        resolutionInfo.style.fontSize = "0.75rem";
        resolutionInfo.style.color = "#ffffff";
        resolutionInfo.style.fontWeight = "400";
        resolutionInfo.style.margin = "0";
        resolutionInfo.style.pointerEvents = "none";
        resolutionInfo.style.textShadow = "0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)";

        resolutionInfo.dataset.type = "resolution-info";
        resolutionInfo.textContent = `${resolutionText} ${formatText}`;

        return resolutionInfo;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                COVER INDICATOR                                 //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function checkArtistCover(artistData) {
        console.log("Run function checkArtistCover()");

        const container = document.querySelector('.profile_identity_and_description-action_row');
        const editArtistButton = Array.from(container.querySelectorAll('.square_button')).find(button => button.textContent.trim() === 'Edit');
        if (editArtistButton) {
            const iconsToRemove = editArtistButton.querySelectorAll('.inline_icon, .inline_icon--reading_size, .inline_icon--up_1');
            iconsToRemove.forEach(icon => icon.remove());

            let color, borderColor;
            const artistArt = artistData.image_url;

            if (artistArt.endsWith("1000x1000x1.png")) {
                color = '#99f2a5'; // Green
                borderColor = '#66bfa3';
            } else if (artistArt.startsWith("http://assets.genius.com/images/sharing_fallback.png")) {
                if (document.body.innerHTML.includes("https://assets.genius.com/images/default_avatar_300.png")) {
                    color = '#dddddd'; // Grey
                    borderColor = '#aaaaaa';
                } else {
                    color = '#ffff64'; // Yellow
                    borderColor = '#cccc00';
                }
            } else {
                color = '#fa7878'; // Red
                borderColor = '#a74d4d';
            }
            addColoredSquare(editArtistButton, color, borderColor);
            if (isGeniusArtistArtistPageZwsp) checkArtistTitleForZeroWidthSpace();
        }
    }

    function addBlackSquare(square) {
        const existingSquare = square.querySelector('.black-square');
        if (!existingSquare) {
            const blackSquare = document.createElement('span');
            blackSquare.className = 'black-square';
            blackSquare.style.cssText = `
            height: 8px; 
            width: 8px; 
            background-color: #2C2C2C; 
            display: inline-block; 
            position: absolute; 
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%); 
        `;
            square.appendChild(blackSquare);
        }
    }

    function addColoredSquare(button, color, borderColor) {
        const existingSquare = button.querySelector('.square-indicator');
        if (existingSquare) {
            existingSquare.style.backgroundColor = color;
            existingSquare.style.borderColor = borderColor;
        } else {
            const square = document.createElement('span');
            square.className = 'square-indicator';
            square.style.cssText = `
                font-variant: JIS04; 
                height: 16px; 
                width: 28px; 
                display: inline-block; 
                margin-left: -0.100rem; 
                margin-right: 0.375rem; 
                position: relative;
                background-color: ${color}; 
                border: 1px solid ${borderColor};
            `;
            button.style.cssText += `
                display: inline-flex;
                align-items: center;
                flex-wrap: nowrap;
            `;
            button.prepend(square);
        }
    }

    function checkArtistTitleForZeroWidthSpace() {
        const titleElement = document.querySelector('.profile_identity-name_iq_and_role_icon.u-hair_bottom_margin');
        if (titleElement) {
            const titleText = titleElement.textContent;
            if (titleText.includes('\u200B')) {
                const square = document.querySelector('.square-indicator');
                if (square) {
                    addBlackSquare(square);
                }
            }
        }
    }

    function checkListItemsForZeroWidthSpace() {

        const discographyList = document.querySelector('div[class^="DiscographyItemList__ListSingleContainer"]');
        if (!discographyList) return;

        const listItems = discographyList.querySelectorAll('a[class^="DiscographyItem__Container"]');

        listItems.forEach(item => {
            const h3Element = item.querySelector('h3[class^="DiscographyItem__Title"]');
            if (!h3Element) return;

            const h3Text = h3Element.textContent;
            const targetDiv = item.querySelector('div[class^="DiscographyItem__Content"]');
            if (!targetDiv) return;

            if (h3Text.startsWith('\u200B')) {
                targetDiv.style.borderLeft = '20px solid black';
                targetDiv.style.paddingLeft = '5px';
            }
            else if (h3Text.endsWith('\u200B')) {
                targetDiv.style.borderRight = '20px solid black';
                targetDiv.style.paddingRight = '5px';
            }
            else if (h3Text.includes('\u200B')) {
                targetDiv.style.borderTop = '20px solid black';
            }
        });
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                 FOLLOW BUTTON                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function injectButtons(buttonConfigs) {
        const existingFollowButton = document.querySelector('follow-button a.square_button');
        const messageButton = document.querySelector('div.square_button[ng-click="$ctrl.show_conversation_modal = true"][ng-if="$ctrl.can_message_user"]');
        const editButton = document.querySelector('div.square_button[ng-if="$ctrl.can_edit_profile"][ng-click="$ctrl.show_edit_artist_profile_modal = true"]');

        if (!editButton) return;

        const buttonContainer = document.createElement('div');

        const createButton = ({ text, marginLeft = "0", width = "0", onClick }) => {
            const button = document.createElement('button');
            button.className = 'square_button u-bottom_margin';
            button.textContent = text;
            button.style.width = width;
            button.style.whiteSpace = 'nowrap';
            button.style.marginBottom = "0rem";
            button.style.marginLeft = marginLeft;

            if (onClick) {
                button.addEventListener('click', async () => {
                    await onClick(button);
                });
            }

            return button;
        };

        const createInput = ({ placeholder = "", marginLeft = "0" }) => {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = placeholder;

            input.style.margin = "0";
            input.style.marginTop = "0.5rem";
            input.style.marginLeft = marginLeft;
            input.style.color = "#000000";
            input.style.width = "6.25rem";
            input.style.borderWidth = ".15rem";
            input.style.borderStyle = "solid";
            input.style.cursor = "text";
            input.style.display = "inline-block";
            input.style.fontFamily = "Programme, Arial, sans-serif";
            input.style.fontSize = "1rem";
            input.style.lineHeight = "1.4rem";
            input.style.textAlign = "center";
            input.style.padding = ".25rem .5rem";

            return input;
        };

        buttonConfigs.forEach(cfg => {
            if (cfg.type === "input") {
                const input = createInput(cfg);
                buttonContainer.appendChild(input);
                buttonContainer._songIdInput = input;
            } else {
                buttonContainer.appendChild(createButton(cfg));
            }
        });

        editButton.parentNode.insertBefore(buttonContainer, editButton.nextSibling);

        const buttonWidths = (existingFollowButton && messageButton) || (!existingFollowButton && !messageButton) ? '6.25rem' : '9.5rem';
        [existingFollowButton, messageButton, editButton].forEach(btn => btn && (btn.style.width = buttonWidths));
        editButton.style.justifyContent = 'center';
    }

    function FollowButtonArtistPage(artistId) {
        injectButtons([
            {
                text: 'Follow All Songs',
                width: "9.5rem",
                onClick: async (button) => {
                    button.disabled = true;
                    button.textContent = 'Following...';

                    const songIds = await fetchAllSongIds(artistId);
                    for (const songId of songIds) {
                        await toggleFollowSong(songId, 'follow');
                        await new Promise(r => setTimeout(r, 25));
                    }

                    button.textContent = 'Following';
                    button.disabled = false;
                }
            },
            {
                text: 'Unfollow All Songs',
                width: "9.5rem",
                marginLeft: "0.25rem",
                onClick: async (button) => {
                    button.disabled = true;
                    button.textContent = 'Unfollowing...';

                    const songIds = await fetchAllSongIds(artistId);
                    for (const songId of songIds) {
                        await toggleFollowSong(songId, 'unfollow');
                        await new Promise(r => setTimeout(r, 25));
                    }

                    button.textContent = 'Unfollowing';
                    button.disabled = false;
                }
            }
        ]);
    }

    async function fetchAllSongIds(artistId) {
        let songIds = [], page = 1, perPage = 50;
        while (true) {
            const json = await fetch(`https://genius.com/api/artists/${artistId}/songs?page=${page}&per_page=${perPage}`)
                .then(res => res.json());
            if (!json.response.songs?.length) break;

            songIds.push(...json.response.songs.map(song => song.api_path.match(/\/songs\/(\d+)/)[1]));
            page++;
        }
        return songIds;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                               SPREADSHEET BUTTON                               //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function getSpreadsheet(id, type) {

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const escapeCSV = (value) => {
            if (value == null) return "";
            const str = String(value);
            return `"${str.replace(/"/g, '""')}"`;
        };

        const getReleaseDate = (comp) => {
            if (!comp?.year) return "";
            const y = comp.year;
            const m = comp.month ? String(comp.month).padStart(2, "0") : null;
            const d = comp.day ? String(comp.day).padStart(2, "0") : null;

            if (y && m && d) return `${y}-${m}-${d}`;
            if (y && m) return `${y}-${m}`;
            return `${y}`;
        };

        const getLyricsStatus = (song) => {
            const hasFullDetails = song.current_user_metadata;

            if (!hasFullDetails) { // Button 1
                const isInstrumental = song.instrumental === true;

                if (isInstrumental) return "instrumental";
                if (song.lyrics_state === "complete") return "transcribed";

                return "not transcribed";
            } else { //Button 2
                const validated =
                    song.lyrics_marked_complete_by ||
                    song.lyrics_marked_staff_approved_by ||
                    song.lyrics_verified === true;

                const hasExcluded = song.current_user_metadata?.excluded_permissions?.includes("award_transcription_iq");
                const hasPermission = song.current_user_metadata?.permissions?.includes("award_transcription_iq");
                const isInstrumental = song.instrumental === true;

                let status = "not transcribed";

                if (validated && hasExcluded) status = "completed";
                else if (song.lyrics_state === "complete" && isInstrumental) status = "instrumental";
                else if (song.lyrics_state === "complete" && hasExcluded) status = "transcribed";
                else if (song.lyrics_state === "complete" && hasPermission) status = "not awarded";

                return status;
            }
        };

        const getCoverInfo = (url) => {
            if (!url.startsWith("https://images.genius.com")) {
                return "No Genius Image";
            }

            const match = url.match(/\.([0-9]+x[0-9]+)x[0-9]+\.(\w+)$/i);

            if (!match) {
                return "No Genius Image";
            }

            const size = match[1];
            const ext = match[2].toUpperCase();

            return `${size} ${ext}`;
        };

        async function fetchPaginated({
            startPages,
            fetchPage,
            onPageData,
            updateButton,
            stopCondition
        }) {
            const workerCount = startPages.length;
            const workerFinished = Array(workerCount).fill(false);
            let counter = 0;

            async function worker(workerIndex, startPage) {
                let page = startPage;

                while (true) {
                    const json = await fetchPage(page);
                    counter++;
                    updateButton(counter);

                    const items = onPageData(json);

                    if (stopCondition(items)) {
                        workerFinished[workerIndex] = true;

                        if (workerFinished.every(f => f)) {
                            return;
                        }

                        return;
                    }

                    page += workerCount;
                }
            }

            const promises = [];
            for (let i = 0; i < workerCount; i++) {
                await sleep(50 * i);
                promises.push(worker(i, startPages[i]));
            }

            await Promise.all(promises);
        }

        async function fetchSongsPage(id, type, page, perPage = 50, maxRetries = 5) {
            let attempt = 0;

            while (true) {
                try {
                    const url =
                        type === "artist"
                            ? `https://genius.com/api/artists/${id}/songs?page=${page}&per_page=${perPage}`
                            : `https://genius.com/api/users/${id}/contributions/transcriptions?next_cursor=${page}&per_page=${perPage}`;

                    const res = await fetch(url);

                    if (res.status === 503) {
                        attempt++;
                        if (attempt > maxRetries) throw new Error(`503 after ${maxRetries} retries`);
                        await sleep(200 * attempt);
                        continue;
                    }

                    return await res.json();

                } catch (err) {
                    attempt++;
                    if (attempt > maxRetries) throw err;
                    await sleep(200 * attempt);
                }
            }
        }

        function parseSongsFromPage(json, type) {
            if (type === "artist") {
                return json.response?.songs || [];
            }

            const groups = json.response?.contribution_groups || [];
            const songs = [];

            for (const g of groups) {
                if (g.contribution_type !== "song") continue;
                for (const c of g.contributions) {
                    if (c._type === "song") songs.push(c);
                }
            }

            return songs;
        }

        async function fetchSongDetails(songId) {
            const res = await fetch(`https://genius.com/api/songs/${songId}`);
            if (!res.ok) throw new Error(`Song ${songId}: ${res.status}`);
            return res.json();
        }

        async function fetchAllSongsDirect(id, type, button) {
            const perPage = 50;
            const workers = [1, 2, 3];
            let allSongs = [];

            await fetchPaginated({
                startPages: workers,
                fetchPage: (page) => fetchSongsPage(id, type, page, perPage),
                updateButton: (count) => button.textContent = `Page: ${count}`,
                onPageData: (json) => {
                    const songs = parseSongsFromPage(json, type);

                    for (const song of songs) {
                        allSongs.push({
                            ...song,
                            id: Number(song.id)
                        });
                    }

                    return songs;
                },
                stopCondition: (songs) => !songs.length
            });

            return allSongs.sort((a, b) => a.id - b.id);
        }

        async function fetchAllSongIds(id, type, button) {
            const perPage = 50;
            const workers = [1, 2, 3];
            let ids = [];

            await fetchPaginated({
                startPages: workers,
                fetchPage: (page) => fetchSongsPage(id, type, page, perPage),
                updateButton: (count) => button.textContent = `Page: ${count}`,
                onPageData: (json) => {
                    const songs = parseSongsFromPage(json, type);
                    for (const song of songs) ids.push(Number(song.id));
                    return songs;
                },
                stopCondition: (songs) => !songs.length
            });

            return ids.sort((a, b) => a - b);
        }

        async function fetchSongDetailsByIds(songIds, button) {
            const workers = 3;
            let results = [];
            let counter = 0;

            async function worker(startIndex) {
                let index = startIndex;
                while (index < songIds.length) {
                    const id = songIds[index];
                    try {
                        const json = await fetchSongDetails(id);
                        results.push({ id, data: json });
                        counter++;
                        button.textContent = `Song: ${counter}`;
                    } catch (err) {
                        console.error("Error fetching song", id, err);
                    }
                    index += workers;
                }
            }

            const promises = [];
            for (let i = 0; i < workers; i++) {
                await sleep(200 * i);
                promises.push(worker(i));
            }

            await Promise.all(promises);
            return results;
        }


        function filterSongIds(ids, text) {
            if (!text) return ids;

            if (text.includes(",")) {
                const list = text
                    .split(",")
                    .map(x => Number(x.trim()))
                    .filter(n => !isNaN(n));
                return ids.filter(id => list.includes(id));
            }

            if (text.includes("-") && text.indexOf("-") > 0) {
                const [minStr, maxStr] = text.split("-");
                const min = Number(minStr);
                const max = Number(maxStr);
                return ids.filter(id => id >= min && id <= max);
            }

            if (text.startsWith("-")) {
                const max = Number(text.slice(1));
                return ids.filter(id => id <= max);
            }

            const min = Number(text);
            return ids.filter(id => id >= min);
        }

        function exportCSV(rows, header, filename) {
            const csv = header.join(",") + "\n" + rows.join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        injectButtons([
            {
                text: "Spreadsheet 1",
                width: "8.5rem",
                onClick: async (button) => {
                    const songs = await fetchAllSongsDirect(id, type, button);

                    const header = [
                        "Song ID",
                        "Primary Artist",
                        "Song Title",
                        "URL",
                        "Release Date",
                        "Cover Image Info",
                        "Lyrics Status",
                    ];

                    const rows = songs.map(song =>
                        [
                            song.id,
                            escapeCSV(song.primary_artist_names),
                            escapeCSV(song.title),
                            escapeCSV(song.url),
                            escapeCSV(getReleaseDate(song.release_date_components)),
                            escapeCSV(getCoverInfo(song.song_art_image_url)),
                            escapeCSV(getLyricsStatus(song)),
                        ].join(",")
                    );

                    button.textContent = "Downloading CSV";
                    exportCSV(rows, header, `${type}_${id}_songs_1.csv`);
                    button.textContent = "Spreadsheet 1";
                }
            },
            {
                type: "input",
                placeholder: "Song ID",
                marginLeft: "0.25rem",
            },
            {
                text: "Spreadsheet 2",
                width: "8.5rem",
                marginLeft: "0.25rem",
                onClick: async (button) => {
                    const container = button.parentElement;
                    const input = container._songIdInput;
                    const filterText = input?.value.trim() || "";

                    const ids = await fetchAllSongIds(id, type, button);
                    const filteredIds = filterSongIds(ids, filterText);

                    let details = await fetchSongDetailsByIds(filteredIds, button);
                    details = details.sort((a, b) => a.id - b.id);

                    const header = [
                        "Song ID",
                        "Primary Artist",
                        "Song Title",
                        "URL",
                        "Release Date",
                        "Albums",
                        "Cover Image Info",
                        "Tags",
                        "Language",
                        "Lyrics Status",
                        "Pending LEPs",
                    ];

                    const rows = details.map(item => {
                        const song = item.data.response.song;
                        return [
                            song.id,
                            escapeCSV(song.primary_artist_names),
                            escapeCSV(song.title),
                            escapeCSV(song.url),
                            escapeCSV(getReleaseDate(song.release_date_components)),
                            escapeCSV(song.albums.map(album => album.name).join(", ")),
                            escapeCSV(getCoverInfo(song.song_art_image_url)),
                            escapeCSV([song.primary_tag?.name, ...song.tags.map(tag => tag.name).filter(name => name !== song.primary_tag?.name).sort((a, b) => a.localeCompare(b))].join(", ")),
                            escapeCSV(song.language),
                            escapeCSV(getLyricsStatus(song)),
                            escapeCSV(song.pending_lyrics_edits_count),
                        ].join(",");
                    });

                    button.textContent = "Downloading CSV";
                    exportCSV(rows, header, `${type}_${id}_songs_2.csv`);
                    button.textContent = "Spreadsheet 2";
                }
            }

        ]);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                            ALL SONGS / ALBUMS PAGES                            //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function checkAllSongsAlbumsPage(artistId, isAllSongs, isAllAlbums) {

        let cachedSongs = null;
        let cachedAlbums = null;
        let items = [];

        async function fetchAll(artistId, type) {
            const results = [];
            const workers = 5;
            const perPage = 50;

            async function worker(startPage) {
                for (let page = startPage; ; page += workers) {
                    const res = await fetch(
                        `https://genius.com/api/artists/${artistId}/${type}?page=${page}&per_page=${perPage}&sort=popularity&text_format=html%2Cmarkdown`
                    );

                    if (!res.ok) break;

                    const json = await res.json();
                    const items = json.response[type];

                    if (!items?.length) break;

                    results.push(...items);
                }
            }

            const promises = [];
            for (let i = 1; i <= workers; i++) {
                await new Promise(r => setTimeout(r, 250 * (i - 1)));
                promises.push(worker(i));
            }

            await Promise.all(promises);
            return results;
        }

        async function checkAllEntriesAndFetchFunctions(artistId) {
            if (isAllSongs) {
                if (!cachedSongs) cachedSongs = await fetchAll(artistId, "songs");
                items = cachedSongs;
            } else if (isAllAlbums) {
                if (!cachedAlbums) cachedAlbums = await fetchAll(artistId, "albums");
                items = cachedAlbums;
            }

            return items;
        }

        (async () => {
            await checkAllEntriesAndFetchFunctions(artistId);
        })();


        async function checkCoverImage() {
            let updates = [];

            const discographyList = document.querySelector('div[class^="DiscographyItemList__ListSingleContainer"]');
            if (!discographyList) return;


            const listItems = discographyList.querySelectorAll('a[class^="DiscographyItem__Container"]');
            const itemMap = new Map(items.map(item => [item.url, item]));

            listItems.forEach((item) => {
                const targetDiv = item.querySelector('div[class^="SizedImage__Container"]');
                if (!targetDiv) return;

                if (['#99f2a5', '#fa7878', '#dddddd'].includes(targetDiv.style.backgroundColor)) return;

                const itemLink = item.href;
                let artImageUrl, artistImageUrl;

                if (itemLink && itemMap.has(itemLink)) {
                    const titleMatch = itemMap.get(itemLink);
                    if (isAllSongs) {
                        artImageUrl = titleMatch.song_art_image_url;
                        artistImageUrl = titleMatch.primary_artist.image_url;
                    } else if (isAllAlbums) {
                        artImageUrl = titleMatch.cover_art_url;
                        artistImageUrl = titleMatch.artist.image_url;
                    }
                }

                let color;
                if (artImageUrl === artistImageUrl ||
                    artImageUrl.startsWith('https://assets.genius.com/images/default_cover_art.png?') ||
                    artImageUrl.startsWith('https://assets.genius.com/images/default_cover_image.png?')) {
                    color = '#dddddd';
                } else if (artImageUrl.endsWith('1000x1000x1.png')) {
                    color = '#99f2a5';
                } else {
                    color = '#ff7878';
                }

                updates.push({ targetDiv, color });
            });

            return updates;
        }

        const cachedSongData = new Map();
        async function checkMetadata() {
            const container = document.querySelector('div[class^="DiscographyItemList__ListSingleContainer"]');
            if (!container) return;

            const itemsDom = container.querySelectorAll('a[class^="DiscographyItem__Container"]');

            const targetLinks = Array.from(itemsDom)
                .map(a => a.href)
                .filter(href => href.startsWith("https://genius.com/") && (href.endsWith("-lyrics") || href.endsWith("-annotated")));

            const matchedSongs = items.filter(song => targetLinks.includes(song.url));
            const uncachedSongs = matchedSongs.filter(song => !cachedSongData.has(song.id));

            const chunkSize = 5;
            const delayMs = 400;

            for (let i = 0; i < uncachedSongs.length; i += chunkSize) {
                const chunk = uncachedSongs.slice(i, i + chunkSize);

                const chunkResults = await Promise.all(
                    chunk.map(song =>
                        fetch(`https://genius.com/api/songs/${song.id}`)
                            .then(res => res.json())
                            .then(json => {
                                const songData = json.response.song;
                                cachedSongData.set(song.id, songData);
                                return { song, songData };
                            })
                            .catch(error => {
                                console.warn(`Error fetching song ${song.id}:`, error);
                                return null;
                            })
                    )
                );

                chunkResults.filter(Boolean).forEach(({ song, songData }) => {
                    updateSongUI(song, songData);
                });

                if (i + chunkSize < uncachedSongs.length) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }

            matchedSongs
                .filter(song => cachedSongData.has(song.id))
                .forEach(song => {
                    const songData = cachedSongData.get(song.id);
                    updateSongUI(song, songData);
                });
        }

        function updateSongUI(song, songData) {
            const discographyList = document.querySelector('div[class^="DiscographyItemList__ListSingleContainer"]');
            if (!discographyList) return;

            const link = discographyList.querySelector(`a[class^="DiscographyItem__Container"][href="${song.url}"]`);
            if (!link) return;

            const infoContainer = link.querySelector('div[class^="DiscographyItem__Content"]');
            if (!infoContainer) return;

            const lyricsAreValidated =
                songData.lyrics_marked_complete_by ||
                songData.lyrics_marked_staff_approved_by ||
                songData.lyrics_verified === true;

            if (lyricsAreValidated &&
                songData.current_user_metadata?.excluded_permissions?.includes("award_transcription_iq")) {

                infoContainer.style.backgroundColor = '#99f2a5';

            } else if (songData.lyrics_state === 'complete' &&
                songData.current_user_metadata?.excluded_permissions?.includes("award_transcription_iq")) {

                infoContainer.style.backgroundColor = '#ffff64';

            } else if (songData.lyrics_state === 'complete' &&
                songData.current_user_metadata?.permissions?.includes("award_transcription_iq")) {

                infoContainer.style.backgroundColor = '#ffa335';

            } else {

                infoContainer.style.backgroundColor = '#ff7878';
            }

            if (!songData.album) {
                link.style.borderTop = '3.5px dashed';
                link.style.borderBottom = '3.5px dashed';
            }
        }


        document.addEventListener('click', async () => {
            if ((isAllSongs && isGeniusArtistAllSongsAlbumsPage) || (isAllAlbums && isGeniusArtistAllSongsAlbumsPage) && isGeniusArtistAllSongsAlbumsPage) {
                updates = await checkCoverImage();
            }

            if (updates && updates.length > 0) {
                updates.forEach(({ targetDiv, color }) => {
                    targetDiv.style.border = `12.5px solid ${color}`;
                });
                if (isGeniusArtistAllSongsAlbumsPageZwsp) checkListItemsForZeroWidthSpace();
            }

            if (isAllSongs && isGeniusArtistAllSongsAlbumsPageMetadata) {
                await checkMetadata();
            }
        });
    }

});