document.addEventListener('DOMContentLoaded', function () {
  const fileContainer = document.getElementById('file-container');
  const header = document.querySelector('h1');

  // Initialisieren Sie das Theme basierend auf dem gespeicherten Zustand
  chrome.storage.local.get('darkMode', function (result) {
    if (result.darkMode) {
      document.body.classList.add('dark-mode');
      header.classList.add('dark-mode');
    }
  });

  header.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    chrome.storage.local.set({ darkMode: isDarkMode });

    header.classList.toggle('dark-mode');

    chrome.runtime.sendMessage({ darkMode: isDarkMode });
  });

  document.addEventListener('DOMContentLoaded', () => {
    const guide = document.querySelector('.guide');
    if (guide) {
      guide.addEventListener('click', (event) => {
        if (!event.target.closest('a')) {
          window.location.href = 'settings.html';
        }
      });
    }
  });



  const files = {
    'Services/genius_song.js': "*://genius.com/*",
    'Services/genius_album.js': "*://genius.com/*",
    'Services/genius_artist.js': "*://genius.com/*",
    'Services/apple.js': "*://*.apple.com/*",
    'Services/spotify.js': "*://*.spotify.com/*",
    'Services/deezer.js': "*://*.deezer.com/*",
    'Services/tidal.js': "*://*.tidal.com/*",
    'Services/youtubemusic.js': "*://music.youtube.com/*",
    'Services/yandexmusic.js': "*://*.yandex.ru/*",
    'Services/bandcamp.js': "*://*.bandcamp.com/*",
    'Services/soundcloud.js': "*://*.soundcloud.com/*",
    'Services/45.js': ["*://*.45cat.com/*", "*://*.45worlds.com/*", "*://*.45spaces.com/*"],
    'Services/instagram.js': "*://*.instagram.com/*",
  };

  const displayNames = {
    'Services/apple.js': 'Apple Music',
    'Services/bandcamp.js': 'Bandcamp',
    'Services/deezer.js': 'Deezer',
    'Services/genius_song.js': 'Genius Song',
    'Services/genius_album.js': 'Genius Album',
    'Services/genius_artist.js': 'Genius Artist',
    'Services/instagram.js': 'Instagram',
    'Services/soundcloud.js': 'SoundCloud',
    'Services/spotify.js': 'Spotify',
    'Services/tidal.js': 'Tidal',
    'Services/youtubemusic.js': 'YouTube Music',
    'Services/yandexmusic.js': 'Yandex Music',
    'Services/45.js': '45 Music',
  };

  const icons = {
    'Services/apple.js': 'apple-icon.png',
    'Services/bandcamp.js': 'bandcamp-icon.png',
    'Services/deezer.js': 'deezer-icon.png',
    'Services/genius_song.js': 'genius-icon.png',
    'Services/genius_album.js': 'genius-icon.png',
    'Services/genius_artist.js': 'genius-icon.png',
    'Services/instagram.js': 'instagram-icon.png',
    'Services/soundcloud.js': 'soundcloud-icon.png',
    'Services/spotify.js': 'spotify-icon.png',
    'Services/tidal.js': 'tidal-icon.png',
    'Services/youtubemusic.js': 'youtubemusic-icon.png',
    'Services/yandexmusic.js': 'yandexmusic-icon.png',
    'Services/45.js': '45-icon.png'
  };

  const urls = {
    'Services/apple.js': 'settings_guides.html#apple',
    'Services/bandcamp.js': 'settings_guides.html#bandcamp',
    'Services/deezer.js': 'settings_guides.html#deezer',
    'Services/genius_song.js': 'settings_guides.html#genius-song',
    'Services/genius_album.js': 'settings_guides.html#genius-album',
    'Services/genius_artist.js': 'settings_guides.html#genius-artist',
    'Services/instagram.js': 'settings_guides.html#instagram',
    'Services/soundcloud.js': 'settings_guides.html#soundcloud',
    'Services/spotify.js': 'settings_guides.html#spotify',
    'Services/tidal.js': 'settings_guides.html#tidal',
    'Services/youtubemusic.js': 'settings_guides.html#youtubemusic',
    'Services/yandexmusic.js': 'settings_guides.html#yandexmusic',
    'Services/45.js': 'settings_guides.html#45'
  };

  // Lade gespeicherte Zustände und initialisiere die Checkboxen
  chrome.storage.local.get(Object.keys(files), function (result) {
    for (const [file, match] of Object.entries(files)) {
      const div = document.createElement('div');
      div.className = 'file-toggle';
      if (result[file] === false) {
        div.classList.add('inactive');
      }

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = file;
      checkbox.checked = result[file] !== false;
      checkbox.style.display = 'none';

      const img = document.createElement('img');
      img.src = icons[file];
      img.alt = displayNames[file] || file;
      img.addEventListener('click', function (e) {
        e.stopPropagation();
        const isActive = checkbox.checked;
        checkbox.checked = !isActive;
        chrome.storage.local.set({ [file]: !isActive }, function () {
          if (!isActive) {
            div.classList.remove('inactive');
            activateFile(file, match);
          } else {
            div.classList.add('inactive');
            deactivateFile(file, match);
          }
        });
      });

      const label = document.createElement('a');
      label.href = urls[file];
      label.target = '_blank';
      label.textContent = displayNames[file] || file;

      div.appendChild(img);
      div.appendChild(checkbox);
      div.appendChild(label);
      fileContainer.appendChild(div);
    }
  });

  function activateFile(file, match) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [file]
      }, () => console.log(`${file} aktiviert auf ${match}`));
    });
  }

  function deactivateFile(file, match) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      chrome.tabs.get(tabId, function (tab) {
        if (Array.isArray(match)) {
          if (match.some(pattern => new RegExp(pattern.replace(/\*/g, '.*')).test(tab.url))) {
            chrome.tabs.reload(tabId);
          }
        } else {
          if (new RegExp(match.replace(/\*/g, '.*')).test(tab.url)) {
            chrome.tabs.reload(tabId);
          }
        }
      });
      console.log(`${file} deaktiviert auf ${match}`);
    });
  }
});
