async function uploadToFilestackJPG(imageUrl, urlName) {
    try {
        const metadataResponse = await fetch("https://cloud.filestackapi.com/metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apikey: window.secrets.GENIUS_API,
                url: imageUrl,
                policy: window.secrets.GENIUS_POLICY,
                signature: window.secrets.GENIUS_SIGNATURE
            })
        });

        if (!metadataResponse.ok) throw new Error("Error fetching metadata");

        const metadata = await metadataResponse.json();
        const filename = `${urlName}-${metadata.filename}`;

        const processResponse = await fetch("https://process.filestackapi.com/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apikey: window.secrets.GENIUS_API,
                sources: [metadata.link_path],
                tasks: [
                    {
                        name: "store",
                        params: {
                            location: "S3",
                            path: `filepicker-images-rapgenius/${filename}`
                        }
                    },
                    {
                        name: "security",
                        params: {
                            policy: window.secrets.GENIUS_POLICY,
                            signature: window.secrets.GENIUS_SIGNATURE
                        }
                    }
                ]
            })
        });

        if (!processResponse.ok) throw new Error("Error processing image");

        const result = await processResponse.json();
        const key = result.key;

        const coverArtUrl = `https://filepicker-images-rapgenius.s3.amazonaws.com/${key}`;
        return coverArtUrl;

    } catch (error) {
        throw new Error(`Upload to Genius failed: ${error.message}`);
    }
}

async function uploadToFilestackPNG(imageUrl, urlName) {
    try {
        const metadataResponse = await fetch("https://cloud.filestackapi.com/metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apikey: window.secrets.GENIUS_API,
                url: imageUrl,
                policy: window.secrets.GENIUS_POLICY,
                signature: window.secrets.GENIUS_SIGNATURE
            })
        });

        if (!metadataResponse.ok) throw new Error("Error fetching metadata");

        const metadata = await metadataResponse.json();

        let filename;
        if (metadata.link_path.startsWith("https://images.weserv.nl/")) {
            const originalUrl = decodeURIComponent(metadata.link_path.split("url=")[1].split("&")[0]);
            filename = `${urlName}-${originalUrl.split("/").pop().split(".")[0]}.png`;
        } else {
            filename = `${urlName}-${metadata.filename.replace(/\.(jpe?g|webp|gif)$/i, ".png")}`;
        }

        const processResponse = await fetch("https://process.filestackapi.com/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apikey: window.secrets.GENIUS_API,
                sources: [metadata.link_path],
                tasks: [
                    { name: "output", params: { format: "png" } },
                    {
                        name: "store",
                        params: {
                            location: "S3",
                            path: `filepicker-images-rapgenius/${filename}`
                        }
                    },
                    {
                        name: "security",
                        params: {
                            policy: window.secrets.GENIUS_POLICY,
                            signature: window.secrets.GENIUS_SIGNATURE
                        }
                    }
                ]
            })
        });

        if (!processResponse.ok) throw new Error("Error processing image");

        const result = await processResponse.json();

        const pngUrl = `https://filepicker-images-rapgenius.s3.amazonaws.com/${result.key}`;
        return pngUrl;

    } catch (error) {
        throw new Error(`Upload to Genius failed: ${error.message}`);
    }
}

async function uploadToImgBB(pngDataUrl, fileName) {
    try {
        const base64Response = await fetch(pngDataUrl);
        const blob = await base64Response.blob();

        const formData = new FormData();
        formData.append('image', blob);
        formData.append('name', fileName);

        const apiKey = await window.secrets.IMGBB_API_KEY;
        const apiUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
        console.log('ImgBB API Key:', apiKey);

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error uploading: ${response.statusText}`);
        }

        const data = await response.json();

        return data.data.url;
    } catch (error) {
        console.error('Error uploading to ImgBB:', error);
        return null;
    }
}

async function uploadToImagekit(pngDataUrl, fileName) {
    try {
        const apiUrl = "https://upload.imagekit.io/api/v1/files/upload";
        const privateApiKey = window.secrets.IMAGEKIT_PRIVATE_KEY;

        const formData = new FormData();
        formData.append("file", pngDataUrl);
        formData.append("fileName", fileName);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Basic ${btoa(privateApiKey + ":")}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorMessage = `Error during upload: ${response.statusText} (status code: ${response.status})`;
            throw new Error(errorMessage);
        }

        const result = await response.json();

        return result.url;
    } catch (error) {
        console.error("Error uploading to ImageKit:", error.message); return null;
    }
}

async function convertJpgToPng(jpgUrl) {
    console.log('Converting JPG to PNG:', jpgUrl);
    try {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = jpgUrl;

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const originalWidth = image.width;
        const originalHeight = image.height;

        canvas.width = originalWidth;
        canvas.height = originalHeight;

        ctx.drawImage(image, 0, 0, originalWidth, originalHeight);

        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error loading or converting:', error);
        return null;
    }
}

function downloadImage(dataUrl, fileName, extension) {
    if (typeof dataUrl === "string") {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${fileName}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (dataUrl instanceof Blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataUrl);
        link.download = `${fileName}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}

async function processJpgImage(extractedUrl, urlName, fileName, isHostFilestack, isHostImgBB, isSaveImage, isConvertPNG, isPopup, design) {
    if (isConvertPNG) {
        if (isHostFilestack) {
            if (window.secrets.GENIUS_API && window.secrets.GENIUS_POLICY && window.secrets.GENIUS_SIGNATURE) {
                const uploadedUrl = await uploadToFilestackPNG(extractedUrl, urlName);
                if (uploadedUrl) {
                    await navigator.clipboard.writeText(uploadedUrl);
                    if (isPopup) {
                        showPopupNotification(design);
                    }
                } else {
                    console.error('Error uploading the image.');
                }
            } else {
                console.warn("Genius keys are not available. Please open the Filestack upload window to continue.");
                const copyButton = document.getElementById("copy-cover-button");
                if (copyButton) {
                    copyButton.innerText = "Hosting Error";
                }
            }
        } else if (isHostImgBB) {
            const pngDataUrl = await convertJpgToPng(extractedUrl);
            if (pngDataUrl) {
                const uploadedUrl = await uploadToImgBB(pngDataUrl, fileName);
                if (uploadedUrl) {
                    await navigator.clipboard.writeText(uploadedUrl);
                    if (isPopup) {
                        showPopupNotification(design);
                    }
                } else {
                    console.error('Error uploading the image.');
                    const copyButton = document.getElementById("copy-cover-button");
                    if (copyButton) {
                        copyButton.innerText = "Hosting Error";
                    }
                }
            } else {
                console.error('Error converting to PNG.');
            }
        } else if (isSaveImage) {
            const pngDataUrl = await convertJpgToPng(extractedUrl);
            if (pngDataUrl) {
                downloadImage(pngDataUrl, fileName, "png");
            } else {
                console.error('Error converting to PNG.');
            }
        }
    } else {
        if (isHostImgBB || isHostFilestack) {
            console.log('extractedUrl:', extractedUrl);
            await navigator.clipboard.writeText(extractedUrl);
            if (isPopup) {
                showPopupNotification(design);
            }
        } else if (isSaveImage) {
            const response = await fetch(extractedUrl);
            const blob = await response.blob();
            if (blob) {
                downloadImage(blob, fileName, "jpg");
            } else {
                console.error('Error fetching the image for download.');
            }
        }
    }
}

async function processPngImage(extractedUrl, fileName, isSaveImage, isPopup, design) {
    if (isSaveImage) {
        const response = await fetch(extractedUrl);
        const blob = await response.blob();
        if (blob) {
            downloadImage(blob, fileName, "png");
        } else {
            console.error('Error fetching the image for download.');
        }
    } else {
        await navigator.clipboard.writeText(extractedUrl);
        if (isPopup) {
            showPopupNotification(design);
        }
    }
}

function showPopupNotification(design) {
    const popup = document.createElement("div");
    popup.className = "popup-notification";
    popup.innerText = "Copied to clipboard";

    Object.assign(popup.style, design);

    document.body.appendChild(popup);
    setTimeout(() => {
        document.body.removeChild(popup);
    }, 1500);
}