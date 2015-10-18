/// <reference path="../typings/tsd.d.ts" />
'use strict';

module Manga {
    export var mangaParserList: { [index: string]: MangaParser } = {};

    export interface MangaDetails {
        mangaName: string;
        currentChapterName: string;
        chapterList: { url: string, name: string }[];
    }

    export interface ChapterDetails {
        name: string;
        pages: { url: string, filename: string }[];
    }

    export interface MangaSite {
        mangaName(chapter: JQuery): string;
        chapterName(chapter: JQuery): string;
        pageList(url: string, chapter: JQuery): string[];
        imageUrl(page: JQuery): string;

        mangaChapterList(url: string): Promise<{ url: string, name: string }[]>;
    }

    export interface MangaParser {
        parseManga(url: string): Promise<MangaDetails>;
        parseChapter(url: string): Promise<ChapterDetails>;
    }

    export function executeScript<T>(code: string): Promise<T> {
        return new Promise<T>(resolve => chrome.tabs.executeScript({ code: code }, result => resolve(result[0])));
    }

    export async function getCurrentUrl(): Promise<Location> {
        var a = document.createElement('a');
        a.href = await executeScript<string>("window.location.href");
        return <any>a;
    }

    export function CreateDefaultParser(site: MangaSite) {
        return new DefaultMangaParser(site);
    }

    class DefaultMangaParser implements Manga.MangaParser {
        protected site: MangaSite;

        constructor(site: MangaSite) {
            this.site = site;
        }

        async parseManga(url: string) {
            let content = await this.getJQuery(url);
            return {
                mangaName: this.site.mangaName(content),
                currentChapterName: this.site.chapterName(content),
                chapterList: await this.site.mangaChapterList(url)
            };
        }

        async parseChapter(url: string) {
            let content = await this.getJQuery(url);
            let pageList = this.site.pageList(url, content);
            return {
                name: this.site.chapterName(content),
                pages: await Promise.all(pageList.map((url, index) => this.ParsePage(url, index)))
            };
        }

        protected async ParsePage(url: string, index: number) {
            let content = await this.getJQuery(url);
            return {
                url: this.site.imageUrl(content),
                filename: this.paddedNumber(index) + '.jpg'
            }
        }

        protected paddedNumber(index: number) {
            let s = '00' + (index + 1);
            return s.substr(s.length - 3);
        }

        protected getJQuery(url: string) {
            return Promise.resolve($.get(url)).then(data => $(data));
        }
    }
}