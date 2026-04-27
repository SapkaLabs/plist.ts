import { build, parse } from '@sapkalabs/plist.ts';

describe('@sapkalabs/plist.ts public API', () => {
  describe('parse()', () => {
    it('is exported as a function', () => {
      expect(typeof parse).toBe('function');
    });

    it('throws "not yet implemented" for any input', () => {
      expect(() => parse('<plist/>')).toThrow('parse() is not yet implemented');
    });
  });

  describe('build()', () => {
    it('is exported as a function', () => {
      expect(typeof build).toBe('function');
    });

    it('throws "not yet implemented" for any input', () => {
      expect(() => build('hello')).toThrow('build() is not yet implemented');
    });
  });
});
