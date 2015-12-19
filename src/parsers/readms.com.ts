/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaStream implements Manga.SiteParser {
    delayTime: number = 100;

    parseUrl(url: string) {
        let res = Manga.parseMangaUrl(url, '/(r|read|manga)/[^/]+', '/[^/]+');
        res.mangaUrl = res.mangaUrl.replace(/\/(r|read)\//, '/manga/');;
        return res;
    }

    async parseChapter(url: string) {
        let chapter = await Manga.getJQuery(url);

        let lastPageUrl = $(chapter.find('.subnav ul').get(1)).find('a').last().attr('href');
        let urlParts = lastPageUrl.match('(.*/)([0-9]+)');
        let pagesUrls = Array(parseInt(urlParts[2])).fill(0).map((v, i) => urlParts[1] + (i + 1));

        let pages = await Manga.getJQuery(pagesUrls);
        return pages.map(page => new Manga.Image(page.find('a img').attr('src'), this.delayTime))
    }

    async parseManga(url: string) {
        let catalog = await Manga.getJQuery(url);
        let chapters = catalog.find('.span8 td a').toArray().map($);

        return {
            name: catalog.find('.span8 h1').text(),
            chapterList: chapters.map(chapter => ({
                url: chapter.attr('href'),
                name: chapter.text()
            }))
        };
    }
}

Manga.Parser.addParser('readms.com', new MangaStream());
Manga.Parser.addParser('mangastream.com', new MangaStream());