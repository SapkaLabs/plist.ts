# @sapkalabs/plist.ts

A modern ESM TypeScript library for parsing and building Apple Property List
(plist) XML documents.

## Install

```bash
yarn add @sapkalabs/plist.ts
```

```bash
npm install @sapkalabs/plist.ts
```

## Usage

```ts
import { Plist } from '@sapkalabs/plist.ts';

const plist = Plist.fromText(
  '<plist version="1.0"><dict><key>name</key><string>plist.ts</string></dict></plist>'
);

const value = plist.toObject();
const xml = Plist.fromObject({ name: 'plist.ts', count: 42 }).toText();
```

## API

- `Plist.fromText(xml, options?)` parses XML plist text.
- `Plist.fromObject(value)` creates a plist from a supported JavaScript value.
- `plist.toObject()` returns a defensive copy of the normalized value.
- `plist.toText(options?)` serializes the value to plist XML.

Supported values are strings, finite numbers, bigints, booleans, dates, null,
arrays, plain objects, `Uint8Array`, `ArrayBuffer`, and typed-array views.

## License

MIT
