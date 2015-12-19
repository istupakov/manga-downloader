/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaGo implements Manga.SiteParser {
    delayTime: number = 100;

    parseUrl(url: string) {
        return Manga.parseMangaUrl(url, '/read-manga/[^/]+', '.+/c[^/]+');
    }

    async parseChapter(url: string) {
        let chapter = await Manga.getJQuery(url);
        let siteUrl = this.parseUrl(url).siteUrl;

        let pagesUrls = chapter.find('#dropdown-menu-page a').toArray().map(e => siteUrl + $(e).attr('href'));
        let pages = await Manga.getJQuery(pagesUrls);

        return pages.map(page => new Manga.Image(page.find('img').attr('src'), this.delayTime))
    }

    async parseManga(url: string) {
        let catalog = await Manga.getJQuery(url);
        let chapters = catalog.find('#chapter_table tr').find('td:first a').toArray().map($);

        return {
            name: catalog.find('.manga_title h1').text().trim(),
            cover: new Manga.Image(catalog.find('.cover img').attr('src'), this.delayTime),
            chapterList: chapters.map(chapter => ({
                url: chapter.attr('href'),
                name: chapter.text().trim()
            }))
        };
    }
}

Manga.Parser.addParser('www.mangago.me', new MangaGo());