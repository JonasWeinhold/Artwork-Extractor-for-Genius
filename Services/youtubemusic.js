chrome.storage.local.get(['Services/youtubemusic.js', 'isYouTubeMusicCopyCoverPlaylist', 'isYouTubeMusicCopyCoverChannels', 'isYouTubeMusicCopyLink', 'isYouTubeMusicPopup', 'isYouTubeMusicSaveImage'], function (result) {
    const isYouTubeMusicCopyCoverPlaylist = result.isYouTubeMusicCopyCoverPlaylist !== undefined ? result.isYouTubeMusicCopyCoverPlaylist : true;
    const isYouTubeMusicCopyCoverChannels = result.isYouTubeMusicCopyCoverChannels !== undefined ? result.isYouTubeMusicCopyCoverChannels : true;
    const isYouTubeMusicCopyLink = result.isYouTubeMusicCopyLink !== undefined ? result.isYouTubeMusicCopyLink : true;
    const isYouTubeMusicPopup = result.isYouTubeMusicPopup !== undefined ? result.isYouTubeMusicPopup : true;
    const isYouTubeMusicSaveImage = result.isYouTubeMusicSaveImage !== undefined ? result.isYouTubeMusicSaveImage : false;

    if (result['Services/youtubemusic.js'] === false) {
        return;
    }

    function showPopup(message, event, offsetX, offsetY) {
        const popup = document.createElement('div');
        popup.innerText = message;
        popup.className = 'copy-popup';

        popup.style.position = 'fixed';
        popup.style.backgroundColor = '#f1f1f1';
        popup.style.color = '#030303';
        popup.style.borderRadius = '500px';
        popup.style.padding = '10px 20px';
        popup.style.fontSize = '12px';
        popup.style.fontWeight = "bold";
        popup.style.zIndex = "9999";
        popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

        popup.style.top = `${event.clientY + offsetY}px`;
        popup.style.left = `${event.clientX + offsetX}px`;

        document.body.appendChild(popup);
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 1500);
    }

    function CopyCoverButtonPlaylists() {
        if (!window.location.href.startsWith('https://music.youtube.com/playlist')) return;
        if (document.querySelector('.copy-cover-button-playlist')) return;

        let actionButtons = document.querySelector('.thumbnail.style-scope.ytmusic-responsive-header-renderer');
        let buttonStyles = {
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
            fontWeight: 'bold'
        };

        if (actionButtons) {
            const copyButton = document.createElement('button');
            copyButton.innerText = isYouTubeMusicSaveImage ? "Save Cover" : "Copy Cover";
            copyButton.className = 'copy-cover-button-playlist';

            Object.assign(copyButton.style, buttonStyles);
            copyButton.style.display = 'block';
            copyButton.style.position = 'relative';
            copyButton.style.whiteSpace = 'nowrap';
            copyButton.style.fontFamily = 'Roboto, sans-serif';
            copyButton.style.textAlign = 'center';
            copyButton.style.verticalAlign = 'initial';
            copyButton.style.userSelect = 'none';
            copyButton.style.boxSizing = 'border-box';

            actionButtons.parentNode.insertBefore(copyButton, actionButtons.nextSibling);

            copyButton.addEventListener('click', async function (event) {
                let coverImage = document.querySelector('ytmusic-thumbnail-renderer.thumbnail.style-scope.ytmusic-responsive-header-renderer img#img');
                if (coverImage) {
                    let coverImageUrl = coverImage.src;
                    coverImageUrl = coverImageUrl.replace(/=w\d+-h\d+-[a-z-]*\d*-rj(?:-[a-zA-Z0-9]+)?$/, '=s0-rp');

                    if (coverImageUrl) {
                        await processYouTubeMusicImage(coverImageUrl, event);
                        if (isYouTubeMusicPopup && !isYouTubeMusicSaveImage) showPopup('Copied to clipboard', event, 25, 50);
                    }
                }
            });
        }
    }

    function CopyCoverButtonChannels() {
        if (!window.location.href.startsWith('https://music.youtube.com/channel')) return;
        if (document.querySelector('.copy-cover-button-channel')) return;

        let actionButtons = document.querySelector('.buttons.style-scope.ytmusic-immersive-header-renderer');
        let buttonStyles = {
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
            textAlign: 'left'
        };

        if (actionButtons) {
            const copyButton = document.createElement('button');
            copyButton.innerText = isYouTubeMusicSaveImage ? "Save Cover" : "Copy Cover";
            copyButton.className = 'copy-cover-button-channel';

            Object.assign(copyButton.style, buttonStyles);
            copyButton.style.display = 'block';
            copyButton.style.position = 'relative';
            copyButton.style.whiteSpace = 'nowrap';
            copyButton.style.fontFamily = 'Roboto, sans-serif';
            copyButton.style.textAlign = 'center';
            copyButton.style.verticalAlign = 'initial';
            copyButton.style.userSelect = 'none';
            copyButton.style.boxSizing = 'border-box';

            actionButtons.parentNode.insertBefore(copyButton, actionButtons.nextSibling);

            copyButton.addEventListener('click', async function (event) {
                let coverImage = document.querySelector('ytmusic-fullbleed-thumbnail-renderer.image.style-scope.ytmusic-immersive-header-renderer picture img');
                if (coverImage) {
                    let coverImageUrl = coverImage.src;
                    coverImageUrl = coverImageUrl.replace(/=w\d+-h\d+-[a-z-]*\d*-rj(?:-[a-zA-Z0-9]+)?$/, '=s0-rp');

                    if (coverImageUrl) {
                        await processYouTubeMusicImage(coverImageUrl, event);
                        if (isYouTubeMusicPopup && !isYouTubeMusicSaveImage) showPopup('Copied to clipboard', event, 25, 50);
                    }
                }
            });
        }
    }



    async function processYouTubeMusicImage(extractedUrl, event) {
        const fileName = getFileNameFromUrl(extractedUrl);

        if (isYouTubeMusicSaveImage) {
            const response = await fetch(extractedUrl); 
            const blob = await response.blob(); 
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob); 
            link.download = `${fileName}.png`; 
            document.body.appendChild(link);
            link.click(); 
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href); 
        } else {
            await navigator.clipboard.writeText(extractedUrl);
        }
    }

    function getFileNameFromUrl(url) {
        const parts = url.split('/'); 
        const fileNameWithExtension = parts.pop().split('.')[0]; 
        return fileNameWithExtension; 
    }


    function CopyLinkButtons() {

        if (!window.location.href.startsWith('https://music.youtube.com/playlist')) {
            return; 
        }

        const items = document.querySelectorAll('ytmusic-responsive-list-item-renderer');
        items.forEach(item => {
            if (!item.querySelector('.copy-link-button')) {
                const titleColumn = item.querySelector('.title-column.style-scope.ytmusic-responsive-list-item-renderer');
                if (titleColumn) {
                    titleColumn.style.display = 'flex';
                    titleColumn.style.alignItems = 'center'; 
                    titleColumn.style.justifyContent = 'flex-start'; 

                    const copyButton = document.createElement('button');
                    copyButton.innerText = 'Copy Link';
                    copyButton.className = 'copy-link-button';
                    copyButton.style.cursor = 'pointer'; 

                    const buttonStyles = {
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
                    };

                    Object.assign(copyButton.style, buttonStyles);

                    copyButton.addEventListener('click', function (event) {
                        event.stopPropagation();
                        const linkElement = titleColumn.querySelector('a'); 
                        if (linkElement) {
                            let link = linkElement.href;

                            if (link.startsWith('https://music.youtube.com/watch')) {
                                const url = new URL(link);
                                link = `https://youtube.com/watch?v=${url.searchParams.get('v')}`;
                            }

                            navigator.clipboard.writeText(link).then(() => {
                                if (isYouTubeMusicPopup) showPopup('Copied to clipboard', event, 20, 40);
                            });
                        }
                    });

                    titleColumn.insertBefore(copyButton, titleColumn.firstChild);
                }
            }
        });
    }

    function observeUrlChanges() {
        let previousUrl = window.location.href;
        const observer = new MutationObserver(() => {
            if (previousUrl !== window.location.href) {
                previousUrl = window.location.href;
                if (isYouTubeMusicCopyCoverPlaylist) CopyCoverButtonPlaylists();
                if (isYouTubeMusicCopyCoverChannels) CopyCoverButtonChannels();
                if (isYouTubeMusicCopyLink) CopyLinkButtons();
            }
        });

        const config = { subtree: true, childList: true };
        observer.observe(document, config);
    }

    window.addEventListener('click', function () {
        if (isYouTubeMusicCopyCoverPlaylist) CopyCoverButtonPlaylists();
        if (isYouTubeMusicCopyCoverChannels) CopyCoverButtonChannels();
        if (isYouTubeMusicCopyLink) CopyLinkButtons();
        observeUrlChanges();
    });

});