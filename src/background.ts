'use strict';

import parser from './manga'

chrome.webNavigation.onCompleted.addListener(details => {
    if (parser.parseUrl(details.url).mangaUrl) {
        chrome.pageAction.show(details.tabId);
    }
}, { url: parser.getSites().map(site => ({ hostEquals: site })) });
