<p align='center'>
  <img src="./docs/public/logo.png" width="200" alt="@re-dev/react-truncate" />
</p>

<h1 align='center'>@re-dev/react-truncate</h1>

<p align='center'>
  <a href='https://www.npmjs.com/package/@re-dev/react-truncate'>
    <img src="https://img.shields.io/npm/v/@re-dev/react-truncate?color=29c1e9&label=npm" />
  </a>
  <a href="https://www.npmjs.com/package/@re-dev/react-truncate" target="__blank">
    <img src="https://img.shields.io/npm/dy/@re-dev/react-truncate?color=29c1e9&label=downloads" />
  </a>
  <a href="https://truncate.js.org" target="__blank">
    <img src="https://img.shields.io/static/v1?label=&message=docs%20%26%20demos&color=29c1e9" />
  </a>
  <a href="https://github.com/remanufacturing/react-truncate" target="__blank">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/remanufacturing/react-truncate?style=social" />
  </a>
</p>
<br>
<br>

[English](https://truncate.js.org) | [简体中文](https://truncate.js.org/zh/)

Provides `Truncate`, `MiddleTruncate` and `ShowMore` React components for truncating multi-line spans and adding an ellipsis.

## Installation

With npm(or yarn, or pnpm):

```bash
npm install @re-dev/react-truncate
```

## Documentation

- [Truncate](https://truncate.js.org/reference/truncate/)

A basic component for cropping text. Usually there is no need to use it directly. `<ShowMore />` and `<MiddleTruncate />` provided by this package are both extended based on this component.

- [ShowMore](https://truncate.js.org/reference/show-more/)

A "Show More" component, when the content exceeds the set number of display lines, an expand button will appear to view more content.

- [MiddleTruncate](https://truncate.js.org/reference/middle-truncate/)

A "middle ellipsis" component, when the content exceeds the limit of the parent's width, an ellipsis symbol will appear (similar to CSS's text-overflow: ellipsis effect), but its omission position can be specified in the middle of the text instead of the end.

## Release Notes

Please refer to [CHANGELOG](https://github.com/remanufacturing/react-truncate/blob/main/CHANGELOG.md) for details.

## License

MIT License © 2023-PRESENT [chengpeiquan](https://github.com/chengpeiquan)
