import * as $ from 'jquery';
import {getJQuery} from './../utils';
import {Parser, MangaUrl} from './../manga';

class MangaFox implements Parser {
    parseUrl(url: string) {
        return new MangaUrl(url, '/manga/[^/]+', '.*/c[^/]+');
    }

    async parseChapter(url: string) {
        let chapter = await getJQuery(url);
        let chapterUrl = this.parseUrl(url).chapterUrl;

        let pagesElem = chapter.find('select.m').first().find('option').toArray();
        let pagesUrls = pagesElem.slice(0, pagesElem.length - 1).map(e => chapterUrl + '/' + $(e).val() + '.html');
        let pages = await getJQuery(pagesUrls);
        return pages.map(page => page.find('a img:not(#loading)').attr('src'));
    }

    async parseManga(url: string) {
        let catalog = await getJQuery(url);
        let chapters = catalog.find('ul.chlist li').toArray().map($);

        return {
            url,
            name: catalog.find('#title h1').text(),
            coverUrl: catalog.find('.cover img').attr('src'),
            chapterList: chapters.map(chapter => ({
                url: chapter.find(':header a').attr('href'),
                name: `${chapter.find('a').text()}: ${chapter.find('.title').text()}`,
                date: new Date(chapter.find('.date').text()),
                volume: chapter.parent().prev().find('.volume').contents().filter((i, e) => e.nodeType === 3).text()
            }))
        };
    }

    getDelay() {
        return 1000;
    }

    getSites() {
        return ['mangafox.me'];
    }
}

export default MangaFox;