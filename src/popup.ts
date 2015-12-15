/// <reference path="../typings/tsd.d.ts" />
'use strict';

function delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function loadUrlToArrayBuffer(url: string) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open('GET', url);
        req.responseType = 'arraybuffer';
        req.onload = ev => (req.status == 200) ? resolve(req.response) : reject(Error(`Can't download ${url}: ${req.statusText} (${req.status})`));
        req.onerror = ev => reject(Error(`Can't download ${url}: Network error`));
        req.send();
    });
}

function download(url: string, filename: string) {
    return new Promise<void>(resolve => chrome.downloads.download({ url, filename }, id => resolve()));
}

function getCurrentUrl() {
    return new Promise<string>(resolve => chrome.tabs.query({ active: true }, tabs => resolve(tabs[0].url)));
}

function paddedNumber(index: number) {
    let s = '00' + index;
    return s.substr(s.length - 3);
}

function toFilename(text: string) {
    return text.replace('?', '').replace(':', ' -');
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

    public async downloadMultiple(indices: number[]) {
        let elapsed = indices.length;
        let progress = $('<div/>').appendTo(this.progress);
        for (let index of indices) {
            progress.text(`elapsed chapters: ${elapsed--}/${indices.length}`);
            await this.download(this.manga.chapterList[index]);
        }
        progress.remove();
    }

    public async downloadMultiple2(indices: number[]) {
        let progress = $('<div/>').appendTo(this.progress);
        try {
            let elapsed = indices.length;
            let zip = new JSZip();
            for (let index of indices) {
                progress.text(`elapsed chapters: ${elapsed--}/${indices.length}`);
                let chapter = this.manga.chapterList[index];
                await this.loadToZip(chapter, zip.folder(toFilename(chapter.name)));
            }
            await this.saveZip(zip, this.manga.name);
        } catch (e) {
            alert(`Error: ${e.message}`);
        } finally {
            progress.remove();
        }
    }

    public async download(chapter: Manga.Chapter) {
        try {
            let zip = new JSZip();
            await this.loadToZip(chapter, zip);
            await this.saveZip(zip, chapter.name);
        } catch (e) {
            alert(`Error: Can't download chapter ${chapter.name}\nDetails:\n${e.message}`);
        }
    }

    private async saveZip(zip: JSZip, filename: string) {
        let zipUrl = window.URL.createObjectURL(zip.generate({ type: 'blob' }));
        await download(zipUrl, `manga/${toFilename(filename) }.zip`);
        window.URL.revokeObjectURL(zipUrl);
    }

    private async loadToZip(chapter: Manga.Chapter, zip: JSZip) {
        let progress = $('<div/>').appendTo(this.progress);
        try {
            let pages = await chapter.getPages();
            let index = 0;
            for (let page of pages) {
                progress.text(`download page: ${++index}/${pages.length} from ${chapter.name}`);
                zip.file(`${paddedNumber(index) }.jpg`, await loadUrlToArrayBuffer(page));
                await delay(this.delay);
            }
        } finally {
            progress.remove();
        }
    }
}

async function initPopup() {
    try {
        let url = await getCurrentUrl();
        let parser = Manga.createParser(url);
        let manga = await parser.parseManga();
        if (manga.chapterList.length === 0) {
            throw Error();
        }

        $('#header').text(manga.name);
        $('#selectedChapters').height(300).width(400).append(
            manga.chapterList.map((chapter, i) => $('<option>').val(i).text(chapter.name)));
        $('#loadingMessage').hide();
        $('#content').slideDown('slow');

        let main = new Downloader(manga, parser.getDelay());
        $('#downloadSelected').click(() => main.downloadMultiple($.map($('option:selected'), e => $(e).val())));
        $('#downloadSelected2').click(() => main.downloadMultiple2($.map($('option:selected'), e => $(e).val())));

        let currentChapter = manga.chapterList.find(c => c.url === url);
        if (currentChapter) {
            $('#downloadCurrent').click(() => main.download(currentChapter));
        } else {
            $('#downloadCurrent').hide();
        }

    } catch (e) {
        alert("Can't find manga on current page...");
        window.close();
    }
}

$(() => initPopup());