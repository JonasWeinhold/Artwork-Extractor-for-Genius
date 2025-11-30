chrome.storage.local.get(['Services/youtubemusic.js', 'isYouTubeMusicCopyCoverPlaylist', 'isYouTubeMusicCopyCoverChannels', 'isYouTubeMusicCopyLink', 'isYouTubeMusicPopup', 'isYouTubeMusicSaveImage'], function (result) {
    const isYouTubeMusicCopyCoverPlaylist = result.isYouTubeMusicCopyCoverPlaylist !== undefined ? result.isYouTubeMusicCopyCoverPlaylist : true;
    const isYouTubeMusicCopyCoverChannels = result.isYouTubeMusicCopyCoverChannels !== undefined ? result.isYouTubeMusicCopyCoverChannels : true;
    const isYouTubeMusicCopyLink = result.isYouTubeMusicCopyLink !== undefined ? result.isYouTubeMusicCopyLink : true;
    const isYouTubeMusicPopup = result.isYouTubeMusicPopup !== undefined ? result.isYouTubeMusicPopup : true;
    const isYouTubeMusicSaveImage = result.isYouTubeMusicSaveImage !== undefined ? result.isYouTubeMusicSaveImage : false;

    if (result['Services/youtubemusic.js'] === false) {
        return;
    }

    // Copy Cover Button for Playlists
    function addCopyCoverButtonPlaylists() {
        const actionButtons = document.querySelector('.thumbnail.style-scope.ytmusic-responsive-header-renderer');

        if (actionButtons && !document.getElementById('copy-cover-button-playlist')) {
            const copyButton = document.createElement('button');
            copyButton.id = 'copy-cover-button-playlist';
            copyButton.innerText = isYouTubeMusicSaveImage ? "Save Cover" : "Copy Cover";

            Object.assign(copyButton.style, {
                height: '42px',
                width: '200px',
                margin: '10px auto',
                borderRadius: '500px',
                padding: '2px 11px',
                border: '1px solid #f1f1f1',
                backgroundColor: '#f1f1f1',
                color: '#030303',
                fontSize: '20px',
                lineHeight: '20px',
                fontWeight: 'bold',
                display: 'block',
                position: 'relative',
                whiteSpace: 'nowrap',
                fontFamily: 'Roboto, sans-serif',
                textAlign: 'center',
                verticalAlign: 'initial',
                userSelect: 'none',
                boxSizing: 'border-box'
            });

            copyButton.addEventListener('click', async (event) => {
                event.preventDefault();
                sessionStorage.setItem('mouseX', event.clientX);
                sessionStorage.setItem('mouseY', event.clientY);

                const coverUrl = await getYouTubeMusicPlaylistArtwork();
                const imageUrl = coverUrl.replace(/=w\d+-h\d+-[a-z-]*\d*-rj(?:-[a-zA-Z0-9]+)?$/, '=s0-rp');

                if (imageUrl) {
                    const fileName = getFileNameFromUrl(imageUrl);
                    const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                    const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                    const design = {
                        position: "fixed",
                        backgroundColor: "#f1f1f1",
                        color: "#030303",
                        borderRadius: "500px",
                        padding: "10px 20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        zIndex: "9999",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        top: `${mouseY + 40}px`,
                        left: `${mouseX + 50}px`
                    };
                    await processPngImage(imageUrl, fileName, isYouTubeMusicSaveImage, isYouTubeMusicPopup, design);
                }
            });
            actionButtons.parentNode.insertBefore(copyButton, actionButtons.nextSibling);
        }
    }

    // Copy Cover Button for Channels
    function addCopyCoverButtonChannels() {
        const actionButtons = document.querySelector('.buttons.style-scope.ytmusic-immersive-header-renderer');

        if (actionButtons && !document.getElementById('copy-cover-button-channel')) {
            const copyButton = document.createElement('button');
            copyButton.id = 'copy-cover-button-channel';
            copyButton.innerText = isYouTubeMusicSaveImage ? "Save Cover" : "Copy Cover";

            Object.assign(copyButton.style, {
                height: '36px',
                width: '136px',
                margin: '0',
                borderRadius: '500px',
                padding: '2px 11px',
                border: '1px solid #f1f1f1',
                backgroundColor: '#f1f1f1',
                color: '#030303',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'left',
                display: 'block',
                position: 'relative',
                whiteSpace: 'nowrap',
                fontFamily: 'Roboto, sans-serif',
                textAlign: 'center',
                verticalAlign: 'initial',
                userSelect: 'none',
                boxSizing: 'border-box'
            });
            copyButton.addEventListener('click', async (event) => {
                event.preventDefault();
                sessionStorage.setItem('mouseX', event.clientX);
                sessionStorage.setItem('mouseY', event.clientY);

                const coverUrl = await getYouTubeMusicChannelArtwork();
                const imageUrl = coverUrl.replace(/=w\d+-h\d+-[a-z-]*\d*-rj(?:-[a-zA-Z0-9]+)?$/, '=s0-rp');

                if (imageUrl) {
                    const fileName = getFileNameFromUrl(imageUrl);
                    const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                    const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                    const design = {
                        position: "fixed",
                        backgroundColor: "#f1f1f1",
                        color: "#030303",
                        borderRadius: "500px",
                        padding: "10px 20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        zIndex: "9999",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        top: `${mouseY + 25}px`,
                        left: `${mouseX + 50}px`
                    };
                    await processPngImage(imageUrl, fileName, isYouTubeMusicSaveImage, isYouTubeMusicPopup, design);
                }
            });
            actionButtons.parentNode.insertBefore(copyButton, actionButtons.nextSibling);
        }
    }

    //YouTube Music Artwork Fetcher for Playlists via img src
    async function getYouTubeMusicPlaylistArtwork() {
        const coverUrl = document.querySelector('ytmusic-thumbnail-renderer.thumbnail.style-scope.ytmusic-responsive-header-renderer img#img');
        return coverUrl.src;
    }

    //YouTube Music Artwork Fetcher for Channels via img src
    async function getYouTubeMusicChannelArtwork() {
        const coverUrl = document.querySelector('ytmusic-fullbleed-thumbnail-renderer.image.style-scope.ytmusic-immersive-header-renderer picture img');
        return coverUrl.src;
    }

    function getFileNameFromUrl(url) {
        const parts = url.split('/');
        const fileNameWithExtension = parts.pop().split('.')[0];
        return fileNameWithExtension;
    }





    // Copy Link Button
    function addCopyLinkButtons() {
        const items = document.querySelectorAll('ytmusic-responsive-list-item-renderer');
        items.forEach(item => {
            if (!item.querySelector('.copy-link-button')) {
                const titleColumn = item.querySelector('.title-column.style-scope.ytmusic-responsive-list-item-renderer');
                if (titleColumn) {
                    titleColumn.style.display = 'flex';
                    titleColumn.style.alignItems = 'center';
                    titleColumn.style.justifyContent = 'flex-start';

                    const trackButton = document.createElement('button');
                    trackButton.className = 'copy-link-button';
                    trackButton.innerText = 'Copy Link';

                    Object.assign(trackButton.style, {
                        cursor: 'pointer',
                        height: 'auto',
                        width: 'auto',
                        marginRight: '10px',
                        borderRadius: '500px',
                        padding: '2px 11px',
                        border: '1px solid #f1f1f1',
                        backgroundColor: '#f1f1f1',
                        color: '#030303',
                        fontSize: 'var(--ytmusic-responsive-font-size)',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    });

                    trackButton.addEventListener('click', async (event) => {
                        event.stopPropagation();
                        sessionStorage.setItem('mouseX', event.clientX);
                        sessionStorage.setItem('mouseY', event.clientY);

                        const link = await getYouTubeMusicTrackLink(titleColumn);
                        if (link) {
                            navigator.clipboard.writeText(link).then(() => {
                                const mouseX = parseInt(sessionStorage.getItem("mouseX"), 10);
                                const mouseY = parseInt(sessionStorage.getItem("mouseY"), 10);
                                const design = {
                                    position: "fixed",
                                    backgroundColor: "#f1f1f1",
                                    color: "#030303",
                                    borderRadius: "500px",
                                    padding: "10px 20px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    zIndex: "9999",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                                    top: `${mouseY + 20}px`,
                                    left: `${mouseX + 40}px`
                                };
                                if (isYouTubeMusicPopup) showPopupNotification(design);
                            });
                        }
                    });

                    titleColumn.insertBefore(trackButton, titleColumn.firstChild);
                }
            }
        });
    }

    //YouTube Music Track Link Fetcher via title column
    async function getYouTubeMusicTrackLink(titleColumn) {
        const linkElement = titleColumn.querySelector('a');
        if (linkElement) {
            if (linkElement.href.startsWith('https://music.youtube.com/watch')) {
                const url = new URL(linkElement.href);
                const link = `https://youtube.com/watch?v=${url.searchParams.get('v')}`;
                return link;
            }
        }
    }





    document.addEventListener('click', (event) => {
        const playlistUrlPattern = /^https:\/\/music\.youtube\.com\/playlist/;
        const channelUrlPattern = /^https:\/\/music\.youtube\.com\/channel/;

        if (playlistUrlPattern.test(window.location.href)) {
            if (isYouTubeMusicCopyCoverPlaylist) addCopyCoverButtonPlaylists();
            if (isYouTubeMusicCopyLink) addCopyLinkButtons();
        }
        if (channelUrlPattern.test(window.location.href)) {
            if (isYouTubeMusicCopyCoverChannels) addCopyCoverButtonChannels();
        }
    });

});