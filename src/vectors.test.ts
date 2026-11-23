import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fieldKindValidators, validatePassword, ValidationCodes, type FieldKind } from './index';

type VectorValue = string | number | { prefix?: string; repeat: string; times: number };
interface KindSpec {
  vectors: { valid: VectorValue[]; invalid: Array<{ value: VectorValue; codes: string[] }> };
}

const manifest = JSON.parse(readFileSync(join(__dirname, '..', 'test', 'vectors.json'), 'utf8')) as {
  kinds: Record<string, KindSpec>;
};

const expand = (value: VectorValue): string | number =>
  typeof value === 'object' ? (value.prefix ?? '') + value.repeat.repeat(value.times) : value;

describe.each(Object.entries(manifest.kinds))('fieldKindValidators.%s', (kind, spec) => {
  const validate = fieldKindValidators[kind as FieldKind] as (value: never) => string[];

  it('with the manifest kind, is a generated function', () => {
    const actual = typeof validate;

    expect(actual).toBe('function');
  });

  it.each(spec.vectors.valid.map((vector, index) => [index, vector] as const))(
    'with valid vector %i, returns no codes',
    (_index, vector) => {
      const actual = validate(expand(vector) as never);

      expect(actual).toEqual([]);
    },
  );

  it.each(spec.vectors.invalid.map((vector, index) => [index, vector] as const))(
    'with invalid vector %i, returns the manifest codes',
    (_index, vector) => {
      const actual = validate(expand(vector.value) as never);

      expect(actual).toEqual(vector.codes);
    },
  );
});

describe('validatePassword', () => {
  it('with abcdefg1!, returns PASSWORD_NEEDS_UPPER', () => {
    const candidate = 'abcdefg1!';

    const actual = validatePassword(candidate);

    expect(actual).toEqual([ValidationCodes.PasswordNeedsUpper]);
  });
});
