/* @flow */

// Represents a web serial
export type Serial = {
    title: string,
    author: string,
    source: string,
    description: ?string,
    contents: Array<Chapter>,
}

export type Chapter = {
    title: ?string,
    text: string,
}
