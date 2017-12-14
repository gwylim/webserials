// @flow

import type {Serial, Chapter} from '../Serial';

import fetch from 'node-fetch';
import {wordpressPage} from './util';
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
        result.push({uri: match[1], title: match[2]});
    }
    return result;
}

const serial: Serial = async () => {
    const links = await getLinks();
    return {
        title: 'A Practical Guide to Evil',
        author: 'erraticerrata',
        source: 'https://practicalguidetoevil.wordpress.com/',
        // TODO: parse description from landing page
        description: null,
        chapters: links.map(wordpressPage),
    };
};

export default serial;
