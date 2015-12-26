/// <reference path="../typings/tsd.d.ts" />
'use strict';

chrome.webNavigation.onCompleted.addListener(details => {
    if (Manga.defaultParser.parseUrl(details.url).mangaUrl) {
        chrome.pageAction.show(details.tabId);
    }
}, { url: Manga.defaultParser.getSites().map(site => ({ hostEquals: site })) });
