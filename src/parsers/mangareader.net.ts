/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaReader extends Manga.BaseParser {
    constructor(url: string) {
        let parse = url.match('(http://[^/]+)/[^/]+');
        super(parse[1], parse[0]);
    }

    protected getMangaName(catalog: JQuery) {
        return catalog.find('#mangaproperties h1').text();
    }

    protected getMangaCoverUrl(catalog: JQuery) {
        return catalog.find('#mangaimg img').attr('src');
    }

    protected getChapters(catalog: JQuery) {
        let chapters = catalog.find('#listing tr').find('td:first').toArray();
        return chapters.map(elem => {
            let chapter = $(elem);
            let url = this.siteUrl + chapter.find('a').attr('href');
            let desc = chapter.contents().filter((i, e) => e.nodeType === 3).text().trim();
            return {
                name: chapter.find('a').text() + desc,
                url,
                getPages: () => this.getChapterPages(url)
            };
        });
    }

    protected getPages(chapter: JQuery, url: string) {
        let pages = chapter.find('select#pageMenu option').toArray();
        return pages.map(e => this.siteUrl + $(e).val());
    }

    protected getImageUrl(page: JQuery) {
        return page.find('#imgholder img').attr('src');
    }
}

Manga.mangaParserList['www.mangareader.net'] = url => new MangaReader(url);
Manga.mangaParserList['www.mangapanda.com'] = Manga.mangaParserList['www.mangareader.net'];