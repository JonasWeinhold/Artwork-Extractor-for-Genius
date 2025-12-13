chrome.storage.local.get([
    'Services/genius_artist.js',
    'isGeniusArtistArtistPage',
    'isGeniusArtistArtistPageZwsp',
    'isGeniusArtistAllSongsAlbumsPage',
    'isGeniusArtistAllSongsAlbumsPageMetadata',
    'isGeniusArtistAllSongsAlbumsPageZwsp',
    'isGeniusArtistFollowButton'
], async function (result) {
    const isGeniusArtistArtistPage = result.isGeniusArtistArtistPage !== undefined ? result.isGeniusArtistArtistPage : true;
    const isGeniusArtistArtistPageZwsp = result.isGeniusArtistArtistPageZwsp !== undefined ? result.isGeniusArtistArtistPageZwsp : true;
    const isGeniusArtistAllSongsAlbumsPage = result.isGeniusArtistAllSongsAlbumsPage !== undefined ? result.isGeniusArtistAllSongsAlbumsPage : true;
    const isGeniusArtistAllSongsAlbumsPageMetadata = result.isGeniusArtistAllSongsAlbumsPageMetadata !== undefined ? result.isGeniusArtistAllSongsAlbumsPageMetadata : true;
    const isGeniusArtistAllSongsAlbumsPageZwsp = result.isGeniusArtistAllSongsAlbumsPageZwsp !== undefined ? result.isGeniusArtistAllSongsAlbumsPageZwsp : true;
    const isGeniusArtistFollowButton = result.isGeniusArtistFollowButton !== undefined ? result.isGeniusArtistFollowButton : false;


    if (result['Services/genius_artist.js'] === false) {
        return;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                  MAIN PROGRAM                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    checkPage();

    function checkPage() {
        const isAllSongs = window.location.href.match(/https:\/\/(genius\.com|genius-staging.com)\/artists\/[^\/]+\/songs/);
        const isAllAlbums = window.location.href.match(/https:\/\/(genius\.com|genius-staging.com)\/artists\/[^\/]+\/albums/);
        const isArtist = window.location.href.startsWith('https://genius.com/artists') || window.location.href.startsWith('https://genius-staging.com/artists');

        if (isAllSongs || isAllAlbums) {
            if (isGeniusArtistAllSongsAlbumsPage || isGeniusArtistAllSongsAlbumsPageMetadata) checkAllSongsAlbumsPage();
        } else if (isArtist) {
            const artistId = getArtistInfo();
            if (isGeniusArtistArtistPage) checkArtistPage();
            if (isGeniusArtistFollowButton) FollowButtonArtistPage(artistId);
        }

        function getArtistInfo() {
            const artistId = document.querySelector("link[rel='alternate']").href.split("/").pop();
            const userId = document.documentElement.innerHTML.match(/var CURRENT_USER = JSON.parse\('{\\"id\\":(\d+)/)?.[1];

            //const response = await fetch(`https://genius.com/api/artists/${artistId}`);
            //const json = await response.json();

            if (userId == 4670957) {
                const identityTextContainer = document.querySelector(".profile_identity-text");
                const artistIdContainer = document.createElement("div");
                artistIdContainer.className = "profile_identity-alternate_names";
                artistIdContainer.setAttribute("ng-if", "$ctrl.artist.alternate_names.length");
                artistIdContainer.style.marginBottom = "0.25rem";
                const artistIdElement = document.createElement("span");
                artistIdElement.className = "profile_identity-alternate_names";
                artistIdElement.textContent = "Artist ID: ";
                artistIdElement.style.fontSize = "0.75rem";
                const artistIdLink = document.createElement("a");
                artistIdLink.href = `https://genius.com/api/artists/${artistId}`;
                artistIdLink.target = "_blank";
                artistIdLink.textContent = artistId;
                artistIdLink.style.textDecoration = "none";
                artistIdLink.style.color = "inherit";
                artistIdLink.onmouseover = () => artistIdLink.style.textDecoration = "underline";
                artistIdLink.onmouseout = () => artistIdLink.style.textDecoration = "none";
                artistIdElement.appendChild(artistIdLink);
                artistIdContainer.appendChild(artistIdElement);
                identityTextContainer.appendChild(artistIdContainer);
            }
            return artistId;
        }
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                   INDICATORS                                   //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

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
        const listItems = document.querySelectorAll('li[class^="ListItem__Container"]');
        listItems.forEach(item => {
            const h3Element = item.querySelector('h3');
            if (h3Element) {
                const h3Text = h3Element.textContent;
                if (h3Text.startsWith('\u200B')) {
                    const targetDiv = item.querySelector('div[class^="ListItem__InfoContainer"]');
                    if (targetDiv) {
                        targetDiv.style.borderLeft = '20px solid black';
                        targetDiv.style.paddingLeft = '5px';
                    }
                } else if (h3Text.endsWith('\u200B')) {
                    const targetDiv = item.querySelector('div[class^="ListItem__InfoContainer"]');
                    if (targetDiv) {
                        targetDiv.style.borderRight = '20px solid black';
                        targetDiv.style.paddingRight = '5px';
                    }
                } else if (h3Text.includes('\u200B')) {
                    const targetDiv = item.querySelector('div[class^="ListItem__InfoContainer"]');
                    if (targetDiv) {
                        targetDiv.style.borderTop = '20px solid black';
                    }
                }
            }
        });
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                               COVER ARTIST PAGES                               //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function checkArtistPage() {
        const metaTag = document.querySelector('meta[property="og:image"]');
        if (metaTag) {
            const coverImageUrl = metaTag.getAttribute('content');
            const container = document.querySelector('.profile_identity_and_description-action_row');
            const editArtistButton = Array.from(container.querySelectorAll('.square_button')).find(button => button.textContent.trim() === 'Edit');
            if (editArtistButton) {
                const iconsToRemove = editArtistButton.querySelectorAll('.inline_icon, .inline_icon--reading_size, .inline_icon--up_1');
                iconsToRemove.forEach(icon => icon.remove());
                let color, borderColor;
                if (coverImageUrl.endsWith("1000x1000x1.png")) {
                    color = '#99f2a5'; // Green
                    borderColor = '#66bfa3';
                } else if (coverImageUrl.startsWith("http://assets.genius.com/images/sharing_fallback.png")) {
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
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////                                 FOLLOW BUTTON                                  //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function FollowButtonArtistPage(artistId) {
        const existingFollowButton = document.querySelector('follow-button a.square_button');
        const messageButton = document.querySelector('div.square_button[ng-click="$ctrl.show_conversation_modal = true"][ng-if="$ctrl.can_message_user"]');
        const editButton = document.querySelector('div.square_button[ng-if="$ctrl.can_edit_profile"][ng-click="$ctrl.show_edit_artist_profile_modal = true"]');

        const buttonContainer = document.createElement('div');
        const createButton = (text, action) => {
            const button = document.createElement('button');
            button.className = 'square_button u-bottom_margin';
            button.textContent = text;
            button.style.whiteSpace = 'nowrap';
            button.style.width = '153.29px';
            button.style.marginLeft = action === "unfollow" ? "4px" : "0";
            button.addEventListener('click', async () => {
                button.textContent = `${action.charAt(0).toUpperCase() + action.slice(1)}ing...`;
                button.disabled = true;
                const songIds = await fetchAllSongIds(artistId);
                console.log(`Found ${songIds.length} songs for artist ID ${artistId}.`);
                for (const songId of songIds) {
                    await toggleFollowSong(songId, action);
                    await new Promise(resolve => setTimeout(resolve, 25));
                }
                button.textContent = `${action.charAt(0).toUpperCase() + action.slice(1)}ing`;
                button.disabled = false;
            });
            return button;
        };

        buttonContainer.appendChild(createButton('Follow All Songs', 'follow'));
        buttonContainer.appendChild(createButton('Unfollow All Songs', 'unfollow'));
        editButton.parentNode.insertBefore(buttonContainer, editButton.nextSibling);

        const buttonWidths = existingFollowButton && messageButton ? '100.86px' : '153.29px';
        [existingFollowButton, messageButton, editButton].forEach(btn => btn && (btn.style.width = buttonWidths));
        editButton.style.justifyContent = 'center';
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

    async function toggleFollowSong(songId, action) {
        const url = `https://genius.com/api/songs/${songId}/${action}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': document.cookie,
                'X-CSRF-Token': getCsrfToken(),
                'User-Agent': 'ArtworkExtractorForGenius/0.4.7 (Artwork Extractor for Genius)'
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
    //////////                            ALL SONGS / ALBUMS PAGES                            //////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function checkAllSongsAlbumsPage() {
        let cachedSongs = null;
        let cachedAlbums = null;
        let items = [];
        let updates = [];

        let fetchArtistId, fetchSongs, fetchAlbums;

        const isAllSongs = window.location.href.match(/https:\/\/genius\.com\/artists\/[^\/]+\/songs/);
        const isAllAlbums = window.location.href.match(/https:\/\/genius\.com\/artists\/[^\/]+\/albums/);

        async function checkAllEntriesAndFetchFunctions() {
            fetchArtistId = async function () {
                const artistIdMatch = document.body.innerHTML.match(/\\"artist\\":(\d+),/);
                const totalEntriesMatch = document.body.innerHTML.match(/\\"totalEntries\\":(\d+),/);
                if (!artistIdMatch || !totalEntriesMatch) {
                    return { artistId: null, totalEntries: 0 };
                }
                return {
                    artistId: artistIdMatch[1],
                    totalEntries: parseInt(totalEntriesMatch[1], 10)
                };
            };

            fetchSongs = async function (artistId, totalEntries) {
                if (cachedSongs) return cachedSongs;

                const songs = [];
                const perPage = 50;
                const totalPages = Math.ceil(totalEntries / perPage);

                const fetchPromises = Array.from({ length: totalPages }, (_, page) =>
                    fetch(`https://genius.com/api/artists/${artistId}/songs?page=${page + 1}&per_page=${perPage}&sort=popularity&text_format=html%2Cmarkdown`)
                        .then(response => response.json())
                        .then(data => songs.push(...data.response.songs))
                );

                await Promise.all(fetchPromises);
                cachedSongs = songs;
                return songs;
            };

            fetchAlbums = async function (artistId, totalEntries) {
                if (cachedAlbums) return cachedAlbums;

                const albums = [];
                const perPage = 50;
                const totalPages = Math.ceil(totalEntries / perPage);

                const fetchPromises = Array.from({ length: totalPages }, (_, page) =>
                    fetch(`https://genius.com/api/artists/${artistId}/albums?page=${page + 1}&per_page=${perPage}&sort=popularity&text_format=html%2Cmarkdown`)
                        .then(response => response.json())
                        .then(data => albums.push(...data.response.albums))
                );

                await Promise.all(fetchPromises);
                cachedAlbums = albums;
                return albums;
            };

            const artistData = await fetchArtistId();
            if (!artistData || !artistData.artistId) return;
            const { artistId, totalEntries } = artistData;

            items = isAllSongs ? await fetchSongs(artistId, totalEntries) : await fetchAlbums(artistId, totalEntries);
            return items;
        }


        async function checkCoverImage() {
            const listSection = document.querySelector('div[class^="ListSection-desktop__Content"]');
            if (!listSection) return;
            const listItems = listSection.querySelectorAll('li[class^="ListItem__Container"]');
            const itemMap = new Map(items.map(item => [item.url, item]));

            listItems.forEach((item) => {
                const targetDiv = item.querySelector('div[class^="SizedImage__Container"]');
                const parentList = item.closest('ul[class^="ListSection-desktop__Items"]');
                if (!targetDiv || !parentList || ['#99f2a5', '#fa7878', '#dddddd'].includes(targetDiv.style.backgroundColor)) return;

                const linkElement = item.querySelector('a');
                const itemLink = linkElement ? linkElement.href : null;

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
        async function checkMetadata(artistId, totalEntries) {
            const ul = document.querySelector('ul[class^="ListSection-desktop__Items"]');
            if (!ul) return;

            const liItems = ul.querySelectorAll('li[class^="ListItem__Container"]');
            const targetLinks = Array.from(liItems)
                .map(li => li.querySelector('a[href]'))
                .filter(aTag => aTag && aTag.href.startsWith('https://genius.com/') && aTag.href.endsWith('-lyrics'))
                .map(aTag => aTag.href);

            const matchedSongs = items.filter(song => targetLinks.includes(song.url));
            const uncachedSongs = matchedSongs.filter(song => !cachedSongData.has(song.id));

            const chunkSize = 5;
            const delayMs = 250;

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
            const listItem = document.querySelector(`li[class^="ListItem__Container"] a[href="${song.url}"]`)?.closest('li');
            if (!listItem) return;

            const infoContainer = listItem.querySelector('div[class^="ListItem__InfoContainer"]');
            if (infoContainer) {
                if (songData.lyrics_marked_complete_by) {
                    infoContainer.style.backgroundColor = '#99f2a5';
                } else if (songData.lyrics_state === 'complete') {
                    infoContainer.style.backgroundColor = '#ffff64';
                } else {
                    infoContainer.style.backgroundColor = '#ff7878';
                }
            }

            if (!songData.album) {
                listItem.style.borderTop = '3.5px dashed';
                listItem.style.borderBottom = '3.5px dashed';
            }
        }

        (async () => {
            await checkAllEntriesAndFetchFunctions();
        })();

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