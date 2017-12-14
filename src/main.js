// @flow

import Streampub from 'streampub';
import fs from 'fs';

import type {Serial} from './Serial';

import fanfiction from './serials/fanfiction';
import a_practical_guide_to_evil from './serials/a_practical_guide_to_evil';

const serials = {
    'practicalguidetoevil': a_practical_guide_to_evil,
};

async function scrape(fetchSerial: () => Promise<Serial>) {
    const serial = await fetchSerial();
    const epub = new Streampub({title: serial.title, author: serial.author, source: serial.source});
    epub.pipe(fs.createWriteStream(serial.title + '.epub'));
    // TODO: show progress for fetching
    for (let [index, {title, text}] of serial.contents.entries()) {
        if (title == null) {
            title = 'Chapter ' + (index + 1);
        }
        epub.write(Streampub.newChapter(title, '<h1>' + title + '</h1>' + text));
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
