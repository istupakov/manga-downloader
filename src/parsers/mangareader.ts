import * as $ from 'jquery';
import {getJQuery} from './../utils';
import {Parser, MangaUrl} from './../manga';

class MangaReader implements Parser {
    parseUrl(url: string) {
        return new MangaUrl(url, '/[^/]+', '/[^/]+');
    }

    async parseChapter(url: string) {
        let siteUrl = this.parseUrl(url).siteUrl;
        let chapter = await getJQuery(url);

        let pagesUrls = chapter.find('select#pageMenu option').toArray().map(e => siteUrl + $(e).val());
        let pages = await getJQuery(pagesUrls);
        return pages.map(page => page.find('#imgholder img').attr('src'));
    }

    async parseManga(url: string) {
        let catalog = await getJQuery(url);
        let chapters = catalog.find('#listing tr').find('td:first').toArray().map($);
        let siteUrl = this.parseUrl(url).siteUrl;

        return {
            url,
            name: catalog.find('#mangaproperties h1').text(),
            coverUrl: catalog.find('#mangaimg img').attr('src'),
            chapterList: chapters.map(chapter => ({
                url: siteUrl + chapter.find('a').attr('href'),
                name: chapter.find('a').text() + chapter.contents().filter((i, e) => e.nodeType === 3).text().trim(),
                date: new Date(chapter.next().text())
            }))
        };
    }

    getDelay() {
        return 100;
    }

    getSites() {
        return ['www.mangareader.net', 'www.mangapanda.com'];
    }
}

export default MangaReader;