chrome.storage.local.get([
    'Services/genius_album.js',
    'isGeniusAlbumAlbumPage',
    'isGeniusAlbumAlbumPageZwsp',
    'isGeniusAlbumAlbumPageLyrics',
    'isGeniusAlbumExpandTracklist',
    'isGeniusAlbumEditTracklist',
    'isGeniusAlbumUploadCover',
    'isGeniusAlbumRenameButtons',
    'isGeniusAlbumSongCreditsButton',
    'isGeniusAlbumFollowButton',
    'isGeniusAlbumCleanupButton',
    'functionOrder'
], function (result) {
    const isGeniusAlbumAlbumPage = result.isGeniusAlbumAlbumPage ?? true;
    const isGeniusAlbumAlbumPageZwsp = result.isGeniusAlbumAlbumPageZwsp ?? true;
    const isGeniusAlbumAlbumPageLyrics = result.isGeniusAlbumAlbumPageLyrics ?? false;
    const isGeniusAlbumExpandTracklist = result.isGeniusAlbumExpandTracklist ?? true;
    const isGeniusAlbumEditTracklist = result.isGeniusAlbumEditTracklist ?? true;
    const isGeniusAlbumUploadCover = result.isGeniusAlbumUploadCover ?? true;
    const isGeniusAlbumRenameButtons = result.isGeniusAlbumRenameButtons ?? true;
    const isGeniusAlbumSongCreditsButton = result.isGeniusAlbumSongCreditsButton ?? true;
    const isGeniusAlbumFollowButton = result.isGeniusAlbumFollowButton ?? true;
    const isGeniusAlbumCleanupButton = result.isGeniusAlbumCleanupButton ?? true;


    if (result['Services/genius_album.js'] === false) {
        return;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                  MAIN PROGRAM                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    checkPage();

    async function checkPage() {
        const isAlbum = window.location.href.startsWith('https://genius.com/albums') || window.location.href.startsWith('https://genius-staging.com/albums');

        if (isAlbum) {

            const [albumId, userId] = await getAlbumInfo();
            const userRoles = await getUserRoles(userId);
            if (isGeniusAlbumRenameButtons) renameAlbumButtons();
            if (isGeniusAlbumAlbumPage) checkAlbumPage();
            if (isGeniusAlbumExpandTracklist) expandAllTracksInTracklist();
            if (isGeniusAlbumEditTracklist) addTracklistCheckbox();
            if (isGeniusAlbumUploadCover) monitorCover(albumId);

            getSongData(document.documentElement.innerHTML).then(json => {
                if (isGeniusAlbumSongCreditsButton) songCreditsButtonAlbumPage(json);
                if (isGeniusAlbumFollowButton) followButtonAlbumPage(json);
                if (isGeniusAlbumCleanupButton) cleanupMetadata(userId, userRoles, json);
                if (isGeniusAlbumAlbumPageLyrics) lyricStateTracklist(userRoles, json);
            });

            monitorTracklist();
        }

        async function getAlbumInfo() {
            const albumId = document.querySelector("meta[content*='Album ID']")?.content.match(/"Album ID","value":(\d+)/)?.[1];
            const userId = document.documentElement.innerHTML.match(/var CURRENT_USER = JSON.parse\('{\\"id\\":(\d+)/)?.[1];

            //const response = await fetch(`https://genius.com/api/albums/${albumId}`);
            //const json = await response.json();



            if (userId == 4670957) {
                const columnContainer = document.querySelector(".column_layout-column_span.column_layout-column_span--one_quarter");
                const newTransclude = document.createElement("ng-transclude");
                newTransclude.setAttribute("ng-transclude-slot", "secondary");
                const newSecondary = document.createElement("secondary");
                const newMetadataPreview = document.createElement("div");
                newMetadataPreview.className = "header_with_cover_art-metadata_preview u-small_top_margin u-right_margin";
                const albumIdDiv = document.createElement("div");
                albumIdDiv.className = "header_with_cover_art-metadata_preview-unit";
                const staticTextSpan = document.createElement("span");
                staticTextSpan.className = "text_label text_label--gray text_label--x_small_text_size";
                staticTextSpan.textContent = "Album ID: ";
                staticTextSpan.style.textTransform = "none";
                const albumIdLink = document.createElement("a");
                albumIdLink.href = `https://genius.com/api/albums/${albumId}`;
                albumIdLink.target = "_blank";
                albumIdLink.textContent = albumId;
                albumIdLink.className = "text_label text_label--gray text_label--x_small_text_size";
                albumIdLink.onmouseover = () => albumIdLink.style.textDecoration = "underline";
                albumIdLink.onmouseout = () => albumIdLink.style.textDecoration = "none";
                albumIdDiv.appendChild(staticTextSpan);
                albumIdDiv.appendChild(albumIdLink);
                newMetadataPreview.appendChild(albumIdDiv);
                newSecondary.appendChild(newMetadataPreview);
                newTransclude.appendChild(newSecondary);
                columnContainer.appendChild(newTransclude);
            }
            return [albumId, userId];
        }

        async function getUserRoles(userId) {
            try {
                const endpoint = `https://genius.com/api/users/${userId}`;
                const response = await fetch(endpoint);
                const data = await response.json();
                const userRoles = data?.response?.user?.roles_for_display ?? [];
                return userRoles;
            } catch (error) {
                console.error("Error:", error);
                return [];
            }
        }

        async function getSongData(html) {
            const songIdRegex = /&quot;api_path&quot;:&quot;\/songs\/(\d+)&quot;/g;
            let match;
            const songIds = [];

            while ((match = songIdRegex.exec(html)) !== null) {
                songIds.push(match[1]);
            }
            const responses = await Promise.all(songIds.map(songId =>
                fetch(`https://genius.com/api/songs/${songId}`).then(res => res.json())
            ));
            return responses;
        }


        function monitorTracklist() {
            const tracklistContainer = document.querySelector('div[ng-hide="$ctrl.editing_tracklist"]');

            if (!tracklistContainer) return;

            function getTracklistData() {
                return Array.from(document.querySelectorAll("album-tracklist-row")).map(row => {
                    const songLink = row.querySelector(".chart_row-content a")?.getAttribute("href");
                    const trackNumber = row.querySelector(".chart_row-number_container-number span")?.textContent.trim();
                    return `${trackNumber}-${songLink}`;
                });
            }

            let previousTracklist = getTracklistData();
            const observer = new MutationObserver(() => {
                const currentTracklist = getTracklistData();

                if (JSON.stringify(currentTracklist) !== JSON.stringify(previousTracklist)) {
                    previousTracklist = currentTracklist;
                    removeSongCreditsButtons();
                    getSongData();
                }
            });

            observer.observe(tracklistContainer, { childList: true, subtree: true, characterData: true });
        }

        function removeSongCreditsButtons() {
            document.querySelectorAll('button.square_button.u-bottom_margin').forEach(button => {
                const clickAction = button.getAttribute('ng-click');
                if (["$ctrl.songCredits()", "$ctrl.follow()", "$ctrl.removeZWSP()"].includes(clickAction)) {
                    button.remove();
                }
            });
        }

    }

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link || !link.href) return;

        if (link.href.startsWith('https://genius.com/albums/') || link.href.startsWith('https://genius-staging.com/albums/')) {
            event.preventDefault();
            window.location.href = link.href;
            return;
        }

        if (event.target.closest('.global_search-search_results')) {
            event.preventDefault();
            window.location.href = link.href;
            return;
        }
    });

    new MutationObserver(() => {
        document.querySelector('.global_search-search_results')?.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link) {
                event.preventDefault();
                window.location.href = link.href;
            }
        });
    }).observe(document.body, { childList: true, subtree: true });



    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                   INDICATORS                                   //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function addBlackCross(square) {
        const existingCross = square.querySelector('.black-cross');
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
            width: 112%;
            height: 3px;
            border-radius: 2px;
            background-color: black;
            transform: rotate(25deg);
        `;

            const line2 = document.createElement('div');
            line2.style.cssText = `
            position: absolute;
            width: 112%;
            height: 3px;
            border-radius: 2px;
            background-color: black;
            transform: rotate(-25deg);
        `;

            cross.appendChild(line1);
            cross.appendChild(line2);
            square.appendChild(cross);
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

    function checkAlbumTitleForZeroWidthSpace() {
        const titleElement = document.querySelector('.header_with_cover_art-primary_info-title');
        if (titleElement) {
            const titleText = titleElement.textContent.trim();
            if (titleText.includes('\u200B')) {
                const square = document.querySelector('.square-indicator');
                if (square) {
                    addBlackSquare(square);
                }
            }
        }
    }

    function checkTracklistForZeroWidthSpace() {
        const trackRows = document.querySelectorAll('album-tracklist-row');
        const zeroWidthSpaceIndices = [];
        trackRows.forEach((row, index) => {
            const h3Element = row.querySelector('h3.chart_row-content-title');
            if (h3Element) {
                let h3Text = h3Element.textContent;
                const ftIndex = h3Text.indexOf("(Ft.");
                if (ftIndex !== -1) {
                    h3Text = h3Text.substring(0, ftIndex).trim();
                }
                const byIndex = h3Text.indexOf(" by");
                if (byIndex !== -1 && h3Text.substring(byIndex).includes(" &")) {
                    h3Text = h3Text.substring(0, byIndex).trim();
                }
                if (h3Text.includes('\u200B')) {
                    zeroWidthSpaceIndices.push(index);
                    console.log(`Zero-Width-Space detected in Track ${index + 1}: ${h3Text}`);
                }
            }
        });
        return zeroWidthSpaceIndices;
    }

    function renameAlbumButtons() {
        const editTracklistButton = document.querySelector('.square_button.u-bottom_margin[ng-click*="editing_tracklist"]');
        if (editTracklistButton) editTracklistButton.textContent = 'Tracklist';
        const editAlbumInfoDiv = document.querySelector('.square_button.u-bottom_margin[ng-click*="editing = true"]');
        if (editAlbumInfoDiv) editAlbumInfoDiv.textContent = 'Album Info';
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                               COVER ALBUM PAGES                                //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function checkAlbumPage() {
        const metaTag = document.querySelector('meta[property="og:image"]');
        if (metaTag) {
            const coverImageUrl = metaTag.getAttribute('content');
            const editAlbumButton = document.querySelectorAll('.square_button.u-bottom_margin');
            if (editAlbumButton.length > 1) {
                const secondEditAlbumButton = editAlbumButton[1];
                let color, borderColor;
                if (coverImageUrl.endsWith("1000x1000x1.png")) {
                    color = '#99f2a5'; // Green
                    borderColor = '#66bfa3';
                } else if (coverImageUrl.startsWith("http://assets.genius.com/images/sharing_fallback.png")) {
                    if (document.head.innerHTML.match(/&quot;cover_art_url&quot;:&quot;http:\/\/assets.genius.com/) ||
                        document.head.innerHTML.match(/&quot;cover_art_url&quot;:&quot;https:\/\/assets.genius.com/)) {
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
                addColoredSquare(secondEditAlbumButton, color, borderColor);
                if (isGeniusAlbumAlbumPageZwsp) checkAlbumTitleForZeroWidthSpace();
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                 FOLLOW BUTTON                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    async function followButtonAlbumPage(songData) {
        const albumAdminMenu = document.querySelector('album-admin-menu');
        const storageKey = "followState";
        sessionStorage.removeItem(storageKey);
        const followButton = document.createElement('button');
        followButton.className = 'square_button u-bottom_margin';
        followButton.setAttribute('ng-click', "$ctrl.follow()");
        followButton.setAttribute('ng-if', "$ctrl.has_permission('follow')");
        followButton.textContent = 'Loading...';
        followButton.style.marginRight = "0.25rem";
        albumAdminMenu.parentNode.insertBefore(followButton, albumAdminMenu);
        const followingStates = songData.map(data => ({
            songId: data.response?.song?.id,
            following: data.response?.song?.current_user_metadata?.interactions?.following
        }));
        const initiallyFollowing = followingStates.filter(data => data.following).map(data => data.songId);
        sessionStorage.setItem(storageKey, JSON.stringify(initiallyFollowing));
        let isFollowingAll = initiallyFollowing.length === followingStates.length;
        followButton.textContent = isFollowingAll ? 'Following' : 'Follow';
        followButton.addEventListener('click', async () => {
            const storedState = JSON.parse(sessionStorage.getItem(storageKey)) || [];
            if (followButton.textContent === 'Follow') {
                const newFollows = followingStates.filter(data => !storedState.includes(data.songId));
                await Promise.all(newFollows.map(data => toggleFollowSong(data.songId, 'follow')));
                storedState.push(...newFollows.map(data => data.songId));
                sessionStorage.setItem(storageKey, JSON.stringify(storedState));
                followButton.textContent = 'Following';
            } else {
                await Promise.all(followingStates.map(data => toggleFollowSong(data.songId, 'unfollow')));
                sessionStorage.setItem(storageKey, JSON.stringify([]));
                followButton.textContent = 'Follow';
            }
        });
    }

    async function toggleFollowSong(songId, action) {
        const url = `https://genius.com/api/songs/${songId}/${action}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': document.cookie,
                'X-CSRF-Token': getCsrfToken(),
                'User-Agent': 'ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)'
            },
            body: JSON.stringify({})
        });
        return response.ok;
    }

    function getCsrfToken() {
        const match = document.cookie.match(/_csrf_token=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                TRACKLIST BUTTON                                //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function expandAllTracksInTracklist() {
        let expanded = false;
        function expandAll() {
            document.querySelectorAll('.chart_row-expand').forEach(button => {
                button.click();
            });
            expanded = !expanded;
            expandText.textContent = expanded ? "Collapse" : "Expand";
        }
        let expandText = document.createElement("span");
        expandText.textContent = "Expand";
        expandText.className = "expand-text";
        expandText.style.cursor = "pointer";
        expandText.style.textDecoration = "underline";
        expandText.addEventListener("click", expandAll);
        let header = document.querySelector("h2.text_label");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.appendChild(expandText);
    }


    function addTracklistCheckbox() {
        const observer = new MutationObserver(() => {
            const controlsContainer = document.querySelector('div[ng-if="$ctrl.editing"]');
            if (!controlsContainer) return;

            if (!controlsContainer.querySelector("#autoTrackNumberingCheckbox")) {
                controlsContainer.style.display = "flex";
                controlsContainer.style.alignItems = "center";
                controlsContainer.style.justifyContent = "space-between";

                const checkboxContainer = document.createElement('div');
                checkboxContainer.style.cssText = "display: flex; align-items: center; margin-left: auto;";

                function createCheckbox(id, text) {
                    const checkbox = document.createElement('input');
                    checkbox.type = "checkbox";
                    checkbox.id = id;
                    checkbox.className = "styled-checkbox";
                    checkbox.style.cssText = "width: 16px; height: 16px; cursor: pointer; margin-left: 0.5rem; accent-color: #99a7ee;";
                    const label = document.createElement('label');
                    label.htmlFor = id;
                    label.textContent = text;
                    label.className = "styled-label";
                    label.style.cssText = "font-size: 14px; font-weight: bold; cursor: pointer; color: #333; margin-left: 0.5rem;";
                    return { checkbox, label };
                }

                const { checkbox: checkboxAutoTrack, label: labelAutoTrack } = createCheckbox("autoTrackNumberingCheckbox", "Auto Track Numbering");
                const { checkbox: checkboxUnreleased, label: labelUnreleased } = createCheckbox("unreleasedCheckbox", "Unreleased");

                checkboxContainer.append(labelAutoTrack, checkboxAutoTrack, labelUnreleased, checkboxUnreleased);
                controlsContainer.appendChild(checkboxContainer);

                document.addEventListener("click", () => {
                    const checkboxUnreleased = document.querySelector("#unreleasedCheckbox");
                    if (!checkboxUnreleased) return;
                    checkboxUnreleased.addEventListener("change", () => {
                        const shouldActivate = checkboxUnreleased.checked;
                        document.querySelectorAll(".editable_tracklist-row-entry-unreleased_label").forEach((label) => {
                            const checkbox = label.previousElementSibling;
                            if (checkbox && checkbox.type === "checkbox") {
                                if (shouldActivate && !checkbox.checked) {
                                    label.click();
                                } else if (!shouldActivate && checkbox.checked) {
                                    label.click();
                                }
                            }
                        });
                    });
                });
            }
            startTrackListObserver();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    let trackListObserver;
    let processedElements = new Set();
    let observerInitialized = false;

    function startTrackListObserver() {
        if (observerInitialized) return;
        observerInitialized = true;
        const trackListContainer = document.querySelector(".editable_tracklist");
        trackListObserver = new MutationObserver((mutations) => {
            const checkboxAutoTrack = document.querySelector("#autoTrackNumberingCheckbox");
            const checkboxUnreleased = document.querySelector("#unreleasedCheckbox");
            if (!checkboxAutoTrack || !checkboxUnreleased) return;
            if (checkboxAutoTrack.checked) {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.matches?.(".editable_tracklist-row")) {
                            const trackNumberElement = node.querySelector(".editable_tracklist-row-number");
                            if ((!trackNumberElement || !trackNumberElement.innerText.trim()) && !processedElements.has(node)) {
                                processedElements.add(node);
                                addSongAsNext();
                            }
                        }
                    });
                });
            }
            if (checkboxUnreleased.checked) {
                addSongAsUnreleased();
            }
        });

        trackListObserver.observe(trackListContainer, { childList: true, subtree: true });
    }

    function addSongAsNext() {
        const firstPlaceholder = document.querySelector("div[ng-if='!slot.song_id'].editable_tracklist-row-placeholder");
        let songNum;
        if (firstPlaceholder) {
            const numberedSlot = firstPlaceholder.closest(".editable_tracklist-row").querySelector(".editable_tracklist-row-number");
            songNum = numberedSlot.innerText.trim();
        } else {
            const lastEntryContainer = document.querySelectorAll(".editable_tracklist-row-entry-container[ng-if='slot.song_id']");
            const lastEntry = lastEntryContainer[lastEntryContainer.length - 1];
            const lastNumberedSlot = lastEntry.closest(".editable_tracklist-row").querySelector(".editable_tracklist-row-number");
            songNum = parseInt(lastNumberedSlot.innerText.trim(), 10) + 1;
        }
        const unnumberedEntries = document.querySelectorAll(".editable_tracklist-row-entry-container");
        let lastUnnumberedSlot = null;
        for (let i = unnumberedEntries.length - 1; i >= 0; i--) {
            const slot = unnumberedEntries[i].closest(".editable_tracklist-row");
            if (!slot) continue;
            const trackNumberElement = slot.querySelector(".editable_tracklist-row-number");
            if (!trackNumberElement || !trackNumberElement.innerText.trim()) {
                lastUnnumberedSlot = slot;
                break;
            }
        }
        if (!lastUnnumberedSlot) {
            return;
        }
        const editButton = lastUnnumberedSlot.querySelector("button[aria-label='edit']");
        editButton.click();
        const input = lastUnnumberedSlot.querySelector("input.square_input.editable_tracklist-row-number-input");
        input.classList.remove("ng-empty");
        input.classList.add("ng-not-empty");
        input.value = songNum;
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
        const buttons = document.querySelectorAll(".button--unstyled");
        const button = buttons[buttons.length - 1];
        button.click();
    }

    function addSongAsUnreleased() {
        const checkboxUnreleased = document.querySelector("#unreleasedCheckbox");
        if (!checkboxUnreleased || !checkboxUnreleased.checked) return;
        document.querySelectorAll(
            'div[ng-if="slot.lyrics_state"] input[type="checkbox"], div.editable_tracklist-row-entry-container input[type="checkbox"]'
        ).forEach((checkbox) => {
            if (checkbox.checked) return;
            const label = checkbox.closest("div").querySelector(".editable_tracklist-row-entry-unreleased_label");
            if (label) label.click();
        });
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                               ALBUM COVER EDITOR                               //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    async function addAlbumCoverTextfield(albumId) {
        if (document.querySelector(".square_form-container")) return;

        const buttons = document.querySelectorAll(".square_button.square_button--transparent.square_button--gray");
        if (buttons.length > 0) {
            buttons[buttons.length - 1].style.display = "none";
        }

        const response = await fetch(`https://genius.com/api/albums/${albumId}`);
        const json = await response.json();
        const coverArts = json.response.album.cover_arts;

        const container = document.querySelector(".cover_art_form");
        if (container) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(link);

            const formWrapper = document.createElement("div");
            formWrapper.className = "square_form-container";
            formWrapper.style.paddingLeft = "1.313rem";
            formWrapper.style.alignItems = "start";

            const entriesContainer = document.createElement("div");
            entriesContainer.className = "entries_container";
            entriesContainer.style.display = "flex";
            entriesContainer.style.flexDirection = "column";
            entriesContainer.style.gap = "0.5rem";

            const buttonRow = document.createElement("div");
            buttonRow.style.display = "flex";
            buttonRow.style.gap = "10px";
            buttonRow.style.marginTop = "0.5rem";

            const addButton = document.createElement("button");
            addButton.textContent = "+ Add";
            addButton.className = "square_button square_button--gray";
            addButton.style.width = "65px";
            addButton.style.marginInlineStart = "5px";

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";
            saveButton.className = "square_button square_button--green";
            saveButton.style.width = "65px";

            buttonRow.appendChild(addButton);
            buttonRow.appendChild(saveButton);
            formWrapper.appendChild(entriesContainer);
            formWrapper.appendChild(buttonRow);
            container.appendChild(formWrapper);

            addButton.addEventListener("click", () => addInputSet());

            const inputSets = [];

            function addInputSet() {
                const inputRow = document.createElement("div");
                inputRow.style.display = "flex";
                inputRow.style.alignItems = "center";

                const checkboxContainer = document.createElement("div");
                checkboxContainer.style.display = "flex";
                checkboxContainer.style.alignItems = "baseline";
                checkboxContainer.style.flexDirection = "column-reverse";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = "cover_art_checkbox";

                const label = document.createElement("label");
                label.htmlFor = "cover_art_checkbox";
                label.innerHTML = '<i class="fas fa-edit" style="font-size: 14px;"></i>';
                label.style.cursor = "pointer";

                const textInput = document.createElement("input");
                textInput.type = "text";
                textInput.id = "cover_art_text";
                textInput.placeholder = "Nr.";
                textInput.className = "square_input square_form-standard_element_margin";
                textInput.style.margin = "4px 5px 0px";
                textInput.style.width = "45px";

                const fullWidthInput = document.createElement("input");
                fullWidthInput.type = "text";
                fullWidthInput.id = "full_width_text";
                fullWidthInput.placeholder = "Image URL";
                fullWidthInput.className = "square_input square_form-standard_element_margin";
                fullWidthInput.style.margin = "4px 2.5px 0px";
                fullWidthInput.style.width = "325px";

                checkboxContainer.appendChild(checkbox);
                checkboxContainer.appendChild(label);
                inputRow.appendChild(checkboxContainer);
                inputRow.appendChild(textInput);
                inputRow.appendChild(fullWidthInput);

                entriesContainer.appendChild(inputRow);

                inputSets.push({ checkbox, textInput, fullWidthInput });
            }

            addInputSet();

            saveButton.addEventListener("click", async function () {
                saveButton.disabled = true;

                for (const { checkbox, textInput, fullWidthInput } of inputSets) {
                    const position = parseInt(textInput.value.trim(), 10) || null;
                    const imageUrl = fullWidthInput.value.trim();

                    if (!imageUrl) return;

                    if (position === null && checkbox.checked) {
                        await sendCoverArts(imageUrl, albumId);
                        await deleteCoverArts(coverArts[0].id);

                    } else if (position && checkbox.checked) {
                        await sendCoverArts(imageUrl, albumId);
                        if (position <= coverArts.length) {
                            await moveCoverArts(position, coverId, coverArts);
                            await deleteCoverArts(coverArts[position - 1].id);
                        }

                    } else {
                        await sendCoverArts(imageUrl, albumId);
                        if (position <= coverArts.length) {
                            await moveCoverArts(position, coverId, coverArts);
                        }
                    }
                }

                const closeButton = document.querySelector(".modal_window-close_button");
                if (closeButton) {
                    closeButton.click();
                }
            });

            async function sendCoverArts(imageUrl, albumId) {
                const payload = {
                    album_id: albumId,
                    cover_art: {
                        image_url: imageUrl
                    }
                };

                try {
                    const response = await fetch("https://genius.com/api/cover_arts/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Cookie": document.cookie,
                            "X-CSRF-Token": getCsrfToken(),
                            "User-Agent": "ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)"
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error(`Fehler: ${response.status}`);
                    }

                    const json = await response.json();
                    coverId = json.response.cover_art.id;
                    return coverId;
                } catch (error) {
                    console.error("Fehler bei der POST-Anfrage:", error);
                }
            }

            async function deleteCoverArts(coverId) {
                try {
                    const response = await fetch(`https://genius.com/api/cover_arts/${coverId}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Cookie": document.cookie,
                            "X-CSRF-Token": getCsrfToken(),
                            "User-Agent": "ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)"
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Fehler: ${response.status}`);
                    }

                } catch (error) {
                    console.error("Fehler bei der DELETE-Anfrage:", error);
                }
            }

            async function moveCoverArts(position, coverId, coverArts) {
                let payload = {};

                if (position === 1) {
                    const coverBelowId = coverArts[position - 1].id;

                    payload = {
                        below_id: coverBelowId
                    };
                } else if (position > 1) {
                    const coverBelowId = coverArts[position - 1].id;
                    const coverAboveId = coverArts[position - 2].id;

                    payload = {
                        above_id: coverAboveId,
                        below_id: coverBelowId
                    };
                }

                try {
                    const response = await fetch(`https://genius.com/api/cover_arts/${coverId}/move_between`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Cookie": document.cookie,
                            "X-CSRF-Token": getCsrfToken(),
                            "User-Agent": "ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)"
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error(`Fehler: ${response.status}`);
                    }

                    const json = await response.json();
                    return json;
                } catch (error) {
                    console.error("Fehler bei der PUT-Anfrage:", error);
                }
            }
        }
    }

    function monitorCover(albumId) {
        if (!albumId) return;

        const observer = new MutationObserver(() => {
            const selectedItemCoverArt = document.querySelector(".toggleable_list_item.toggleable_list_item--selected[ng-class*='cover_art']");

            if (selectedItemCoverArt) {
                addAlbumCoverTextfield(albumId);
                observer.disconnect();

                const removeObserver = new MutationObserver(() => {
                    const newSelectedItemCoverArt = document.querySelector(".toggleable_list_item.toggleable_list_item--selected[ng-class*='cover_art']");

                    if (!newSelectedItemCoverArt) {
                        removeObserver.disconnect();
                        monitorCover(albumId);
                    }
                });

                removeObserver.observe(document.body, { childList: true, subtree: true });
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                METADATA EDITOR                                 //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function songCreditsButtonAlbumPage(songData) {
        const albumAdminMenu = document.querySelector('album-admin-menu');

        if (!albumAdminMenu) return;
        const SongCreditsButton = document.createElement('button');
        SongCreditsButton.className = 'square_button u-bottom_margin';
        SongCreditsButton.textContent = 'Song Credits';
        SongCreditsButton.setAttribute('ng-click', "$ctrl.songCredits()");
        SongCreditsButton.setAttribute('ng-if', "$ctrl.has_permission('songCredits')");
        SongCreditsButton.setAttribute('bis_skin_checked', '1');
        SongCreditsButton.style.marginRight = "0.25rem";

        albumAdminMenu.parentNode.insertBefore(SongCreditsButton, albumAdminMenu);

        let songIds = [];
        let csrfToken = '';
        let trackNumbers = [];
        let rawTrackNumbers = [];
        let existingSongsData = [];

        songIds = songData.map(data => data.response.song.id);
        csrfToken = getCsrfToken();
        ({ rawTrackNumbers, trackNumbers } = extractTrackNumbers());


        function extractTrackNumbers() {
            const trackContainers = document.querySelectorAll('.chart_row-number_container.chart_row-number_container--align_left');
            let currentTrackNumber = 0;

            trackContainers.forEach((container) => {
                const numberElement = container.querySelector('.chart_row-number_container-number span');
                const trackNumber = numberElement ? numberElement.textContent.trim() : '';
                rawTrackNumbers.push(trackNumber);

                if (trackNumber && !isNaN(trackNumber)) {
                    currentTrackNumber = parseInt(trackNumber, 10);
                } else {
                    currentTrackNumber += 1;
                }
                trackNumbers.push(currentTrackNumber);
            });

            return { rawTrackNumbers, trackNumbers };
        }


        SongCreditsButton.addEventListener('click', async () => {
            openOverlay(trackNumbers, rawTrackNumbers);

            const responses = await Promise.all(
                songIds.map(songId =>
                    fetch(`https://genius.com/api/songs/${songId}`)
                        .then(res => res.json())
                )
            );
            existingSongsData = songIds.map((songId, index) => {
                const songDetails = responses[index]?.response?.song;


                //existingSongsData = songIds.map(songId => {
                //   const songDetails = songData.find(({ response }) => response?.song?.id === songId)?.response?.song;
                return songDetails ? {
                    id: songId,
                    existingPrimaryArtists: songDetails.primary_artists || [],
                    existingPrimaryTag: songDetails.primary_tag || null,
                    existingFeaturedArtists: songDetails.featured_artists || [],
                    existingTags: songDetails.tags || [],
                    existingReleaseDate: songDetails.release_date_components || null,
                    existingYoutubeLink: songDetails.youtube_url || null,
                    existingSoundcloudLink: songDetails.soundcloud_url || null,
                    existingWriters: songDetails.writer_artists || [],
                    existingProducers: songDetails.producer_artists || [],
                    existingRecorded: songDetails.recording_location || [],
                    existingGradient: {
                        primary: songDetails.song_art_primary_color,
                        secondary: songDetails.song_art_secondary_color,
                        text: songDetails.song_art_text_color
                    } || null,
                    existingSongCover: songDetails.custom_song_art_image_url || null,
                    existingCustomPerformances: songDetails.custom_performances || [],
                    existingSongRelationships: songDetails.song_relationships || [],
                } : null;
            });

            console.log('Existing Song Data:', existingSongsData);

            const saveButton = document.getElementById('custom-save-button');
            saveButton.style.display = 'inline-block';
        });


        function openOverlay(trackNumbers, rawTrackNumbers) {

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(link);

            const style = document.createElement('style');
            style.textContent = `
                    .styled-checkbox:checked {
                        accent-color: #8e8e8e;
                    }
                    .overwrite-container {
                        accent-color: #99a7ee;
                    }
                `;
            document.head.appendChild(style);

            const overlay = createOverlay();
            document.body.appendChild(overlay);
            const form = createForm();
            overlay.appendChild(form);

            let activeTagsList;
            let roleIndex = 0;
            let primaryArtistsArray = [];
            let featuredArtistsArray = [];
            let tagsArray = [];
            let geniusLinks = [];
            let youtubeLinks = [];
            let soundcloudLinks = [];
            let producersArray = [];
            let writersArray = [];
            let recordedArray = [];
            let primaryColorArray = [];
            let secondaryColorArray = [];
            let textColorArray = [];
            let gradientCheckArray = [];
            let additionalRolesArray = [];
            let artistRolesArray = [];

            /*
            form.appendChild(createTitle('Artwork Extractor for Genius'));
            form.appendChild(createTracklist(trackNumbers, rawTrackNumbers));
            form.appendChild(createLine());
            form.appendChild(createSpacer('1.25rem'));
            
              form.appendChild(createContainer([
                  () => createRelationships(),
                  () => createInputTextField('Related album', 'related_album', 'Genius Album URL')
              ]));
              form.appendChild(createSpacer('1.00rem'));
              form.appendChild(createContainer([
                  () => createInputTagField('Primary Artists', 'primary_artists', 'artists'),
                  () => createInputPrimaryTag()
              ]));
              form.appendChild(createSpacer('1.00rem'));
              form.appendChild(createContainer([
                  () => createInputTagField('Tags', 'tags', 'tags'),
                  () => createInputReleaseDate()
              ]));
              form.appendChild(createSpacer('1.00rem'));
              form.appendChild(createContainer([
                  () => createInputTextField('YouTube URL', 'youtube_links', 'YouTube Playlist URL'),
                  () => createInputTextField('SoundCloud URL', 'soundcloud_links', 'SoundCloud Playlist URL')
              ]));
              form.appendChild(createSpacer('1.00rem'));
              form.appendChild(createContainer([
                  () => createInputTagField('Producers', 'producers', 'artists'),
                  () => createInputTagField('Writers', 'writers', 'artists')
              ]));
              form.appendChild(createSpacer('1.00rem'));
              form.appendChild(createAdditionalCredits());
              form.appendChild(createSpacer('1.75rem'));
              const { statusDisplay, saveButton, cancelButton } = createStatusSaveCancelButton();
              form.appendChild(statusDisplay);
              form.appendChild(saveButton);
              form.appendChild(cancelButton);
  */

            const order = result.functionOrder || {
                song_relationship: 1,
                related_album: 2,
                language: 3,
                primary_artists: 4,
                featured_artists: 5,
                primary_tag: 6,
                tags: 7,
                release_date: 8,
                recorded_at: 9,
                youtube_url: 10,
                soundcloud_url: 0,
                producers: 12,
                writers: 13,
                gradient: 0,
                additional_credits: 15,
            };
            const functions = [
                //{ key: 'relationship_language', fn: () => createRelationshipLanguageContainer() },
                { key: 'song_relationship', fn: () => createRelationships() },
                { key: 'related_album', fn: () => createInputTextField('Related album', 'related_album', 'Genius Album URL') },
                { key: 'language', fn: () => createLanguage() },
                { key: 'primary_artists', fn: () => createInputTagField('Primary Artists', 'primary_artists', 'artists') },
                { key: 'featured_artists', fn: () => createInputTagField('Featured Artists', 'featured_artists', 'artists') },
                { key: 'primary_tag', fn: () => createInputPrimaryTag() },
                { key: 'tags', fn: () => createInputTagField('Tags', 'tags', 'tags') },
                { key: 'release_date', fn: () => createInputReleaseDate() },
                { key: 'youtube_url', fn: () => createInputTextField('YouTube URL', 'youtube_links', 'YouTube Playlist URL') },
                { key: 'recorded_at', fn: () => createInputTextField('Recorded At', 'recorded_at', 'Add Recording Location') },
                // { key: 'gradient', fn: () => createInputColorFields() },
                { key: 'soundcloud_url', fn: () => createInputTextField('SoundCloud URL', 'soundcloud_links', 'SoundCloud Playlist URL') },
                { key: 'producers', fn: () => createInputTagField('Producers', 'producers', 'artists') },
                { key: 'writers', fn: () => createInputTagField('Writers', 'writers', 'artists') },
                { key: 'additional_credits', fn: () => createAdditionalCredits() }
            ];

            const sortedFunctions = functions
                .filter(f => order[f.key] > 0 && f.key !== 'additional_credits')
                .sort((a, b) => order[a.key] - order[b.key]);

            let groupedFunctions = [];
            const group123 = [1, 2, 3]
                .map(pos => sortedFunctions.find(f => order[f.key] === pos))
                .filter(f => f !== undefined)
                .map(f => f.fn);

            if (group123.length > 0) {
                group123._gap = (group123.length === 3) ? '0.75rem' : null;
                groupedFunctions.push(group123);
            }

            for (let i = 4; i <= 14; i += 2) {
                const group = [];

                const first = sortedFunctions.find(f => order[f.key] === i);
                if (first) group.push(first.fn);
                const second = sortedFunctions.find(f => order[f.key] === i + 1);
                if (second) group.push(second.fn);

                if (group.length > 0) groupedFunctions.push(group);
            }

            form.appendChild(createTitle('Artwork Extractor for Genius'));
            form.appendChild(createTracklist(trackNumbers, rawTrackNumbers));
            form.appendChild(createLine());
            form.appendChild(createSpacer('1.25rem'));

            groupedFunctions.forEach(group => {
                const container = createContainer(group);
                if (group._gap) {
                    container.style.gap = group._gap;
                }
                form.appendChild(container);
                form.appendChild(createSpacer('1.00rem'));
            });

            if (order['additional_credits'] === 15) {
                form.appendChild(createAdditionalCredits());
                form.appendChild(createSpacer('1.75rem'));
            }


            const { statusDisplay, saveButton, cancelButton } = createStatusSaveCancelButton();
            form.appendChild(statusDisplay);
            form.appendChild(saveButton);
            form.appendChild(cancelButton);



            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) document.body.removeChild(overlay);
            });

            saveButton.addEventListener('click', async (event) => {
                event.preventDefault();

                const checkboxStates = {
                    overwriteRelationship: document.querySelector('#overwrite_related_album')?.checked,
                    overwritePrimaryArtists: document.querySelector('#overwrite_primary_artists')?.checked,
                    overwriteFeaturedArtists: document.querySelector('#overwrite_featured_artists')?.checked,
                    overwritePrimaryTag: document.querySelector('#overwrite_primary_tag')?.checked,
                    overwriteTags: document.querySelector('#overwrite_tags')?.checked,
                    overwriteReleaseDate: document.querySelector('#overwrite_release_date')?.checked,
                    overwriteYouTube: document.querySelector('#overwrite_youtube_links')?.checked,
                    overwriteSoundCloud: document.querySelector('#overwrite_soundcloud_links')?.checked,
                    overwriteProducers: document.querySelector('#overwrite_producers')?.checked,
                    overwriteWriters: document.querySelector('#overwrite_writers')?.checked,
                    overwriteRecorded: document.querySelector('#overwrite_recorded_at')?.checked,
                    overwriteGradient: document.querySelector('#overwrite_gradient')?.checked,
                    overwriteCredits: document.querySelector('#overwrite_credits')?.checked,
                    removeRelationship: document.querySelector('#remove_related_album')?.checked,
                    removePrimaryArtists: document.querySelector('#remove_primary_artists')?.checked,
                    removeFeaturedArtists: document.querySelector('#remove_featured_artists')?.checked,
                    removePrimaryTag: document.querySelector('#remove_primary_tag')?.checked,
                    removeTags: document.querySelector('#remove_tags')?.checked,
                    removeReleaseDate: document.querySelector('#remove_release_date')?.checked,
                    removeYouTube: document.querySelector('#remove_youtube_links')?.checked,
                    removeSoundCloud: document.querySelector('#remove_soundcloud_links')?.checked,
                    removeProducers: document.querySelector('#remove_producers')?.checked,
                    removeWriters: document.querySelector('#remove_writers')?.checked,
                    removeRecorded: document.querySelector('#remove_recorded_at')?.checked,
                    removeGradient: document.querySelector('#remove_gradient')?.checked,
                    removeCredits: document.querySelector('#remove_credits')?.checked
                };

                for (let i = 0; i <= roleIndex - 1; i++) {
                    checkboxStates[`overwriteAdditionalRole${i}`] = document.querySelector(`#overwrite_additional_role_${i}`)?.checked;
                    checkboxStates[`removeAdditionalRole${i}`] = document.querySelector(`#remove_additional_role_${i}`)?.checked;
                }

                const primaryTagIds = {
                    'Pop': 16,
                    'Rap': 1434,
                    'Rock': 567,
                    'R&B': 352,
                    'Country': 413,
                    'Electronic': 606,
                    'Non-Music': 1452
                };

                const relationshipType = {
                    'Samples': 'samples',
                    'Interpolates': 'interpolates',
                    'Cover Of': 'cover_of',
                    'Remix Of': 'remix_of',
                    'Live Version Of': 'live_version_of',
                    'Translation Of': 'translation_of',
                };

                const languageType = {
                    'bosanski': 'bs',
                    'crnogorski': 'cnr',
                    'Deutsch': 'de',
                    'Österreichisches Deutsch': 'de-at',
                    'English': 'en',
                    'Español': 'es',
                    'Français': 'fr',
                    'Schweizerdeutsch': 'gsw',
                    'hrvatski': 'hr',
                    'Italiano': 'it',
                    'Kölsch': 'ksh',
                    'Македонски': 'mk',
                    'Nederlands': 'nl',
                    'Norsk': 'no',
                    'Polski': 'pl',
                    'Português': 'pt',
                    'Русский (Russian)': 'ru',
                    'srpski': 'sr',
                    'Svenska': 'sv',
                    'Türkçe': 'tr',
                    'o‘zbekcha': 'uz',
                    'Tiếng Việt': 'vi',
                    '简体中文 (Simplified Chinese)': 'zh',
                    '繁體中文 (Traditional Chinese)': 'zh-Hant',
                };

                // Credits abrufen
                const checkedSongIds = songIds.filter((songId) => {
                    const checkbox = document.querySelector(`#checkbox_${songId}`);
                    return checkbox?.checked;
                });
                const songRelationshipsPayload = geniusLinks.map((songId, index) => ({
                    type: relationshipType[document.querySelector('#relationshipSelect')?.value],
                    song_ids: [songId]
                }));
                const languagePayload = languageType[document.querySelector('#languageSelect')?.value];
                const primaryArtistsPayload = primaryArtistsArray.map(primary_artists => ({ id: primary_artists.id, name: primary_artists.name }));
                const featuredArtistsPayload = featuredArtistsArray.map(featured_artists => ({ id: featured_artists.id, name: featured_artists.name }));
                const primaryTagPayload = primaryTagIds[document.querySelector('#genreSelect')?.value];
                const tagsPayload = tagsArray.map(tag => ({ id: tag.id, name: tag.name }));
                const releaseDatePayload = {
                    month: document.querySelector('#monthSelect').value ? parseInt(document.querySelector('#monthSelect').value, 10) : null,
                    day: document.querySelector('#daySelect').value ? parseInt(document.querySelector('#daySelect').value, 10) : null,
                    year: document.querySelector('#yearSelect').value ? parseInt(document.querySelector('#yearSelect').value, 10) : null
                };
                const youtubePayload = youtubeLinks;
                const producersPayload = producersArray.map(producer => ({ id: producer.id, name: producer.name }));
                const writersPayload = writersArray.map(writer => ({ id: writer.id, name: writer.name }));
                const recordedPayload = recordedArray;
                const gradientPayload = {
                    primary: primaryColorArray,
                    secondary: secondaryColorArray,
                    text: textColorArray,
                    contrast: gradientCheckArray
                };
                const additionalCreditsPayload = additionalRolesArray.map((role, index) => {
                    const label = role[0]?.label;
                    const artists = artistRolesArray[index]?.map(artist => ({ id: artist.id, name: artist.name })) || [];

                    if (label && artists.length > 0) {
                        return { label, artists };
                    }

                    return null;
                }).filter(entry => entry !== null);

                /*
                                const additionalCreditsPayload = additionalRolesArray.map((role, index) => ({
                                    label: role[0]?.label,
                                    artists: artistRolesArray[index]?.map(artist => ({ id: artist.id, name: artist.name })) || []
                                }));
                
                */
                console.log('Song ID Checkboxes:', checkedSongIds);
                console.log('Checkbox States:', checkboxStates);
                console.log('Song Relationships:', songRelationshipsPayload);
                console.log('Language:', languagePayload);
                console.log('Primary Artists:', primaryArtistsPayload);
                console.log('Featured Artists:', featuredArtistsPayload);
                console.log('Primary Tag:', primaryTagPayload);
                console.log('Tags:', tagsPayload);
                console.log('Release Date:', releaseDatePayload);
                console.log('YouTube-Links:', youtubePayload);
                console.log('Producers:', producersPayload);
                console.log('Writers:', writersPayload);
                console.log('Recorded At:', recordedPayload);
                console.log('Gradient:', gradientPayload);
                console.log('Additional Credits:', additionalCreditsPayload);

                for (let i = 0; i < checkedSongIds.length; i++) {
                    const songId = checkedSongIds[i];
                    const currentIndex = i + 1;
                    await processSong(
                        songId,
                        existingSongsData,
                        checkboxStates,
                        primaryArtistsPayload,
                        featuredArtistsPayload,
                        primaryTagPayload,
                        tagsPayload,
                        releaseDatePayload,
                        youtubePayload,
                        producersPayload,
                        writersPayload,
                        recordedPayload,
                        gradientPayload,
                        additionalCreditsPayload,
                        songRelationshipsPayload,
                        languagePayload,
                        currentIndex,
                        checkedSongIds.length
                    );
                }

                //const promises = checkedSongIds.map(songId => processSong(songId, existingSongsData, checkboxStates,
                //    primaryArtistsPayload, featuredArtistsPayload, primaryTagPayload, tagsPayload, releaseDatePayload, youtubePayload, producersPayload, writersPayload, recordedPayload, gradientPayload, additionalCreditsPayload, songRelationshipsPayload, languagePayload));
                //await Promise.all(promises);

                async function processSong(
                    songId,
                    existingSongsData,
                    checkboxStates,
                    primaryArtistsPayload,
                    featuredArtistsPayload,
                    primaryTagPayload,
                    tagsPayload,
                    releaseDatePayload,
                    youtubePayload,
                    producersPayload,
                    writersPayload,
                    recordedPayload,
                    gradientPayload,
                    additionalCreditsPayload,
                    songRelationshipsPayload,
                    languagePayload,
                    currentIndex,
                    totalCount
                ) {
                    const existingSongData = existingSongsData.find(song => song.id === songId);
                    if (!existingSongData) return;

                    statusDisplay.innerHTML = `Saving Track <strong>${currentIndex}</strong> of <strong>${totalCount}</strong>...`;


                    let { existingPrimaryArtists, existingFeaturedArtists, existingPrimaryTag, existingTags, existingReleaseDate, existingYoutubeLink, existingSoundcloudLink, existingWriters, existingProducers, existingRecorded, existingGradient, existingSongCover, existingCustomPerformances, existingSongRelationships } = existingSongData;

                    const songIndex = songIds.indexOf(songId);

                    const payload = {
                        text_format: "html,markdown",
                        song: {}
                    };


                    if (primaryArtistsPayload.length != 0 || checkboxStates.overwritePrimaryArtists || checkboxStates.removePrimaryArtists) {
                        if (checkboxStates.overwritePrimaryArtists && primaryArtistsPayload) {
                            payload.song.primary_artists = primaryArtistsPayload;
                        } else if (checkboxStates.removePrimaryArtists && primaryArtistsPayload) {
                            const remainingArtists = existingPrimaryArtists.filter(existingPrimaryArtist => !primaryArtistsPayload.some(removeArtist => removeArtist.id === existingPrimaryArtist.id));
                            payload.song.primary_artists = remainingArtists.length > 0 ? remainingArtists : existingPrimaryArtists.slice(0, 1);
                        } else {
                            payload.song.primary_artists = [
                                ...existingPrimaryArtists,
                                ...primaryArtistsPayload.filter(newPrimaryArtist => !existingPrimaryArtists.some(existingPrimaryArtist => existingPrimaryArtist.id === newPrimaryArtist.id))
                            ];
                        }
                    }

                    if (featuredArtistsPayload.length != 0 || checkboxStates.overwriteFeaturedArtists || checkboxStates.removeFeaturedArtists) {
                        if (checkboxStates.overwriteFeaturedArtists && featuredArtistsPayload) {
                            payload.song.featured_artists = featuredArtistsPayload;
                        } else if (checkboxStates.removeFeaturedArtists && featuredArtistsPayload) {
                            const isMarkedForDeletion = featuredArtistsPayload.length === 1 && featuredArtistsPayload[0].id === 87999;
                            if (isMarkedForDeletion) {
                                payload.song.featured_artists = [];
                            } else {
                                payload.song.featured_artists = existingFeaturedArtists.filter(
                                    existingFeaturedArtist => !featuredArtistsPayload.some(removeFeaturedArtist => removeFeaturedArtist.id === existingFeaturedArtist.id)
                                );
                            }
                        } else {
                            payload.song.featured_artists = [
                                ...existingFeaturedArtists,
                                ...featuredArtistsPayload.filter(
                                    newFeaturedArtist => !existingFeaturedArtists.some(existingFeaturedArtist => existingFeaturedArtist.id === newFeaturedArtist.id)
                                )
                            ];
                        }
                    }

                    if (primaryTagPayload || checkboxStates.overwritePrimaryTag || checkboxStates.removePrimaryTag) {
                        if (checkboxStates.overwritePrimaryTag && primaryTagPayload) {
                            existingTags = existingTags.filter(tag => tag.id !== existingPrimaryTag.id);
                            payload.song.primary_tag_id = primaryTagPayload;
                        } else if (checkboxStates.removePrimaryTag && primaryTagPayload) {
                            existingTags = existingTags.filter(tag => !Object.values(primaryTagIds).includes(tag.id));
                            payload.song.primary_tag_id = primaryTagPayload;
                        } else {
                            payload.song.primary_tag_id = primaryTagPayload;
                        }
                    }

                    if (tagsPayload.length != 0 || checkboxStates.overwriteTags || checkboxStates.removeTags || checkboxStates.overwritePrimaryTag || checkboxStates.removePrimaryTag) {
                        if (checkboxStates.overwriteTags && tagsPayload) {
                            payload.song.tags = tagsPayload;
                        } else if (checkboxStates.removeTags && tagsPayload) {
                            payload.song.tags = existingTags.filter(existingTag => !tagsPayload.some(removeTag => removeTag.id === existingTag.id));
                        } else {
                            payload.song.tags = [...existingTags, ...tagsPayload.filter(newTag => !existingTags.some(existingTag => existingTag.id === newTag.id))];
                        }
                    }

                    if (youtubePayload.length != 0 || checkboxStates.overwriteYouTube || checkboxStates.removeYouTube) {
                        if (checkboxStates.overwriteYouTube && youtubePayload) {
                            payload.song.youtube_url = youtubePayload[songIndex];
                        } else if (checkboxStates.removeYouTube && youtubeLinks === "Delete") {
                            payload.song.youtube_url = null;
                        } else if (!existingYoutubeLink) {
                            payload.song.youtube_url = youtubePayload[songIndex];
                        }
                    }

                    if ((releaseDatePayload?.day != null || releaseDatePayload?.month != null || releaseDatePayload?.year != null) || checkboxStates.overwriteReleaseDate || checkboxStates.removeReleaseDate) {
                        if (checkboxStates.overwriteReleaseDate && (releaseDatePayload?.day != null || releaseDatePayload?.month != null || releaseDatePayload?.year != null)) {
                            payload.song.release_date_components = {
                                day: releaseDatePayload?.day || null,
                                month: releaseDatePayload?.month || null,
                                year: releaseDatePayload?.year || null
                            };
                        } else if (checkboxStates.removeReleaseDate) {
                            payload.song.release_date_components = {
                                day: (releaseDatePayload?.day === 31) ? null : existingReleaseDate?.day || null,
                                month: (releaseDatePayload?.month === 12) ? null : existingReleaseDate?.month || null,
                                year: (releaseDatePayload?.year === 1900) ? null : existingReleaseDate?.year || null
                            };
                        } /*else {
                            payload.song.release_date_components = {
                                day: existingReleaseDate?.day || releaseDatePayload?.day || null,
                                month: existingReleaseDate?.month || releaseDatePayload?.month || null,
                                year: existingReleaseDate?.year || releaseDatePayload?.year || null
                            };
                        }*/
                        else {
                            const hasPayloadDay = releaseDatePayload?.day != null;
                            const hasPayloadMonth = releaseDatePayload?.month != null;
                            const hasPayloadYear = releaseDatePayload?.year != null;

                            const hasExistingDay = existingReleaseDate?.day != null;
                            const hasExistingMonth = existingReleaseDate?.month != null;
                            const hasExistingYear = existingReleaseDate?.year != null;

                            if (hasExistingYear && hasExistingMonth && hasExistingDay) {
                                payload.song.release_date_components = {
                                    day: existingReleaseDate.day,
                                    month: existingReleaseDate.month,
                                    year: existingReleaseDate.year
                                };
                            } else if (hasExistingYear && hasExistingMonth) {
                                const sameMonth = releaseDatePayload.month === existingReleaseDate?.month;
                                const sameYear = releaseDatePayload.year === existingReleaseDate?.year;

                                payload.song.release_date_components = {
                                    day: (sameMonth && sameYear) ? releaseDatePayload.day || existingReleaseDate?.day || null : existingReleaseDate?.day || null,
                                    month: existingReleaseDate.month,
                                    year: existingReleaseDate.year
                                };
                            } else if (hasExistingYear) {
                                const sameYear = releaseDatePayload.year === existingReleaseDate?.year;

                                payload.song.release_date_components = {
                                    day: sameYear ? releaseDatePayload.day || existingReleaseDate?.day || null : existingReleaseDate?.day || null,
                                    month: sameYear ? releaseDatePayload.month || existingReleaseDate?.month || null : existingReleaseDate?.month || null,
                                    year: existingReleaseDate.year
                                };
                            } else {
                                payload.song.release_date_components = {
                                    day: releaseDatePayload?.day || null,
                                    month: releaseDatePayload?.month || null,
                                    year: releaseDatePayload?.year || null
                                };
                            }
                        }
                    }

                    if (producersPayload.length != 0 || checkboxStates.overwriteProducers || checkboxStates.removeProducers) {
                        if (checkboxStates.overwriteProducers && producersPayload) {
                            payload.song.producer_artists = producersPayload;
                        } else if (checkboxStates.removeProducers && producersPayload) {
                            const isMarkedForDeletion = producersPayload.length === 1 && producersPayload[0].id === 87999;
                            if (isMarkedForDeletion) {
                                payload.song.producer_artists = [];
                            } else {
                                payload.song.producer_artists = existingProducers.filter(
                                    existingProducer => !producersPayload.some(removeProducer => removeProducer.id === existingProducer.id)
                                );
                            }
                        } else {
                            payload.song.producer_artists = [
                                ...existingProducers,
                                ...producersPayload.filter(
                                    newProducer => !existingProducers.some(existingProducer => existingProducer.id === newProducer.id)
                                )
                            ];
                        }
                    }

                    if (writersPayload.length != 0 || checkboxStates.overwriteWriters || checkboxStates.removeWriters) {
                        if (checkboxStates.overwriteWriters && writersPayload) {
                            payload.song.writer_artists = writersPayload;
                        } else if (checkboxStates.removeWriters && writersPayload) {
                            const isMarkedForDeletion = writersPayload.length === 1 && writersPayload[0].id === 87999;
                            if (isMarkedForDeletion) {
                                payload.song.writer_artists = [];
                            } else {
                                payload.song.writer_artists = existingWriters.filter(
                                    existingWriter => !writersPayload.some(removeWriter => removeWriter.id === existingWriter.id)
                                );
                            }
                        } else {
                            payload.song.writer_artists = [
                                ...existingWriters,
                                ...writersPayload.filter(
                                    newWriter => !existingWriters.some(existingWriter => existingWriter.id === newWriter.id)
                                )
                            ];
                        }
                    }

                    if (recordedPayload.length != 0 || checkboxStates.overwriteRecorded || checkboxStates.removeRecorded) {
                        if (checkboxStates.overwriteRecorded && recordedPayload) {
                            payload.song.recording_location = recordedPayload;
                        } else if (checkboxStates.removeRecorded && recordedPayload === "Delete") {
                            payload.song.recording_location = null;
                        } else if (existingRecorded.length === 0) {
                            payload.song.recording_location = recordedPayload;
                        }
                    }

                    if (gradientPayload.length != 0) {
                        if (checkboxStates.removeGradient && gradientPayload) {
                            payload.song.song_art_primary_color = gradientPayload.primary;
                            payload.song.song_art_secondary_color = gradientPayload.secondary;
                            payload.song.song_art_text_color = gradientPayload.text;
                            payload.song.valid_song_art_contrast = gradientPayload.contrast;
                        } else if (!existingSongCover && checkboxStates.overwriteGradient && gradientPayload) {
                            payload.song.song_art_primary_color = gradientPayload.primary;
                            payload.song.song_art_secondary_color = gradientPayload.secondary;
                            payload.song.song_art_text_color = gradientPayload.text;
                            payload.song.valid_song_art_contrast = gradientPayload.contrast;
                        } else if (!existingSongCover && gradientPayload &&
                            existingSongsData.some(song => song.existingGradient &&
                                song.existingGradient.primary === gradientPayload.primary &&
                                song.existingGradient.secondary === gradientPayload.secondary &&
                                song.existingGradient.text === gradientPayload.text)) {
                            payload.song.song_art_primary_color = gradientPayload.primary;
                            payload.song.song_art_secondary_color = gradientPayload.secondary;
                            payload.song.song_art_text_color = gradientPayload.text;
                            payload.song.valid_song_art_contrast = gradientPayload.contrast;
                        }
                    }

                    if (additionalCreditsPayload.length !== 0) {
                        let updatedPerformances = [...existingCustomPerformances];

                        additionalCreditsPayload.forEach((newRole, index) => {
                            const label = newRole.label;
                            const overwrite = checkboxStates[`overwriteAdditionalRole${index}`];
                            const remove = checkboxStates[`removeAdditionalRole${index}`];

                            const existingIndex = updatedPerformances.findIndex(role => role.label === label);

                            if (overwrite) {
                                if (existingIndex !== -1) {
                                    updatedPerformances[existingIndex] = {
                                        label,
                                        artists: newRole.artists.map(({ id, name }) => ({ id, name }))
                                    };
                                } else {
                                    updatedPerformances.push({
                                        label,
                                        artists: newRole.artists.map(({ id, name }) => ({ id, name }))
                                    });
                                }

                            } else if (remove) {
                                if (existingIndex !== -1) {
                                    const existingRole = updatedPerformances[existingIndex];
                                    const filteredArtists = existingRole.artists.filter(artist =>
                                        !newRole.artists.some(toRemove => toRemove.id === artist.id)
                                    );

                                    if (filteredArtists.length === 0 || newRole.artists.some(artist => artist.id === 87999)) {
                                        updatedPerformances.splice(existingIndex, 1);
                                    } else {
                                        updatedPerformances[existingIndex] = {
                                            label,
                                            artists: filteredArtists
                                        };
                                    }
                                }

                            } else {
                                if (existingIndex !== -1) {
                                    const combinedArtists = [
                                        ...updatedPerformances[existingIndex].artists,
                                        ...newRole.artists
                                    ].filter((artist, i, self) =>
                                        self.findIndex(a => a.id === artist.id) === i
                                    );

                                    updatedPerformances[existingIndex] = {
                                        label,
                                        artists: combinedArtists
                                    };
                                } else {
                                    updatedPerformances.push({
                                        label,
                                        artists: newRole.artists.map(({ id, name }) => ({ id, name }))
                                    });
                                }
                            }
                        });

                        payload.song.custom_performances = updatedPerformances;
                    }

                    /*
                    if (additionalCreditsPayload.length != 0) {
                        const { overwrite, remove } = {
                            overwrite: checkboxStates[`overwriteAdditionalRole${roleIndex - 1}`],
                            remove: checkboxStates[`removeAdditionalRole${roleIndex - 1}`]
                        };
 
                        if (overwrite) {
                            let updatedPerformances = existingCustomPerformances.map(existingRole => {
                                const newRole = additionalCreditsPayload.find(newRole => newRole.label === existingRole.label);
                                return newRole ? { label: newRole.label, artists: newRole.artists.map(({ id, name }) => ({ id, name })) } : existingRole;
                            });
 
                            additionalCreditsPayload
                                .filter(newRole => !existingCustomPerformances.some(existingRole => existingRole.label === newRole.label))
                                .forEach(newRole => updatedPerformances.push({ label: newRole.label, artists: newRole.artists.map(({ id, name }) => ({ id, name })) }));
 
                            payload.song.custom_performances = updatedPerformances;
 
                        } else if (remove) {
                            payload.song.custom_performances = existingCustomPerformances
                                .map(existingRole => {
                                    const roleToModify = additionalCreditsPayload.find(newRole => newRole.label === existingRole.label);
                                    if (!roleToModify) return existingRole;
 
                                    const filteredArtists = existingRole.artists.filter(artist =>
                                        !roleToModify.artists.some(toRemove => toRemove.id === artist.id)
                                    );
 
                                    return (filteredArtists.length === 0 || roleToModify.artists.some(artist => artist.id === 87999))
                                        ? null
                                        : { label: existingRole.label, artists: filteredArtists };
                                })
                                .filter(Boolean);
                        } else {
                            let updatedPerformances = existingCustomPerformances.map(existingRole => {
                                const newRole = additionalCreditsPayload.find(newRole => newRole.label === existingRole.label);
 
                                return newRole ? {
                                    label: existingRole.label,
                                    artists: [...existingRole.artists, ...newRole.artists].filter((artist, index, self) =>
                                        self.findIndex(a => a.id === artist.id) === index
                                    )
                                } : existingRole;
                            });
 
                            additionalCreditsPayload
                                .filter(newRole => !existingCustomPerformances.some(existingRole => existingRole.label === newRole.label))
                                .forEach(newRole => updatedPerformances.push({
                                    label: newRole.label,
                                    artists: newRole.artists.map(({ id, name }) => ({ id, name }))
                                }));
 
                            payload.song.custom_performances = updatedPerformances;
                        }
                    }
                    */

                    if (songRelationshipsPayload[songIndex] || checkboxStates.overwriteRelationship || checkboxStates.removeRelationship) {
                        if (checkboxStates.overwriteRelationship && songRelationshipsPayload[songIndex]) {
                            const existingRelationships = existingSongsData.find(song => song.id === songIds[songIndex])?.existingSongRelationships || [];

                            payload.song.song_relationships_by_id = existingRelationships.map(rel => ({
                                song_ids: rel.songs?.map(song => song.id) || [],
                                type: rel.type
                            }));

                            const newRelationship = {
                                song_ids: songRelationshipsPayload[songIndex].song_ids,
                                type: songRelationshipsPayload[songIndex].type
                            };

                            const updatedRelationships = payload.song.song_relationships_by_id.filter(rel => rel.type !== newRelationship.type);
                            payload.song.song_relationships_by_id = [...updatedRelationships, newRelationship];
                        } else if (checkboxStates.removeRelationship && songRelationshipsPayload) {
                            const existingRelationships = existingSongsData.find(song => song.id === songIds[songIndex])?.existingSongRelationships || [];

                            payload.song.song_relationships_by_id = existingRelationships.map(rel => ({
                                song_ids: rel.songs?.map(song => song.id) || [],
                                type: rel.type
                            }));

                            const relationshipToRemove = songRelationshipsPayload[songIndex];
                            const existingRelationship = payload.song.song_relationships_by_id.find(rel => rel.type === relationshipToRemove.type);

                            if (relationshipToRemove.song_ids.includes("Delete")) {
                                existingRelationship.song_ids = [];
                            } else {
                                existingRelationship.song_ids = existingRelationship.song_ids.filter(id => !relationshipToRemove.song_ids.includes(String(id)));
                            }
                        } else {
                            const existingRelationships = existingSongsData.find(song => song.id === songIds[songIndex])?.existingSongRelationships || [];

                            payload.song.song_relationships_by_id = existingRelationships.map(rel => ({
                                song_ids: rel.songs?.map(song => song.id) || [],
                                type: rel.type
                            }));

                            const newRelationship = {
                                song_ids: songRelationshipsPayload[songIndex].song_ids,
                                type: songRelationshipsPayload[songIndex].type
                            };

                            const existingRelationship = payload.song.song_relationships_by_id.find(rel => rel.type === newRelationship.type);
                            existingRelationship.song_ids = [...new Set([...existingRelationship.song_ids, ...newRelationship.song_ids])];
                        }
                    }

                    if (languagePayload) {
                        payload.song.language = languagePayload;
                    }

                    console.log(`Payload for Song ID ${songId}:`, payload);

                    sendUpdateRequest(songId, payload);
                    await new Promise(resolve => setTimeout(resolve, 400));
                }

                async function sendUpdateRequest(songId, payload) {
                    const url = `https://genius.com/api/songs/${songId}`;
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cookie': document.cookie,
                            'X-CSRF-Token': getCsrfToken(),
                            'User-Agent': 'ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        console.error(`Fehler beim Speichern der Tags für Song-ID ${songId}:`, response.statusText);
                    } else {
                        console.log(`Tags erfolgreich für Song-ID ${songId} gespeichert.`);
                    }
                }

                setTimeout(() => {
                    document.body.removeChild(overlay);

                    const albumButtons = document.querySelectorAll('.square_button.u-bottom_margin');
                    albumButtons.forEach((button, index) => {
                        if (index >= 2) button.remove();
                    });
                    const expandButton = document.querySelector('.expand-text');
                    if (expandButton) {
                        expandButton.remove();
                    }
                    const albumId = document.querySelectorAll('[ng-transclude-slot="secondary"]');
                    if (albumId.length > 1) {
                        albumId[1].remove();
                    }

                    checkPage()
                }, 1000);

            });

            cancelButton.addEventListener('click', (event) => {
                event.preventDefault();
                document.body.removeChild(overlay);
            });

            const closeButtonContainer = createCloseButton();
            form.appendChild(closeButtonContainer);
            closeButtonContainer.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });



            function createLine() {
                const horizontalLine = document.createElement('hr');
                horizontalLine.style.border = 'none';
                horizontalLine.style.borderTop = '0.5rem solid #ccc';
                horizontalLine.style.margin = '1rem 0';
                return horizontalLine;
            }

            function createSpacer(marginHeight) {
                const spacer = document.createElement('div');
                spacer.style.margin = `${marginHeight} 0`;
                return spacer;
            }

            function createOverlay() {
                const overlay = document.createElement('div');
                overlay.className = 'overlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                overlay.style.display = 'flex';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.zIndex = '1000';
                return overlay
            }

            function createForm() {
                const form = document.createElement('form');
                form.className = 'EditMetadataModal__Form-sc-89607f9a-1 ASljL';
                form.style.backgroundColor = '#e9e9e9';
                form.style.padding = '20px';
                form.style.borderRadius = '5px';
                form.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.8)';
                form.style.width = '80%';
                form.style.maxWidth = '800px';
                form.style.height = '96%';
                form.style.overflowY = 'auto';
                form.style.boxSizing = 'border-box';
                return form;
            }

            function createTitle(title) {
                const titleContainer = document.createElement('div');
                titleContainer.style.backgroundColor = '#99a7ee';
                titleContainer.style.color = '#fff';
                titleContainer.style.textAlign = 'center';
                titleContainer.style.marginTop = '-20px';
                titleContainer.style.marginLeft = '-20px';
                titleContainer.style.marginRight = '-20px';
                titleContainer.style.padding = '1px';
                titleContainer.style.fontWeight = 'bold';
                titleContainer.textContent = title;
                return titleContainer;
            }

            function createTracklist(trackNumbers, rawTrackNumbers) {
                const tracklistContainer = document.createElement('div');
                tracklistContainer.style.flexDirection = 'column';
                tracklistContainer.style.paddingTop = '1rem';

                const tracklistLabel = document.createElement('div');
                tracklistLabel.className = 'text_label';
                tracklistLabel.textContent = 'Tracklist';
                tracklistLabel.style.display = 'flex';
                tracklistLabel.style.alignItems = 'center';
                tracklistLabel.style.justifyContent = 'space-between';

                const allTracksContainer = document.createElement('div');
                allTracksContainer.className = 'overwrite-container';
                allTracksContainer.style.display = 'flex';
                allTracksContainer.style.alignItems = 'center';

                const allTracksButton = document.createElement('div');
                allTracksButton.id = 'toggle_all_tracks';
                allTracksButton.textContent = 'All / None';
                allTracksButton.style.cursor = 'pointer';
                allTracksButton.style.textDecoration = 'underline';
                allTracksButton.style.display = 'inline-block';

                allTracksButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    const checkboxes = document.querySelectorAll('.styled-checkbox');
                    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
                    checkboxes.forEach(checkbox => checkbox.checked = !allSelected);
                });

                allTracksContainer.appendChild(allTracksButton);
                tracklistLabel.appendChild(allTracksContainer);

                const checkboxContainer = document.createElement('div');
                checkboxContainer.style.display = 'grid';

                const itemsPerRow = Math.ceil(trackNumbers.length / Math.ceil(trackNumbers.length / 15));
                checkboxContainer.style.gridTemplateColumns = `repeat(${itemsPerRow}, auto)`;

                tracklistContainer.appendChild(tracklistLabel);
                tracklistContainer.appendChild(checkboxContainer);

                function toRoman(num) {
                    const romanMap = [
                        ['M', 1000],
                        ['CM', 900],
                        ['D', 500],
                        ['CD', 400],
                        ['C', 100],
                        ['XC', 90],
                        ['L', 50],
                        ['XL', 40],
                        ['X', 10],
                        ['IX', 9],
                        ['V', 5],
                        ['IV', 4],
                        ['I', 1],
                    ];
                    let roman = '';
                    romanMap.forEach(([symbol, value]) => {
                        while (num >= value) {
                            roman += symbol;
                            num -= value;
                        }
                    });
                    return roman;
                }

                let autoCounter = 1;
                songIds.forEach((songId, index) => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.style.display = 'flex';
                    checkboxDiv.style.alignItems = 'center';
                    checkboxDiv.style.justifyContent = 'center';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `checkbox_${songId}`;
                    checkbox.name = `song_${songId}`;

                    const rawTrackNumber = rawTrackNumbers[index];
                    checkbox.checked = rawTrackNumber !== '';
                    checkbox.className = 'styled-checkbox';
                    checkbox.style.cursor = 'pointer';

                    const label = document.createElement('label');
                    label.htmlFor = `checkbox_${songId}`;
                    label.textContent = rawTrackNumber !== '' ? `${rawTrackNumber}` : toRoman(autoCounter++);
                    label.style.marginLeft = '0.25rem';
                    label.style.textAlign = songIds.length <= 15 ? 'left' : 'right';
                    label.style.width = '0.85rem';
                    label.style.display = 'inline-block';
                    label.style.cursor = 'pointer';

                    checkboxDiv.appendChild(checkbox);
                    checkboxDiv.appendChild(label);
                    checkboxContainer.appendChild(checkboxDiv);
                });

                tracklistContainer.appendChild(tracklistLabel);
                tracklistContainer.appendChild(checkboxContainer);
                return tracklistContainer;
            }

            function createOverwriteContainer(overwriteCheckboxId, removeCheckboxId, parentLabel) {
                const overwriteContainer = document.createElement('div');
                overwriteContainer.className = 'overwrite-container';
                overwriteContainer.style.display = 'flex';
                overwriteContainer.style.alignItems = 'center';

                const overwriteCheckbox = document.createElement('input');
                overwriteCheckbox.type = 'checkbox';
                overwriteCheckbox.id = overwriteCheckboxId;
                overwriteCheckbox.style.marginLeft = '0.6rem';
                overwriteCheckbox.style.cursor = 'pointer';

                const removeCheckbox = document.createElement('input');
                removeCheckbox.type = 'checkbox';
                removeCheckbox.id = removeCheckboxId;
                removeCheckbox.style.marginLeft = '0.6rem';
                removeCheckbox.style.cursor = 'pointer';

                const overwriteLabel = document.createElement('label');
                overwriteLabel.htmlFor = overwriteCheckboxId;
                overwriteLabel.innerHTML = '<i class="fas fa-edit" style="font-size: 14px;"></i>';
                overwriteLabel.style.marginLeft = '0.15rem';
                overwriteLabel.style.cursor = 'pointer';

                const removeLabel = document.createElement('label');
                removeLabel.htmlFor = removeCheckboxId;
                removeLabel.innerHTML = '<i class="fas fa-trash" style="font-size: 14px;"></i>';
                removeLabel.style.marginLeft = '0.15rem';
                removeLabel.style.cursor = 'pointer';

                const warningText = document.createElement('div');
                warningText.textContent = 'Warnung';
                warningText.style.color = 'red';
                warningText.style.marginLeft = '0.6rem';
                warningText.style.fontWeight = 'bold';
                warningText.style.display = 'none';
                warningText.style.fontSize = '10px';

                function toggleCheckbox(checkedBox, otherBox) {
                    if (checkedBox.checked) {
                        otherBox.checked = false;
                    }
                    updateWarningText();
                }

                function updateWarningText() {
                    if (overwriteCheckbox.checked) {
                        warningText.textContent = 'Data will be replaced';
                        warningText.style.display = 'block';
                    } else if (removeCheckbox.checked) {
                        warningText.textContent = 'Data will be removed';
                        warningText.style.display = 'block';
                    } else {
                        warningText.style.display = 'none';
                    }
                }

                overwriteCheckbox.addEventListener('change', () => toggleCheckbox(overwriteCheckbox, removeCheckbox));
                removeCheckbox.addEventListener('change', () => toggleCheckbox(removeCheckbox, overwriteCheckbox));

                overwriteContainer.appendChild(warningText);
                overwriteContainer.appendChild(overwriteCheckbox);
                overwriteContainer.appendChild(overwriteLabel);
                overwriteContainer.appendChild(removeCheckbox);
                overwriteContainer.appendChild(removeLabel);
                parentLabel.appendChild(overwriteContainer);
            }

            function createContainer(inputFunctions) {
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.justifyContent = 'space-between';
                inputFunctions.forEach((inputFunction) => {
                    const element = inputFunction();
                    const inputContainer = element.inputContainer ? element.inputContainer : element;
                    container.appendChild(inputContainer);
                    if (element.tagsList) {
                        const inputElement = inputContainer.querySelector('input[type="text"]');
                        if (inputElement) {
                            inputElement.addEventListener('focus', () => { activeTagsList = element.tagsList; });
                        }
                    }
                });
                return container;
            }

            function createRelationships() {
                const relationshipContainer = document.createElement('div');
                relationshipContainer.className = 'square_form-input_and_label square_form-input_and_label--half_width';

                const relationshipLabel = document.createElement('div');
                relationshipLabel.className = 'text_label';
                relationshipLabel.style.display = 'flex';
                relationshipLabel.style.alignItems = 'center';
                relationshipLabel.style.justifyContent = 'space-between';
                relationshipLabel.textContent = 'Song Relationship';
                relationshipLabel.style.marginBottom = '0.5rem';

                relationshipContainer.appendChild(relationshipLabel);

                const relationshipInputContainer = document.createElement('div');
                relationshipInputContainer.className = 'u-bottom_margin';
                relationshipInputContainer.style.display = 'flex';
                relationshipInputContainer.style.justifyContent = 'space-between';

                const relationshipSelect = document.createElement('select');
                relationshipSelect.className = 'select_input';
                relationshipSelect.innerHTML = '<option value="" disabled selected>Song Relationship</option>';
                relationshipSelect.id = 'relationshipSelect';

                const relationships = ['Samples', 'Interpolates', 'Cover Of', 'Remix Of', 'Live Version Of', 'Translation Of'];
                relationships.forEach(relationship => {
                    const option = document.createElement('option');
                    option.value = relationship;
                    option.textContent = relationship;
                    relationshipSelect.appendChild(option);
                });

                const relationshipDiv = document.createElement('div');
                relationshipDiv.className = 'square_select_group-single';
                relationshipDiv.style.width = '100%';
                relationshipDiv.appendChild(relationshipSelect);
                relationshipInputContainer.appendChild(relationshipDiv);

                const relationshipSeparator = document.createElement('span');
                relationshipSeparator.className = 'square_select_group-separator u-clickable u-quarter_left_margin';
                relationshipSeparator.innerHTML = '<svg src="x.svg" class="inline_icon inline_icon--gray" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>';
                relationshipSeparator.style.marginLeft = '.35rem';
                relationshipSeparator.style.alignContent = 'center';
                relationshipSeparator.addEventListener('click', () => {
                    relationshipSelect.value = '';
                });

                relationshipInputContainer.appendChild(relationshipSeparator);
                relationshipContainer.appendChild(relationshipInputContainer);
                return relationshipContainer;
            }

            function createLanguage() {
                const languageContainer = document.createElement('div');
                languageContainer.className = 'square_form-input_and_label square_form-input_and_label--half_width';

                const languageLabel = document.createElement('div');
                languageLabel.className = 'text_label';
                languageLabel.style.display = 'flex';
                languageLabel.style.alignItems = 'center';
                languageLabel.style.justifyContent = 'space-between';
                languageLabel.textContent = 'Language';
                languageLabel.style.marginBottom = '0.5rem';

                languageContainer.appendChild(languageLabel);

                const languageInputContainer = document.createElement('div');
                languageInputContainer.className = 'u-bottom_margin';
                languageInputContainer.style.display = 'flex';
                languageInputContainer.style.justifyContent = 'space-between';

                const languageSelect = document.createElement('select');
                languageSelect.className = 'select_input';
                languageSelect.innerHTML = '<option value="" disabled selected>Language</option>';
                languageSelect.id = 'languageSelect';

                const languages = [
                    'bosanski',
                    'crnogorski',
                    'Deutsch',
                    'Österreichisches Deutsch',
                    'English',
                    'Español',
                    'Français',
                    'Schweizerdeutsch',
                    'hrvatski',
                    'Italiano',
                    'Kölsch',
                    'Македонски',
                    'Nederlands',
                    'Norsk',
                    'Polski',
                    'Português',
                    'Русский (Russian)',
                    'srpski',
                    'Svenska',
                    'Türkçe',
                    'o‘zbekcha',
                    'Tiếng Việt',
                    '简体中文 (Simplified Chinese)',
                    '繁體中文 (Traditional Chinese)'
                ];

                languages.forEach(language => {
                    const option = document.createElement('option');
                    option.value = language;
                    option.textContent = language;
                    languageSelect.appendChild(option);
                });

                const languageDiv = document.createElement('div');
                languageDiv.className = 'square_select_group-single';
                languageDiv.style.width = '100%';
                languageDiv.appendChild(languageSelect);
                languageInputContainer.appendChild(languageDiv);

                const languageSeparator = document.createElement('span');
                languageSeparator.className = 'square_select_group-separator u-clickable u-quarter_left_margin';
                languageSeparator.innerHTML = '<svg src="x.svg" class="inline_icon inline_icon--gray" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>';
                languageSeparator.style.marginLeft = '.35rem';
                languageSeparator.style.alignContent = 'center';
                languageSeparator.addEventListener('click', () => {
                    languageSelect.value = '';
                });

                languageInputContainer.appendChild(languageSeparator);
                languageContainer.appendChild(languageInputContainer);
                return languageContainer;
            }

            function createInputPrimaryTag() {
                const primaryTagContainer = document.createElement('div');
                primaryTagContainer.className = 'square_form-input_and_label square_form-input_and_label--half_width';

                const primaryTagLabel = document.createElement('div');
                primaryTagLabel.className = 'text_label';
                primaryTagLabel.style.display = 'flex';
                primaryTagLabel.style.alignItems = 'center';
                primaryTagLabel.style.justifyContent = 'space-between';
                primaryTagLabel.textContent = 'Primary Tag';
                primaryTagLabel.style.marginBottom = '0.5rem';

                createOverwriteContainer('overwrite_primary_tag', 'remove_primary_tag', primaryTagLabel);

                primaryTagContainer.appendChild(primaryTagLabel);

                const genreInputContainer = document.createElement('div');
                genreInputContainer.className = 'u-bottom_margin';
                genreInputContainer.style.display = 'flex';
                genreInputContainer.style.justifyContent = 'space-between';

                const genreSelect = document.createElement('select');
                genreSelect.className = 'select_input';
                genreSelect.innerHTML = '<option value="" disabled selected>Primary Tag</option>';
                genreSelect.id = 'genreSelect';

                const genres = ['Rap', 'Pop', 'R&B', 'Rock', 'Country', 'Electronic', 'Non-Music'];
                genres.forEach(genre => {
                    const option = document.createElement('option');
                    option.value = genre;
                    option.textContent = genre;
                    genreSelect.appendChild(option);
                });

                const genreDiv = document.createElement('div');
                genreDiv.className = 'square_select_group-single';
                genreDiv.style.width = '100%';
                genreDiv.appendChild(genreSelect);
                genreInputContainer.appendChild(genreDiv);

                const genreSeparator = document.createElement('span');
                genreSeparator.className = 'square_select_group-separator u-clickable u-quarter_left_margin';
                genreSeparator.innerHTML = '<svg src="x.svg" class="inline_icon inline_icon--gray" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>';
                genreSeparator.style.marginLeft = '.35rem';
                genreSeparator.style.alignContent = 'center';
                genreSeparator.addEventListener('click', () => {
                    genreSelect.value = '';
                });

                genreInputContainer.appendChild(genreSeparator);
                primaryTagContainer.appendChild(genreInputContainer);

                return primaryTagContainer;
            }

            function createInputReleaseDate() {
                const releaseDateContainer = document.createElement('div');
                releaseDateContainer.className = 'square_form-input_and_label square_form-input_and_label--half_width';

                const releaseDateLabel = document.createElement('div');
                releaseDateLabel.className = 'text_label';
                releaseDateLabel.style.display = 'flex';
                releaseDateLabel.style.alignItems = 'center';
                releaseDateLabel.style.justifyContent = 'space-between';
                releaseDateLabel.textContent = 'Release Date';
                releaseDateLabel.style.marginBottom = '0.5rem';

                createOverwriteContainer('overwrite_release_date', 'remove_release_date', releaseDateLabel);

                releaseDateContainer.appendChild(releaseDateLabel);

                const dateInputContainer = document.createElement('div');
                dateInputContainer.className = 'u-bottom_margin';
                dateInputContainer.style.display = 'flex';
                dateInputContainer.style.justifyContent = 'space-between';

                const monthSelect = document.createElement('select');
                monthSelect.className = 'select_input';
                monthSelect.innerHTML = '<option value="" disabled selected>Month</option>';
                monthSelect.id = 'monthSelect';

                const months = [
                    { number: 1, name: 'January' },
                    { number: 2, name: 'February' },
                    { number: 3, name: 'March' },
                    { number: 4, name: 'April' },
                    { number: 5, name: 'May' },
                    { number: 6, name: 'June' },
                    { number: 7, name: 'July' },
                    { number: 8, name: 'August' },
                    { number: 9, name: 'September' },
                    { number: 10, name: 'October' },
                    { number: 11, name: 'November' },
                    { number: 12, name: 'December' },
                ];

                months.forEach(month => {
                    const option = document.createElement('option');
                    option.value = month.number;
                    option.textContent = month.name;
                    monthSelect.appendChild(option);
                });

                const monthDiv = document.createElement('div');
                monthDiv.className = 'square_select_group-single';
                monthDiv.appendChild(monthSelect);
                dateInputContainer.appendChild(monthDiv);

                const monthSeparator = document.createElement('span');
                monthSeparator.className = 'square_select_group-separator u-clickable u-quarter_left_margin';
                monthSeparator.innerHTML = '<svg src="x.svg" class="inline_icon inline_icon--gray" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>';
                monthSeparator.style.marginLeft = '.35rem';
                monthSeparator.style.marginRight = '.95rem';
                monthSeparator.style.alignContent = 'center';
                monthSeparator.addEventListener('click', () => {
                    monthSelect.value = '';
                });
                dateInputContainer.appendChild(monthSeparator);


                const daySelect = document.createElement('select');
                daySelect.className = 'select_input';
                daySelect.innerHTML = '<option value="" disabled selected>Day</option>';
                daySelect.id = 'daySelect';

                const dayDiv = document.createElement('div');
                dayDiv.className = 'square_select_group-single';
                dayDiv.appendChild(daySelect);
                dateInputContainer.appendChild(dayDiv);

                const daySeparator = document.createElement('span');
                daySeparator.className = 'square_select_group-separator u-clickable u-quarter_left_margin';
                daySeparator.innerHTML = '<svg src="x.svg" class="inline_icon inline_icon--gray" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>';
                daySeparator.style.marginLeft = '.35rem';
                daySeparator.style.marginRight = '.95rem';
                daySeparator.style.alignContent = 'center';
                daySeparator.addEventListener('click', () => {
                    daySelect.value = '';
                });
                dateInputContainer.appendChild(daySeparator);


                const yearSelect = document.createElement('select');
                yearSelect.className = 'select_input';
                yearSelect.innerHTML = '<option value="" disabled selected>Year</option>';
                yearSelect.id = 'yearSelect';

                const currentYear = new Date().getFullYear();
                for (let year = currentYear + 1; year >= 1900; year--) {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                }

                const yearDiv = document.createElement('div');
                yearDiv.className = 'square_select_group-single';
                yearDiv.appendChild(yearSelect);
                dateInputContainer.appendChild(yearDiv);

                const yearSeparator = document.createElement('span');
                yearSeparator.className = 'square_select_group-separator u-clickable u-quarter_left_margin';
                yearSeparator.style.marginLeft = '.35rem';
                yearSeparator.style.alignContent = 'center';
                yearSeparator.innerHTML = '<svg src="x.svg" class="inline_icon inline_icon--gray" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>';
                yearSeparator.addEventListener('click', () => {
                    daySelect.value = '';
                });
                dateInputContainer.appendChild(yearSeparator);

                const updateDays = () => {
                    const selectedMonth = parseInt(monthSelect.value, 10);
                    const currentDay = parseInt(daySelect.value, 10);
                    const selectedYear = parseInt(yearSelect.value, 10);
                    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                    const isLeapYear = (year) => {
                        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
                    };
                    if (selectedMonth === 2 && isLeapYear(selectedYear)) {
                        daysInMonth[1] = 29;
                    }

                    const maxDays = selectedMonth ? daysInMonth[selectedMonth - 1] : 31;

                    daySelect.innerHTML = '<option value="" disabled selected>Day</option>';
                    for (let day = 1; day <= maxDays; day++) {
                        const option = document.createElement('option');
                        option.value = day;
                        option.textContent = day;

                        if (day === currentDay) {
                            option.selected = true;
                        }

                        daySelect.appendChild(option);
                    }

                    if (currentDay > maxDays) {
                        daySelect.value = '';
                    }
                };

                monthSelect.addEventListener('change', updateDays);
                daySelect.addEventListener('change', updateDays);
                yearSelect.addEventListener('change', updateDays);
                updateDays();

                releaseDateContainer.appendChild(dateInputContainer);
                return releaseDateContainer;
            }

            function createInputColorFields() {
                const inputContainer = document.createElement('div');
                inputContainer.className = 'square_form-input_and_label square_form-input_and_label--half_width';

                const gradientContainer = document.createElement('div');
                gradientContainer.style.display = 'flex';
                gradientContainer.style.gap = '0.75rem';

                const label = document.createElement('div');
                label.className = 'text_label';
                label.textContent = 'Gradient Colors';
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.justifyContent = 'space-between';

                const primaryColorField = createInputTextField('', 'primary_color', 'Primary Color');
                const secondaryColorField = createInputTextField('', 'secondary_color', 'Secondary Color');
                const textColorField = createInputTextField('', 'text_color', 'Text Color');

                createOverwriteContainer('overwrite_gradient', 'remove_gradient', label);

                gradientContainer.appendChild(primaryColorField);
                gradientContainer.appendChild(secondaryColorField);
                gradientContainer.appendChild(textColorField);
                inputContainer.appendChild(label);
                inputContainer.appendChild(gradientContainer);

                return inputContainer;
            }

            function createInputTextField(labelText, name, placeholder) {
                const inputContainer = document.createElement('div');
                inputContainer.className = 'square_form-input_and_label square_form-input_and_label--half_width';

                const label = document.createElement('div');
                label.className = 'text_label';
                label.textContent = labelText;
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.justifyContent = 'space-between';

                const input = document.createElement('input');
                input.type = 'text';
                input.name = name;
                input.placeholder = placeholder;
                input.className = 'square_input square_form-standard_element_margin';
                input.setAttribute("autocomplete", "off");

                const feedbackLabel = document.createElement('div');
                feedbackLabel.className = 'feedback_label';
                feedbackLabel.style.paddingLeft = '5.905px';
                feedbackLabel.style.marginBottom = '6px';
                feedbackLabel.style.fontSize = '12px';
                feedbackLabel.style.color = '#333';
                feedbackLabel.style.display = 'none';

                let cachedPlaylistLink = null;
                let cachedSongIds = null;
                let cachedAlbumTitle = null;

                input.addEventListener('input', async () => {
                    const link = input.value.trim();
                    const [playlistLink, playlistTracks] = link.split(' ');
                    feedbackLabel.style.display = 'block';
                    input.style.marginBottom = '6px';

                    const checkedSongIds = songIds.filter((songId) => {
                        const checkbox = document.querySelector(`#checkbox_${songId}`);
                        return checkbox?.checked;
                    });

                    if (name === 'youtube_links') {
                        try {
                            if (playlistLink === "Delete") {
                                youtubeLinks = "Delete";
                                feedbackLabel.style.color = '#FF1414';
                                feedbackLabel.textContent = 'Warning: Delete all YouTube links';
                            } else {
                                const playlistData = await getPlaylistVideos(playlistLink);
                                if (typeof playlistData === 'string') {
                                    feedbackLabel.style.color = '#FF1414';
                                    feedbackLabel.textContent = `Error: ${playlistData}`;
                                } else {
                                    const totalTracks = playlistData.videoLinks.length;
                                    const selectedTracks = playlistTracks ? parsePlaylistTracks(playlistTracks, totalTracks) : [...Array(totalTracks).keys()];
                                    const filteredLinks = selectedTracks.map(index => playlistData.videoLinks[index]);

                                    const playlistLength = filteredLinks.length;
                                    const songCount = checkedSongIds.length;
                                    const trackLabel = playlistData.playlistLength === 1 ? "Track" : "Tracks";
                                    const linkLabel = playlistData.playlistLength === 1 ? "link" : "links";
                                    const songLabel = songCount === 1 ? "song" : "songs";

                                    if (playlistLength === songCount) {
                                        feedbackLabel.style.color = '#007A33';
                                        feedbackLabel.innerHTML = `
                                                <strong>Playlist:</strong> ${playlistData.playlistTitle} [${playlistLength} Tracks]
                                            `;
                                        youtubeLinks = filteredLinks;
                                    } else {
                                        feedbackLabel.style.color = '#FF1414';
                                        feedbackLabel.innerHTML = `
                                            <strong>Playlist:</strong> ${playlistData.playlistTitle} [${playlistLength} ${trackLabel}]<br>
                                            <strong><span style="background-color: #FFEB3B; color: #333; padding: 2px 0px;">Warning:</span></strong>
                                            <span style="color: #333;">The playlist has ${playlistLength} ${linkLabel}, but the album  has ${songCount} ${songLabel}.</span>
                                        `;
                                    }
                                }
                            }
                        } catch (error) {
                            feedbackLabel.style.color = '#FF1414';
                            feedbackLabel.textContent = `Error: ${error.message}`;
                        }
                    } else if (name === 'soundcloud_links') {
                        feedbackLabel.style.color = '#FF1414';
                        feedbackLabel.textContent = "Error: SoundCloud links are not supported";
                    } else if (name === 'related_album') {
                        try {
                            if (playlistLink === "Delete") {
                                geniusLinks = Array(checkedSongIds.length).fill("Delete");
                                feedbackLabel.style.color = '#FF1414';
                                feedbackLabel.textContent = 'Warning: Delete all related songs';
                            } else {
                                if (!playlistLink.startsWith("https://genius.com/albums")) {
                                    feedbackLabel.style.color = '#FF1414';
                                    feedbackLabel.textContent = "Error: Invalid playlist link";
                                    return;
                                }
                                if (playlistLink !== cachedPlaylistLink || !cachedSongIds) {
                                    const html = await (await fetch(playlistLink)).text();
                                    const songIdRegex = /&quot;api_path&quot;:&quot;\/songs\/(\d+)&quot;/g;
                                    const albumTitleRegex = /&quot;link_title&quot;:&quot;(.*?)&quot;,&quot;title&quot;:&quot;(.*?)&quot;,&quot;type&quot;:&quot;Album&quot;/;
                                    cachedAlbumTitle = (html.match(albumTitleRegex) || [])[1];
                                    let match;
                                    cachedSongIds = [];
                                    while ((match = songIdRegex.exec(html)) !== null) {
                                        cachedSongIds.push(match[1]);
                                    }
                                    cachedPlaylistLink = playlistLink;
                                }
                                const totalTracks = cachedSongIds.length;
                                const selectedTracks = playlistTracks ? parsePlaylistTracks(playlistTracks, totalTracks) : [...Array(totalTracks).keys()];
                                const filteredSongIds = selectedTracks.map(index => cachedSongIds[index]);

                                const playlistLength = filteredSongIds.length;
                                const songCount = checkedSongIds.length;

                                const trackLabel = playlistLength === 1 ? "Track" : "Tracks";
                                const linkLabel = playlistLength === 1 ? "link" : "links";
                                const songLabel = songCount === 1 ? "song" : "songs";

                                if (playlistLength === songCount) {
                                    feedbackLabel.style.color = '#007A33';
                                    feedbackLabel.innerHTML = `
                                        <strong>Playlist:</strong> ${cachedAlbumTitle} [${playlistLength} ${trackLabel}]
                                    `;
                                    geniusLinks = filteredSongIds;
                                } else {
                                    feedbackLabel.style.color = '#FF1414';
                                    feedbackLabel.innerHTML = `
                                        <strong>Playlist:</strong> ${cachedAlbumTitle} [${playlistLength} ${trackLabel}]<br>
                                        <strong><span style="background-color: #FFEB3B; color: #333; padding: 2px 0px;">Warning:</span></strong>
                                        <span style="color: #333;">The playlist has ${playlistLength} ${linkLabel}, but the album only has ${songCount} ${songLabel}.</span>
                                    `;
                                }
                            }
                        } catch (error) {
                            feedbackLabel.style.color = '#FF1414';
                            feedbackLabel.textContent = `Error: ${error.message}`;
                        }
                    } else if (name === 'recorded_at') {
                        if (link === "Delete") {
                            recordedArray = "Delete";
                            feedbackLabel.style.color = '#FF1414';
                            feedbackLabel.textContent = 'Warning: Delete all Recording Locations';
                        } else {
                            recordedArray = link;
                            feedbackLabel.textContent = '';
                            feedbackLabel.style.display = 'none';
                        }
                    } else if (name === 'primary_color') {
                        color = link.trim().toLowerCase();
                        if (!color.startsWith("#")) color = `#${color}`;
                        primaryColorArray = color;
                        checkGradient();
                    } else if (name === 'secondary_color') {
                        color = link.trim().toLowerCase();
                        if (!color.startsWith("#")) color = `#${color}`;
                        secondaryColorArray = color;
                        checkGradient();
                    } else if (name === 'text_color') {
                        color = link.trim().toLowerCase();
                        if (!color.startsWith("#")) color = `#${color}`;
                        textColorArray = color;
                        checkGradient();
                    }
                });

                const checkGradient = () => {
                    if (primaryColorArray && secondaryColorArray && textColorArray) {
                        const hexToRgb = (color) => {
                            let colorVal = color;
                            if (color.length === 4) {
                                colorVal = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
                            }

                            const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorVal);
                            return m ? [m[1], m[2], m[3]].map(s => parseInt(s, 16)) : null;
                        };

                        const luminance = (rgbArray) => {
                            const a = rgbArray.map((v) => {
                                v /= 255;
                                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
                            });
                            return (a[0] * 0.2126) + (a[1] * 0.7152) + (a[2] * 0.0722);
                        };

                        const calculateContrast = (color1, color2) => {
                            if (color1.length == 0 || color2.length == 0) return 1;

                            const isBlackOrWhite = ["#000000", "#000", "#ffffff", "#fff"].includes(color2.toLowerCase());
                            if (!isBlackOrWhite) return 1;

                            const color1RGB = hexToRgb(color1);
                            const color2RGB = hexToRgb(color2);
                            if (!color1RGB || !color2RGB) return 1;

                            const color1Luminance = luminance(color1RGB);
                            const color2Luminance = luminance(color2RGB);
                            return color1Luminance > color2Luminance
                                ? Math.round((color1Luminance + 0.05) / (color2Luminance + 0.05) * 100) / 100
                                : Math.round((color2Luminance + 0.05) / (color1Luminance + 0.05) * 100) / 100;
                        };

                        const isAcceptableContrast = contrast => contrast >= 4.5;

                        const contrastPrimaryText = calculateContrast(primaryColorArray, textColorArray);
                        const contrastSecondaryText = calculateContrast(secondaryColorArray, textColorArray);
                        const isAcceptable = isAcceptableContrast(contrastPrimaryText) && isAcceptableContrast(contrastSecondaryText);

                        gradientCheckArray = isAcceptable;

                        document.querySelector("input[name='primary_color']").nextElementSibling.textContent = `Contrast: ${contrastPrimaryText}`;
                        document.querySelector("input[name='secondary_color']").nextElementSibling.textContent = `Contrast: ${contrastSecondaryText}`;
                        document.querySelector("input[name='text_color']").nextElementSibling.textContent = `Check: ${isAcceptable ? 'True' : 'False'}`;
                        document.querySelector("input[name='primary_color']").nextElementSibling.style.color = contrastPrimaryText > 4.5 ? '#007A33' : '#FF1414';
                        document.querySelector("input[name='secondary_color']").nextElementSibling.style.color = contrastSecondaryText > 4.5 ? '#007A33' : '#FF1414';
                        document.querySelector("input[name='text_color']").nextElementSibling.style.color = isAcceptable ? '#007A33' : '#FF1414';

                        return isAcceptable;
                    }

                    gradientCheckArray = false;

                    return false;
                };


                function parsePlaylistTracks(input, totalTracks) {
                    const selectedTracks = new Set();
                    let isInverted = false;

                    if (input.startsWith('!')) {
                        isInverted = true;
                        input = input.slice(1);
                    }

                    input.split(',').forEach(range => {
                        const [start, end] = range.split('-').map(Number);
                        if (!end) {
                            selectedTracks.add(start - 1);
                        } else {
                            for (let i = start - 1; i < end; i++) {
                                selectedTracks.add(i);
                            }
                        }
                    });

                    if (isInverted) {
                        return [...Array(totalTracks).keys()].filter(i => !selectedTracks.has(i));
                    } else {
                        return [...selectedTracks].sort((a, b) => a - b);
                    }
                }

                async function getPlaylistVideos(playlistLink) {
                    const possibleLinks = ["https://www.youtube.com/playlist", "https://youtube.com/playlist", "https://music.youtube.com/playlist"];
                    if (!possibleLinks.some((link) => playlistLink.startsWith(link))) {
                        return "Invalid playlist link";
                    }

                    const playlistId = new URL(playlistLink).searchParams.get("list");
                    const key = window.secrets.GOOGLE_API_KEY;

                    const metadataResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${key}`);
                    if (!metadataResponse.ok) {
                        return "Failed to fetch playlist metadata";
                    }

                    const metadataData = (await metadataResponse.json()).items[0].snippet;

                    let videosData;
                    let videoLinks = [];
                    let nextPageToken = '';

                    do {
                        const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPageToken}&playlistId=${playlistId}&key=${key}`);
                        if (!videosResponse.ok) {
                            return "Failed to fetch playlist videos";
                        }

                        videosData = await videosResponse.json();
                        videoLinks.push(...videosData.items.map(item => `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`));
                        nextPageToken = videosData.nextPageToken;
                    } while (nextPageToken);


                    return {
                        artistName: metadataData.channelTitle,
                        playlistTitle: metadataData.title.startsWith("Album - ")
                            ? metadataData.title.substring("Album - ".length)
                            : metadataData.title,
                        playlistLength: videoLinks.length,
                        videoLinks
                    };
                }

                if (name === 'youtube_links' || name === 'soundcloud_links' || name === 'related_album' || name === 'recorded_at') {
                    createOverwriteContainer(`overwrite_${name}`, `remove_${name}`, label);
                }

                inputContainer.appendChild(label);
                inputContainer.appendChild(input);
                inputContainer.appendChild(feedbackLabel);
                return inputContainer;
            }

            function createInputTagField(labelText, name, type) {
                const inputContainer = document.createElement('div');
                inputContainer.className = 'square_form-input_and_label square_form-input_and_label--half_width';
                inputContainer.setAttribute('ng-class', "{'square_form-input_and_label--half_width': !full, 'square_form-input_and_label--error': errors.length}");
                inputContainer.setAttribute('label', 'Artists');
                inputContainer.setAttribute('errors', "$ctrl.error.response.validation_errors.primary_artists");
                inputContainer.setAttribute('bis_skin_checked', '1');

                const label = document.createElement('div');
                label.className = 'text_label';
                label.setAttribute('ng-class', "{'text_label--gray': is_disabled}");
                label.setAttribute('bis_skin_checked', '1');
                label.textContent = labelText;

                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.justifyContent = 'space-between';

                if (name === 'primary_artists' || name === 'featured_artists' || name === 'tags' || name === 'writers' || name === 'producers' || name === `additional_role_${roleIndex}`) {
                    createOverwriteContainer(`overwrite_${name}`, `remove_${name}`, label);
                }

                const ngTransclude = document.createElement('ng-transclude');

                const autocompleteTagsInput = document.createElement('autocomplete-tags-input');
                autocompleteTagsInput.setAttribute('bind-to', '$ctrl.album.primary_artists');
                autocompleteTagsInput.setAttribute('name', 'artist');
                autocompleteTagsInput.setAttribute('autocomplete-model', 'artist');
                autocompleteTagsInput.setAttribute('placeholder', 'Artists');
                autocompleteTagsInput.setAttribute('input-classes', 'tags_input square_input square_form-standard_element_margin');

                const tagsInput = document.createElement('tags-input');
                tagsInput.setAttribute('ng-disabled', 'disabled');
                tagsInput.setAttribute('min-length', '1');
                tagsInput.setAttribute('template', 'autocomplete_word.html');
                tagsInput.setAttribute('key-property', 'name');
                tagsInput.setAttribute('display-property', 'name');
                tagsInput.setAttribute('replace-spaces-with-dashes', 'false');
                tagsInput.setAttribute('ng-model', 'bindTo');
                tagsInput.setAttribute('placeholder', '');
                tagsInput.className = 'tags_input square_input square_form-standard_element_margin ng-valid-max-tags ng-valid-min-tags ng-valid-leftover-text ng-touched';
                tagsInput.setAttribute('add-from-autocomplete-only', 'true');
                tagsInput.setAttribute('prevent-default-keydown', '13');

                const hostDiv = document.createElement('div');
                hostDiv.className = 'host';
                hostDiv.setAttribute('tabindex', '-1');
                hostDiv.setAttribute('ng-click', 'eventHandlers.host.click()');

                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'tags';
                tagsDiv.setAttribute('ng-class', '{focused: hasFocus}');

                const tagsList = document.createElement('ul');
                tagsList.className = 'tag-list';

                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.placeholder = `Add ${labelText}`;
                inputField.className = 'input ng-pristine ng-valid ng-empty ng-touched';
                inputField.setAttribute('autocomplete', 'off');
                inputField.setAttribute('ng-model', 'newTag.text');
                inputField.setAttribute('ng-model-options', '{getterSetter: true}');
                inputField.setAttribute('ng-keydown', 'eventHandlers.input.keydown($event)');
                inputField.setAttribute('ng-focus', 'eventHandlers.input.focus($event)');
                inputField.setAttribute('ng-blur', 'eventHandlers.input.blur($event)');
                inputField.setAttribute('ng-paste', 'eventHandlers.input.paste($event)');
                inputField.setAttribute('ng-trim', 'false');
                inputField.setAttribute('ng-class', "{'invalid-tag': newTag.invalid}");
                inputField.setAttribute('ng-disabled', 'disabled');
                inputField.setAttribute('ti-bind-attrs', "{type: 'text', placeholder: 'Add a tag', tabindex: options.tabindex, spellcheck: true}");
                inputField.setAttribute('ti-autosize', '');
                inputField.style.width = '100%';

                inputField.addEventListener('input', async (event) => {
                    const query = event.target.value;

                    if (type === 'custom_performance_roles') {
                        if (tagsList.querySelectorAll('.tag-item').length > 0) {
                            console.warn('Only one tag can be added for additionalArtistRoles.');
                            return;
                        }
                    }

                    const existingSuggestions = hostDiv.querySelector('.autocomplete');
                    if (existingSuggestions) {
                        existingSuggestions.remove();
                    }

                    if (query.length > 1) {
                        const suggestions = await fetchSuggestions(type, query);
                        displaySuggestions(suggestions, hostDiv, inputField, name, type, form);
                    }
                });

                inputField.addEventListener('keydown', (event) => {
                    if (event.key === 'Backspace' && inputField.value === '') {
                        const lastTag = tagsList.querySelector('.tag-item:last-child');
                        if (lastTag) {
                            lastTag.querySelector('svg').click();
                        }
                    }
                });

                tagsDiv.appendChild(tagsList);
                hostDiv.appendChild(tagsDiv);
                tagsDiv.appendChild(inputField);
                tagsInput.appendChild(hostDiv);
                autocompleteTagsInput.appendChild(tagsInput);
                autocompleteTagsInput.appendChild(tagsInput);
                ngTransclude.appendChild(autocompleteTagsInput);
                inputContainer.appendChild(label);
                inputContainer.appendChild(ngTransclude);
                return { inputContainer, tagsList };
            }

            function createAdditionalRoles() {
                const subSection = document.createElement('div');
                subSection.className = 'square_form-sub_section';
                subSection.setAttribute('data-index', roleIndex);

                const { inputContainer: additionalRoleDiv, tagsList: additionalRoleTagsList } = createInputTagField(
                    'Additional role',
                    `additional_role_${roleIndex}`,
                    'custom_performance_roles'
                );
                additionalRoleDiv.setAttribute('data-index', roleIndex);
                subSection.appendChild(additionalRoleDiv);


                const additionalRoleInputField = [...additionalRoleDiv.querySelectorAll('input')].pop();
                additionalRoleInputField.addEventListener('focus', () => {
                    activeTagsList = additionalRoleTagsList;
                });


                const { inputContainer: artistRoleDiv, tagsList: artistRoleTagsList } = createInputTagField(
                    'Artists in this role',
                    `artist_role_${roleIndex}`,
                    'artists'
                );
                artistRoleDiv.setAttribute('data-index', roleIndex);
                subSection.appendChild(artistRoleDiv);

                const artistRoleInputField = artistRoleDiv.querySelector('input');
                artistRoleInputField.addEventListener('focus', () => {
                    activeTagsList = artistRoleTagsList;
                });

                const removeButton = document.createElement('div');
                removeButton.className = 'square_form-sub_section-remove';
                removeButton.innerHTML = `
                        <svg class="inline_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                        <path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>
                    `;
                removeButton.style.cursor = 'pointer';
                removeButton.addEventListener('click', () => {
                    subSection.remove();
                });
                subSection.appendChild(removeButton);

                roleIndex++;
                return subSection;
            }

            function createAdditionalCredits() {
                const additionalContainer = document.createElement('div');
                additionalContainer.style.flexDirection = 'column';

                const creditsLabel = document.createElement('div');
                creditsLabel.className = 'text_label';
                creditsLabel.textContent = 'Credits';
                creditsLabel.style.display = 'flex';
                creditsLabel.style.alignItems = 'center';
                creditsLabel.style.justifyContent = 'space-between';
                //createOverwriteContainer('overwrite_credits', 'remove_credits', creditsLabel);


                additionalContainer.appendChild(creditsLabel);

                const subSectionCreditsContainer = document.createElement('div');
                additionalContainer.appendChild(subSectionCreditsContainer);

                const initialSubSectionCredits = createAdditionalRoles();
                subSectionCreditsContainer.appendChild(initialSubSectionCredits);

                const addCreditsButton = document.createElement('span');
                addCreditsButton.className = 'text_label text_label--button text_label--purple';
                addCreditsButton.textContent = '+ Add Additional Credits';
                addCreditsButton.style.cursor = 'pointer';
                addCreditsButton.addEventListener('click', () => {
                    const newSubSectionCredits = createAdditionalRoles();
                    subSectionCreditsContainer.appendChild(newSubSectionCredits);

                    form.style.paddingBottom = '175px';
                    form.scrollTo({
                        top: form.scrollHeight,
                        behavior: 'smooth'
                    });
                });

                additionalContainer.appendChild(addCreditsButton);

                const formHeight = form.getBoundingClientRect().height;
                if (formHeight < 1125) {
                    let requiredPadding = 1125 - formHeight;
                    requiredPadding = Math.min(requiredPadding, 175);
                    form.style.paddingBottom = `${requiredPadding}px`;
                }

                return additionalContainer;
            }

            function createStatusSaveCancelButton() {
                const statusDisplay = document.createElement('div');
                statusDisplay.style.marginBottom = '1.75rem';
                statusDisplay.style.fontSize = '1rem';
                const saveButton = document.createElement('button');
                saveButton.id = 'custom-save-button';
                saveButton.className = 'square_button square_button--green';
                saveButton.type = 'submit';
                saveButton.textContent = 'Save';
                saveButton.style.display = 'none';
                const cancelButton = document.createElement('button');
                cancelButton.className = 'square_button square_button--transparent square_button--gray';
                cancelButton.textContent = 'Cancel';
                return { statusDisplay, saveButton, cancelButton };
            }

            function createCloseButton() {
                const closeButtonContainer = document.createElement('div');
                closeButtonContainer.setAttribute('ng-if', '!variants.internal_close');
                closeButtonContainer.className = 'modal_window-close_button';
                closeButtonContainer.setAttribute('ng-click', 'close({close_button: true})');
                closeButtonContainer.innerHTML = `
                    <svg src="x.svg" class="modal_window-close_button-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                    <path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>
                `;
                return closeButtonContainer;
            }

            async function fetchSuggestions(type, query) {
                const url = `https://genius.com/api/${type}/autocomplete?q=${encodeURIComponent(query)}&text_format=html,markdown`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': document.cookie,
                        'X-CSRF-Token': getCsrfToken(),
                        'User-Agent': 'ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)'
                    }
                });

                if (!response.ok) {
                    console.error('Error:', response.statusText);
                    return [];
                }
                const data = await response.json();
                return data.response[type];
            }

            function displaySuggestions(suggestions, container, inputField, name, type, form) {
                const existingSuggestions = container.querySelector('.autocomplete');
                if (existingSuggestions) {
                    existingSuggestions.remove();
                }

                if (suggestions.length > 0) {
                    const autocompleteDiv = document.createElement('div');
                    autocompleteDiv.className = 'autocomplete';
                    autocompleteDiv.setAttribute('ng-if', "suggestionList.visible");
                    autocompleteDiv.setAttribute('bis_skin_checked', "1");

                    const suggestionList = document.createElement('ul');
                    suggestionList.className = 'suggestion-list';

                    let mouseMoved = false;
                    let selectedIndex = 0;

                    suggestions.forEach((item, index) => {
                        const suggestionItem = document.createElement('li');
                        suggestionItem.className = 'suggestion-item';
                        suggestionItem.setAttribute('ng-repeat', "item in suggestionList.items track by track(item)");
                        suggestionItem.setAttribute('ng-class', "{selected: item == suggestionList.selected}");
                        suggestionItem.setAttribute('ng-click', `addSuggestionByIndex(${index})`);
                        suggestionItem.setAttribute('ng-mouseenter', `suggestionList.select(${index})`);
                        suggestionList.appendChild(suggestionItem);

                        const tiAutocompleteMatch = document.createElement('ti-autocomplete-match');

                        let valueToAdd;
                        if (type === 'tags' || type === 'artists') {
                            tiAutocompleteMatch.setAttribute('data', `::${item.name}`);
                            const ngInclude = document.createElement('ng-include');
                            ngInclude.setAttribute('src', '$$template');

                            const artistNameText = document.createTextNode(item.name);
                            ngInclude.appendChild(artistNameText);

                            tiAutocompleteMatch.appendChild(ngInclude);

                            valueToAdd = { id: item.id, name: item.name };
                        } else if (type === 'custom_performance_roles') {
                            tiAutocompleteMatch.setAttribute('data', `::${item.label}`);
                            const ngInclude = document.createElement('ng-include');
                            ngInclude.setAttribute('src', '$$template');

                            const roleLabelText = document.createTextNode(item.label);
                            ngInclude.appendChild(roleLabelText);

                            tiAutocompleteMatch.appendChild(ngInclude);

                            valueToAdd = { id: item.id, label: item.label };
                        }

                        suggestionItem.appendChild(tiAutocompleteMatch);

                        if (index === 0) {
                            suggestionItem.classList.add('selected');
                        }

                        suggestionItem.addEventListener('click', () => {
                            if (valueToAdd) {
                                if (name === 'tags') {
                                    if (!tagsArray.some(tag => tag.id === valueToAdd.id)) {
                                        tagsArray.push(valueToAdd);
                                    }
                                    console.log('Tags Array:', tagsArray);
                                } else if (name === 'primary_artists') {
                                    if (!primaryArtistsArray.some(primary_artist => primary_artist.id === valueToAdd.id)) {
                                        primaryArtistsArray.push(valueToAdd);
                                    }
                                    console.log('Primary Artists Array:', primaryArtistsArray);
                                } else if (name === 'featured_artists') {
                                    if (!featuredArtistsArray.some(featured_artist => featured_artist.id === valueToAdd.id)) {
                                        featuredArtistsArray.push(valueToAdd);
                                    }
                                    console.log('Featured Artists Array:', featuredArtistsArray);
                                } else if (name === 'producers') {
                                    if (!producersArray.some(producer => producer.id === valueToAdd.id)) {
                                        producersArray.push(valueToAdd);
                                    }
                                    console.log('Producers Array:', producersArray);
                                } else if (name === 'writers') {
                                    if (!writersArray.some(writer => writer.id === valueToAdd.id)) {
                                        writersArray.push(valueToAdd);
                                    }
                                    console.log('Writers Array:', writersArray);
                                } else if (name.startsWith('additional_role_')) {
                                    const match = name.match(/_(\d+)$/);
                                    const fieldIndex = match ? parseInt(match[1], 10) : null;

                                    if (fieldIndex !== null) {
                                        if (!additionalRolesArray[fieldIndex]) {
                                            additionalRolesArray[fieldIndex] = [];
                                        }
                                        if (!additionalRolesArray[fieldIndex].some(role => role.id === valueToAdd.id)) {
                                            additionalRolesArray[fieldIndex].push(valueToAdd);
                                        }
                                    }
                                    console.log(additionalRolesArray);
                                } else if (name.startsWith('artist_role_')) {
                                    const match = name.match(/_(\d+)$/);
                                    const fieldIndex = match ? parseInt(match[1], 10) : null;

                                    if (fieldIndex !== null) {
                                        if (!artistRolesArray[fieldIndex]) {
                                            artistRolesArray[fieldIndex] = [];
                                        }
                                        if (!artistRolesArray[fieldIndex].some(artist => artist.id === valueToAdd.id)) {
                                            artistRolesArray[fieldIndex].push(valueToAdd);
                                        }
                                    }
                                }
                                addTag(activeTagsList, valueToAdd, name);
                                inputField.value = '';
                                inputField.focus();
                                autocompleteDiv.remove();
                            }
                        });


                        suggestionItem.addEventListener('mouseenter', () => {
                            if (mouseMoved) {
                                suggestionList.querySelectorAll('.suggestion-item').forEach(item => item.classList.remove('selected'));
                                suggestionItem.classList.add('selected');
                                selectedIndex = index;
                            }
                        });

                        suggestionItem.addEventListener('mouseleave', () => {
                            suggestionItem.classList.remove('selected');
                        });
                    });

                    document.addEventListener('mousemove', () => {
                        mouseMoved = true;
                    });


                    autocompleteDiv.appendChild(suggestionList);
                    container.appendChild(autocompleteDiv);

                    container.scrollIntoView({ behavior: 'smooth', block: 'center' });


                    let keyboardListener;

                    setupKeyboardNavigation();

                    document.addEventListener('mousedown', (event) => {
                        if (!autocompleteDiv.contains(event.target) && event.target !== inputField) {
                            autocompleteDiv.remove();
                        }
                    })

                    function setupKeyboardNavigation() {
                        if (keyboardListener) {
                            document.removeEventListener('keydown', keyboardListener);
                        }

                        keyboardListener = (event) => {
                            const items = document.querySelectorAll('.suggestion-item');
                            if (!items.length) return;

                            if (event.key === 'ArrowDown') {
                                selectedIndex = (selectedIndex + 1) % items.length;
                                items.forEach(item => item.classList.remove('selected'));
                                items[selectedIndex].classList.add('selected');
                                items[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                                event.preventDefault();
                            } else if (event.key === 'ArrowUp') {
                                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                                items.forEach(item => item.classList.remove('selected'));
                                items[selectedIndex].classList.add('selected');
                                items[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                                event.preventDefault();
                            } else if (event.key === 'Enter') {
                                event.preventDefault();
                                const selectedItem = items[selectedIndex];
                                if (selectedItem) {
                                    selectedItem.click();
                                    autocompleteDiv?.remove();
                                    selectedIndex = 0;
                                }
                            }
                        };

                        document.addEventListener('keydown', keyboardListener);
                    }
                }
            }

            function addTag(tagsList, tagObject, name) {
                const existingTags = Array.from(tagsList.querySelectorAll('.tag-item'));
                const isDuplicate = existingTags.some(tag => tag.getAttribute('data-id') === String(tagObject.id));

                if (isDuplicate) return;

                const tagItem = document.createElement('li');
                tagItem.className = 'tag-item';
                tagItem.setAttribute('data-id', tagObject.id);
                tagItem.setAttribute('data-name', tagObject.name || tagObject.label);
                tagItem.setAttribute('ng-repeat', 'tag in tagList.items track by track(tag)');
                tagItem.setAttribute('ng-class', '{ selected: tag == tagList.selected }');
                tagItem.setAttribute('ng-click', 'eventHandlers.tag.click(tag)');

                const tiTagItem = document.createElement('ti-tag-item');
                tiTagItem.setAttribute('data', `::${tagObject.name || tagObject.label}`);

                const ngInclude = document.createElement('ng-include');
                ngInclude.setAttribute('src', '$$template');

                const tagText = document.createElement('span');
                tagText.className = 'autocomplete-word';
                tagText.setAttribute('ng-bind', ':: $getDisplayText()');
                tagText.textContent = tagObject.name || tagObject.label;

                const removeButton = document.createElement('svg');
                removeButton.innerHTML = `
                            <svg src="x.svg" class="tag_item-remove_button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                            <path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>
                        `;
                removeButton.setAttribute('ng-click', '$removeTag()');

                removeButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    tagsList.removeChild(tagItem);

                    let arrayToUpdate;

                    const match = name.match(/_(\d+)$/);
                    const fieldIndex = match ? parseInt(match[1], 10) : null;

                    if (name.startsWith('additional_role_') && fieldIndex !== null) {
                        arrayToUpdate = additionalRolesArray[fieldIndex];
                    } else if (name.startsWith('artist_role_') && fieldIndex !== null) {
                        arrayToUpdate = artistRolesArray[fieldIndex];
                    } else if (name === 'primary_artists') {
                        arrayToUpdate = primaryArtistsArray;
                    } else if (name === 'featured_artists') {
                        arrayToUpdate = featuredArtistsArray;
                    } else if (name === 'tags') {
                        arrayToUpdate = tagsArray;
                    } else if (name === 'writers') {
                        arrayToUpdate = writersArray;
                    } else if (name === 'producers') {
                        arrayToUpdate = producersArray;
                    }

                    if (arrayToUpdate) {
                        const tagIndex = arrayToUpdate.findIndex(tag => tag.id === tagObject.id);
                        if (tagIndex !== -1) {
                            arrayToUpdate.splice(tagIndex, 1);
                            console.log(`Updated ${name.charAt(0).toUpperCase() + name.slice(1)} Array:`, arrayToUpdate);
                        }
                    }
                });

                ngInclude.appendChild(tagText);
                ngInclude.appendChild(removeButton);
                tiTagItem.appendChild(ngInclude);
                tagItem.appendChild(tiTagItem);
                tagsList.appendChild(tagItem);

                const existingSuggestions = document.querySelector('.autocomplete');
                if (existingSuggestions) {
                    existingSuggestions.remove();
                }
            }
        }
    }




    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                             TRACKLIST LYRIC STATE                              //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function lyricStateTracklist(userRoles, songDataArray) {
        if (!Array.isArray(songDataArray)) return;

        songDataArray.forEach(entry => {
            const songData = entry?.response?.song;
            if (!songData || !songData.url) return;

            const linkElement = document.querySelector(`a[href="${songData.url}"]`);
            if (!linkElement) return;

            const chartRow = linkElement.closest('.chart_row.chart_row--light_border.chart_row--full_bleed_left.chart_row--align_baseline.chart_row--no_hover');
            if (!chartRow) return;

            const metadataElement = chartRow.querySelector('.chart_row-metadata_element.chart_row-metadata_element--large.drop-target');
            const expandElement = chartRow.querySelector('.chart_row-expand.u-increase_tap_area_full_space');
            if (!expandElement) return;

            if (chartRow.querySelector('.lyric-status-box')) return;

            // Lyrics are marked complete, staff approved, or verified
            const lyricsAreValidated = songData.lyrics_marked_complete_by || songData.lyrics_marked_staff_approved_by || songData.lyrics_verified === true;

            let color = '#ff7878';
            if (userRoles.includes('transcriber') || userRoles.includes('editor') || userRoles.includes('moderator')) {
                if (lyricsAreValidated && songData.current_user_metadata?.excluded_permissions?.includes("award_transcription_iq")) {
                    color = '#99f2a5';
                } else if (songData.lyrics_state === 'complete' && songData.current_user_metadata?.excluded_permissions?.includes("award_transcription_iq")) {
                    color = '#ffff64';
                } else if (songData.lyrics_state === 'complete' && songData.current_user_metadata?.permissions?.includes("award_transcription_iq")) {
                    color = '#ffa335';
                }
            } else {
                if (lyricsAreValidated) {
                    color = '#99f2a5';
                } else if (songData.lyrics_state === 'complete') {
                    color = '#ffff64';
                }
            }

            const box = document.createElement('div');
            box.className = 'lyric-status-box';
            box.style.width = '1rem';
            box.style.backgroundColor = color;
            box.style.marginLeft = '0.75rem';
            box.style.marginRight = '-1.00rem';
            box.style.flexShrink = '0';
            box.style.alignSelf = 'center';

            chartRow.style.display = 'flex';
            chartRow.style.alignItems = 'center';

            if (metadataElement && metadataElement.nextSibling === expandElement) {
                chartRow.insertBefore(box, expandElement);
            } else {
                chartRow.insertBefore(box, expandElement);
            }

            const contentContainer = chartRow.querySelector('.chart_row-content');
            if (contentContainer) {
                const contentHeight = contentContainer.getBoundingClientRect().height;
                box.style.height = `${contentHeight}px`;
            }
        });
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                CLEANUP METADATA                                //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function cleanupMetadata(userId, userRoles, songList) {
        console.log(userId, userRoles);
        let songsWithZeroWidthSpace = [];
        let songsWithPrimaryArtists = [];
        let songsWithRenamedLabels = [];
        let songsWithWriterArtists = [];
        let songsWithPrimarytoGroupMembers = [];
        let songsWithDuplicateCoverArt = [];

        const coverArtUsageMap = new Map();

        songList.forEach(json => {
            const song = json.response.song;

            if (checkZeroWidthSpaces(song)) songsWithZeroWidthSpace.push(song);
            const needsPrimaryArtistsRemoval = checkPrimaryArtists(song);
            const needsLabelRename = checkLabelRenames(song);
            const needsWritersAdd = checkWriterArtists(song);
            const needsPrimarytoGroupMembers = checkPrimarytoGroupMembers(song);


            if (needsPrimaryArtistsRemoval) {
                songsWithPrimaryArtists.push(song);
            }
            if (needsLabelRename) {
                songsWithRenamedLabels.push(needsLabelRename);
            }
            if (needsWritersAdd) {
                songsWithWriterArtists.push(needsWritersAdd);
            }
            if (needsPrimarytoGroupMembers) {
                songsWithPrimarytoGroupMembers.push(needsPrimarytoGroupMembers);
            }

            const coverUrl = song.custom_song_art_image_url;
            if (coverUrl) {
                if (!coverArtUsageMap.has(coverUrl)) {
                    coverArtUsageMap.set(coverUrl, []);
                }
                coverArtUsageMap.get(coverUrl).push(song);
            }
        });

        // Cover-Art-Auswertung
        for (const [coverUrl, songs] of coverArtUsageMap.entries()) {
            if (songs.length > 1) {
                const singleAlbumSongs = songs.filter(song => song.albums?.length === 1);
                if (singleAlbumSongs.length > 0) {
                    console.log(`Cover URL: ${coverUrl}`);
                    singleAlbumSongs.forEach(song => {
                        console.log(`- ${song.title} (ID: ${song.id})`);
                        songsWithDuplicateCoverArt.push(song);
                    });
                }
            }
        }

        addCleanupButton(songsWithZeroWidthSpace, "ZWSP", "Remove ZWSP", { title: "remove_zwsp" });
        addCleanupButton(songsWithPrimaryArtists, "PrimaryArtists", "Remove Primary Artists", { primaryArtists: true });
        addCleanupButton(songsWithRenamedLabels, "LabelRenames", "Fix Metadata", { renameLabels: true });
        addCleanupButton(songsWithWriterArtists, "Writers", "Add Writers", { writerArtists: true });
        if (userRoles.includes('transcriber') || userRoles.includes('editor') || userRoles.includes('moderator')) {
            addCleanupButton(songsWithDuplicateCoverArt, "CoverArt", "Remove Cover Art", { coverArt: true });
        }
        if (userId == 5934018 || userId == 4670957) {
            addCleanupButton(songsWithPrimarytoGroupMembers, "LabelRenames", "Primary Artists → Group Members", { renameLabels: true });
        }
    }



    function checkZeroWidthSpaces(song) {
        let updatedTitle = song.title;

        updatedTitle = updatedTitle.replace(/\u200B{2,}/g, '\u200B');
        updatedTitle = updatedTitle.replace(/^\u200B|(?<=[\p{L}\p{N}\p{P}])\u200B|(?=[\p{L}\p{N}\p{P}])\u200B/gu, '');

        //        updatedTitle = updatedTitle.replace(/(?<=[\p{L}\p{N}\p{P}])\u200B|(?=[\p{L}\p{N}\p{P}])\u200B/gu, '');

        if (/\u200B/.test(updatedTitle)) {
            console.info(`Remaining ZWSP: "${updatedTitle}"`);
        }

        return song.title !== updatedTitle;
    }

    function checkPrimaryArtists(song) {
        const primaryArtists = song.primary_artists || [];
        const customPrimaryArtists = (song.custom_performances || []).find(perf => perf.label === "Primary Artists");

        if (customPrimaryArtists) {
            const primaryArtistIds = primaryArtists.map(artist => artist.id);
            const customPrimaryArtistIds = customPrimaryArtists.artists.map(artist => artist.id);

            const isMismatch = JSON.stringify(customPrimaryArtistIds) !== JSON.stringify(primaryArtistIds);

            if (isMismatch) {
                console.info(`Remaining Primary Artists: ${customPrimaryArtists.artists.map(artist => artist.name)}`, song.url);
                const secondEditAlbumButton = document.querySelectorAll('.square_button.u-bottom_margin')[1];
                const square = secondEditAlbumButton.querySelector('.square-indicator');
                if (square) addBlackCross(square);


                const trackRows = document.querySelectorAll('album-tracklist-row');
                trackRows.forEach(row => {
                    const link = row.querySelector('a[href]');
                    if (link && link.href === song.url) {
                        const container = row.querySelector('.chart_row-number_container');
                        if (container) {
                            container.style.backgroundColor = '#ffff64';
                            container.style.borderRight = '10px solid #9a9a9a';
                        }
                    }
                });
            }
            return !isMismatch;
        }
        return false;
    }

    function checkLabelRenames(song) {
        const labelRenames = {
            "Trompeta": "Trumpet",
            "Gürio": "Güiro"
        };

        const customPerformances = song.custom_performances || [];
        const needsUpdate = customPerformances.some(perf => labelRenames[perf.label]);

        if (needsUpdate) {
            const updatedSong = Object.assign({}, song);
            updatedSong._updated_custom_performances = customPerformances.map(perf =>
                labelRenames[perf.label] ? { ...perf, label: labelRenames[perf.label] } : perf
            );
            return updatedSong;
        }
        return null;
    }

    function checkPrimarytoGroupMembers(song) {
        const labelRenames = {
            "Primary Artists": "Group Members",
        };

        const customPerformances = song.custom_performances || [];
        const needsUpdate = customPerformances.some(perf => labelRenames[perf.label]);

        if (needsUpdate) {
            const updatedSong = Object.assign({}, song);
            updatedSong._updated_custom_performances = customPerformances.map(perf =>
                labelRenames[perf.label] ? { ...perf, label: labelRenames[perf.label] } : perf
            );
            return updatedSong;
        }
        return null;
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
            const updatedWriterArtists = lyricistsAndComposersAndWriters.filter(
                (artist, index, self) =>
                    index === self.findIndex(a => a.id === artist.id)
            );

            const updatedSong = Object.assign({}, song);
            updatedSong._updated_writer_artists = updatedWriterArtists;

            return updatedSong;
        }
        return false;
    }




    function addCleanupButton(songs, actionType, label, metadataUpdate) {
        if (songs.length === 0) return;

        const albumAdminMenu = document.querySelector('album-admin-menu');
        if (!albumAdminMenu) return;

        const actionButton = document.createElement('button');
        actionButton.className = 'square_button u-bottom_margin';
        actionButton.textContent = label;
        actionButton.setAttribute('ng-click', "$ctrl.removeZWSP()");
        actionButton.setAttribute('ng-if', "$ctrl.has_permission('removeZWSP')");
        actionButton.setAttribute('bis_skin_checked', '1');
        actionButton.style.marginRight = "0.25rem";

        function showCoverArtPopup(songs, metadataUpdate, delay) {
            const coverUrlMap = new Map();
            songs.forEach(song => {
                const url = song.custom_song_art_image_url;
                if (!url) return;
                if (!coverUrlMap.has(url)) {
                    coverUrlMap.set(url, []);
                }
                coverUrlMap.get(url).push(song);
            });

            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
            overlay.style.zIndex = '9999';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.padding = '2rem';

            const popup = document.createElement('div');
            popup.style.backgroundColor = '#fff';
            popup.style.borderRadius = '0.5rem';
            popup.style.padding = '20px';
            popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
            popup.style.width = '80%';
            popup.style.maxWidth = '800px';
            popup.style.height = 'auto';
            popup.style.maxHeight = '96%';
            popup.style.overflowY = 'auto';

            const titleContainer = document.createElement('div');
            titleContainer.style.backgroundColor = '#99a7ee';
            titleContainer.style.color = '#fff';
            titleContainer.style.textAlign = 'center';
            titleContainer.style.marginTop = '-20px';
            titleContainer.style.marginLeft = '-20px';
            titleContainer.style.marginRight = '-20px';
            titleContainer.style.marginBottom = '0.5rem';
            titleContainer.style.padding = '1px';
            titleContainer.style.fontWeight = 'bold';
            titleContainer.style.fontSize = '16px';
            titleContainer.textContent = 'Artwork Extractor for Genius';
            popup.insertBefore(titleContainer, popup.firstChild);

            const sectionHeading = document.createElement('div');
            sectionHeading.textContent = 'Select Cover Art to Remove';
            sectionHeading.style.fontWeight = 'bold';
            sectionHeading.style.textAlign = 'center';
            sectionHeading.style.marginTop = '0.75rem';
            popup.appendChild(sectionHeading);

            const coverGrid = document.createElement('div');
            coverGrid.style.display = 'flex';
            coverGrid.style.flexWrap = 'wrap';
            coverGrid.style.justifyContent = 'space-between';
            coverGrid.style.gap = '0.5rem';
            coverGrid.style.marginTop = '0.5rem';
            coverGrid.style.marginBottom = '1rem';
            popup.appendChild(coverGrid);

            const selectedUrls = new Set();

            for (const [url, songGroup] of coverUrlMap.entries()) {
                const wrapper = document.createElement('div');
                wrapper.style.border = '5px solid transparent';
                wrapper.style.borderRadius = '0.5rem';
                wrapper.style.cursor = 'pointer';
                wrapper.style.width = '49%';

                const img = document.createElement('img');
                img.src = url;
                img.alt = songGroup[0].title || 'Cover';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '0.25rem';

                const countLabel = document.createElement('div');
                countLabel.textContent = `${songGroup.length} Track${songGroup.length === 1 ? '' : 's'}`;
                countLabel.style.fontSize = '0.85rem';
                countLabel.style.textAlign = 'center';

                wrapper.appendChild(img);
                wrapper.appendChild(countLabel);
                coverGrid.appendChild(wrapper);

                wrapper.addEventListener('click', () => {
                    if (selectedUrls.has(url)) {
                        selectedUrls.delete(url);
                        wrapper.style.border = '5px solid transparent';
                        wrapper.style.borderRadius = '0.5rem';
                    } else {
                        selectedUrls.add(url);
                        wrapper.style.border = '5px solid #99a7ee';
                    }
                });
            }


            const buttonRow = document.createElement('div');
            buttonRow.style.marginTop = '0.5rem';

            const cancelButton = document.createElement('button');
            cancelButton.className = 'square_button square_button--transparent square_button--gray';
            cancelButton.textContent = 'Cancel';
            cancelButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });

            const saveButton = document.createElement('button');
            saveButton.className = 'square_button square_button--green';
            saveButton.type = 'submit';
            saveButton.textContent = 'Save';
            saveButton.addEventListener('click', async () => {
                const affectedSongs = songs.filter(song => selectedUrls.has(song.custom_song_art_image_url));

                affectedSongs.forEach((song, index) => {
                    setTimeout(async () => {
                        let updateData = {};

                        if (metadataUpdate.coverArt) {
                            console.log('Removing cover art for song:', song);
                            updateData.custom_song_art_image_url = null;
                        }

                        await updateSongMetadata(song, updateData);
                    }, index * delay);
                });

                document.body.removeChild(overlay);

                actionButton.style.display = 'none';

                const albumButtons = document.querySelectorAll('.square_button.u-bottom_margin');
                albumButtons.forEach((button, index) => {
                    if (index >= 2) button.remove();
                });

                const expandText = document.querySelector('span.expand-text');
                if (expandText) expandText.remove();

                setTimeout(() => {
                    checkPage();
                }, 1000);

            });

            buttonRow.appendChild(saveButton);
            buttonRow.appendChild(cancelButton);
            popup.appendChild(buttonRow);
            overlay.appendChild(popup);
            document.body.appendChild(overlay);
        }

        actionButton.addEventListener('click', async () => {
            const delay = 50;

            if (actionType === "CoverArt") {
                showCoverArtPopup(songs, metadataUpdate, delay);
                return;
            }

            songs.forEach((song, index) => {
                setTimeout(async () => {
                    let updateData = {};

                    if (metadataUpdate.title === "remove_zwsp") {
                        updateData.title = song.title
                            .replace(/\u200B{2,}/g, '\u200B')
                            .replace(/^\u200B|(?<=[\p{L}\p{N}\p{P}])\u200B|(?=[\p{L}\p{N}\p{P}])\u200B/gu, '');
                    }

                    if (metadataUpdate.primaryArtists) {
                        updateData.custom_performances = (song.custom_performances || []).filter(
                            perf => perf.label !== "Primary Artists"
                        );
                    }
                    if (metadataUpdate.renameLabels && song._updated_custom_performances) {
                        updateData.custom_performances = song._updated_custom_performances;
                    }

                    if (metadataUpdate.writerArtists && song._updated_writer_artists) {
                        updateData.writer_artists = song._updated_writer_artists;
                    }

                    await updateSongMetadata(song, updateData);
                }, index * delay);
            });

            actionButton.style.display = 'none';

            const albumButtons = document.querySelectorAll('.square_button.u-bottom_margin');
            albumButtons.forEach((button, index) => {
                if (index >= 2) button.remove();
            });

            const expandText = document.querySelector('span.expand-text');
            if (expandText) expandText.remove();

            setTimeout(() => {
                checkPage();
            }, 1000);
        });
        albumAdminMenu.parentNode.insertBefore(actionButton, albumAdminMenu);
    }

    /*
    async function updateSongMetadata(song, updates) {
        if (Object.keys(updates).length === 0) return;
        try {
            const updateResponse = await fetch(`https://genius.com/api/songs/${song.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': document.cookie,
                    'X-CSRF-Token': getCsrfToken(),
                    'User-Agent': 'ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)'
                },
                body: JSON.stringify({ song: updates })
            });

            if (!updateResponse.ok) {
                console.error(`Error updating song metadata: ${updateResponse.statusText}`);
            }
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }*/

    async function updateSongMetadata(song, updates) {
        if (Object.keys(updates).length === 0) return;

        const needsTitleUpdate = typeof updates.title === 'string';
        const isPublished = song.published === true;

        try {
            if (needsTitleUpdate && isPublished) {
                const unpublishResponse = await fetch(`https://genius.com/api/songs/${song.id}/unpublish`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': document.cookie,
                        'X-CSRF-Token': getCsrfToken(),
                        'User-Agent': 'ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)'
                    }
                });

                if (!unpublishResponse.ok) {
                    console.error(`Error unpublishing song ${song.id}: ${unpublishResponse.statusText}`);
                    return;
                }
            }

            const updateResponse = await fetch(`https://genius.com/api/songs/${song.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': document.cookie,
                    'X-CSRF-Token': getCsrfToken(),
                    'User-Agent': 'ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)'
                },
                body: JSON.stringify({ song: updates })
            });

            if (!updateResponse.ok) {
                console.error(`Error updating song metadata: ${updateResponse.statusText}`);
                return;
            }

            if (needsTitleUpdate && isPublished) {
                const publishResponse = await fetch(`https://genius.com/api/songs/${song.id}/publish`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': document.cookie,
                        'X-CSRF-Token': getCsrfToken(),
                        'User-Agent': 'ArtworkExtractorForGenius/0.5.1 (Artwork Extractor for Genius)'
                    }
                });

                if (!publishResponse.ok) {
                    console.error(`Error publishing song ${song.id}: ${publishResponse.statusText}`);
                }
            }
        } catch (error) {
            console.error(`Error processing song ${song.id}:`, error);
        }
    }

});

