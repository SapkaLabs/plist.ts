# plist.ts

TypeScript-first Apple property list parser, serializer, and validator for modern ESM Node.js projects.

[![npm version](https://img.shields.io/npm/v/%40sapkalabs%2Fplist.ts?logo=npm)](https://www.npmjs.com/package/@sapkalabs/plist.ts)
[![npm downloads](https://img.shields.io/npm/dm/%40sapkalabs%2Fplist.ts?logo=npm)](https://www.npmjs.com/package/@sapkalabs/plist.ts)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

`@sapkalabs/plist.ts` helps Node.js and TypeScript projects read, write, and validate Apple plist XML used by `Info.plist`, entitlements files, `ExportOptions.plist`, Xcode automation, and similar build tooling.

## Why this package?

- ESM-native and TypeScript-first for modern Node.js projects.
- Parses plist XML into JavaScript values.
- Serializes JavaScript values back to plist XML.
- Provides typed helpers for safer plist dictionary access.
- Fits iOS/macOS automation, CI scripts, signing workflows, and plist processing tasks.

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

Use `@sapkalabs/plist.ts` when you need to:

- read or generate `Info.plist` values in Node.js build tooling
- validate expected keys in entitlements or export option plists
- transform plist XML in React Native or iOS CI/CD pipelines
- work with plist payloads extracted from provisioning-related data
- adopt a TypeScript-friendly, ESM-native alternative to older plist packages

## Reading parsed values safely

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

These helpers are useful when parsed plist data must contain required keys with known value types.

## API overview

- `Plist.fromText(xml, options?)` parses plist XML text.
- `Plist.fromObject(value)` creates a plist document from supported JavaScript values.
- `plist.toObject()` returns a defensive copy of the normalized plist value.
- `plist.toText(options?)` serializes the value back to plist XML.
- `isPlistDict(value)` narrows a parsed value to a plist dictionary.
- `assertPlistDict(value, label?)` returns a plist dictionary or throws.
- `readPlistString(source, key)` reads a required string field.
- `readPlistStringArray(source, key, options?)` reads a required string array.
- `readPlistDataArray(source, key)` reads a required `Uint8Array` array.

Supported values include strings, finite numbers, bigints, booleans, dates, `null`, arrays, plain objects, `Uint8Array`, `ArrayBuffer`, and typed-array views.

## Supported runtime / module format

- Node.js `>=20`
- ESM package output (`"type": "module"`)
- Bundled TypeScript types

This package is aimed at modern ESM Node.js codebases. If you need broad legacy CommonJS compatibility, an older plist package may be a better fit.

## Comparison with `plist` / `plist.js`

`@sapkalabs/plist.ts` is designed for modern TypeScript and ESM-first projects.

- TypeScript-first API surface with exported types and typed helpers.
- ESM-native packaging for current Node.js tooling.
- Focus on Apple plist automation use cases such as `Info.plist`, entitlements, and build pipeline processing.
- Defensive helpers for reading parsed dictionary values safely.

Older packages such as `plist` and `plist.js` remain useful, especially when you need established CommonJS-oriented compatibility. This package is the better fit when your project is already centered on TypeScript and modern ESM workflows.

## Development

```bash
yarn install --immutable
yarn build
yarn test
yarn lint
yarn typecheck
```

## License

MIT
