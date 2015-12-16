/// <reference path="../../typings/tsd.d.ts" />
'use strict';

class MangaFox extends Manga.BaseParser {
	constructor(url: string) {
		let parse = url.match('(http://[^/]+/)[^/]+/[^/]+')
		super(parse[1], parse[0]);
		this.delayTime = 1000;
	}

	protected getMangaName(catalog: JQuery) {
		return catalog.find('#title h1').text();
	}

	protected getMangaCoverUrl(catalog: JQuery) {
		return catalog.find('.cover img').attr('src');
	}

	protected getChapters(catalog: JQuery) {
		let chapters = catalog.find('ul.chlist li :header').toArray();
		return chapters.map($).map(chapter =>
			this.getChapter(chapter.find('a').attr('href'),
				`${chapter.find('a').text() }: ${chapter.find('span').text() }`
			));
	}

	protected getPages(chapter: JQuery, url: string) {
		let chapterUrl = url.match('(.*)[0-9]+\.html')[1];
		let pages = chapter.find('select.m').first().find('option').toArray();
		return pages.slice(0, pages.length - 1).map(e => chapterUrl + $(e).val() + '.html');
	}

	protected getImageUrl(page: JQuery) {
		return page.find('a img:not(#loading)').attr('src');
	}
}

Manga.mangaParserList['mangafox.me'] = url => new MangaFox(url);