/// <reference path="../typings/tsd.d.ts" />
'use strict';

function delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

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

function download(url: string, filename: string) {
    return new Promise<void>(resolve => chrome.downloads.download({ url, filename }, id => resolve()));
}

function getCurrentUrl() {
    return new Promise<Location>(resolve => chrome.tabs.query({ active: true }, tabs => {
        let a = document.createElement('a');
        a.href = tabs[0].url;
        resolve(<any>a);
    }));
}

function paddedNumber(index: number) {
    let s = '00' + index;
    return s.substr(s.length - 3);
}

class Downloader {
    private progress: JQuery;
    private manga: Manga.Manga;
    private delay: number;

    constructor(manga: Manga.Manga, delay?: number) {
        this.manga = manga;
        this.delay = delay || 100;
        this.progress = $('#progress');
    }

    async downloadMultiple(indices: number[]) {
        let elapsed = indices.length;
        let progress = $('<div/>').appendTo(this.progress);
        for (let index of indices) {
            progress.text(`elapsed chapters: ${elapsed--}/${indices.length}`);
            await this.download(this.manga.chapterList[index]);
        }
        progress.remove();
    }

    public async download(chapter: Manga.Chapter) {
        let progress = $('<div/>').appendTo(this.progress);
        try {
            let pages = await chapter.getPages();
            let zip = await this.downloadToZip(pages, index =>
                progress.text(`download page: ${index}/${pages.length} from ${chapter.name}`));

            let filename = chapter.name.replace('?', '').replace(':', ' -');
            let zipUrl = window.URL.createObjectURL(zip);
            await download(zipUrl, `manga/${filename}.zip`);
            window.URL.revokeObjectURL(zipUrl);
        } catch (e) {
            alert(`Error: Can't download chapter ${chapter.name}\nDetails:\n${e.message}`);
        } finally {
            progress.remove();
        }
    }

    private async downloadToZip(urls: string[], progress: (index: number) => void) {
        let zip = new JSZip();
        let index = 0;
        for (let url of urls) {
            progress(++index);
            zip.file(`${paddedNumber(index) }.jpg`, await loadUrlToArrayBuffer(url));
            await delay(this.delay);
        }
        return <Blob>zip.generate({ type: 'blob' });
    }
}

async function initPopup() {
    try {
        let url = await getCurrentUrl();
        let parser = Manga.mangaParserList[url.host](url.href);
        let manga = await parser.parseManga();
        if (manga.chapterList.length === 0) {
            throw Error();
        }

        $('#header').text(manga.name);
        $('#selectedChapters').append(manga.chapterList.map((chapter, i) => $('<option>').val(i).text(chapter.name)));
        $('#loadingMessage').hide();
        $('#content').slideDown('slow');

        let main = new Downloader(manga, parser.getDelay());
        $('#downloadSelected').click(() => main.downloadMultiple($.map($("option:selected"), e => $(e).val())));

        let currentChapter = manga.chapterList.find(c => c.url === url.href);
        if (currentChapter) {
            $('#downloadCurrent').click(() => main.download(currentChapter));
        } else {
            $('#downloadCurrent').hide();
        }
        
    } catch (e) {
        alert("Can`t find manga on current page...");
        window.close();
    }
}

$(() => initPopup());