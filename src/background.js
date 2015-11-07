'use strict';
chrome.webNavigation.onCompleted.addListener(details => chrome.pageAction.show(details.tabId), {
    url: [
        { hostSuffix: 'mangareader.net', urlMatches: ".*/[0-9]+" },
        { hostSuffix: 'mangapanda.com', urlMatches: ".*/[0-9]+" },
        { hostSuffix: 'mangafox.me', urlMatches: ".*/c[0-9]+/[0-9]+\.html" },
        { hostSuffix: 'readms.com', urlMatches: ".*/[0-9]+/[0-9]+/[0-9]+" },
    ]
});
