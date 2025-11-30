
window.secrets = {
    SPOTIFY_CLIENT_ID: "",
    SPOTIFY_CLIENT_SECRET: "",
    TIDAL_CLIENT_ID: "",
    TIDAL_CLIENT_SECRET: "=",
    GOOGLE_API_KEY: "",
    GOOGLE_API_KEY2: "",
    GOOGLE_CSE_ID: "",
    GENIUS_API: "",
    GENIUS_POLICY: "",
    GENIUS_SIGNATURE: "",
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

    async fetchApiKey() {
        return await window.secrets.IMGBB_API_KEY;
    }
};

chrome.storage.local.get(['geniusApi', 'geniusPolicy', 'geniusSignature'], (result) => {
    if (result.geniusApi) window.secrets.GENIUS_API = result.geniusApi;
    if (result.geniusPolicy) window.secrets.GENIUS_POLICY = result.geniusPolicy;
    if (result.geniusSignature) window.secrets.GENIUS_SIGNATURE = result.geniusSignature;
});

(function () {
    const host = location.hostname;
    if (/^genius(\-|\.|$)/.test(host)) {
        const observer = new MutationObserver(() => {
            const iframe = document.querySelector('#filepicker_dialog');
            if (iframe && iframe.src.includes("dialog.filepicker.io/dialog/open")) {
                const u = new URL(iframe.src);
                const geniusApi = u.searchParams.get("key") || "";
                const geniusPolicy = u.searchParams.get("policy") || "";
                const geniusSignature = u.searchParams.get("signature") || "";

                chrome.storage.local.set({ geniusApi, geniusPolicy, geniusSignature });

                window.secrets.GENIUS_API = geniusApi;
                window.secrets.GENIUS_POLICY = geniusPolicy;
                window.secrets.GENIUS_SIGNATURE = geniusSignature;

                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
})();

