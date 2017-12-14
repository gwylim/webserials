// @flow

import type {Serial} from '../Serial';

import fetch from 'node-fetch';
import {fetchDocument, serialize} from './util';
import Streampub from 'streampub';
import fs from 'fs';

async function fetchText(uri) {
    const response = await fetch(uri);
    return await response.text();
}

async function getLinks() {
    const exp = /<li><a href="(.*?[0-9]{4}\/[0-9]{2}\/[0-9]{2}.*?)">(.*?)<\/a><\/li>/g
    const html = await fetchText('https://practicalguidetoevil.wordpress.com/table-of-contents/');
    let match;
    const result = [];
    while ((match = exp.exec(html)) !== null) {
        result.push([match[1], match[2]]);
    }
    return result;
}

export default async function fetch(): Promise<Serial> {
    const contents = [];
    const links = await getLinks();
    for (let [index, [link, title]] of links.entries()) {
        const page = await fetchDocument(link);
        const contentNode = page.querySelector('div.entry-content');
        const output = [];
        for (let child of contentNode.childNodes) {
            if (child.tagName && child.querySelector('span') && child.querySelector('span').rawText === 'Advertisements') {
                break;
            }
            output.push(serialize(child).trim());
        }
        contents.push({title, text: output.join('')});
    }
    return {
        title: 'A Practical Guide to Evil',
        author: 'erraticerrata',
        source: 'https://practicalguidetoevil.wordpress.com/',
        // TODO: parse description from landing page
        description: null,
        contents,
    };
}
