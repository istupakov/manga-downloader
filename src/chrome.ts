/// <reference path="../typings/tsd.d.ts" />
'use strict';

module Chrome {
    export function executeScript<T>(code: string): Promise<T> {
        return new Promise<T>(resolve => chrome.tabs.executeScript({ code }, result => resolve(result[0])));
    }

    export function injectScript(file: string) {
        return new Promise<void>(resolve => chrome.tabs.executeScript({ file }, result => resolve()));
    }

    export function download(url: string, filename: string) {
        return new Promise<void>(resolve => chrome.downloads.download({ url, filename }, id => resolve()));
    }
}