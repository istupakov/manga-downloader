/// <reference path="../typings/tsd.d.ts" />
'use strict';

chrome.webNavigation.onCompleted.addListener(details => {
    if (Manga.Parser.parseUrl(details.url).mangaUrl) {
        chrome.pageAction.show(details.tabId);
    }
}, { url: Manga.Parser.getSites().map(site => ({ hostEquals: site })) });
