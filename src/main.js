// @flow

import Streampub from 'streampub';
import fs from 'fs';

import type {Serial} from './Serial';

import fanfiction from './serials/fanfiction';
import practicalguidetoevil from './serials/practicalguidetoevil';
import sidewaysinhyperspace from './serials/sidewaysinhyperspace';

const serials: { [string]: Serial } = {
    practicalguidetoevil,
    sidewaysinhyperspace,
};

async function scrape(fetch: Serial) {
    const serial = await fetch();
    console.error(serial.title + ', ' + serial.author);
    const epub = new Streampub({title: serial.title, author: serial.author, source: serial.source});
    epub.pipe(fs.createWriteStream(serial.title + '.epub'));
    for (let [index, chapter] of serial.chapters.entries()) {
        let {title, text} = await chapter();
        if (title == null) {
            title = 'Chapter ' + (index + 1);
        }
        epub.write(Streampub.newChapter(title, '<h1>' + title + '</h1>' + text));
        // TODO: use progress bar
        console.error('Fetched ' + (index + 1) + '/' + serial.chapters.length + ' chapters');
    }
    epub.end();
}

// TODO: Use argparse to implement proper argument handling
if (process.argv[2] === 'fanfiction') {
    scrape(fanfiction('fanfiction.net', process.argv[3]));
} else if (process.argv[2] === 'fictionpress') {
    scrape(fanfiction('fictionpress.com', process.argv[3]));
} else {
    scrape(serials[process.argv[2]]);
}
