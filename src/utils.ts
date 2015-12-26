/// <reference path="../typings/tsd.d.ts" />
'use strict';

namespace Utils {
    export function getJQuery(url: string): Promise<JQuery>;
    export function getJQuery(url: string[]): Promise<JQuery[]>;
    export function getJQuery(url: string | string[]): any {
        if (typeof url === 'string') {
            return Promise.resolve($.get(url)).then($);
        } else {
            return Promise.all(url.map(url => getJQuery(url)));
        }
    }

    export function getData<T>(url: string, type: string) {
        return new Promise<T>((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open('GET', url);
            req.responseType = type;
            req.onload = ev => (req.status == 200) ? resolve(req.response)
                : reject(Error(`Can't download ${url}: ${req.statusText} (${req.status})`));
            req.onerror = ev => reject(Error(`Can't download ${url}: Network error`));
            req.send();
        });
    }

    export function delay(delayTime: number) {
        return new Promise<void>(resolve => setTimeout(resolve, delayTime));
    }
}