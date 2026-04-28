import type { PlistDict, PlistValue } from './types.js';

export function isPlistDict(value: PlistValue): value is PlistDict {
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    value instanceof Date ||
    value instanceof Uint8Array
  ) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function assertPlistDict(value: PlistValue, label = 'value'): PlistDict {
  if (!isPlistDict(value)) {
    throw new Error(`Expected ${label} to be a plist dictionary`);
  }

  return value;
}

export function readPlistString(source: PlistDict, key: string): string {
  const value = source[key];

  if (typeof value !== 'string') {
    throw new Error(`Expected ${key} to be a plist string`);
  }

  return value;
}

export function readPlistStringArray(
  source: PlistDict,
  key: string,
  options: { allowSingle?: boolean } = {}
): string[] {
  const value = source[key];

  if (options.allowSingle === true && typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value) && value.every(isStringValue)) {
    return value;
  }

  throw new Error(`Expected ${key} to be a plist string array`);
}

export function readPlistDataArray(
  source: PlistDict,
  key: string
): Uint8Array[] {
  const value = source[key];

  if (Array.isArray(value) && value.every(isUint8ArrayValue)) {
    return value;
  }

  throw new Error(`Expected ${key} to be a plist data array`);
}

function isStringValue(value: PlistValue): value is string {
  return typeof value === 'string';
}

function isUint8ArrayValue(value: PlistValue): value is Uint8Array {
  return value instanceof Uint8Array;
}
