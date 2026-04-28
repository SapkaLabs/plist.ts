# plist.ts

A modern ESM TypeScript library for parsing, building and validating Apple Property List (plist) documents.

Intended as a TypeScript-first, ESM-native successor to [TooTallNate/plist.js](https://github.com/TooTallNate/plist.js).

## Packages

| Package | Description |
|---------|-------------|
| [`@sapkalabs/plist.ts`](./packages/plist.ts) | The core plist library |
| [`@sapkalabs/plist.ts-demo`](./apps/demo) | Demo / playground app |

## Getting started

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run all tests
npm test

# Lint all packages
npm run lint
```

## Library API (planned)

```ts
import { parse, build } from '@sapkalabs/plist.ts';

// Parse a plist XML string into a JavaScript value
const value = parse('<plist version="1.0"><string>Hello</string></plist>');
console.log(value); // "Hello"

// Serialize a JavaScript value back to plist XML
const xml = build({ greeting: 'Hello', count: 42 });
console.log(xml);
```

## License

MIT
