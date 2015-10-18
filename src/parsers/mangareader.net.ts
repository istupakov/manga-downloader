/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../manga.ts" />
'use strict';

class MangaReader implements Manga.MangaSite {
	chapterListQuery = "$.map($('select#chapterMenu option'), e => { return { url: $(e).val(), name: $(e).text() } })";

	getBaseUrl(url: string) {
		return url.match('(http://[^/]*)/[^/]+/[0-9]+(/[0-9]+)?')[1];
	}

	mangaName(chapter: JQuery) {
		return chapter.find('#mangainfo h2').text();
	}
	chapterName(chapter: JQuery) {
		return chapter.find('#mangainfo h1').text();
	}
	pageList(url: string, chapter: JQuery) {
		let baseUrl = this.getBaseUrl(url);
		return $.map(chapter.find('select#pageMenu option'), e => baseUrl + $(e).val());
	}
	imageUrl(page: JQuery) {
		return page.find('#imgholder img').attr('src');
	}

	async mangaChapterList(url: string, chapter: JQuery) {
		let baseUrl = this.getBaseUrl(url);
		let chapters = await Manga.executeScript<{ url: string, name: string }[]>(this.chapterListQuery);
		return chapters.map(val => {
			return {
				url: baseUrl + val.url,
				name: val.name
			}
		});
	}
}

Manga.mangaParserList['www.mangareader.net'] = Manga.CreateDefaultParser(new MangaReader());