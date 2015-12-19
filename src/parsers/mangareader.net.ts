/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaReader implements Manga.SiteParser {
    delayTime: number = 100;

    parseUrl(url: string) {
        return Manga.parseMangaUrl(url, '/[^/]+', '/[^/]+');
    }

    async parseChapter(url: string) {
        let siteUrl = this.parseUrl(url).siteUrl;
        let chapter = await Manga.getJQuery(url);

        let pagesUrls = chapter.find('select#pageMenu option').toArray().map(e => siteUrl + $(e).val());
        let pages = await Manga.getJQuery(pagesUrls);

        return pages.map(page => new Manga.Image(page.find('#imgholder img').attr('src'), this.delayTime))
    }

    async parseManga(url: string) {
        let catalog = await Manga.getJQuery(url);
        let chapters = catalog.find('#listing tr').find('td:first').toArray().map($);
        let siteUrl = this.parseUrl(url).siteUrl;

        return {
            name: catalog.find('#mangaproperties h1').text(),
            cover: new Manga.Image(catalog.find('#mangaimg img').attr('src'), this.delayTime),
            chapterList: chapters.map(chapter => ({
                url: siteUrl + chapter.find('a').attr('href'),
                name: chapter.find('a').text() + chapter.contents().filter((i, e) => e.nodeType === 3).text().trim()
            }))
        };
    }
}

Manga.Parser.addParser('www.mangareader.net', new MangaReader());
Manga.Parser.addParser('www.mangapanda.com', new MangaReader());