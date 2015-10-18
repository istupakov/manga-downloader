/// <reference path="../typings/tsd.d.ts" />
/// <reference path="manga.ts" />
'use strict';

const jQueryURL = 'jquery.min.js';
const zipJsURL = 'zip.js/';

class Downloader {
    progress: JQuery;
    parser: Manga.MangaParser;

    constructor(parser: Manga.MangaParser) {
        this.parser = parser;
        this.progress = $('#progress');
        zip.workerScriptsPath = chrome.runtime.getURL(zipJsURL);
    }

    async download(url: string) {
        let chapter = await this.parser.parseChapter(url);
        await this.downloadChapter(chapter);
    }

    async downloadMultiple(urls: string[]) {
        let elapsed = urls.length;
        let progress = $('<div/>').appendTo(this.progress);
        for (let url of urls) {
            progress.text(`elapsed chapters: ${elapsed--}/${urls.length}`);
            await this.download(url);
        }
        progress.remove();
    }

    private async downloadChapter(chapter: Manga.ChapterDetails) {
        let progress = $('<div/>').appendTo(this.progress);
        let zipUrl = await this.downloadToZip(chapter.pages, index => progress.text(`download page: ${index + 1}/${chapter.pages.length} from ${chapter.name}`));
        progress.remove();
        chrome.downloads.download({ url: zipUrl, filename: `manga/${chapter.name}.zip` });
    }

    private downloadToZip(files: { url: string, filename: string }[], progress: (index: number) => void) {
        return new Promise<string>(resolve =>
            zip.createWriter(new zip.BlobWriter('application/zip'), writer => {
                var promise = Promise.resolve();

                files.forEach((file, index) => promise = promise.then(() => {
                    progress(index);
                    return new Promise<void>(resolve => writer.add(file.filename, new zip.HttpReader(file.url), () => resolve()));
                }));

                promise.then(() => writer.close(result => resolve((<any>window).URL.createObjectURL(result))));
            }));
    }
}

function injectJQuery() {    
    return new Promise(resolve => chrome.tabs.executeScript({ file: jQueryURL }, result => resolve()));
}

async function initPopup() {
    await injectJQuery();
    let url = await Manga.getCurrentUrl();
    let parser = Manga.mangaParserList[url.host];
    let manga = await parser.parseManga(url.href);

    $('#header').text(manga.mangaName);
    $('#selectedChapters').append(manga.chapterList.map(chapter => $('<option>').val(chapter.url).text(chapter.name)));
    $('#loadingMessage').hide();
    $('#content').slideDown('slow');

    let main = new Downloader(parser);
    $('#downloadCurrent').click(() => main.download(url.href));
    $('#downloadSelected').click(() => main.downloadMultiple($.map($("option:selected"), e => $(e).val())));
}

$(() => initPopup());