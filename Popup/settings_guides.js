document.addEventListener('DOMContentLoaded', function () {
    function showContent(id) {
        var contents = document.querySelectorAll('.content div');
        contents.forEach(content => content.style.display = 'none');
        var element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';

            const columnsContainer = element.querySelector('.columns-container');
            if (columnsContainer) columnsContainer.style.display = 'flex';

            ['.one-column', '.left-column', '.divider', '.right-column'].forEach(selector => {
                const column = element.querySelector(selector);
                if (column) column.style.display = 'block';
            });

            document.querySelectorAll('.frame').forEach(frame => frame.style.display = 'block');
            document.querySelectorAll('.function-container').forEach(container => container.style.display = 'block');
        }
    }

    document.querySelectorAll('a[data-id]').forEach(link => {
        const id = link.getAttribute('data-id');
        link.href = `${id}`;
    });


    var menuLinks = document.querySelectorAll('.menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            showContent(this.getAttribute('data-id'));
        });
    });

    const hash = window.location.hash;
    if (hash) {
        showContent(hash.substring(1));
    } else {
        showContent('homepage');
    }

    chrome.storage.local.get('darkMode', function (result) {
        if (result.darkMode) {
            document.body.classList.add('dark-mode');
            document.querySelector('.menu').classList.add('dark-mode');
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.darkMode !== undefined) {
            if (request.darkMode) {
                document.body.classList.add('dark-mode');
                document.querySelector('.menu').classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
                document.querySelector('.menu').classList.remove('dark-mode');
            }
        }
    });

    document.getElementById('saveButton').addEventListener('click', () => {
        const newApiKey = document.getElementById('imgbbApiKey').value;
        chrome.storage.local.set({ imgbbApiKey: newApiKey }, () => {
            console.log('API key successfully saved!');
            console.log('ImgBB API Key:', newApiKey);
            alert('API key successfully saved!');
        });
    });

    document.getElementById('saveButtonTidal').addEventListener('click', () => {
        const newCountryCode = document.getElementById('tidalCountryCode').value;
        chrome.storage.local.set({ tidalCountryCode: newCountryCode }, () => {
            console.log('Tidal country code successfully saved!');
            console.log('Tidal Country Code:', newCountryCode);
            alert('Tidal country code successfully saved!');
        });
    });

    function setupEventListener1(prefix) {
        const convertCheckbox = document.getElementById(`${prefix}ConvertPNG`);
        const saveCheckbox = document.getElementById(`${prefix}SaveImage`);
        const hostCheckbox = document.getElementById(`${prefix}HostImage`);
        const hostImageSpan = document.querySelector(`#${prefix}HostImage`).parentElement.nextElementSibling;

        convertCheckbox.addEventListener("change", function () {
            hostImageSpan.textContent = this.checked ? "Host Image" : "Copy Image";
        });

        saveCheckbox.addEventListener("change", function () {
            hostCheckbox.checked = !this.checked;
        });

        hostCheckbox.addEventListener("change", function () {
            saveCheckbox.checked = !this.checked;
        });
    }

    function setupEventListener2(prefix) {
        const convertCheckbox = document.getElementById(`${prefix}ConvertPNG`);
        const saveCheckbox = document.getElementById(`${prefix}SaveImage`);
        const hostImgBB = document.getElementById(`${prefix}HostImgBB`);
        const hostImageFilestack = document.getElementById(`${prefix}HostFilestack`);
        const hostImageSpanImgBB = document.querySelector(`#${prefix}HostImgBB`).parentElement.nextElementSibling;
        const hostImageSpanFilestack = document.querySelector(`#${prefix}HostFilestack`).parentElement.nextElementSibling;

        convertCheckbox.addEventListener("change", function () {
            hostImageSpanImgBB.textContent = this.checked ? "Host Image (ImgBB)" : "Copy Image";
            hostImageSpanFilestack.textContent = this.checked ? "Host Image (Filestack)" : "Copy Image";
        });

        saveCheckbox.addEventListener("change", function () {
            if (this.checked) {
                hostImgBB.checked = false;
                hostImageFilestack.checked = false;
            }
        });

        hostImgBB.addEventListener("change", function () {
            if (this.checked) {
                hostImageFilestack.checked = false;
                saveCheckbox.checked = false;
            }
        });

        hostImageFilestack.addEventListener("change", function () {
            if (this.checked) {
                hostImgBB.checked = false;
                saveCheckbox.checked = false;
            }
        });
    }


    function saveOrder() {
        const order = {};
        const inputs = document.querySelectorAll('.function-container input');

        inputs.forEach(input => {
            let value = parseInt(input.value, 10);

            if (input.id === "additional_credits") {
                value = (value === 15) ? 15 : 0;
            } else {
                value = (value >= 0 && value <= 14) ? value : 0;
            }

            order[input.id] = value;
        });

        chrome.storage.local.set({ functionOrder: order }, () => {
            reorderHTML(order);
        });
    }

    chrome.storage.local.get(["functionOrder"], (result) => {
        const order = result.functionOrder || {};
        const frame = document.querySelector('.frame');

        const inputs = document.querySelectorAll('.function-container input');

        inputs.forEach((input, index) => {
            input.value = order[input.id] ?? (index + 1);
        });

        reorderHTML(order);
    });

    function reorderHTML(order) {
        const frames = Array.from(document.querySelectorAll('.frame'));

        frames.forEach(frame => {
            const functionContainers = Array.from(frame.querySelectorAll('.function-container'));
            const saveButton = frame.querySelector("#saveMetadataButton");

            functionContainers.sort((a, b) => {
                const aKey = a.querySelector("input").id;
                const bKey = b.querySelector("input").id;
                return (order[aKey] ?? 0) - (order[bKey] ?? 0);
            });

            functionContainers.forEach(container => container.remove());
            functionContainers.forEach(container => frame.appendChild(container));

            let warningText = document.getElementById("warningText");
            if (!warningText) {
                warningText = document.createElement("span");
                warningText.id = "warningText";
                warningText.style.color = "red";
                warningText.style.marginLeft = "10px";
                warningText.style.display = "none";
                warningText.textContent = "Invalid input";
            }

            if (saveButton) {
                frame.appendChild(saveButton);
                frame.appendChild(warningText);
            }
        });
    }

    const inputs = document.querySelectorAll('.function-container input');
    inputs.forEach(input => {
        input.addEventListener("change", function () {
            let value = parseInt(input.value, 10);
            let warningText = document.getElementById("warningText");

            if (input.id === "additional_credits") {
                warningText.style.display = (value !== 0 && value !== 15) ? "inline" : "none";
            } else {
                warningText.style.display = (value < 0 || value > 14) ? "inline" : "none";
            }
        });
    });


    setupEventListener2("is45");
    setupEventListener2("isSoundCloud");
    setupEventListener2("isSpotify");
    setupEventListener2("isTidal");
    setupEventListener2("isYandexMusic");
    setupEventListener1("isInstagram");

    function saveSettings() {
        const isGeniusSongSongPage = document.getElementById('isGeniusSongSongPage').checked;
        const isGeniusSongSongPageZwsp = document.getElementById('isGeniusSongSongPageZwsp').checked;
        const isGeniusSongSongPageInfo = document.getElementById('isGeniusSongSongPageInfo').checked;
        const isGeniusSongSongId = document.getElementById('isGeniusSongSongId').checked;
        const isGeniusSongCheckIndex = document.getElementById('isGeniusSongCheckIndex').checked;
        const isGeniusSongFollowButton = document.getElementById('isGeniusSongFollowButton').checked;
        const isGeniusSongShellyButton = document.getElementById('isGeniusSongShellyButton').checked;
        const isGeniusSongCleanupMetadataButton = document.getElementById('isGeniusSongCleanupMetadataButton').checked;
        const isGeniusSongLanguageButton = document.getElementById('isGeniusSongLanguageButton').checked;
        const isGeniusSongCleanupButton = document.getElementById('isGeniusSongCleanupButton').checked;
        const isGeniusSongSectionsButtons = document.getElementById('isGeniusSongSectionsButtons').checked;
        const isGeniusSongExpandSectionsButtons = document.getElementById('isGeniusSongExpandSectionsButtons').checked;
        const isGeniusSongAnnotationsButtons = document.getElementById('isGeniusSongAnnotationsButtons').checked;
        const isGeniusSongFilterActivity = document.getElementById('isGeniusSongFilterActivity').checked;
        const isGeniusSongCopyCover = document.getElementById('isGeniusSongCopyCover').checked;
        const isGeniusSongAppleMusicPlayer = document.getElementById('isGeniusSongAppleMusicPlayer').checked;
        const isGeniusSongYouTubePlayer = document.getElementById('isGeniusSongYouTubePlayer').checked;
        const isGeniusSongSoundCloudPlayer = document.getElementById('isGeniusSongSoundCloudPlayer').checked;
        const isGeniusSongSpotifyPlayer = document.getElementById('isGeniusSongSpotifyPlayer').checked;
        const isGeniusSongLyricEditor = document.getElementById('isGeniusSongLyricEditor').checked;
        const isGeniusSongRenameButtons = document.getElementById('isGeniusSongRenameButtons').checked;
        const isGeniusAlbumAlbumPage = document.getElementById('isGeniusAlbumAlbumPage').checked;
        const isGeniusAlbumAlbumPageZwsp = document.getElementById('isGeniusAlbumAlbumPageZwsp').checked;
        const isGeniusAlbumAlbumPageLyrics = document.getElementById('isGeniusAlbumAlbumPageLyrics').checked;
        const isGeniusAlbumExpandTracklist = document.getElementById('isGeniusAlbumExpandTracklist').checked;
        const isGeniusAlbumEditTracklist = document.getElementById('isGeniusAlbumEditTracklist').checked;
        const isGeniusAlbumUploadCover = document.getElementById('isGeniusAlbumUploadCover').checked;
        const isGeniusAlbumRenameButtons = document.getElementById('isGeniusAlbumRenameButtons').checked;
        const isGeniusAlbumSongCreditsButton = document.getElementById('isGeniusAlbumSongCreditsButton').checked;
        const isGeniusAlbumFollowButton = document.getElementById('isGeniusAlbumFollowButton').checked;
        const isGeniusAlbumCleanupButton = document.getElementById('isGeniusAlbumCleanupButton').checked;
        const isGeniusArtistArtistPage = document.getElementById('isGeniusArtistArtistPage').checked;
        const isGeniusArtistArtistPageZwsp = document.getElementById('isGeniusArtistArtistPageZwsp').checked;
        const isGeniusArtistArtistPageInfo = document.getElementById('isGeniusArtistArtistPageInfo').checked;
        const isGeniusArtistArtistId = document.getElementById('isGeniusArtistArtistId').checked;
        const isGeniusArtistAllSongsAlbumsPage = document.getElementById('isGeniusArtistAllSongsAlbumsPage').checked;
        const isGeniusArtistAllSongsAlbumsPageMetadata = document.getElementById('isGeniusArtistAllSongsAlbumsPageMetadata').checked;
        const isGeniusArtistAllSongsAlbumsPageZwsp = document.getElementById('isGeniusArtistAllSongsAlbumsPageZwsp').checked;
        const isGeniusArtistFollowButton = document.getElementById('isGeniusArtistFollowButton').checked;
        const is45CopyCover = document.getElementById('is45CopyCover').checked;
        const is45Popup = document.getElementById('is45Popup').checked;
        const is45ConvertPNG = document.getElementById('is45ConvertPNG').checked;
        const is45SaveImage = document.getElementById('is45SaveImage').checked;
        const is45HostImgBB = document.getElementById('is45HostImgBB').checked;
        const is45HostFilestack = document.getElementById('is45HostFilestack').checked;
        const is45RightClick = document.getElementById('is45RightClick').checked;
        const isAppleMusicCopyTracklist = document.getElementById('isAppleMusicCopyTracklist').checked;
        const isAppleMusicCopyCover = document.getElementById('isAppleMusicCopyCover').checked;
        const isAppleMusicCopyAnimatedCover = document.getElementById('isAppleMusicCopyAnimatedCover').checked;
        const isAppleMusicCopyArtist = document.getElementById('isAppleMusicCopyArtist').checked;
        const isAppleMusicCopyCredits = document.getElementById('isAppleMusicCopyCredits').checked;
        const isAppleMusicPopup = document.getElementById('isAppleMusicPopup').checked;
        const isAppleMusicHighlighting = document.getElementById('isAppleMusicHighlighting').checked;
        const isAppleMusicSaveImage = document.getElementById('isAppleMusicSaveImage').checked;
        const isBandcampCopyCover = document.getElementById('isBandcampCopyCover').checked;
        const isBandcampPopup = document.getElementById('isBandcampPopup').checked;
        const isBandcampSaveImage = document.getElementById('isBandcampSaveImage').checked;
        const isDeezerCopyCover = document.getElementById('isDeezerCopyCover').checked;
        const isDeezerCopyArtist = document.getElementById('isDeezerCopyArtist').checked;
        const isDeezerTrack = document.getElementById('isDeezerTrack').checked;
        const isDeezerShowCover = document.getElementById('isDeezerShowCover').checked;
        const isDeezerPopup = document.getElementById('isDeezerPopup').checked;
        const isDeezerPremiumPopup = document.getElementById('isDeezerPremiumPopup').checked;
        const isDeezerSaveImage = document.getElementById('isDeezerSaveImage').checked;
        const isSoundCloudCopyCover = document.getElementById('isSoundCloudCopyCover').checked;
        const isSoundCloudPopup = document.getElementById('isSoundCloudPopup').checked;
        const isSoundCloudArtistBanner = document.getElementById('isSoundCloudArtistBanner').checked;
        const isSoundCloudConvertPNG = document.getElementById('isSoundCloudConvertPNG').checked;
        const isSoundCloudSaveImage = document.getElementById('isSoundCloudSaveImage').checked;
        const isSoundCloudHostImgBB = document.getElementById('isSoundCloudHostImgBB').checked;
        const isSoundCloudHostFilestack = document.getElementById('isSoundCloudHostFilestack').checked;
        const isSpotifyCopyTracklist = document.getElementById('isSpotifyCopyTracklist').checked;
        const isSpotifyCopyCover = document.getElementById('isSpotifyCopyCover').checked;
        const isSpotifyCopyArtist = document.getElementById('isSpotifyCopyArtist').checked;
        const isSpotifyPopup = document.getElementById('isSpotifyPopup').checked;
        const isSpotifySidebar = document.getElementById('isSpotifySidebar').checked;
        const isSpotifyRightClick = document.getElementById('isSpotifyRightClick').checked;
        const isSpotifyConvertPNG = document.getElementById('isSpotifyConvertPNG').checked;
        const isSpotifySaveImage = document.getElementById('isSpotifySaveImage').checked;
        const isSpotifyHostImgBB = document.getElementById('isSpotifyHostImgBB').checked;
        const isSpotifyHostFilestack = document.getElementById('isSpotifyHostFilestack').checked;
        const isTidalCopyCover = document.getElementById('isTidalCopyCover').checked;
        const isTidalCopyArtist = document.getElementById('isTidalCopyArtist').checked;
        const isTidalCopyCredits = document.getElementById('isTidalCopyCredits').checked;
        const isTidalPopup = document.getElementById('isTidalPopup').checked;
        const isTidalHighlighting = document.getElementById('isTidalHighlighting').checked;
        const isTidalPremiumPopup = document.getElementById('isTidalPremiumPopup').checked;
        const isTidalConvertPNG = document.getElementById('isTidalConvertPNG').checked;
        const isTidalSaveImage = document.getElementById('isTidalSaveImage').checked;
        const isTidalHostImgBB = document.getElementById('isTidalHostImgBB').checked;
        const isTidalHostFilestack = document.getElementById('isTidalHostFilestack').checked;
        const isYandexMusicCopyCover = document.getElementById('isYandexMusicCopyCover').checked;
        const isYandexMusicPopup = document.getElementById('isYandexMusicPopup').checked;
        const isYandexMusicConvertPNG = document.getElementById('isYandexMusicConvertPNG').checked;
        const isYandexMusicSaveImage = document.getElementById('isYandexMusicSaveImage').checked;
        const isYandexMusicHostImgBB = document.getElementById('isYandexMusicHostImgBB').checked;
        const isYandexMusicHostFilestack = document.getElementById('isYandexMusicHostFilestack').checked;
        const isYouTubeMusicCopyCoverPlaylist = document.getElementById('isYouTubeMusicCopyCoverPlaylist').checked;
        const isYouTubeMusicCopyCoverChannel = document.getElementById('isYouTubeMusicCopyCoverChannel').checked;
        const isYouTubeMusicCopyLink = document.getElementById('isYouTubeMusicCopyLink').checked;
        const isYouTubeMusicPopup = document.getElementById('isYouTubeMusicPopup').checked;
        const isYouTubeMusicSaveImage = document.getElementById('isYouTubeMusicSaveImage').checked;
        const isInstagramPopup = document.getElementById('isInstagramPopup').checked;
        const isInstagramConvertPNG = document.getElementById('isInstagramConvertPNG').checked;
        const isInstagramSaveImage = document.getElementById('isInstagramSaveImage').checked;
        const isInstagramHostImage = document.getElementById('isInstagramHostImage').checked;

        chrome.storage.local.set({
            isGeniusSongSongPage: isGeniusSongSongPage,
            isGeniusSongSongPageZwsp: isGeniusSongSongPageZwsp,
            isGeniusSongSongPageInfo: isGeniusSongSongPageInfo,
            isGeniusSongSongId: isGeniusSongSongId,
            isGeniusSongCheckIndex: isGeniusSongCheckIndex,
            isGeniusSongFollowButton: isGeniusSongFollowButton,
            isGeniusSongShellyButton: isGeniusSongShellyButton,
            isGeniusSongCleanupMetadataButton: isGeniusSongCleanupMetadataButton,
            isGeniusSongLanguageButton: isGeniusSongLanguageButton,
            isGeniusSongCleanupButton: isGeniusSongCleanupButton,
            isGeniusSongSectionsButtons: isGeniusSongSectionsButtons,
            isGeniusSongExpandSectionsButtons: isGeniusSongExpandSectionsButtons,
            isGeniusSongAnnotationsButtons: isGeniusSongAnnotationsButtons,
            isGeniusSongFilterActivity: isGeniusSongFilterActivity,
            isGeniusSongCopyCover: isGeniusSongCopyCover,
            isGeniusSongAppleMusicPlayer: isGeniusSongAppleMusicPlayer,
            isGeniusSongYouTubePlayer: isGeniusSongYouTubePlayer,
            isGeniusSongSoundCloudPlayer: isGeniusSongSoundCloudPlayer,
            isGeniusSongSpotifyPlayer: isGeniusSongSpotifyPlayer,
            isGeniusSongLyricEditor: isGeniusSongLyricEditor,
            isGeniusSongRenameButtons: isGeniusSongRenameButtons,
            isGeniusAlbumAlbumPage: isGeniusAlbumAlbumPage,
            isGeniusAlbumAlbumPageZwsp: isGeniusAlbumAlbumPageZwsp,
            isGeniusAlbumAlbumPageLyrics: isGeniusAlbumAlbumPageLyrics,
            isGeniusAlbumExpandTracklist: isGeniusAlbumExpandTracklist,
            isGeniusAlbumEditTracklist: isGeniusAlbumEditTracklist,
            isGeniusAlbumUploadCover: isGeniusAlbumUploadCover,
            isGeniusAlbumRenameButtons: isGeniusAlbumRenameButtons,
            isGeniusAlbumSongCreditsButton: isGeniusAlbumSongCreditsButton,
            isGeniusAlbumFollowButton: isGeniusAlbumFollowButton,
            isGeniusAlbumCleanupButton: isGeniusAlbumCleanupButton,
            isGeniusArtistArtistPage: isGeniusArtistArtistPage,
            isGeniusArtistArtistPageZwsp: isGeniusArtistArtistPageZwsp,
            isGeniusArtistArtistPageInfo: isGeniusArtistArtistPageInfo,
            isGeniusArtistArtistId: isGeniusArtistArtistId,
            isGeniusArtistAllSongsAlbumsPage: isGeniusArtistAllSongsAlbumsPage,
            isGeniusArtistAllSongsAlbumsPageMetadata: isGeniusArtistAllSongsAlbumsPageMetadata,
            isGeniusArtistAllSongsAlbumsPageZwsp: isGeniusArtistAllSongsAlbumsPageZwsp,
            isGeniusArtistFollowButton: isGeniusArtistFollowButton,
            is45CopyCover: is45CopyCover,
            is45Popup: is45Popup,
            is45ConvertPNG: is45ConvertPNG,
            is45SaveImage: is45SaveImage,
            is45HostImgBB: is45HostImgBB,
            is45HostFilestack: is45HostFilestack,
            is45RightClick: is45RightClick,
            isAppleMusicCopyTracklist: isAppleMusicCopyTracklist,
            isAppleMusicCopyCover: isAppleMusicCopyCover,
            isAppleMusicCopyAnimatedCover: isAppleMusicCopyAnimatedCover,
            isAppleMusicCopyArtist: isAppleMusicCopyArtist,
            isAppleMusicCopyCredits: isAppleMusicCopyCredits,
            isAppleMusicPopup: isAppleMusicPopup,
            isAppleMusicHighlighting: isAppleMusicHighlighting,
            isAppleMusicSaveImage: isAppleMusicSaveImage,
            isBandcampCopyCover: isBandcampCopyCover,
            isBandcampPopup: isBandcampPopup,
            isBandcampSaveImage: isBandcampSaveImage,
            isDeezerCopyCover: isDeezerCopyCover,
            isDeezerCopyArtist: isDeezerCopyArtist,
            isDeezerTrack: isDeezerTrack,
            isDeezerShowCover: isDeezerShowCover,
            isDeezerPopup: isDeezerPopup,
            isDeezerPremiumPopup: isDeezerPremiumPopup,
            isDeezerSaveImage: isDeezerSaveImage,
            isSoundCloudCopyCover: isSoundCloudCopyCover,
            isSoundCloudPopup: isSoundCloudPopup,
            isSoundCloudArtistBanner: isSoundCloudArtistBanner,
            isSoundCloudConvertPNG: isSoundCloudConvertPNG,
            isSoundCloudSaveImage: isSoundCloudSaveImage,
            isSoundCloudHostImgBB: isSoundCloudHostImgBB,
            isSoundCloudHostFilestack: isSoundCloudHostFilestack,
            isSpotifyCopyTracklist: isSpotifyCopyTracklist,
            isSpotifyCopyCover: isSpotifyCopyCover,
            isSpotifyCopyArtist: isSpotifyCopyArtist,
            isSpotifyPopup: isSpotifyPopup,
            isSpotifySidebar: isSpotifySidebar,
            isSpotifyRightClick: isSpotifyRightClick,
            isSpotifyConvertPNG: isSpotifyConvertPNG,
            isSpotifySaveImage: isSpotifySaveImage,
            isSpotifyHostImgBB: isSpotifyHostImgBB,
            isSpotifyHostFilestack: isSpotifyHostFilestack,
            isTidalCopyCover: isTidalCopyCover,
            isTidalCopyArtist: isTidalCopyArtist,
            isTidalCopyCredits: isTidalCopyCredits,
            isTidalPopup: isTidalPopup,
            isTidalHighlighting: isTidalHighlighting,
            isTidalPremiumPopup: isTidalPremiumPopup,
            isTidalConvertPNG: isTidalConvertPNG,
            isTidalSaveImage: isTidalSaveImage,
            isTidalHostImgBB: isTidalHostImgBB,
            isTidalHostFilestack: isTidalHostFilestack,
            isYandexMusicCopyCover: isYandexMusicCopyCover,
            isYandexMusicPopup: isYandexMusicPopup,
            isYandexMusicConvertPNG: isYandexMusicConvertPNG,
            isYandexMusicSaveImage: isYandexMusicSaveImage,
            isYandexMusicHostImgBB: isYandexMusicHostImgBB,
            isYandexMusicHostFilestack: isYandexMusicHostFilestack,
            isYouTubeMusicCopyCoverPlaylist: isYouTubeMusicCopyCoverPlaylist,
            isYouTubeMusicCopyCoverChannel: isYouTubeMusicCopyCoverChannel,
            isYouTubeMusicCopyLink: isYouTubeMusicCopyLink,
            isYouTubeMusicPopup: isYouTubeMusicPopup,
            isYouTubeMusicSaveImage: isYouTubeMusicSaveImage,
            isInstagramPopup: isInstagramPopup,
            isInstagramConvertPNG: isInstagramConvertPNG,
            isInstagramSaveImage: isInstagramSaveImage,
            isInstagramHostImage: isInstagramHostImage
        });
    }

    // Lade die gespeicherten Einstellungen
    chrome.storage.local.get([
        'isGeniusSongSongPage', 'isGeniusSongSongPageZwsp', 'isGeniusSongSongPageInfo', 'isGeniusSongSongId', 'isGeniusSongCheckIndex', 'isGeniusSongFollowButton', 'isGeniusSongShellyButton', 'isGeniusSongCleanupMetadataButton', 'isGeniusSongLanguageButton', 'isGeniusSongCleanupButton', 'isGeniusSongSectionsButtons', 'isGeniusSongExpandSectionsButtons', 'isGeniusSongAnnotationsButtons', 'isGeniusSongFilterActivity', 'isGeniusSongCopyCover', 'isGeniusSongAppleMusicPlayer', 'isGeniusSongYouTubePlayer', 'isGeniusSongSoundCloudPlayer', 'isGeniusSongSpotifyPlayer', 'isGeniusSongLyricEditor', 'isGeniusSongRenameButtons',
        'isGeniusAlbumAlbumPage', 'isGeniusAlbumAlbumPageZwsp', 'isGeniusAlbumAlbumPageLyrics', 'isGeniusAlbumExpandTracklist', 'isGeniusAlbumEditTracklist', 'isGeniusAlbumUploadCover', 'isGeniusAlbumRenameButtons', 'isGeniusAlbumSongCreditsButton', 'isGeniusAlbumFollowButton', 'isGeniusAlbumCleanupButton',
        'isGeniusArtistArtistPage', 'isGeniusArtistArtistPageZwsp', 'isGeniusArtistArtistPageInfo', 'isGeniusArtistArtistId','isGeniusArtistAllSongsAlbumsPage', 'isGeniusArtistAllSongsAlbumsPageMetadata', 'isGeniusArtistAllSongsAlbumsPageZwsp', 'isGeniusArtistFollowButton',
        'is45CopyCover', 'is45Popup', 'is45ConvertPNG', 'is45SaveImage', 'is45HostImgBB', 'is45HostFilestack', 'is45RightClick',
        'isAppleMusicCopyTracklist', 'isAppleMusicCopyCover', 'isAppleMusicCopyAnimatedCover', 'isAppleMusicCopyArtist', 'isAppleMusicCopyCredits', 'isAppleMusicPopup', 'isAppleMusicHighlighting', 'isAppleMusicSaveImage',
        'isBandcampCopyCover', 'isBandcampPopup', 'isBandcampSaveImage',
        'isDeezerCopyCover', 'isDeezerCopyArtist', 'isDeezerTrack', 'isDeezerPopup', 'isDeezerPremiumPopup', 'isDeezerSaveImage',
        'isSoundCloudCopyCover', 'isSoundCloudPopup', 'isSoundCloudArtistBanner', 'isSoundCloudConvertPNG', 'isSoundCloudSaveImage', 'isSoundCloudHostImgBB', 'isSoundCloudHostFilestack',
        'isSpotifyCopyTracklist', 'isSpotifyCopyCover', 'isSpotifyCopyArtist', 'isSpotifyPopup', 'isSpotifySidebar', 'isSpotifyRightClick', 'isSpotifyConvertPNG', 'isSpotifySaveImage', 'isSpotifyHostImgBB', 'isSpotifyHostFilestack',
        'isTidalCopyCover', 'isTidalCopyArtist', 'isTidalCopyCredits', 'isTidalPopup', 'isTidalHighlighting', 'isTidalPremiumPopup', 'isTidalConvertPNG', 'isTidalSaveImage', 'isTidalHostImgBB', 'isTidalHostFilestack',
        'isYandexMusicCopyCover', 'isYandexMusicPopup', 'isYandexMusicConvertPNG', 'isYandexMusicSaveImage', 'isYandexMusicHostImgBB', 'isYandexMusicHostFilestack',
        'isYouTubeMusicCopyCoverPlaylist', 'isYouTubeMusicCopyCoverChannel', 'isYouTubeMusicCopyLink', 'isYouTubeMusicPopup', 'isYouTubeMusicSaveImage',
        'isInstagramPopup', 'isInstagramConvertPNG', 'isInstagramSaveImage', 'isInstagramHostImage'
    ], function (result) {
        document.getElementById('isGeniusSongSongPage').checked = result.isGeniusSongSongPage !== undefined ? result.isGeniusSongSongPage : true;
        document.getElementById('isGeniusSongSongPageZwsp').checked = result.isGeniusSongSongPageZwsp !== undefined ? result.isGeniusSongSongPageZwsp : true;
        document.getElementById('isGeniusSongSongPageInfo').checked = result.isGeniusSongSongPageInfo !== undefined ? result.isGeniusSongSongPageInfo : true;
        document.getElementById('isGeniusSongSongId').checked = result.isGeniusSongSongId !== undefined ? result.isGeniusSongSongId : false;
        document.getElementById('isGeniusSongCheckIndex').checked = result.isGeniusSongCheckIndex !== undefined ? result.isGeniusSongCheckIndex : false;
        document.getElementById('isGeniusSongFollowButton').checked = result.isGeniusSongFollowButton !== undefined ? result.isGeniusSongFollowButton : true;
        document.getElementById('isGeniusSongShellyButton').checked = result.isGeniusSongShellyButton !== undefined ? result.isGeniusSongShellyButton : true;
        document.getElementById('isGeniusSongCleanupMetadataButton').checked = result.isGeniusSongCleanupMetadataButton !== undefined ? result.isGeniusSongCleanupMetadataButton : true;
        document.getElementById('isGeniusSongLanguageButton').checked = result.isGeniusSongLanguageButton !== undefined ? result.isGeniusSongLanguageButton : true;
        document.getElementById('isGeniusSongCleanupButton').checked = result.isGeniusSongCleanupButton !== undefined ? result.isGeniusSongCleanupButton : true;
        document.getElementById('isGeniusSongSectionsButtons').checked = result.isGeniusSongSectionsButtons !== undefined ? result.isGeniusSongSectionsButtons : true;
        document.getElementById('isGeniusSongExpandSectionsButtons').checked = result.isGeniusSongExpandSectionsButtons !== undefined ? result.isGeniusSongExpandSectionsButtons : false;
        document.getElementById('isGeniusSongAnnotationsButtons').checked = result.isGeniusSongAnnotationsButtons !== undefined ? result.isGeniusSongAnnotationsButtons : true;
        document.getElementById('isGeniusSongFilterActivity').checked = result.isGeniusSongFilterActivity !== undefined ? result.isGeniusSongFilterActivity : true;
        document.getElementById('isGeniusSongCopyCover').checked = result.isGeniusSongCopyCover !== undefined ? result.isGeniusSongCopyCover : true;
        document.getElementById('isGeniusSongAppleMusicPlayer').checked = result.isGeniusSongAppleMusicPlayer !== undefined ? result.isGeniusSongAppleMusicPlayer : true;
        document.getElementById('isGeniusSongYouTubePlayer').checked = result.isGeniusSongYouTubePlayer !== undefined ? result.isGeniusSongYouTubePlayer : true;
        document.getElementById('isGeniusSongSoundCloudPlayer').checked = result.isGeniusSongSoundCloudPlayer !== undefined ? result.isGeniusSongSoundCloudPlayer : true;
        document.getElementById('isGeniusSongSpotifyPlayer').checked = result.isGeniusSongSpotifyPlayer !== undefined ? result.isGeniusSongSpotifyPlayer : true;
        document.getElementById('isGeniusSongLyricEditor').checked = result.isGeniusSongLyricEditor !== undefined ? result.isGeniusSongLyricEditor : true;
        document.getElementById('isGeniusSongRenameButtons').checked = result.isGeniusSongRenameButtons !== undefined ? result.isGeniusSongRenameButtons : true;
        document.getElementById('isGeniusAlbumAlbumPage').checked = result.isGeniusAlbumAlbumPage !== undefined ? result.isGeniusAlbumAlbumPage : true;
        document.getElementById('isGeniusAlbumAlbumPageZwsp').checked = result.isGeniusAlbumAlbumPageZwsp !== undefined ? result.isGeniusAlbumAlbumPageZwsp : true;
        document.getElementById('isGeniusAlbumAlbumPageLyrics').checked = result.isGeniusAlbumAlbumPageLyrics !== undefined ? result.isGeniusAlbumAlbumPageLyrics : false;
        document.getElementById('isGeniusAlbumExpandTracklist').checked = result.isGeniusAlbumExpandTracklist !== undefined ? result.isGeniusAlbumExpandTracklist : true;
        document.getElementById('isGeniusAlbumEditTracklist').checked = result.isGeniusAlbumEditTracklist !== undefined ? result.isGeniusAlbumEditTracklist : true;
        document.getElementById('isGeniusAlbumUploadCover').checked = result.isGeniusAlbumUploadCover !== undefined ? result.isGeniusAlbumUploadCover : false;
        document.getElementById('isGeniusAlbumRenameButtons').checked = result.isGeniusAlbumRenameButtons !== undefined ? result.isGeniusAlbumRenameButtons : true;
        document.getElementById('isGeniusAlbumSongCreditsButton').checked = result.isGeniusAlbumSongCreditsButton !== undefined ? result.isGeniusAlbumSongCreditsButton : true;
        document.getElementById('isGeniusAlbumFollowButton').checked = result.isGeniusAlbumFollowButton !== undefined ? result.isGeniusAlbumFollowButton : true;
        document.getElementById('isGeniusAlbumCleanupButton').checked = result.isGeniusAlbumCleanupButton !== undefined ? result.isGeniusAlbumCleanupButton : true;
        document.getElementById('isGeniusArtistArtistPage').checked = result.isGeniusArtistArtistPage !== undefined ? result.isGeniusArtistArtistPage : true;
        document.getElementById('isGeniusArtistArtistPageZwsp').checked = result.isGeniusArtistArtistPageZwsp !== undefined ? result.isGeniusArtistArtistPageZwsp : true;
        document.getElementById('isGeniusArtistArtistPageInfo').checked = result.isGeniusArtistArtistPageInfo !== undefined ? result.isGeniusArtistArtistPageInfo : true;
        document.getElementById('isGeniusArtistArtistId').checked = result.isGeniusArtistArtistId !== undefined ? result.isGeniusArtistArtistId : false;
        document.getElementById('isGeniusArtistAllSongsAlbumsPage').checked = result.isGeniusArtistAllSongsAlbumsPage !== undefined ? result.isGeniusArtistAllSongsAlbumsPage : true;
        document.getElementById('isGeniusArtistAllSongsAlbumsPageMetadata').checked = result.isGeniusArtistAllSongsAlbumsPageMetadata !== undefined ? result.isGeniusArtistAllSongsAlbumsPageMetadata : true;
        document.getElementById('isGeniusArtistAllSongsAlbumsPageZwsp').checked = result.isGeniusArtistAllSongsAlbumsPageZwsp !== undefined ? result.isGeniusArtistAllSongsAlbumsPageZwsp : true;
        document.getElementById('isGeniusArtistFollowButton').checked = result.isGeniusArtistFollowButton !== undefined ? result.isGeniusArtistFollowButton : false;
        document.getElementById('is45CopyCover').checked = result.is45CopyCover !== undefined ? result.is45CopyCover : true;
        document.getElementById('is45Popup').checked = result.is45Popup !== undefined ? result.is45Popup : true;
        document.getElementById('is45ConvertPNG').checked = result.is45ConvertPNG !== undefined ? result.is45ConvertPNG : true;
        document.getElementById('is45SaveImage').checked = result.is45SaveImage !== undefined ? result.is45SaveImage : false;
        document.getElementById('is45HostImgBB').checked = result.is45HostImgBB !== undefined ? result.is45HostImgBB : true;
        document.getElementById('is45HostFilestack').checked = result.is45HostFilestack !== undefined ? result.is45HostFilestack : false;
        document.getElementById('is45RightClick').checked = result.is45RightClick !== undefined ? result.is45RightClick : true;
        document.getElementById('isAppleMusicCopyTracklist').checked = result.isAppleMusicCopyTracklist !== undefined ? result.isAppleMusicCopyTracklist : true;
        document.getElementById('isAppleMusicCopyCover').checked = result.isAppleMusicCopyCover !== undefined ? result.isAppleMusicCopyCover : true;
        document.getElementById('isAppleMusicCopyAnimatedCover').checked = result.isAppleMusicCopyAnimatedCover !== undefined ? result.isAppleMusicCopyAnimatedCover : true;
        document.getElementById('isAppleMusicCopyArtist').checked = result.isAppleMusicCopyArtist !== undefined ? result.isAppleMusicCopyArtist : true;
        document.getElementById('isAppleMusicCopyCredits').checked = result.isAppleMusicCopyCredits !== undefined ? result.isAppleMusicCopyCredits : true;
        document.getElementById('isAppleMusicPopup').checked = result.isAppleMusicPopup !== undefined ? result.isAppleMusicPopup : true;
        document.getElementById('isAppleMusicHighlighting').checked = result.isAppleMusicHighlighting !== undefined ? result.isAppleMusicHighlighting : true;
        document.getElementById('isAppleMusicSaveImage').checked = result.isAppleMusicSaveImage !== undefined ? result.isAppleMusicSaveImage : false;
        document.getElementById('isBandcampCopyCover').checked = result.isBandcampCopyCover !== undefined ? result.isBandcampCopyCover : true;
        document.getElementById('isBandcampPopup').checked = result.isBandcampPopup !== undefined ? result.isBandcampPopup : true;
        document.getElementById('isBandcampSaveImage').checked = result.isBandcampSaveImage !== undefined ? result.isBandcampSaveImage : false;
        document.getElementById('isDeezerCopyCover').checked = result.isDeezerCopyCover !== undefined ? result.isDeezerCopyCover : true;
        document.getElementById('isDeezerCopyArtist').checked = result.isDeezerCopyArtist !== undefined ? result.isDeezerCopyArtist : true;
        document.getElementById('isDeezerTrack').checked = result.isDeezerTrack !== undefined ? result.isDeezerTrack : true;
        document.getElementById('isDeezerShowCover').checked = result.isDeezerShowCover !== undefined ? result.isDeezerShowCover : true;
        document.getElementById('isDeezerPopup').checked = result.isDeezerPopup !== undefined ? result.isDeezerPopup : true;
        document.getElementById('isDeezerPremiumPopup').checked = result.isDeezerPremiumPopup !== undefined ? result.isDeezerPremiumPopup : false;
        document.getElementById('isDeezerSaveImage').checked = result.isDeezerSaveImage !== undefined ? result.isDeezerSaveImage : false;
        document.getElementById('isSoundCloudCopyCover').checked = result.isSoundCloudCopyCover !== undefined ? result.isSoundCloudCopyCover : true;
        document.getElementById('isSoundCloudPopup').checked = result.isSoundCloudPopup !== undefined ? result.isSoundCloudPopup : true;
        document.getElementById('isSoundCloudArtistBanner').checked = result.isSoundCloudArtistBanner !== undefined ? result.isSoundCloudArtistBanner : false;
        document.getElementById('isSoundCloudConvertPNG').checked = result.isSoundCloudConvertPNG !== undefined ? result.isSoundCloudConvertPNG : true;
        document.getElementById('isSoundCloudSaveImage').checked = result.isSoundCloudSaveImage !== undefined ? result.isSoundCloudSaveImage : false;
        document.getElementById('isSoundCloudHostImgBB').checked = result.isSoundCloudHostImgBB !== undefined ? result.isSoundCloudHostImgBB : false;
        document.getElementById('isSoundCloudHostFilestack').checked = result.isSoundCloudHostFilestack !== undefined ? result.isSoundCloudHostFilestack : true;
        document.getElementById('isSpotifyCopyTracklist').checked = result.isSpotifyCopyTracklist !== undefined ? result.isSpotifyCopyTracklist : true;
        document.getElementById('isSpotifyCopyCover').checked = result.isSpotifyCopyCover !== undefined ? result.isSpotifyCopyCover : true;
        document.getElementById('isSpotifyCopyArtist').checked = result.isSpotifyCopyArtist !== undefined ? result.isSpotifyCopyArtist : true;
        document.getElementById('isSpotifyPopup').checked = result.isSpotifyPopup !== undefined ? result.isSpotifyPopup : true;
        document.getElementById('isSpotifySidebar').checked = result.isSpotifySidebar !== undefined ? result.isSpotifySidebar : false;
        document.getElementById('isSpotifyRightClick').checked = result.isSpotifyRightClick !== undefined ? result.isSpotifyRightClick : false;
        document.getElementById('isSpotifyConvertPNG').checked = result.isSpotifyConvertPNG !== undefined ? result.isSpotifyConvertPNG : true;
        document.getElementById('isSpotifySaveImage').checked = result.isSpotifySaveImage !== undefined ? result.isSpotifySaveImage : false;
        document.getElementById('isSpotifyHostImgBB').checked = result.isSpotifyHostImgBB !== undefined ? result.isSpotifyHostImgBB : false;
        document.getElementById('isSpotifyHostFilestack').checked = result.isSpotifyHostFilestack !== undefined ? result.isSpotifyHostFilestack : true;
        document.getElementById('isTidalCopyCover').checked = result.isTidalCopyCover !== undefined ? result.isTidalCopyCover : true;
        document.getElementById('isTidalCopyArtist').checked = result.isTidalCopyArtist !== undefined ? result.isTidalCopyArtist : true;
        document.getElementById('isTidalCopyCredits').checked = result.isTidalCopyCredits !== undefined ? result.isTidalCopyCredits : true;
        document.getElementById('isTidalPopup').checked = result.isTidalPopup !== undefined ? result.isTidalPopup : true;
        document.getElementById('isTidalHighlighting').checked = result.isTidalHighlighting !== undefined ? result.isTidalHighlighting : true;
        document.getElementById('isTidalPremiumPopup').checked = result.isTidalPremiumPopup !== undefined ? result.isTidalPremiumPopup : false;
        document.getElementById('isTidalConvertPNG').checked = result.isTidalConvertPNG !== undefined ? result.isTidalConvertPNG : true;
        document.getElementById('isTidalSaveImage').checked = result.isTidalSaveImage !== undefined ? result.isTidalSaveImage : false;
        document.getElementById('isTidalHostImgBB').checked = result.isTidalHostImgBB !== undefined ? result.isTidalHostImgBB : false;
        document.getElementById('isTidalHostFilestack').checked = result.isTidalHostFilestack !== undefined ? result.isTidalHostFilestack : true;
        document.getElementById('isYandexMusicCopyCover').checked = result.isYandexMusicCopyCover !== undefined ? result.isYandexMusicCopyCover : true;
        document.getElementById('isYandexMusicPopup').checked = result.isYandexMusicPopup !== undefined ? result.isYandexMusicPopup : true;
        document.getElementById('isYandexMusicConvertPNG').checked = result.isYandexMusicConvertPNG !== undefined ? result.isYandexMusicConvertPNG : false;
        document.getElementById('isYandexMusicSaveImage').checked = result.isYandexMusicSaveImage !== undefined ? result.isYandexMusicSaveImage : false;
        document.getElementById('isYandexMusicHostImgBB').checked = result.isYandexMusicHostImgBB !== undefined ? result.isYandexMusicHostImgBB : true;
        document.getElementById('isYandexMusicHostFilestack').checked = result.isYandexMusicHostFilestack !== undefined ? result.isYandexMusicHostFilestack : false;
        document.getElementById('isYouTubeMusicCopyCoverPlaylist').checked = result.isYouTubeMusicCopyCoverPlaylist !== undefined ? result.isYouTubeMusicCopyCoverPlaylist : true;
        document.getElementById('isYouTubeMusicCopyCoverChannel').checked = result.isYouTubeMusicCopyCoverChannel !== undefined ? result.isYouTubeMusicCopyCoverChannel : true;
        document.getElementById('isYouTubeMusicCopyLink').checked = result.isYouTubeMusicCopyLink !== undefined ? result.isYouTubeMusicCopyLink : true;
        document.getElementById('isYouTubeMusicPopup').checked = result.isYouTubeMusicPopup !== undefined ? result.isYouTubeMusicPopup : true;
        document.getElementById('isYouTubeMusicSaveImage').checked = result.isYouTubeMusicSaveImage !== undefined ? result.isYouTubeMusicSaveImage : false;
        document.getElementById('isInstagramPopup').checked = result.isInstagramPopup !== undefined ? result.isInstagramPopup : true;
        document.getElementById('isInstagramConvertPNG').checked = result.isInstagramConvertPNG !== undefined ? result.isInstagramConvertPNG : true;
        document.getElementById('isInstagramSaveImage').checked = result.isInstagramSaveImage !== undefined ? result.isInstagramSaveImage : false;
        document.getElementById('isInstagramHostImage').checked = result.isInstagramHostImage !== undefined ? result.isInstagramHostImage : true;
    });

    // Event Listener für die Schieberegler
    document.getElementById("saveMetadataButton").addEventListener("click", saveOrder);
    document.getElementById('isGeniusSongSongPage').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongSongPageZwsp').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongSongPageInfo').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongSongId').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongCheckIndex').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongFollowButton').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongShellyButton').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongCleanupMetadataButton').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongLanguageButton').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongCleanupButton').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongSectionsButtons').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongExpandSectionsButtons').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongAnnotationsButtons').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongFilterActivity').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongCopyCover').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongAppleMusicPlayer').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongYouTubePlayer').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongSoundCloudPlayer').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongSpotifyPlayer').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongLyricEditor').addEventListener('change', saveSettings);
    document.getElementById('isGeniusSongRenameButtons').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumAlbumPage').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumAlbumPageZwsp').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumAlbumPageLyrics').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumExpandTracklist').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumEditTracklist').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumUploadCover').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumRenameButtons').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumSongCreditsButton').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumFollowButton').addEventListener('change', saveSettings);
    document.getElementById('isGeniusAlbumCleanupButton').addEventListener('change', saveSettings);
    document.getElementById('isGeniusArtistArtistPage').addEventListener('change', saveSettings);
    document.getElementById('isGeniusArtistAllSongsAlbumsPageMetadata').addEventListener('change', saveSettings);
    document.getElementById('isGeniusArtistArtistPageZwsp').addEventListener('change', saveSettings);
    document.getElementById('isGeniusArtistArtistPageInfo').addEventListener('change', saveSettings);
    document.getElementById('isGeniusArtistArtistId').addEventListener('change', saveSettings);
    document.getElementById('isGeniusArtistAllSongsAlbumsPage').addEventListener('change', saveSettings);
    document.getElementById('isGeniusArtistAllSongsAlbumsPageZwsp').addEventListener('change', saveSettings);
    document.getElementById('isGeniusArtistFollowButton').addEventListener('change', saveSettings);
    document.getElementById('is45CopyCover').addEventListener('change', saveSettings);
    document.getElementById('is45Popup').addEventListener('change', saveSettings);
    document.getElementById('is45ConvertPNG').addEventListener('change', saveSettings);
    document.getElementById('is45SaveImage').addEventListener('change', saveSettings);
    document.getElementById('is45HostImgBB').addEventListener('change', saveSettings);
    document.getElementById('is45HostFilestack').addEventListener('change', saveSettings);
    document.getElementById('is45RightClick').addEventListener('change', saveSettings);
    document.getElementById('isAppleMusicCopyTracklist').addEventListener('change', saveSettings);
    document.getElementById('isAppleMusicCopyCover').addEventListener('change', saveSettings);
    document.getElementById('isAppleMusicCopyAnimatedCover').addEventListener('change', saveSettings);
    document.getElementById('isAppleMusicCopyArtist').addEventListener('change', saveSettings);
    document.getElementById('isAppleMusicCopyCredits').addEventListener('change', saveSettings);
    document.getElementById('isAppleMusicPopup').addEventListener('change', saveSettings);
    document.getElementById('isAppleMusicHighlighting').addEventListener('change', saveSettings);
    document.getElementById('isAppleMusicSaveImage').addEventListener('change', saveSettings);
    document.getElementById('isBandcampCopyCover').addEventListener('change', saveSettings);
    document.getElementById('isBandcampPopup').addEventListener('change', saveSettings);
    document.getElementById('isBandcampSaveImage').addEventListener('change', saveSettings);
    document.getElementById('isDeezerCopyCover').addEventListener('change', saveSettings);
    document.getElementById('isDeezerCopyArtist').addEventListener('change', saveSettings);
    document.getElementById('isDeezerTrack').addEventListener('change', saveSettings);
    document.getElementById('isDeezerShowCover').addEventListener('change', saveSettings);
    document.getElementById('isDeezerPopup').addEventListener('change', saveSettings);
    document.getElementById('isDeezerPremiumPopup').addEventListener('change', saveSettings);
    document.getElementById('isDeezerSaveImage').addEventListener('change', saveSettings);
    document.getElementById('isSoundCloudCopyCover').addEventListener('change', saveSettings);
    document.getElementById('isSoundCloudPopup').addEventListener('change', saveSettings);
    document.getElementById('isSoundCloudArtistBanner').addEventListener('change', saveSettings);
    document.getElementById('isSoundCloudConvertPNG').addEventListener('change', saveSettings);
    document.getElementById('isSoundCloudSaveImage').addEventListener('change', saveSettings);
    document.getElementById('isSoundCloudHostImgBB').addEventListener('change', saveSettings);
    document.getElementById('isSoundCloudHostFilestack').addEventListener('change', saveSettings);
    document.getElementById('isSpotifyCopyTracklist').addEventListener('change', saveSettings);
    document.getElementById('isSpotifyCopyCover').addEventListener('change', saveSettings);
    document.getElementById('isSpotifyCopyArtist').addEventListener('change', saveSettings);
    document.getElementById('isSpotifyPopup').addEventListener('change', saveSettings);
    document.getElementById('isSpotifySidebar').addEventListener('change', saveSettings);
    document.getElementById('isSpotifyRightClick').addEventListener('change', saveSettings);
    document.getElementById('isSpotifyConvertPNG').addEventListener('change', saveSettings);
    document.getElementById('isSpotifySaveImage').addEventListener('change', saveSettings);
    document.getElementById('isSpotifyHostImgBB').addEventListener('change', saveSettings);
    document.getElementById('isSpotifyHostFilestack').addEventListener('change', saveSettings);
    document.getElementById('isTidalCopyCover').addEventListener('change', saveSettings);
    document.getElementById('isTidalCopyArtist').addEventListener('change', saveSettings);
    document.getElementById('isTidalCopyCredits').addEventListener('change', saveSettings);
    document.getElementById('isTidalPopup').addEventListener('change', saveSettings);
    document.getElementById('isTidalHighlighting').addEventListener('change', saveSettings);
    document.getElementById('isTidalPremiumPopup').addEventListener('change', saveSettings);
    document.getElementById('isTidalConvertPNG').addEventListener('change', saveSettings);
    document.getElementById('isTidalSaveImage').addEventListener('change', saveSettings);
    document.getElementById('isTidalHostImgBB').addEventListener('change', saveSettings);
    document.getElementById('isTidalHostFilestack').addEventListener('change', saveSettings);
    document.getElementById('isYandexMusicCopyCover').addEventListener('change', saveSettings);
    document.getElementById('isYandexMusicPopup').addEventListener('change', saveSettings);
    document.getElementById('isYandexMusicConvertPNG').addEventListener('change', saveSettings);
    document.getElementById('isYandexMusicSaveImage').addEventListener('change', saveSettings);
    document.getElementById('isYandexMusicHostImgBB').addEventListener('change', saveSettings);
    document.getElementById('isYandexMusicHostFilestack').addEventListener('change', saveSettings);
    document.getElementById('isYouTubeMusicCopyCoverPlaylist').addEventListener('change', saveSettings);
    document.getElementById('isYouTubeMusicCopyCoverChannel').addEventListener('change', saveSettings);
    document.getElementById('isYouTubeMusicCopyLink').addEventListener('change', saveSettings);
    document.getElementById('isYouTubeMusicPopup').addEventListener('change', saveSettings);
    document.getElementById('isYouTubeMusicSaveImage').addEventListener('change', saveSettings);
    document.getElementById('isInstagramPopup').addEventListener('change', saveSettings);
    document.getElementById('isInstagramConvertPNG').addEventListener('change', saveSettings);
    document.getElementById('isInstagramSaveImage').addEventListener('change', saveSettings);
    document.getElementById('isInstagramHostImage').addEventListener('change', saveSettings);
});
