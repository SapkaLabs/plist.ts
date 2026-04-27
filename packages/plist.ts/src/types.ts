/**
 * Core type definitions for @sapkalabs/plist.ts
 *
 * A plist value can be any of the types below, mirroring Apple's Property List
 * specification.
 */

/** A dictionary / object node in a plist document. */
export type PlistDict = { [key: string]: PlistValue };

/** An array node in a plist document. */
export type PlistArray = PlistValue[];

/**
 * Union of every value type that can appear in a plist document.
 *
 * - `string`   — <string>
 * - `number`   — <integer> or <real>
 * - `boolean`  — <true> / <false>
 * - `Date`     — <date>
 * - `Buffer`   — <data> (binary data)
 * - `PlistDict` — <dict>
 * - `PlistArray` — <array>
 */
export type PlistValue =
  | string
  | number
  | boolean
  | Date
  | Buffer
  | PlistDict
  | PlistArray;

/** Options accepted by {@link parse}. */
export interface ParseOptions {
  /**
   * When `true`, integer values in `<integer>` nodes are parsed as `bigint`
   * instead of `number`.  Defaults to `false`.
   */
  bigIntegers?: boolean;
}

/** Options accepted by {@link build}. */
export interface BuildOptions {
  /**
   * Indentation string used when pretty-printing the XML output.
   * Pass an empty string `""` to disable indentation.
   * Defaults to `"\t"`.
   */
  indent?: string;
}
