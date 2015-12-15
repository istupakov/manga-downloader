/// <reference path="../typings/tsd.d.ts" />
'use strict';

module Manga {
    export var mangaParserList: { [index: string]: (url: string) => MangaParser } = {};

    export interface Manga {
        name: string;
        coverUrl: string;
        chapterList: Chapter[];
    }

    export interface Chapter {
        name: string;
        url: string;
        getPages(): Promise<string[]>;
    }

    export interface MangaParser {
        parseManga(): Promise<Manga>;
        getDelay(): number;
    }

    export function createParser(mangaUrl: string) {
        let a = document.createElement('a');
        a.href = mangaUrl;
        return mangaParserList[a.host](a.href)
    }

    export abstract class BaseParser implements MangaParser {
        protected siteUrl: string;
        protected mangaUrl: string;
        protected delay: number = 100;

        protected abstract getMangaName(catalog: JQuery): string;
        protected abstract getChapters(catalog: JQuery): Chapter[];
        protected abstract getPages(chapter: JQuery, url: string): string[];
        protected abstract getImageUrl(page: JQuery): string;
        protected getMangaCoverUrl(catalog: JQuery): string {
            return undefined;
        }

        protected async getChapterPages(url: string) {
            let data = await this.getJQuery(url);
            let pages = this.getPages(data, url);
            return await Promise.all(pages.map(async(page) => this.getImageUrl(await this.getJQuery(page))));
        }

        private getJQuery(url: string) {
            return Promise.resolve($.get(url)).then(data => $(data));
        }

        constructor(siteUrl: string, mangaUrl: string) {
            this.siteUrl = siteUrl;
            this.mangaUrl = mangaUrl;
        }

        async parseManga() {
            let data = await this.getJQuery(this.mangaUrl);
            return {
                name: this.getMangaName(data),
                coverUrl: this.getMangaCoverUrl(data),
                chapterList: this.getChapters(data),
            };
        }

        getDelay() {
            return this.delay;
        }
    }
}