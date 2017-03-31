import { Manga, Chapter, default as parser } from './manga';
import { delay, getAsBlob } from './utils'
import * as $ from 'jquery';
import * as JSZip from 'jszip'

function download(url: string, filename: string) {
    return new Promise<void>(resolve => chrome.downloads.download({ url, filename }, id => resolve()));
}

function getCurrentUrl() {
    return new Promise<string>(resolve => chrome.tabs.query({ active: true },
        tabs => resolve(tabs.find(tab => tab.url != undefined)!.url)));
}

function paddedNumber(index: number) {
    let s = '00' + index;
    return s.substr(s.length - 3);
}

function toFilename(text: string) {
    return text.replace(/\?/g, '')
        .replace(/\d+/g, d => paddedNumber(parseInt(d)))
        .replace(/(\s*:\s*)+/g, ' - ');
}

class Downloader {
    private progress: JQuery;
    private manga: Manga;

    constructor(manga: Manga) {
        this.manga = manga;
        this.progress = $('#progress');
    }

    private getSelectedChapters() {
        return $('option:selected').toArray().map(e => this.manga.chapterList[$(e).val()]).sort(
            (a, b) => toFilename(a.name).localeCompare(toFilename(b.name)));
    }

    public async downloadMultiple() {
        let chapters = this.getSelectedChapters();
        let elapsed = chapters.length;
        let progress = $('<div/>').appendTo(this.progress);
        for (let chapter of chapters) {
            progress.text(`elapsed chapters: ${elapsed--}/${chapters.length}`);
            await this.download(chapter);
        }
        progress.remove();
    }

    public async downloadMultiple2() {
        let progress = $('<div/>').appendTo(this.progress);
        try {
            let chapters = this.getSelectedChapters();
            let elapsed = chapters.length;
            let zip = new JSZip();
            for (let chapter of chapters) {
                progress.text(`elapsed chapters: ${elapsed--}/${chapters.length}`);
                await this.loadToZip(chapter, zip.folder(toFilename(chapter.name)));
            }
            await this.saveZip(zip, this.manga.name);
        } catch (e) {
            alert(`Error: ${e.message}`);
        } finally {
            progress.remove();
        }
    }

    public async download(chapter: Chapter) {
        try {
            let zip = new JSZip();
            await this.loadToZip(chapter, zip);
            await this.saveZip(zip, chapter.name);
        } catch (e) {
            alert(`Error: Can't download chapter ${chapter.name}\nDetails:\n${e.message}`);
        }
    }

    private async saveZip(zip: JSZip, filename: string) {
        let zipUrl = window.URL.createObjectURL(await zip.generateAsync({ type: 'blob' }));
        await download(zipUrl, `manga/${toFilename(filename)}.zip`);
        window.URL.revokeObjectURL(zipUrl);
    }

    private async loadToZip(chapter: Chapter, zip: JSZip) {
        let progress = $('<div/>').appendTo(this.progress);
        try {
            let urls = await parser.parseChapter(chapter.url);
            let index = 0;
            for (let url of urls) {
                progress.text(`download page: ${++index}/${urls.length} from ${chapter.name}`);
                zip.file(`${paddedNumber(index)}.jpg`, await getAsBlob(url, true));
                await delay(parser.getDelay(chapter.url));
            }
        } finally {
            progress.remove();
        }
    }
}

async function initPopup() {
    try {
        //await delay(10000);
        let url = await getCurrentUrl();
        let manga = await parser.parseManga(url);
        if (manga.chapterList.length === 0) {
            throw Error();
        }

        $('#header').text(manga.name);
        if (manga.coverUrl) {
            $('#cover').attr('src', manga.coverUrl).show();
        }

        if (false && manga.volumeList) {
            //$('#chapterList').append(manga.volumeList!.map(volume => $('<optgroup>').attr({ label: volume.name })
            //    .append(volume.chapterList.map(((chapter, i) => $('<option>').val(chapter.url).text(chapter.name))))));
        } else {
            $('#chapterList').append(manga.chapterList.map((chapter, i) => $('<option>').val(i).text(chapter.name)));
        }

        let main = new Downloader(manga);
        $('#downloadSelected').click(() => main.downloadMultiple());
        $('#downloadSelected2').click(() => main.downloadMultiple2());

        if (manga.currentChapter) {
            $('#downloadCurrent').click(() => main.download(manga.currentChapter!)).show();
        }

        $('#loadingMessage').hide();
        $('#content').slideDown('slow');
    } catch (e) {
        alert("Can't find manga on current page...");
        window.close();
    }
}

$(() => initPopup());