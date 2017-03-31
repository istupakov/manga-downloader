import * as $ from 'jquery';
import { getJQuery } from './../utils';
import { Parser, MangaUrl } from './../manga';

class MangaStream implements Parser {
    parseUrl(url: string) {
        let res = new MangaUrl(url, '/(r|read|manga)/[^/]+', '/[^/]+');
        res.mangaUrl = res.mangaUrl.replace(/\/(r|read)\//, '/manga/');;
        return res;
    }

    async parseChapter(url: string) {
        let chapter = await getJQuery(url);

        let lastPageUrl = $(chapter.find('.subnav ul').get(1)).find('a').last().attr('href');
        let urlParts = lastPageUrl.match('(.*/)([0-9]+)')!;
        let pagesUrls = Array(parseInt(urlParts[2])).fill(0).map((v, i) => urlParts[1] + (i + 1));
        let pages = await getJQuery(pagesUrls);
        return pages.map(page => new URL(page.find('a img').attr('src'), url).href);
    }

    async parseManga(url: string) {
        let catalog = await getJQuery(url);
        let chapters = catalog.find('.col-sm-8 td a').toArray().map($);
        let mangaName = catalog.find('.col-sm-8 h1').text();

        return {
            url,
            name: mangaName + ' Manga',
            chapterList: chapters.map(chapter => ({
                url: chapter.attr('href'),
                name: mangaName + ' ' + chapter.text()
            }))
        };
    }

    getDelay() {
        return 100;
    }

    getSites() {
        return ['readms.com', 'readms.net', 'mangastream.com'];
    }
}

export default MangaStream;