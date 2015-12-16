/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaGo extends Manga.BaseParser {
    constructor(url: string) {
		let parse = url.match('(http://[^/]+/)[^/]+/[^/]+')
		super(parse[1], parse[0]);
    }

    protected getMangaName(catalog: JQuery) {
        return catalog.find('.manga_title h1').text().trim();
    }

    protected getMangaCoverUrl(catalog: JQuery) {
        return catalog.find('.cover img').attr('src');
    }

    protected getChapters(catalog: JQuery) {
        let chapters = catalog.find('#chapter_table tr').find('td:first a').toArray();
        return chapters.map(elem => {
            let chapter = $(elem);
            let url = chapter.attr('href');
            return {
                name: chapter.text().trim(),
                url,
                getPages: () => this.getChapterPages(url)
            };
        });
    }

    protected getPages(chapter: JQuery, url: string) {
        let pages = chapter.find('#dropdown-menu-page a').toArray();
        return pages.map(e => this.siteUrl + $(e).attr('href'));
    }

    protected getImageUrl(page: JQuery) {
        return page.find('img').attr('src');
    }
}

Manga.mangaParserList['www.mangago.me'] = url => new MangaGo(url);