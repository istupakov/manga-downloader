/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaFox implements Manga.SiteParser {
    delayTime: number = 1000;

    parseUrl(url: string) {
        return Manga.parseMangaUrl(url, '/manga/[^/]+', '/[^/]+/[^/]+');
    }

    async parseChapter(url: string) {
        let chapter = await Manga.getJQuery(url);
        let chapterUrl = this.parseUrl(url).chapterUrl;

        let pagesElem = chapter.find('select.m').first().find('option').toArray();
        let pagesUrls = pagesElem.slice(0, pagesElem.length - 1).map(e => chapterUrl + '/' + $(e).val() + '.html');
        let pages = await Manga.getJQuery(pagesUrls);

        return pages.map(page => new Manga.Image(page.find('a img:not(#loading)').attr('src'), this.delayTime))
    }

    async parseManga(url: string) {
        let catalog = await Manga.getJQuery(url);
        let chapters = catalog.find('ul.chlist li :header').toArray().map($);

        return {
            name: catalog.find('#title h1').text(),
            cover: new Manga.Image(catalog.find('.cover img').attr('src'), this.delayTime),
            chapterList: chapters.map(chapter => ({
                url: chapter.find('a').attr('href'),
                name: `${chapter.find('a').text()}: ${chapter.find('span').text()}`
            }))
        };
    }
}

Manga.Parser.addParser('mangafox.me', new MangaFox());