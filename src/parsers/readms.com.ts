/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaStream implements Manga.Parser {
    delayTime: number = 100;

    parseUrl(url: string) {
        let res = Manga.defaultParser.parseUrlByRegEx(url, '/(r|read|manga)/[^/]+', '/[^/]+');
        res.mangaUrl = res.mangaUrl.replace(/\/(r|read)\//, '/manga/');;
        return res;
    }

    async parseChapter(url: string) {
        let chapter = await Utils.getJQuery(url);

        let lastPageUrl = $(chapter.find('.subnav ul').get(1)).find('a').last().attr('href');
        let urlParts = lastPageUrl.match('(.*/)([0-9]+)');
        let pagesUrls = Array(parseInt(urlParts[2])).fill(0).map((v, i) => urlParts[1] + (i + 1));

        let pages = await Utils.getJQuery(pagesUrls);
        return pages.map(page => new Manga.Image(page.find('a img').attr('src'), this.delayTime))
    }

    async parseManga(url: string) {
        let catalog = await Utils.getJQuery(url);
        let chapters = catalog.find('.span8 td a').toArray().map($);
        let mangaName = catalog.find('.span8 h1').text();

        return {
            url,
            name: mangaName + ' Manga',
            chapterList: chapters.map(chapter => ({
                url: chapter.attr('href'),
                name: mangaName + ' ' + chapter.text()
            }))
        };
    }
}

Manga.defaultParser.addParser('readms.com', new MangaStream());
Manga.defaultParser.addParser('mangastream.com', new MangaStream());