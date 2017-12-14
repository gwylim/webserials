// @flow

const Streampub = require('streampub');
const fs = require('fs');
import apgte from './serials/a_practical_guide_to_evil';

async function main() {
    const epub = new Streampub({title: apgte.title, author: apgte.author, source: apgte.source});
    epub.pipe(fs.createWriteStream(apgte.title + '.epub'));
    const {description, contents} = await apgte.fetch();
    for (let [index, {title, text}] of contents.entries()) {
        if (title == null) {
            title = 'Chapter ' + (index + 1);
        }
        epub.write(Streampub.newChapter(title, '<h1>' + title + '</h1>' + text));
    }
    epub.end();
}

main();
