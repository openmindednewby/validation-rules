import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { fieldKindValidators, validatePassword, ValidationCodes, type FieldKind } from '../src/index.ts';

type VectorValue = string | number | { prefix?: string; repeat: string; times: number };
interface KindSpec {
  vectors: { valid: VectorValue[]; invalid: Array<{ value: VectorValue; codes: string[] }> };
}

const manifest = JSON.parse(readFileSync(new URL('./vectors.json', import.meta.url), 'utf8')) as {
  kinds: Record<string, KindSpec>;
};

const expand = (value: VectorValue): string | number =>
  typeof value === 'object' ? (value.prefix ?? '') + value.repeat.repeat(value.times) : value;

for (const [kind, spec] of Object.entries(manifest.kinds)) {
  const validate = fieldKindValidators[kind as FieldKind] as (value: never) => string[];
  test(`${kind} has a generated validator`, () => assert.equal(typeof validate, 'function'));
  spec.vectors.valid.forEach((vector, index) =>
    test(`${kind} valid vector ${index} returns no codes`, () => assert.deepEqual(validate(expand(vector) as never), [])),
  );
  spec.vectors.invalid.forEach((vector, index) =>
    test(`${kind} invalid vector ${index} returns the manifest codes`, () =>
      assert.deepEqual(validate(expand(vector.value) as never), vector.codes)),
  );
}

test('validatePassword with abcdefg1! returns PASSWORD_NEEDS_UPPER', () =>
  assert.deepEqual(validatePassword('abcdefg1!'), [ValidationCodes.PasswordNeedsUpper]));
