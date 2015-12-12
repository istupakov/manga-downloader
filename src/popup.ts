/// <reference path="../typings/tsd.d.ts" />
'use strict';

const jQueryURL = 'jquery.min.js';

function loadUrlToArrayBuffer(url: string) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open('GET', url);
        req.responseType = "arraybuffer";
        req.onload = ev => (req.status == 200) ? resolve(req.response) : reject(Error(`Can't download ${url}: ${req.statusText} (${req.status})`));
        req.onerror = ev => reject(Error(`Can't download ${url}: Network error`));
        req.send();
    });
}

class Downloader {
    private progress: JQuery;
    private parser: Manga.MangaParser;

    constructor(parser: Manga.MangaParser) {
        this.parser = parser;
        this.progress = $('#progress');
    }

    async download(url: string) {
        try {
            let chapter = await this.parser.parseChapter(url);
            await this.downloadChapter(chapter);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
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
        try {
            let zip = await this.downloadToZip(chapter.pages, index =>
                progress.text(`download page: ${index + 1}/${chapter.pages.length} from ${chapter.name}`));

            let filename = chapter.name.replace('?', '').replace(':', ' -');
            let zipUrl = window.URL.createObjectURL(zip);
            await Chrome.download(zipUrl, `manga/${filename}.zip`);
            window.URL.revokeObjectURL(zipUrl);
        } catch (e) {
            throw Error(`Can't download chapter ${chapter.name}\nDetails:\n${e.message}`);
        } finally {
            progress.remove();
        }
    }

    private async downloadToZip(files: { url: string, filename: string }[], progress: (index: number) => void) {
        let zip = new JSZip();
        let index = 0;
        for (let file of files) {
            progress(index++);
            zip.file(file.filename, await loadUrlToArrayBuffer(file.url));
            await Manga.delay(this.parser.getDelay());
        }
        return <Blob>zip.generate({ type: 'blob' });
    }
}

async function initPopup() {
    try {
        await Chrome.injectScript(jQueryURL);
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
    } catch (e) {
        alert("Can't parse manga on current page...");
        window.close();
    }
}

$(() => initPopup());