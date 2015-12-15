'use strict';
var sites = ['www.mangareader.net', 'www.mangapanda.com', 'mangafox.me', 'readms.com', 'mangastream.com'];
chrome.webNavigation.onCompleted.addListener(details => {
    if (details.url.match("//[^/]+/.+")) {
        chrome.pageAction.show(details.tabId);
    }
}, { url: sites.map(site => ({ hostEquals: site })) });
