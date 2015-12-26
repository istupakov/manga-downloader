/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaFox implements Manga.Parser {
    delayTime: number = 1000;

    parseUrl(url: string) {
        return Manga.defaultParser.parseUrlByRegEx(url, '/manga/[^/]+', '/[^/]+/[^/]+');
    }

    async parseChapter(url: string) {
        let chapter = await Utils.getJQuery(url);
        let chapterUrl = this.parseUrl(url).chapterUrl;

        let pagesElem = chapter.find('select.m').first().find('option').toArray();
        let pagesUrls = pagesElem.slice(0, pagesElem.length - 1).map(e => chapterUrl + '/' + $(e).val() + '.html');
        let pages = await Utils.getJQuery(pagesUrls);

        return pages.map(page => new Manga.Image(page.find('a img:not(#loading)').attr('src'), this.delayTime))
    }

    async parseManga(url: string) {
        let catalog = await Utils.getJQuery(url);
        let chapters = catalog.find('ul.chlist li').toArray().map($);

        return {
            url,
            name: catalog.find('#title h1').text(),
            cover: new Manga.Image(catalog.find('.cover img').attr('src'), this.delayTime),
            chapterList: chapters.map(chapter => ({
                url: chapter.find(':header a').attr('href'),
                name: `${chapter.find('a').text()}: ${chapter.find('.title').text()}`,
                date: new Date(chapter.find('.date').text()),
                volume: chapter.parent().prev().find('.volume').contents().filter((i, e) => e.nodeType === 3).text()
            }))
        };
    }
}

Manga.defaultParser.addParser('mangafox.me', new MangaFox());