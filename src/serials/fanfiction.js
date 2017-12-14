// @flow

import fetch from 'node-fetch';
import HTMLParser from 'fast-html-parser';

import type {Serial} from '../Serial';

import {fetchDocument, serialize} from './util';

type FictionSite = 'fanfiction.net' | 'fictionpress.com';

export default function fanfiction(site: FictionSite, id: string): Serial {
    const source = 'https://www.' + site + '/s/' + id;
    return async function() {
        const response = await fetch(source);
        const html = await response.text();
        const mainPage = HTMLParser.parse(html, {lowerCaseTagName: true});
        // This extraction logic seems fragile, maybe can be improved
        const title = mainPage.querySelector('#profile_top b.xcontrast_txt').rawText;
        const author = mainPage.querySelector('#profile_top a.xcontrast_txt').rawText;
        const description = mainPage.querySelector('#profile_top div.xcontrast_txt').rawText;
        const chapterSelect = mainPage.querySelector('#chap_select');
        const options = chapterSelect.querySelectorAll('option');
        return {
            title,
            author,
            source,
            description,
            chapters: options.map((option) => (async () => {
                const page = await fetchDocument(source + '/' + option.attributes['value']);
                const contentNode = page.querySelector('div.storytext');
                const text = [];
                let onTitle = true;
                for (let child of contentNode.childNodes) {
                    if (onTitle && child.querySelector('strong')) {
                        continue;
                    }
                    onTitle = false;
                    text.push(serialize(child).trim());
                }
                return {title: option.text, text: text.join('')};
            })),
        };
    };
}
