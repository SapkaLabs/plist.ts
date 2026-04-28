/**
 * Demo for @sapkalabs/plist.ts
 *
 * This file demonstrates the intended public API of the library.
 * The functions below will throw "not yet implemented" until the core plist
 * logic is added to packages/plist.ts.
 */

import { build, parse } from '@sapkalabs/plist.ts';

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>name</key>
    <string>plist.ts</string>
    <key>version</key>
    <string>0.1.0</string>
    <key>stable</key>
    <false/>
  </dict>
</plist>`;

console.log('=== @sapkalabs/plist.ts demo ===\n');

try {
  const parsed = parse(sampleXml);
  console.log('Parsed value:', parsed);

  const rebuilt = build(parsed);
  console.log('\nRebuilt XML:\n', rebuilt);
} catch (err) {
  if (err instanceof Error) {
    console.log('Expected during development:', err.message);
  }
}
