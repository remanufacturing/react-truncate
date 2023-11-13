<!-- https://github.com/pablosichert/react-show-more/blob/master/README.md -->

# React Show More

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Coverage status][coveralls-image]][coveralls-url]
[![Dependency status][david-dm-image]][david-dm-url]
[![Dev dependency status][david-dm-dev-image]][david-dm-dev-url]

This is a convenience wrapper around [react-truncate](https://github.com/One-com/react-truncate).

## Install

```
$ npm install react-show-more
```

## Usage

```js
import ShowMore from 'react-show-more';

// ...

class Foo extends Component {
    render() {
        return (
            <ShowMore
                {* Default options *}
                lines={3}
                more='Show more'
                less='Show less'
                anchorClass=''
            >
                {longText}
            </ShowMore>
        );
    }
}
```

## API

| Prop        | Type                     | Default     | Description                                                                                                                                                   | Example                                                                                                                       |
| ----------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| lines       | integer, boolean {false} | 3           | Specifies how many lines of text should be preserved until it gets truncated. `false` and any integer < 1 will result in the text not getting clipped at all. | (`false`, `-1`, `0`), `1`, ...                                                                                                |
| children    | string, React node       |             | The text to be truncated. Anything that can be evaluated as text.                                                                                             | `'Some text'`, `<p>Some paragraph <a/>with other text-based inline elements<a></p>`, `<span>Some</span><span>siblings</span>` |
| more        | string, React node       | 'Show more' | The text to display in the anchor element to show more.                                                                                                       | `'Show more'`, `<span>Show more</span>`                                                                                       |
| less        | string, React node       | 'Show less' | The text to display in the anchor element to show less.                                                                                                       | `'Show less'`, `<span>Show less</span>`                                                                                       |
| anchorClass | string                   | ''          | Class name(s) to add to the anchor elements.                                                                                                                  | `'my-anchor-class'`, `'class-1 class-2'`                                                                                      |

## Developing

Install development dependencies

```
$ npm install
```

Run tests

```
$ npm test
```

Run code linter

```
$ npm run lint
```

Compile to ES5 from /src to /lib

```
$ npm run compile
```

[npm-url]: https://npmjs.org/package/react-show-more
[downloads-image]: http://img.shields.io/npm/dm/react-show-more.svg
[npm-image]: https://badge.fury.io/js/react-show-more.svg
[travis-url]: https://travis-ci.org/One-com/react-show-more
[travis-image]: http://img.shields.io/travis/One-com/react-show-more.svg
[coveralls-url]: https://coveralls.io/r/One-com/react-show-more
[coveralls-image]: https://coveralls.io/repos/One-com/react-show-more/badge.svg
[david-dm-url]: https://david-dm.org/One-com/react-show-more
[david-dm-image]: https://david-dm.org/One-com/react-show-more.svg
[david-dm-dev-url]: https://david-dm.org/One-com/react-show-more#info=devDependencies
[david-dm-dev-image]: https://david-dm.org/One-com/react-show-more/dev-status.svg
