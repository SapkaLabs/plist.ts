import { describe, expect, it } from '@jest/globals';
import * as api from '@sapkalabs/plist.ts';
import {
  Plist,
  assertPlistDict,
  isPlistDict,
  readPlistDataArray,
  readPlistString,
  readPlistStringArray,
  type PlistDict,
  type PlistValue,
} from '@sapkalabs/plist.ts';

function plistFixture(xml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">${xml}</plist>`;
}

function parseFixture(xml: string) {
  return Plist.fromText(plistFixture(xml)).toObject();
}

describe('@sapkalabs/plist.ts public API', () => {
  it('exports the Plist class without top-level parse/build wrappers', () => {
    const exports = api as Record<string, unknown>;

    expect(typeof api.Plist).toBe('function');
    expect(typeof Plist.fromObject).toBe('function');
    expect(typeof Plist.fromText).toBe('function');
    expect(typeof api.isPlistDict).toBe('function');
    expect(typeof api.assertPlistDict).toBe('function');
    expect(typeof api.readPlistString).toBe('function');
    expect(typeof api.readPlistStringArray).toBe('function');
    expect(typeof api.readPlistDataArray).toBe('function');
    expect(exports.parse).toBeUndefined();
    expect(exports.build).toBeUndefined();
  });
});

describe('plist guard and reader helpers', () => {
  describe('isPlistDict()', () => {
    it('accepts only plain plist dictionaries', () => {
      expect(isPlistDict({})).toBe(true);
      expect(isPlistDict(null)).toBe(false);
      expect(isPlistDict([])).toBe(false);
      expect(isPlistDict(new Date())).toBe(false);
      expect(isPlistDict(new Uint8Array())).toBe(false);
    });
  });

  describe('assertPlistDict()', () => {
    it('returns valid dictionaries', () => {
      const value: PlistValue = { name: 'plist.ts' };

      expect(assertPlistDict(value)).toBe(value);
    });

    it('throws on invalid values with a clear label', () => {
      expect(() => assertPlistDict([], 'root')).toThrow(
        'Expected root to be a plist dictionary'
      );
      expect(() => assertPlistDict(null)).toThrow(
        'Expected value to be a plist dictionary'
      );
    });
  });

  describe('readPlistString()', () => {
    it('returns string values', () => {
      expect(readPlistString({ name: 'plist.ts' }, 'name')).toBe('plist.ts');
    });

    it('throws when the value is missing or not a string', () => {
      expect(() => readPlistString({ name: 1 }, 'name')).toThrow(
        'Expected name to be a plist string'
      );
      expect(() => readPlistString({}, 'name')).toThrow(
        'Expected name to be a plist string'
      );
    });
  });

  describe('readPlistStringArray()', () => {
    it('returns arrays of strings', () => {
      expect(readPlistStringArray({ names: ['a', 'b'] }, 'names')).toEqual([
        'a',
        'b',
      ]);
    });

    it('accepts single strings only when allowSingle is true', () => {
      expect(
        readPlistStringArray({ names: 'a' }, 'names', { allowSingle: true })
      ).toEqual(['a']);
      expect(() => readPlistStringArray({ names: 'a' }, 'names')).toThrow(
        'Expected names to be a plist string array'
      );
    });

    it('throws for mixed arrays', () => {
      expect(() => readPlistStringArray({ names: ['a', 1] }, 'names')).toThrow(
        'Expected names to be a plist string array'
      );
    });
  });

  describe('readPlistDataArray()', () => {
    it('returns arrays of Uint8Array values', () => {
      const data = [new Uint8Array([1]), new Uint8Array([2])];

      expect(readPlistDataArray({ data }, 'data')).toBe(data);
    });

    it('throws for mixed arrays', () => {
      expect(() =>
        readPlistDataArray({ data: [new Uint8Array([1]), 'not data'] }, 'data')
      ).toThrow('Expected data to be a plist data array');
    });
  });
});

describe('Plist.fromObject().toText()', () => {
  it('creates a plist XML string from a string', () => {
    expect(Plist.fromObject('test').toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <string>test</string>
</plist>`);
  });

  it('creates a plist XML integer from a whole number', () => {
    expect(Plist.fromObject(3).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <integer>3</integer>
</plist>`);
  });

  it('creates a plist XML real from a fractional number', () => {
    expect(Plist.fromObject(Math.PI).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <real>3.141592653589793</real>
</plist>`);
  });

  it('creates a plist XML integer from a bigint', () => {
    expect(Plist.fromObject(BigInt('0x1fffffffffffff')).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <integer>9007199254740991</integer>
</plist>`);
  });

  it('creates a plist XML date from a Date without milliseconds', () => {
    expect(Plist.fromObject(new Date('2010-02-08T21:41:23.456Z')).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <date>2010-02-08T21:41:23Z</date>
</plist>`);
  });

  it('creates a plist XML data node from a Uint8Array', () => {
    expect(Plist.fromObject(new TextEncoder().encode('snow')).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <data>c25vdw==</data>
</plist>`);
  });

  it('creates a plist XML data node from an ArrayBuffer view', () => {
    const source = new Uint8Array([0, 1, 2, 3, 4]);
    const view = new DataView(source.buffer, 1, 3);

    expect(Plist.fromObject(view).toText()).toContain('<data>AQID</data>');
  });

  it('creates plist XML booleans', () => {
    expect(Plist.fromObject(true).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <true/>
</plist>`);

    expect(Plist.fromObject(false).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <false/>
</plist>`);
  });

  it('creates a plist XML dict from an object', () => {
    expect(Plist.fromObject({ foo: 'bar' }).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>foo</key>
    <string>bar</string>
  </dict>
</plist>`);
  });

  it('creates a plist XML array from an array', () => {
    expect(Plist.fromObject([1, 'foo', false, new Date(1234)]).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <array>
    <integer>1</integer>
    <string>foo</string>
    <false/>
    <date>1970-01-01T00:00:01Z</date>
  </array>
</plist>`);
  });

  it('properly encodes empty strings and null values', () => {
    expect(Plist.fromObject({ a: '', b: null }).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>a</key>
    <string/>
    <key>b</key>
    <null/>
  </dict>
</plist>`);
  });

  it('skips undefined object properties and array entries', () => {
    expect(Plist.fromObject({ a: undefined, b: [1, undefined, 2] }).toText())
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>b</key>
    <array>
      <integer>1</integer>
      <integer>2</integer>
    </array>
  </dict>
</plist>`);
  });

  it('throws for root undefined and unsupported values', () => {
    expect(() => Plist.fromObject(undefined)).toThrow(
      'Cannot create a plist from undefined.'
    );
    expect(() => Plist.fromObject(Number.NaN)).toThrow('non-finite number');
    expect(() => Plist.fromObject({ callback: () => 'nope' } as never)).toThrow(
      'Unsupported plist value type'
    );
  });
});

describe('Plist.fromText().toObject()', () => {
  describe('null', () => {
    it('parses a <null> node into null', () => {
      expect(parseFixture('<null/>')).toBeNull();
    });
  });

  describe('boolean', () => {
    it('parses true and false nodes', () => {
      expect(parseFixture('<true/>')).toBe(true);
      expect(parseFixture('<false/>')).toBe(false);
    });
  });

  describe('integer', () => {
    it('throws when parsing an empty integer', () => {
      expect(() => parseFixture('<integer/>')).toThrow(
        'Cannot parse "" as integer.'
      );
    });

    it('parses an integer node into a number by default', () => {
      expect(parseFixture('<integer>14</integer>')).toBe(14);
    });

    it('parses an integer node into a bigint when requested', () => {
      const parsed = Plist.fromText(plistFixture('<integer>14</integer>'), {
        bigIntegers: true,
      }).toObject();

      expect(parsed).toBe(14n);
    });
  });

  describe('real', () => {
    it('throws when parsing an empty real', () => {
      expect(() => parseFixture('<real/>')).toThrow('Cannot parse "" as real.');
    });

    it('parses a real node into a number', () => {
      expect(parseFixture('<real>3.14</real>')).toBe(3.14);
    });
  });

  describe('string', () => {
    it('parses empty and populated strings', () => {
      expect(parseFixture('<string/>')).toBe('');
      expect(parseFixture('<string></string>')).toBe('');
      expect(parseFixture('<string>test</string>')).toBe('test');
    });

    it('parses a string with comments and CDATA content', () => {
      expect(parseFixture('<string>a<!-- comment --> string</string>')).toBe(
        'a string'
      );
      expect(parseFixture('<string><![CDATA[a < b]]></string>')).toBe('a < b');
    });
  });

  describe('data', () => {
    it('parses empty data into an empty Uint8Array', () => {
      const parsed = parseFixture('<data/>');

      expect(parsed).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(parsed as Uint8Array)).toBe('');
    });

    it('parses base64 data into a Uint8Array', () => {
      const parsed = parseFixture('<data>4pyTIMOgIGxhIG1vZGU=</data>');

      expect(parsed).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(parsed as Uint8Array)).toBe(
        '✓ à la mode'
      );
    });

    it('strips whitespace while parsing data nodes', () => {
      const parsed = parseFixture(`<data>4pyTIMOgIGxhIG


1v

ZG
U=</data>`);

      expect(parsed).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(parsed as Uint8Array)).toBe(
        '✓ à la mode'
      );
    });
  });

  describe('date', () => {
    it('throws when parsing an empty date', () => {
      expect(() => parseFixture('<date/>')).toThrow('Cannot parse "" as Date.');
    });

    it('parses a date node into a Date', () => {
      const parsed = parseFixture('<date>2010-02-08T21:41:23Z</date>');

      expect(parsed).toBeInstanceOf(Date);
      expect((parsed as Date).getTime()).toBe(1265665283000);
    });
  });

  describe('array', () => {
    it('parses arrays', () => {
      expect(parseFixture('<array/>')).toEqual([]);
      expect(parseFixture('<array><true/></array>')).toEqual([true]);
      expect(
        parseFixture('<array><string>1</string><string>2</string></array>')
      ).toEqual(['1', '2']);
      expect(parseFixture('<array><string/><false/></array>')).toEqual([
        '',
        false,
      ]);
    });
  });

  describe('dict', () => {
    it('validates dict key/value ordering', () => {
      expect(() => parseFixture('<dict><string>x</string></dict>')).toThrow(
        'Missing key'
      );
      expect(() =>
        parseFixture('<dict><key>a</key><key>b</key></dict>')
      ).toThrow('Unexpected key "b"');
    });

    it('parses missing, empty, multiple, and nested values', () => {
      expect(parseFixture('<dict><key>a</key></dict>')).toEqual({ a: '' });
      expect(parseFixture('<dict><key/><string>1</string></dict>')).toEqual({
        '': '1',
      });
      expect(parseFixture('<dict><key>a</key><string/></dict>')).toEqual({
        a: '',
      });
      expect(
        parseFixture('<dict><key>a</key><true/><key>b</key><false/></dict>')
      ).toEqual({ a: true, b: false });
      expect(
        parseFixture(
          '<dict><key>a</key><dict><key>a1</key><true/></dict></dict>'
        )
      ).toEqual({ a: { a1: true } });
    });

    it('throws if a key value is __proto__', () => {
      expect(() =>
        parseFixture(
          '<dict><key>__proto__</key><dict><key>length</key><string>polluted</string></dict></dict>'
        )
      ).toThrow('__proto__ keys can lead to prototype pollution');
    });
  });

  describe('integration', () => {
    it('parses a plist file with XML comments', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>CFBundleName</key>
    <string>Emacs</string>

    <key>CFBundlePackageType</key>
    <string>APPL</string>

    <!-- This should be the emacs version number. -->

    <key>CFBundleShortVersionString</key>
    <string>24.3</string>

    <key>CFBundleSignature</key>
    <string>EMAx</string>

    <!-- This SHOULD be a build number. -->

    <key>CFBundleVersion</key>
    <string>9.0</string>
  </dict>
</plist>
`;

      expect(Plist.fromText(xml).toObject()).toEqual({
        CFBundleName: 'Emacs',
        CFBundlePackageType: 'APPL',
        CFBundleShortVersionString: '24.3',
        CFBundleSignature: 'EMAx',
        CFBundleVersion: '9.0',
      });
    });

    it('parses a plist file with CDATA content', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>OptionsLabel</key>
  <string>Product</string>
  <key>PopupMenu</key>
  <array>
    <dict>
      <key>Key</key>
      <string>iPhone</string>
      <key>Title</key>
      <string>iPhone</string>
    </dict>
    <dict>
      <key>Key</key>
      <string>iPad</string>
      <key>Title</key>
      <string>iPad</string>
    </dict>
    <dict>
      <key>Key</key>
      <string>
        <![CDATA[
        #import &lt;Cocoa/Cocoa.h&gt;

#import &lt;MacRuby/MacRuby.h&gt;

int main(int argc, char *argv[])
{
  return macruby_main("rb_main.rb", argc, argv);
}
]]>
</string>
    </dict>
  </array>
  <key>TemplateSelection</key>
  <dict>
    <key>iPhone</key>
    <string>Tab Bar iPhone Application</string>
    <key>iPad</key>
    <string>Tab Bar iPad Application</string>
  </dict>
</dict>
</plist>
`;

      expect(Plist.fromText(xml).toObject()).toEqual({
        OptionsLabel: 'Product',
        PopupMenu: [
          { Key: 'iPhone', Title: 'iPhone' },
          { Key: 'iPad', Title: 'iPad' },
          {
            Key: '\n        \n        #import &lt;Cocoa/Cocoa.h&gt;\n\n#import &lt;MacRuby/MacRuby.h&gt;\n\nint main(int argc, char *argv[])\n{\n  return macruby_main("rb_main.rb", argc, argv);\n}\n\n',
          },
        ],
        TemplateSelection: {
          iPhone: 'Tab Bar iPhone Application',
          iPad: 'Tab Bar iPad Application',
        },
      });
    });

    it('parses an example Cordova plist file', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>UIWebViewBounce</key>
  <true/>
  <key>TopActivityIndicator</key>
  <string>gray</string>
  <key>EnableLocation</key>
  <false/>
  <key>ExternalHosts</key>
  <array>
      <string>*</string>
  </array>
  <key>Plugins</key>
  <dict>
    <key>Device</key>
    <string>CDVDevice</string>
    <key>Debug Console</key>
    <string>CDVDebugConsole</string>
  </dict>
</dict>
</plist>
`;

      expect(Plist.fromText(xml).toObject()).toEqual({
        UIWebViewBounce: true,
        TopActivityIndicator: 'gray',
        EnableLocation: false,
        ExternalHosts: ['*'],
        Plugins: {
          'Device': 'CDVDevice',
          'Debug Console': 'CDVDebugConsole',
        },
      });
    });

    it('parses an example Xcode info plist file', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>\${PRODUCT_NAME}</string>
  <key>CFBundleIconFiles</key>
  <array/>
  <key>LSRequiresIPhoneOS</key>
  <true/>
  <key>UISupportedInterfaceOrientations</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
  </array>
</dict>
</plist>
`;

      expect(Plist.fromText(xml).toObject()).toEqual({
        CFBundleDevelopmentRegion: 'en',
        CFBundleDisplayName: '${PRODUCT_NAME}',
        CFBundleIconFiles: [],
        LSRequiresIPhoneOS: true,
        UISupportedInterfaceOrientations: [
          'UIInterfaceOrientationPortrait',
          'UIInterfaceOrientationLandscapeLeft',
        ],
      });
    });
  });

  describe('invalid formats', () => {
    it('throws for invalid plist tags and empty documents', () => {
      expect(() =>
        Plist.fromText(
          plistFixture(
            '<dict><key>test</key><strong>Testing</strong><key>bar</key><string/></dict>'
          )
        )
      ).toThrow('Invalid PLIST tag strong');

      expect(() => Plist.fromText('')).toThrow(
        'First element should be <plist>'
      );
    });
  });
});

describe('Plist object behavior', () => {
  it('round trips representative nested data', () => {
    const source = {
      name: 'plist.ts',
      count: 42n,
      enabled: true,
      empty: null,
      data: new Uint8Array([1, 2, 3]),
      items: ['a', 2n],
    };

    const object = Plist.fromText(Plist.fromObject(source).toText(), {
      bigIntegers: true,
    }).toObject();

    expect(object).toEqual(source);
  });

  it('defensively copies input and output values', () => {
    const originalDate = new Date('2020-01-01T00:00:00Z');
    const originalData = new Uint8Array([1, 2, 3]);
    const original = {
      nested: { value: 'before' },
      date: originalDate,
      data: originalData,
    };

    const plist = Plist.fromObject(original);

    original.nested.value = 'after';
    originalDate.setUTCFullYear(1999);
    originalData[0] = 9;

    const firstRead = plist.toObject() as PlistDict;
    const nested = firstRead.nested as PlistDict;
    const date = firstRead.date as Date;
    const data = firstRead.data as Uint8Array;

    nested.value = 'mutated';
    date.setUTCFullYear(1998);
    data[0] = 8;

    const secondRead = plist.toObject() as PlistDict;

    expect((secondRead.nested as PlistDict).value).toBe('before');
    expect((secondRead.date as Date).toISOString()).toBe(
      '2020-01-01T00:00:00.000Z'
    );
    expect(Array.from(secondRead.data as Uint8Array)).toEqual([1, 2, 3]);
  });
});
