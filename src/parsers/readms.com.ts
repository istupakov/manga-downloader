/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaStream extends Manga.BaseParser {
    constructor(url: string) {
        let parse = url.match('(http://[^/]+/)[^/]+/([^/]+)');
        super(parse[1], parse[1] + 'manga/' + parse[2]);
    }

    protected getMangaName(catalog: JQuery) {
        return catalog.find('.span8 h1').text();
    }

    protected getChapters(catalog: JQuery) {
        let chapters = catalog.find('.span8 td a').toArray();
        return chapters.map(elem => {
            let chapter = $(elem);
            let url = chapter.attr('href');
            return {
                name: chapter.text(),
                url,
                getPages: () => this.getChapterPages(url)
            };
        });
    }

    protected getPages(chapter: JQuery, url: string) {
        let lastPageUrl = $(chapter.find('.subnav ul').get(1)).find('a').last().attr('href');
        let urlParts = lastPageUrl.match('(.*/)([0-9]+)');
        return Array(parseInt(urlParts[2])).fill(0).map((v, i) => urlParts[1] + (i + 1));
    }

    protected getImageUrl(page: JQuery) {
        return page.find('a img').attr('src');
    }
}

Manga.mangaParserList['readms.com'] = url => new MangaStream(url);