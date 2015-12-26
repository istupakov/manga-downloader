/// <reference path="../typings/tsd.d.ts" />
'use strict';

namespace Manga {
    export interface Parser {
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
        url: string;
        cover?: Image;
        chapterList: Chapter[];
        volumeList?: Volume[];
        currentChapter?: Chapter;
    }

    export interface Volume {
        name: string;
        chapterList: Chapter[];
    }

    export interface Chapter {
        name: string;
        url: string;
        date?: Date;
        volume?: string;
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
                    await Utils.delay(this.delayTime);
                    return await Utils.getData<T>(url, type);
                } catch (e) {
                    if (!repeat || !confirm(`Error: ${e.message}!\nTry again?`)) {
                        throw e;
                    }
                }
            }
        }
    }

    class DefaultParser implements Parser {
        private parserList: { [index: string]: Parser } = {}

        private findParser(url: string) {
            let a = document.createElement('a');
            a.href = url;
            return this.parserList[a.host];
        }

        async parseManga(url: string) {
            let parser = this.findParser(url)
            let manga = await parser.parseManga(parser.parseUrl(url).mangaUrl);

            let chapterUrl = parser.parseUrl(url).chapterUrl;
            manga.currentChapter = manga.chapterList.find(chapter =>
                parser.parseUrl(chapter.url).chapterUrl === chapterUrl);

            if (manga.chapterList.every(chapter => chapter.volume != undefined)) {
                let volumes: { [index: string]: Chapter[] } = {};
                for (let chapter of manga.chapterList.filter(chapter => chapter.volume != undefined)) {
                    if (!volumes[chapter.volume])
                        volumes[chapter.volume] = [];
                    volumes[chapter.volume].push(chapter);
                }
                manga.volumeList = Object.keys(volumes).map(key => ({ name: key, chapterList: volumes[key] }));
            }

            return manga;
        }

        parseChapter(url: string) {
            return this.findParser(url).parseChapter(url);
        }

        parseUrl(url: string) {
            return this.findParser(url).parseUrl(url);
        }

        addParser(host: string, parser: Parser) {
            this.parserList[host] = parser;
        }

        getSites() {
            return Object.keys(this.parserList);
        }

        parseUrlByRegEx(url: string, mangaRegEx: string, chapterRegEx: string) {
            let site = 'http://[^/]+';
            return {
                siteUrl: url.match(site)[0],
                mangaUrl: (url.match(site + mangaRegEx) || [])[0],
                chapterUrl: (url.match(site + mangaRegEx + chapterRegEx) || [])[0]
            }
        }
    }

    export let defaultParser = new DefaultParser();
}