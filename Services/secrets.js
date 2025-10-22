
window.secrets = {
    SPOTIFY_CLIENT_ID: "",
    SPOTIFY_CLIENT_SECRET: "",
    GOOGLE_API_KEY: "",
    GOOGLE_API_KEY2: "",
    GOOGLE_CSE_ID: "",
    IMAGEKIT_PUBLIC_KEY: "",
    IMAGEKIT_PRIVATE_KEY: "",
    get IMGBB_API_KEY() {
        return new Promise((resolve) => {
            chrome.storage.local.get('imgbbApiKey', (result) => {
                const key = result.imgbbApiKey;
                if (!key) {
                    console.warn('API key not found in chrome.storage.');
                }
                resolve(key || "");
            });
        });
    },
    IMGUR_CLIENT_ID: "",
    IMGUR_CLIENT_SECRET: "",
    UPLOADCARE_API_KEY: "",
};

async function fetchApiKey() {
    const apiKey = await window.secrets.IMGBB_API_KEY;
    return apiKey;
}

window.secrets.fetchApiKey = fetchApiKey;
