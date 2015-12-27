'use strict';

import {getJQuery} from './../utils';
import {Image, Parser, MangaUrl} from './../manga';

class MangaGo implements Parser {
    delayTime: number = 100;

    parseUrl(url: string) {
        return new MangaUrl(url, '/read-manga/[^/]+', '.+/c[^/]+');
    }

    async parseChapter(url: string) {
        let chapter = await getJQuery(url);
        let siteUrl = this.parseUrl(url).siteUrl;

        let pagesUrls = chapter.find('#dropdown-menu-page a').toArray().map(e => siteUrl + $(e).attr('href'));
        let pages = await getJQuery(pagesUrls);

        return pages.map(page => new Image(page.find('img').attr('src'), this.delayTime))
    }

    async parseManga(url: string) {
        let catalog = await getJQuery(url);
        let chapters = catalog.find('#chapter_table tr').find('td:first a').toArray().map($);

        return {
            url,
            name: catalog.find('.manga_title h1').text().trim(),
            cover: new Image(catalog.find('.cover img').attr('src'), this.delayTime),
            chapterList: chapters.map(chapter => ({
                url: chapter.attr('href'),
                name: chapter.text().trim(),
                date: new Date(chapter.parents('td').next().text())
            }))
        };
    }

    getSites() {
        return ['www.mangago.me'];
    }
}

export default MangaGo;