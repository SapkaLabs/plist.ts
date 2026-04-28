# @sapkalabs/plist.ts

TypeScript-first Apple property list parser, serializer, and validator for modern ESM Node.js projects.

[![npm version](https://img.shields.io/npm/v/%40sapkalabs%2Fplist.ts?logo=npm)](https://www.npmjs.com/package/@sapkalabs/plist.ts)
[![npm downloads](https://img.shields.io/npm/dm/%40sapkalabs%2Fplist.ts?logo=npm)](https://www.npmjs.com/package/@sapkalabs/plist.ts)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/SapkaLabs/plist.ts/blob/main/LICENSE)

`@sapkalabs/plist.ts` parses Apple plist XML into JavaScript values, serializes JavaScript values back to plist XML, and provides typed helpers for safer dictionary reads in build tools and automation scripts.

## Why this package?

- TypeScript-first API for modern Node.js projects.
- ESM-native package output.
- Useful for `Info.plist`, entitlements, `ExportOptions.plist`, and similar Apple tooling files.
- Helpful guard and reader utilities for validating parsed dictionaries.

## Installation

```bash
yarn add @sapkalabs/plist.ts
```

```bash
npm install @sapkalabs/plist.ts
```

## Quick start

```ts
import { Plist } from '@sapkalabs/plist.ts';

const value = Plist.fromText(`
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>CFBundleIdentifier</key>
    <string>com.example.app</string>
  </dict>
</plist>
`).toObject();

const xml = Plist.fromObject({
  CFBundleIdentifier: 'com.example.app',
  CFBundleVersion: '1',
}).toText();
```

## Common use cases

- generate or update `Info.plist` values
- inspect entitlements and export option plists in CI
- process plist XML extracted from provisioning-related workflows
- replace older plist libraries in ESM-first TypeScript projects

## Reading parsed values safely

```ts
import {
  Plist,
  assertPlistDict,
  readPlistString,
  readPlistStringArray,
} from '@sapkalabs/plist.ts';

const root = assertPlistDict(Plist.fromText(xml).toObject(), 'plist root');
const bundleId = readPlistString(root, 'CFBundleIdentifier');
const teamIds = readPlistStringArray(root, 'TeamIdentifier', {
  allowSingle: true,
});
```

## API overview

- `Plist.fromText(xml, options?)`
- `Plist.fromObject(value)`
- `plist.toObject()`
- `plist.toText(options?)`
- `isPlistDict(value)`
- `assertPlistDict(value, label?)`
- `readPlistString(source, key)`
- `readPlistStringArray(source, key, options?)`
- `readPlistDataArray(source, key)`

## Supported runtime / module format

- Node.js `>=20`
- ESM-only package
- Bundled TypeScript types

## How is this different from `plist` / `plist.js`?

This package targets modern TypeScript and ESM-first projects, with typed helpers for Apple plist automation workflows. If you need wider legacy CommonJS compatibility, older packages may still be the better choice.

## Development

See the repository root README for workspace commands and contributor guidance: https://github.com/SapkaLabs/plist.ts#development

## License

MIT
