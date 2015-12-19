/// <reference path="../typings/tsd.d.ts" />
'use strict';

module Manga {
    export interface SiteParser {
        delayTime: number;
        parseUrl(url: string): {
            siteUrl: string;
            mangaUrl: string;
            chapterUrl: string;
        };
        parseChapter(url: string): Promise<Image[]>
        parseManga(url: string): Promise<Manga>;
    }

    export interface Manga {
        name: string;
        cover?: Image;
        chapterList: Chapter[];
        currentChapter?: Chapter;
    }

    export interface Chapter {
        name: string;
        url: string;
    }

    export class Image {
        url: string;
        private delayTime: number;

        constructor(url: string, delayTime: number) {
            this.url = url;
            this.delayTime = delayTime;
        }

        getAsBlob(repeatOnErrors?: boolean) {
            return this.get<Blob>(this.url, 'blob', repeatOnErrors);
        }

        getAsArrayBuffer(repeatOnErrors?: boolean) {
            return this.get<ArrayBuffer>(this.url, 'arraybuffer', repeatOnErrors);
        }

        private async get<T>(url: string, type: string, repeat?: boolean) {
            while (true) {
                try {
                    await this.delay();
                    return await getUrl<T>(url, type);
                } catch (e) {
                    if (!repeat || !confirm(`Error: ${e.message}!\nTry again?`)) {
                        throw e;
                    }
                }
            }
        }

        private delay() {
            return new Promise<void>(resolve => setTimeout(resolve, this.delayTime));
        }
    }

    export function getJQuery(url: string): Promise<JQuery>;
    export function getJQuery(url: string[]): Promise<JQuery[]>;
    export function getJQuery(url: string | string[]): any {
        if (typeof url === 'string') {
            return Promise.resolve($.get(url)).then($);
        } else {
            return Promise.all(url.map(url => getJQuery(url)));
        }
    }

    function getUrl<T>(url: string, type: string) {
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

    export function parseMangaUrl(url: string, mangaRegEx: string, chapterRegEx: string) {
        let site = 'http://[^/]+';
        return {
            siteUrl: url.match(site)[0],
            mangaUrl: (url.match(site + mangaRegEx) || [])[0],
            chapterUrl: (url.match(site + mangaRegEx + chapterRegEx) || [])[0]
        }
    }

    export module Parser {
        var parserList: { [index: string]: SiteParser } = {}

        function findParser(url: string) {
            let a = document.createElement('a');
            a.href = url;
            return parserList[a.host];
        }

        export async function parseManga(url: string) {
            let parser = findParser(url)
            let manga = await parser.parseManga(parser.parseUrl(url).mangaUrl);
            let chapterUrl = parser.parseUrl(url).chapterUrl;
            manga.currentChapter = manga.chapterList.find(chapter => parser.parseUrl(chapter.url).chapterUrl === chapterUrl);
            return manga;
        }

        export function parseChapter(url: string) {
            return findParser(url).parseChapter(url);
        }

        export function parseUrl(url: string) {
            return findParser(url).parseUrl(url);
        }

        export function addParser(host: string, parser: SiteParser) {
            parserList[host] = parser;
        }

        export function getSites() {
            return Object.keys(parserList);
        }
    }
}