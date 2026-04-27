/**
 * @sapkalabs/plist.ts
 *
 * A modern ESM TypeScript library for parsing and building Apple Property List
 * (plist) documents.
 *
 * @example
 * ```ts
 * import { parse, build } from '@sapkalabs/plist.ts';
 *
 * const value = parse('<plist version="1.0"><string>Hello</string></plist>');
 * const xml = build({ greeting: 'Hello' });
 * ```
 */

export { build } from './build.js';
export { parse } from './parse.js';
export type {
  BuildOptions,
  ParseOptions,
  PlistArray,
  PlistDict,
  PlistValue,
} from './types.js';
