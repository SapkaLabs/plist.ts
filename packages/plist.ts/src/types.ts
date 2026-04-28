/** A normalized dictionary / object node in a plist document. */
export type PlistDict = { [key: string]: PlistValue };

/** A normalized array node in a plist document. */
export type PlistArray = PlistValue[];

/** Values returned by parsed plist documents and stored by {@link Plist}. */
export type PlistValue =
  | string
  | number
  | bigint
  | boolean
  | Date
  | null
  | Uint8Array
  | PlistDict
  | PlistArray;

/** Input dictionaries accepted by {@link Plist.fromObject}. */
export type PlistInputDict = { [key: string]: PlistInputValue };

/** Input arrays accepted by {@link Plist.fromObject}. */
export type PlistInputArray = PlistInputValue[];

/** Values accepted by {@link Plist.fromObject} before normalization. */
export type PlistInputValue =
  | string
  | number
  | bigint
  | boolean
  | Date
  | null
  | undefined
  | Uint8Array
  | ArrayBuffer
  | ArrayBufferView
  | PlistInputDict
  | PlistInputArray;

/** Options accepted by {@link Plist.fromText}. */
export interface ParseOptions {
  /**
   * When true, integer values in <integer> nodes are parsed as bigint instead
   * of number. Defaults to false.
   */
  bigIntegers?: boolean;
}

/** Options accepted by {@link Plist.toText}. */
export interface BuildOptions {
  /** Whether to pretty-print the XML output. Defaults to true. */
  pretty?: boolean;

  /** Indentation string used when pretty-printing XML. */
  indent?: string;

  /** Newline string used when pretty-printing XML. */
  newline?: string;
}
