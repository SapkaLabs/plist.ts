import type { BuildOptions, PlistValue } from './types.js';

/**
 * Serializes a JavaScript value into an Apple Property List XML string.
 *
 * @param value - The value to serialise. Must be a {@link PlistValue}.
 * @param options - Optional build configuration.
 * @returns A UTF-8 plist XML string.
 *
 * @example
 * ```ts
 * import { build } from '@sapkalabs/plist.ts';
 *
 * const xml = build({ key: 'value' });
 * console.log(xml);
 * // <?xml version="1.0" encoding="UTF-8"?>
 * // <!DOCTYPE plist PUBLIC …>
 * // <plist version="1.0">
 * //   <dict> … </dict>
 * // </plist>
 * ```
 *
 * @throws {Error} If the value contains a type that cannot be serialised.
 */
export function build(value: PlistValue, _options?: BuildOptions): string {
  void value;
  throw new Error('build() is not yet implemented');
}
