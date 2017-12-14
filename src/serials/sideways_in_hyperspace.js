// @flow

import type {Serial} from '../Serial';

import {fetchDocument, wordpressPage} from './util';

const URI: string = 'https://sidewaysfiction.wordpress.com/';

const serial: Serial = async () => {
    const mainPage = await fetchDocument(URI);
    const links = [];
    for (let link of mainPage.querySelector('div.entry-content').querySelectorAll('a')) {
        const uri = link.attributes['href'];
        if (uri.search(/[0-9]{4}\/[0-9]{2}\/[0-9]{2}/) !== -1) {
            links.push({uri, title: link.text});
        }
    }
    return {
        title: 'Sideways in Hyperspace',
        author: 'Hivewired',
        source: URI,
        description: mainPage.querySelectorAll('p')[1].text,
        chapters: links.map(wordpressPage),
    };
};

export default serial;
