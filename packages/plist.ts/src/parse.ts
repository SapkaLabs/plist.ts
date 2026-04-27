import type { ParseOptions, PlistValue } from './types.js';

/**
 * Parses an Apple Property List XML string and returns the root value.
 *
 * @param xml - A UTF-8 plist XML string.
 * @param options - Optional parse configuration.
 * @returns The root {@link PlistValue} represented by the plist document.
 *
 * @example
 * ```ts
 * import { parse } from '@sapkalabs/plist.ts';
 *
 * const value = parse('<plist version="1.0"><string>Hello</string></plist>');
 * console.log(value); // "Hello"
 * ```
 *
 * @throws {Error} If the input is not a valid plist XML document.
 */
export function parse(xml: string, _options?: ParseOptions): PlistValue {
  void xml;
  throw new Error('parse() is not yet implemented');
}
