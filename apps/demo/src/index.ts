/**
 * Demo for @sapkalabs/plist.ts
 *
 * This file demonstrates the class-based public API of the library.
 */

import { Plist } from "@sapkalabs/plist.ts";

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

console.log("=== @sapkalabs/plist.ts demo ===\n");

try {
  const parsed = Plist.fromText(sampleXml).toObject();
  console.log("Parsed value:", parsed);

  const rebuilt = Plist.fromObject(parsed).toText();
  console.log("\nRebuilt XML:\n", rebuilt);
} catch (err) {
  if (err instanceof Error) {
    console.error("Failed:", err.message);
  }
}
