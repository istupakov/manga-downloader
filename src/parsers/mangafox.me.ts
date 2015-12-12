/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../manga.ts" />
'use strict';

class MangaFox implements Manga.MangaSite {
	chapterListQuery = "$.map($('select#top_chapter_list option'), e => { return { url: $(e).val(), name: $(e).text() } })";

	parseUrl(url: string) {
		var parse = url.match('(http://.*/)([^/]+/[^/]+/)[0-9]+\.html');
		return { baseUrl: parse[1], chapterUrl: parse[1] + parse[2] };
	}

	mangaName(chapter: JQuery) {
		return chapter.find('#series strong a').text();
	}
	chapterName(chapter: JQuery) {
		return chapter.find('#series h1').text();
	}
	pageList(url: string, chapter: JQuery) {
		let baseUrl = this.parseUrl(url).chapterUrl;
		let pages = chapter.find('select.m').first().find('option');
		return $.map(pages.slice(0, pages.length - 1), e => baseUrl + $(e).val() + '.html');
	}
	imageUrl(page: JQuery) {
		return page.find('a img:not(#loading)').attr('src');
	}
	getDelay() {
		return 1000;
	}

	async mangaChapterList(url: string, chapter: JQuery) {
		let baseUrl = this.parseUrl(url).baseUrl;
		let chapters = await Manga.executeScript<{ url: string, name: string }[]>(this.chapterListQuery);
		return chapters.map(val => {
			return {
				url: baseUrl + val.url + '/1.html',
				name: val.name
			}
		});
	}
}

Manga.mangaParserList['mangafox.me'] = Manga.CreateDefaultParser(new MangaFox());