/* @flow */

// Represents a web serial
export type Serial = () => Promise<{
    title: string,
    author: string,
    source: string,
    description: ?string,
    chapters: Array<() => Promise<Chapter>>,
}>;

export type Chapter = {
    title: ?string,
    text: string,
};
