export interface Parser {
    parseUrl(url: string): MangaUrl;
    parseManga(url: string): Promise<Manga>;
    parseChapter(url: string): Promise<string[]>
    getDelay(url: string): number;
    getSites(): string[];
}

export interface Manga {
    name: string;
    url: string;
    coverUrl: string;
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

export class MangaUrl {
    siteUrl: string;
    mangaUrl: string;
    chapterUrl: string;

    constructor(url: string, mangaRegEx: string, chapterRegEx: string) {
        let site = 'http://[^/]+';
        return {
            siteUrl: url.match(site)![0],
            mangaUrl: (url.match(site + mangaRegEx) || [])[0],
            chapterUrl: (url.match(site + mangaRegEx + chapterRegEx) || [])[0]
        }
    }
}

class DefaultParser implements Parser {
    private parserList: { [index: string]: Parser } = {};

    private findParser(url: string) {
        let a = document.createElement('a');
        a.href = url;
        return this.parserList[a.host];
    }

    async parseManga(url: string) {
        let parser = this.findParser(url);
        let manga = await parser.parseManga(parser.parseUrl(url).mangaUrl);

        let chapterUrl = parser.parseUrl(url).chapterUrl;
        manga.currentChapter = manga.chapterList.find(chapter =>
            parser.parseUrl(chapter.url).chapterUrl === chapterUrl);

        if (manga.chapterList.every(chapter => chapter.volume != undefined)) {
            let volumes: { [index: string]: Chapter[] } = {};
            for (let chapter of manga.chapterList.filter(chapter => chapter.volume != undefined)) {
                if (!volumes[chapter.volume!])
                    volumes[chapter.volume!] = [];
                volumes[chapter.volume!].push(chapter);
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

    addParser(parser: Parser) {
        for (let host of parser.getSites())
            this.parserList[host] = parser;
    }

    getDelay(url: string) {
        return this.findParser(url).getDelay(url);
    }

    getSites() {
        return Object.keys(this.parserList);
    }
}

let defaultParser = new DefaultParser();

import MangaFox from './parsers/mangafox';
defaultParser.addParser(new MangaFox());

import MangaGo from './parsers/mangago';
defaultParser.addParser(new MangaGo());

import MangaReader from './parsers/mangareader';
defaultParser.addParser(new MangaReader());

import MangaStream from './parsers/mangastream';
defaultParser.addParser(new MangaStream());

export default defaultParser as Parser;