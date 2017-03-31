import * as $ from 'jquery';
import {getJQuery} from './../utils';
import {Parser, MangaUrl} from './../manga';

class MangaGo implements Parser {
    parseUrl(url: string) {
        return new MangaUrl(url, '/read-manga/[^/]+', '.+/c[^/]+');
    }

    async parseChapter(url: string) {
        let chapter = await getJQuery(url);
        let siteUrl = this.parseUrl(url).siteUrl;

        let pagesUrls = chapter.find('#dropdown-menu-page a').toArray().map(e => siteUrl + $(e).attr('href'));
        let pages = await getJQuery(pagesUrls);
        return pages.map(page => page.find('img').attr('src'));
    }

    async parseManga(url: string) {
        let catalog = await getJQuery(url);
        let chapters = catalog.find('#chapter_table tr').find('td:first a').toArray().map($);

        return {
            url,
            name: catalog.find('h1').text().trim(),
            coverUrl: catalog.find('.cover img').attr('src'),
            chapterList: chapters.map(chapter => ({
                url: chapter.attr('href'),
                name: chapter.text().trim(),
                date: new Date(chapter.parents('td').next().text())
            }))
        };
    }

    getDelay() {
        return 100;
    }

    getSites() {
        return ['www.mangago.me'];
    }
}

export default MangaGo;