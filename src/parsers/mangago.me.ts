/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaGo implements Manga.Parser {
    delayTime: number = 100;

    parseUrl(url: string) {
        return Manga.defaultParser.parseUrlByRegEx(url, '/read-manga/[^/]+', '.+/c[^/]+');
    }

    async parseChapter(url: string) {
        let chapter = await Utils.getJQuery(url);
        let siteUrl = this.parseUrl(url).siteUrl;

        let pagesUrls = chapter.find('#dropdown-menu-page a').toArray().map(e => siteUrl + $(e).attr('href'));
        let pages = await Utils.getJQuery(pagesUrls);

        return pages.map(page => new Manga.Image(page.find('img').attr('src'), this.delayTime))
    }

    async parseManga(url: string) {
        let catalog = await Utils.getJQuery(url);
        let chapters = catalog.find('#chapter_table tr').find('td:first a').toArray().map($);

        return {
            url,
            name: catalog.find('.manga_title h1').text().trim(),
            cover: new Manga.Image(catalog.find('.cover img').attr('src'), this.delayTime),
            chapterList: chapters.map(chapter => ({
                url: chapter.attr('href'),
                name: chapter.text().trim(),
                date: new Date(chapter.parents('td').next().text())
            }))
        };
    }
}

Manga.defaultParser.addParser('www.mangago.me', new MangaGo());