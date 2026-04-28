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

## Reading parsed values

```ts
import {
  Plist,
  assertPlistDict,
  readPlistDataArray,
  readPlistString,
  readPlistStringArray,
} from '@sapkalabs/plist.ts';

const root = assertPlistDict(
  Plist.fromText(xml).toObject(),
  'provisioning profile'
);

const uuid = readPlistString(root, 'UUID');
const teams = readPlistStringArray(root, 'TeamIdentifier', {
  allowSingle: true,
});
const certificates = readPlistDataArray(root, 'DeveloperCertificates');
```

## API

- `Plist.fromText(xml, options?)` parses XML plist text.
- `Plist.fromObject(value)` creates a plist from a supported JavaScript value.
- `plist.toObject()` returns a defensive copy of the normalized value.
- `plist.toText(options?)` serializes the value to plist XML.
- `isPlistDict(value)` narrows parsed values to dictionaries.
- `assertPlistDict(value, label?)` returns a dictionary or throws a clear error.
- `readPlistString(source, key)` reads a required string property.
- `readPlistStringArray(source, key, options?)` reads a required string array.
- `readPlistDataArray(source, key)` reads a required `Uint8Array` array.

Supported values are strings, finite numbers, bigints, booleans, dates, null,
arrays, plain objects, `Uint8Array`, `ArrayBuffer`, and typed-array views.

## License

MIT
