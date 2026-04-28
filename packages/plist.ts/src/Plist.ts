import { DOMParser } from '@xmldom/xmldom';
import xmlbuilder from 'xmlbuilder';

import type {
  BuildOptions,
  ParseOptions,
  PlistArray,
  PlistDict,
  PlistInputValue,
  PlistValue,
} from './types.js';

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const SKIP_VALUE = Symbol('skip plist value');

interface XmlNodeLike {
  readonly nodeName: string;
  readonly nodeType: number;
  readonly nodeValue: string | null;
  readonly childNodes?: ArrayLike<XmlNodeLike>;
}

interface XmlDocumentLike {
  readonly documentElement: XmlNodeLike | null;
}

interface XmlBuilderNode {
  dec(version: string, encoding: string): XmlBuilderNode;
  dtd(pubid: string, sysid: string): XmlBuilderNode;
  att(name: string, value: string): XmlBuilderNode;
  ele(name: string): XmlBuilderNode;
  txt(value: string): XmlBuilderNode;
  raw(value: string): XmlBuilderNode;
  end(options: BuildOptions): string;
}

type NormalizedValue = PlistValue | typeof SKIP_VALUE;

export class Plist {
  private static readonly TEXT_NODE = 3;
  private static readonly CDATA_NODE = 4;
  private static readonly COMMENT_NODE = 8;

  private constructor(private readonly value: PlistValue) {}

  static fromObject(value: PlistInputValue): Plist {
    const normalized = Plist.normalizeInput(value);

    if (normalized === SKIP_VALUE) {
      throw new Error('Cannot create a plist from undefined.');
    }

    return new Plist(normalized);
  }

  static fromText(xml: string, options: ParseOptions = {}): Plist {
    Plist.invariant(
      xml.trim().length > 0,
      'Malformed document. First element should be <plist>.'
    );

    const doc = new DOMParser().parseFromString(
      xml,
      'text/xml'
    ) as unknown as XmlDocumentLike;
    const root = doc.documentElement;

    Plist.invariant(
      root?.nodeName === 'plist',
      'Malformed document. First element should be <plist>.'
    );

    const parsed = Plist.parsePlistNode(root, options);

    if (Array.isArray(parsed) && parsed.length === 1) {
      const rootValue = parsed[0];
      Plist.invariant(rootValue !== undefined, 'Malformed plist document.');
      return new Plist(rootValue);
    }

    return new Plist(parsed);
  }

  toObject(): PlistValue {
    return Plist.cloneValue(this.value);
  }

  toText(options: BuildOptions = {}): string {
    const doc = xmlbuilder.create('plist') as unknown as XmlBuilderNode;

    doc.dec('1.0', 'UTF-8');
    doc.dtd(
      '-//Apple//DTD PLIST 1.0//EN',
      'http://www.apple.com/DTDs/PropertyList-1.0.dtd'
    );
    doc.att('version', '1.0');

    Plist.appendValue(this.value, doc);

    return doc.end({
      pretty: options.pretty !== false,
      indent: options.indent,
      newline: options.newline,
    });
  }

  private static parsePlistNode(
    node: XmlNodeLike,
    options: ParseOptions
  ): PlistValue {
    switch (node.nodeName) {
      case 'plist':
        return Plist.parseArrayLikeNode(node, options);
      case 'dict':
        return Plist.parseDict(node, options);
      case 'array':
        return Plist.parseArrayLikeNode(node, options);
      case 'key':
        return Plist.parseKey(node);
      case 'string':
        return Plist.readText(node, true);
      case 'integer':
        return Plist.parseInteger(node, options);
      case 'real':
        return Plist.parseReal(node);
      case 'data':
        return base64ToUint8Array(Plist.readText(node, false));
      case 'date':
        return Plist.parseDate(node);
      case 'null':
        return null;
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        throw new Error(`Invalid PLIST tag ${node.nodeName}.`);
    }
  }

  private static parseArrayLikeNode(
    node: XmlNodeLike,
    options: ParseOptions
  ): PlistArray {
    const values: PlistArray = [];

    for (const child of Plist.getChildNodes(node)) {
      if (!Plist.shouldIgnoreNode(child)) {
        values.push(Plist.parsePlistNode(child, options));
      }
    }

    return values;
  }

  private static parseDict(
    node: XmlNodeLike,
    options: ParseOptions
  ): PlistDict {
    const dict: PlistDict = {};
    let key: string | null = null;

    for (const child of Plist.getChildNodes(node)) {
      if (Plist.shouldIgnoreNode(child)) {
        continue;
      }

      if (key === null) {
        Plist.invariant(
          child.nodeName === 'key',
          'Missing key while parsing <dict/>.'
        );
        key = Plist.parseKey(child);
      } else {
        Plist.invariant(
          child.nodeName !== 'key',
          `Unexpected key "${Plist.parseKey(child)}" while parsing <dict/>.`
        );
        dict[key] = Plist.parsePlistNode(child, options);
        key = null;
      }
    }

    if (key !== null) {
      dict[key] = '';
    }

    return dict;
  }

  private static parseKey(node: XmlNodeLike): string {
    const key = Plist.readText(node, true);

    Plist.invariant(
      key !== '__proto__',
      '__proto__ keys can lead to prototype pollution. More details on CVE-2022-22912.'
    );

    return key;
  }

  private static parseInteger(
    node: XmlNodeLike,
    options: ParseOptions
  ): number | bigint {
    const text = Plist.readText(node, false).trim();

    Plist.invariant(text.length > 0, 'Cannot parse "" as integer.');

    if (options.bigIntegers) {
      try {
        return BigInt(text);
      } catch {
        throw new Error(`Cannot parse "${text}" as integer.`);
      }
    }

    const value = Number.parseInt(text, 10);
    Plist.invariant(!Number.isNaN(value), `Cannot parse "${text}" as integer.`);
    return value;
  }

  private static parseReal(node: XmlNodeLike): number {
    const text = Plist.readText(node, false).trim();

    Plist.invariant(text.length > 0, 'Cannot parse "" as real.');

    const value = Number.parseFloat(text);
    Plist.invariant(!Number.isNaN(value), `Cannot parse "${text}" as real.`);
    return value;
  }

  private static parseDate(node: XmlNodeLike): Date {
    const text = Plist.readText(node, false).trim();

    Plist.invariant(text.length > 0, 'Cannot parse "" as Date.');

    const value = new Date(text);
    Plist.invariant(
      !Number.isNaN(value.getTime()),
      `Cannot parse "${text}" as Date.`
    );
    return value;
  }

  private static appendValue(value: PlistValue, parent: XmlBuilderNode): void {
    if (Array.isArray(value)) {
      const array = parent.ele('array');

      for (const item of value) {
        Plist.appendValue(item, array);
      }

      return;
    }

    if (value instanceof Uint8Array) {
      parent.ele('data').raw(uint8ArrayToBase64(value));
      return;
    }

    if (value instanceof Date) {
      Plist.invariant(
        !Number.isNaN(value.getTime()),
        'Cannot serialize an invalid Date.'
      );
      parent.ele('date').txt(toPlistDate(value));
      return;
    }

    switch (typeof value) {
      case 'object': {
        if (value === null) {
          parent.ele('null').txt('');
          return;
        }

        const dict = parent.ele('dict');

        for (const key of Object.keys(value)) {
          const child = value[key];

          if (child === undefined) {
            continue;
          }

          dict.ele('key').txt(key);
          Plist.appendValue(child, dict);
        }

        return;
      }
      case 'number': {
        Plist.invariant(
          Number.isFinite(value),
          `Cannot serialize non-finite number ${String(value)}.`
        );
        parent
          .ele(Number.isInteger(value) ? 'integer' : 'real')
          .txt(value.toString());
        return;
      }
      case 'bigint':
        parent.ele('integer').txt(value.toString());
        return;
      case 'boolean':
        parent.ele(value ? 'true' : 'false');
        return;
      case 'string':
        parent.ele('string').txt(value);
        return;
      default:
        throw new Error(`Unsupported plist value type: ${typeof value}.`);
    }
  }

  private static normalizeInput(value: PlistInputValue): NormalizedValue {
    if (value === undefined) {
      return SKIP_VALUE;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint' ||
      value === null
    ) {
      return value;
    }

    if (typeof value === 'number') {
      Plist.invariant(
        Number.isFinite(value),
        `Cannot create a plist value from non-finite number ${String(value)}.`
      );
      return value;
    }

    if (value instanceof Date) {
      Plist.invariant(
        !Number.isNaN(value.getTime()),
        'Cannot create a plist value from an invalid Date.'
      );
      return new Date(value.getTime());
    }

    if (value instanceof ArrayBuffer) {
      return new Uint8Array(value.slice(0));
    }

    if (ArrayBuffer.isView(value)) {
      const bytes = new Uint8Array(
        value.buffer,
        value.byteOffset,
        value.byteLength
      );
      return new Uint8Array(bytes);
    }

    if (Array.isArray(value)) {
      const array: PlistArray = [];

      for (const item of value) {
        const normalized = Plist.normalizeInput(item);

        if (normalized !== SKIP_VALUE) {
          array.push(normalized);
        }
      }

      return array;
    }

    if (Plist.isPlainObject(value)) {
      const dict: PlistDict = {};

      for (const key of Object.keys(value)) {
        Plist.invariant(
          key !== '__proto__',
          '__proto__ keys can lead to prototype pollution. More details on CVE-2022-22912.'
        );

        const normalized = Plist.normalizeInput(value[key]);

        if (normalized !== SKIP_VALUE) {
          dict[key] = normalized;
        }
      }

      return dict;
    }

    throw new Error(
      `Unsupported plist value type: ${Object.prototype.toString.call(value)}.`
    );
  }

  private static cloneValue(value: PlistValue): PlistValue {
    if (Array.isArray(value)) {
      return value.map((item) => Plist.cloneValue(item));
    }

    if (value instanceof Uint8Array) {
      return new Uint8Array(value);
    }

    if (value instanceof Date) {
      return new Date(value.getTime());
    }

    if (value !== null && typeof value === 'object') {
      const dict: PlistDict = {};

      for (const key of Object.keys(value)) {
        const child = value[key];

        if (child !== undefined) {
          dict[key] = Plist.cloneValue(child);
        }
      }

      return dict;
    }

    return value;
  }

  private static readText(node: XmlNodeLike, includeCdata: boolean): string {
    let text = '';

    for (const child of Plist.getChildNodes(node)) {
      if (
        child.nodeType === Plist.TEXT_NODE ||
        (includeCdata && child.nodeType === Plist.CDATA_NODE)
      ) {
        text += child.nodeValue ?? '';
      }
    }

    return text;
  }

  private static getChildNodes(node: XmlNodeLike): XmlNodeLike[] {
    return Array.from(node.childNodes ?? []);
  }

  private static shouldIgnoreNode(node: XmlNodeLike): boolean {
    return (
      node.nodeType === Plist.TEXT_NODE ||
      node.nodeType === Plist.COMMENT_NODE ||
      node.nodeType === Plist.CDATA_NODE
    );
  }

  private static isPlainObject(
    value: unknown
  ): value is Record<string, PlistInputValue> {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  private static invariant(test: boolean, message: string): asserts test {
    if (!test) {
      throw new Error(message);
    }
  }
}

function toPlistDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
    date.getUTCSeconds()
  )}Z`;
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : value.toString();
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = index + 1 < bytes.length ? (bytes[index + 1] ?? 0) : 0;
    const third = index + 2 < bytes.length ? (bytes[index + 2] ?? 0) : 0;
    const triplet = (first << 16) | (second << 8) | third;

    output += BASE64_ALPHABET.charAt((triplet >> 18) & 0x3f);
    output += BASE64_ALPHABET.charAt((triplet >> 12) & 0x3f);
    output +=
      index + 1 < bytes.length
        ? BASE64_ALPHABET.charAt((triplet >> 6) & 0x3f)
        : '=';
    output +=
      index + 2 < bytes.length ? BASE64_ALPHABET.charAt(triplet & 0x3f) : '=';
  }

  return output;
}

function base64ToUint8Array(input: string): Uint8Array {
  const value = input.replace(/\s+/g, '');

  if (value.length === 0) {
    return new Uint8Array(0);
  }

  if (value.length % 4 !== 0) {
    throw new Error('Invalid base64 data length.');
  }

  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  const output = new Uint8Array((value.length / 4) * 3 - padding);
  let outputIndex = 0;

  for (let index = 0; index < value.length; index += 4) {
    const first = decodeBase64Char(value.charAt(index));
    const second = decodeBase64Char(value.charAt(index + 1));
    const third =
      value.charAt(index + 2) === '='
        ? 0
        : decodeBase64Char(value.charAt(index + 2));
    const fourth =
      value.charAt(index + 3) === '='
        ? 0
        : decodeBase64Char(value.charAt(index + 3));
    const triplet = (first << 18) | (second << 12) | (third << 6) | fourth;

    if (outputIndex < output.length) {
      output[outputIndex] = (triplet >> 16) & 0xff;
      outputIndex += 1;
    }

    if (outputIndex < output.length) {
      output[outputIndex] = (triplet >> 8) & 0xff;
      outputIndex += 1;
    }

    if (outputIndex < output.length) {
      output[outputIndex] = triplet & 0xff;
      outputIndex += 1;
    }
  }

  return output;
}

function decodeBase64Char(char: string): number {
  const value = BASE64_ALPHABET.indexOf(char);

  if (value === -1) {
    throw new Error(`Invalid base64 character "${char}".`);
  }

  return value;
}
