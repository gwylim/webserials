// @flow

import HTMLParser from 'fast-html-parser';
import fetch from 'node-fetch';

export async function fetchDocument(uri: string) {
  const response = await fetch(uri);
  const html = await response.text();
  return HTMLParser.parse(html);
}

type Node = {tagName: ?string, rawText: string, childNodes: ?Array<Node>};

export function serialize(node: Node): string {
  if (node.tagName == null) {
    return node.rawText;
  }
  if (node.childNodes == null) {
    throw "Node has tagName but no children";
  }
  let result = '<' + node.tagName + '>';
  for (let child of node.childNodes) {
    result += serialize(child);
  }
  result += '</' + node.tagName + '>';
  return result;
}
