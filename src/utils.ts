'use strict';

export function getJQuery(url: string): Promise<JQuery>;
export function getJQuery(url: string[]): Promise<JQuery[]>;
export function getJQuery(url: string | string[]): any {
    if (typeof url === 'string') {
        return Promise.resolve($.get(url)).then($);
    } else {
        return Promise.all(url.map(url => getJQuery(url)));
    }
}

export function delay(delayTime: number) {
    return new Promise<void>(resolve => setTimeout(resolve, delayTime));
}

export function getAsBlob(url: string, repeatOnErrors: boolean) {
    return getDataWithRepeat<Blob>(url, 'blob', repeatOnErrors);
}

export function getAsArrayBuffer(url: string, repeatOnErrors: boolean) {
    return getDataWithRepeat<ArrayBuffer>(url, 'arraybuffer', repeatOnErrors);
}

function getData<T>(url: string, type: string) {
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

async function getDataWithRepeat<T>(url: string, type: string, repeat?: boolean) {
    while (true) {
        try {
            return await getData<T>(url, type);
        } catch (e) {
            if (!repeat || !confirm(`Error: ${e.message}!\nTry again?`)) {
                throw e;
            }
        }
    }
}