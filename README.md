# plist.ts

A modern ESM TypeScript library for parsing, building and validating Apple Property List (plist) documents.

Intended as a TypeScript-first, ESM-native successor to [TooTallNate/plist.js](https://github.com/TooTallNate/plist.js).

## Packages

| Package                                      | Description            |
| -------------------------------------------- | ---------------------- |
| [`@sapkalabs/plist.ts`](./packages/plist.ts) | The core plist library |
| [`@sapkalabs/plist.ts-demo`](./apps/demo)    | Demo / playground app  |

## Getting started

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run all tests
yarn test

# Lint all packages
yarn lint
```

## Library API

```ts
import { Plist } from "@sapkalabs/plist.ts";

// Parse a plist XML string into a JavaScript value.
const value = Plist.fromText(
  '<plist version="1.0"><string>Hello</string></plist>',
).toObject();
console.log(value); // "Hello"

// Serialize a JavaScript value back to plist XML.
const xml = Plist.fromObject({ greeting: "Hello", count: 42 }).toText();
console.log(xml);
```

## License

MIT
