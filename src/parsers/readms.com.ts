/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../manga.ts" />
'use strict';

class MangaStream implements Manga.MangaSite {
	mangaName(chapter: JQuery) {
		return chapter.find('.subnav a:not(ul a) span').first().text().trim() + ' Manga';
	}
	chapterName(chapter: JQuery) {
		return chapter.find('.subnav a').first().text().trim();
	}
	pageList(url: string, chapter: JQuery) {
		return $.map($(chapter.find('.subnav ul').get(1)).find('a'), e => $(e).attr('href'));
	}
	imageUrl(page: JQuery) {
		return page.find('a img').attr('src');
	}

	mangaChapterList(url: string, chapter: JQuery) {
		let chapters = chapter.find('.subnav ul').first().find('a');
		let res = $.map(chapters.slice(0, chapters.length - 1), e => {
			return {
				url: $(e).attr('href'),
				name: $(e).find('span').first().text().trim()
			};
		});
		return Promise.resolve<{ url: string, name: string }[]>(res);
	}
}

Manga.mangaParserList['readms.com'] = Manga.CreateDefaultParser(new MangaStream());