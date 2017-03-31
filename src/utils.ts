import * as $ from 'jquery';

export function getJQuery(url: string): Promise<JQuery>;
export function getJQuery(url: string[]): Promise<JQuery[]>;
export function getJQuery(url: string | string[]): any {
    if (typeof url === 'string') {
        return $.get(url).then($);
    } else {
        return Promise.all(url.map(url => getJQuery(url)));
    }
}

export function delay(delayTime: number) {
    return new Promise<void>(resolve => setTimeout(resolve, delayTime));
}

export async function getAsBlob(url: string, repeatOnErrors: boolean) {
    while (true) {
        try {
            let response = await fetch(url);
            return await response.blob();
        } catch (e) {
            if (!repeatOnErrors || !confirm(`Error: can't load url ${url} (${e.message})!\nTry again?`)) {
                throw e;
            }
        }
    }
}