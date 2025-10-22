chrome.storage.local.get(['Services/instagram.js', 'isInstagramPopup', 'isInstagramConvertPNG', 'isInstagramSaveImage','isInstagramHostImage'], function (result) {
  const isInstagramPopup = result.isInstagramPopup !== undefined ? result.isInstagramPopup : true; 
  const isInstagramConvertPNG = result.isInstagramConvertPNG !== undefined ? result.isInstagramConvertPNG : true; 
  const isInstagramSaveImage = result.isInstagramSaveImage !== undefined ? result.isInstagramSaveImage : false; 
  const isInstagramHostImage = result.isInstagramHostImage !== undefined ? result.isInstagramHostImage : true; 

  if (result['Services/instagram.js'] === false) {
    return; // Exit if the service is disabled
  }

  //https://github.com/y252328/Instagram_Download_Button

  (function () {
    'use strict';

    // =================
    // =    Options    =
    // =================
    // Old method is faster than new method, but not work or unable get highest resolution media sometime
    const disableNewUrlFetchMethod = false;
    const prefetchAndAttachLink = true; // prefetch and add link into the button elements
    const hoverToFetchAndAttachLink = false;  // fetch and add link when hover the button
    // ==================

    const postIdPattern = /^\/p\/([^/]+)\//;
    const postUrlPattern = /instagram\.com\/p\/[\w-]+\//;

    var svgcopyBtn = `<svg id="Capa_1" style="fill:%color;" viewBox="0 0 482.239 482.239" xmlns="http://www.w3.org/2000/svg" height="20" width="20">
<path stroke="black" stroke-width="10" d="m465.016 0h-344.456c-9.52 0-17.223 7.703-17.223 17.223v86.114h-86.114c-9.52 0-17.223 7.703-17.223 17.223v344.456c0 9.52 7.703 17.223 17.223 17.223h344.456c9.52 0 17.223-7.703 17.223-17.223v-86.114h86.114c9.52 0 17.223-7.703 17.223-17.223v-344.456c0-9.52-7.703-17.223-17.223-17.223zm-120.56 447.793h-310.01v-310.01h310.011v310.01zm103.337-103.337h-68.891v-223.896c0-9.52-7.703-17.223-17.223-17.223h-223.896v-68.891h310.011v310.01z"/>
</svg>`;

    var preUrl = "";

    document.addEventListener('keydown', keyDownHandler);

    function keyDownHandler(event) {
      if (window.location.href === 'https://www.instagram.com/') return;

      const mockEventTemplate = {
        stopPropagation: function () { },
        preventDefault: function () { }
      };


      if (event.altKey && (event.code === 'KeyI' || event.key == 'i')) {
        let buttons = document.getElementsByClassName('copy-btn');
        if (buttons.length > 0) {
          let mockEvent = { ...mockEventTemplate };
          mockEvent.currentTarget = buttons[buttons.length - 1];
          if (prefetchAndAttachLink || hoverToFetchAndAttachLink) onMouseInHandler(mockEvent);
          onClickHandler(mockEvent);
        }
      }

      if (event.altKey && (event.code === 'KeyL' || event.key == 'l')) {
        // right arrow
        let buttons = document.getElementsByClassName('_9zm2');
        if (buttons.length > 0) {
          buttons[0].click();
        }
      }

      if (event.altKey && (event.code === 'KeyJ' || event.key == 'j')) {
        // left arrow
        let buttons = document.getElementsByClassName('_9zm0');
        if (buttons.length > 0) {
          buttons[0].click();
        }
      }
    }

    function isPostPage() {
      return Boolean(window.location.href.match(postUrlPattern));
    }

    function queryHas(root, selector, has) {
      let nodes = root.querySelectorAll(selector);
      for (let i = 0; i < nodes.length; ++i) {
        let currentNode = nodes[i];
        if (currentNode.querySelector(has)) {
          return currentNode;
        }
      }
      return null;
    }

    var checkExistTimer = setInterval(function () {
      const curUrl = window.location.href;
      const savePostSelector = 'article *:not(li)>*>*>*>div:not([class])>div[role="button"]:not([style]):not([tabindex="-1"])';
      const profileSelector = 'header section svg circle';
      const playSvgPathSelector = 'path[d="M5.888 22.5a3.46 3.46 0 0 1-1.721-.46l-.003-.002a3.451 3.451 0 0 1-1.72-2.982V4.943a3.445 3.445 0 0 1 5.163-2.987l12.226 7.059a3.444 3.444 0 0 1-.001 5.967l-12.22 7.056a3.462 3.462 0 0 1-1.724.462Z"]';
      const pauseSvgPathSelector = 'path[d="M15 1c-3.3 0-6 1.3-6 3v40c0 1.7 2.7 3 6 3s6-1.3 6-3V4c0-1.7-2.7-3-6-3zm18 0c-3.3 0-6 1.3-6 3v40c0 1.7 2.7 3 6 3s6-1.3 6-3V4c0-1.7-2.7-3-6-3z"]';

      let rgb = getComputedStyle(document.body).backgroundColor.match(/[.?\d]+/g);
      let iconColor = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) <= 150 ? 'white' : 'black'

      // clear all custom buttons when url changing
      if (preUrl !== curUrl) {
        while (document.getElementsByClassName('custom-btn').length !== 0) {
          document.getElementsByClassName('custom-btn')[0].remove();
        }
      }

      // check post
      let articleList = document.querySelectorAll('article');
      for (let i = 0; i < articleList.length; i++) {
        let buttonAnchor = (Array.from(articleList[i].querySelectorAll(savePostSelector))).pop();
        if (buttonAnchor && articleList[i].getElementsByClassName('custom-btn').length === 0) {
          addCustomBtn(buttonAnchor, iconColor, append2Post);
        }
      }

      // check independent post page
      if (isPostPage()) {
        let savebtn = queryHas(document, 'div[role="button"] > div[role="button"]:not([style])', 'polygon[points="20 21 12 13.44 4 21 4 3 20 3 20 21"]') || queryHas(document, 'div[role="button"] > div[role="button"]:not([style])', 'path[d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"]');
        if (document.getElementsByClassName('custom-btn').length === 0) {
          if (savebtn.parentNode.querySelector('svg')) {
            addCustomBtn(savebtn.parentNode.querySelector('svg'), iconColor, append2IndependentPost);
          } else { }
        }
      }

      // check profile
      if (document.getElementsByClassName('custom-btn').length === 0 && !curUrl.includes("stor")) {
        if (document.querySelector(profileSelector)) {
          addCustomBtn(document.querySelector(profileSelector), iconColor, append2Header);
        }
      }

      preUrl = curUrl;
    }, 500);

    function append2Post(node, btn) {
      node.append(btn);
    }

    function append2IndependentPost(node, btn) {
      node.parentNode.parentNode.append(btn);
    }

    function append2Header(node, btn) {
      node.parentNode.parentNode.parentNode.appendChild(btn, node.parentNode.parentNode);
    }



    function addCustomBtn(node, iconColor, appendNode) {
      // add copy button and set event handlers
      let copyBtn = createCustomBtn(svgcopyBtn, iconColor, 'copy-btn', '16px');
      appendNode(node, copyBtn);

      if (prefetchAndAttachLink) {
        onMouseInHandler({ currentTarget: copyBtn });
      }
    }

    function createCustomBtn(svg, iconColor, className, marginLeft) {
      let newBtn = document.createElement('a');

      // Create SVG element
      let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElement.setAttribute("id", "Capa_1");
      svgElement.setAttribute("style", `fill:${iconColor};`);
      svgElement.setAttribute("viewBox", "0 0 482.239 482.239");
      svgElement.setAttribute("height", "20");
      svgElement.setAttribute("width", "20");

      // Create path element
      let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("stroke", "black");
      path.setAttribute("stroke-width", "10");
      path.setAttribute("d", "m465.016 0h-344.456c-9.52 0-17.223 7.703-17.223 17.223v86.114h-86.114c-9.52 0-17.223 7.703-17.223 17.223v344.456c0 9.52 7.703 17.223 17.223 17.223h344.456c9.52 0 17.223-7.703 17.223-17.223v-86.114h86.114c9.52 0 17.223-7.703 17.223-17.223v-344.456c0-9.52-7.703-17.223-17.223-17.223zm-120.56 447.793h-310.01v-310.01h310.011v310.01zm103.337-103.337h-68.891v-223.896c0-9.52-7.703-17.223-17.223-17.223h-223.896v-68.891h310.011v310.01z");

      // Append path to SVG
      svgElement.appendChild(path);

      // Append SVG to button
      newBtn.appendChild(svgElement);

      newBtn.setAttribute('class', 'custom-btn ' + className);
      newBtn.setAttribute('target', '_blank');
      newBtn.setAttribute('style', `cursor: pointer;margin-left: ${marginLeft};margin-top: 4px;z-index: 999;`);
      newBtn.onclick = onClickHandler;

      if (hoverToFetchAndAttachLink) newBtn.onmouseenter = onMouseInHandler;
      if (className.includes('copy')) {
        newBtn.setAttribute('title', 'Copy to clipboard');
      }

      return newBtn;
    }

    function onClickHandler(e) {
      // handle button click
      let target = e.currentTarget;
      e.stopPropagation();
      e.preventDefault();
      if (document.querySelector('header') && document.querySelector('header').contains(target)) {
        profileOnClicked(target);
      } else {
        postOnClicked(target);
      }
    }

    function onMouseInHandler(e) {
      let target = e.currentTarget;
      if (!prefetchAndAttachLink && !hoverToFetchAndAttachLink) return;
      if (document.querySelector('header') && document.querySelector('header').contains(target)) {
        profileOnMouseIn(target);
      } else {
        postOnMouseIn(target);
      }
    }

    // ================================
    // ====        Profile         ====
    // ================================
    function profileOnMouseIn(target) {
      let url = profileGetUrl(target);
      target.setAttribute('href', url);
    }

    function profileOnClicked(target) {
      // extract profile picture url and copy it
      let url = profileGetUrl(target);

      if (url.length > 0) {
        // open url in new tab
        copyToClipboard(url);
      }
    }


    function profileGetUrl(target) {
      let img = document.querySelector('header img');
      let url = img.getAttribute('src');
      return url;
    }

    // ================================
    // ====         Post           ====
    // ================================
    async function postOnMouseIn(target) {
      let articleNode = postGetArticleNode(target);
      let { url } = await postGetUrl(target, articleNode);
      target.setAttribute('href', url);
    }

    async function postOnClicked(target) {
      try {
        // extract url from target post and copy it
        let articleNode = postGetArticleNode(target);
        let { url, mediaIndex } = await postGetUrl(target, articleNode);

        // copy media url
        if (url.length > 0) {
          // open url in new tab
          copyToClipboard(url);
        }
      } catch (e) {
        return null;
      }
    }

    function postGetArticleNode(target) {
      let articleNode = target;
      while (articleNode && articleNode.tagName !== 'ARTICLE' && articleNode.tagName !== 'MAIN') {
        articleNode = articleNode.parentNode;
      }
      return articleNode;
    }

    async function postGetUrl(target, articleNode) {
      // meta[property="og:video"]
      let list = articleNode.querySelectorAll('li[style][class]');
      let url = null;
      let mediaIndex = 0;
      if (list.length === 0) {
        // single img or video
        if (!disableNewUrlFetchMethod) url = await getUrlFromInfoApi(articleNode);
        if (url === null) {
          let videoElem = articleNode.querySelector('video');
          if (videoElem) {
            // media type is video
            url = videoElem.getAttribute('src');
            if (videoElem.hasAttribute('videoURL')) {
              url = videoElem.getAttribute('videoURL');
            } else if (url === null || url.includes('blob')) {
              url = await fetchVideoURL(articleNode, videoElem);
            }
          } else if (articleNode.querySelector('article  div[role] div > img')) {
            // media type is image
            url = articleNode.querySelector('article  div[role] div > img').getAttribute('src');
          }
        }
      } else {
        // multiple imgs or videos
        const postView = location.pathname.startsWith('/p/');
        let dotsElements = [...articleNode.querySelectorAll(`div._acnb`)];
        mediaIndex = [...dotsElements].reduce((result, element, index) => (element.classList.length === 2 ? index : result), null);
        if (mediaIndex === null) throw 'Cannot find the media index';

        if (!disableNewUrlFetchMethod) url = await getUrlFromInfoApi(articleNode, mediaIndex);
        if (url === null) {
          const listElements = [...articleNode.querySelectorAll(`:scope > div > div:nth-child(${postView ? 1 : 2}) > div > div:nth-child(1) ul li[style*="translateX"]`)];
          const listElementWidth = Math.max(...listElements.map(element => element.clientWidth));

          const positionsMap = listElements.reduce((result, element) => {
            const position = Math.round(Number(element.style.transform.match(/-?(\d+)/)[1]) / listElementWidth);
            return { ...result, [position]: element };
          }, {});

          const node = positionsMap[mediaIndex];
          if (node.querySelector('video')) {
            // media type is video
            let videoElem = node.querySelector('video');
            url = videoElem.getAttribute('src');
            if (videoElem.hasAttribute('videoURL')) {
              url = videoElem.getAttribute('videoURL');
            } else if (url === null || url.includes('blob')) {
              url = await fetchVideoURL(articleNode, videoElem);
            }
          } else if (node.querySelector('img')) {
            // media type is image
            url = node.querySelector('img').getAttribute('src');
          }
        }
      }
      return { url, mediaIndex };
    }

    function findHighlightsIndex() {
      let currentDivProgressbarDiv = document.querySelector('div[style^="transform"]').parentElement;
      let progressbarRootDiv = currentDivProgressbarDiv.parentElement;
      let progressbarDivs = progressbarRootDiv.children;
      return Array.from(progressbarDivs).indexOf(currentDivProgressbarDiv);
    }

    let infoCache = {}; // key: media id, value: info json
    let mediaIdCache = {}; // key: post id, value: media id
    async function getUrlFromInfoApi(articleNode, mediaIdx = 0) {
      // return media url if found else return null
      // fetch flow:
      //	 1. find post id
      //   2. use step1 post id to send request to get post page
      //   3. find media id from the reponse text of step2
      //   4. find app id in clicked page
      //   5. send info api request with media id and app id
      //   6. get media url from response json
      try {
        const appIdPattern = /"X-IG-App-ID":"([\d]+)"/;
        const mediaIdPattern = /instagram:\/\/media\?id=(\d+)|["' ]media_id["' ]:["' ](\d+)["' ]/;
        function findAppId() {
          let bodyScripts = document.querySelectorAll("body > script");
          for (let i = 0; i < bodyScripts.length; ++i) {
            let match = bodyScripts[i].text.match(appIdPattern);
            if (match) return match[1];
          }
          return null;
        }

        async function findMediaId(mediaIdx) {
          // method 4
          function method4(mediaIdx) {
            let href = window.location.href;
            // let match = document.body.innerHTML.match(/"id":"(\d+_\d+)"/);
            let matchs = [...document.body.innerHTML.matchAll(/"id":"(\d+_\d+)"/g)];
            if (href.includes('stories') && matchs.length > mediaIdx) return matchs[mediaIdx][1];
            return null;
          }

          // method 1: extract from url.
          function method1() {
            let href = window.location.href;
            let match = href.match(/www.instagram.com\/stories\/[^\/]+\/(\d+)/);
            if (!href.includes('highlights') && match) return match[1];
            return null;
          }

          // method 3
          async function method3() {
            let postId = await findPostId(articleNode);
            if (!postId) {
              return null;
            }

            if (!(postId in mediaIdCache)) {
              let postUrl = `https://www.instagram.com/p/${postId}/`;
              let resp = await fetch(postUrl);
              let text = await resp.text();
              let idMatch = text ? text.match(mediaIdPattern) : [];
              let mediaId = null;
              for (let i = 0; i < idMatch.length; ++i) {
                if (idMatch[i]) mediaId = idMatch[i];
              }
              if (!mediaId) return null;
              mediaIdCache[postId] = mediaId;
            }
            return mediaIdCache[postId];
          }

          function method2() {
            let scriptJson = document.querySelectorAll('script[type="application/json"]');
            for (let i = 0; i < scriptJson.length; i++) {
              let match = scriptJson[i].text.match(/"pk":"(\d+)","id":"[\d_]+"/);
              if (match) {
                if (!window.location.href.includes('highlights')) {
                  return match[1];
                }
                let matchs = Array.from(scriptJson[i].text.matchAll(/"pk":"(\d+)","id":"[\d_]+"/g), match => match[1]);
                const matchIndex = findHighlightsIndex();
                if (matchs.length > matchIndex) {
                  return matchs[matchIndex];
                }
              }
            }
            return null;
          }

          return method1() || await method3() || method2();
        }

        function getImgOrVedioUrl(item) {
          if ("video_versions" in item) {
            return item.video_versions[0].url;
          } else {
            return item.image_versions2.candidates[0].url;
          }
        }

        let appId = findAppId();
        if (!appId) return null;
        let headers = {
          method: 'GET',
          headers: {
            Accept: '*/*',
            'X-IG-App-ID': appId
          },
          credentials: 'include',
          mode: 'cors'
        };

        let mediaId = await findMediaId(mediaIdx);
        if (!mediaId) {
          return null;
        }
        if (!(mediaId in infoCache)) {
          let url = 'https://i.instagram.com/api/v1/media/' + mediaId + '/info/';
          let resp = await fetch(url, headers);
          if (resp.status !== 200) {
            return null;
          }
          let respJson = await resp.json();
          infoCache[mediaId] = respJson;
        }
        let infoJson = infoCache[mediaId];
        if ('carousel_media' in infoJson.items[0]) {
          // multi-media post
          return getImgOrVedioUrl(infoJson.items[0].carousel_media[mediaIdx]);
        } else {
          // single media post
          return getImgOrVedioUrl(infoJson.items[0]);
        }
      } catch (e) {
        return null;
      }
    }

    function findPostId(articleNode) {
      let aNodes = articleNode.querySelectorAll('a');
      for (let i = 0; i < aNodes.length; ++i) {
        let link = aNodes[i].getAttribute('href');
        if (link) {
          let match = link.match(postIdPattern);
          if (match) return match[1];
        }
      }
      return null;
    }

    async function fetchVideoURL(articleNode, videoElem) {
      let poster = videoElem.getAttribute('poster');
      let timeNodes = articleNode.querySelectorAll('time');
      let posterUrl = timeNodes[timeNodes.length - 1].parentNode.parentNode.href;
      const posterPattern = /\/([^\/?]*)\?/;
      let posterMatch = poster.match(posterPattern);
      let postFileName = posterMatch[1];
      let resp = await fetch(posterUrl);
      let content = await resp.text();
      const pattern = new RegExp(`${postFileName}.*?video_versions.*?url":("[^"]*")`, 's');
      let match = content.match(pattern);
      let videoUrl = JSON.parse(match[1]);
      videoUrl = videoUrl.replace(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g, 'https://scontent.cdninstagram.com');
      videoElem.setAttribute('videoURL', videoUrl);
      return videoUrl;
    }


    async function copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        await processInstagramImage(text);
      } else {
        // fallback für unsichere Kontexte
        let textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';  // Verhindert das Scrollen auf Mobilgeräten
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          let successful = document.execCommand('copy');
          let msg = successful ? 'erfolgreich' : 'nicht erfolgreich';
          if (successful) {
            if (isInstagramPopup) showPopupNotification(); // Popup anzeigen
          }
        } catch (err) {
        }

        document.body.removeChild(textArea);
      }
    }

    function onClickHandler(e) {
      // handle button click
      let target = e.currentTarget;
      e.stopPropagation();
      e.preventDefault();

      // Speichere die Klickposition
      sessionStorage.setItem('clickX', e.clientX);
      sessionStorage.setItem('clickY', e.clientY);

      if (document.querySelector('header') && document.querySelector('header').contains(target)) {
        profileOnClicked(target);
      } else {
        postOnClicked(target);
      }
    }

    function showPopupNotification() {
      // Popup-Container erstellen
      const popup = document.createElement("div");
      popup.className = "popup-notification";

      // Popup-Inhalt setzen
      const content = document.createElement("div");
      content.innerText = "Copied to clipboard";
      content.className = "popup-content";

      // Inline-Stile für das Popup
      popup.style.position = "fixed";
      popup.style.backgroundColor = "#ffffff";
      popup.style.color = "#262626";
      popup.style.borderRadius = "10px";
      popup.style.padding = "10px 20px";
      popup.style.fontSize = "12px";
      popup.style.fontWeight = "bold";
      popup.style.zIndex = "9999";
      popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

      // Klickposition aus dem Sitzungsspeicher abrufen
      const clickX = parseInt(sessionStorage.getItem('clickX'), 10);
      const clickY = parseInt(sessionStorage.getItem('clickY'), 10);

      // Popup 20px rechts und 20px unterhalb der Klickposition positionieren
      popup.style.top = `${clickY + 20}px`;
      popup.style.left = `${clickX + 35}px`;

      // Inhalt zum Popup-Container hinzufügen
      popup.appendChild(content);

      // Popup zum Body hinzufügen
      document.body.appendChild(popup);

      // Popup nach 2 Sekunden entfernen
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 1500);
    }

    async function convertJpgToPng(jpgUrl) {
      try {
        const image = new Image();
        image.crossOrigin = "anonymous"; // Vermeidet CORS-Probleme
        image.src = jpgUrl;

        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Setze die Canvas-Größe basierend auf der Originalgröße des Bildes
        const originalWidth = image.width;
        const originalHeight = image.height;

        canvas.width = originalWidth;
        canvas.height = originalHeight;

        ctx.drawImage(image, 0, 0, originalWidth, originalHeight);

        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Fehler beim Laden oder Konvertieren:', error);
        return null;
      }
    }

    async function uploadToImgBB(pngDataUrl, fileName) {
      try {
        // Konvertiere das Base64-Bild in einen Blob
        const base64Response = await fetch(pngDataUrl);
        const blob = await base64Response.blob();

        // Erstelle ein FormData-Objekt
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('name', fileName);

        // ImgBB API-Endpunkt
        const apiKey = window.secrets.IMGBB_API_KEY;
        const apiUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;

        // HTTP POST-Anfrage senden
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error uploading: ${response.statusText}`);
        }

        const data = await response.json();

        // Rückgabe der URL des gehosteten Bildes
        return data.data.url;
      } catch (error) {
        console.error('Error uploading to ImgBB:', error);
        return null;
      }
    }

    async function processInstagramImage(extractedUrl) {
      // Instagram-URL extrahieren
      const fileName = getFileNameFromUrl(extractedUrl);


      if (isInstagramConvertPNG) {

        // Konvertiere das JPG in PNG
        const pngDataUrl = await convertJpgToPng(extractedUrl);

        if (pngDataUrl) {
          // Lade das PNG hoch und erhalte die gehostete URL
          if (isInstagramHostImage) {
            const uploadedUrl = await uploadToImgBB(pngDataUrl, fileName);
            if (uploadedUrl) {
              // Kopiere die URL in die Zwischenablage
              await navigator.clipboard.writeText(uploadedUrl);
              if (isInstagramPopup) {
                showPopupNotification(); // Zeige Benachrichtigung an
              }
            } else {
              console.error('Error uploading the image.');
            }
          } else if (isInstagramSaveImage) {
            // Wenn isInstagramHostImage false ist, lade das PNG herunter
            const link = document.createElement('a');
            link.href = pngDataUrl;
            link.download = `${fileName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } else {
          console.error('Error converting to PNG.');
        }
      } else {
        if (isInstagramHostImage) {
          // Wenn isInstagramConvertPNG false ist, kopiere nur die modifizierte URL
          await navigator.clipboard.writeText(extractedUrl);
          if (isInstagramPopup) {
            showPopupNotification(); 
          }
        } else if (isInstagramSaveImage) {
          const response = await fetch(extractedUrl); // Ruft die Datei ab
          const blob = await response.blob(); // Konvertiert die Datei in ein Blob-Objekt
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob); // Erstellt einen Blob-URL
          link.download = `${fileName}.jpg`; // Dateiname mit .jpg-Erweiterung
          document.body.appendChild(link);
          link.click(); // Startet den Download
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href); // Bereinigt den Blob-URL
        }
      }
    }

    function getFileNameFromUrl(url) {
      const parts = url.split('/'); // Teile die URL am Schrägstrich
      const fileNameWithExtension = parts.pop().split('.')[0]; // Nimm den letzten Teil und entferne die Dateiendung
      return fileNameWithExtension; // Rückgabe des Dateinamens ohne Suffix
    }

  })();

});
