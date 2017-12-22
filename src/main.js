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

function printHelp() {
    console.error('usage: main.js fictionpress <id>');
    console.error('       main.js fanfiction <id>');
    console.error('       main.js <name>');
    console.error('       main.js --list-serials');
    console.error('       main.js --help');
    console.error();
    console.error('Generate EPUBs for various web serials');
    console.error();
    console.error('Arguments');
    console.error('  name              Name of serial to fetch, see --list-serials');
    console.error('  id                ID of serial on fictionpress.com or fanfiction.net');
    console.error('  --help            Display this message and exit');
    console.error('  --list-serials    Show available serials and exit');
}

function error(message) {
    console.error('error: ' + message);
    console.error();
    printHelp();
    process.exit(1);
}

if (process.argv.length < 3) {
    error('Not enough arguments');
}
if (process.argv[2] === '--help') {
    printHelp();
    process.exit(0);
}
if (process.argv[2] === '--list-serials') {
    console.error('Available serials');
    for (let name in serials) {
        if (serials.hasOwnProperty(name)) {
            console.error('  ' + name);
        }
    }
    process.exit(0);
}
const fictionpress = process.argv[2] === 'fictionpress' || process.argv[2] === 'fanfiction';
if (fictionpress && process.argv.length < 4) {
    error('ID not provided');
}
if (fictionpress && isNaN(parseInt(process.argv[3]))) {
    error('ID must be a number');
}
if (fictionpress) {
    scrape(fanfiction(process.argv[2] === 'fictionpress' ? 'fictionpress.com' : 'fanfiction.net', process.argv[3]));
    process.exit(0);
}
if (!serials[process.argv[2]]) {
    error('Unrecognized serial ' + process.argv[2]);
}
scrape(serials[process.argv[2]]);
