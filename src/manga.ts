/// <reference path="../typings/tsd.d.ts" />
'use strict';

module Manga {
    export var mangaParserList: { [index: string]: (url: string) => MangaParser } = {};

    export interface MangaParser {
        parseManga(): Promise<Manga>;
    }

    export interface Manga {
        name: string;
        coverUrl: Page;
        chapterList: Chapter[];
    }

    export interface Chapter {
        name: string;
        url: string;
        getPages(): Promise<Page[]>;
    }

    export class Page {
        url: string;
        private delayTime: number;

        constructor(url: string, delayTime: number) {
            this.url = url;
            this.delayTime = delayTime;
        }

        async getBlob(repeat?: boolean) {
            return await tryGetUrl<Blob>(this.url, 'blob', this.delayTime, repeat);
        }

        async getArrayBuffer(repeat?: boolean) {
            return await tryGetUrl<ArrayBuffer>(this.url, 'arraybuffer', this.delayTime, repeat);
        }
    }

    export function createParser(mangaUrl: string) {
        let a = document.createElement('a');
        a.href = mangaUrl;
        return mangaParserList[a.host](a.href)
    }

    function getJQuery(url: string) {
        return Promise.resolve($.get(url)).then(data => $(data));
    }

    async function tryGetUrl<T>(url: string, type: string, delayTime: number, repeat?: boolean) {
        while (true) {
            try {
                await delay(delayTime);
                return await getUrl<T>(url, type);
            } catch (e) {
                if (!repeat || !confirm(`Error: ${e.message}!\nTry again?`)) {
                    throw e;
                }
            }
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

    function delay(ms: number) {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }

    export abstract class BaseParser implements MangaParser {
        protected siteUrl: string;
        protected mangaUrl: string;
        protected delayTime: number = 100;

        protected abstract getMangaName(catalog: JQuery): string;
        protected abstract getChapters(catalog: JQuery): Chapter[];
        protected abstract getPages(chapter: JQuery, url: string): string[];
        protected abstract getImageUrl(page: JQuery): string;
        protected getMangaCoverUrl(catalog: JQuery): string {
            return undefined;
        }

        protected getChapter(url: string, name: string) {
            return <Chapter>{
                name,
                url,
                getPages: async () => {
                    let data = await getJQuery(url);
                    let pagesUrls = this.getPages(data, url);
                    let imageUrls = await Promise.all(pagesUrls.map(async (page) => this.getImageUrl(await getJQuery(page))));
                    return imageUrls.map(imageUrl => new Page(imageUrl, this.delayTime))
                }
            };
        }

        constructor(siteUrl: string, mangaUrl: string) {
            this.siteUrl = siteUrl;
            this.mangaUrl = mangaUrl;
        }

        async parseManga() {
            let data = await getJQuery(this.mangaUrl);
            return <Manga>{
                name: this.getMangaName(data),
                coverUrl: new Page(this.getMangaCoverUrl(data), this.delayTime),
                chapterList: this.getChapters(data),
            };
        }
    }
}