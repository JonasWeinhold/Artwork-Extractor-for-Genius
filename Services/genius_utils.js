function getCsrfToken() {
    const match = document.cookie.match(/_csrf_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}


async function updateSongMetadata(song, payload) {
    if (Object.keys(payload).length === 0) return;
    try {
        const response = await fetch(`https://genius.com/api/songs/${song.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': document.cookie,
                'X-CSRF-Token': getCsrfToken(),
                'User-Agent': 'ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)'
            },
            body: JSON.stringify({ song: payload })
        });

        if (!response.ok) {
            console.error(`Error updating song metadata: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}


async function updateSongLyrics(song, payload) {
    if (Object.keys(payload).length === 0) return;
    try {
        const response = await fetch(`https://genius.com/api/songs/${song.id}/lyrics`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': document.cookie,
                'X-CSRF-Token': getCsrfToken(),
                'User-Agent': 'ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Error updating song lyrics: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}


async function updateSongMetadata2(song, updates) {
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
                    'User-Agent': 'ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)'
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
                'User-Agent': 'ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)'
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
                    'User-Agent': 'ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)'
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

async function toggleFollowSong(songId, action) {
    const url = `https://genius.com/api/songs/${songId}/${action}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': document.cookie,
            'X-CSRF-Token': getCsrfToken(),
            'User-Agent': 'ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)'
        },
        body: JSON.stringify({})
    });
    return response.ok;
}

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
                "User-Agent": "ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)"
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
                "User-Agent": "ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)"
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
                "User-Agent": "ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Fehler: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error("Error:", error);
    }
}

async function sendUpdateRequest(songId, payload) {
    const url = `https://genius.com/api/songs/${songId}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': document.cookie,
            'X-CSRF-Token': getCsrfToken(),
            'User-Agent': 'ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.error(`Fehler beim Speichern der Tags für Song-ID ${songId}:`, response.statusText);
    } else {
        console.log(`Tags erfolgreich für Song-ID ${songId} gespeichert.`);
    }
}

async function fetchSuggestions(type, query) {
    const url = `https://genius.com/api/${type}/autocomplete?q=${encodeURIComponent(query)}&text_format=html,markdown`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': document.cookie,
            'X-CSRF-Token': getCsrfToken(),
            'User-Agent': 'ArtworkExtractorForGenius/0.5.4 (Artwork Extractor for Genius)'
        }
    });

    if (!response.ok) {
        console.error('Error:', response.statusText);
        return [];
    }
    const data = await response.json();
    return data.response[type];
}